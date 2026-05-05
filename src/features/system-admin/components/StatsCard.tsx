/**
 * Reusable Stats Card Component
 * Displays key metrics with trends and optional sparkline
 */

import { LucideIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Y values for a tiny trend line (no axes). */
  sparklineData?: number[];
  sparklineColor?: string;
  /** Tighter padding and smaller value text */
  compact?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend = 'stable',
  description,
  variant = 'primary',
  sparklineData,
  sparklineColor = '#0ea5e9',
  compact = false,
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

  const sparklineChartData = sparklineData?.map((y, i) => ({ i, y })) ?? [];

  const showSparkline =
    sparklineChartData.length > 1 &&
    sparklineChartData.some((d) => d.y !== sparklineChartData[0].y);

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${getBackgroundColor()} ${
        compact ? 'p-3.5' : 'p-6'
      }`}
    >
      <div
        className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-3'}`}
      >
        <p
          className={`text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider leading-tight ${
            compact ? 'text-[10px]' : 'text-sm'
          }`}
        >
          {title}
        </p>
        {Icon && (
          <Icon
            className={`shrink-0 text-slate-400 dark:text-slate-500 ${
              compact ? 'w-4 h-4' : 'w-5 h-5'
            }`}
          />
        )}
      </div>

      <div className="flex min-w-0 items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <p
              className={`min-w-0 break-words leading-tight text-slate-900 dark:text-white font-bold tabular-nums ${
                compact ? 'text-xl' : 'text-3xl'
              }`}
            >
              {value}
            </p>
            {change !== undefined && (
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${getTrendColor()}`}
              >
                <span>{getTrendIcon()}</span>
                <span>{Math.abs(change)}%</span>
              </span>
            )}
          </div>
          {description && (
            <p
              className={`text-slate-500 dark:text-slate-400 mt-1 leading-snug ${
                compact ? 'text-[11px]' : 'text-sm'
              }`}
            >
              {description}
            </p>
          )}
        </div>
        {showSparkline ? (
          <div
            className={`shrink-0 opacity-90 ${
              compact ? 'w-20 h-9' : 'w-28 h-12'
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sparklineChartData}
                margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
              >
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatsCard;
