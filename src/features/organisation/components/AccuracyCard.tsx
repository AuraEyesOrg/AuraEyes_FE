import { PredictionAccuracy } from '../types/organisation.types';

interface AccuracyCardProps {
  accuracy: PredictionAccuracy;
}

export default function AccuracyCard({ accuracy }: AccuracyCardProps) {
  const conditions = [
    {
      key: 'diabeticRetinopathy',
      label: 'Diabetic Retinopathy',
      value: accuracy.byCondition.diabeticRetinopathy,
    },
    {
      key: 'glaucoma',
      label: 'Glaucoma',
      value: accuracy.byCondition.glaucoma,
    },
    {
      key: 'macularDegeneration',
      label: 'Macular Degeneration',
      value: accuracy.byCondition.macularDegeneration,
    },
    {
      key: 'hypertensiveRetinopathy',
      label: 'Hypertensive Retinopathy',
      value: accuracy.byCondition.hypertensiveRetinopathy,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        AI Prediction Accuracy
      </h3>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - accuracy.overall / 100)}`}
              className="text-primary"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {accuracy.overall}%
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Overall
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {conditions.map((condition) => (
          <div key={condition.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {condition.label}
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {condition.value}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-blue-400 rounded-full transition-all"
                style={{ width: `${condition.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
