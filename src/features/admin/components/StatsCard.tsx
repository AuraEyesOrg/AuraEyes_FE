import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  goal: number;
  unit: string;
  label: string;
  color: string;
}

export default function StatsCard({
  icon: Icon,
  value,
  goal,
  unit,
  label,
  color,
}: StatsCardProps) {
  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>

      <div className="mb-1">
        <span className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
          {value}
        </span>
        <span className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">
          /{goal}
        </span>
      </div>

      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
        {label}
      </p>
    </div>
  );
}
