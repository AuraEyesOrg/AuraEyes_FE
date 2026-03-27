import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  Landmark,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import StatusBadge, { RiskBadge } from '../components/StatusBadge';
import DataTable, { type TableColumn } from '../components/DataTable';
import { dashboardApi } from '../api';
import type {
  DashboardStats,
  RecentScreening,
  RiskDistribution,
} from '../types/system-admin.types';

export default function SystemAdminDashboard() {
  const statsQuery = useQuery<DashboardStats>({
    queryKey: ['system-admin-dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  const recentScreeningsQuery = useQuery<RecentScreening[]>({
    queryKey: ['system-admin-dashboard', 'recent-screenings'],
    queryFn: () => dashboardApi.getRecentScreenings(5),
  });

  const riskQuery = useQuery<RiskDistribution[]>({
    queryKey: ['system-admin-dashboard', 'risks'],
    queryFn: dashboardApi.getRiskDistribution,
  });

  const healthQuery = useQuery({
    queryKey: ['system-admin-dashboard', 'health'],
    queryFn: dashboardApi.getSystemHealth,
  });

  const stats = statsQuery.data;
  const recentScreenings = recentScreeningsQuery.data ?? [];
  const riskDistribution = riskQuery.data ?? [];
  const isLoading =
    statsQuery.isLoading ||
    recentScreeningsQuery.isLoading ||
    riskQuery.isLoading;

  const recentScreeningColumns: TableColumn<RecentScreening>[] = [
    { header: 'ID', accessor: 'id', width: '140px' },
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
          processing: 'Processing',
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
            label={labelMap[value as string] || String(value)}
          />
        );
      },
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Dashboard Overview"
          description="Global cashflow metrics, payment methods, and platform health"
          badge={
            <StatusBadge
              status={healthQuery.data?.uptime === 100 ? 'success' : 'warning'}
              label={
                healthQuery.data?.uptime === 100
                  ? 'System Healthy'
                  : 'Attention Needed'
              }
            />
          }
          showNotifications={true}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size={36} />
              </div>
            ) : !stats ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                Unable to load live dashboard metrics.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total Inflow"
                    value={`${Number(stats.totalInflow.value || 0).toLocaleString('vi-VN')} VND`}
                    icon={ArrowUpCircle}
                    change={stats.totalInflow.change}
                    trend={stats.totalInflow.trend}
                    description={stats.totalInflow.description}
                    variant="primary"
                  />
                  <StatsCard
                    title="Total Outflow"
                    value={`${Number(stats.totalOutflow.value || 0).toLocaleString('vi-VN')} VND`}
                    icon={ArrowDownCircle}
                    change={stats.totalOutflow.change}
                    trend={stats.totalOutflow.trend}
                    description={stats.totalOutflow.description}
                    variant="warning"
                  />
                  <StatsCard
                    title="Net Cashflow"
                    value={`${Number(stats.netCashflow.value || 0).toLocaleString('vi-VN')} VND`}
                    icon={Landmark}
                    change={stats.netCashflow.change}
                    trend={stats.netCashflow.trend}
                    description={stats.netCashflow.description}
                    variant="success"
                  />
                  <StatsCard
                    title="Estimated Commission"
                    value={`${Number(stats.estimatedCommission.value || 0).toLocaleString('vi-VN')} VND`}
                    icon={HandCoins}
                    change={stats.estimatedCommission.change}
                    trend={stats.estimatedCommission.trend}
                    description={stats.estimatedCommission.description}
                    variant="primary"
                  />
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Refund Outflow
                  </p>
                  <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
                    {Number(stats.refundOutflow.value || 0).toLocaleString(
                      'vi-VN'
                    )}{' '}
                    VND
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-slate-900 dark:text-white text-base font-bold">
                            Inflow by Payment Method
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Completed top-up cashflow grouped by payment
                            provider
                          </p>
                        </div>
                        <StatusBadge status="info" label="Live Data" />
                      </div>

                      <div className="space-y-4">
                        {stats.paymentMethodBreakdown.length > 0 ? (
                          stats.paymentMethodBreakdown.map((method) => (
                            <div
                              key={method.paymentMethod}
                              className="space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {method.paymentMethod}
                                </span>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {method.amount.toLocaleString('vi-VN')} VND
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {method.percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full bg-gradient-to-r from-primary to-teal-500"
                                  style={{
                                    width: `${Math.min(100, method.percentage)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm py-6 text-center">
                            No completed inflow records yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-slate-900 dark:text-white text-base font-bold">
                          Recent Screenings
                        </h3>
                        <StatusBadge status="info" label="Live Feed" />
                      </div>
                      <DataTable<RecentScreening>
                        columns={recentScreeningColumns}
                        data={recentScreenings}
                        keyExtractor={(row) => row.id}
                        isLoading={recentScreeningsQuery.isLoading}
                        emptyMessage="No recent screenings"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="text-slate-900 dark:text-white text-base font-bold mb-4">
                        Risk Distribution
                      </h3>

                      <div className="space-y-4">
                        {riskDistribution.length > 0 ? (
                          riskDistribution.map((risk) => (
                            <div key={risk.riskLevel} className="space-y-2">
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
                          <p className="text-slate-500 text-sm py-4">
                            No risk distribution available.
                          </p>
                        )}
                      </div>
                    </div>

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
                            {healthQuery.data?.uptime ?? 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            Response Time
                          </span>
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {healthQuery.data?.responseTime ?? 0}ms
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            CPU Usage
                          </span>
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {healthQuery.data?.cpuUsage ?? 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            Memory
                          </span>
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {healthQuery.data?.memoryUsage ?? 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            Storage
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {healthQuery.data?.storageUsage ?? 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-primary to-teal-600 p-6 shadow-lg text-slate-900">
                      <h3 className="text-base font-bold mb-2">
                        Quick Actions
                      </h3>
                      <p className="text-sm opacity-80 mb-4">
                        Operational shortcuts
                      </p>
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
