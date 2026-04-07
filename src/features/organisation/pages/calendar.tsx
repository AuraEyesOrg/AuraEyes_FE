import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import useAuthStore from '@/store/auth-store';
import { getOrganisationAppointments } from '../api/organisation-clinic-booking.api';
import {
  organisationClinicBookingKeys,
  useCheckInClinicAppointment,
  useCompleteClinicAppointment,
  useMarkNoShowClinicAppointment,
  useStartClinicAppointment,
} from '../hooks/use-organisation-clinic-booking';
import { mapClinicStaffErrorMessage } from '@/lib/api-error';
import {
  formatDate,
  formatSlotTime,
  formatWeekDayLabel,
  formatWeekRange,
  toLocalDateKey,
} from '@/lib/date-utils';

const DAYS_PER_WEEK = 7;
const DAY_IN_MS = 86_400_000;
const WEEK_IN_MS = DAYS_PER_WEEK * DAY_IN_MS;

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T00:00:00`);

const getStartOfWeekMonday = (baseDate: Date): Date => {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date;
};

const getWeekOffsetFromDateKey = (dateKey: string): number => {
  const currentWeekStart = getStartOfWeekMonday(new Date());
  const targetWeekStart = getStartOfWeekMonday(parseDateKey(dateKey));
  return Math.round(
    (targetWeekStart.getTime() - currentWeekStart.getTime()) / WEEK_IN_MS
  );
};

const statusStyles: Record<string, string> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CheckedIn: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  InProgress:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  NoShow: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function CalendarPage() {
  const { user } = useAuthStore();
  const organisationId = user?.organizationId ?? '';

  const todayKey = toLocalDateKey(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const weekWindow = useMemo(() => {
    const weekStart = getStartOfWeekMonday(new Date());
    weekStart.setDate(weekStart.getDate() + currentWeekOffset * DAYS_PER_WEEK);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + DAYS_PER_WEEK - 1);

    const days = Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);

      const dateKey = toLocalDateKey(day);
      return {
        dateKey,
        dayLabel: formatWeekDayLabel(day),
        dayNumber: day.getDate(),
        isToday: dateKey === todayKey,
      };
    });

    return {
      label: formatWeekRange(weekStart, weekEnd),
      days,
    };
  }, [currentWeekOffset, todayKey]);

  const weekAppointmentQueries = useQueries({
    queries: weekWindow.days.map((day) => ({
      queryKey: organisationClinicBookingKeys.appointments(
        organisationId,
        day.dateKey
      ),
      queryFn: () => getOrganisationAppointments(organisationId, day.dateKey),
      enabled: !!organisationId,
      staleTime: 10_000,
    })),
  });

  const selectedDayIndex = weekWindow.days.findIndex(
    (day) => day.dateKey === selectedDate
  );

  const selectedDayQuery =
    selectedDayIndex >= 0 ? weekAppointmentQueries[selectedDayIndex] : null;
  const appointments = selectedDayQuery?.data ?? [];
  const isLoading = selectedDayQuery?.isLoading ?? false;
  const isFetching = selectedDayQuery?.isFetching ?? false;
  const appointmentsError = selectedDayQuery?.error;

  const weekDaySummaries = weekWindow.days.map((day, index) => {
    const dayAppointments = weekAppointmentQueries[index]?.data ?? [];
    return {
      ...day,
      total: dayAppointments.length,
      pending: dayAppointments.filter((item) => item.status === 'Pending')
        .length,
    };
  });

  const checkInMutation = useCheckInClinicAppointment();
  const startMutation = useStartClinicAppointment();
  const completeMutation = useCompleteClinicAppointment();
  const noShowMutation = useMarkNoShowClinicAppointment();

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((item) => item.status === 'Pending').length,
      checkedIn: appointments.filter((item) => item.status === 'CheckedIn')
        .length,
      inProgress: appointments.filter((item) => item.status === 'InProgress')
        .length,
    };
  }, [appointments]);

  const isMutating =
    checkInMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    noShowMutation.isPending;

  useEffect(() => {
    const inCurrentWeek = weekWindow.days.some(
      (day) => day.dateKey === selectedDate
    );

    if (!inCurrentWeek && weekWindow.days[0]) {
      setSelectedDate(weekWindow.days[0].dateKey);
    }
  }, [selectedDate, weekWindow.days]);

  useEffect(() => {
    if (appointmentsError) {
      toast.error(mapClinicStaffErrorMessage(appointmentsError));
    }
  }, [appointmentsError]);

  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
    setCurrentWeekOffset(getWeekOffsetFromDateKey(dateKey));
  };

  const handleGoToday = () => {
    setCurrentWeekOffset(0);
    setSelectedDate(todayKey);
  };

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  const getPrimaryActionConfig = (
    appointment: (typeof appointments)[number]
  ) => {
    if (appointment.status === 'Pending') {
      return {
        label: 'Check-in',
        icon: UserCheck,
        successMessage: 'Check-in thành công.',
        buttonClass:
          'bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-400/80',
        action: () => checkInMutation.mutateAsync(appointment.id),
      };
    }

    if (appointment.status === 'CheckedIn') {
      return {
        label: 'Start consultation',
        icon: Play,
        successMessage: 'Đã chuyển lịch khám sang trạng thái In Progress.',
        buttonClass:
          'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-400/80',
        action: () => startMutation.mutateAsync(appointment.id),
      };
    }

    if (appointment.status === 'InProgress') {
      return {
        label: 'Complete visit',
        icon: Calendar,
        successMessage: 'Đã hoàn thành lịch khám.',
        buttonClass:
          'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400/80',
        action: () =>
          completeMutation.mutateAsync({
            appointmentId: appointment.id,
          }),
      };
    }

    return null;
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar pendingCount={stats.pending} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Calendar" />

        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Organisation Clinic Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Weekly-first workflow for faster check-in and consultation flow.
              </p>
            </div>

            {isFetching && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 dark:border-cyan-800/60 dark:bg-cyan-900/20 dark:text-cyan-300">
                <Spinner /> Updating day data
              </div>
            )}
          </div>

          <section className="mb-6 rounded-xl border border-cyan-100 bg-white p-4 shadow-sm dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-gray-200 dark:hover:bg-[#1f3c60]"
              >
                <ChevronLeft className="h-4 w-4" /> Prev week
              </button>
              <p className="min-w-[180px] flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                {weekWindow.label}
              </p>
              <button
                type="button"
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-gray-200 dark:hover:bg-[#1f3c60]"
              >
                Next week <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/40"
              >
                Today
              </button>
              <label className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-300">
                Jump date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => handleDateSelect(event.target.value)}
                  className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-white"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {weekDaySummaries.map((day) => {
                const isSelected = day.dateKey === selectedDate;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(day.dateKey)}
                    className={`rounded-xl border px-3 py-2 text-left transition-all ${
                      isSelected
                        ? 'border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-600 dark:bg-cyan-900/20'
                        : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/70 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:hover:border-cyan-700/60 dark:hover:bg-cyan-900/10'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {day.dayLabel}
                    </p>
                    <p
                      className={`mt-1 text-lg font-semibold ${
                        isSelected
                          ? 'text-cyan-700 dark:text-cyan-300'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {day.dayNumber}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {day.total} appointments
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      {day.pending} pending
                    </p>
                    {day.isToday ? (
                      <span className="mt-1 inline-flex rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                        Today
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Checked In
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-600 dark:text-cyan-400">
                {stats.checkedIn}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                In Progress
              </p>
              <p className="mt-2 text-2xl font-semibold text-violet-600 dark:text-violet-400">
                {stats.inProgress}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appointments on {formatDate(selectedDate, 'long')}
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {appointments.length} records
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-3 py-10 text-gray-600 dark:text-gray-400">
                <Spinner />
                <span>Loading appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600 dark:border-[#2d4a6f] dark:text-gray-400">
                No clinic appointments on this day. Choose another day in the
                weekly strip above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-[#2d4a6f] dark:text-gray-400">
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Patient</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      const primaryAction = getPrimaryActionConfig(appointment);
                      const canMarkNoShow =
                        appointment.status !== 'Completed' &&
                        appointment.status !== 'Cancelled' &&
                        appointment.status !== 'NoShow';

                      return (
                        <tr
                          key={appointment.id}
                          className="border-b border-gray-100 align-top dark:border-[#2d4a6f]"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                              <Clock className="h-3.5 w-3.5" />
                              {formatSlotTime(appointment.startTime)} -{' '}
                              {formatSlotTime(appointment.endTime)}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-900 dark:text-white">
                            {appointment.patientId.slice(0, 8)}...
                          </td>
                          <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                            {appointment.visitReason || '-'}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[appointment.status] ?? statusStyles.Pending}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {primaryAction ? (
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() =>
                                    void runAction(
                                      primaryAction.action,
                                      primaryAction.successMessage
                                    )
                                  }
                                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition-all active:scale-[0.99] disabled:cursor-not-allowed ${primaryAction.buttonClass}`}
                                >
                                  <primaryAction.icon className="h-4 w-4" />
                                  {primaryAction.label}
                                </button>
                              ) : (
                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  No primary action
                                </span>
                              )}

                              {canMarkNoShow ? (
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() =>
                                    void runAction(
                                      () =>
                                        noShowMutation.mutateAsync(
                                          appointment.id
                                        ),
                                      'Đã đánh dấu no-show cho lịch khám.'
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20"
                                >
                                  <UserX className="h-4 w-4" />
                                  Mark no-show
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
