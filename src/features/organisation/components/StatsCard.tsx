import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

export default function StatsCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
  color,
}: StatsCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-green-500'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-gray-400';

  return (
    <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f] hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
        )}
      </div>

      <div className="mb-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
    </div>
  );
}
