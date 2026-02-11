import { AlertTriangle, Trash2 } from 'lucide-react';
import type {
  UrgentAlert,
  ConditionType,
} from '../types/ophthalmologist.types';

interface UrgentAIAlertsProps {
  alerts: UrgentAlert[];
}

function getConditionStyle(type: ConditionType): { bg: string; text: string } {
  switch (type) {
    case 'glaucoma':
      return { bg: 'bg-rose-500', text: 'text-white' };
    case 'vein-occlusion':
      return { bg: 'bg-amber-500', text: 'text-white' };
    case 'diabetic-retinopathy':
      return { bg: 'bg-orange-500', text: 'text-white' };
    default:
      return { bg: 'bg-gray-500', text: 'text-white' };
  }
}

function getButtonStyle(priority: string): string {
  if (priority === 'critical') {
    return 'bg-cyan-500 hover:bg-cyan-600 text-white';
  }
  return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
}

export default function UrgentAIAlerts({ alerts }: UrgentAIAlertsProps) {
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Urgent AI Alerts
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
            aria-label="Clear all urgent alerts"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
          <button
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            aria-label="View all urgent alerts"
          >
            View all alerts
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => {
          const conditionStyle = getConditionStyle(alert.conditionType);
          const buttonStyle = getButtonStyle(alert.priority);

          return (
            <div
              key={alert.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
            >
              <div className="flex gap-4">
                {/* Eye Scan Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-linear-to-br from-orange-800 to-red-900 shrink-0 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff6b35_0%,#8b0000_50%,#000_100%)] opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-orange-400/50 bg-orange-500/20" />
                  </div>
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {alert.patientName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    ID: {alert.patientId} • {alert.age}y/o
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${conditionStyle.bg} ${conditionStyle.text}`}
                  >
                    {alert.condition}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    AI Confidence
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {alert.aiConfidence}%
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${buttonStyle}`}
                >
                  {alert.priority === 'critical' ? 'Review Now' : 'Verify'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
