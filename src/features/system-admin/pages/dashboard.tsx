import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Building2, Download, Stethoscope, Users } from 'lucide-react';
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

  const topCards = metrics
    ? [
        {
          title: 'Doctors',
          value: metrics.doctors.total,
          change: metrics.doctors.growthPercentage,
          trend: resolveTrend(metrics.doctors.growthPercentage),
          description: `This month: ${metrics.doctors.currentMonth} | Previous month: ${metrics.doctors.previousMonth}`,
          icon: Stethoscope,
          variant: 'primary' as const,
        },
        {
          title: 'Organizations',
          value: metrics.organisations.total,
          change: metrics.organisations.growthPercentage,
          trend: resolveTrend(metrics.organisations.growthPercentage),
          description: `This month: ${metrics.organisations.currentMonth} | Previous month: ${metrics.organisations.previousMonth}`,
          icon: Building2,
          variant: 'success' as const,
        },
        {
          title: 'Patients',
          value: metrics.patients.total,
          change: metrics.patients.growthPercentage,
          trend: resolveTrend(metrics.patients.growthPercentage),
          description: `This month: ${metrics.patients.currentMonth} | Previous month: ${metrics.patients.previousMonth}`,
          icon: Users,
          variant: 'warning' as const,
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
        ...metrics.dailyRevenue.map((item) => ({
          section: 'Daily Revenue',
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
          description="Overview of user growth and real revenue"
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
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size={36} />
              </div>
            ) : !metrics ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                Unable to load live dashboard metrics.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topCards.map((card) => (
                    <StatsCard
                      key={card.title}
                      title={card.title}
                      value={card.value.toLocaleString('en-US')}
                      icon={card.icon}
                      change={card.change}
                      trend={card.trend}
                      description={card.description}
                      variant={card.variant}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <section className="xl:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-base font-bold mb-1">
                      Monthly Revenue
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                      Real revenue data for the current year
                    </p>

                    {metrics.monthlyRevenue.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                        No data
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.monthlyRevenue}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#cbd5e1"
                            />
                            <XAxis dataKey="label" />
                            <YAxis
                              tickFormatter={(value) =>
                                `${Math.round(value / 1_000_000)}M`
                              }
                            />
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              name="Revenue"
                              fill="#0ea5e9"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-base font-bold mb-1">
                      Payment Method Breakdown
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                      Total amount grouped by payment method
                    </p>

                    {metrics.paymentMethods.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                        No data
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metrics.paymentMethods}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={70}
                              outerRadius={110}
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
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </section>
                </div>

                <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-slate-900 dark:text-white text-base font-bold mb-1">
                    Last 7 Days Revenue Trend
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Daily revenue movement over the most recent 7 days
                  </p>

                  {metrics.dailyRevenue.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                      No data
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.dailyRevenue}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#cbd5e1"
                          />
                          <XAxis dataKey="label" />
                          <YAxis
                            tickFormatter={(value) =>
                              `${Math.round(value / 1_000_000)}M`
                            }
                          />
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Revenue"
                            stroke="#14b8a6"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
