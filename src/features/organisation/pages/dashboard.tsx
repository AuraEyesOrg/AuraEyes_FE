import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock3, Stethoscope, Users } from 'lucide-react';
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
      <div className="flex items-center justify-center h-screen w-full bg-[var(--bg-primary)]">
        <Spinner size={36} />
      </div>
    );
  }

  if (metricsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--bg-primary)]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Unable to load the live organisation dashboard.
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  const displayName = user?.fullName || 'Organisation Admin';
  const organisationHint = user?.organizationId
    ? `Organisation ${user.organizationId.slice(0, 8)}`
    : 'AURA Partner Clinic';

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <Sidebar pendingCount={metrics.pendingAppointments} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {organisationHint} • Live operations overview
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
              title="Pending Appointments"
              value={metrics.pendingAppointments}
              change="Awaiting service"
              trend="stable"
              color="#f59e0b"
            />
            <StatsCard
              icon={CalendarDays}
              title="Available Slots Today"
              value={metrics.availableSlotsToday}
              change="Open booking capacity"
              trend="stable"
              color="#10b981"
            />
            <StatsCard
              icon={Users}
              title="Active Doctors"
              value={metrics.activeDoctors}
              change="Assigned to this organisation"
              trend="stable"
              color="#ef4444"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Booking Operations
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real appointment counts and availability from organisation
                    schedules.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#0a1f44]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total appointments
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.totalAppointments}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#0a1f44]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending appointments
                  </p>
                  <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {metrics.pendingAppointments}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Stethoscope className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Capacity Snapshot
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Live slot availability and currently active doctors.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#0a1f44]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Available slots today
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.availableSlotsToday}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#0a1f44]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active doctors
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.activeDoctors}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard Source of Truth
            </h2>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              This dashboard now reads directly from organisation appointments,
              schedule templates, appointment slots, and user assignments. The
              previous mock charts, mock patients, and sample appointments have
              been removed so the page shows only live backend data.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
