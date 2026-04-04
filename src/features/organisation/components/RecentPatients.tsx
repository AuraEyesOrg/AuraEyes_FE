// Inline type formerly from organisation.types.ts
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  lastScreening: string;
  aiPrediction: string;
  confidence: number;
  status: string;
  priority: string;
}
import { Clock, AlertCircle } from 'lucide-react';

interface RecentPatientsProps {
  patients: Patient[];
}

export default function RecentPatients({ patients }: RecentPatientsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-review':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
            Pending
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
            Reviewed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Patients
        </h3>
        <button className="text-primary hover:text-primary/80 transition-colors text-sm">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f] hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {patient.name.charAt(0)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {patient.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ID: {patient.id} • {patient.age}y • {patient.gender}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${getPriorityColor(patient.priority)}`}
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {patient.aiPrediction}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  ({patient.confidence}% confidence)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock size={12} />
                  {new Date(patient.lastScreening).toLocaleDateString('vi-VN')}
                </div>
                {getStatusBadge(patient.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
