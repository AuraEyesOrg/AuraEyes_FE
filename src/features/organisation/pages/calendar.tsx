import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  QrCode,
  X,
  UserX,
} from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
  getStartOfWeekMonday,
  getWeekOffsetFromDateKey,
  formatWeekDayLabel,
  formatWeekRange,
  toLocalDateKey,
} from '@/lib/date-utils';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const DAYS_PER_WEEK = 7;
const CLINIC_CHECKIN_QR_PREFIX = 'AURA-CLINIC-APPOINTMENT';
const CLINIC_QR_READER_ID = 'organisation-clinic-checkin-qr-reader';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** All states in order for the pipeline strip */
const PIPELINE_STEPS = [
  'Pending',
  'Confirmed',
  'CheckedIn',
  'InProgress',
  'Completed',
] as const;

const STATUS_STEP_INDEX: Record<string, number> = {
  Pending: 0,
  Confirmed: 1,
  CheckedIn: 2,
  InProgress: 3,
  Completed: 4,
  Cancelled: -1,
  NoShow: -1,
};

const statusBadge: Record<string, string> = {
  Pending:
    'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Confirmed: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CheckedIn:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  InProgress:
    'bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  Completed:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  Cancelled: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  NoShow:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};

/** Left accent stripe by active status */
const cardAccent: Record<string, string> = {
  Pending: 'border-l-amber-400',
  Confirmed: 'border-l-blue-400',
  CheckedIn: 'border-l-emerald-500',
  InProgress: 'border-l-violet-500',
  Completed: 'border-l-(--border-color)',
  Cancelled: 'border-l-red-300',
  NoShow: 'border-l-(--border-color)',
};

/** Avatar background by status */
const avatarColors: Record<string, string> = {
  Pending:
    'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Confirmed: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CheckedIn:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  InProgress:
    'bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  Completed:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  Cancelled: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  NoShow:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'PT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function getPatientInitials(appointment: {
  patientId: string;
  patientName?: string | null;
}) {
  const patientName = appointment.patientName?.trim();
  return getInitials(patientName || appointment.patientId);
}

function parseClinicCheckInQrPayload(rawValue: string): {
  appointmentId: string;
  organisationId?: string;
  dateKey?: string;
} | null {
  const value = rawValue.trim();
  if (!value) return null;

  const parts = value.split('|').map((part) => part.trim());

  if (parts[0] === CLINIC_CHECKIN_QR_PREFIX) {
    const appointmentId = parts[1] ?? '';
    let organisationId = '';
    let dateKey = '';

    // Legacy payload:
    // AURA-CLINIC-APPOINTMENT|appointmentId|patientId|date|start|end
    if (parts.length >= 6) {
      dateKey = parts[3] ?? '';
    }

    // Extended payload:
    // AURA-CLINIC-APPOINTMENT|appointmentId|patientId|organisationId|date|start|end
    if (parts.length >= 7) {
      organisationId = parts[3] ?? '';
      dateKey = parts[4] ?? '';
    }

    if (!UUID_REGEX.test(appointmentId)) return null;

    return {
      appointmentId,
      organisationId: UUID_REGEX.test(organisationId)
        ? organisationId
        : undefined,
      dateKey: /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : undefined,
    };
  }

  if (UUID_REGEX.test(value)) {
    return { appointmentId: value };
  }

  return null;
}

function isFutureDateKey(dateKey: string | undefined, todayKey: string) {
  if (!dateKey) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  return dateKey > todayKey;
}

export default function CalendarPage() {
  const { user } = useAuthStore();
  const { t } = useSafeTranslation();
  const organisationId = user?.organizationId ?? '';

  const todayKey = toLocalDateKey(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scanTargetAppointmentId, setScanTargetAppointmentId] = useState<
    string | null
  >(null);

  const weekWindow = useMemo(() => {
    const weekStart = getStartOfWeekMonday(new Date());
    weekStart.setDate(weekStart.getDate() + currentWeekOffset * DAYS_PER_WEEK);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + DAYS_PER_WEEK - 1);
    const days = Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dateKey = toLocalDateKey(day);
      return {
        dateKey,
        dayLabel: formatWeekDayLabel(day),
        dayNumber: day.getDate(),
        isToday: dateKey === todayKey,
      };
    });
    return { label: formatWeekRange(weekStart, weekEnd), days };
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
    (d) => d.dateKey === selectedDate
  );
  const selectedDayQuery =
    selectedDayIndex >= 0 ? weekAppointmentQueries[selectedDayIndex] : null;
  const appointments = selectedDayQuery?.data ?? [];
  const isLoading = selectedDayQuery?.isLoading ?? false;
  const isFetching = selectedDayQuery?.isFetching ?? false;
  const appointmentsError = selectedDayQuery?.error;

  const weekDaySummaries = weekWindow.days.map((day, i) => {
    const items = weekAppointmentQueries[i]?.data ?? [];
    return {
      ...day,
      total: items.length,
      pending: items.filter((a) => a.status === 'Pending').length,
    };
  });

  const checkInMutation = useCheckInClinicAppointment();
  const startMutation = useStartClinicAppointment();
  const completeMutation = useCompleteClinicAppointment();
  const noShowMutation = useMarkNoShowClinicAppointment();

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'Pending').length,
      checkedIn: appointments.filter((a) => a.status === 'CheckedIn').length,
      inProgress: appointments.filter((a) => a.status === 'InProgress').length,
    }),
    [appointments]
  );

  const isMutating =
    checkInMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    noShowMutation.isPending;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending':
        return t('Organisation.calendar.status.pending', 'Pending');
      case 'Confirmed':
        return t('Organisation.calendar.status.confirmed', 'Confirmed');
      case 'CheckedIn':
        return t('Organisation.calendar.status.checkedIn', 'Checked in');
      case 'InProgress':
        return t('Organisation.calendar.status.inProgress', 'In progress');
      case 'Completed':
        return t('Organisation.calendar.status.completed', 'Completed');
      case 'Cancelled':
        return t('Organisation.calendar.status.cancelled', 'Cancelled');
      case 'NoShow':
        return t('Organisation.calendar.status.noShow', 'No-show');
      default:
        return status;
    }
  };

  useEffect(() => {
    const inWeek = weekWindow.days.some((d) => d.dateKey === selectedDate);
    if (!inWeek && weekWindow.days[0])
      setSelectedDate(weekWindow.days[0].dateKey);
  }, [selectedDate, weekWindow.days]);

  useEffect(() => {
    if (appointmentsError)
      toast.error(mapClinicStaffErrorMessage(appointmentsError));
  }, [appointmentsError]);

  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
    setCurrentWeekOffset(getWeekOffsetFromDateKey(dateKey));
  };

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!isQrScannerOpen) return;

    let scanner: Html5QrcodeScanner | null = null;
    let hasHandledScan = false;

    scanner = new Html5QrcodeScanner(
      CLINIC_QR_READER_ID,
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (hasHandledScan) return;
        hasHandledScan = true;

        void scanner
          ?.clear()
          .catch(() => undefined)
          .finally(() => {
            setIsQrScannerOpen(false);
            setScanTargetAppointmentId(null);

            const parsed = parseClinicCheckInQrPayload(decodedText);
            if (!parsed) {
              toast.error(
                t(
                  'Organisation.calendar.toast.invalidQr',
                  'Invalid clinic check-in QR code.'
                )
              );
              return;
            }

            if (
              scanTargetAppointmentId &&
              parsed.appointmentId.toLowerCase() !==
                scanTargetAppointmentId.toLowerCase()
            ) {
              toast.error(
                t(
                  'Organisation.calendar.toast.qrNotMatchAppointment',
                  'This QR code does not match the selected appointment.'
                )
              );
              return;
            }

            if (
              parsed.organisationId &&
              organisationId &&
              parsed.organisationId.toLowerCase() !==
                organisationId.toLowerCase()
            ) {
              toast.error(
                t(
                  'Organisation.calendar.toast.qrNotBelongOrganisation',
                  'This QR code does not belong to your organisation.'
                )
              );
              return;
            }

            if (parsed.dateKey) {
              if (isFutureDateKey(parsed.dateKey, todayKey)) {
                toast.error(
                  t(
                    'Organisation.calendar.toast.qrBeforeAppointmentDate',
                    'Cannot check in before the appointment date.'
                  )
                );
                return;
              }
              setSelectedDate(parsed.dateKey);
              setCurrentWeekOffset(getWeekOffsetFromDateKey(parsed.dateKey));
            }

            const matchedAppointmentDateKey =
              weekWindow.days.find((day, index) =>
                (weekAppointmentQueries[index]?.data ?? []).some(
                  (appointment) =>
                    appointment.id.toLowerCase() ===
                    (
                      scanTargetAppointmentId ?? parsed.appointmentId
                    ).toLowerCase()
                )
              )?.dateKey ?? null;

            const effectiveDateKey =
              parsed.dateKey ?? matchedAppointmentDateKey ?? selectedDate;

            if (isFutureDateKey(effectiveDateKey ?? undefined, todayKey)) {
              toast.error(
                t(
                  'Organisation.calendar.toast.qrBeforeAppointmentDate',
                  'Cannot check in before the appointment date.'
                )
              );
              return;
            }

            void (async () => {
              try {
                await checkInMutation.mutateAsync(
                  scanTargetAppointmentId ?? parsed.appointmentId
                );
                toast.success(
                  t(
                    'Organisation.calendar.toast.qrCheckInSuccess',
                    'Check-in successful via QR.'
                  )
                );
              } catch (error) {
                toast.error(mapClinicStaffErrorMessage(error));
              }
            })();
          });
      },
      () => {
        // Ignore frame-level decode failures while camera is active.
      }
    );

    return () => {
      void scanner
        ?.clear()
        .catch(() => undefined)
        .finally(() => {
          scanner = null;
        });
    };
  }, [
    checkInMutation,
    isQrScannerOpen,
    organisationId,
    scanTargetAppointmentId,
    selectedDate,
    t,
    todayKey,
    weekAppointmentQueries,
    weekWindow.days,
  ]);

  const getPrimaryAction = (appointment: (typeof appointments)[number]) => {
    if (appointment.status === 'CheckedIn')
      return {
        label: t(
          'Organisation.calendar.actions.startConsultation',
          'Start consultation'
        ),
        icon: Play,
        successMessage: t(
          'Organisation.calendar.toast.consultationStarted',
          'Consultation started.'
        ),
        className:
          'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50',
        action: () => startMutation.mutateAsync(appointment.id),
      };
    if (appointment.status === 'InProgress')
      return {
        label: t(
          'Organisation.calendar.actions.completeVisit',
          'Complete visit'
        ),
        icon: Calendar,
        successMessage: t(
          'Organisation.calendar.toast.visitCompleted',
          'Visit completed.'
        ),
        className:
          'bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50',
        action: () =>
          completeMutation.mutateAsync({ appointmentId: appointment.id }),
      };
    return null;
  };

  const canMarkNoShow = (status: string) =>
    !['Completed', 'Cancelled', 'NoShow'].includes(status);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar pendingCount={stats.pending} />

      <div className="h-full flex-1 overflow-y-auto">
        <OrganisationHeader
          pageName={t('Organisation.calendar.pageName', 'Calendar')}
        />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* ── Left column: week strip + stats ── */}
            <div className="flex flex-col gap-3">
              {/* Week navigator */}
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((p) => p - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-(--text-primary)">
                    {weekWindow.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((p) => p + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-0.5">
                  {weekDaySummaries.map((day) => {
                    const isSelected = day.dateKey === selectedDate;
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => setSelectedDate(day.dateKey)}
                        className={[
                          'flex items-center justify-between rounded-lg px-2.5 py-2 transition',
                          isSelected
                            ? 'bg-cyan-50 dark:bg-cyan-900/20'
                            : 'hover:bg-(--bg-secondary)',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 text-center text-base font-medium ${isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-(--text-primary)'}`}
                          >
                            {day.dayNumber}
                          </span>
                          <span
                            className={`text-xs ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-(--text-secondary)'}`}
                          >
                            {day.dayLabel}
                          </span>
                          {day.isToday && (
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                          )}
                        </div>
                        {day.pending > 0 ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {day.pending}
                          </span>
                        ) : day.total > 0 ? (
                          <span className="rounded-full bg-(--bg-secondary) px-2 py-0.5 text-[10px] text-(--text-muted)">
                            {day.total}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-(--border-color) pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentWeekOffset(0);
                      setSelectedDate(todayKey);
                    }}
                    className="w-full rounded-lg border border-cyan-200 bg-cyan-50 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800/60 dark:bg-cyan-900/20 dark:text-cyan-300"
                  >
                    {t('Organisation.common.today', 'Today')}
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-2 py-1.5 text-xs text-(--text-primary)"
                  />
                </div>
              </div>

              {/* Day stats */}
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                  {formatDate(selectedDate, 'short')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: t('Organisation.calendar.stats.total', 'Total'),
                      value: stats.total,
                      color: 'text-(--text-primary)',
                    },
                    {
                      label: t(
                        'Organisation.calendar.stats.pending',
                        'Pending'
                      ),
                      value: stats.pending,
                      color: 'text-amber-600 dark:text-amber-400',
                    },
                    {
                      label: t(
                        'Organisation.calendar.stats.checkedIn',
                        'Checked in'
                      ),
                      value: stats.checkedIn,
                      color: 'text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      label: t(
                        'Organisation.calendar.stats.inProgress',
                        'In progress'
                      ),
                      value: stats.inProgress,
                      color: 'text-violet-600 dark:text-violet-400',
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg bg-(--bg-secondary) p-2.5"
                    >
                      <p className="text-[10px] text-(--text-muted)">
                        {s.label}
                      </p>
                      <p className={`mt-0.5 text-xl font-medium ${s.color}`}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column: appointment cards ── */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-medium text-(--text-primary)">
                  {formatDate(selectedDate, 'long')}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-(--text-muted)">
                    {t(
                      'Organisation.calendar.summary.records',
                      '{{count}} records',
                      {
                        count: appointments.length,
                      }
                    )}
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-3 py-12 text-(--text-secondary)">
                  <Spinner />
                  {t(
                    'Organisation.calendar.states.loadingAppointments',
                    'Loading appointments...'
                  )}
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-(--border-color) py-14 text-center text-sm text-(--text-muted)">
                  {t(
                    'Organisation.calendar.states.noAppointments',
                    'No appointments on this day.'
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appointments.map((appt) => {
                    const primaryAction = getPrimaryAction(appt);
                    const stepIdx = STATUS_STEP_INDEX[appt.status] ?? 0;
                    const isTerminal = [
                      'Completed',
                      'Cancelled',
                      'NoShow',
                    ].includes(appt.status);
                    const patientDisplayName =
                      appt.patientName?.trim() ||
                      t(
                        'Organisation.calendar.patient.fallback',
                        'Patient {{id}}',
                        { id: appt.patientId.slice(0, 8) }
                      );
                    const initials = getPatientInitials(appt);
                    const patientAvatarUrl =
                      appt.patientAvatarUrl?.trim() || '';

                    return (
                      <div
                        key={appt.id}
                        className={[
                          'rounded-xl border border-l-4 bg-(--bg-primary) p-4 transition hover:border-r-cyan-100',
                          cardAccent[appt.status] ??
                            'border-l-(--border-color)',
                          'border-t border-r border-b border-(--border-color)',
                        ].join(' ')}
                      >
                        {/* Pipeline strip */}
                        {!isTerminal && (
                          <div className="mb-3 flex items-center gap-1 overflow-x-auto pb-1">
                            {PIPELINE_STEPS.map((step, i) => (
                              <div
                                key={step}
                                className="flex shrink-0 items-center gap-1"
                              >
                                <span
                                  className={[
                                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                    i < stepIdx
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                      : i === stepIdx
                                        ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                                        : 'bg-(--bg-secondary) text-(--text-muted)',
                                  ].join(' ')}
                                >
                                  {getStatusDisplay(step)}
                                </span>
                                {i < PIPELINE_STEPS.length - 1 && (
                                  <span className="text-[10px] text-(--text-muted)">
                                    ›
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Card header */}
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium ${avatarColors[appt.status] ?? avatarColors.Pending}`}
                            >
                              <span>{initials}</span>
                              {patientAvatarUrl && (
                                <img
                                  src={patientAvatarUrl}
                                  alt={patientDisplayName}
                                  className="absolute inset-0 h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-(--text-primary)">
                                {patientDisplayName}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-(--text-muted)">
                                <Clock className="h-3 w-3" />
                                {formatSlotTime(appt.startTime)} –{' '}
                                {formatSlotTime(appt.endTime)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge[appt.status] ?? statusBadge.Pending}`}
                          >
                            {getStatusDisplay(appt.status)}
                          </span>
                        </div>

                        {/* Reason */}
                        {appt.visitReason && (
                          <p className="mb-3 text-xs italic text-(--text-secondary)">
                            {appt.visitReason}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {appt.status === 'Pending' ? (
                            <button
                              type="button"
                              disabled={
                                isMutating ||
                                !organisationId ||
                                selectedDate > todayKey
                              }
                              onClick={() => {
                                if (selectedDate > todayKey) {
                                  toast.error(
                                    t(
                                      'Organisation.calendar.toast.qrBeforeAppointmentDate',
                                      'Cannot check in before the appointment date.'
                                    )
                                  );
                                  return;
                                }
                                setScanTargetAppointmentId(appt.id);
                                setIsQrScannerOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              {t(
                                'Organisation.calendar.actions.scanQrCheckIn',
                                'Scan QR check-in'
                              )}
                            </button>
                          ) : primaryAction ? (
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() =>
                                void runAction(
                                  primaryAction.action,
                                  primaryAction.successMessage
                                )
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${primaryAction.className}`}
                            >
                              <primaryAction.icon className="h-3.5 w-3.5" />
                              {primaryAction.label}
                            </button>
                          ) : isTerminal ? (
                            <span className="text-xs italic text-(--text-muted)">
                              {appt.status === 'Completed' &&
                                t(
                                  'Organisation.calendar.states.terminal.completed',
                                  'Visit completed'
                                )}
                              {appt.status === 'NoShow' &&
                                t(
                                  'Organisation.calendar.states.terminal.noShow',
                                  'Marked as no-show'
                                )}
                              {appt.status === 'Cancelled' &&
                                t(
                                  'Organisation.calendar.states.terminal.cancelled',
                                  'Appointment cancelled'
                                )}
                            </span>
                          ) : null}

                          {canMarkNoShow(appt.status) && (
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() =>
                                void runAction(
                                  () => noShowMutation.mutateAsync(appt.id),
                                  t(
                                    'Organisation.calendar.toast.markedNoShow',
                                    'Marked as no-show.'
                                  )
                                )
                              }
                              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              {t(
                                'Organisation.calendar.actions.noShow',
                                'No-show'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isQrScannerOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--bg-primary) p-4 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  {t(
                    'Organisation.calendar.qrModal.title',
                    'Scan QR for check-in'
                  )}
                </h3>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {t(
                    'Organisation.calendar.qrModal.subtitle',
                    'Point the camera at the patient appointment QR code.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQrScannerOpen(false);
                  setScanTargetAppointmentId(null);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) transition hover:bg-(--bg-secondary)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-(--border-color) bg-black">
              <div id={CLINIC_QR_READER_ID} className="w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
