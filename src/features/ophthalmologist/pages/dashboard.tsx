import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardList, Siren, Stethoscope } from 'lucide-react';
import { DoctorSidebar, DoctorHeader, StatsCardGrid } from '../components';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import {
  getOphthalmologistDashboardMetrics,
  type OphthalmologistUrgentCase,
} from '../api/dashboard.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

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
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {t(
            'Ophthalmologist.dashboard.loadError',
            'Unable to load the live ophthalmologist dashboard.'
          )}
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

  const formatScheduleLabel = (appointmentTime: string | null) => {
    if (!appointmentTime) {
      return t(
        'Ophthalmologist.dashboard.priorityList.noSchedule',
        'No fixed schedule'
      );
    }

    const date = new Date(appointmentTime);
    if (Number.isNaN(date.getTime())) {
      return t(
        'Ophthalmologist.dashboard.priorityList.noSchedule',
        'No fixed schedule'
      );
    }

    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const riskToneClass = (riskLevel: string) => {
    const normalized = riskLevel.toLowerCase();
    if (normalized === 'critical') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    }
    if (normalized === 'high') {
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const sortedUrgentCases = [...metrics.urgentCaseList].sort(
    (a: OphthalmologistUrgentCase, b: OphthalmologistUrgentCase) => {
      const aCritical = a.riskLevel.toLowerCase() === 'critical' ? 1 : 0;
      const bCritical = b.riskLevel.toLowerCase() === 'critical' ? 1 : 0;
      if (aCritical !== bCritical) {
        return bCritical - aCritical;
      }
      return b.confidenceScore - a.confidenceScore;
    }
  );

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

          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(
                    'Ophthalmologist.dashboard.priorityList.title',
                    'Priority List - High Risk / Critical Cases'
                  )}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.dashboard.priorityList.description',
                    'Prioritized queue from pending consultations linked to high-risk AI results.'
                  )}
                </p>
              </div>
              <Link
                to="/ophthalmologist/consultations"
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
              >
                {t(
                  'Ophthalmologist.dashboard.priorityList.viewAll',
                  'View all consultations'
                )}
              </Link>
            </div>

            {sortedUrgentCases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-[#2d4a6f] dark:text-gray-400">
                {t(
                  'Ophthalmologist.dashboard.priorityList.empty',
                  'No pending high-risk or critical consultation at the moment.'
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedUrgentCases.map((item) => (
                  <div
                    key={item.consultationSessionId}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2d4a6f] dark:bg-[#0a1929]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.dashboard.priorityList.patient',
                            'Patient'
                          )}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {item.patientName}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${riskToneClass(item.riskLevel)}`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.dashboard.priorityList.confidence',
                            'AI confidence'
                          )}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.confidenceScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.dashboard.priorityList.schedule',
                            'Schedule'
                          )}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatScheduleLabel(item.appointmentTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.dashboard.priorityList.sessionId',
                            'Session'
                          )}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.consultationSessionId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
