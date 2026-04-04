import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Download,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { formatShortDate } from '@/lib/date-utils';
import { screeningApi } from '../api/screening.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import i18n from '@/i18n/i18n';
import { localizeFindingsText } from '@/features/patient/lib/disease-translation';
import Spinner from '@/components/ui/spinner';

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

function extractPrimaryFinding(
  findings: string | undefined,
  language: string
): string | undefined {
  if (!findings) return undefined;

  const first = localizeFindingsText(findings, language)
    .split(',')
    .map((item) => item.trim())
    .find(Boolean);

  if (!first) return undefined;

  return first.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export default function ScreeningPage() {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'vi';

  const [searchQuery, setSearchQuery] = useState('');
  const [scanPage, setScanPage] = useState(1);
  const SCANS_PAGE_SIZE = 6;

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
    name: (() => {
      const finding = extractPrimaryFinding(
        sessionDetailsQuery.data?.[session.screeningId],
        currentLanguage
      );
      return finding
        ? `${t('PatientReview.sessionLabel', 'Session')} - ${finding}`
        : `${t('PatientReview.sessionLabel', 'Session')} - ${formatShortDate(session.createdAt)}`;
    })(),
    eye: 'Both Eyes',
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

  const filteredScans = scans.filter(
    (scan) =>
      scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.eye.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalScanPages = Math.max(
    1,
    Math.ceil(filteredScans.length / SCANS_PAGE_SIZE)
  );

  const pagedScans = useMemo(() => {
    const start = (scanPage - 1) * SCANS_PAGE_SIZE;
    return filteredScans.slice(start, start + SCANS_PAGE_SIZE);
  }, [filteredScans, scanPage]);

  useEffect(() => {
    setScanPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setScanPage((currentPage) => Math.min(currentPage, totalScanPages));
  }, [totalScanPages]);

  const getStatusBadge = (scan: Scan) => {
    switch (scan.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Clock className="w-3 h-3 animate-pulse" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border capitalize ${colors[riskLevel as keyof typeof colors]}`}
      >
        {riskLevel} risk
      </span>
    );
  };

  const completedScans = scans.filter((s) => s.status === 'completed').length;
  const processingScans = scans.filter((s) => s.status === 'processing').length;

  if (sessionsQuery.isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Spinner size={36} className="mx-auto mb-3" />
            <p className="text-(--text-secondary)">Loading scans...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              My Scans
            </h1>
            <p className="text-(--text-secondary) text-sm">
              View and manage your retinal screening history
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/screening/new')}
            className="btn-primary flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Screening
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
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {scans.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Scans</p>
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
                <p className="text-xs text-[var(--text-muted)]">Completed</p>
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
                <p className="text-xs text-[var(--text-muted)]">Processing</p>
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
                <p className="text-xs text-(--text-muted)">Findings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
        </div>

        {/* Scans List */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-(--text-primary)">
              Recent Scans ({filteredScans.length})
            </h2>
          </div>

          {filteredScans.length === 0 ? (
            <div className="medical-card flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No scans yet
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Start your first retinal screening to detect potential issues
                early
              </p>
              <button
                onClick={() => navigate('/patient/screening/new')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Screening
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pagedScans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-white dark:bg-[#0d2137] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] p-6 hover:border-primary/30 transition-colors"
                  onClick={() => {
                    navigate('/patient/screening/review', {
                      state: { screeningId: scan.id },
                    });
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] shrink-0 border border-[var(--border-color)]">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-lg font-bold text-(--text-primary) line-clamp-1">
                            {scan.name}
                          </p>
                          {getRiskBadge(scan.riskLevel)}
                          {getStatusBadge(scan)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                          <div className="flex items-center gap-2 text-(--text-secondary)">
                            <Calendar className="w-4 h-4" />
                            <span>{formatShortDate(scan.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-(--text-secondary)">
                            <Eye className="w-4 h-4" />
                            <span>{scan.eye}</span>
                          </div>
                        </div>

                        <p className="text-sm text-(--text-secondary)">
                          {scan.status === 'completed'
                            ? 'Analysis completed. Tap to review full details.'
                            : 'Scan is still being processed.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/patient/screening/review', {
                            state: { screeningId: scan.id },
                          });
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white"
                      >
                        <Eye className="w-4 h-4" />
                        View Review
                      </button>

                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredScans.length > SCANS_PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setScanPage((page) => Math.max(1, page - 1))}
                disabled={scanPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#1e3a5f]/50 text-(--text-primary) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <p className="text-sm text-(--text-secondary)">
                Page {scanPage} / {totalScanPages}
              </p>
              <button
                type="button"
                onClick={() =>
                  setScanPage((page) => Math.min(totalScanPages, page + 1))
                }
                disabled={scanPage === totalScanPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#1e3a5f]/50 text-(--text-primary) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
