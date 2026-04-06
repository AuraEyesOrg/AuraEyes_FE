import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, Clock3, Cpu, ShieldCheck } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import StatsCard from '../components/StatsCard';
import { getOrganisationDashboardMetrics } from '../api/dashboard.api';

export default function OrganisationDashboard() {
  const { user } = useAuthStore();
  const metricsQuery = useQuery({
    queryKey: ['organisation-dashboard', 'metrics'],
    queryFn: getOrganisationDashboardMetrics,
  });

  if (metricsQuery.isLoading || !metricsQuery.data) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  if (metricsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Unable to load the live organisation dashboard.
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  const pendingWorkload =
    metrics.appointmentStatus.pending + metrics.appointmentStatus.confirmed;
  const displayName = user?.fullName || 'Organisation Admin';

  const statusItems = [
    {
      label: 'Pending',
      value: metrics.appointmentStatus.pending,
      colorClass: 'bg-amber-500',
      textClass: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: 'Confirmed',
      value: metrics.appointmentStatus.confirmed,
      colorClass: 'bg-blue-500',
      textClass: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: 'Completed',
      value: metrics.appointmentStatus.completed,
      colorClass: 'bg-emerald-500',
      textClass: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Cancelled',
      value: metrics.appointmentStatus.cancelled,
      colorClass: 'bg-rose-500',
      textClass: 'text-rose-700 dark:text-rose-400',
    },
    {
      label: 'No Show',
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
      <Sidebar pendingCount={pendingWorkload} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Dashboard" />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-(--text-secondary)">
              Here's your live dashboard for <b>{displayName}</b>. Monitor key
              metrics and manage your organisation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              icon={CalendarDays}
              title="Total Appointments"
              value={metrics.totalAppointments}
              change="Live total"
              trend="stable"
              color="#3b82f6"
            />
            <StatsCard
              icon={Clock3}
              title="Pending + Confirmed"
              value={pendingWorkload}
              change="Need active handling"
              trend="stable"
              color="#f59e0b"
            />
            <StatsCard
              icon={Activity}
              title="Utilization Rate"
              value={`${safeUtilization.toFixed(1)}%`}
              change="Today's booked/capacity"
              trend="stable"
              color="#10b981"
            />
            <StatsCard
              icon={Cpu}
              title="Remaining AI Quota"
              value={metrics.remainingAiQuota}
              change="Credits available now"
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
                    Appointment Status Tracking
                  </h2>
                  <p className="text-sm text-(--text-secondary)">
                    Real-time appointment lifecycle across your organisation.
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
                    Organisation Utilization & AI Quota
                  </h2>
                  <p className="text-sm text-(--text-secondary)">
                    Capacity consumption and AI credits for daily operations.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-(--bg-primary) p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-(--text-tertiary)">
                      Utilization rate today
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
                    Remaining AI quota
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
