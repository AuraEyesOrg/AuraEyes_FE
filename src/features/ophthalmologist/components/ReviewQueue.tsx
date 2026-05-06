import { useNavigate } from 'react-router-dom';
import { Clock, Play, ArrowRight, Inbox, AlertTriangle } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { ReviewQueueItem } from '../api/dashboard.api';

interface ReviewQueueProps {
  items: ReviewQueueItem[];
  selectedId: string | null;
  onSelect: (item: ReviewQueueItem) => void;
}

function getRiskLabel(
  risk: string,
  t: (key: string, fallback?: string) => string
) {
  const normalized = risk.trim().toLowerCase();
  if (normalized === 'critical') {
    return t('Ophthalmologist.screenings.risk.critical', 'Critical');
  }
  if (normalized === 'high') {
    return t('Ophthalmologist.screenings.risk.high', 'High Risk');
  }
  if (normalized === 'moderate' || normalized === 'medium') {
    return t('Ophthalmologist.screenings.risk.medium', 'Medium Risk');
  }
  if (normalized === 'low') {
    return t('Ophthalmologist.screenings.risk.low', 'Low Risk');
  }
  return t('Ophthalmologist.screenings.risk.unknown', 'Unknown');
}

const riskBadgeClass = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  }
};

const urgentBorderClass = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'critical':
      return 'border-l-4 border-l-red-500';
    case 'high':
      return 'border-l-4 border-l-orange-500';
    default:
      return 'border-l-4 border-l-transparent';
  }
};

function formatWaiting(minutes: number): string {
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ReviewQueue({
  items,
  selectedId,
  onSelect,
}: ReviewQueueProps) {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-10 dark:border-[#2d4a6f]">
        <Inbox className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t(
            'Ophthalmologist.dashboard.queue.empty',
            'No patients waiting for review'
          )}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {t(
            'Ophthalmologist.dashboard.queue.emptyHint',
            'New cases will appear here when patients are assigned to you.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isSelected = selectedId === item.consultationSessionId;
        const isInProgress = item.reviewStatus === 'IN_PROGRESS';
        const isCriticalOrHigh =
          item.riskLevel.toLowerCase() === 'critical' ||
          item.riskLevel.toLowerCase() === 'high';

        return (
          <div
            key={item.consultationSessionId}
            onClick={() => onSelect(item)}
            className={`
              group relative cursor-pointer rounded-xl border p-4 transition-all duration-150
              ${urgentBorderClass(item.riskLevel)}
              ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-sm dark:border-cyan-600 dark:bg-cyan-950/30'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:hover:border-[#2d4a6f]'
              }
            `}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-[#1a2f4f] dark:text-gray-300">
                  {item.patientName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {item.patientName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskBadgeClass(item.riskLevel)}`}
                    >
                      {isCriticalOrHigh && (
                        <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                      )}
                      {getRiskLabel(item.riskLevel, t)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatWaiting(item.waitingMinutes)}
                    </span>
                    {item.confidenceScore > 0 && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {item.confidenceScore.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    `/ophthalmologist/screenings/${item.screeningId}/review`
                  );
                }}
                className={`
                  shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
                  ${
                    isInProgress
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-cyan-600 dark:hover:bg-cyan-700'
                  }
                `}
              >
                {isInProgress ? (
                  <>
                    <ArrowRight className="h-3.5 w-3.5" />
                    {t('Ophthalmologist.dashboard.queue.continue', 'Continue')}
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    {t(
                      'Ophthalmologist.dashboard.queue.startReview',
                      'Start Review'
                    )}
                  </>
                )}
              </button>
            </div>

            {isInProgress && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  {t(
                    'Ophthalmologist.dashboard.queue.inProgress',
                    'In Progress'
                  )}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
