import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Shield,
  SlidersHorizontal,
  RefreshCw,
  MessageCircle,
  Radio,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  listOphthalmologistScreenings,
  type OphthalmologistScreeningListItemDto,
} from '../api/ophthalmologist-screenings.api';
import { useConsultationSessions } from '@/features/consultation/hooks/use-consultation';
import {
  ChatStatus,
  SessionStatus,
  type ConsultationSessionListDto,
} from '@/types/consultation';
import useAuthStore from '@/store/auth-store';
import Spinner from '@/components/ui/spinner';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import useNotificationStore from '@/store/useNotificationStore';
import { NotificationType, parseNotificationType } from '@/types/notification';

/* ────────────────────── helpers ────────────────────── */

const AVATAR_PALETTE = [
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#10b981',
  '#6366f1',
  '#f43f5e',
];

type TranslateFn = (key: string, fallback: string) => string;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function avatarColorForKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatScreeningRef(screeningId: string): string {
  return `SCR-${screeningId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function toConfidencePercent(score: number | null | undefined): number {
  if (score == null || !Number.isFinite(Number(score))) return 0;
  const n = Number(score);
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function getRiskLevel(
  row: OphthalmologistScreeningListItemDto,
  t: TranslateFn
): {
  label: string;
  color: string;
  stripColor: string;
  bgColor: string;
  priority: number;
} {
  const risk = (row.latestRiskLevel ?? '').trim().toLowerCase();
  if (risk === 'high' || risk === 'critical')
    return {
      label: t('Ophthalmologist.screenings.risk.high', 'High Risk'),
      color: 'text-red-600 dark:text-red-400',
      stripColor: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      priority: 0,
    };
  if (risk === 'medium' || risk === 'moderate')
    return {
      label: t('Ophthalmologist.screenings.risk.medium', 'Medium Risk'),
      color: 'text-amber-600 dark:text-amber-400',
      stripColor: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      priority: 1,
    };
  if (risk === 'low')
    return {
      label: t('Ophthalmologist.screenings.risk.low', 'Low Risk'),
      color: 'text-green-600 dark:text-green-400',
      stripColor: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      priority: 2,
    };
  return {
    label: t('Ophthalmologist.screenings.risk.unknown', 'Unknown'),
    color: 'text-gray-500 dark:text-gray-400',
    stripColor: 'bg-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    priority: 3,
  };
}

function getStatusConfig(status: string, t: TranslateFn) {
  const normalized = (status ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'approved':
      return {
        text: t('Ophthalmologist.screenings.status.approved', 'Approved'),
        icon: <CheckCircle size={14} />,
        cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        priority: 4,
      };
    case 'reviewed':
      return {
        text: t('Ophthalmologist.screenings.status.reviewed', 'Reviewed'),
        icon: <CheckCircle size={14} />,
        cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        priority: 3,
      };
    case 'flagged':
      return {
        text: t('Ophthalmologist.screenings.status.flagged', 'Flagged'),
        icon: <AlertTriangle size={14} />,
        cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        priority: 1,
      };
    case 'rejected':
      return {
        text: t('Ophthalmologist.screenings.status.rejected', 'Rejected'),
        icon: <XCircle size={14} />,
        cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        priority: 5,
      };
    default:
      return {
        text: t(
          'Ophthalmologist.screenings.status.pendingReview',
          'Pending Review'
        ),
        icon: <Clock size={14} />,
        cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
        priority: 0,
      };
  }
}

function isPendingLikeReviewStatus(status: string): boolean {
  const normalized = (status ?? '').trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === 'pending-review' ||
    normalized === 'pending' ||
    normalized === 'pendingreview' ||
    normalized === 'in-review' ||
    normalized === 'inreview'
  );
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function getConfidenceLabel(confidence: number, t: TranslateFn): string {
  if (confidence >= 90)
    return t('Ophthalmologist.screenings.confidence.high', 'High');
  if (confidence >= 70)
    return t('Ophthalmologist.screenings.confidence.moderate', 'Moderate');
  if (confidence > 0)
    return t('Ophthalmologist.screenings.confidence.low', 'Low');
  return t('Ophthalmologist.screenings.confidence.na', 'N/A');
}

function aiLabelForRow(
  row: OphthalmologistScreeningListItemDto,
  t: TranslateFn
): string {
  if (row.aiPrimaryLabel?.trim()) return row.aiPrimaryLabel.trim();
  if (row.latestRiskLevel?.trim()) return row.latestRiskLevel.trim();
  return t('Ophthalmologist.screenings.pendingAnalysis', 'Pending analysis');
}

function toTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function sessionSortPriority(
  session: ConsultationSessionListDto,
  nowMs: number
): { bucket: number; weight: number } {
  const appointmentMs = toTimestamp(session.appointmentTime);
  if (appointmentMs != null && appointmentMs >= nowMs) {
    // Upcoming consultation should be shown first.
    return { bucket: 0, weight: appointmentMs };
  }
  if (appointmentMs != null) {
    // Past consultations sorted by most recent first.
    return { bucket: 1, weight: -appointmentMs };
  }
  const createdMs = toTimestamp(session.createdAt);
  return { bucket: 2, weight: -(createdMs ?? 0) };
}

type SortMode = 'priority' | 'date';
const SCREENINGS_PAGE_SIZE = 8;

/* ────────────────────── component ────────────────────── */

export default function ScreeningsPage() {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentDoctorId = user?.roleId ?? '';
  const doctorFilterId = isUuid(currentDoctorId) ? currentDoctorId : undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<OphthalmologistScreeningListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const latestNotification = useNotificationStore(
    (state) => state.notifications[0]
  );

  const consultationSessionsQuery = useConsultationSessions(
    {
      ophthalmologistId: doctorFilterId,
      pageNumber: 1,
      pageSize: 500,
    },
    { enabled: Boolean(doctorFilterId) }
  );
  const refetchConsultationSessions = consultationSessionsQuery.refetch;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listOphthalmologistScreenings();
      setItems(data);
      setLastSyncedAt(new Date());
    } catch {
      setLoadError(
        t(
          'Ophthalmologist.screenings.loadError',
          'Could not load screenings. Please try again.'
        )
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void load();
      void refetchConsultationSessions();
    }, 15_000);

    return () => window.clearInterval(intervalId);
  }, [load, refetchConsultationSessions]);

  useEffect(() => {
    if (
      parseNotificationType(latestNotification?.type) !==
      NotificationType.NewConsultationRequest
    ) {
      return;
    }

    void load();
    void refetchConsultationSessions();
  }, [
    latestNotification?.id,
    latestNotification?.type,
    load,
    refetchConsultationSessions,
  ]);

  useEffect(() => {
    if (loadError) {
      ophthalToast.error(loadError);
    }
  }, [loadError]);

  const sessionInsights = useMemo(() => {
    const sessionItems = consultationSessionsQuery.data?.items ?? [];
    const nowMs = Date.now();
    const completedMap = new Map<string, boolean>();
    const bestSessionByScreeningId = new Map<
      string,
      ConsultationSessionListDto
    >();
    const bestSessionByPatientId = new Map<
      string,
      ConsultationSessionListDto
    >();

    sessionItems.forEach((session) => {
      const sessionScreeningId =
        session.caseSnapshot?.screeningId ?? session.aiScreeningId ?? null;

      if (!sessionScreeningId) return;
      const screeningKey = sessionScreeningId.toLowerCase();
      const isConsultationSession =
        session.chatStatus === ChatStatus.Open ||
        session.chatStatus === ChatStatus.Locked ||
        session.chatStatus === ChatStatus.MemoOnly ||
        session.status === SessionStatus.Pending ||
        session.status === SessionStatus.Confirmed ||
        session.status === SessionStatus.Completed;

      if (session.status === SessionStatus.Completed) {
        completedMap.set(screeningKey, true);
      }

      if (
        !isConsultationSession ||
        session.status === SessionStatus.Cancelled
      ) {
        return;
      }

      const existing = bestSessionByScreeningId.get(screeningKey);
      if (!existing) {
        bestSessionByScreeningId.set(screeningKey, session);
        return;
      }

      const nextRank = sessionSortPriority(session, nowMs);
      const currentRank = sessionSortPriority(existing, nowMs);
      if (
        nextRank.bucket < currentRank.bucket ||
        (nextRank.bucket === currentRank.bucket &&
          nextRank.weight < currentRank.weight)
      ) {
        bestSessionByScreeningId.set(screeningKey, session);
      }
    });

    sessionItems.forEach((session) => {
      if (!session.patientId) return;
      if (session.status === SessionStatus.Cancelled) return;
      const patientKey = session.patientId.toLowerCase();
      const existing = bestSessionByPatientId.get(patientKey);
      if (!existing) {
        bestSessionByPatientId.set(patientKey, session);
        return;
      }
      const nextRank = sessionSortPriority(session, nowMs);
      const currentRank = sessionSortPriority(existing, nowMs);
      if (
        nextRank.bucket < currentRank.bucket ||
        (nextRank.bucket === currentRank.bucket &&
          nextRank.weight < currentRank.weight)
      ) {
        bestSessionByPatientId.set(patientKey, session);
      }
    });

    return { completedMap, bestSessionByScreeningId, bestSessionByPatientId };
  }, [consultationSessionsQuery.data?.items]);

  const completedConsultationByScreeningId = sessionInsights.completedMap;
  const linkedSessionByScreeningId = sessionInsights.bestSessionByScreeningId;
  const linkedSessionByPatientId = sessionInsights.bestSessionByPatientId;

  const getLinkedSession = useCallback(
    (
      row: OphthalmologistScreeningListItemDto
    ): ConsultationSessionListDto | null => {
      const screeningKey = row.screeningId.toLowerCase();
      const direct = linkedSessionByScreeningId.get(screeningKey);
      if (direct) return direct;
      const patientKey = row.patientId.toLowerCase();
      return linkedSessionByPatientId.get(patientKey) ?? null;
    },
    [linkedSessionByPatientId, linkedSessionByScreeningId]
  );

  const getSortTimestamp = useCallback(
    (row: OphthalmologistScreeningListItemDto): number => {
      const linkedSession = getLinkedSession(row);
      const appointmentMs = toTimestamp(linkedSession?.appointmentTime);
      if (appointmentMs != null) return appointmentMs;
      return toTimestamp(row.createdAt) ?? 0;
    },
    [getLinkedSession]
  );

  const getEffectiveReviewStatus = useCallback(
    (row: OphthalmologistScreeningListItemDto): string => {
      const rawStatus = (row.reviewStatus ?? '').trim().toLowerCase();
      if (!isPendingLikeReviewStatus(rawStatus)) {
        return rawStatus;
      }

      const screeningKey = row.screeningId.toLowerCase();
      if (completedConsultationByScreeningId.get(screeningKey)) {
        return 'reviewed';
      }

      return rawStatus.length > 0 ? rawStatus : 'pending-review';
    },
    [completedConsultationByScreeningId]
  );

  const filteredScreenings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = items.filter((row) => {
      const ref = formatScreeningRef(row.screeningId).toLowerCase();
      const matchesSearch =
        !q ||
        row.patientName.toLowerCase().includes(q) ||
        row.screeningId.toLowerCase().includes(q) ||
        ref.includes(q);
      const rowStatus = getEffectiveReviewStatus(row);
      const selectedNormalized =
        selectedStatus === 'all' ? 'all' : selectedStatus.trim().toLowerCase();
      const matchesStatus =
        selectedNormalized === 'all' || rowStatus === selectedNormalized;
      return matchesSearch && matchesStatus;
    });

    // Sort
    if (sortMode === 'priority') {
      filtered.sort((a, b) => {
        const statusA = getStatusConfig(
          getEffectiveReviewStatus(a),
          t
        ).priority;
        const statusB = getStatusConfig(
          getEffectiveReviewStatus(b),
          t
        ).priority;
        if (statusA !== statusB) return statusA - statusB;
        const riskA = getRiskLevel(a, t).priority;
        const riskB = getRiskLevel(b, t).priority;
        if (riskA !== riskB) return riskA - riskB;
        return getSortTimestamp(a) - getSortTimestamp(b);
      });
    } else {
      filtered.sort((a, b) => getSortTimestamp(a) - getSortTimestamp(b));
    }

    return filtered;
  }, [
    getEffectiveReviewStatus,
    items,
    searchQuery,
    selectedStatus,
    sortMode,
    t,
    getSortTimestamp,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, sortMode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredScreenings.length / SCREENINGS_PAGE_SIZE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedScreenings = useMemo(() => {
    const start = (safeCurrentPage - 1) * SCREENINGS_PAGE_SIZE;
    return filteredScreenings.slice(start, start + SCREENINGS_PAGE_SIZE);
  }, [filteredScreenings, safeCurrentPage]);

  const stats = useMemo(() => {
    const pending = items.filter(
      (s) => getEffectiveReviewStatus(s) === 'pending-review'
    ).length;
    const reviewed = items.filter(
      (s) => getEffectiveReviewStatus(s) === 'reviewed'
    ).length;
    const approved = items.filter(
      (s) => getEffectiveReviewStatus(s) === 'approved'
    ).length;
    const flagged = items.filter(
      (s) => getEffectiveReviewStatus(s) === 'flagged'
    ).length;
    return {
      total: items.length,
      pending,
      reviewed,
      approved,
      flagged,
    };
  }, [getEffectiveReviewStatus, items]);

  const statusTabs = [
    {
      key: 'all',
      label: t('Ophthalmologist.screenings.filter.all', 'All'),
      count: stats.total,
    },
    {
      key: 'pending-review',
      label: t('Ophthalmologist.screenings.filter.pending', 'Pending'),
      count: stats.pending,
    },
    {
      key: 'flagged',
      label: t('Ophthalmologist.screenings.filter.flagged', 'Flagged'),
      count: stats.flagged,
    },
    {
      key: 'reviewed',
      label: t('Ophthalmologist.screenings.filter.reviewed', 'Reviewed'),
      count: stats.reviewed,
    },
    {
      key: 'approved',
      label: t('Ophthalmologist.screenings.filter.approved', 'Approved'),
      count: stats.approved,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={stats.pending} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.screenings.title', 'Screenings')}
        />

        <main className="p-6 max-w-350 mx-auto">
          {/* ── Header ── */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-800/60 dark:bg-cyan-900/20 dark:text-cyan-300">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                {t('Ophthalmologist.screenings.liveQueue', 'Live review queue')}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('Ophthalmologist.screenings.title', 'Incoming Screenings')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.screenings.subtitle',
                  'Clinic queue cases sent to you for AI image review, report editing, and final verification.'
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-500 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {t('Ophthalmologist.screenings.autoSync', 'Auto-sync')}
                </span>
                {lastSyncedAt
                  ? ` • ${lastSyncedAt.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : ''}
              </div>
              <button
                type="button"
                onClick={() => {
                  void load();
                  void refetchConsultationSessions();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-gray-200 dark:hover:bg-[#1e3a5f]"
              >
                <RefreshCw className="h-4 w-4" />
                {t('Ophthalmologist.common.refresh', 'Refresh')}
              </button>
            </div>
          </div>

          {/* ── Compact Stats Pills ── */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Activity className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.screenings.stats.total', 'Total')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.pending}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.screenings.stats.pending', 'Pending')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.flagged}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.screenings.stats.flagged', 'Flagged')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.approved}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.screenings.stats.approved', 'Approved')}
              </span>
            </div>
          </div>

          {/* ── Search + Filter + Sort ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t(
                  'Ophthalmologist.screenings.searchPlaceholder',
                  'Search by patient name or screening ID...'
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-[#0a1929] rounded-xl p-1 gap-0.5">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedStatus === tab.key
                      ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                      selectedStatus === tab.key
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortMode((m) => (m === 'priority' ? 'date' : 'priority'))
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1e3a5f] transition-colors"
              title={t(
                'Ophthalmologist.screenings.toggleSortOrder',
                'Toggle sort order'
              )}
            >
              <SlidersHorizontal size={14} />
              {sortMode === 'priority'
                ? t('Ophthalmologist.screenings.sort.byPriority', 'By Priority')
                : t('Ophthalmologist.screenings.sort.byDate', 'By Date')}
            </button>
          </div>

          {/* ── Screening Cards ── */}
          {loading ? (
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.screenings.loading',
                    'Loading screenings...'
                  )}
                </p>
              </div>
            </div>
          ) : filteredScreenings.length === 0 ? (
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t(
                  'Ophthalmologist.screenings.empty.title',
                  'No Screenings Found'
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery || selectedStatus !== 'all'
                  ? t(
                      'Ophthalmologist.screenings.empty.filtered',
                      'No screenings match your current filters. Try adjusting your search or status filter.'
                    )
                  : t(
                      'Ophthalmologist.screenings.empty.default',
                      'Screenings appear here as soon as clinic staff sends an AI screening case from the queue to you.'
                    )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagedScreenings.map((screening) => {
                const effectiveReviewStatus =
                  getEffectiveReviewStatus(screening);
                const statusCfg = getStatusConfig(effectiveReviewStatus, t);
                const risk = getRiskLevel(screening, t);
                const confidence = toConfidencePercent(
                  screening.confidenceScore
                );
                const confidenceColor = getConfidenceColor(confidence);
                const confidenceLabel = getConfidenceLabel(confidence, t);
                const created = new Date(screening.createdAt);
                const linkedSession = getLinkedSession(screening);
                const consultationTimeMs = toTimestamp(
                  linkedSession?.appointmentTime
                );
                const dateSource =
                  consultationTimeMs != null
                    ? new Date(consultationTimeMs)
                    : created;
                const dateStr = dateSource.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const timeStr = dateSource.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateTitle =
                  consultationTimeMs != null
                    ? t(
                        'Ophthalmologist.screenings.consultationDate',
                        'Consultation date'
                      )
                    : t(
                        'Ophthalmologist.screenings.createdDate',
                        'Created date'
                      );
                const aiLabel = aiLabelForRow(screening, t);
                const isPending = effectiveReviewStatus === 'pending-review';
                const isFlagged = effectiveReviewStatus === 'flagged';

                return (
                  <div
                    key={screening.screeningId}
                    className={`group bg-white dark:bg-[#0a1f44] rounded-2xl border transition-all duration-200 ${
                      isPending || isFlagged
                        ? 'border-gray-100 dark:border-[#1e3a5f] hover:border-cyan-200 dark:hover:border-cyan-800 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50'
                        : 'border-gray-100 dark:border-[#1e3a5f]'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                          style={{
                            backgroundColor: avatarColorForKey(
                              screening.patientId
                            ),
                          }}
                        >
                          {initialsFromName(screening.patientName)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Name + Status + Risk */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {screening.patientName}
                            </h3>
                            <span
                              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}
                            >
                              {statusCfg.icon} {statusCfg.text}
                            </span>
                            <span
                              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.bgColor} ${risk.color}`}
                            >
                              <Shield className="w-3 h-3" />
                              {risk.label}
                            </span>
                            {isFlagged && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                {t(
                                  'Ophthalmologist.screenings.needsAttention',
                                  'Needs attention'
                                )}
                              </span>
                            )}
                          </div>

                          {/* Row 2: AI Prediction + Confidence bar */}
                          <div className="flex flex-wrap items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t(
                                  'Ophthalmologist.screenings.aiPrediction',
                                  'AI Prediction'
                                )}
                              </span>
                              <span className="text-sm font-semibold text-gray-800 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {aiLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${confidenceColor} rounded-full transition-all`}
                                    style={{
                                      width: `${confidence}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {confidence}%{' '}
                                  <span className="font-normal text-gray-400">
                                    ({confidenceLabel})
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Summary snippet */}
                          {screening.summarySnippet?.trim() && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                              {screening.summarySnippet}
                            </p>
                          )}

                          {/* Row 4: Meta */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              {dateTitle}: {dateStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {timeStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye size={12} />
                              {screening.imagesCount}{' '}
                              {t('Ophthalmologist.screenings.images', 'images')}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              {formatScreeningRef(screening.screeningId)}
                            </span>
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="flex shrink-0 flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/ophthalmologist/screenings/${screening.screeningId}/review`
                              )
                            }
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              isPending
                                ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm hover:shadow-md hover:shadow-cyan-500/25'
                                : isFlagged
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a5f]'
                            }`}
                          >
                            {isPending ? (
                              <>
                                <Eye className="w-4 h-4" />
                                {t(
                                  'Ophthalmologist.screenings.reviewNow',
                                  'Review & Verify'
                                )}
                              </>
                            ) : isFlagged ? (
                              <>
                                <AlertTriangle className="w-4 h-4" />
                                {t(
                                  'Ophthalmologist.screenings.review',
                                  'Review & Verify'
                                )}
                              </>
                            ) : (
                              <>
                                {t('Ophthalmologist.common.view', 'View')}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                          {!isPending && linkedSession ? (
                            <button
                              type="button"
                              onClick={() => {
                                const patientId = encodeURIComponent(
                                  screening.patientId
                                );
                                const sessionId = encodeURIComponent(
                                  linkedSession.id
                                );
                                navigate(
                                  `/ophthalmologist/consultations?patientId=${patientId}&sessionId=${sessionId}`
                                );
                              }}
                              className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-800/60 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {t(
                                'Ophthalmologist.screenings.openAftercare',
                                'Post-consultation'
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredScreenings.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#1e3a5f] dark:bg-[#0a1f44] md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.common.showing', 'Showing')}{' '}
                {(safeCurrentPage - 1) * SCREENINGS_PAGE_SIZE + 1}-
                {Math.min(
                  safeCurrentPage * SCREENINGS_PAGE_SIZE,
                  filteredScreenings.length
                )}{' '}
                {t('Ophthalmologist.common.of', 'of')}{' '}
                {filteredScreenings.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={safeCurrentPage <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:text-gray-300 dark:hover:bg-[#1e3a5f]"
                >
                  {t('Ophthalmologist.common.previous', 'Previous')}
                </button>

                <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  {safeCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:text-gray-300 dark:hover:bg-[#1e3a5f]"
                >
                  {t('Ophthalmologist.common.next', 'Next')}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
