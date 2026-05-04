import { Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type {
  ScreeningQueue as ScreeningQueueType,
  ConditionType,
  PatientStatus,
} from '../types/ophthalmologist.types';

interface ScreeningQueueProps {
  queue: ScreeningQueueType;
}

function getPredictionStyle(type: ConditionType): {
  bg: string;
  darkBg: string;
  text: string;
  darkText: string;
  dot: string;
} {
  switch (type) {
    case 'macular-degeneration':
      return {
        bg: 'bg-rose-50',
        darkBg: 'dark:bg-rose-900/30',
        text: 'text-rose-600',
        darkText: 'dark:text-rose-400',
        dot: 'bg-rose-500',
      };
    case 'healthy':
      return {
        bg: 'bg-emerald-50',
        darkBg: 'dark:bg-emerald-900/30',
        text: 'text-emerald-600',
        darkText: 'dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'microaneurysms':
      return {
        bg: 'bg-violet-50',
        darkBg: 'dark:bg-violet-900/30',
        text: 'text-violet-600',
        darkText: 'dark:text-violet-400',
        dot: 'bg-violet-500',
      };
    case 'hypertensive':
      return {
        bg: 'bg-red-50',
        darkBg: 'dark:bg-red-900/30',
        text: 'text-red-600',
        darkText: 'dark:text-red-400',
        dot: 'bg-red-500',
      };
    case 'glaucoma':
      return {
        bg: 'bg-amber-50',
        darkBg: 'dark:bg-amber-900/30',
        text: 'text-amber-600',
        darkText: 'dark:text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'diabetic-retinopathy':
      return {
        bg: 'bg-orange-50',
        darkBg: 'dark:bg-orange-900/30',
        text: 'text-orange-600',
        darkText: 'dark:text-orange-400',
        dot: 'bg-orange-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        darkBg: 'dark:bg-gray-800/30',
        text: 'text-gray-600',
        darkText: 'dark:text-gray-400',
        dot: 'bg-gray-500',
      };
  }
}

function getStatusStyle(
  status: PatientStatus,
  t: (key: string, fallback?: string) => string
): {
  icon: string;
  text: string;
  color: string;
} {
  switch (status) {
    case 'ai-analyzed':
      return {
        icon: '◉',
        text: t('Ophthalmologist.screeningQueue.aiAnalyzed', 'AI Analyzed'),
        color: 'text-gray-500 dark:text-gray-400',
      };
    case 'flagged-for-review':
      return {
        icon: '⚠',
        text: t(
          'Ophthalmologist.screeningQueue.flaggedForReview',
          'Flagged for Review'
        ),
        color: 'text-amber-500 dark:text-amber-400',
      };
    case 'reviewed':
      return {
        icon: '✓',
        text: t('Ophthalmologist.screeningQueue.reviewed', 'Reviewed'),
        color: 'text-emerald-500 dark:text-emerald-400',
      };
    default:
      return {
        icon: '○',
        text: t('Ophthalmologist.screeningQueue.pending', 'Pending'),
        color: 'text-gray-400 dark:text-gray-500',
      };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ScreeningQueue({ queue }: ScreeningQueueProps) {
  const { t } = useSafeTranslation();
  return (
    <section className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#1e3a5f]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('Ophthalmologist.screeningQueue.title', 'Screening Queue')}
        </h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
            <Filter size={16} />
            {t('Ophthalmologist.screeningQueue.filter', 'Filter')}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
            <ArrowUpDown size={16} />
            {t('Ophthalmologist.screeningQueue.sort', 'Sort')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-[#0a1929]/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t(
                  'Ophthalmologist.screeningQueue.patientDetails',
                  'Patient Details'
                )}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('Ophthalmologist.screeningQueue.scanDate', 'Scan Date')}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t(
                  'Ophthalmologist.screeningQueue.aiPrediction',
                  'AI Prediction'
                )}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('Ophthalmologist.screeningQueue.confidence', 'Confidence')}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('Ophthalmologist.screeningQueue.status', 'Status')}
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('Ophthalmologist.screeningQueue.action', 'Action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#1e3a5f]">
            {queue.patients.map((patient) => {
              const predictionStyle = getPredictionStyle(
                patient.predictionType
              );
              const statusStyle = getStatusStyle(patient.status, t);
              const confidenceColor = getConfidenceColor(patient.confidence);

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-[#1e3a5f]/50 transition-colors"
                >
                  {/* Patient Details */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: patient.avatarColor }}
                      >
                        {patient.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {patient.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Scan Date */}
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {patient.scanDate}
                  </td>

                  {/* AI Prediction */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${predictionStyle.bg} ${predictionStyle.darkBg} ${predictionStyle.text} ${predictionStyle.darkText}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${predictionStyle.dot}`}
                      />
                      {t(
                        `Ophthalmologist.screeningQueue.${patient.aiPrediction.replace(/\s+/g, '')}`,
                        patient.aiPrediction
                      )}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${confidenceColor} rounded-full transition-all`}
                          style={{ width: `${patient.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {patient.confidence}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${statusStyle.color}`}
                    >
                      <span>{statusStyle.icon}</span>
                      {statusStyle.text}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <button
                      className={`text-sm font-medium transition-colors ${
                        patient.action === 'quick-approve'
                          ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          : 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300'
                      }`}
                    >
                      {patient.action === 'quick-approve'
                        ? t(
                            'Ophthalmologist.screeningQueue.quickApprove',
                            'Quick Approve'
                          )
                        : t(
                            'Ophthalmologist.screeningQueue.startReview',
                            'Start Review'
                          )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-[#1e3a5f]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(
            'Ophthalmologist.screeningQueue.pagination',
            'Showing {{showing}} of {{total}} pending reviews',
            { showing: queue.showing, total: queue.total }
          )}
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('Ophthalmologist.screeningQueue.previous', 'Previous')}
          </span>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: queue.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  queue.currentPage === i + 1
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('Ophthalmologist.screeningQueue.next', 'Next')}
          </span>
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
