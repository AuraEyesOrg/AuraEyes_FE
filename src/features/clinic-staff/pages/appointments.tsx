import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Play,
  QrCode,
  X,
  UserX,
  UserPlus,
  Banknote,
  CreditCard,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import CreateWalkInPatientModal from '@/features/organisation/components/CreateWalkInPatientModal';
import {
  getClinicRecentPatients,
  type ClinicRecentPatientDto,
} from '@/features/organisation/api/patients.api';
import { getCurrentClinicAppointments } from '@/features/organisation/api/organisation-clinic-booking.api';
import {
  organisationClinicBookingKeys,
  useCheckInClinicAppointment,
  useCompleteClinicAppointment,
  useClinicStaffAvailableSlots,
  useCreateClinicStaffAppointment,
  useMarkNoShowClinicAppointment,
  useStartClinicAppointment,
  useCompleteOrderPayment,
} from '@/features/organisation/hooks/use-organisation-clinic-booking';
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
import ClinicStaffLayout from '../components/ClinicStaffLayout';

const DAYS_PER_WEEK = 7;
const CLINIC_CHECKIN_QR_PREFIX = 'AURA-CLINIC-APPOINTMENT';
const CLINIC_QR_READER_ID = 'clinic-staff-checkin-qr-reader';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PIPELINE_STEPS = [
  'Pending',
  'Confirmed',
  'CheckedIn',
  'InProgress',
  'WaitingForPayment',
  'Completed',
] as const;

const STATUS_STEP_INDEX: Record<string, number> = {
  Pending: 0,
  Confirmed: 1,
  CheckedIn: 2,
  InProgress: 3,
  WaitingForPayment: 4,
  Completed: 5,
  Cancelled: -1,
  NoShow: -1,
};

const statusBadge: Record<string, string> = {
  Pending:
    'bg-amber-100/50 text-amber-700 border border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
  Confirmed:
    'bg-sky-100/50 text-sky-700 border border-sky-200/50 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/30',
  CheckedIn:
    'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
  InProgress:
    'bg-violet-100/50 text-violet-700 border border-violet-200/50 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/30',
  WaitingForPayment:
    'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Completed:
    'bg-slate-100/80 text-slate-600 border border-slate-200/50 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30',
  Cancelled:
    'bg-rose-100/50 text-rose-700 border border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
  NoShow:
    'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Booked:
    'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
  DepositPaid:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
};

const cardAccent: Record<string, string> = {
  Pending: 'before:bg-amber-400',
  Confirmed: 'before:bg-blue-400',
  CheckedIn: 'before:bg-emerald-500',
  InProgress: 'before:bg-violet-500',
  WaitingForPayment: 'before:bg-rose-500',
  Completed: 'before:bg-slate-300',
  Cancelled: 'before:bg-rose-400',
  NoShow: 'before:bg-slate-400',
  Booked: 'before:bg-blue-500',
};

const avatarColors: Record<string, string> = {
  Pending:
    'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 dark:from-amber-900/40 dark:to-amber-900/60 dark:text-amber-300',
  Confirmed:
    'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-900/60 dark:text-blue-300',
  CheckedIn:
    'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-900/40 dark:to-emerald-900/60 dark:text-emerald-300',
  InProgress:
    'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700 dark:from-violet-900/40 dark:to-violet-900/60 dark:text-violet-300',
  WaitingForPayment:
    'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 dark:from-rose-900/40 dark:to-rose-900/60 dark:text-rose-300',
  Completed:
    'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 dark:from-slate-800/40 dark:to-slate-800/60 dark:text-slate-400',
  Cancelled:
    'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 dark:from-rose-900/40 dark:to-rose-900/60 dark:text-rose-300',
  NoShow:
    'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800/60 dark:to-slate-800/80 dark:text-slate-400',
  Booked:
    'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-900/60 dark:text-blue-300',
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
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  return dateKey > todayKey;
}

export default function ClinicStaffAppointmentsPage() {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { i18n: i18nObj } = useTranslation();
  const organisationId = 'current-clinic';

  const todayKey = toLocalDateKey(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scanTargetAppointmentId, setScanTargetAppointmentId] = useState<
    string | null
  >(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [appointmentToPay, setAppointmentToPay] = useState<any>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] =
    useState(false);
  const [walkInDate, setWalkInDate] = useState(todayKey);
  const [walkInPatientSearch, setWalkInPatientSearch] = useState('');
  const [selectedWalkInPatientId, setSelectedWalkInPatientId] = useState('');
  const [selectedWalkInSlotId, setSelectedWalkInSlotId] = useState('');
  const [walkInVisitReason, setWalkInVisitReason] = useState('');

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
      queryFn: () => getCurrentClinicAppointments(day.dateKey),
      enabled: true,
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
  const appointmentsError = selectedDayQuery?.error;
  const recentPatientsQuery = useQuery({
    queryKey: ['clinic-patients', 'recent'],
    queryFn: getClinicRecentPatients,
    enabled: isWalkInModalOpen,
    staleTime: 30_000,
  });
  const availableSlotsQuery = useClinicStaffAvailableSlots(
    walkInDate,
    isWalkInModalOpen
  );

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
  const payRemainingMutation = useCompleteOrderPayment();
  const createWalkInAppointmentMutation = useCreateClinicStaffAppointment();

  const patientOptions = useMemo(() => {
    const search = walkInPatientSearch.trim().toLowerCase();
    const patients = recentPatientsQuery.data ?? [];
    if (!search) return patients;

    return patients.filter((patient) => {
      const haystack = [
        patient.name,
        patient.phoneNumber,
        patient.citizenId,
        patient.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [recentPatientsQuery.data, walkInPatientSearch]);

  const selectedWalkInPatient = useMemo(
    () =>
      (recentPatientsQuery.data ?? []).find(
        (patient) => patient.id === selectedWalkInPatientId
      ) ?? null,
    [recentPatientsQuery.data, selectedWalkInPatientId]
  );

  const availableWalkInSlots = useMemo(
    () =>
      (availableSlotsQuery.data ?? []).filter(
        (slot) => slot.status === 'Available' && slot.availableCapacity > 0
      ),
    [availableSlotsQuery.data]
  );

  const selectedWalkInSlot = useMemo(
    () =>
      availableWalkInSlots.find((slot) => slot.id === selectedWalkInSlotId) ??
      null,
    [availableWalkInSlots, selectedWalkInSlotId]
  );

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
    noShowMutation.isPending ||
    payRemainingMutation.isPending ||
    createWalkInAppointmentMutation.isPending;

  const getStatusDisplay = (appointment: (typeof appointments)[number]) => {
    const { status, isPaidDeposit } = appointment;
    switch (status) {
      case 'Pending':
        return isPaidDeposit
          ? t('Organisation.calendar.status.depositPaid', 'Deposit Paid')
          : t('Organisation.calendar.status.pending', 'Pending');
      case 'Confirmed':
        return isPaidDeposit
          ? t('Organisation.calendar.status.depositPaid', 'Deposit Paid')
          : t('Organisation.calendar.status.confirmed', 'Confirmed');
      case 'CheckedIn':
        return t('Organisation.calendar.status.checkedIn', 'Checked in');
      case 'InProgress':
        return t('Organisation.calendar.status.inProgress', 'In progress');
      case 'WaitingForPayment':
        if (
          appointment.orderStatus === 'FullyPaid' ||
          (appointment.remainingAmount ?? 0) <= 0
        ) {
          return t('Organisation.calendar.status.completed', 'Completed');
        }
        return t(
          'Organisation.calendar.status.waitingForPayment',
          'Waiting for payment'
        );
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
    if (!inWeek && weekWindow.days[0]) {
      setSelectedDate(weekWindow.days[0].dateKey);
    }
  }, [selectedDate, weekWindow.days]);

  useEffect(() => {
    if (appointmentsError)
      toast.error(mapClinicStaffErrorMessage(appointmentsError));
  }, [appointmentsError]);

  useEffect(() => {
    setSelectedWalkInSlotId('');
  }, [walkInDate]);

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

  const resetWalkInForm = () => {
    setWalkInDate(todayKey);
    setWalkInPatientSearch('');
    setSelectedWalkInPatientId('');
    setSelectedWalkInSlotId('');
    setWalkInVisitReason('');
  };

  const closeWalkInModal = () => {
    setIsWalkInModalOpen(false);
    resetWalkInForm();
  };

  const openWalkInModal = () => {
    setWalkInDate(selectedDate >= todayKey ? selectedDate : todayKey);
    setIsWalkInModalOpen(true);
  };

  const getPatientMeta = (patient: ClinicRecentPatientDto) =>
    [
      patient.isWalkIn
        ? t('Organisation.patients.type.walkIn', 'Walk-in')
        : t('Organisation.patients.type.registered', 'Registered'),
      patient.phoneNumber,
      patient.citizenId,
    ]
      .filter(Boolean)
      .join(' • ');

  const handleCreateWalkInAppointment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedWalkInPatientId || !selectedWalkInSlotId) {
      toast.error(
        t(
          'Organisation.calendar.toast.walkInMissingFields',
          'Please choose a patient and an available slot.'
        )
      );
      return;
    }

    try {
      const locale = i18nObj.language === 'en' ? '/en' : '/vi';
      const result = await createWalkInAppointmentMutation.mutateAsync({
        patientId: selectedWalkInPatientId,
        slotId: selectedWalkInSlotId,
        visitReason: walkInVisitReason.trim() || undefined,
        returnUrl: `${window.location.origin}${locale}/patient/wallet/payment-callback?type=clinic-booking`,
        cancelUrl: `${window.location.origin}${locale}/patient/wallet/payment-callback?type=clinic-booking&cancel=true`,
      });

      if (result.paymentUrl) {
        toast.info(
          `Đặt lịch thành công! Đang chuyển đến trang thanh toán đặt cọc ${(result.depositAmount ?? 0).toLocaleString('vi-VN')} VND...`
        );
        setTimeout(() => {
          window.location.href = result.paymentUrl!;
        }, 1500);
        return;
      }

      setSelectedDate(walkInDate);
      setCurrentWeekOffset(getWeekOffsetFromDateKey(walkInDate));
      toast.success(
        t(
          'Organisation.calendar.toast.walkInCreated',
          'Walk-in appointment created and added to the queue.'
        )
      );
      closeWalkInModal();
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
      { qrbox: { width: 250, height: 250 }, fps: 5 },
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
      () => {}
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
    if (appointment.status === 'CheckedIn') {
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
    }
    if (appointment.status === 'InProgress') {
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
    }
    return null;
  };

  return (
    <ClinicStaffLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6">
          {/* Week Calendar Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-slate-50/50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentWeekOffset((p) => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {weekWindow.label}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentWeekOffset((p) => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col p-2">
              {weekDaySummaries.map((day) => {
                const isSelected = day.dateKey === selectedDate;
                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(day.dateKey)}
                    className={[
                      'group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300',
                      isSelected
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-white/70' : 'text-slate-400'}`}
                        >
                          {day.dayLabel}
                        </span>
                        <span className="text-lg font-black leading-none">
                          {day.dayNumber}
                        </span>
                      </div>
                      {day.isToday && (
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand'}`}
                        />
                      )}
                    </div>
                    {day.pending > 0 ? (
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-600'}`}
                      >
                        {day.pending}P
                      </span>
                    ) : day.total > 0 ? (
                      <span
                        className={`text-[10px] font-bold ${isSelected ? 'text-white/60' : 'text-slate-400'}`}
                      >
                        {day.total}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentWeekOffset(0);
                  setSelectedDate(todayKey);
                }}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 dark:bg-brand dark:hover:bg-brand/90"
              >
                {t('Organisation.common.today', 'Today')}
              </button>
              <div className="mt-3 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none transition-all focus:border-brand/50 focus:ring-4 focus:ring-brand/5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {formatDate(selectedDate, 'short')}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  label: t('Organisation.calendar.stats.total', 'Total'),
                  value: stats.total,
                  color:
                    'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white',
                  icon: Calendar,
                },
                {
                  label: t('Organisation.calendar.stats.pending', 'Pending'),
                  value: stats.pending,
                  color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  icon: Clock,
                },
                {
                  label: t(
                    'Organisation.calendar.stats.checkedIn',
                    'Checked in'
                  ),
                  value: stats.checkedIn,
                  color:
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  icon: CheckCircle,
                },
                {
                  label: t(
                    'Organisation.calendar.stats.inProgress',
                    'In progress'
                  ),
                  value: stats.inProgress,
                  color:
                    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                  icon: Play,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-between rounded-2xl p-3 ${s.color}`}
                >
                  <div className="flex items-center gap-3">
                    <s.icon className="h-4 w-4 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-lg font-black">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatDate(selectedDate, 'long')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openWalkInModal}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4" />
                  {t('Organisation.calendar.actions.newWalkIn', 'New Walk-in')}
                </button>
                <span className="h-1 w-6 rounded-full bg-brand" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t(
                    'Organisation.calendar.summary.records',
                    '{{count}} total appointments',
                    {
                      count: appointments.length,
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {/* Visual flair: stack of avatars or something */}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
              <Spinner className="h-10 w-10 text-brand" />
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
                {t(
                  'Organisation.calendar.states.loadingAppointments',
                  'Syncing appointments...'
                )}
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800 mb-6">
                <Calendar className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {t(
                  'Organisation.calendar.states.noAppointments',
                  'Quiet day today'
                )}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                No appointments have been scheduled for this date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
                    {
                      id: appt.patientId.slice(0, 8),
                    }
                  );
                const initials = getPatientInitials(appt);
                const patientAvatarUrl = appt.patientAvatarUrl?.trim() || '';

                return (
                  <article
                    key={appt.id}
                    className={[
                      'group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 dark:border-slate-800 dark:bg-slate-900/80',
                      'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5',
                      cardAccent[appt.status] ?? 'before:bg-slate-200',
                    ].join(' ')}
                  >
                    {!isTerminal && (
                      <div className="mb-6 flex items-center gap-1">
                        {PIPELINE_STEPS.map((step, i) => (
                          <div
                            key={step}
                            className="flex items-center gap-1 flex-1 max-w-[120px]"
                          >
                            <div
                              className={[
                                'h-1.5 flex-1 rounded-full transition-all duration-500',
                                i < stepIdx
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                                  : i === stepIdx
                                    ? 'bg-brand shadow-sm shadow-brand/20 animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800',
                              ].join(' ')}
                            />
                            {i === stepIdx && (
                              <span className="text-[8px] font-black uppercase tracking-tighter text-brand absolute -top-4">
                                {getStatusDisplay(appt)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                      <div className="flex items-center gap-5 min-w-0 flex-1">
                        {/* Avatar Section */}
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] text-lg font-black shadow-inner transition-transform group-hover:scale-105 ${avatarColors[appt.status] ?? avatarColors.Pending}`}
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
                          <div
                            className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-lg border-4 border-white dark:border-slate-900 flex items-center justify-center ${statusBadge[appt.status]}`}
                          >
                            <Clock className="h-3 w-3" />
                          </div>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {patientDisplayName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2 bg-brand/5 text-brand px-3 py-1 rounded-full border border-brand/10">
                              <Clock className="h-3.5 w-3.5" />
                              {formatSlotTime(appt.startTime)} -{' '}
                              {formatSlotTime(appt.endTime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(appt.date, 'short')}
                            </div>
                          </div>

                          {/* Consulting Doctor Badge */}
                          <div className="mt-3 flex items-center gap-3 p-2.5 pr-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 w-fit group/doc transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
                            <div className="relative shrink-0">
                              {appt.ophthalAvatarUrl ? (
                                <img
                                  src={appt.ophthalAvatarUrl}
                                  alt={appt.ophthalFullName ?? ''}
                                  className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand text-xs font-black border border-brand/20">
                                  {getInitials(appt.ophthalFullName || 'DR')}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                Consulting Doctor
                              </span>
                              <span className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover/doc:text-brand transition-colors">
                                {appt.ophthalFullName || 'Clinic Doctor'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        {(() => {
                          const isFullyPaid =
                            appt.orderStatus === 'FullyPaid' ||
                            (appt.remainingAmount ?? 0) <= 0;
                          const effectiveStatus =
                            appt.status === 'WaitingForPayment' && isFullyPaid
                              ? 'Completed'
                              : appt.status;

                          return (
                            <span
                              className={`rounded-xl px-4 py-1.5 text-[10px] font-black tracking-[0.1em] uppercase shadow-sm ${statusBadge[effectiveStatus] ?? statusBadge.Pending}`}
                            >
                              {getStatusDisplay(appt)}
                            </span>
                          );
                        })()}

                        {appt.orderId && (
                          <div className="flex flex-wrap justify-end gap-2">
                            {appt.orderStatus === 'Pending' && (
                              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-amber-600 border border-amber-500/20">
                                <Clock className="w-3.5 h-3.5" />
                                {t(
                                  'Organisation.calendar.states.billing.pending',
                                  'Pending Payment'
                                )}
                              </div>
                            )}
                            {appt.orderStatus === 'PartiallyPaid' && (
                              <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 border border-blue-500/20">
                                <CreditCard className="w-3.5 h-3.5" />
                                {t(
                                  'Organisation.calendar.states.billing.partiallyPaid',
                                  'Deposit Paid'
                                )}
                              </div>
                            )}
                            {appt.orderStatus === 'FullyPaid' && (
                              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t(
                                  'Organisation.calendar.states.billing.fullyPaid',
                                  'Fully Paid'
                                )}
                              </div>
                            )}
                            {appt.orderStatus === 'Cancelled' && (
                              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-600 border border-rose-500/20">
                                <UserX className="w-3.5 h-3.5" />
                                Cancelled
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bento Billing Box */}
                    {(appt.totalAmount || appt.orderId) && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-700">
                            <Receipt className="h-5 w-5 text-brand" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Total Bill
                            </p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {appt.totalAmount
                                ? new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(appt.totalAmount)
                                : '---'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 md:pl-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-700">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Paid Amount
                            </p>
                            <p className="text-sm font-black text-emerald-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(appt.paidAmount || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 md:pl-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-700">
                            <Banknote
                              className={`h-5 w-5 ${appt.remainingAmount === 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                            />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {appt.remainingAmount === 0
                                ? 'Balance'
                                : 'Remaining'}
                            </p>
                            <p
                              className={`text-sm font-black ${appt.remainingAmount === 0 ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}
                            >
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(appt.remainingAmount ?? 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {appt.visitReason &&
                      appt.visitReason !== 'Regular eye checkup' && (
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-500/5 p-4 border border-amber-500/10">
                          <div className="mt-0.5 rounded-lg bg-amber-500/10 p-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70">
                              Visit Reason
                            </p>
                            <p className="text-xs font-bold text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                              {appt.visitReason}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Actions Row */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-3">
                        {['Pending', 'Confirmed'].includes(appt.status) ? (
                          <button
                            type="button"
                            disabled={isMutating || selectedDate > todayKey}
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
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-600 px-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <QrCode className="h-4 w-4" />
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
                            className={`inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-50 ${primaryAction.className.includes('bg-violet') ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/20' : 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-cyan-500/20'}`}
                          >
                            <primaryAction.icon className="h-4 w-4" />
                            {primaryAction.label}
                          </button>
                        ) : null}

                        {/* Payment Action for Staff */}
                        {appt.orderId &&
                          (appt.remainingAmount ?? 0) > 0 &&
                          [
                            'CheckedIn',
                            'InProgress',
                            'WaitingForPayment',
                          ].includes(appt.status) && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => {
                                  setAppointmentToPay(appt);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-emerald-600 bg-white px-6 text-xs font-black uppercase tracking-widest text-emerald-600 transition-all hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/10 disabled:opacity-50 dark:bg-slate-900 dark:hover:bg-emerald-950/30"
                              >
                                <Banknote className="h-4 w-4" />
                                {t(
                                  'Organisation.calendar.actions.payRemaining',
                                  'Pay Balance'
                                )}
                              </button>

                              <button
                                type="button"
                                title="Sync Payment Status"
                                onClick={async () => {
                                  try {
                                    await import('../api/billing.api').then(
                                      (m) =>
                                        m.syncOrderPaymentStatus(appt.orderId!)
                                    );
                                    queryClient.invalidateQueries({
                                      queryKey:
                                        organisationClinicBookingKeys.all,
                                    });
                                    toast.success('Payment status synced');
                                  } catch (e) {
                                    toast.error(
                                      'Failed to sync payment status'
                                    );
                                  }
                                }}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-3">
                        {isTerminal ? (
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 dark:bg-slate-800">
                            <CheckCircle className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              {appt.status === 'Completed' &&
                                t(
                                  'Organisation.calendar.states.terminal.completed',
                                  'Visit archived'
                                )}
                              {appt.status === 'NoShow' &&
                                t(
                                  'Organisation.calendar.states.terminal.noShow',
                                  'No-show recorded'
                                )}
                              {appt.status === 'Cancelled' &&
                                t(
                                  'Organisation.calendar.states.terminal.cancelled',
                                  'Cancelled'
                                )}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() =>
                              void runAction(
                                () => noShowMutation.mutateAsync(appt.id),
                                t(
                                  'Organisation.calendar.toast.noShowMarked',
                                  'Marked as no-show.'
                                )
                              )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            <UserX className="h-4 w-4" />
                            {t(
                              'Organisation.calendar.actions.markNoShow',
                              'No-show'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-(--border-color) bg-(--bg-primary) shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-(--border-color) bg-(--bg-primary) p-5">
              <div>
                <h3 className="text-lg font-bold text-(--text-primary)">
                  {t(
                    'Organisation.calendar.walkInModal.title',
                    'Create Walk-in Appointment'
                  )}
                </h3>
                <p className="mt-1 text-sm text-(--text-muted)">
                  {t(
                    'Organisation.calendar.walkInModal.subtitle',
                    'The patient will be checked in and added to the clinic queue immediately.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={closeWalkInModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) transition hover:bg-(--bg-secondary)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateWalkInAppointment}
              className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
            >
              <section className="space-y-4">
                <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-(--text-primary)">
                        {t(
                          'Organisation.calendar.walkInModal.patient.title',
                          'Patient'
                        )}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {selectedWalkInPatient
                          ? getPatientMeta(selectedWalkInPatient)
                          : t(
                              'Organisation.calendar.walkInModal.patient.hint',
                              'Search by name, phone, citizen ID, or email.'
                            )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatePatientModalOpen(true)}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300"
                    >
                      <UserPlus className="h-4 w-4" />
                      {t(
                        'Organisation.calendar.walkInModal.patient.create',
                        'New patient'
                      )}
                    </button>
                  </div>

                  <input
                    type="search"
                    value={walkInPatientSearch}
                    onChange={(event) =>
                      setWalkInPatientSearch(event.target.value)
                    }
                    placeholder={t(
                      'Organisation.calendar.walkInModal.patient.search',
                      'Search patient...'
                    )}
                    className="mb-3 w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {recentPatientsQuery.isLoading ? (
                      <div className="flex items-center gap-2 py-6 text-sm text-(--text-secondary)">
                        <Spinner />
                        {t(
                          'Organisation.calendar.walkInModal.patient.loading',
                          'Loading patients...'
                        )}
                      </div>
                    ) : patientOptions.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-(--border-color) p-4 text-sm text-(--text-muted)">
                        {t(
                          'Organisation.calendar.walkInModal.patient.empty',
                          'No matching patients. Create a new patient first.'
                        )}
                      </p>
                    ) : (
                      patientOptions.map((patient) => {
                        const isSelected =
                          selectedWalkInPatientId === patient.id;

                        return (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() =>
                              setSelectedWalkInPatientId(patient.id)
                            }
                            className={[
                              'w-full rounded-xl border p-3 text-left transition',
                              isSelected
                                ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20'
                                : 'border-(--border-color) bg-(--bg-primary) hover:border-cyan-200',
                            ].join(' ')}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-(--text-primary)">
                                {patient.name}
                              </p>
                              <span className="rounded-full bg-(--bg-secondary) px-2 py-0.5 text-[10px] font-bold text-(--text-muted)">
                                {patient.gender}
                                {patient.age ? ` • ${patient.age}` : ''}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-(--text-muted)">
                              {getPatientMeta(patient)}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                  <label className="text-sm font-bold text-(--text-primary)">
                    {t(
                      'Organisation.calendar.walkInModal.date.label',
                      'Appointment date'
                    )}
                  </label>
                  <input
                    type="date"
                    min={todayKey}
                    value={walkInDate}
                    onChange={(event) => setWalkInDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                </div>

                <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                  <p className="mb-3 text-sm font-bold text-(--text-primary)">
                    {t(
                      'Organisation.calendar.walkInModal.slot.title',
                      'Available slot'
                    )}
                  </p>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {availableSlotsQuery.isLoading ? (
                      <div className="flex items-center gap-2 py-6 text-sm text-(--text-secondary)">
                        <Spinner />
                        {t(
                          'Organisation.calendar.walkInModal.slot.loading',
                          'Loading slots...'
                        )}
                      </div>
                    ) : availableWalkInSlots.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-(--border-color) p-4 text-sm text-(--text-muted)">
                        {t(
                          'Organisation.calendar.walkInModal.slot.empty',
                          'No available slots for this date.'
                        )}
                      </p>
                    ) : (
                      availableWalkInSlots.map((slot) => {
                        const isSelected = selectedWalkInSlotId === slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedWalkInSlotId(slot.id)}
                            className={[
                              'flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition',
                              isSelected
                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-(--border-color) bg-(--bg-primary) hover:border-emerald-200',
                            ].join(' ')}
                          >
                            <div>
                              <p className="font-semibold text-(--text-primary)">
                                {formatSlotTime(slot.startTime)} -{' '}
                                {formatSlotTime(slot.endTime)}
                              </p>
                              <p className="mt-1 text-xs text-(--text-muted)">
                                {t(
                                  'Organisation.calendar.walkInModal.slot.remaining',
                                  '{{count}} seats left',
                                  { count: slot.availableCapacity }
                                )}
                              </p>
                            </div>
                            {slot.cost ? (
                              <span className="text-xs font-bold text-emerald-600">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(slot.cost)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                  <label className="text-sm font-bold text-(--text-primary)">
                    {t(
                      'Organisation.calendar.walkInModal.reason.label',
                      'Visit reason'
                    )}
                  </label>
                  <textarea
                    value={walkInVisitReason}
                    onChange={(event) =>
                      setWalkInVisitReason(event.target.value)
                    }
                    rows={3}
                    placeholder={t(
                      'Organisation.calendar.walkInModal.reason.placeholder',
                      'Optional notes for screening staff...'
                    )}
                    className="mt-2 w-full resize-none rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300">
                  {selectedWalkInPatient && selectedWalkInSlot
                    ? t(
                        'Organisation.calendar.walkInModal.summary.ready',
                        '{{patient}} will enter the queue at {{time}}.',
                        {
                          patient: selectedWalkInPatient.name,
                          time: `${formatSlotTime(selectedWalkInSlot.startTime)} - ${formatSlotTime(selectedWalkInSlot.endTime)}`,
                        }
                      )
                    : t(
                        'Organisation.calendar.walkInModal.summary.pending',
                        'Choose a patient and slot to create the visit lifecycle.'
                      )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeWalkInModal}
                    disabled={createWalkInAppointmentMutation.isPending}
                    className="h-10 rounded-xl border border-(--border-color) px-4 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--bg-secondary)"
                  >
                    {t('Organisation.common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createWalkInAppointmentMutation.isPending ||
                      !selectedWalkInPatientId ||
                      !selectedWalkInSlotId
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createWalkInAppointmentMutation.isPending && <Spinner />}
                    {t(
                      'Organisation.calendar.walkInModal.actions.create',
                      'Create and check in'
                    )}
                  </button>
                </div>
              </section>
            </form>
          </div>
        </div>
      )}

      <CreateWalkInPatientModal
        isOpen={isCreatePatientModalOpen}
        onClose={() => setIsCreatePatientModalOpen(false)}
        onSuccess={(patientId) => {
          setSelectedWalkInPatientId(patientId);
          setIsCreatePatientModalOpen(false);
        }}
      />

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
      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        open={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setAppointmentToPay(null);
        }}
        appointment={appointmentToPay}
        isProcessing={payRemainingMutation.isPending}
        onConfirm={async (method) => {
          if (!appointmentToPay?.orderId) return;

          const localePrefix = i18nObj.language === 'en' ? '/en' : '/vi';
          const callbackUrl = `${window.location.origin}${localePrefix}/payment/success`;
          const cancelUrl = `${window.location.origin}${localePrefix}/payment/cancel`;

          return payRemainingMutation.mutateAsync({
            orderId: appointmentToPay.orderId,
            method,
            returnUrl: callbackUrl,
            cancelUrl: cancelUrl,
          });
        }}
      />
    </ClinicStaffLayout>
  );
}
