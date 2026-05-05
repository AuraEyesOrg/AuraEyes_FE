import { MoreHorizontal } from 'lucide-react';
import type { FitnessActivityData } from '../types/admin.types';

interface FitnessChartProps {
  data: FitnessActivityData[];
}

export default function FitnessChart({ data }: FitnessChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.water, d.steps, d.calories))
  );

  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
          Fitness Activity
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                Water
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                Steps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8b5cf6] rounded-full"></div>
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                Calories
              </span>
            </div>
          </div>
          <button className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-4">
        {data.map((item) => (
          <div
            key={item.month}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex items-end justify-center gap-1 h-48">
              {item.water > 0 && (
                <div
                  className="w-2 bg-[#3b82f6] rounded-t"
                  style={{ height: `${(item.water / maxValue) * 100}%` }}
                ></div>
              )}
              {item.steps > 0 && (
                <div
                  className="w-2 bg-[#10b981] rounded-t"
                  style={{ height: `${(item.steps / maxValue) * 100}%` }}
                ></div>
              )}
              {item.calories > 0 && (
                <div
                  className="w-2 bg-[#8b5cf6] rounded-t"
                  style={{ height: `${(item.calories / maxValue) * 100}%` }}
                ></div>
              )}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
