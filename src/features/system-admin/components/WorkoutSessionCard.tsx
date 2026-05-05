import { MoreHorizontal } from 'lucide-react';
import type { WorkoutSession } from '../types/admin.types';

interface WorkoutSessionCardProps {
  session: WorkoutSession;
}

export default function WorkoutSessionCard({
  session,
}: WorkoutSessionCardProps) {
  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-4 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-base font-semibold text-white dark:text-white light:text-gray-900">
          {session.title}
        </h4>
        <button className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">
        {session.time}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-500">
        {session.coach}
      </p>
    </div>
  );
}
