import { Appointment } from '../types/organisation.types';
import { Calendar, Clock, User } from 'lucide-react';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Screening':
        return 'text-blue-500 bg-blue-500/20';
      case 'Follow-up':
        return 'text-green-500 bg-green-500/20';
      case 'Consultation':
        return 'text-purple-500 bg-purple-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upcoming Appointments
        </h3>
        <button className="text-primary hover:text-primary/80 transition-colors text-sm">
          View calendar
        </button>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f] hover:border-primary transition-colors cursor-pointer"
          >
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {appointment.patientName}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {appointment.time}
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} />
                  {appointment.doctor.replace('Dr. ', '')}
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(appointment.type)}`}
            >
              {appointment.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
