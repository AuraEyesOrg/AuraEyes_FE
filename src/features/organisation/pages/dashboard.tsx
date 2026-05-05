import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, Clock3, Cpu, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import StatsCard from '../components/StatsCard';
import { getOrganisationDashboardMetrics } from '../api/dashboard.api';

export default function OrganisationDashboard() {
  const { user } = useAuthStore();
  const { t } = useSafeTranslation();
  const metricsQuery = useQuery({
    queryKey: ['organisation-dashboard', 'metrics'],
    queryFn: getOrganisationDashboardMetrics,
  });

  useEffect(() => {
    if (metricsQuery.isError) {
      toast.error(
        t(
          'Organisation.dashboard.toast.loadFailed',
          'Unable to load the live organisation dashboard.'
        )
      );
    }
  }, [metricsQuery.isError, t]);

  if (metricsQuery.isLoading || !metricsQuery.data) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  if (metricsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="text-slate-500 font-medium dark:text-slate-400">
          {t(
            'Organisation.dashboard.states.unavailable',
            'Dashboard data is currently unavailable.'
          )}
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  const pendingWorkload =
    metrics.appointmentStatus.pending + metrics.appointmentStatus.confirmed;
  const displayName =
    user?.fullName ||
    t('Organisation.dashboard.identity.defaultAdmin', 'Organisation Admin');

  const statusItems = [
    {
      label: t('Organisation.dashboard.status.pending', 'Pending'),
      value: metrics.appointmentStatus.pending,
      colorClass: 'bg-amber-500',
      textClass: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: t('Organisation.dashboard.status.confirmed', 'Confirmed'),
      value: metrics.appointmentStatus.confirmed,
      colorClass: 'bg-blue-500',
      textClass: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: t('Organisation.dashboard.status.completed', 'Completed'),
      value: metrics.appointmentStatus.completed,
      colorClass: 'bg-emerald-500',
      textClass: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: t('Organisation.dashboard.status.cancelled', 'Cancelled'),
      value: metrics.appointmentStatus.cancelled,
      colorClass: 'bg-rose-500',
      textClass: 'text-rose-700 dark:text-rose-400',
    },
    {
      label: t('Organisation.dashboard.status.noShow', 'No Show'),
      value: metrics.appointmentStatus.noShow,
      colorClass: 'bg-slate-500',
      textClass: 'text-slate-700 dark:text-slate-300',
    },
  ];

  const safeTotalAppointments = Math.max(metrics.totalAppointments, 1);
  const safeUtilization = Math.max(
    0,
    Math.min(100, metrics.utilizationRatePercent)
  );

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader
          pageName={t('Organisation.dashboard.pageName', 'Dashboard')}
        />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
              {t(
                'Organisation.dashboard.header.title',
                'Welcome back, {{name}}',
                {
                  name: displayName,
                }
              )}
            </h1>
            <p className="text-(--text-secondary)">
              {t(
                'Organisation.dashboard.header.subtitle',
                "Here's your live dashboard for {{name}}. Monitor key metrics and manage your organisation.",
                { name: displayName }
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              icon={CalendarDays}
              title={t(
                'Organisation.dashboard.stats.totalAppointments.title',
                'Total Appointments'
              )}
              value={metrics.totalAppointments}
              change={t(
                'Organisation.dashboard.stats.totalAppointments.change',
                'Live total'
              )}
              trend="stable"
              color="#3b82f6"
            />
            <StatsCard
              icon={Clock3}
              title={t(
                'Organisation.dashboard.stats.pendingConfirmed.title',
                'Pending + Confirmed'
              )}
              value={pendingWorkload}
              change={t(
                'Organisation.dashboard.stats.pendingConfirmed.change',
                'Need active handling'
              )}
              trend="stable"
              color="#f59e0b"
            />
            <StatsCard
              icon={Activity}
              title={t(
                'Organisation.dashboard.stats.utilizationRate.title',
                'Utilization Rate'
              )}
              value={`${safeUtilization.toFixed(1)}%`}
              change={t(
                'Organisation.dashboard.stats.utilizationRate.change',
                "Today's booked/capacity"
              )}
              trend="stable"
              color="#10b981"
            />
            <StatsCard
              icon={Cpu}
              title={t(
                'Organisation.dashboard.stats.remainingAiQuota.title',
                'Remaining AI Quota'
              )}
              value={metrics.remainingAiQuota}
              change={t(
                'Organisation.dashboard.stats.remainingAiQuota.change',
                'Credits available now'
              )}
              trend="stable"
              color="#ef4444"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-(--text-primary)">
                    {t(
                      'Organisation.dashboard.sections.appointmentStatus.title',
                      'Appointment Status Tracking'
                    )}
                  </h2>
                  <p className="text-sm text-(--text-secondary)">
                    {t(
                      'Organisation.dashboard.sections.appointmentStatus.subtitle',
                      'Real-time appointment lifecycle across your organisation.'
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {statusItems.map((status) => {
                  const percent = (status.value / safeTotalAppointments) * 100;
                  return (
                    <div
                      key={status.label}
                      className="rounded-lg bg-(--bg-primary) p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-(--text-tertiary)">
                          {status.label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${status.textClass}`}
                        >
                          {status.value}
                        </p>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-(--border-primary)">
                        <div
                          className={`h-full rounded-full ${status.colorClass}`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-(--text-primary)">
                    {t(
                      'Organisation.dashboard.sections.utilization.title',
                      'Organisation Utilization & AI Quota'
                    )}
                  </h2>
                  <p className="text-sm text-(--text-secondary)">
                    {t(
                      'Organisation.dashboard.sections.utilization.subtitle',
                      'Capacity consumption and AI credits for daily operations.'
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-(--bg-primary) p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-(--text-tertiary)">
                      {t(
                        'Organisation.dashboard.labels.utilizationRateToday',
                        'Utilization rate today'
                      )}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {safeUtilization.toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-(--border-primary)">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${safeUtilization}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-(--bg-primary) p-4">
                  <p className="text-sm text-(--text-tertiary)">
                    {t(
                      'Organisation.dashboard.labels.remainingAiQuota',
                      'Remaining AI quota'
                    )}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-(--text-primary)">
                    {metrics.remainingAiQuota}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
