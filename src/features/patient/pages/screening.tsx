import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  MoreVertical,
  Trash2,
  Download,
  Loader2,
  Share2,
  ChevronRight,
  X,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { formatShortDate } from '@/lib/date-utils';
import { screeningApi } from '../api/screening.api';
import { downloadReportPdf, getReport } from '../api/patient.api';
import type { ScreeningReport } from '../types';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface Scan {
  id: string;
  name: string;
  eye: 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes';
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  thumbnailUrl?: string;
  findings?: number;
}

export default function ScreeningPage() {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(
    null
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const diagnosisNotAvailable = t(
    'PatientScreening.diagnosis.notAvailable',
    'N/A'
  );

  const getDiagnosisRiskBadge = (risk: ScreeningReport['riskLevel']) => {
    switch (risk) {
      case 'low':
        return (
          <span className="badge-risk-low flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {t('PatientScreening.risk.low', 'Low risk')}
          </span>
        );
      case 'medium':
        return (
          <span className="badge-risk-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('PatientScreening.risk.medium', 'Medium risk')}
          </span>
        );
      case 'high':
        return (
          <span className="badge-risk-high flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t('PatientScreening.risk.high', 'High risk')}
          </span>
        );
      case 'critical':
        return (
          <span className="badge-risk-high flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t('PatientScreening.risk.critical', 'Critical risk')}
          </span>
        );
      default:
        return null;
    }
  };

  const getDiagnosisTypeLabel = (type: ScreeningReport['type']) => {
    switch (type) {
      case 'AI_SCREENING':
        return t(
          'PatientScreening.diagnosis.type.aiScreening',
          'Retinal Screening'
        );
      case 'OPHTHALMOLOGIST_VERIFIED':
        return t(
          'PatientScreening.diagnosis.type.verifiedResult',
          'Verified Result'
        );
      default:
        return type;
    }
  };

  const getDiagnosisStatusBadge = (status: ScreeningReport['status']) => {
    if (status === 'verified') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          {t('PatientScreening.diagnosis.status.verified', 'Verified')}
        </span>
      );
    }

    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
          <Clock className="w-3 h-3" />
          {t('PatientScreening.status.pending', 'Pending')}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
        <CheckCircle className="w-3 h-3" />
        {t('PatientScreening.status.completed', 'Completed')}
      </span>
    );
  };

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
    name: `${t('PatientReview.sessionLabel', 'Session')} - ${formatShortDate(session.createdAt)}`,
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
      scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.eye.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedReportQuery = useQuery({
    queryKey: ['patient', 'screening', 'diagnosis', selectedReportId],
    queryFn: () => getReport(selectedReportId!),
    enabled: Boolean(selectedReportId),
  });

  const selectedReport = selectedReportQuery.data ?? null;

  const queryDiagnosisId =
    searchParams.get('diagnosisId') ?? searchParams.get('screeningId');
  const queryOpenDiagnosis = searchParams.get('openDiagnosis');

  useEffect(() => {
    if (!queryDiagnosisId && queryOpenDiagnosis !== 'latest') {
      return;
    }

    if (queryDiagnosisId) {
      setSelectedReportId(queryDiagnosisId);
    } else if (sortedScans.length > 0) {
      setSelectedReportId(sortedScans[0].id);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('diagnosisId');
    nextParams.delete('screeningId');
    nextParams.delete('openDiagnosis');
    setSearchParams(nextParams, { replace: true });
  }, [
    queryDiagnosisId,
    queryOpenDiagnosis,
    searchParams,
    setSearchParams,
    sortedScans,
  ]);

  const closeDiagnosisModal = () => {
    setSelectedReportId(null);
  };

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

  return (
    <PatientLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              {t('PatientScreening.page.title', 'My Scans')}
            </h1>
            <p className="text-(--text-secondary) text-sm">
              {t(
                'PatientScreening.page.subtitle',
                'View and manage your retinal screening history'
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/screening/new')}
            className="btn-primary flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            {t('PatientScreening.actions.newScreening', 'New Screening')}
          </button>
        </div>

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
              <button
                onClick={() => navigate('/patient/screening/new')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('PatientScreening.actions.newScreening', 'New Screening')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    navigate('/patient/screening/review', {
                      state: { screeningId: scan.id },
                    });
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
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(scan.date)}
                      </span>
                      {scan.findings !== undefined && (
                        <span>
                          {scan.findings}{' '}
                          {scan.findings === 1
                            ? t('PatientScreening.labels.finding', 'finding')
                            : t('PatientScreening.labels.findings', 'findings')}
                        </span>
                      )}
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
                            navigate('/patient/screening/review', {
                              state: { screeningId: scan.id },
                            });
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
                            setActiveDropdown(null);
                            setSelectedReportId(scan.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <FileText className="w-4 h-4" />
                          {t(
                            'PatientScreening.actions.viewDiagnosis',
                            'Medical Diagnosis'
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

      {selectedReportId && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={closeDiagnosisModal}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-(--bg-primary) border border-(--border-color) shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {!selectedReport && (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-(--text-secondary)" />
                <p className="text-sm text-(--text-secondary) mt-3">
                  {t(
                    'PatientScreening.diagnosis.loading',
                    'Loading medical diagnosis details...'
                  )}
                </p>
              </div>
            )}

            {selectedReport && (
              <>
                <div className="p-5 border-b border-(--border-color) flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                      {t(
                        'PatientScreening.diagnosis.title',
                        'Medical Diagnosis'
                      )}
                    </p>
                    <h3 className="text-xl font-bold text-(--text-primary) mt-1">
                      {getDiagnosisTypeLabel(selectedReport.type)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {getDiagnosisRiskBadge(selectedReport.riskLevel)}
                      {getDiagnosisStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDiagnosisModal}
                    className="p-2 rounded-lg hover:bg-(--bg-secondary) text-(--text-secondary)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-(--border-color) p-3 bg-(--bg-secondary)">
                      <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                        {t(
                          'PatientScreening.diagnosis.fields.createdAt',
                          'Created At'
                        )}
                      </p>
                      <p className="text-(--text-primary) font-semibold mt-1">
                        {formatShortDate(selectedReport.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedReport.medicalDiagnosis && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-3">
                        {t(
                          'PatientScreening.diagnosis.detailsTitle',
                          'Medical Diagnosis Details'
                        )}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.diagnosisCode',
                              'Diagnosis Code'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.diagnosisCode ||
                              diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.codingSystem',
                              'Coding System'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.codingSystem ||
                              diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.severityLevel',
                              'Severity Level'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1 capitalize">
                            {selectedReport.medicalDiagnosis?.severityLevel ||
                              diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.clinicalStatus',
                              'Clinical Status'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.status ||
                              diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.urgentCase',
                              'Urgent Case'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis
                              ? selectedReport.medicalDiagnosis.isUrgent
                                ? t('PatientScreening.diagnosis.yes', 'Yes')
                                : t('PatientScreening.diagnosis.no', 'No')
                              : diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.referralNeeded',
                              'Referral Needed'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis
                              ? selectedReport.medicalDiagnosis.isReferralNeeded
                                ? t('PatientScreening.diagnosis.yes', 'Yes')
                                : t('PatientScreening.diagnosis.no', 'No')
                              : diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.followUpDate',
                              'Follow-up Date'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.followUpDate
                              ? formatShortDate(
                                  selectedReport.medicalDiagnosis.followUpDate
                                )
                              : diagnosisNotAvailable}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            {t(
                              'PatientScreening.diagnosis.fields.finalizedAt',
                              'Finalized At'
                            )}
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.finalizedAt
                              ? formatShortDate(
                                  selectedReport.medicalDiagnosis.finalizedAt
                                )
                              : diagnosisNotAvailable}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      {t(
                        'PatientScreening.diagnosis.sections.clinicalSummary',
                        'Clinical Summary'
                      )}
                    </h4>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">
                      {selectedReport.summary}
                    </p>
                  </section>

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      {t(
                        'PatientScreening.diagnosis.sections.findings',
                        'Findings'
                      )}
                    </h4>
                    {selectedReport.medicalDiagnosis?.clinicalFindings ? (
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.clinicalFindings}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedReport.findings.map((finding) => (
                          <li
                            key={finding.id}
                            className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word"
                          >
                            • {finding.description}
                          </li>
                        ))}
                        {selectedReport.findings.length === 0 && (
                          <li className="text-sm text-(--text-muted)">
                            {t(
                              'PatientScreening.diagnosis.empty.findings',
                              'No detailed findings available.'
                            )}
                          </li>
                        )}
                      </ul>
                    )}
                  </section>

                  {selectedReport.medicalDiagnosis?.treatmentPlan && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                        {t(
                          'PatientScreening.diagnosis.sections.treatmentPlan',
                          'Treatment Plan'
                        )}
                      </h4>
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.treatmentPlan}
                      </p>
                    </section>
                  )}

                  {selectedReport.medicalDiagnosis?.lifestyleAdvice && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                        {t(
                          'PatientScreening.diagnosis.sections.lifestyleAdvice',
                          'Lifestyle Advice'
                        )}
                      </h4>
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.lifestyleAdvice}
                      </p>
                    </section>
                  )}

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      {t(
                        'PatientScreening.diagnosis.sections.recommendations',
                        'Recommendations'
                      )}
                    </h4>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-(--text-secondary)"
                        >
                          • {item}
                        </li>
                      ))}
                      {selectedReport.recommendations.length === 0 && (
                        <li className="text-sm text-(--text-muted)">
                          {t(
                            'PatientScreening.diagnosis.empty.recommendations',
                            'No recommendations available.'
                          )}
                        </li>
                      )}
                    </ul>
                  </section>

                  {(selectedReport.verifiedAt || selectedReport.verifiedBy) && (
                    <section className="rounded-xl border border-(--border-color) p-4 bg-brand-soft/40">
                      {selectedReport.verifiedAt && (
                        <p className="text-sm text-(--text-secondary)">
                          <span className="font-semibold text-(--text-primary)">
                            {t(
                              'PatientScreening.diagnosis.fields.verifiedAt',
                              'Verified At'
                            )}
                            :{' '}
                          </span>
                          {formatShortDate(selectedReport.verifiedAt)}
                        </p>
                      )}
                      {selectedReport.verifiedBy?.fullName && (
                        <p className="text-sm text-(--text-secondary) mt-2">
                          <span className="font-semibold text-(--text-primary)">
                            {t(
                              'PatientScreening.diagnosis.fields.verifiedBy',
                              'Verified By'
                            )}
                            :{' '}
                          </span>
                          {selectedReport.verifiedBy.fullName}
                        </p>
                      )}
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
