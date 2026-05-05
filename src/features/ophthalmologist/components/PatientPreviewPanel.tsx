import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { ReviewQueueItem } from '../api/dashboard.api';

interface PatientPreviewPanelProps {
  item: ReviewQueueItem | null;
}

const riskColorMap: Record<string, string> = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  moderate: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-green-600 dark:text-green-400',
  none: 'text-gray-500 dark:text-gray-400',
};

type TranslateFn = ReturnType<typeof useSafeTranslation>['t'];

function formatWaiting(minutes: number, t: TranslateFn): string {
  if (minutes < 1)
    return t(
      'Ophthalmologist.dashboard.preview.waitingLessThanMinute',
      '<1 min'
    );
  if (minutes < 60) {
    return `${minutes}${t('Ophthalmologist.dashboard.preview.minuteShort', 'm')}`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hourUnit = t('Ophthalmologist.dashboard.preview.hourShort', 'h');
  const minuteUnit = t('Ophthalmologist.dashboard.preview.minuteShort', 'm');
  return m > 0 ? `${h}${hourUnit} ${m}${minuteUnit}` : `${h}${hourUnit}`;
}

export default function PatientPreviewPanel({
  item,
}: PatientPreviewPanelProps) {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();

  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-8 dark:border-[#2d4a6f]">
        <Eye className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          {t(
            'Ophthalmologist.dashboard.preview.empty',
            'Select a patient from the queue to see details'
          )}
        </p>
      </div>
    );
  }

  const isInProgress = item.reviewStatus === 'IN_PROGRESS';
  const riskLower = item.riskLevel.toLowerCase();
  const riskColor = riskColorMap[riskLower] ?? riskColorMap.none;
  const initials = item.patientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-[#0a1929]">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={t(
              'Ophthalmologist.dashboard.preview.retinalScanAlt',
              'Retinal scan'
            )}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Eye className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {isInProgress && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-cyan-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {t('Ophthalmologist.dashboard.preview.inProgress', 'In Progress')}
          </div>
        )}
      </div>

      {/* Patient info */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-[#1a2f4f] dark:text-gray-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {item.patientName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('Ophthalmologist.dashboard.preview.idPrefix', 'ID')}:{' '}
              {item.patientId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {t('Ophthalmologist.dashboard.preview.riskLevel', 'Risk Level')}
            </p>
            <p className={`text-sm font-semibold ${riskColor}`}>
              {(riskLower === 'critical' || riskLower === 'high') && (
                <AlertTriangle className="inline mr-1 h-3.5 w-3.5" />
              )}
              {item.riskLevel}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {t(
                'Ophthalmologist.dashboard.preview.confidence',
                'AI Confidence'
              )}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.confidenceScore > 0
                ? `${item.confidenceScore.toFixed(1)}%`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              <Clock className="inline mr-0.5 h-3 w-3" />
              {t('Ophthalmologist.dashboard.preview.waiting', 'Waiting')}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatWaiting(item.waitingMinutes, t)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              <User className="inline mr-0.5 h-3 w-3" />
              {t('Ophthalmologist.dashboard.preview.session', 'Session')}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.consultationSessionId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* AI Summary */}
        {item.aiSummary && (
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">
              {t('Ophthalmologist.dashboard.preview.aiSummary', 'AI Summary')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
              {item.aiSummary}
            </p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="border-t border-gray-100 p-4 dark:border-[#1e3a5f]">
        <button
          onClick={() =>
            navigate(`/ophthalmologist/screenings/${item.screeningId}/review`)
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-cyan-600 dark:hover:bg-cyan-700"
        >
          {isInProgress ? (
            <>
              <ArrowRight className="h-4 w-4" />
              {t(
                'Ophthalmologist.dashboard.preview.continueReview',
                'Continue Review'
              )}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {t(
                'Ophthalmologist.dashboard.preview.startReview',
                'Start Review'
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
