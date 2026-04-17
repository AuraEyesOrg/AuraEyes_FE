/**
 * Audit Logs & Compliance Page
 * System Admin view for tracking system activities via real API
 * FR-43: Log system activities and financial transactions for auditing
 */

import { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Activity,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import AuditLogDetailModal from '../components/AuditLogDetailModal';
import { exportApi } from '../api';
import { useAuditLogs } from '../hooks/useAuditLogs';
import useDebounce from '@/hooks/use-debounce';
import type { AuditLogDto } from '../types/system-admin.types';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';

// ============ Action Badge Config ============
const actionConfig: Record<
  string,
  { labelKey: string; color: string; icon: typeof Plus }
> = {
  Insert: {
    labelKey: 'SystemAdmin.auditLogs.actions.insert',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Plus,
  },
  Update: {
    labelKey: 'SystemAdmin.auditLogs.actions.update',
    color:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Edit,
  },
  Delete: {
    labelKey: 'SystemAdmin.auditLogs.actions.delete',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: Trash2,
  },
};

// ============ Skeleton Row ============
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </td>
    </tr>
  );
}

// ============ Main Page ============
export default function AuditLogsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';

  const formatRelativeTime = (isoDate: string): string => {
    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('SystemAdmin.common.notAvailable', 'N/A');
    }

    const diff = Date.now() - parsedDate.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) {
      return t('SystemAdmin.auditLogs.time.justNow', 'Just now');
    }

    if (mins < 60) {
      return t('SystemAdmin.auditLogs.time.minutesAgo', '{{count}}m ago', {
        count: mins,
      });
    }

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
      return t('SystemAdmin.auditLogs.time.hoursAgo', '{{count}}h ago', {
        count: hrs,
      });
    }

    const days = Math.floor(hrs / 24);
    if (days < 7) {
      return t('SystemAdmin.auditLogs.time.daysAgo', '{{count}}d ago', {
        count: days,
      });
    }

    return parsedDate.toLocaleDateString(dateLocale);
  };

  const formatFullTimestamp = (isoDate: string): string => {
    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('SystemAdmin.common.notAvailable', 'N/A');
    }

    return parsedDate.toLocaleString(dateLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter & pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityNameFilterInput, setEntityNameFilterInput] = useState('');
  const debouncedEntityNameFilter = useDebounce(entityNameFilterInput, 500);

  // Debounced search — simple approach: send on current value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  // Fetch data from real API
  const { data, isLoading, isFetching, isError } = useAuditLogs({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    action: actionFilter || undefined,
    entityName: debouncedEntityNameFilter || undefined,
  });

  const logs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPageNumber(1);
  };

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPageNumber(1);
  };

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedEntityNameFilter]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const logsForExport = await exportApi.getAuditLogs({
        searchTerm: debouncedSearch || undefined,
        action: actionFilter || undefined,
        entityName: debouncedEntityNameFilter || undefined,
      });

      if (logsForExport.length === 0) {
        toast.info(
          t(
            'SystemAdmin.auditLogs.export.noData',
            'No audit logs available for export.'
          )
        );
        return;
      }

      await downloadXlsxFile(
        logsForExport,
        [
          {
            header: t(
              'SystemAdmin.auditLogs.export.columns.timestamp',
              'Timestamp'
            ),
            value: (row: AuditLogDto) => row.createdAt,
          },
          {
            header: t(
              'SystemAdmin.auditLogs.export.columns.userName',
              'User Name'
            ),
            value: (row: AuditLogDto) =>
              row.userName ??
              t('SystemAdmin.auditLogs.values.system', 'System'),
          },
          {
            header: t('SystemAdmin.auditLogs.export.columns.userId', 'User ID'),
            value: (row: AuditLogDto) => row.userId ?? '',
          },
          {
            header: t('SystemAdmin.auditLogs.export.columns.action', 'Action'),
            value: (row: AuditLogDto) => row.action,
          },
          {
            header: t(
              'SystemAdmin.auditLogs.export.columns.entityName',
              'Entity Name'
            ),
            value: (row: AuditLogDto) => row.entityName,
          },
          {
            header: t(
              'SystemAdmin.auditLogs.export.columns.entityId',
              'Entity ID'
            ),
            value: (row: AuditLogDto) => row.entityId ?? '',
          },
          {
            header: t(
              'SystemAdmin.auditLogs.export.columns.ipAddress',
              'IP Address'
            ),
            value: (row: AuditLogDto) => row.ipAddress ?? '',
          },
        ],
        buildTimestampedFileName('system-admin-audit-logs', 'xlsx'),
        t('SystemAdmin.auditLogs.export.sheetName', 'Audit Logs')
      );
      toast.success(
        t(
          'SystemAdmin.auditLogs.export.success',
          'Exported {{count}} audit logs.',
          {
            count: logsForExport.length,
          }
        )
      );
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.auditLogs.export.failed',
            'Failed to export audit logs. Please try again.'
          )
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t('SystemAdmin.auditLogs.title', 'Audit Logs & Compliance')}
          description={t(
            'SystemAdmin.auditLogs.description',
            'Track all system changes - Insert, Update, Delete operations'
          )}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting
                  ? t('SystemAdmin.auditLogs.actions.exporting', 'Exporting...')
                  : t(
                      'SystemAdmin.auditLogs.actions.exportExcel',
                      'Export Excel'
                    )}
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {totalCount.toLocaleString(dateLocale)}
                </span>
                <span className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.auditLogs.summary.totalEntries',
                    'total entries'
                  )}
                </span>
              </div>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* ========== Filters ========== */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 min-w-[280px] max-w-lg"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t(
                    'SystemAdmin.auditLogs.filters.searchPlaceholder',
                    'Search by entity name, action, or entity ID... (Enter to search)'
                  )}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </form>

              {/* Action Filter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('SystemAdmin.auditLogs.filters.actionLabel', 'Action:')}
                </span>
                <select
                  value={actionFilter}
                  onChange={(e) =>
                    handleFilterChange(setActionFilter, e.target.value)
                  }
                  className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-0 pl-1 pr-6"
                >
                  <option value="">
                    {t(
                      'SystemAdmin.auditLogs.filters.actionOptions.all',
                      'All'
                    )}
                  </option>
                  <option value="Insert">
                    {t(
                      'SystemAdmin.auditLogs.filters.actionOptions.insert',
                      'Insert'
                    )}
                  </option>
                  <option value="Update">
                    {t(
                      'SystemAdmin.auditLogs.filters.actionOptions.update',
                      'Update'
                    )}
                  </option>
                  <option value="Delete">
                    {t(
                      'SystemAdmin.auditLogs.filters.actionOptions.delete',
                      'Delete'
                    )}
                  </option>
                </select>
              </div>

              {/* Entity Name Filter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('SystemAdmin.auditLogs.filters.entityLabel', 'Entity:')}
                </span>
                <input
                  type="text"
                  value={entityNameFilterInput}
                  onChange={(e) => setEntityNameFilterInput(e.target.value)}
                  placeholder={t(
                    'SystemAdmin.auditLogs.filters.entityPlaceholder',
                    'e.g. WalletTransaction'
                  )}
                  className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 w-40 py-0 pl-1 placeholder:text-slate-400"
                />
              </div>

              {/* Loading indicator for refetch */}
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {t('SystemAdmin.auditLogs.filters.updating', 'Updating...')}
                </div>
              )}
            </div>

            {/* ========== Table ========== */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        {t(
                          'SystemAdmin.auditLogs.table.columns.timestamp',
                          'Timestamp'
                        )}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {t('SystemAdmin.auditLogs.table.columns.user', 'User')}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {t(
                          'SystemAdmin.auditLogs.table.columns.action',
                          'Action'
                        )}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {t(
                          'SystemAdmin.auditLogs.table.columns.entity',
                          'Entity'
                        )}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {t(
                          'SystemAdmin.auditLogs.table.columns.ipAddress',
                          'IP Address'
                        )}
                      </th>
                      <th className="px-6 py-4 font-semibold w-20">
                        {t(
                          'SystemAdmin.auditLogs.table.columns.details',
                          'Details'
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))
                    ) : isError ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center text-slate-500"
                        >
                          <p className="text-base font-medium">
                            {t(
                              'SystemAdmin.auditLogs.states.loadFailedTitle',
                              'Failed to load audit logs'
                            )}
                          </p>
                          <p className="text-sm mt-1">
                            {t(
                              'SystemAdmin.auditLogs.states.loadFailedDescription',
                              'Please check your connection and try again.'
                            )}
                          </p>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center text-slate-500"
                        >
                          {t(
                            'SystemAdmin.auditLogs.states.empty',
                            'No audit logs found'
                          )}
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => {
                        const config = actionConfig[log.action] ?? {
                          labelKey: '',
                          color:
                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
                          icon: Activity,
                        };
                        const ActionIcon = config.icon;
                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            {/* Timestamp */}
                            <td className="px-6 py-4">
                              <span
                                className="text-sm text-slate-900 dark:text-white cursor-help"
                                title={formatFullTimestamp(log.createdAt)}
                              >
                                {formatRelativeTime(log.createdAt)}
                              </span>
                            </td>

                            {/* User */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {log.userName ??
                                    t(
                                      'SystemAdmin.auditLogs.values.system',
                                      'System'
                                    )}
                                </span>
                                {log.userId && (
                                  <span className="text-xs text-slate-500 font-mono truncate max-w-[140px]">
                                    {log.userId}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action Badge */}
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}
                              >
                                <ActionIcon className="w-3 h-3" />
                                {config.labelKey
                                  ? t(config.labelKey, log.action)
                                  : log.action}
                              </span>
                            </td>

                            {/* Entity */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {log.entityName}
                                </span>
                                {log.entityId && (
                                  <span className="text-xs text-slate-500 font-mono truncate max-w-[160px]">
                                    {log.entityId}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* IP Address */}
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-slate-500">
                                {log.ipAddress ?? '—'}
                              </span>
                            </td>

                            {/* View Details */}
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-primary"
                                title={t(
                                  'SystemAdmin.auditLogs.actions.viewJsonDetails',
                                  'View JSON details'
                                )}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========== Pagination ========== */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>
                  {t(
                    'SystemAdmin.auditLogs.pagination.summary',
                    'Page {{page}} of {{totalPages}} · {{totalCount}} total entries',
                    {
                      page: pageNumber,
                      totalPages,
                      totalCount: totalCount.toLocaleString(dateLocale),
                    }
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('SystemAdmin.auditLogs.pagination.previous', 'Previous')}
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (pageNumber <= 3) {
                      page = i + 1;
                    } else if (pageNumber >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = pageNumber - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium ${
                          page === pageNumber
                            ? 'bg-primary text-slate-900 border-primary'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setPageNumber((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={pageNumber >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('SystemAdmin.auditLogs.pagination.next', 'Next')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========== Detail Modal ========== */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
