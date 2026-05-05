/**
 * Patient Management Page
 * System Admin view for managing patients
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
  Eye,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { exportApi } from '../api';
import {
  patientApi,
  type PatientListItem,
  type PatientMetricsDto,
} from '../api/patient.api';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Patient extends PatientListItem {
  name: string;
  status: 'active' | 'inactive' | 'locked';
  lastScreening?: string;
  emailVerified: boolean;
}

const formatDate = (
  value: string | undefined,
  locale: string,
  fallback: string
) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString(locale);
};

/** Map API item to UI Patient model */
const mapToUiPatient = (item: PatientListItem): Patient => ({
  ...item,
  name: item.fullName,
  status: item.isWalkIn ? 'active' : item.isActive ? 'active' : 'locked',
  lastScreening: item.lastLoginAt ?? undefined,
  emailVerified: item.emailConfirmed,
});

export default function PatientsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [metrics, setMetrics] = useState<PatientMetricsDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [lockTarget, setLockTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [isLockingPatient, setIsLockingPatient] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const apiStatus = statusFilter === 'all' ? undefined : statusFilter;
      const [result, metricsResult] = await Promise.all([
        patientApi.getPatients(
          pageNumber,
          10,
          searchQuery || undefined,
          apiStatus
        ),
        patientApi.getMetrics(),
      ]);
      setPatients(result.items.map(mapToUiPatient));
      setTotalCount(result.totalCount);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
      setMetrics(metricsResult);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalPatients = metrics?.totalPatients ?? totalCount;
  const registeredPatients = metrics?.registeredPatients ?? 0;
  const walkInPatients = metrics?.walkInPatients ?? 0;
  const lockedPatients = metrics?.lockedRegisteredPatients ?? 0;

  // Use server-side filtering; client-side list is already filtered
  const filteredPatients = patients;

  // Handle lock/unlock patient
  const handleToggleLock = async (
    userId: string | null,
    currentStatus: string
  ) => {
    if (!userId) {
      toast.info(
        t(
          'SystemAdmin.patients.toasts.walkInNoLogin',
          'Walk-in patients do not have login accounts to lock/unlock.'
        )
      );
      return;
    }

    try {
      const action = currentStatus === 'locked' ? 'activate' : 'lock';

      if (action === 'lock') {
        const targetPatient = patients.find(
          (patient) => patient.userId === userId
        );
        setLockTarget({
          userId,
          name:
            targetPatient?.name ??
            t('SystemAdmin.patients.table.values.thisPatient', 'this patient'),
        });
        return;
      }

      await patientApi.updatePatientStatus(userId, action);
      toast.success(
        t(
          'SystemAdmin.patients.toasts.activatedSuccess',
          'Patient has been activated successfully.'
        )
      );
      loadData();
    } catch (error) {
      console.error('Failed to toggle patient lock status:', error);
      toast.error(
        t(
          'SystemAdmin.patients.toasts.updateStatusError',
          'Failed to update patient status. Please try again.'
        )
      );
    }
  };

  const confirmLockPatient = async () => {
    if (!lockTarget) {
      return;
    }

    try {
      setIsLockingPatient(true);
      await patientApi.updatePatientStatus(lockTarget.userId, 'lock');
      toast.success(
        t(
          'SystemAdmin.patients.toasts.lockedSuccess',
          'Patient has been locked successfully.'
        )
      );
      await loadData();
    } catch (error) {
      console.error('Failed to lock patient:', error);
      toast.error(
        t(
          'SystemAdmin.patients.toasts.updateStatusError',
          'Failed to update patient status. Please try again.'
        )
      );
    } finally {
      setIsLockingPatient(false);
      setLockTarget(null);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const patientsForExport = await exportApi.getPatients({
        searchTerm: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (patientsForExport.length === 0) {
        toast.info(
          t(
            'SystemAdmin.patients.toasts.exportNoData',
            'No patients available for export.'
          )
        );
        return;
      }

      await downloadXlsxFile(
        patientsForExport,
        [
          {
            header: t(
              'SystemAdmin.patients.export.columns.fullName',
              'Full Name'
            ),
            value: (row) => row.fullName,
          },
          {
            header: t('SystemAdmin.patients.export.columns.email', 'Email'),
            value: (row) => row.email ?? '',
          },
          {
            header: t('SystemAdmin.patients.export.columns.phone', 'Phone'),
            value: (row) => row.phone ?? '',
          },
          {
            header: t(
              'SystemAdmin.patients.table.columns.patientType',
              'Patient Type'
            ),
            value: (row) =>
              row.isWalkIn
                ? t('SystemAdmin.patients.table.values.walkIn', 'Walk-in')
                : t(
                    'SystemAdmin.patients.table.values.registered',
                    'Registered'
                  ),
          },
          {
            header: t(
              'SystemAdmin.patients.table.columns.linkedOrganisation',
              'Linked Organisation'
            ),
            value: (row) => row.linkedOrganisationName ?? '',
          },
          {
            header: t('SystemAdmin.patients.table.columns.status', 'Status'),
            value: (row) =>
              row.isWalkIn
                ? t('SystemAdmin.patients.table.values.walkIn', 'Walk-in')
                : row.isActive
                  ? t('SystemAdmin.patients.status.active', 'Active')
                  : t('SystemAdmin.patients.status.locked', 'Locked'),
          },
          {
            header: t(
              'SystemAdmin.patients.export.columns.emailConfirmed',
              'Email Confirmed'
            ),
            value: (row) =>
              row.emailConfirmed
                ? t('SystemAdmin.patients.export.yes', 'Yes')
                : t('SystemAdmin.patients.export.no', 'No'),
          },
          {
            header: t(
              'SystemAdmin.patients.export.columns.createdAt',
              'Created At'
            ),
            value: (row) => row.createdAt,
          },
          {
            header: t(
              'SystemAdmin.patients.table.columns.lastLogin',
              'Last Login'
            ),
            value: (row) => row.lastLoginAt ?? '',
          },
        ],
        buildTimestampedFileName('system-admin-patients', 'xlsx'),
        t('SystemAdmin.patients.export.sheetName', 'Patients')
      );
      toast.success(
        t(
          'SystemAdmin.patients.toasts.exportSuccess',
          'Exported {{count}} patients.',
          {
            count: patientsForExport.length,
          }
        )
      );
    } catch (error) {
      console.error('Failed to export patients:', error);
      toast.error(
        t(
          'SystemAdmin.patients.toasts.exportError',
          'Failed to export patients. Please try again.'
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const patientColumns: TableColumn<Patient>[] = [
    {
      header: t('SystemAdmin.patients.table.columns.patient', 'Patient'),
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            {row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {row.name}
            </span>
            <span className="text-xs text-slate-500">
              {row.email ??
                t(
                  'SystemAdmin.patients.table.values.walkInProfile',
                  'Walk-in profile'
                )}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t(
        'SystemAdmin.patients.table.columns.patientType',
        'Patient Type'
      ),
      accessor: 'patientType',
      render: (_, row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isWalkIn
              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}
        >
          {row.isWalkIn
            ? t('SystemAdmin.patients.table.values.walkIn', 'Walk-in')
            : t('SystemAdmin.patients.table.values.registered', 'Registered')}
        </span>
      ),
    },
    {
      header: t(
        'SystemAdmin.patients.table.columns.linkedOrganisation',
        'Linked Organisation'
      ),
      accessor: 'linkedOrganisationName',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {(value as string) ||
            t('SystemAdmin.patients.table.values.unassigned', 'Unassigned')}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.patients.table.columns.lastLogin', 'Last Login'),
      accessor: 'lastScreening',
      render: (value) =>
        formatDate(value as string | undefined, dateLocale, notAvailableLabel),
    },
    {
      header: t('SystemAdmin.patients.table.columns.joined', 'Joined'),
      accessor: 'createdAt',
      render: (value) =>
        formatDate(String(value ?? ''), dateLocale, notAvailableLabel),
    },
    {
      header: t('SystemAdmin.patients.table.columns.status', 'Status'),
      accessor: 'status',
      render: (value, row) => {
        if (row.isWalkIn) {
          return (
            <StatusBadge
              status="success"
              label={t('SystemAdmin.patients.status.active', 'Active')}
            />
          );
        }

        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          inactive: 'warning',
          locked: 'error',
        };

        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={t(
              `SystemAdmin.patients.status.${value as string}`,
              value as string
            )}
          />
        );
      },
    },
    {
      header: t('SystemAdmin.patients.table.columns.actions', 'Actions'),
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailPatient(row)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title={t(
              'SystemAdmin.patients.actions.viewDetails',
              'View Details'
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleLock(row.userId, row.status)}
            disabled={!row.userId || row.isWalkIn}
            className="text-slate-500 hover:text-primary transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              row.isWalkIn
                ? t(
                    'SystemAdmin.patients.actions.walkInCannotBeLocked',
                    'Walk-in patients cannot be locked'
                  )
                : row.status === 'locked'
                  ? t(
                      'SystemAdmin.patients.actions.unlockPatient',
                      'Unlock Patient'
                    )
                  : t(
                      'SystemAdmin.patients.actions.lockPatient',
                      'Lock Patient'
                    )
            }
          >
            {row.status === 'locked' ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t('SystemAdmin.patients.title', 'Patient Management')}
          description={t(
            'SystemAdmin.patients.description',
            'Manage patient accounts, view screening history, and monitor patient activity'
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
                  ? t('SystemAdmin.patients.actions.exporting', 'Exporting...')
                  : t('SystemAdmin.actions.export', 'Export')}
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title={t(
                  'SystemAdmin.patients.stats.totalPatients',
                  'Total Patients'
                )}
                value={totalPatients}
                icon={Users}
                description={t(
                  'SystemAdmin.patients.stats.totalPatientsDescription',
                  'Registered and walk-in patients'
                )}
                variant="primary"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.patients.stats.registeredPatients',
                  'Registered Patients'
                )}
                value={registeredPatients}
                icon={UserCheck}
                description={t(
                  'SystemAdmin.patients.stats.registeredPatientsDescription',
                  'Patients with login accounts'
                )}
                variant="success"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.patients.stats.walkInPatients',
                  'Walk-in Patients'
                )}
                value={walkInPatients}
                icon={Users}
                description={t(
                  'SystemAdmin.patients.stats.walkInPatientsDescription',
                  'Clinic-managed patient profiles'
                )}
                variant="primary"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.patients.stats.lockedAccounts',
                  'Locked Accounts'
                )}
                value={lockedPatients}
                icon={UserX}
                description={t(
                  'SystemAdmin.patients.stats.lockedAccountsDescription',
                  'Registered accounts requiring attention'
                )}
                variant="danger"
              />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'SystemAdmin.patients.filters.searchPlaceholder',
                    'Search by name or email...'
                  )}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">
                      {t(
                        'SystemAdmin.patients.filters.status.all',
                        'All Status'
                      )}
                    </option>
                    <option value="active">
                      {t('SystemAdmin.patients.status.active', 'Active')}
                    </option>
                    <option value="locked">
                      {t('SystemAdmin.patients.status.locked', 'Locked')}
                    </option>
                    <option value="registered">
                      {t(
                        'SystemAdmin.patients.filters.status.registered',
                        'Registered'
                      )}
                    </option>
                    <option value="walkin">
                      {t(
                        'SystemAdmin.patients.filters.status.walkIn',
                        'Walk-in'
                      )}
                    </option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <DataTable<Patient>
                columns={patientColumns}
                data={filteredPatients}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage={t(
                  'SystemAdmin.patients.states.empty',
                  'No patients found'
                )}
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                {t(
                  'SystemAdmin.patients.summary.showing',
                  'Showing {{shown}} of {{total}} patients',
                  {
                    shown: filteredPatients.length,
                    total: totalCount,
                  }
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!hasPrevious}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('SystemAdmin.common.pagination.previous', 'Previous page')}
                </button>
                <span className="px-2 font-medium">
                  {t('SystemAdmin.common.pagination.page', 'Page {{page}}', {
                    page: pageNumber,
                  })}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('SystemAdmin.common.pagination.next', 'Next page')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={!!lockTarget}
        title={t(
          'SystemAdmin.patients.confirmModal.lockTitle',
          'Lock patient account?'
        )}
        message={t(
          'SystemAdmin.patients.confirmModal.lockMessage',
          'Are you sure you want to lock {{name}}? They will not be able to access the system until re-activated.',
          {
            name:
              lockTarget?.name ??
              t(
                'SystemAdmin.patients.table.values.thisPatient',
                'this patient'
              ),
          }
        )}
        confirmLabel={t(
          'SystemAdmin.patients.confirmModal.confirmLock',
          'Lock account'
        )}
        cancelLabel={t(
          'SystemAdmin.patients.confirmModal.cancelLock',
          'Keep active'
        )}
        tone="danger"
        isLoading={isLockingPatient}
        onCancel={() => setLockTarget(null)}
        onConfirm={confirmLockPatient}
      />

      {detailPatient && (
        <PatientDetailModal
          patient={detailPatient}
          dateLocale={dateLocale}
          notAvailableLabel={notAvailableLabel}
          t={t}
          onClose={() => setDetailPatient(null)}
        />
      )}
    </div>
  );
}

type PatientDetailModalProps = {
  patient: Patient;
  dateLocale: string;
  notAvailableLabel: string;
  t: (key: string, fallback: string) => string;
  onClose: () => void;
};

function PatientDetailModal({
  patient,
  dateLocale,
  notAvailableLabel,
  t,
  onClose,
}: PatientDetailModalProps) {
  const roleLabel = patient.isWalkIn
    ? t('SystemAdmin.patients.table.values.walkIn', 'Walk-in')
    : t('SystemAdmin.patients.table.values.registered', 'Registered');

  const statusLabel = patient.isWalkIn
    ? t('SystemAdmin.patients.status.active', 'Active')
    : t(
        `SystemAdmin.patients.status.${patient.status}`,
        patient.status === 'locked' ? 'Locked' : 'Active'
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('SystemAdmin.patients.detail.title', 'Patient Details')}
            </h3>
            <p className="text-sm text-slate-500">{patient.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label={t('SystemAdmin.common.close', 'Close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <DetailRow
            label={t('SystemAdmin.patients.detail.fullName', 'Full name')}
            value={patient.name}
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.email', 'Email')}
            value={
              patient.email ||
              t(
                'SystemAdmin.patients.table.values.walkInProfile',
                'Walk-in profile'
              )
            }
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.phone', 'Phone')}
            value={patient.phone || notAvailableLabel}
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.patientType', 'Patient type')}
            value={roleLabel}
          />
          <DetailRow
            label={t(
              'SystemAdmin.patients.table.columns.linkedOrganisation',
              'Linked Organisation'
            )}
            value={
              patient.linkedOrganisationName ||
              t('SystemAdmin.patients.table.values.unassigned', 'Unassigned')
            }
          />
          <DetailRow
            label={t('SystemAdmin.patients.table.columns.status', 'Status')}
            value={statusLabel}
          />
          <DetailRow
            label={t(
              'SystemAdmin.patients.detail.emailVerified',
              'Email verified'
            )}
            value={
              patient.emailVerified
                ? t('SystemAdmin.patients.export.yes', 'Yes')
                : t('SystemAdmin.patients.export.no', 'No')
            }
          />
          <DetailRow
            label={t(
              'SystemAdmin.patients.detail.activeAccount',
              'Active account'
            )}
            value={
              patient.isActive
                ? t('SystemAdmin.patients.export.yes', 'Yes')
                : t('SystemAdmin.patients.export.no', 'No')
            }
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.createdAt', 'Created at')}
            value={formatDate(patient.createdAt, dateLocale, notAvailableLabel)}
          />
          <DetailRow
            label={t(
              'SystemAdmin.patients.table.columns.lastLogin',
              'Last Login'
            )}
            value={formatDate(
              patient.lastScreening,
              dateLocale,
              notAvailableLabel
            )}
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.patientId', 'Patient ID')}
            value={patient.id}
          />
          <DetailRow
            label={t('SystemAdmin.patients.detail.userId', 'User ID')}
            value={patient.userId || notAvailableLabel}
          />
        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t(
              'SystemAdmin.patients.detail.medicalHistorySummary',
              'Medical history summary'
            )}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {patient.medicalHistorySummary || notAvailableLabel}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {t(
              'SystemAdmin.patients.detail.noPasswordShown',
              'Security note: password information is not displayed.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-slate-900 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}
