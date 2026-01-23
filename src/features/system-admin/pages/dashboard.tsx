/**
 * System Admin Dashboard Page
 * Main overview with KPIs, trends, and monitoring
 */

import { useEffect, useState, useCallback } from 'react';
import { Activity, AlertCircle, Brain, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import StatusBadge, { RiskBadge } from '../components/StatusBadge';
import DataTable, { type TableColumn } from '../components/DataTable';
import { dashboardService } from '../services/dashboard.service';
import type {
  DashboardStats,
  ScreeningVolumeTrend,
  RecentScreening,
  RiskDistribution,
} from '../types/system-admin.types';

interface LoadingState {
  stats: boolean;
  screenings: boolean;
  trends: boolean;
  risks: boolean;
}

// Mock data for demonstration when API is not available
const getMockData = () => ({
  stats: {
    totalScreeningsToday: {
      value: 1240,
      change: 12,
      trend: 'up' as const,
      description: "vs. yesterday's 1,108",
    },
    aiAccuracyRate: {
      value: 98.4,
      change: 0.1,
      trend: 'up' as const,
      description: 'Sensitivity 99.1% | Specificity 97.8%',
    },
    pendingReviews: {
      value: 45,
      change: 5,
      trend: 'down' as const,
      description: '5 flagged as Critical Risk',
    },
    criticalRisks: {
      value: 8,
      change: 2,
      trend: 'up' as const,
      description: 'Requires immediate attention',
    },
  },
  recentScreenings: [
    {
      id: '#SCR-8821',
      clinic: 'Central Cardio',
      date: 'Today',
      time: '10:42 AM',
      aiResult: 'low_risk' as const,
      status: 'completed' as const,
    },
    {
      id: '#SCR-8820',
      clinic: 'Westside Eye',
      date: 'Today',
      time: '10:38 AM',
      aiResult: 'high_risk' as const,
      status: 'flagged' as const,
    },
    {
      id: '#SCR-8819',
      clinic: 'Metro Health',
      date: 'Today',
      time: '10:15 AM',
      aiResult: 'processing' as const,
      status: 'analyzing' as const,
    },
    {
      id: '#SCR-8818',
      clinic: 'Central Cardio',
      date: 'Today',
      time: '09:55 AM',
      aiResult: 'medium_risk' as const,
      status: 'completed' as const,
    },
    {
      id: '#SCR-8817',
      clinic: 'Downtown Clinic',
      date: 'Today',
      time: '09:30 AM',
      aiResult: 'low_risk' as const,
      status: 'completed' as const,
    },
  ],
  volumeTrends: [
    { week: 'Week 1', screenings: 890 },
    { week: 'Week 2', screenings: 1240 },
    { week: 'Week 3', screenings: 980 },
    { week: 'Week 4', screenings: 1100 },
  ],
  riskDistribution: [
    { riskLevel: 'low' as const, count: 856, percentage: 69 },
    { riskLevel: 'medium' as const, count: 248, percentage: 20 },
    { riskLevel: 'high' as const, count: 99, percentage: 8 },
    { riskLevel: 'critical' as const, count: 37, percentage: 3 },
  ],
});

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScreenings, setRecentScreenings] = useState<RecentScreening[]>(
    []
  );
  const [volumeTrends, setVolumeTrends] = useState<ScreeningVolumeTrend[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>(
    []
  );
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    screenings: true,
    trends: true,
    risks: true,
  });

  // Load dashboard data
  const loadData = useCallback(async () => {
    try {
      const [statsData, screeningsData, trendsData, riskData] =
        await Promise.all([
          dashboardService.getStats().catch(() => null),
          dashboardService.getRecentScreenings(5).catch(() => null),
          dashboardService.getScreeningVolume().catch(() => null),
          dashboardService.getRiskDistribution().catch(() => null),
        ]);

      // Use mock data if API not available
      const mockData = getMockData();
      setStats(statsData || mockData.stats);
      setRecentScreenings(screeningsData || mockData.recentScreenings);
      setVolumeTrends(trendsData || mockData.volumeTrends);
      setRiskDistribution(riskData || mockData.riskDistribution);
    } finally {
      setLoading({
        stats: false,
        screenings: false,
        trends: false,
        risks: false,
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentScreeningColumns: TableColumn<RecentScreening>[] = [
    { header: 'ID', accessor: 'id', width: '120px' },
    { header: 'Clinic', accessor: 'clinic' },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (_, row) => `${row.date}, ${row.time}`,
    },
    {
      header: 'AI Result',
      accessor: 'aiResult',
      render: (value) => {
        const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> =
          {
            low_risk: 'low',
            medium_risk: 'medium',
            high_risk: 'high',
            processing: 'critical',
          };
        const labelMap: Record<string, string> = {
          low_risk: 'Low Risk',
          medium_risk: 'Medium Risk',
          high_risk: 'High Risk',
          processing: 'Processing...',
        };
        return (
          <RiskBadge
            risk={riskMap[value as string] || 'low'}
            label={labelMap[value as string]}
          />
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'processing'> =
          {
            completed: 'success',
            flagged: 'warning',
            analyzing: 'processing',
          };
        const labelMap: Record<string, string> = {
          completed: 'Completed',
          flagged: 'Flagged',
          analyzing: 'Analyzing',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={labelMap[value as string] || (value as string)}
          />
        );
      },
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPath="/system-admin/dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Dashboard Overview"
          description="Real-time insights on screening throughput and platform health"
          showNotifications={true}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Screenings Today"
                value={stats?.totalScreeningsToday.value || 0}
                icon={Activity}
                change={stats?.totalScreeningsToday.change}
                trend={stats?.totalScreeningsToday.trend}
                description={stats?.totalScreeningsToday.description}
                variant="primary"
              />
              <StatsCard
                title="AI Accuracy Rate"
                value={stats ? `${stats.aiAccuracyRate.value}%` : '0%'}
                icon={Brain}
                change={stats?.aiAccuracyRate.change}
                trend={stats?.aiAccuracyRate.trend}
                description={stats?.aiAccuracyRate.description}
                variant="success"
              />
              <StatsCard
                title="Pending Reviews"
                value={stats?.pendingReviews.value || 0}
                icon={AlertCircle}
                change={stats?.pendingReviews.change}
                trend={stats?.pendingReviews.trend}
                description={stats?.pendingReviews.description}
                variant="warning"
              />
              <StatsCard
                title="Critical Risk Cases"
                value={stats?.criticalRisks.value || 0}
                icon={Zap}
                change={stats?.criticalRisks.change}
                trend={stats?.criticalRisks.trend}
                description={stats?.criticalRisks.description}
                variant="danger"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Volume Trends & Recent Screenings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Volume Trends Chart */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-slate-900 dark:text-white text-base font-bold">
                        Screening Volume Trends
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Weekly throughput across all clinics
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-teal-800 dark:text-primary">
                        Weekly
                      </button>
                      <button className="px-3 py-1 text-xs font-medium rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Monthly
                      </button>
                    </div>
                  </div>

                  {/* Simple Bar Chart */}
                  <div className="w-full h-48 flex items-end gap-4 justify-between px-4">
                    {volumeTrends.length > 0 ? (
                      volumeTrends.map((trend, idx) => {
                        const maxValue = Math.max(
                          ...volumeTrends.map((t) => t.screenings)
                        );
                        const height = (trend.screenings / maxValue) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center flex-1 gap-2"
                          >
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {trend.screenings.toLocaleString()}
                            </span>
                            <div
                              className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all hover:opacity-80 min-h-[20px]"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {trend.week}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full text-center text-slate-500 py-10">
                        Loading...
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Screenings Table */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-slate-900 dark:text-white text-base font-bold">
                      Recent Screenings
                    </h3>
                    <button className="text-primary hover:opacity-80 text-sm font-semibold transition-opacity">
                      View All
                    </button>
                  </div>
                  <DataTable<RecentScreening>
                    columns={recentScreeningColumns}
                    data={recentScreenings}
                    keyExtractor={(row) => row.id}
                    isLoading={loading.screenings}
                    emptyMessage="No recent screenings"
                  />
                </div>
              </div>

              {/* Right Column: Risk Distribution & System Health */}
              <div className="space-y-6">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-slate-900 dark:text-white text-base font-bold mb-4">
                    Risk Distribution
                  </h3>

                  <div className="space-y-4">
                    {riskDistribution.length > 0 ? (
                      riskDistribution.map((risk, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <RiskBadge risk={risk.riskLevel} />
                            <span className="text-slate-900 dark:text-white font-bold">
                              {risk.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                risk.riskLevel === 'low'
                                  ? 'bg-green-500'
                                  : risk.riskLevel === 'medium'
                                    ? 'bg-amber-500'
                                    : risk.riskLevel === 'high'
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                              }`}
                              style={{ width: `${risk.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {risk.percentage.toFixed(1)}% of screenings
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm py-4">Loading...</p>
                    )}
                  </div>
                </div>

                {/* System Health Card */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-slate-900 dark:text-white text-base font-bold mb-4">
                    System Health
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">
                        Uptime
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        99.9%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">
                        Response Time
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        245ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">
                        CPU Usage
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        42%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">
                        Memory
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        58%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">
                        Storage
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        73%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-gradient-to-br from-primary to-teal-600 p-6 shadow-lg text-slate-900">
                  <h3 className="text-base font-bold mb-2">Quick Actions</h3>
                  <p className="text-sm opacity-80 mb-4">Common admin tasks</p>
                  <div className="space-y-2">
                    <button className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-left">
                      Generate Report
                    </button>
                    <button className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-left">
                      View Audit Logs
                    </button>
                    <button className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-left">
                      Manage Users
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
