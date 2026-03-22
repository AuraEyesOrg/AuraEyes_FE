import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  listOphthalmologistScreenings,
  type OphthalmologistScreeningListItemDto,
} from '../api/ophthalmologist-screenings.api';
import Spinner from '@/components/ui/spinner';

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

function formatPatientRef(patientId: string): string {
  return `#${patientId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function toConfidencePercent(score: number | null | undefined): number {
  if (score == null || !Number.isFinite(Number(score))) return 0;
  const n = Number(score);
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle size={16} className="text-emerald-500" />;
    case 'reviewed':
      return <CheckCircle size={16} className="text-blue-500" />;
    case 'flagged':
      return <AlertCircle size={16} className="text-amber-500" />;
    case 'rejected':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-400" />;
  }
}

function getStatusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'approved':
      return { text: 'Approved', color: 'text-emerald-600 bg-emerald-50' };
    case 'reviewed':
      return { text: 'Reviewed', color: 'text-blue-600 bg-blue-50' };
    case 'flagged':
      return { text: 'Flagged', color: 'text-amber-600 bg-amber-50' };
    case 'rejected':
      return { text: 'Rejected', color: 'text-red-600 bg-red-50' };
    default:
      return { text: 'Pending Review', color: 'text-gray-600 bg-gray-100' };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function aiLabelForRow(row: OphthalmologistScreeningListItemDto): string {
  if (row.aiPrimaryLabel?.trim()) return row.aiPrimaryLabel.trim();
  if (row.latestRiskLevel?.trim()) return row.latestRiskLevel.trim();
  return 'Pending analysis';
}

export default function ScreeningsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
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
    return items.filter((row) => {
      const ref = formatScreeningRef(row.screeningId).toLowerCase();
      const matchesSearch =
        !q ||
        row.patientName.toLowerCase().includes(q) ||
        row.screeningId.toLowerCase().includes(q) ||
        ref.includes(q);
      const matchesStatus =
        selectedStatus === 'all' || row.reviewStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, selectedStatus]);

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

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={stats.pending} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Screenings" />

        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Screenings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage patient screenings
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

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Screenings
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Reviewed
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.reviewed}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Approved
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Flagged
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.flagged}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or screening ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending-review">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] hover:bg-gray-50 dark:hover:bg-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white transition-colors"
            >
              <Filter size={16} />
              More Filters
            </button>
          </div>

          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading screenings…
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#1e3a5f]">
                {filteredScreenings.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No screenings match your filters. Screenings appear here
                    when a patient books a consultation that includes an AI
                    screening linked to you.
                  </div>
                ) : (
                  filteredScreenings.map((screening) => {
                    const statusLabel = getStatusLabel(screening.reviewStatus);
                    const confidence = toConfidencePercent(
                      screening.confidenceScore
                    );
                    const confidenceColor = getConfidenceColor(confidence);
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
                    const typeLabel =
                      screening.modelVersion?.trim() || 'Retinal screening';

                    return (
                      <div
                        key={screening.screeningId}
                        className="p-5 hover:bg-gray-50/50 dark:hover:bg-[#1e3a5f]/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                            style={{
                              backgroundColor: avatarColorForKey(
                                screening.patientId
                              ),
                            }}
                          >
                            {initialsFromName(screening.patientName)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                  {screening.patientName}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatPatientRef(screening.patientId)} •{' '}
                                  {typeLabel}
                                </p>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabel.color}`}
                              >
                                {statusLabel.text}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  AI Prediction:
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                  {aiLabelForRow(screening)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${confidenceColor} rounded-full`}
                                    style={{
                                      width: `${confidence}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {confidence}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                {dateStr}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {timeStr}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Eye size={12} />
                                {screening.imagesCount} images
                              </div>
                              <div className="flex items-center gap-1.5">
                                {getStatusIcon(screening.reviewStatus)}
                                <span className="text-gray-600 dark:text-gray-400">
                                  {formatScreeningRef(screening.screeningId)}
                                </span>
                              </div>
                            </div>

                            {screening.summarySnippet?.trim() ? (
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                                {screening.summarySnippet}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/ophthalmologist/screenings/${screening.screeningId}/review`
                              )
                            }
                            className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-xl transition-colors shrink-0"
                          >
                            {screening.reviewStatus === 'pending-review'
                              ? 'Review'
                              : 'View Details'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
