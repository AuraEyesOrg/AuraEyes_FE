import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Building2,
  ChevronRight,
  Download,
  FileText,
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
import type {
  SystemAdminDashboardMetrics,
  SystemAdminPartTimeSlotQuotaUsage,
} from '../types/system-admin.types';
import {
  buildTimestampedFileName,
  downloadPdfTableFile,
  downloadXlsxFile,
} from '@/lib/file-export';
import { extractApiErrorMessage } from '@/lib/api-error';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const DONUT_COLORS = ['#06b6d4', '#14b8a6', '#22c55e', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value: number, locale: 'en-US' | 'vi-VN') =>
  `${Math.round(value).toLocaleString(locale)} VND`;

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

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (baseDate: Date, days: number) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDayLabel = (date: string, locale: 'en-US' | 'vi-VN') => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  });
};

export default function SystemAdminDashboard() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const locale: 'en-US' | 'vi-VN' = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';

  const [quotaFromDate, setQuotaFromDate] = useState(() =>
    toDateOnly(new Date())
  );
  const [quotaToDate, setQuotaToDate] = useState(() =>
    toDateOnly(addDays(new Date(), 13))
  );

  const normalizedQuotaRange = useMemo(() => {
    if (quotaFromDate <= quotaToDate) {
      return {
        fromDate: quotaFromDate,
        toDate: quotaToDate,
      };
    }

    return {
      fromDate: quotaToDate,
      toDate: quotaFromDate,
    };
  }, [quotaFromDate, quotaToDate]);

  const metricsQuery = useQuery<SystemAdminDashboardMetrics>({
    queryKey: ['system-admin-dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
  });

  const quotaUsageQuery = useQuery<SystemAdminPartTimeSlotQuotaUsage[]>({
    queryKey: [
      'system-admin-dashboard',
      'part-time-slot-usage',
      normalizedQuotaRange.fromDate,
      normalizedQuotaRange.toDate,
    ],
    queryFn: () =>
      dashboardApi.getPartTimeSlotUsage(
        normalizedQuotaRange.fromDate,
        normalizedQuotaRange.toDate
      ),
  });

  const metrics = metricsQuery.data;
  const quotaUsageRows = quotaUsageQuery.data ?? [];
  const isLoading = metricsQuery.isLoading;
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const usedLabel = t('SystemAdmin.dashboard.quotaUsage.chart.used', 'Used');
  const remainingLabel = t(
    'SystemAdmin.dashboard.quotaUsage.chart.remaining',
    'Remaining'
  );

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

  const quotaChartData = useMemo(() => {
    return quotaUsageRows.map((row) => {
      const quota = Math.max(row.quota, 0);
      const used = Math.min(Math.max(row.usedSlots, 0), quota || row.usedSlots);
      const remaining = Math.max(quota - used, row.remainingSlots, 0);
      const utilization = quota > 0 ? (used / quota) * 100 : 0;

      return {
        ...row,
        label: formatDayLabel(row.date, locale),
        usedSlots: used,
        remainingSlots: remaining,
        utilization,
      };
    });
  }, [quotaUsageRows, locale]);

  const quotaSummary = useMemo(() => {
    if (quotaChartData.length === 0) {
      return {
        totalUsed: 0,
        totalQuota: 0,
        averageUtilization: 0,
        nearLimitDays: 0,
      };
    }

    const totalUsed = quotaChartData.reduce(
      (sum, row) => sum + row.usedSlots,
      0
    );
    const totalQuota = quotaChartData.reduce((sum, row) => sum + row.quota, 0);
    const nearLimitDays = quotaChartData.filter(
      (row) => row.quota > 0 && row.utilization >= 80
    ).length;

    return {
      totalUsed,
      totalQuota,
      averageUtilization: totalQuota > 0 ? (totalUsed / totalQuota) * 100 : 0,
      nearLimitDays,
    };
  }, [quotaChartData]);

  const topCards = metrics
    ? [
        {
          title: t('SystemAdmin.dashboard.cards.doctors.title', 'Doctors'),
          value: metrics.doctors.total,
          change: metrics.doctors.growthPercentage,
          trend: resolveTrend(metrics.doctors.growthPercentage),
          description: t(
            'SystemAdmin.dashboard.cards.doctors.description',
            'This month: {{current}} - Prev: {{previous}}',
            {
              current: metrics.doctors.currentMonth.toLocaleString(locale),
              previous: metrics.doctors.previousMonth.toLocaleString(locale),
            }
          ),
          icon: Stethoscope,
          variant: 'primary' as const,
          sparklineData: metrics.monthlyNewDoctorCounts,
          sparklineColor: '#0ea5e9',
        },
        {
          title: t(
            'SystemAdmin.dashboard.cards.organisations.title',
            'Organizations'
          ),
          value: metrics.organisations.total,
          change: metrics.organisations.growthPercentage,
          trend: resolveTrend(metrics.organisations.growthPercentage),
          description: t(
            'SystemAdmin.dashboard.cards.organisations.description',
            'This month: {{current}} - Prev: {{previous}}',
            {
              current:
                metrics.organisations.currentMonth.toLocaleString(locale),
              previous:
                metrics.organisations.previousMonth.toLocaleString(locale),
            }
          ),
          icon: Building2,
          variant: 'success' as const,
          sparklineData: metrics.monthlyNewOrganisationCounts,
          sparklineColor: '#22c55e',
        },
        {
          title: t('SystemAdmin.dashboard.cards.patients.title', 'Patients'),
          value: metrics.patients.total,
          change: metrics.patients.growthPercentage,
          trend: resolveTrend(metrics.patients.growthPercentage),
          description: t(
            'SystemAdmin.dashboard.cards.patients.description',
            'This month: {{current}} - Prev: {{previous}}',
            {
              current: metrics.patients.currentMonth.toLocaleString(locale),
              previous: metrics.patients.previousMonth.toLocaleString(locale),
            }
          ),
          icon: Users,
          variant: 'warning' as const,
          sparklineData: metrics.monthlyNewPatientCounts,
          sparklineColor: '#f59e0b',
        },
        {
          title: t(
            'SystemAdmin.dashboard.cards.liveConsultations.title',
            'Live consultations'
          ),
          value: metrics.systemStatus.liveConsultationSessions,
          description: t(
            'SystemAdmin.dashboard.cards.liveConsultations.description',
            'Sessions with open chat (active window)'
          ),
          icon: Radio,
          variant: 'primary' as const,
        },
      ]
    : [];

  const revenueKpiCards = metrics
    ? [
        {
          title: t(
            'SystemAdmin.dashboard.cards.walletTopUps.title',
            'Wallet top-ups (YTD)'
          ),
          value: formatCurrency(metrics.totalDepositRevenueYear, locale),
          description: t(
            'SystemAdmin.dashboard.cards.walletTopUps.description',
            'Completed deposits (calendar year)'
          ),
          icon: Wallet,
          variant: 'primary' as const,
          sparklineData: metrics.monthlyRevenue.map((m) => m.value),
          sparklineColor: '#0ea5e9',
        },
        {
          title: t(
            'SystemAdmin.dashboard.cards.consultationCommission.title',
            'Consultation commission (YTD)'
          ),
          value: formatCurrency(metrics.totalPlatformCommissionYear, locale),
          description: t(
            'SystemAdmin.dashboard.cards.consultationCommission.description',
            'Platform share to system wallet'
          ),
          icon: Landmark,
          variant: 'success' as const,
          sparklineData: metrics.monthlyPlatformCommission.map((m) => m.value),
          sparklineColor: '#14b8a6',
        },
      ]
    : [];

  const dashboardExportRows = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.doctorsTotal',
          'Doctors - Total'
        ),
        value: metrics.doctors.total,
      },
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.doctorsGrowth',
          'Doctors - Growth %'
        ),
        value: metrics.doctors.growthPercentage,
      },
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.organisationsTotal',
          'Organisations - Total'
        ),
        value: metrics.organisations.total,
      },
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.organisationsGrowth',
          'Organisations - Growth %'
        ),
        value: metrics.organisations.growthPercentage,
      },
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.patientsTotal',
          'Patients - Total'
        ),
        value: metrics.patients.total,
      },
      {
        section: t('SystemAdmin.dashboard.export.rows.section.users', 'Users'),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.patientsGrowth',
          'Patients - Growth %'
        ),
        value: metrics.patients.growthPercentage,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.operations',
          'Operations'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.liveConsultationSessions',
          'Live consultation sessions'
        ),
        value: metrics.systemStatus.liveConsultationSessions,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.pending',
          'Pending'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.ophthalmologistVerifications',
          'Ophthalmologist verifications'
        ),
        value: metrics.pendingActions.pendingOphthalmologistVerifications,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.pending',
          'Pending'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.withdrawalRequests',
          'Withdrawal requests'
        ),
        value: metrics.pendingActions.pendingWithdrawalRequests,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.pending',
          'Pending'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.organisationOnboarding',
          'Organisation onboarding'
        ),
        value: metrics.pendingActions.pendingOrganisationOnboarding,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.revenueYtd',
          'Revenue (YTD)'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.walletTopUpsCalendarYear',
          'Wallet top-ups (calendar year)'
        ),
        value: metrics.totalDepositRevenueYear,
      },
      {
        section: t(
          'SystemAdmin.dashboard.export.rows.section.revenueYtd',
          'Revenue (YTD)'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.consultationCommissionCalendarYear',
          'Consultation commission (calendar year)'
        ),
        value: metrics.totalPlatformCommissionYear,
      },
      ...metrics.paymentMethods.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.paymentMethods',
          'Payment Methods'
        ),
        metric: item.name,
        value: item.value,
      })),
      ...metrics.monthlyRevenue.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.monthlyRevenue',
          'Monthly Revenue'
        ),
        metric: item.label,
        value: item.value,
      })),
      ...metrics.monthlyPlatformCommission.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.monthlyPlatformCommission',
          'Monthly platform commission'
        ),
        metric: item.label,
        value: item.value,
      })),
      ...metrics.dailyRevenue.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.dailyRevenue',
          'Daily Revenue'
        ),
        metric: item.label,
        value: item.value,
      })),
      ...metrics.dailyPlatformCommission.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.dailyPlatformCommission',
          'Daily platform commission'
        ),
        metric: item.label,
        value: item.value,
      })),
      ...quotaUsageRows.map((item) => ({
        section: t(
          'SystemAdmin.dashboard.export.rows.section.partTimeSlotQuotaUsage',
          'Part-time slot quota usage'
        ),
        metric: t(
          'SystemAdmin.dashboard.export.rows.metric.quotaUsageDate',
          '{{date}} - used/quota/remaining',
          { date: item.date }
        ),
        value: `${item.usedSlots}/${item.quota}/${item.remainingSlots}`,
      })),
    ];
  }, [metrics, quotaUsageRows, t]);

  const dashboardExportColumns = useMemo(
    () => [
      {
        header: t('SystemAdmin.dashboard.export.columns.section', 'Section'),
        value: (row: { section: string }) => row.section,
      },
      {
        header: t('SystemAdmin.dashboard.export.columns.metric', 'Metric'),
        value: (row: { metric: string }) => row.metric,
      },
      {
        header: t('SystemAdmin.dashboard.export.columns.value', 'Value'),
        value: (row: { value: number | string }) => row.value,
      },
    ],
    [t]
  );

  const handleExportDashboard = async () => {
    if (!metrics) {
      toast.info(
        t(
          'SystemAdmin.dashboard.toasts.noDataForExport',
          'No dashboard data available for export.'
        )
      );
      return;
    }

    try {
      setIsExporting(true);

      await downloadXlsxFile(
        dashboardExportRows,
        dashboardExportColumns,
        buildTimestampedFileName('system-admin-dashboard', 'xlsx'),
        {
          sheetName: t('SystemAdmin.dashboard.export.sheetName', 'Dashboard'),
          title: t(
            'SystemAdmin.dashboard.export.title',
            'System Admin Dashboard Export'
          ),
          subtitle: t(
            'SystemAdmin.dashboard.export.subtitle',
            'Growth, revenue, queue, and system status'
          ),
          includeGeneratedAt: true,
          generatedBy: t(
            'SystemAdmin.dashboard.export.generatedBy',
            'AuraEyes System Admin'
          ),
          columnWidths: [24, 48, 22],
        }
      );
      toast.success(
        t(
          'SystemAdmin.dashboard.toasts.exportSuccess',
          'Dashboard data exported successfully.'
        )
      );
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.dashboard.toasts.exportError',
            'Failed to export dashboard data. Please try again.'
          )
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDashboardPdf = async () => {
    if (!metrics) {
      toast.info(
        t(
          'SystemAdmin.dashboard.toasts.noDataForExport',
          'No dashboard data available for export.'
        )
      );
      return;
    }

    try {
      setIsExportingPdf(true);
      await downloadPdfTableFile(
        dashboardExportRows,
        dashboardExportColumns,
        buildTimestampedFileName('system-admin-dashboard', 'pdf'),
        {
          title: t(
            'SystemAdmin.dashboard.export.title',
            'System Admin Dashboard Export'
          ),
          subtitle: t(
            'SystemAdmin.dashboard.export.subtitle',
            'Growth, revenue, queue, and system status'
          ),
          orientation: 'landscape',
          includeGeneratedAt: true,
          generatedBy: t(
            'SystemAdmin.dashboard.export.generatedBy',
            'AuraEyes System Admin'
          ),
        }
      );
      toast.success(
        t(
          'SystemAdmin.dashboard.toasts.exportPdfSuccess',
          'Dashboard PDF exported successfully.'
        )
      );
    } catch (error) {
      console.error('Failed to export dashboard PDF:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.dashboard.toasts.exportPdfError',
            'Failed to export dashboard PDF. Please try again.'
          )
        )
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const applyQuotaRangePreset = (days: number) => {
    const start = new Date();
    setQuotaFromDate(toDateOnly(start));
    setQuotaToDate(toDateOnly(addDays(start, days - 1)));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t(
            'SystemAdmin.dashboard.page.title',
            'System Admin Dashboard'
          )}
          description={t(
            'SystemAdmin.dashboard.page.description',
            'Growth, revenue, queue, and system status'
          )}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDashboard}
                disabled={isExporting || !metrics}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting
                  ? t('SystemAdmin.dashboard.actions.exporting', 'Exporting...')
                  : t(
                      'SystemAdmin.dashboard.actions.exportExcel',
                      'Export Excel'
                    )}
              </button>
              <button
                onClick={handleExportDashboardPdf}
                disabled={isExportingPdf || !metrics}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                {isExportingPdf
                  ? t('SystemAdmin.dashboard.actions.exporting', 'Exporting...')
                  : t('SystemAdmin.dashboard.actions.exportPdf', 'Export PDF')}
              </button>
            </div>
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
                {t(
                  'SystemAdmin.dashboard.states.metricsLoadError',
                  'Unable to load live dashboard metrics.'
                )}
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
                            ? card.value.toLocaleString(locale)
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
                        {t(
                          'SystemAdmin.dashboard.charts.monthlyRevenue.title',
                          'Monthly revenue (current year)'
                        )}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                        {t(
                          'SystemAdmin.dashboard.charts.monthlyRevenue.description',
                          'Wallet top-ups vs platform commission'
                        )}
                      </p>

                      {monthlyChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                          {t('SystemAdmin.dashboard.common.noData', 'No data')}
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
                                  formatCurrency(Number(value), locale)
                                }
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar
                                dataKey="topUps"
                                name={t(
                                  'SystemAdmin.dashboard.charts.common.walletTopUps',
                                  'Wallet top-ups'
                                )}
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="commission"
                                name={t(
                                  'SystemAdmin.dashboard.charts.common.consultationCommission',
                                  'Consultation commission'
                                )}
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
                        {t(
                          'SystemAdmin.dashboard.charts.paymentMethods.title',
                          'Payment methods'
                        )}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                        {t(
                          'SystemAdmin.dashboard.charts.paymentMethods.description',
                          'By total completed deposit amount'
                        )}
                      </p>

                      {metrics.paymentMethods.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                          {t('SystemAdmin.dashboard.common.noData', 'No data')}
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
                                  formatCurrency(Number(value), locale)
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
                      {t(
                        'SystemAdmin.dashboard.charts.dailyRevenue.title',
                        'Last 7 days - top-ups & commission'
                      )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                      {t(
                        'SystemAdmin.dashboard.charts.dailyRevenue.description',
                        'Daily movement (recent week)'
                      )}
                    </p>

                    {dailyChartData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                        {t('SystemAdmin.dashboard.common.noData', 'No data')}
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
                                formatCurrency(Number(value), locale)
                              }
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line
                              type="monotone"
                              dataKey="topUps"
                              name={t(
                                'SystemAdmin.dashboard.charts.common.walletTopUps',
                                'Wallet top-ups'
                              )}
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="commission"
                              name={t(
                                'SystemAdmin.dashboard.charts.common.consultationCommission',
                                'Consultation commission'
                              )}
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

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-0.5 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-sky-500" />
                          {t(
                            'SystemAdmin.dashboard.quotaUsage.title',
                            'Part-time slot quota usage'
                          )}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          {t(
                            'SystemAdmin.dashboard.quotaUsage.description',
                            'Reserved slots by day against global quota'
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-end gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            {t(
                              'SystemAdmin.dashboard.quotaUsage.filters.from',
                              'From'
                            )}
                          </label>
                          <input
                            type="date"
                            value={quotaFromDate}
                            onChange={(e) => setQuotaFromDate(e.target.value)}
                            className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            {t(
                              'SystemAdmin.dashboard.quotaUsage.filters.to',
                              'To'
                            )}
                          </label>
                          <input
                            type="date"
                            value={quotaToDate}
                            onChange={(e) => setQuotaToDate(e.target.value)}
                            className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => applyQuotaRangePreset(7)}
                          className="px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {t('SystemAdmin.dashboard.quotas.day7', '7d')}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuotaRangePreset(14)}
                          className="px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {t('SystemAdmin.dashboard.quotas.day14', '14d')}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuotaRangePreset(30)}
                          className="px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {t('SystemAdmin.dashboard.quotas.day30', '30d')}
                        </button>
                      </div>
                    </div>

                    {quotaUsageQuery.isLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <Spinner size={28} />
                      </div>
                    ) : quotaUsageQuery.isError ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        {t(
                          'SystemAdmin.dashboard.quotaUsage.states.loadError',
                          'Failed to load part-time slot quota usage.'
                        )}
                      </div>
                    ) : quotaChartData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                        {t(
                          'SystemAdmin.dashboard.quotaUsage.states.empty',
                          'No quota usage data'
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t(
                                'SystemAdmin.dashboard.quotaUsage.summary.usedSlots',
                                'Used slots'
                              )}
                            </p>
                            <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                              {quotaSummary.totalUsed.toLocaleString(locale)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t(
                                'SystemAdmin.dashboard.quotaUsage.summary.quotaCapacity',
                                'Quota capacity'
                              )}
                            </p>
                            <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                              {quotaSummary.totalQuota.toLocaleString(locale)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t(
                                'SystemAdmin.dashboard.quotaUsage.summary.averageUtilization',
                                'Avg utilization'
                              )}
                            </p>
                            <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                              {quotaSummary.averageUtilization.toFixed(1)}%
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t(
                                'SystemAdmin.dashboard.quotaUsage.summary.nearLimitDays',
                                'Near-limit days'
                              )}
                            </p>
                            <p className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                              {quotaSummary.nearLimitDays}
                            </p>
                          </div>
                        </div>

                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quotaChartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#cbd5e1"
                                className="dark:stroke-slate-700"
                              />
                              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip
                                formatter={(value, name) => {
                                  if (name === 'usedSlots') {
                                    return [value, usedLabel];
                                  }
                                  return [value, remainingLabel];
                                }}
                                labelFormatter={(label, payload) => {
                                  const row = payload?.[0]?.payload as
                                    | SystemAdminPartTimeSlotQuotaUsage
                                    | undefined;
                                  return row
                                    ? `${label} (${row.date})`
                                    : String(label);
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar
                                dataKey="usedSlots"
                                name={usedLabel}
                                stackId="quota"
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="remainingSlots"
                                name={remainingLabel}
                                stackId="quota"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                <aside className="lg:col-span-4 space-y-4">
                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500" />
                      {t(
                        'SystemAdmin.dashboard.pendingActions.title',
                        'Pending actions'
                      )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-3">
                      {t(
                        'SystemAdmin.dashboard.pendingActions.description',
                        'Queues that need your attention'
                      )}
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/system-admin/verifications"
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <span>
                            {t(
                              'SystemAdmin.dashboard.pendingActions.items.doctorProfileReviews.title',
                              'Doctor profile reviews'
                            )}
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              {t(
                                'SystemAdmin.dashboard.pendingActions.items.doctorProfileReviews.subtitle',
                                'Pending verification'
                              )}
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
                            {t(
                              'SystemAdmin.dashboard.pendingActions.items.withdrawalRequests.title',
                              'Withdrawal requests'
                            )}
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              {t(
                                'SystemAdmin.dashboard.pendingActions.items.withdrawalRequests.subtitle',
                                'Pending / processing'
                              )}
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
                            {t(
                              'SystemAdmin.dashboard.pendingActions.items.organisationOnboarding.title',
                              'Organisation onboarding'
                            )}
                            <span className="text-slate-500 dark:text-slate-400 block text-xs font-normal">
                              {t(
                                'SystemAdmin.dashboard.pendingActions.items.organisationOnboarding.subtitle',
                                'Awaiting approval'
                              )}
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
                        {t(
                          'SystemAdmin.dashboard.systemStatus.title',
                          'System status'
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          {t('SystemAdmin.dashboard.systemStatus.api', 'API')}
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
                              ? t(
                                  'SystemAdmin.dashboard.systemStatus.operational',
                                  'Operational'
                                )
                              : t(
                                  'SystemAdmin.dashboard.systemStatus.issue',
                                  'Issue'
                                )}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          {t(
                            'SystemAdmin.dashboard.systemStatus.database',
                            'Database'
                          )}
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
                              ? t(
                                  'SystemAdmin.dashboard.systemStatus.connected',
                                  'Connected'
                                )
                              : t(
                                  'SystemAdmin.dashboard.systemStatus.unreachable',
                                  'Unreachable'
                                )}
                          </span>
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-1">
                      {t(
                        'SystemAdmin.dashboard.topDoctors.title',
                        'Top doctors'
                      )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                      {t(
                        'SystemAdmin.dashboard.topDoctors.description',
                        'By consultation revenue (all time)'
                      )}
                    </p>
                    {metrics.topDoctorsByConsultationRevenue.length === 0 ? (
                      <p className="text-slate-500 text-xs">
                        {t(
                          'SystemAdmin.dashboard.topDoctors.states.empty',
                          'No data yet'
                        )}
                      </p>
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
                                  {d.name || '-'}
                                </div>
                                {d.ratingCount > 0 ? (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    * {d.ratingAverage.toFixed(1)}
                                    <span className="text-slate-400 ml-1">
                                      ({d.ratingCount}{' '}
                                      {t(
                                        'SystemAdmin.dashboard.topDoctors.reviews',
                                        'reviews'
                                      )}
                                      )
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {t(
                                      'SystemAdmin.dashboard.topDoctors.noRatings',
                                      'No ratings yet'
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-slate-600 dark:text-slate-400 tabular-nums shrink-0">
                                {formatCurrency(d.revenue, locale)}
                              </span>
                            </li>
                          )
                        )}
                      </ol>
                    )}
                  </section>

                  <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-1">
                      {t(
                        'SystemAdmin.dashboard.topOrganisations.title',
                        'Top organisations'
                      )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                      {t(
                        'SystemAdmin.dashboard.topOrganisations.description',
                        'By average rating'
                      )}
                    </p>
                    {metrics.topOrganisationsByRating.length === 0 ? (
                      <p className="text-slate-500 text-xs">
                        {t(
                          'SystemAdmin.dashboard.topOrganisations.states.empty',
                          'No data yet'
                        )}
                      </p>
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
                              * {o.ratingAverage.toFixed(1)}
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
