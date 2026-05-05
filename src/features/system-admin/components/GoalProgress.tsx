import type { GoalProgress as GoalProgressType } from '../types/admin.types';

interface GoalProgressProps {
  progress: GoalProgressType;
}

export default function GoalProgress({ progress }: GoalProgressProps) {
  const percentage = (progress.achieved / progress.total) * 100;

  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {Array.from({ length: 100 }).map((_, i) => {
              const angle = (i * 3.6 - 90) * (Math.PI / 180);
              const x1 = 100 + 85 * Math.cos(angle);
              const y1 = 100 + 85 * Math.sin(angle);
              const x2 = 100 + 95 * Math.cos(angle);
              const y2 = 100 + 95 * Math.sin(angle);
              const isActive = i < percentage;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? '#13ecec' : '#2d4a6f'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white dark:text-white light:text-gray-900">
              {progress.achieved}%
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
          You have achieved {progress.achieved}% of your goals {progress.month}
        </p>
      </div>
    </div>
  );
}
