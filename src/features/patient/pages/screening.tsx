import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  MoreVertical,
  Trash2,
  Download,
  Loader2,
  Share2,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import { formatShortDate, toIntlLocale } from '@/lib/date-utils';
import { screeningApi } from '../api/screening.api';
import { downloadReportPdf } from '../api/patient.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { localizeFindingsText } from '@/features/patient/lib/disease-translation';
import i18n from '@/i18n/i18n';
import { resolvePathWithLocale } from '@/i18n/middleware';

interface Scan {
  id: string;
  name: string;
  eye: 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes';
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  thumbnailUrl?: string;
  findings?: number;
  findingsText?: string;
}

export default function ScreeningPage() {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(
    null
  );

  const sessionsQuery = useQuery({
    queryKey: ['screening', 'recent', 'history'],
    queryFn: async () => {
      const response = await screeningApi.getRecentSessions(20);
      return response.data ?? [];
    },
  });

  const sessionDetailsQuery = useQuery({
    queryKey: [
      'screening',
      'recent',
      'details',
      (sessionsQuery.data ?? []).map((s) => s.screeningId).join(','),
    ],
    enabled: (sessionsQuery.data?.length ?? 0) > 0,
    queryFn: async () => {
      const sessions = sessionsQuery.data ?? [];
      const entries = await Promise.all(
        sessions.map(async (s) => {
          try {
            const detail = await screeningApi.getSessionById(s.screeningId);
            return [
              s.screeningId,
              detail.data?.latestResult?.findings,
            ] as const;
          } catch {
            return [s.screeningId, undefined] as const;
          }
        })
      );

      return Object.fromEntries(entries) as Record<string, string | undefined>;
    },
    staleTime: 60_000,
  });

  const scans: Scan[] = (sessionsQuery.data ?? []).map((session) => ({
    id: session.screeningId,
    name: `${t('PatientReview.sessionLabel', 'Session')} - ${formatShortDate(session.createdAt, 'medium', toIntlLocale(i18n.language))}`,
    eye: t('PatientScreening.labels.bothEyes', 'Both Eyes') as
      | 'Left Eye (OS)'
      | 'Right Eye (OD)'
      | 'Both Eyes',
    date: session.createdAt,
    status: session.processedAt ? 'completed' : 'processing',
    riskLevel:
      session.latestRiskLevel?.toLowerCase() === 'moderate'
        ? 'medium'
        : (session.latestRiskLevel?.toLowerCase() as
            | 'low'
            | 'medium'
            | 'high'
            | 'critical'
            | undefined),
    thumbnailUrl: session.thumbnailUrl,
    findings: undefined,
    findingsText: sessionDetailsQuery.data?.[session.screeningId]
      ? localizeFindingsText(
          sessionDetailsQuery.data[session.screeningId]!.replace(
            /\r?\n/g,
            ', '
          ),
          i18n.language
        )
      : undefined,
  }));

  const sortedScans = useMemo(
    () =>
      [...scans].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [scans]
  );

  const filteredScans = sortedScans.filter(
    (scan) =>
      (scan.name || '')
        .toLowerCase()
        .includes((searchQuery || '').toLowerCase()) ||
      (scan.eye || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleDownloadPdf = async (reportId: string) => {
    try {
      setDownloadingReportId(reportId);
      const blob = await downloadReportPdf(reportId);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `medical-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download medical report PDF:', error);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const getScanStatusBadge = (scan: Scan) => {
    switch (scan.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            {t('PatientScreening.status.completed', 'Completed')}
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Clock className="w-3 h-3 animate-pulse" />
            {t('PatientScreening.status.processing', 'Processing')}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <Clock className="w-3 h-3" />
            {t('PatientScreening.status.pending', 'Pending')}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            {t('PatientScreening.status.failed', 'Failed')}
          </span>
        );
    }
  };

  const getScanRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    const normalized = riskLevel.toLowerCase();
    const isHealthy = normalized === 'low';
    const isCritical = normalized === 'critical' || normalized === 'high';
    const style = isHealthy
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : isCritical
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    const label = isHealthy
      ? t('PatientScreening.badge.looksHealthy')
      : t('PatientScreening.badge.needsAttention');

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border ${style}`}
      >
        {label}
      </span>
    );
  };

  const completedScans = scans.filter((s) => s.status === 'completed').length;
  const processingScans = scans.filter((s) => s.status === 'processing').length;

  const PageHeader = () => (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('PatientScreening.page.title', 'My Scans')}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          {t(
            'PatientScreening.page.subtitle',
            'View and manage your retinal screening history'
          )}
        </p>
      </div>

      <Link
        to={resolvePathWithLocale('/patient/schedule')}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 shadow-sm"
      >
        <PlusCircle className="h-5 w-5" strokeWidth={2} />
        <span>{t('PatientAppointments.actions.bookNew')}</span>
      </Link>
    </div>
  );

  return (
    <PatientLayout>
      <div className="flex flex-col h-full">
        <PageHeader />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {sessionsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`stat-skeleton-${i}`} className="medical-card p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton-shimmer w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="skeleton-shimmer h-6 w-8 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="medical-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {scans.length}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('PatientScreening.stats.totalScans', 'Total Scans')}
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
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {completedScans}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('PatientScreening.stats.completed', 'Completed')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="medical-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {processingScans}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('PatientScreening.stats.processing', 'Processing')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="medical-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-(--text-primary)">
                      {scans.reduce((acc, s) => acc + (s.findings || 0), 0)}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {t('PatientScreening.stats.findings', 'Findings')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
            <input
              type="text"
              placeholder={t(
                'PatientScreening.search.placeholder',
                'Search scans...'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <Filter className="w-4 h-4" />
            {t('PatientScreening.actions.filter', 'Filter')}
          </button>
        </div>

        {/* Scans List */}
        <div className="medical-card flex-1 overflow-hidden">
          <div className="p-4 border-b border-(--border-color)">
            <h2 className="text-sm font-bold text-(--text-primary)">
              {sessionsQuery.isLoading ? (
                <span className="skeleton-shimmer inline-block h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              ) : (
                t('PatientScreening.list.recentScans', {
                  count: filteredScans.length,
                })
              )}
            </h2>
          </div>

          {sessionsQuery.isLoading ? (
            <div className="divide-y divide-[var(--border-color)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`scan-skeleton-${i}`}
                  className="flex items-center gap-4 p-4"
                >
                  {/* Thumbnail skeleton */}
                  <div className="skeleton-shimmer w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                  {/* Info skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="skeleton-shimmer h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="skeleton-shimmer h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  {/* Status badge skeleton */}
                  <div className="skeleton-shimmer h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  {/* Actions skeleton */}
                  <div className="skeleton-shimmer w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                  {/* Arrow skeleton */}
                  <div className="skeleton-shimmer w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('PatientScreening.empty.title', 'No scans yet')}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                {t(
                  'PatientScreening.empty.description',
                  'Start your first retinal screening to detect potential issues early'
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    navigate(
                      resolvePathWithLocale('/patient/screening/review'),
                      {
                        state: { screeningId: scan.id },
                      }
                    );
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] shrink-0">
                    {scan.thumbnailUrl ? (
                      <img
                        src={scan.thumbnailUrl}
                        alt={scan.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[var(--text-primary)] font-medium truncate">
                        {scan.name}
                      </p>
                      {getScanRiskBadge(scan.riskLevel)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {scan.eye}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatShortDate(
                          scan.date,
                          'medium',
                          toIntlLocale(i18n.language)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {getScanStatusBadge(scan)}

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === scan.id ? null : scan.id
                        );
                      }}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === scan.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg z-10 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              resolvePathWithLocale(
                                '/patient/screening/review'
                              ),
                              {
                                state: { screeningId: scan.id },
                              }
                            );
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <Eye className="w-4 h-4" />
                          {t(
                            'PatientScreening.actions.viewReview',
                            'View Review'
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDownloadPdf(scan.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          {downloadingReportId === scan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {t(
                            'PatientScreening.actions.downloadReport',
                            'Download Report'
                          )}
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <Share2 className="w-4 h-4" />
                          {t(
                            'PatientScreening.actions.shareWithDoctor',
                            'Share with Doctor'
                          )}
                        </button>
                        <hr className="my-1 border-[var(--border-color)]" />
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('PatientScreening.actions.delete', 'Delete')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
