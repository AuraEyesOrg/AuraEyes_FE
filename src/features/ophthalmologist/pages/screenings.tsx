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
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  listOphthalmologistScreenings,
  type OphthalmologistScreeningListItemDto,
} from '../api/ophthalmologist-screenings.api';
import Spinner from '@/components/ui/spinner';

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

function formatScreeningRef(screeningId: string): string {
  return `SCR-${screeningId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function toConfidencePercent(score: number | null | undefined): number {
  if (score == null || !Number.isFinite(Number(score))) return 0;
  const n = Number(score);
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function getRiskLevel(row: OphthalmologistScreeningListItemDto): {
  label: string;
  color: string;
  stripColor: string;
  bgColor: string;
  priority: number;
} {
  const risk = (row.latestRiskLevel ?? '').trim().toLowerCase();
  if (risk === 'high' || risk === 'critical')
    return {
      label: 'High Risk',
      color: 'text-red-600 dark:text-red-400',
      stripColor: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      priority: 0,
    };
  if (risk === 'medium' || risk === 'moderate')
    return {
      label: 'Medium Risk',
      color: 'text-amber-600 dark:text-amber-400',
      stripColor: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      priority: 1,
    };
  if (risk === 'low')
    return {
      label: 'Low Risk',
      color: 'text-green-600 dark:text-green-400',
      stripColor: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      priority: 2,
    };
  return {
    label: 'Unknown',
    color: 'text-gray-500 dark:text-gray-400',
    stripColor: 'bg-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    priority: 3,
  };
}

function getStatusConfig(status: string) {
  const normalized = (status ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'approved':
      return {
        text: 'Approved',
        icon: <CheckCircle size={14} />,
        cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        priority: 4,
      };
    case 'reviewed':
      return {
        text: 'Reviewed',
        icon: <CheckCircle size={14} />,
        cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        priority: 3,
      };
    case 'flagged':
      return {
        text: 'Flagged',
        icon: <AlertTriangle size={14} />,
        cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        priority: 1,
      };
    case 'rejected':
      return {
        text: 'Rejected',
        icon: <XCircle size={14} />,
        cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        priority: 5,
      };
    default:
      return {
        text: 'Pending Review',
        icon: <Clock size={14} />,
        cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
        priority: 0,
      };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return 'High';
  if (confidence >= 70) return 'Moderate';
  if (confidence > 0) return 'Low';
  return 'N/A';
}

function aiLabelForRow(row: OphthalmologistScreeningListItemDto): string {
  if (row.aiPrimaryLabel?.trim()) return row.aiPrimaryLabel.trim();
  if (row.latestRiskLevel?.trim()) return row.latestRiskLevel.trim();
  return 'Pending analysis';
}

type SortMode = 'priority' | 'date';

/* ────────────────────── component ────────────────────── */

export default function ScreeningsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [items, setItems] = useState<OphthalmologistScreeningListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listOphthalmologistScreenings();
      setItems(data);
    } catch {
      setLoadError('Could not load screenings. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredScreenings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = items.filter((row) => {
      const ref = formatScreeningRef(row.screeningId).toLowerCase();
      const matchesSearch =
        !q ||
        row.patientName.toLowerCase().includes(q) ||
        row.screeningId.toLowerCase().includes(q) ||
        ref.includes(q);
      const rowStatus = (row.reviewStatus ?? '').trim().toLowerCase();
      const selectedNormalized =
        selectedStatus === 'all' ? 'all' : selectedStatus.trim().toLowerCase();
      const matchesStatus =
        selectedNormalized === 'all' || rowStatus === selectedNormalized;
      return matchesSearch && matchesStatus;
    });

    // Sort
    if (sortMode === 'priority') {
      filtered.sort((a, b) => {
        const statusA = getStatusConfig(a.reviewStatus).priority;
        const statusB = getStatusConfig(b.reviewStatus).priority;
        if (statusA !== statusB) return statusA - statusB;
        const riskA = getRiskLevel(a).priority;
        const riskB = getRiskLevel(b).priority;
        if (riskA !== riskB) return riskA - riskB;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [items, searchQuery, selectedStatus, sortMode]);

  const stats = useMemo(() => {
    const pending = items.filter(
      (s) => s.reviewStatus === 'pending-review'
    ).length;
    const reviewed = items.filter((s) => s.reviewStatus === 'reviewed').length;
    const approved = items.filter((s) => s.reviewStatus === 'approved').length;
    const flagged = items.filter((s) => s.reviewStatus === 'flagged').length;
    return {
      total: items.length,
      pending,
      reviewed,
      approved,
      flagged,
    };
  }, [items]);

  const statusTabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending-review', label: 'Pending', count: stats.pending },
    { key: 'flagged', label: 'Flagged', count: stats.flagged },
    { key: 'reviewed', label: 'Reviewed', count: stats.reviewed },
    { key: 'approved', label: 'Approved', count: stats.approved },
  ];

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={stats.pending} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Screenings" />

        <main className="p-6 max-w-[1400px] mx-auto">
          {/* ── Header ── */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Screenings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI screening results for your patients — sorted by urgency
              </p>
            </div>
          </div>

          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {loadError}
              <button
                type="button"
                onClick={() => void load()}
                className="ml-3 font-medium text-red-900 underline dark:text-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Compact Stats Pills ── */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Activity className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.pending}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Pending
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.flagged}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Flagged
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.approved}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Approved
              </span>
            </div>
          </div>

          {/* ── Search + Filter + Sort ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or screening ID..."
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
              title="Toggle sort order"
            >
              <SlidersHorizontal size={14} />
              {sortMode === 'priority' ? 'By Priority' : 'By Date'}
            </button>
          </div>

          {/* ── Screening Cards ── */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading screenings…
                </p>
              </div>
            ) : filteredScreenings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Screenings Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'No screenings match your current filters. Try adjusting your search or status filter.'
                    : 'Screenings appear here when a patient books a consultation that includes an AI screening linked to you.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-[#1e3a5f]/50">
                {filteredScreenings.map((screening) => {
                  const statusCfg = getStatusConfig(screening.reviewStatus);
                  const risk = getRiskLevel(screening);
                  const confidence = toConfidencePercent(
                    screening.confidenceScore
                  );
                  const confidenceColor = getConfidenceColor(confidence);
                  const confidenceLabel = getConfidenceLabel(confidence);
                  const created = new Date(screening.createdAt);
                  const dateStr = created.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeStr = created.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const aiLabel = aiLabelForRow(screening);
                  const isPending = screening.reviewStatus === 'pending-review';
                  const isFlagged = screening.reviewStatus === 'flagged';

                  return (
                    <div
                      key={screening.screeningId}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-[#0a1929]/30 ${
                        isPending || isFlagged ? '' : 'opacity-80'
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
                                  Needs attention
                                </span>
                              )}
                            </div>

                            {/* Row 2: AI Prediction + Confidence bar */}
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  AI Prediction
                                </span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                  {aiLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Confidence
                                </span>
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
                                {dateStr}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {timeStr}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Eye size={12} />
                                {screening.imagesCount} images
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                {formatScreeningRef(screening.screeningId)}
                              </span>
                            </div>
                          </div>

                          {/* Action button */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/ophthalmologist/screenings/${screening.screeningId}/review`
                              )
                            }
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
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
                                Review Now
                              </>
                            ) : isFlagged ? (
                              <>
                                <AlertTriangle className="w-4 h-4" />
                                Review
                              </>
                            ) : (
                              <>
                                View
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
