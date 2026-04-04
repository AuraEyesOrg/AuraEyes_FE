import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  ChevronRight,
  Download,
  Landmark,
  Radio,
  Stethoscope,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { dashboardApi } from '../api';
import type { SystemAdminDashboardMetrics } from '../types/system-admin.types';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

const DONUT_COLORS = ['#06b6d4', '#14b8a6', '#22c55e', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value: number) =>
  `${Math.round(value).toLocaleString('en-US')} VND`;

/** Axis labels for small VND amounts (avoids everything showing as 0M). */
const formatAxisVnd = (value: number) => {
  const v = Number(value);
  if (!Number.isFinite(v)) return '0';
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}k`;
  return `${Math.round(v)}`;
};

const resolveTrend = (growthPercentage: number): 'up' | 'down' | 'stable' => {
  if (growthPercentage > 0) return 'up';
  if (growthPercentage < 0) return 'down';
  return 'stable';
};

export default function SystemAdminDashboard() {
  const metricsQuery = useQuery<SystemAdminDashboardMetrics>({
    queryKey: ['system-admin-dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
  });

  const metrics = metricsQuery.data;
  const isLoading = metricsQuery.isLoading;
  const [isExporting, setIsExporting] = useState(false);

  const monthlyChartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.monthlyRevenue.map((row, i) => ({
      label: row.label,
      topUps: row.value,
      commission: metrics.monthlyPlatformCommission[i]?.value ?? 0,
    }));
  }, [metrics]);

  const dailyChartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.dailyRevenue.map((row, i) => ({
      label: row.label,
      topUps: row.value,
      commission: metrics.dailyPlatformCommission[i]?.value ?? 0,
    }));
  }, [metrics]);

  const topCards = metrics
    ? [
        {
          title: 'Doctors',
          value: metrics.doctors.total,
          change: metrics.doctors.growthPercentage,
          trend: resolveTrend(metrics.doctors.growthPercentage),
          description: `This month: ${metrics.doctors.currentMonth} · Prev: ${metrics.doctors.previousMonth}`,
          icon: Stethoscope,
          variant: 'primary' as const,
          sparklineData: metrics.monthlyNewDoctorCounts,
          sparklineColor: '#0ea5e9',
        },
        {
          title: 'Organizations',
          value: metrics.organisations.total,
          change: metrics.organisations.growthPercentage,
          trend: resolveTrend(metrics.organisations.growthPercentage),
          description: `This month: ${metrics.organisations.currentMonth} · Prev: ${metrics.organisations.previousMonth}`,
          icon: Building2,
          variant: 'success' as const,
          sparklineData: metrics.monthlyNewOrganisationCounts,
          sparklineColor: '#22c55e',
        },
        {
          title: 'Patients',
          value: metrics.patients.total,
          change: metrics.patients.growthPercentage,
          trend: resolveTrend(metrics.patients.growthPercentage),
          description: `This month: ${metrics.patients.currentMonth} · Prev: ${metrics.patients.previousMonth}`,
          icon: Users,
          variant: 'warning' as const,
          sparklineData: metrics.monthlyNewPatientCounts,
          sparklineColor: '#f59e0b',
        },
        {
          title: 'Live consultations',
          value: metrics.systemStatus.liveConsultationSessions,
          description: 'Sessions with open chat (active window)',
          icon: Radio,
          variant: 'primary' as const,
        },
      ]
    : [];

  const revenueKpiCards = metrics
    ? [
        {
          title: 'Wallet top-ups (YTD)',
          value: formatCurrency(metrics.totalDepositRevenueYear),
          description: 'Completed deposits (calendar year)',
          icon: Wallet,
          variant: 'primary' as const,
          sparklineData: metrics.monthlyRevenue.map((m) => m.value),
          sparklineColor: '#0ea5e9',
        },
        {
          title: 'Consultation commission (YTD)',
          value: formatCurrency(metrics.totalPlatformCommissionYear),
          description: 'Platform share → System wallet',
          icon: Landmark,
          variant: 'success' as const,
          sparklineData: metrics.monthlyPlatformCommission.map((m) => m.value),
          sparklineColor: '#14b8a6',
        },
      ]
    : [];

  const handleExportDashboard = async () => {
    if (!metrics) {
      toast.info('No dashboard data available for export.');
      return;
    }

    try {
      setIsExporting(true);

      const rows = [
        {
          section: 'Users',
          metric: 'Doctors - Total',
          value: metrics.doctors.total,
        },
        {
          section: 'Users',
          metric: 'Doctors - Growth %',
          value: metrics.doctors.growthPercentage,
        },
        {
          section: 'Users',
          metric: 'Organisations - Total',
          value: metrics.organisations.total,
        },
        {
          section: 'Users',
          metric: 'Organisations - Growth %',
          value: metrics.organisations.growthPercentage,
        },
        {
          section: 'Users',
          metric: 'Patients - Total',
          value: metrics.patients.total,
        },
        {
          section: 'Users',
          metric: 'Patients - Growth %',
          value: metrics.patients.growthPercentage,
        },
        {
          section: 'Operations',
          metric: 'Live consultation sessions',
          value: metrics.systemStatus.liveConsultationSessions,
        },
        {
          section: 'Pending',
          metric: 'Ophthalmologist verifications',
          value: metrics.pendingActions.pendingOphthalmologistVerifications,
        },
        {
          section: 'Pending',
          metric: 'Withdrawal requests',
          value: metrics.pendingActions.pendingWithdrawalRequests,
        },
        {
          section: 'Pending',
          metric: 'Organisation onboarding',
          value: metrics.pendingActions.pendingOrganisationOnboarding,
        },
        {
          section: 'Revenue (YTD)',
          metric: 'Wallet top-ups (calendar year)',
          value: metrics.totalDepositRevenueYear,
        },
        {
          section: 'Revenue (YTD)',
          metric: 'Consultation commission (calendar year)',
          value: metrics.totalPlatformCommissionYear,
        },
        ...metrics.paymentMethods.map((item) => ({
          section: 'Payment Methods',
          metric: item.name,
          value: item.value,
        })),
        ...metrics.monthlyRevenue.map((item) => ({
          section: 'Monthly Revenue',
          metric: item.label,
          value: item.value,
        })),
        ...metrics.monthlyPlatformCommission.map((item) => ({
          section: 'Monthly platform commission',
          metric: item.label,
          value: item.value,
        })),
        ...metrics.dailyRevenue.map((item) => ({
          section: 'Daily Revenue',
          metric: item.label,
          value: item.value,
        })),
        ...metrics.dailyPlatformCommission.map((item) => ({
          section: 'Daily platform commission',
          metric: item.label,
          value: item.value,
        })),
      ];

      await downloadXlsxFile(
        rows,
        [
          { header: 'Section', value: (row) => row.section },
          { header: 'Metric', value: (row) => row.metric },
          { header: 'Value', value: (row) => row.value },
        ],
        buildTimestampedFileName('system-admin-dashboard', 'xlsx'),
        'Dashboard'
      );
      toast.success('Dashboard data exported successfully.');
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      toast.error('Failed to export dashboard data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="System Admin Dashboard"
          description="Growth, revenue, queue, and system status"
          actions={
            <button
              onClick={handleExportDashboard}
              disabled={isExporting || !metrics}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          }
          showNotifications={true}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-8 py-5 max-w-[1680px] mx-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size={36} />
              </div>
            ) : !metrics ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                Unable to load live dashboard metrics.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
                <div className="lg:col-span-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[...topCards, ...revenueKpiCards].map((card) => (
                      <StatsCard
                        key={card.title}
                        title={card.title}
                        value={
                          typeof card.value === 'number'
                            ? card.value.toLocaleString('en-US')
                            : card.value
                        }
                        icon={card.icon}
                        change={'change' in card ? card.change : undefined}
                        trend={'trend' in card ? card.trend : undefined}
                        description={card.description}
                        variant={card.variant}
                        sparklineData={card.sparklineData}
                        sparklineColor={card.sparklineColor}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <section className="xl:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm">
                      <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-0.5">
                        Monthly revenue (current year)
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                        Wallet top-ups vs platform commission
                      </p>

                      {monthlyChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                          No data
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#cbd5e1"
                                className="dark:stroke-slate-700"
                              />
                              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                              <YAxis
                                tick={{ fontSize: 11 }}
                                tickFormatter={formatAxisVnd}
                              />
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar
                                dataKey="topUps"
                                name="Wallet top-ups"
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="commission"
                                name="Consultation commission"
                                fill="#14b8a6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </section>

                    <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm">
                      <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-0.5">
                        Payment methods
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                        By total completed deposit amount
                      </p>

                      {metrics.paymentMethods.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                          No data
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.paymentMethods}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={52}
                                outerRadius={80}
                                paddingAngle={2}
                              >
                                {metrics.paymentMethods.map((item, index) => (
                                  <Cell
                                    key={`${item.name}-${index}`}
                                    fill={
                                      DONUT_COLORS[index % DONUT_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </section>
                  </div>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-0.5">
                      Last 7 days — top-ups & commission
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                      Daily movement (recent week)
                    </p>

                    {dailyChartData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                        No data
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#cbd5e1"
                              className="dark:stroke-slate-700"
                            />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              tickFormatter={formatAxisVnd}
                            />
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line
                              type="monotone"
                              dataKey="topUps"
                              name="Wallet top-ups"
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="commission"
                              name="Consultation commission"
                              stroke="#14b8a6"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </section>
                </div>

                <aside className="lg:col-span-4 space-y-4">
                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500" />
                      Pending actions
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-3">
                      Queues that need your attention
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/system-admin/verifications"
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <span>
                            Doctor profile reviews
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              Pending verification
                            </span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold tabular-nums">
                            {
                              metrics.pendingActions
                                .pendingOphthalmologistVerifications
                            }
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/system-admin/withdrawal-requests"
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <span>
                            Withdrawal requests
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              Pending / processing
                            </span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold tabular-nums">
                            {metrics.pendingActions.pendingWithdrawalRequests}
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/system-admin/organisations"
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <span>
                            Organisation onboarding
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              Awaiting approval
                            </span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold tabular-nums">
                            {
                              metrics.pendingActions
                                .pendingOrganisationOnboarding
                            }
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-sm font-bold mb-3">
                      <Link
                        to="/system-admin/status"
                        className="inline-flex items-center gap-1 text-slate-900 dark:text-white hover:text-primary transition-colors"
                      >
                        System status
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          API
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              metrics.systemStatus.apiHealthy
                                ? 'bg-emerald-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            {metrics.systemStatus.apiHealthy
                              ? 'Operational'
                              : 'Issue'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Database
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              metrics.systemStatus.databaseHealthy
                                ? 'bg-emerald-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            {metrics.systemStatus.databaseHealthy
                              ? 'Connected'
                              : 'Unreachable'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-1">
                      Top doctors
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                      By consultation revenue (all time)
                    </p>
                    {metrics.topDoctorsByConsultationRevenue.length === 0 ? (
                      <p className="text-slate-500 text-xs">No data yet</p>
                    ) : (
                      <ol className="space-y-2">
                        {metrics.topDoctorsByConsultationRevenue.map(
                          (d, idx) => (
                            <li
                              key={d.ophthalmologistId}
                              className="flex items-start justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="text-slate-700 dark:text-slate-300 truncate">
                                  <span className="text-slate-400 mr-1.5">
                                    {idx + 1}.
                                  </span>
                                  {d.name || '—'}
                                </div>
                                {d.ratingCount > 0 ? (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    ★ {d.ratingAverage.toFixed(1)}
                                    <span className="text-slate-400 ml-1">
                                      ({d.ratingCount} reviews)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    No ratings yet
                                  </div>
                                )}
                              </div>
                              <span className="text-slate-600 dark:text-slate-400 tabular-nums shrink-0">
                                {formatCurrency(d.revenue)}
                              </span>
                            </li>
                          )
                        )}
                      </ol>
                    )}
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-1">
                      Top organisations
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                      By average rating
                    </p>
                    {metrics.topOrganisationsByRating.length === 0 ? (
                      <p className="text-slate-500 text-xs">No data yet</p>
                    ) : (
                      <ol className="space-y-2">
                        {metrics.topOrganisationsByRating.map((o, idx) => (
                          <li
                            key={o.organisationId}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-slate-700 dark:text-slate-300 truncate">
                              <span className="text-slate-400 mr-1.5">
                                {idx + 1}.
                              </span>
                              {o.name}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 tabular-nums shrink-0">
                              ★ {o.ratingAverage.toFixed(1)}
                              <span className="text-slate-400 ml-1">
                                ({o.ratingCount})
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
