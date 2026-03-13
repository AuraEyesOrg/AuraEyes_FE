import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';

// Mock analytics data
const weeklyStats = {
  screenings: { value: 156, change: 12.5, trend: 'up' as const },
  patientsServed: { value: 142, change: 8.3, trend: 'up' as const },
  avgReviewTime: { value: '4.2 min', change: -15.2, trend: 'down' as const },
  aiAccuracy: { value: '94.8%', change: 2.1, trend: 'up' as const },
};

const conditionBreakdown = [
  { name: 'Healthy', count: 87, percentage: 56, color: '#10b981' },
  { name: 'Diabetic Retinopathy', count: 28, percentage: 18, color: '#f59e0b' },
  { name: 'Macular Degeneration', count: 18, percentage: 12, color: '#8b5cf6' },
  { name: 'Glaucoma', count: 12, percentage: 8, color: '#ec4899' },
  { name: 'Hypertensive', count: 11, percentage: 7, color: '#ef4444' },
];

const weeklyActivity = [
  { day: 'Mon', screenings: 24, reviews: 22 },
  { day: 'Tue', screenings: 31, reviews: 28 },
  { day: 'Wed', screenings: 28, reviews: 27 },
  { day: 'Thu', screenings: 35, reviews: 32 },
  { day: 'Fri', screenings: 29, reviews: 26 },
  { day: 'Sat', screenings: 9, reviews: 8 },
  { day: 'Sun', screenings: 0, reviews: 0 },
];

const recentActivity = [
  {
    type: 'review',
    message: 'Reviewed screening for Elena Miller',
    time: '10 min ago',
    icon: CheckCircle,
    color: 'text-emerald-500',
  },
  {
    type: 'flag',
    message: 'Flagged case for Sarah Jenkins',
    time: '25 min ago',
    icon: AlertTriangle,
    color: 'text-amber-500',
  },
  {
    type: 'screening',
    message: 'New screening received from David Kim',
    time: '1 hour ago',
    icon: Eye,
    color: 'text-blue-500',
  },
  {
    type: 'ai',
    message: 'AI detected potential glaucoma in patient #48325',
    time: '2 hours ago',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    type: 'review',
    message: 'Approved screening for Marcus Wright',
    time: '3 hours ago',
    icon: CheckCircle,
    color: 'text-emerald-500',
  },
];

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  iconBg: string;
}

function StatCard({
  icon,
  title,
  value,
  change,
  trend,
  iconBg,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
        >
          {trend === 'up' ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const maxScreenings = Math.max(...weeklyActivity.map((d) => d.screenings));

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={12} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Analytics" />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Performance metrics and insights
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={
                <Eye className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              }
              title="Screenings This Week"
              value={weeklyStats.screenings.value}
              change={weeklyStats.screenings.change}
              trend={weeklyStats.screenings.trend}
              iconBg="bg-cyan-50 dark:bg-cyan-900/30"
            />
            <StatCard
              icon={
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              }
              title="Patients Served"
              value={weeklyStats.patientsServed.value}
              change={weeklyStats.patientsServed.change}
              trend={weeklyStats.patientsServed.trend}
              iconBg="bg-purple-50 dark:bg-purple-900/30"
            />
            <StatCard
              icon={
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              }
              title="Avg Review Time"
              value={weeklyStats.avgReviewTime.value}
              change={Math.abs(weeklyStats.avgReviewTime.change)}
              trend={weeklyStats.avgReviewTime.trend}
              iconBg="bg-amber-50 dark:bg-amber-900/30"
            />
            <StatCard
              icon={
                <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              }
              title="AI Accuracy"
              value={weeklyStats.aiAccuracy.value}
              change={weeklyStats.aiAccuracy.change}
              trend={weeklyStats.aiAccuracy.trend}
              iconBg="bg-emerald-50 dark:bg-emerald-900/30"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Weekly Activity Chart */}
            <div className="col-span-2 bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Weekly Activity
              </h3>
              <div className="flex items-end justify-between gap-3 h-36">
                {weeklyActivity.map((day) => (
                  <div
                    key={day.day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex flex-col items-center gap-0.5 h-28 justify-end">
                      <div
                        className="w-6 bg-cyan-500 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max((day.screenings / maxScreenings) * 100, 0)}px`,
                        }}
                        title={`${day.screenings} screenings`}
                      />
                      <div
                        className="w-6 bg-cyan-200 rounded-b-sm transition-all"
                        style={{
                          height: `${Math.max((day.reviews / maxScreenings) * 100, 0)}px`,
                        }}
                        title={`${day.reviews} reviews`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {day.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Screenings
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-200 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reviews Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                Condition Breakdown
              </h3>
              <div className="space-y-4">
                {conditionBreakdown.map((condition) => (
                  <div key={condition.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {condition.name}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {condition.count}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${condition.percentage}%`,
                          backgroundColor: condition.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* AI Performance */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                AI Model Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Accuracy Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    94.8%
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    +2.1% from last week
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    False Positives
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    3.2%
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    -0.8% from last week
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Processing Time
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    1.2s
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Per image average
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Model Version
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    v2.4
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    Latest available
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gray-50 dark:bg-[#0a1929] ${activity.color}`}
                    >
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
