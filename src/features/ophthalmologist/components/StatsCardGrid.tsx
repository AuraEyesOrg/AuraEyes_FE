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
  accentColor: string;
}

function StatCard({
  icon,
  label,
  value,
  iconBgColor,
  accentColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: iconBgColor }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
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
        icon={<FileText className="w-6 h-6 text-cyan-600" />}
        label="Pending Reviews"
        value={stats.pendingReviews}
        iconBgColor="#e0f7fa"
        accentColor="#00bcd4"
      />
      <StatCard
        icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
        label="Urgent Cases"
        value={stats.urgentCases}
        iconBgColor="#ffebee"
        accentColor="#f44336"
      />
      <StatCard
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        label="Completed Today"
        value={stats.completedToday}
        iconBgColor="#e8f5e9"
        accentColor="#4caf50"
      />
    </div>
  );
}
