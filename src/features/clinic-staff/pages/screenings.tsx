import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  XCircle,
  ScanEye,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { resolvePathWithLocale } from '@/i18n/middleware';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { useTranslation } from 'react-i18next';
import {
  clinicScreeningApi,
  type ClinicScreeningHistoryItem,
} from '../api/screening.api';
import { formatShortDate } from '@/lib/date-utils';

function normalize(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function getRiskBadge(riskLevel?: string) {
  const r = normalize(riskLevel);
  if (r === 'high')
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (r === 'moderate' || r === 'medium')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
}

function StatusBadge({
  item,
  t,
}: {
  item: ClinicScreeningHistoryItem;
  t: (key: string, defaultValue?: string) => string;
}) {
  if (item.status === 'completed' || item.status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" />
        {item.status === 'saved'
          ? t('ClinicStaff.screenings.status.saved', 'Saved')
          : t('ClinicStaff.screenings.status.completed', 'Completed')}
      </span>
    );
  }
  if (item.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <Clock className="w-3 h-3 animate-pulse" />
        {t('ClinicStaff.screenings.status.pending', 'Pending')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      <AlertTriangle className="w-3 h-3" />
      {t('ClinicStaff.screenings.status.unknown', 'Unknown')}
    </span>
  );
}

export default function ClinicStaffScreeningsPage() {
  const navigate = useNavigate();
  const { t: i18nT } = useTranslation();
  const t = (key: string, defaultValue?: string) =>
    i18nT(key as never, { defaultValue } as never) as unknown as string;

  const [searchTerm, setSearchTerm] = useState('');

  const screeningsQuery = useQuery({
    queryKey: ['clinic-staff', 'screenings', 'history'],
    queryFn: () => clinicScreeningApi.getHistory(100),
    staleTime: 30_000,
  });

  const screenings = screeningsQuery.data ?? [];

  const filteredScreenings = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return screenings;
    return screenings.filter(
      (s) =>
        normalize(s.patientName).includes(q) ||
        normalize(s.aiPrimaryLabel).includes(q) ||
        normalize(s.latestRiskLevel).includes(q)
    );
  }, [screenings, searchTerm]);

  if (screeningsQuery.isError) {
    toast.error(
      t(
        'ClinicStaff.screenings.toast.loadFailed',
        'Unable to load screenings.'
      ),
      { toastId: 'screenings-load-failed' }
    );
  }

  const handleViewResult = (screeningId: string) => {
    navigate(
      resolvePathWithLocale(`/clinic-staff/screenings/result?id=${screeningId}`)
    );
  };

  const handleNewScreening = () => {
    navigate(resolvePathWithLocale('/clinic-staff/patients'));
  };

  const completedCount = screenings.filter(
    (s) => s.status === 'completed' || s.status === 'saved'
  ).length;
  const pendingCount = screenings.filter((s) => s.status === 'pending').length;

  if (screeningsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <ClinicStaffLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              {t('ClinicStaff.screenings.page.title', 'Screenings')}
            </h1>
            <p className="text-(--text-secondary) text-sm">
              {t(
                'ClinicStaff.screenings.page.subtitle',
                'Manage and review retinal screening sessions'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewScreening}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25 shrink-0"
          >
            <ScanEye className="w-4 h-4" />
            {t('ClinicStaff.screenings.actions.newScreening', 'New Screening')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {screenings.length}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t('ClinicStaff.screenings.stats.total', 'Total')}
                </p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {completedCount}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t('ClinicStaff.screenings.stats.completed', 'Completed')}
                </p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {pendingCount}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t('ClinicStaff.screenings.stats.pending', 'Pending')}
                </p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {
                    screenings.filter((s) => {
                      const d = new Date(s.createdAt);
                      const now = new Date();
                      return d.toDateString() === now.toDateString();
                    }).length
                  }
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t('ClinicStaff.screenings.stats.today', 'Today')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-tertiary)"
              />
              <input
                type="text"
                placeholder={t(
                  'ClinicStaff.screenings.search.placeholder',
                  'Search by patient name, AI prediction, risk level...'
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-xl pl-11 pr-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              disabled={searchTerm.trim() === ''}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-(--border-primary) bg-(--bg-primary) text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <XCircle size={16} />
              {t('ClinicStaff.screenings.actions.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-(--text-tertiary) mb-3 px-1">
          {t(
            'ClinicStaff.screenings.labels.countFound',
            '{{count}} screening(s) found',
            { count: filteredScreenings.length }
          )}
        </p>

        {/* Screenings Table */}
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--border-primary)">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.screenings.table.patient', 'Patient')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.screenings.table.date', 'Date')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t(
                      'ClinicStaff.screenings.table.aiPrediction',
                      'AI Prediction'
                    )}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.screenings.table.risk', 'Risk')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.screenings.table.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.screenings.table.action', 'Action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {filteredScreenings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-(--text-tertiary)"
                    >
                      {t(
                        'ClinicStaff.screenings.states.noMatch',
                        'No screenings found.'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredScreenings.map((item) => (
                    <tr
                      key={item.screeningId}
                      className="hover:bg-(--bg-tertiary) transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-(--text-primary)">
                          {item.patientName}
                        </div>
                        <div className="text-xs text-(--text-tertiary)">
                          {t(
                            'ClinicStaff.screenings.labels.imagesCount',
                            '{{count}} image(s)',
                            { count: item.imagesCount }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-(--text-secondary)">
                          {formatShortDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-(--text-secondary)">
                          {item.aiPrimaryLabel ?? '—'}
                        </div>
                        {item.confidenceScore != null && (
                          <div className="text-xs text-(--text-tertiary)">
                            {t(
                              'ClinicStaff.screenings.labels.confidence',
                              '{{score}}% confidence',
                              { score: item.confidenceScore }
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.latestRiskLevel ? (
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskBadge(item.latestRiskLevel)}`}
                          >
                            {item.latestRiskLevel}
                          </span>
                        ) : (
                          <span className="text-sm text-(--text-tertiary)">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge item={item} t={t} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewResult(item.screeningId)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t(
                            'ClinicStaff.screenings.actions.viewResult',
                            'View Result'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClinicStaffLayout>
  );
}
