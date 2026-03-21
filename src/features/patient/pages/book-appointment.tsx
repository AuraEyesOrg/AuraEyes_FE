/**
 * Book Appointment Page
 * Patient can browse doctors, view available slots, and book appointments.
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Timer,
  X,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { useSystemSettings } from '../../system-admin/api/system-settings.api';
import {
  useAppointmentSlots,
  useReserveSlot,
  useReleaseReservation,
} from '../hooks/use-booking';
import type {
  AppointmentSlotListDto,
  SlotReservationResult,
} from '@/types/schedule';
import useAuthStore from '@/store/auth-store';
import { mapOnlineConsultationErrorMessage } from '@/lib/api-error';
import {
  getOphthalmologistDetailForPatient,
  type OphthalmologistSearchItem,
} from '../api/patient.api';
import {
  formatSlotTime,
  formatDate,
  toLocalDateKey,
  formatCountdown,
} from '@/lib/date-utils';

// ============ HELPERS ============

const getStartOfWeekMonday = (input: Date): Date => {
  const date = new Date(input);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getInitialWeekOffset = (dateString?: string): number => {
  if (!dateString) return 0;

  const targetDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(targetDate.getTime())) return 0;

  const currentWeekStart = getStartOfWeekMonday(new Date());
  const targetWeekStart = getStartOfWeekMonday(targetDate);
  const msInWeek = 7 * 24 * 60 * 60 * 1000;

  return Math.round(
    (targetWeekStart.getTime() - currentWeekStart.getTime()) / msInWeek
  );
};

const FALLBACK_AVATAR = import.meta.env.VITE_AVATAR_FALLBACK_URL;

const getAvatarUrl = (doctor: {
  userAvatarUrl?: string | null;
  userFullName?: string | null;
}) => {
  if (doctor.userAvatarUrl) return doctor.userAvatarUrl;
  const name = doctor.userFullName ?? 'Dr';
  return `${FALLBACK_AVATAR}${encodeURIComponent(name)}`;
};

const getNextAvailableDate = (candidates: AppointmentSlotListDto[]) => {
  if (!candidates.length) return null;
  candidates.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return candidates[0]?.date ?? null;
};

const isExpiredAppointmentSlot = (
  slot: AppointmentSlotListDto,
  advanceBookingMs: number
): boolean => {
  if (slot.status === 'Expired') {
    return true;
  }

  const startAt = new Date(`${slot.date}T${slot.startTime}`).getTime();
  if (!Number.isNaN(startAt)) {
    // Disable if the slot is in the past OR less than the advance notice time away
    return startAt < Date.now() + advanceBookingMs;
  }

  return false;
};

const getSlotStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 cursor-pointer';
    case 'Reserved':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700';
    case 'Booked':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    case 'Blocked':
      return 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-300 dark:border-gray-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700';
  }
};

// ============ RESERVATION MODAL ============

interface ReservationModalProps {
  slot: AppointmentSlotListDto;
  reservation: SlotReservationResult | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ReservationModal = ({
  slot,
  reservation,
  onConfirm,
  onCancel,
  isLoading,
}: ReservationModalProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(
    reservation?.remainingSeconds ?? 300
  );

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(reservation.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        onCancel();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation, onCancel]);

  const urgencyClass =
    remainingSeconds <= 60
      ? 'text-red-600 dark:text-red-400'
      : remainingSeconds <= 120
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Slot Reserved
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className={`w-5 h-5 ${urgencyClass}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Time remaining to complete booking
            </span>
          </div>
          <div className="text-4xl font-bold ${urgencyClass}">
            {formatCountdown(remainingSeconds)}
          </div>
        </div>

        {/* Slot Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(slot.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatSlotTime(slot.startTime)} -{' '}
                {formatSlotTime(slot.endTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Price:
            </span>
            <span className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
              {slot.cost?.toLocaleString('vi-VN')} VND
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || remainingSeconds <= 0}
            className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner /> Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN PAGE ============

export interface BookAppointmentProps {
  embeddedDoctorId?: string;
  embeddedPreselectedDate?: string;
  embeddedDoctorSnapshot?: Partial<OphthalmologistSearchItem>;
  viewMode?: 'today' | 'week';
  onClose?: () => void;
  onProceedToConfirm?: (slotId: string) => void;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookAppointmentPage(props: BookAppointmentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const doctorIdFromQuery = searchParams.get('doctorId') ?? '';
  const storedContextRaw = sessionStorage.getItem('patient-booking-context');
  let storedContext: {
    doctorId?: string;
    doctorSnapshot?: Partial<OphthalmologistSearchItem>;
  } | null = null;

  if (storedContextRaw) {
    try {
      storedContext = JSON.parse(storedContextRaw);
    } catch {
      storedContext = null;
    }
  }

  const state = (location.state as any) ?? {};
  const doctorId =
    props.embeddedDoctorId ??
    state.doctorId ??
    storedContext?.doctorId ??
    doctorIdFromQuery ??
    '';
  const preselectedSlotId = state.preselectedSlotId ?? '';
  const preselectedDate =
    props.embeddedPreselectedDate ?? state.preselectedDate;
  const doctorSnapshot =
    props.embeddedDoctorSnapshot ??
    state.doctorSnapshot ??
    storedContext?.doctorSnapshot ??
    null;

  const { user } = useAuthStore();
  const patientId = user?.roleId ?? '';

  const selectedDoctorId = doctorId;

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    let d = new Date();
    if (preselectedDate) {
      const pd = new Date(`${preselectedDate}T00:00:00`);
      if (!Number.isNaN(pd.getTime())) d = pd;
    }
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(
    preselectedDate ?? toLocalDateKey(new Date())
  );
  const [selectedSlot, setSelectedSlot] =
    useState<AppointmentSlotListDto | null>(null);
  const [slotToRelease, setSlotToRelease] =
    useState<AppointmentSlotListDto | null>(null);

  const { data: systemSettings, isLoading: isLoadingSettings } =
    useSystemSettings();
  const advanceBookingSetting = systemSettings?.['MIN_ADVANCE_BOOKING_HOURS'];

  let advanceBookingHours = advanceBookingSetting
    ? parseFloat(advanceBookingSetting)
    : 0;
  if (advanceBookingHours < 0.5) advanceBookingHours = 0.5; // Enforce minimum 30 minutes

  const minAdvanceBookingMs = advanceBookingHours * 60 * 60 * 1000;
  const warningText =
    advanceBookingHours < 1
      ? `${Math.round(advanceBookingHours * 60)} minutes`
      : `${advanceBookingHours} hours`;

  const [reservation, setReservation] = useState<SlotReservationResult | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const autoSelectedRef = useRef(false);

  const { data: doctorDetail, isLoading: doctorLoading } = useQuery({
    queryKey: ['patient-ophthalmologist-detail', selectedDoctorId],
    queryFn: () => getOphthalmologistDetailForPatient(selectedDoctorId),
    enabled: !!selectedDoctorId,
    retry: false,
  });

  const doctorInfo = doctorDetail ?? doctorSnapshot;

  useEffect(() => {
    if (!selectedDoctorId) return;
    sessionStorage.setItem(
      'patient-booking-context',
      JSON.stringify({
        doctorId: selectedDoctorId,
        doctorSnapshot: doctorSnapshot ?? null,
      })
    );
  }, [selectedDoctorId, doctorSnapshot]);

  // Fetch slots
  const monthRange = useMemo(() => {
    const start = new Date(currentMonthDate);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    // If viewMode === 'today', we only want today's data anyway
    if (props.viewMode === 'today') {
      const todayStr = toLocalDateKey(new Date());
      return { from: todayStr, to: todayStr };
    }

    // We fetch a bit of buffer
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return {
      from: toLocalDateKey(start),
      to: toLocalDateKey(end),
    };
  }, [currentMonthDate, props.viewMode]);

  const {
    data: slotsData,
    isLoading,
    error: slotsError,
  } = useAppointmentSlots(
    {
      ophthalId: selectedDoctorId || undefined,
      status: 1, // Available status
      fromDate: monthRange.from,
      toDate: monthRange.to,
      pageSize: 500,
    },
    { enabled: !!selectedDoctorId }
  );

  const reserveMutation = useReserveSlot();
  const releaseMutation = useReleaseReservation();

  const slots = useMemo(() => slotsData?.items ?? [], [slotsData?.items]);

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentSlotListDto[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    });
    Object.values(grouped).forEach((daySlots) =>
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [slots]);

  // Calendar Days Calculation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: Date[] = [];
    for (let i = 0; i < firstDay; i++) {
      result.push(new Date(year, month, 0 - (firstDay - 1 - i)));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(new Date(year, month, i));
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push(new Date(year, month + 1, i));
    }
    return result;
  }, [currentMonthDate]);

  const handleSlotClick = useCallback(
    async (slot: AppointmentSlotListDto) => {
      if (slot.status !== 'Available') return;
      if (!patientId) {
        setErrorMessage('Vui lòng đăng nhập để đặt lịch tư vấn.');
        return;
      }
      setErrorMessage('');
      setSelectedSlot(slot);
    },
    [patientId]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!selectedSlot || !patientId) return;
    try {
      const result = await reserveMutation.mutateAsync({
        slotId: selectedSlot.id,
        request: {
          patientId,
          reservationMinutes: 5,
        },
      });
      setReservation(result);
      setShowModal(true);
    } catch (error) {
      setErrorMessage(mapOnlineConsultationErrorMessage(error));
    }
  }, [selectedSlot, patientId, reserveMutation]);

  const handleConfirmReservation = useCallback(() => {
    if (!selectedSlot) return;
    sessionStorage.setItem(
      'patient-booking-confirm-context',
      JSON.stringify({ slotId: selectedSlot.id })
    );

    if (props.onProceedToConfirm) {
      props.onProceedToConfirm(selectedSlot.id);
    } else {
      navigate('/patient/book/confirm', {
        state: { slotId: selectedSlot.id },
      });
    }
  }, [selectedSlot, navigate, props]);

  const handleCancelReservation = useCallback(async () => {
    if (!selectedSlot || !patientId) return;
    setErrorMessage('');
    try {
      await releaseMutation.mutateAsync({
        slotId: selectedSlot.id,
        request: { patientId },
      });
    } catch (error) {
      setErrorMessage(mapOnlineConsultationErrorMessage(error));
    }
    setShowModal(false);
    setSelectedSlot(null);
    setReservation(null);
  }, [selectedSlot, patientId, releaseMutation]);

  useEffect(() => {
    if (!preselectedSlotId || autoSelectedRef.current || isLoading) return;

    const matchedSlot = slots.find((slot) => slot.id === preselectedSlotId);
    if (!matchedSlot) {
      const nearestDate = getNextAvailableDate(slots);
      if (nearestDate) setSelectedDate(nearestDate);
      return;
    }

    autoSelectedRef.current = true;
    setSelectedDate(matchedSlot.date);
    setSelectedSlot(matchedSlot); // Pre-select the slot visually

    // No auto-reservation on load, user must click confirm
  }, [preselectedSlotId, preselectedDate, slots, isLoading, patientId]);

  const isEmbedded = !!props.onClose;
  const Wrapper = isEmbedded ? 'div' : PatientLayout;
  const wrapperProps = isEmbedded
    ? {
        className: `fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-start py-8 px-4 ${
          showModal ? 'overflow-hidden' : 'overflow-y-auto'
        }`,
      }
    : {};

  const todayStr = toLocalDateKey(new Date());

  // Times split
  const selectedDaySlots = selectedDate
    ? (slotsByDate[selectedDate] ?? [])
    : [];
  const morningSlots = selectedDaySlots.filter(
    (s) => parseInt(s.startTime.split(':')[0]) < 12
  );
  const afternoonSlots = selectedDaySlots.filter(
    (s) => parseInt(s.startTime.split(':')[0]) >= 12
  );

  return (
    <>
      <Wrapper {...wrapperProps}>
        <div
          className={
            isEmbedded
              ? 'bg-white dark:bg-gray-900 border border-gray-200 w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col font-sans'
              : 'p-6 max-w-5xl mx-auto font-sans'
          }
        >
          {/* Header Section */}
          <div className="relative p-6 border-b border-gray-100 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 border-t-4 border-t-cyan-600">
            {isEmbedded && (
              <button
                onClick={props.onClose}
                className="absolute left-6 top-6 flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <h1 className="text-xl font-bold tracking-widest text-gray-800 dark:text-gray-100 uppercase mb-4">
              Aura
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {doctorInfo?.userFullName ?? 'Ophthalmologist'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Ophthalmologist
            </p>
            <div className="mt-3 inline-flex bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
              Booking for:{' '}
              {props.viewMode === 'today'
                ? 'Video Consultation'
                : 'In-clinic / Video Consultation'}
            </div>
          </div>

          {(errorMessage || slotsError) && (
            <div className="mx-6 mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage || mapOnlineConsultationErrorMessage(slotsError)}
            </div>
          )}

          {!isLoadingSettings && (
            <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Please note: Appointments must be booked at least{' '}
                <strong>{warningText}</strong> in advance.
              </span>
            </div>
          )}

          {/* Main Content Split Pane */}
          <div className="flex flex-col md:flex-row p-6 gap-8 bg-gray-50/50 dark:bg-gray-800/30">
            {/* LEFT: Calendar */}
            <div className="w-full md:w-[40%] md:flex-none md:border-r border-gray-200 dark:border-gray-700 md:pr-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentMonthDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const d = new Date(currentMonthDate);
                      d.setMonth(d.getMonth() - 1);
                      setCurrentMonthDate(d);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                    disabled={props.viewMode === 'today'}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(currentMonthDate);
                      d.setMonth(d.getMonth() + 1);
                      setCurrentMonthDate(d);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                    disabled={props.viewMode === 'today'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-xs font-semibold text-gray-400"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((date, i) => {
                  const dateStr = toLocalDateKey(date);
                  const isCurrentMonth =
                    date.getMonth() === currentMonthDate.getMonth();
                  const isSelected = selectedDate === dateStr;
                  const isPast = dateStr < todayStr;
                  const hasSlots = (slotsByDate[dateStr]?.length ?? 0) > 0;

                  // If today mode, only today is selectable
                  const isDisabled =
                    props.viewMode === 'today' ? dateStr !== todayStr : isPast;

                  return (
                    <button
                      key={`${dateStr}-${i}`}
                      onClick={() => {
                        if (!isDisabled) setSelectedDate(dateStr);
                      }}
                      disabled={isDisabled}
                      className={`
                      w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all
                      ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                      ${isSelected ? 'bg-cyan-600 text-white shadow-md' : ''}
                      ${!isSelected && !isDisabled ? 'hover:bg-cyan-50 dark:hover:bg-cyan-900/40' : ''}
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${hasSlots && !isSelected ? 'bg-cyan-100/50 dark:bg-cyan-900/30 font-bold text-cyan-800 dark:text-cyan-400' : ''}
                    `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Time Slots */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Select a Time
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner />
                </div>
              ) : selectedDaySlots.length === 0 ? (
                <div className="text-gray-500 text-sm py-8 text-center italic">
                  No available times for{' '}
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString()
                    : 'this date'}
                  .
                </div>
              ) : (
                <div className="space-y-6">
                  {morningSlots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        Morning
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {morningSlots.map((slot) => {
                          const isExpired = isExpiredAppointmentSlot(
                            slot,
                            minAdvanceBookingMs
                          );
                          return (
                            <button
                              key={slot.id}
                              onClick={() =>
                                !isExpired && handleSlotClick(slot)
                              }
                              disabled={isExpired}
                              className={`
                              px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-center w-full
                              ${
                                isExpired
                                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed cursor-not-allowed opacity-60'
                                  : selectedSlot?.id === slot.id
                                    ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm cursor-pointer'
                                    : 'bg-white dark:bg-gray-800 border-teal-500 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/40 cursor-pointer'
                              }
                            `}
                            >
                              {formatSlotTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {afternoonSlots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        Afternoon
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {afternoonSlots.map((slot) => {
                          const isExpired = isExpiredAppointmentSlot(
                            slot,
                            minAdvanceBookingMs
                          );
                          return (
                            <button
                              key={slot.id}
                              onClick={() =>
                                !isExpired && handleSlotClick(slot)
                              }
                              disabled={isExpired}
                              className={`
                              px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-center w-full
                              ${
                                isExpired
                                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                                  : selectedSlot?.id === slot.id
                                    ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm cursor-pointer'
                                    : 'bg-white dark:bg-gray-800 border-teal-500 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/40 cursor-pointer'
                              }
                            `}
                            >
                              {formatSlotTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Area */}
          <div className="p-6 border-t border-gray-100 bg-white dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {selectedSlot ? (
                <span>
                  Selected: {new Date(selectedSlot.date).toLocaleDateString()}{' '}
                  at {formatSlotTime(selectedSlot.startTime)} |{' '}
                  {formatVnd(selectedSlot.cost)}
                </span>
              ) : (
                <span>Please select a date and an available time.</span>
              )}
            </div>
            <button
              onClick={handleConfirmAction}
              disabled={!selectedSlot || reserveMutation.isPending}
              className="w-full sm:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {reserveMutation.isPending ? <Spinner size={16} /> : null}
              Confirm Booking
            </button>
          </div>
        </div>
      </Wrapper>

      {/* Reservation Modal layer on top of this one */}
      {showModal && selectedSlot && reservation && (
        <ReservationModal
          slot={selectedSlot}
          reservation={reservation}
          onConfirm={handleConfirmReservation}
          onCancel={handleCancelReservation}
          isLoading={false}
        />
      )}
    </>
  );
}

// Format currency
function formatVnd(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return `${value.toLocaleString('vi-VN')}đ`;
}
