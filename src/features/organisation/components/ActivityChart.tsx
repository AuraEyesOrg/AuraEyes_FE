import { ScreeningActivityData } from '../types/organisation.types';

interface ActivityChartProps {
  data: ScreeningActivityData[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.screenings, d.predictions, d.reviewed))
  );

  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
          Screening Activity
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              Screenings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              AI Predictions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              Reviewed
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-4">
        {data.map((item) => (
          <div
            key={item.month}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex items-end justify-center gap-1 h-52">
              <div
                className="flex-1 bg-blue-500 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(item.screenings / maxValue) * 100}%`,
                  minHeight: '4px',
                }}
              />
              <div
                className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(item.predictions / maxValue) * 100}%`,
                  minHeight: '4px',
                }}
              />
              <div
                className="flex-1 bg-purple-500 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(item.reviewed / maxValue) * 100}%`,
                  minHeight: '4px',
                }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
