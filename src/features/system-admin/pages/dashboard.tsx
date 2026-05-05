import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarPlus,
  CalendarDays,
  Activity,
  CheckCircle,
  Users,
  Stethoscope,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import StatsCard from '../components/StatsCard';
import { dashboardApi } from '../api';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const POLLING_INTERVAL = 60000;
const WAITING_THRESHOLD_MINUTES = 20;
const T = 'SystemAdmin.dashboard';

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();

  const [SidebarMod, setSidebarMod] = useState<any>(null);
  const [HeaderMod, setHeaderMod] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    import('../components/Sidebar')
      .then((m) => setSidebarMod(m))
      .catch((e) => console.error('Sidebar load failed:', e));
    import('../components/PageHeader')
      .then((m) => setHeaderMod(m))
      .catch((e) => console.error('PageHeader load failed:', e));
  }, []);
  const SidebarComponent = SidebarMod?.default;
  const HeaderComponent = HeaderMod?.default;

  const {
    data: todaySummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['system-admin', 'today-summary'],
    queryFn: () => dashboardApi.getTodaySummary(),
  });

  const { data: slotUtilization, isLoading: slotsLoading } = useQuery({
    queryKey: ['system-admin', 'slot-utilization'],
    queryFn: () => dashboardApi.getSlotUtilization(),
  });

  const { data: liveQueue = [], isLoading: queueLoading } = useQuery({
    queryKey: ['system-admin', 'live-queue'],
    queryFn: () => dashboardApi.getLiveQueue(),
    refetchInterval: POLLING_INTERVAL,
  });

  const { data: doctorStatus = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['system-admin', 'doctor-status'],
    queryFn: () => dashboardApi.getDoctorStatus(),
    refetchInterval: POLLING_INTERVAL,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['system-admin', 'today-summary'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['system-admin', 'slot-utilization'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['system-admin', 'live-queue'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['system-admin', 'doctor-status'],
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const stats = useMemo(
    () => [
      {
        label: t(`${T}.stats.totalAppointments`, "Today's Appointments"),
        value: todaySummary?.totalAppointments ?? 0,
        icon: CalendarDays,
        variant: 'primary' as const,
      },
      {
        label: t(`${T}.stats.checkedIn`, 'Checked In'),
        value: todaySummary?.checkedInPatients ?? 0,
        icon: Users,
        variant: 'warning' as const,
      },
      {
        label: t(`${T}.stats.completed`, 'Completed'),
        value: todaySummary?.completedVisits ?? 0,
        icon: CheckCircle,
        variant: 'success' as const,
      },
      {
        label: t(`${T}.stats.noShow`, 'No-Show'),
        value: todaySummary?.noShowCount ?? 0,
        icon: AlertTriangle,
        variant: 'danger' as const,
      },
    ],
    [todaySummary, t]
  );

  const bottleneckAlerts = useMemo(() => {
    const alerts: { message: string; severity: 'critical' | 'warning' }[] = [];

    const longWaits = liveQueue.filter(
      (q) =>
        q.waitingTimeMinutes > WAITING_THRESHOLD_MINUTES &&
        q.status === 'WAITING'
    );
    if (longWaits.length > 0) {
      alerts.push({
        message: t(
          `${T}.bottleneckLongWait`,
          '{{count}} patient(s) waiting over {{minutes}} min',
          {
            count: longWaits.length,
            minutes: WAITING_THRESHOLD_MINUTES,
          }
        ),
        severity: 'critical',
      });
    }

    if (
      slotUtilization &&
      slotUtilization.bookedSlots >= slotUtilization.totalSlots &&
      slotUtilization.totalSlots > 0
    ) {
      alerts.push({
        message: t(
          `${T}.bottleneckFullCapacity`,
          'Slots at full capacity for today'
        ),
        severity: 'warning',
      });
    }

    const overloadedDoctors = doctorStatus.filter((d) => d.activeLoad > 3);
    if (overloadedDoctors.length > 0) {
      alerts.push({
        message: t(
          `${T}.bottleneckOverloaded`,
          '{{count}} doctor(s) overloaded (>3 active)',
          {
            count: overloadedDoctors.length,
          }
        ),
        severity: 'warning',
      });
    }

    return alerts;
  }, [liveQueue, slotUtilization, doctorStatus, t]);

  const isLoading =
    summaryLoading || slotsLoading || queueLoading || doctorsLoading;
  const spinning = isLoading || isRefreshing;

  const statusBadge = (status: string) => {
    const config: Record<string, { text: string; cls: string }> = {
      WAITING: {
        text: t(`${T}.statusBadge.waiting`, 'Waiting'),
        cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      },
      IN_PROGRESS: {
        text: t(`${T}.statusBadge.inProgress`, 'In Progress'),
        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      },
      WAITING_PAYMENT: {
        text: t(`${T}.statusBadge.payment`, 'Payment'),
        cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      },
    };
    const c = config[status] ?? {
      text: status,
      cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${c.cls}`}>
        {c.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950">
      {/* Fixed sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: 280,
          zIndex: 50,
        }}
      >
        {SidebarComponent ? (
          <SidebarComponent />
        ) : (
          <div
            style={{ width: 280, height: '100vh' }}
            className="bg-gray-200 dark:bg-slate-900"
          />
        )}
      </div>
      <div style={{ marginLeft: 280, minHeight: '100vh' }}>
        {HeaderComponent ? (
          <HeaderComponent title={t(`${T}.title`, 'Clinic Operations')} />
        ) : null}
        <main className="px-6 py-6">
          {/* Header + Refresh */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t(`${T}.title`, 'Clinic Operations')}
              </h1>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                {t(
                  `${T}.subtitle`,
                  "Real-time overview of today's patient flow"
                )}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              disabled={spinning}
            >
              <RefreshCw
                className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
              />
              {t(`${T}.refresh`, 'Refresh')}
            </button>
          </div>

          {/* Error state */}
          {summaryError && (
            <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400">
              {t(`${T}.error`, 'Failed to load dashboard data.')}
            </div>
          )}

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <StatsCard
                key={s.label}
                title={s.label}
                value={s.value}
                icon={s.icon}
                variant={s.variant}
              />
            ))}
          </div>

          {/* Main Grid: Queue + Doctor Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Live Queue */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t(`${T}.liveQueue`, 'Live Queue')}
                </h2>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {liveQueue.length} {t(`${T}.active`, 'active')}
                </span>
              </div>

              {queueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size={28} />
                </div>
              ) : liveQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  <CheckCircle className="w-8 h-8 mb-2 text-gray-300 dark:text-slate-600" />
                  {t(`${T}.queueEmpty`, 'No patients in queue.')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800">
                        <th className="pb-2 font-medium">
                          {t(`${T}.patient`, 'Patient')}
                        </th>
                        <th className="pb-2 font-medium">
                          {t(`${T}.status`, 'Status')}
                        </th>
                        <th className="pb-2 font-medium">
                          {t(`${T}.doctor`, 'Doctor')}
                        </th>
                        <th className="pb-2 font-medium text-right">
                          {t(`${T}.waitTime`, 'Wait')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveQueue.map((item) => {
                        const isLongWait =
                          item.waitingTimeMinutes > WAITING_THRESHOLD_MINUTES &&
                          item.status === 'WAITING';
                        return (
                          <tr
                            key={item.visitId}
                            className={`border-b border-gray-50 dark:border-slate-800 last:border-none ${isLongWait ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                          >
                            <td className="py-2.5 text-gray-900 dark:text-white font-medium">
                              {item.patientName}
                            </td>
                            <td className="py-2.5">
                              {statusBadge(item.status)}
                            </td>
                            <td className="py-2.5 text-gray-400 dark:text-slate-500">
                              {item.assignedDoctorName ?? '—'}
                            </td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`text-xs font-medium ${isLongWait ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}
                              >
                                {item.waitingTimeMinutes}m
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Doctor Status */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t(`${T}.doctorStatus`, 'Doctor Status')}
                </h2>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {
                    doctorStatus.filter(
                      (d) => d.currentStatus === 'In consultation'
                    ).length
                  }{' '}
                  {t(`${T}.busy`, 'busy')}
                </span>
              </div>

              {doctorsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size={28} />
                </div>
              ) : doctorStatus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  <Users className="w-8 h-8 mb-2 text-gray-300 dark:text-slate-600" />
                  {t(`${T}.noDoctors`, 'No doctors on duty.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {doctorStatus.map((doc) => (
                    <div
                      key={doc.doctorId}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            doc.currentStatus === 'In consultation'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {doc.doctorName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">
                            {doc.currentStatus}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {doc.patientsHandledToday}{' '}
                          {t(`${T}.handled`, 'handled')}
                        </p>
                        {doc.activeLoad > 0 && (
                          <p className="text-xs font-medium text-blue-500 dark:text-blue-400">
                            {doc.activeLoad} {t(`${T}.activeLoad`, 'active')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Slot Utilization + Bottleneck Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Slot Utilization */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t(`${T}.slotUtilization`, 'Slot Utilization')}
              </h2>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size={28} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 dark:text-slate-500">
                      {slotUtilization?.bookedSlots ?? 0} /{' '}
                      {slotUtilization?.totalSlots ?? 0}{' '}
                      {t(`${T}.booked`, 'booked')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {slotUtilization?.utilizationRate ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, slotUtilization?.utilizationRate ?? 0)}%`,
                      }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 dark:text-slate-500">
                    <span>
                      {t(`${T}.remaining`, 'Remaining')}:{' '}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {slotUtilization?.remainingCapacity ?? 0}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottleneck Alerts */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                {t(`${T}.bottlenecks`, 'Bottleneck Alerts')}
              </h2>

              {bottleneckAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                  <CheckCircle className="w-8 h-8 mb-2 text-green-500 dark:text-green-400" />
                  {t(
                    `${T}.noBottlenecks`,
                    'No bottlenecks detected. Operations running smoothly.'
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {bottleneckAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              {t(`${T}.quickActions`, 'Quick Actions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() =>
                  navigate(resolvePathWithLocale('/system-admin/scheduling'))
                }
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <CalendarPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t(`${T}.actions.createSlot`, 'Create Slot')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {t(
                      `${T}.actions.createSlotDesc`,
                      'Add a new appointment slot'
                    )}
                  </p>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate(
                    resolvePathWithLocale('/system-admin/ophthalmologists')
                  )
                }
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t(`${T}.actions.assignDoctor`, 'Assign Doctor')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {t(
                      `${T}.actions.assignDoctorDesc`,
                      'Manage doctor assignments'
                    )}
                  </p>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate(resolvePathWithLocale('/system-admin/scheduling'))
                }
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t(`${T}.actions.viewSchedule`, 'View Schedule')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {t(
                      `${T}.actions.viewScheduleDesc`,
                      "See today's full schedule"
                    )}
                  </p>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate(resolvePathWithLocale('/system-admin/patients'))
                }
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t(`${T}.actions.addWalkIn`, 'Add Walk-in')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {t(
                      `${T}.actions.addWalkInDesc`,
                      'Register a new walk-in patient'
                    )}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
