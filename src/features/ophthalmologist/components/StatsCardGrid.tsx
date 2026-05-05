import { FileText, CheckCircle } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { DashboardStats } from '../types/ophthalmologist.types';

interface StatsCardGridProps {
  stats: DashboardStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBgClass: string;
  accentColor: string;
}

function StatCard({
  icon,
  label,
  value,
  iconBgClass,
  accentColor,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300 group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${iconBgClass}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className="w-16 h-10 rounded-full opacity-20"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}

export default function StatsCardGrid({ stats }: StatsCardGridProps) {
  const { t } = useSafeTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
        label={t('Ophthalmologist.dashboard.stats.pending', 'Pending Reviews')}
        value={stats.pendingReviews}
        iconBgClass="bg-cyan-50 dark:bg-cyan-900/30"
        accentColor="#00bcd4"
      />
      <StatCard
        icon={
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        }
        label={t(
          'Ophthalmologist.dashboard.stats.completed',
          'Completed Today'
        )}
        value={stats.completedToday}
        iconBgClass="bg-green-50 dark:bg-green-900/30"
        accentColor="#4caf50"
      />
    </div>
  );
}
