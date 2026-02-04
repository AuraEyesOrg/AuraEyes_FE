import { Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  text: string;
  dot: string;
} {
  switch (type) {
    case 'macular-degeneration':
      return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
    case 'healthy':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        dot: 'bg-emerald-500',
      };
    case 'microaneurysms':
      return {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        dot: 'bg-violet-500',
      };
    case 'hypertensive':
      return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
    case 'glaucoma':
      return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
    case 'diabetic-retinopathy':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        dot: 'bg-orange-500',
      };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
  }
}

function getStatusStyle(status: PatientStatus): {
  icon: string;
  text: string;
  color: string;
} {
  switch (status) {
    case 'ai-analyzed':
      return { icon: '◉', text: 'AI Analyzed', color: 'text-gray-500' };
    case 'flagged-for-review':
      return { icon: '⚠', text: 'Flagged for Review', color: 'text-amber-500' };
    case 'reviewed':
      return { icon: '✓', text: 'Reviewed', color: 'text-emerald-500' };
    default:
      return { icon: '○', text: 'Pending', color: 'text-gray-400' };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ScreeningQueue({ queue }: ScreeningQueueProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Screening Queue</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Patient Details
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Scan Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Prediction
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {queue.patients.map((patient) => {
              const predictionStyle = getPredictionStyle(
                patient.predictionType
              );
              const statusStyle = getStatusStyle(patient.status);
              const confidenceColor = getConfidenceColor(patient.confidence);

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50/50 transition-colors"
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
                        <p className="font-medium text-gray-800">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {patient.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Scan Date */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {patient.scanDate}
                  </td>

                  {/* AI Prediction */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${predictionStyle.bg} ${predictionStyle.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${predictionStyle.dot}`}
                      />
                      {patient.aiPrediction}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${confidenceColor} rounded-full transition-all`}
                          style={{ width: `${patient.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
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
                          ? 'text-gray-500 hover:text-gray-700'
                          : 'text-cyan-600 hover:text-cyan-700'
                      }`}
                    >
                      {patient.action === 'quick-approve'
                        ? 'Quick Approve'
                        : 'Start Review'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing {queue.showing} of {queue.total} pending reviews
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500">Previous</span>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: queue.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  queue.currentPage === i + 1
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <span className="text-sm text-gray-500">Next</span>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
