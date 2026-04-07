import { useMemo, useState, useEffect } from 'react';
import { Calendar, Clock, Play, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import useAuthStore from '@/store/auth-store';
import {
  useCheckInClinicAppointment,
  useCompleteClinicAppointment,
  useMarkNoShowClinicAppointment,
  useOrganisationAppointments,
  useStartClinicAppointment,
} from '../hooks/use-organisation-clinic-booking';
import { mapClinicStaffErrorMessage } from '@/lib/api-error';
import { formatSlotTime, toLocalDateKey } from '@/lib/date-utils';

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

  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()));

  const {
    data: appointments = [],
    isLoading,
    isFetching,
    error: appointmentsError,
  } = useOrganisationAppointments(
    organisationId,
    selectedDate,
    !!organisationId
  );

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
    if (appointmentsError) {
      toast.error(mapClinicStaffErrorMessage(appointmentsError));
    }
  }, [appointmentsError]);

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar pendingCount={stats.pending} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Calendar" />

        <main className="p-6">
          {' '}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Organisation Clinic Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage check-in and consultation progress.
              </p>
            </div>

            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#2d4a6f] dark:bg-[#1e3a5f] dark:text-white"
                />
              </div>
              {isFetching && <Spinner />}
            </div>
          </div>
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
            {isLoading ? (
              <div className="flex items-center gap-3 py-10 text-gray-600 dark:text-gray-400">
                <Spinner />
                <span>Loading appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600 dark:border-[#2d4a6f] dark:text-gray-400">
                No clinic appointments for selected date.
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
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
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
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={
                                appointment.status !== 'Pending' || isMutating
                              }
                              onClick={() =>
                                void runAction(
                                  () =>
                                    checkInMutation.mutateAsync(appointment.id),
                                  'Check-in thành công.'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Check-in
                            </button>
                            <button
                              type="button"
                              disabled={
                                appointment.status !== 'CheckedIn' || isMutating
                              }
                              onClick={() =>
                                void runAction(
                                  () =>
                                    startMutation.mutateAsync(appointment.id),
                                  'Đã chuyển lịch khám sang trạng thái In Progress.'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </button>
                            <button
                              type="button"
                              disabled={
                                appointment.status !== 'InProgress' ||
                                isMutating
                              }
                              onClick={() =>
                                void runAction(
                                  () =>
                                    completeMutation.mutateAsync({
                                      appointmentId: appointment.id,
                                    }),
                                  'Đã hoàn thành lịch khám.'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Complete
                            </button>
                            <button
                              type="button"
                              disabled={
                                isMutating ||
                                appointment.status === 'Completed' ||
                                appointment.status === 'Cancelled'
                              }
                              onClick={() =>
                                void runAction(
                                  () =>
                                    noShowMutation.mutateAsync(appointment.id),
                                  'Đã đánh dấu no-show cho lịch khám.'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              No-show
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
