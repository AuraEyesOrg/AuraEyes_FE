import { Dumbbell, Brain } from 'lucide-react';
import type { Reminder } from '../types/admin.types';

interface ReminderCardProps {
  reminder: Reminder;
}

const iconMap = {
  dumbbell: Dumbbell,
  brain: Brain,
};

export default function ReminderCard({ reminder }: ReminderCardProps) {
  const Icon = iconMap[reminder.icon as keyof typeof iconMap] || Dumbbell;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div
        className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${reminder.color}20` }}
      >
        <Icon size={24} style={{ color: reminder.color }} />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-1">
          {reminder.duration}
        </h4>
        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
          {reminder.title}
        </p>
      </div>
    </div>
  );
}
