import { useSafeTranslation } from '@/i18n/useSafeTranslation';

export type QueueFilter = 'all' | 'high_risk' | 'waiting_long';

interface QueueFiltersProps {
  active: QueueFilter;
  onChange: (filter: QueueFilter) => void;
  counts: { all: number; highRisk: number; waitingLong: number };
}

export default function QueueFilters({
  active,
  onChange,
  counts,
}: QueueFiltersProps) {
  const { t } = useSafeTranslation();

  const filters: { key: QueueFilter; label: string; count: number }[] = [
    {
      key: 'all',
      label: t('Ophthalmologist.dashboard.filters.all', 'All'),
      count: counts.all,
    },
    {
      key: 'high_risk',
      label: t('Ophthalmologist.dashboard.filters.highRisk', 'High Risk'),
      count: counts.highRisk,
    },
    {
      key: 'waiting_long',
      label: t('Ophthalmologist.dashboard.filters.waitingLong', '> 30 min'),
      count: counts.waitingLong,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`
            inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
            ${
              active === f.key
                ? 'bg-gray-900 text-white dark:bg-cyan-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1a2f4f] dark:text-gray-300 dark:hover:bg-[#243d5f]'
            }
          `}
        >
          {f.label}
          <span
            className={`
              inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold
              ${
                active === f.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-[#2d4a6f] dark:text-gray-400'
              }
            `}
          >
            {f.count}
          </span>
        </button>
      ))}
    </div>
  );
}
