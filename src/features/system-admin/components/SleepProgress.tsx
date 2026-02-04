import type { SleepData } from '../types/admin.types';

interface SleepProgressProps {
  data: SleepData;
}

export default function SleepProgress({ data }: SleepProgressProps) {
  const circumference = 2 * Math.PI * 70;
  const progress = circumference - (data.percentage / 100) * circumference;

  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#2d4a6f"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#13ecec"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
              {data.percentage}%
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
              increment
            </span>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-1">
            Hours of sleep
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            {data.minutesYesterday} mins yesterday
          </p>
        </div>
      </div>
    </div>
  );
}
