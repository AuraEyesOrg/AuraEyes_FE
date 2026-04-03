import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, ClipboardList, Siren, Stethoscope } from 'lucide-react';
import { DoctorSidebar, DoctorHeader, StatsCardGrid } from '../components';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import { getOphthalmologistDashboardMetrics } from '../api/dashboard.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';

function getGreeting(
  hour: number,
  t: (key: string, fallback?: string) => string
): string {
  if (hour < 12)
    return t('Ophthalmologist.dashboard.greeting.morning', 'Good Morning');
  if (hour < 17)
    return t('Ophthalmologist.dashboard.greeting.afternoon', 'Good Afternoon');
  return t('Ophthalmologist.dashboard.greeting.evening', 'Good Evening');
}

export default function OphthalmologistDashboard() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const metricsQuery = useQuery({
    queryKey: ['ophthalmologist-dashboard', 'metrics'],
    queryFn: getOphthalmologistDashboardMetrics,
  });

  useEffect(() => {
    if (metricsQuery.isError) {
      toast.error(
        t(
          'Ophthalmologist.dashboard.loadError',
          'Unable to load the live ophthalmologist dashboard.'
        )
      );
    }
  }, [metricsQuery.isError, t]);

  if (metricsQuery.isLoading || !metricsQuery.data) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={40} />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('Ophthalmologist.dashboard.loading', 'Loading dashboard...')}
          </p>
        </div>
      </div>
    );
  }

  if (metricsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
          <p className="text-slate-700 dark:text-slate-200">
            {t(
              'Ophthalmologist.dashboard.loadError',
              'Unable to load the live ophthalmologist dashboard.'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              void metricsQuery.refetch();
            }}
            className="mt-3 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          >
            {t('Ophthalmologist.common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  const displayName =
    user?.fullName || t('Ophthalmologist.common.doctor', 'Doctor');
  const organisationHint = user?.organizationId
    ? `${t('Ophthalmologist.dashboard.organisationLabel', 'Organisation')} ${user.organizationId.slice(0, 8)}`
    : t('Ophthalmologist.dashboard.defaultOrganisation', 'AURA Care Network');
  const greeting = getGreeting(new Date().getHours(), t);

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={metrics.pendingReviews} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {greeting}, {displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {organisationHint} •{' '}
              {t(
                'Ophthalmologist.dashboard.subtitle',
                'Live review and scheduling workload'
              )}
            </p>
          </div>

          <div className="mb-6">
            <StatsCardGrid stats={metrics} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-900/30">
                  <ClipboardList className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.dashboard.reviewQueue.title',
                      'Review Queue Snapshot'
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.dashboard.reviewQueue.description',
                      'Live counts from consultation sessions and screening risk analysis.'
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#0a1929]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.dashboard.reviewQueue.pendingReviews',
                      'Pending reviews'
                    )}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.pendingReviews}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#0a1929]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.dashboard.reviewQueue.urgentCases',
                      'Urgent cases'
                    )}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                    {metrics.urgentCases}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/30">
                  <CalendarClock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.dashboard.capacity.title',
                      "Today's Capacity"
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.dashboard.capacity.description',
                      'Open slots and completed appointments for the current day.'
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#0a1929]">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Stethoscope className="h-4 w-4" />
                    {t(
                      'Ophthalmologist.dashboard.capacity.completedToday',
                      'Completed today'
                    )}
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.completedToday}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#0a1929]">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Siren className="h-4 w-4" />
                    {t(
                      'Ophthalmologist.dashboard.capacity.openSlotsToday',
                      'Open slots today'
                    )}
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.openSlotsToday}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t(
                'Ophthalmologist.dashboard.operationalSummary.title',
                'Operational Summary'
              )}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-6">
              {t(
                'Ophthalmologist.dashboard.operationalSummary.description',
                'This dashboard now reads directly from consultation sessions, screening results, appointments, and schedule slots. The old mock screening queue and mock urgent alert feed have been removed so the page reflects only current backend state.'
              )}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
