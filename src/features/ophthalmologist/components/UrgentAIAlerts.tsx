import { AlertTriangle } from 'lucide-react';
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
  return 'bg-gray-100 dark:bg-[#1e3a5f] hover:bg-gray-200 dark:hover:bg-[#2d4a6f] text-gray-700 dark:text-gray-300';
}

export default function UrgentAIAlerts({ alerts }: UrgentAIAlertsProps) {
  return (
    <section className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Urgent AI Alerts
          </h2>
        </div>
        <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors">
          View all
        </button>
      </div>

      {/* Alert Cards - Vertical Stack for sidebar layout */}
      <div className="space-y-4">
        {alerts.slice(0, 3).map((alert) => {
          const conditionStyle = getConditionStyle(alert.conditionType);
          const buttonStyle = getButtonStyle(alert.priority);

          return (
            <div
              key={alert.id}
              className="bg-gray-50 dark:bg-[#0a1929] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300"
            >
              <div className="flex gap-3">
                {/* Eye Scan Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-linear-to-br from-orange-800 to-red-900 shrink-0 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff6b35_0%,#8b0000_50%,#000_100%)] opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-400/50 bg-orange-500/20" />
                  </div>
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate text-sm">
                    {alert.patientName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ID: {alert.patientId} • {alert.age}y/o
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${conditionStyle.bg} ${conditionStyle.text}`}
                  >
                    {alert.condition}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-[#1e3a5f]">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    AI Confidence
                  </p>
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    {alert.aiConfidence}%
                  </p>
                </div>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${buttonStyle}`}
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
