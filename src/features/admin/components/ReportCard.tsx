import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Report } from '../types/admin.types';

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  const isDecrease = report.status === 'decrease';

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDecrease ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}
        >
          {isDecrease ? (
            <TrendingDown className="text-green-500" size={20} />
          ) : (
            <TrendingUp className="text-blue-500" size={20} />
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-white dark:text-white light:text-gray-900">
            {report.title}
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
            {report.percentage}% {isDecrease ? 'decrease' : 'increase'}
          </p>
        </div>
      </div>
      <div className="relative w-10 h-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#2d4a6f"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke={isDecrease ? '#10b981' : '#3b82f6'}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(report.percentage / 100) * 100} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
