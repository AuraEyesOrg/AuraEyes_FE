/**
 * Reusable Stats Card Component
 * Displays key metrics with trends and status indicators
 */

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend = 'stable',
  description,
  variant = 'primary',
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20';
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-slate-50 dark:bg-slate-800/50';
    }
  };

  return (
    <div
      className={`rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm ${getBackgroundColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
            {title}
          </p>
        </div>
        {Icon && (
          <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-slate-900 dark:text-white text-3xl font-bold">
          {value}
        </p>
        {change !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-sm font-semibold ${getTrendColor()}`}
          >
            <span>{getTrendIcon()}</span>
            <span>{Math.abs(change)}%</span>
          </span>
        )}
      </div>

      {description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;

// Legacy interface for backward compatibility
interface LegacyStatsCardProps {
  icon: LucideIcon;
  value: number;
  goal: number;
  unit: string;
  label: string;
  color: string;
}

function _LegacyStatsCard({
  icon: Icon,
  value,
  goal,
  unit: _unit,
  label,
  color,
}: LegacyStatsCardProps) {
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
