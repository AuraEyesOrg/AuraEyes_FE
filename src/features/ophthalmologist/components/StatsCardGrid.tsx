import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import type { DashboardStats } from '../types/ophthalmologist.types';

interface StatsCardGridProps {
  stats: DashboardStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBgColor: string;
  darkIconBgColor: string;
  accentColor: string;
}

function StatCard({
  icon,
  label,
  value,
  iconBgColor,
  darkIconBgColor,
  accentColor,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300 group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
        style={
          {
            '--light-bg': iconBgColor,
            '--dark-bg': darkIconBgColor,
          } as React.CSSProperties
        }
      >
        <div
          className="w-full h-full rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <div
            className="hidden dark:flex w-full h-full rounded-xl items-center justify-center absolute"
            style={{ backgroundColor: darkIconBgColor }}
          ></div>
          {icon}
        </div>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        icon={<FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
        label="Pending Reviews"
        value={stats.pendingReviews}
        iconBgColor="#e0f7fa"
        darkIconBgColor="#164e63"
        accentColor="#00bcd4"
      />
      <StatCard
        icon={
          <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
        }
        label="Urgent Cases"
        value={stats.urgentCases}
        iconBgColor="#ffebee"
        darkIconBgColor="#7f1d1d"
        accentColor="#f44336"
      />
      <StatCard
        icon={
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        }
        label="Completed Today"
        value={stats.completedToday}
        iconBgColor="#e8f5e9"
        darkIconBgColor="#14532d"
        accentColor="#4caf50"
      />
    </div>
  );
}
