/**
 * Book Appointment Page
 * Patient can browse doctors, view available slots, and book appointments.
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Timer,
  X,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
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
  formatWeekRange,
  formatWeekDayLabel,
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

const findNearestAvailableDate = (
  slots: AppointmentSlotListDto[],
  referenceDate?: string
): string | null => {
  if (!slots.length) return null;

  const base = new Date(
    `${referenceDate ?? toLocalDateKey(new Date())}T00:00:00`
  );
  if (Number.isNaN(base.getTime())) return null;

  const candidates = slots
    .map((slot) => slot.date)
    .filter((value, index, arr) => value && arr.indexOf(value) === index)
    .map((date) => ({
      date,
      diff: Math.abs(new Date(`${date}T00:00:00`).getTime() - base.getTime()),
    }))
    .sort((a, b) => a.diff - b.diff || a.date.localeCompare(b.date));

  return candidates[0]?.date ?? null;
};

const isExpiredAppointmentSlot = (slot: AppointmentSlotListDto): boolean => {
  if (slot.status === 'Expired') {
    return true;
  }

  const startAt = new Date(`${slot.date}T${slot.startTime}Z`).getTime();
  if (!Number.isNaN(startAt)) {
    return startAt < Date.now();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
          <div className={`text-4xl font-bold ${urgencyClass}`}>
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

export default function BookAppointmentPage() {
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
      storedContext = JSON.parse(storedContextRaw) as {
        doctorId?: string;
        doctorSnapshot?: Partial<OphthalmologistSearchItem>;
      };
    } catch {
      storedContext = null;
    }
  }

  const state =
    (location.state as {
      doctorId?: string;
      preselectedSlotId?: string;
      preselectedDate?: string;
      doctorSnapshot?: Partial<OphthalmologistSearchItem>;
    } | null) ?? {};
  const doctorId =
    state.doctorId ?? storedContext?.doctorId ?? doctorIdFromQuery ?? '';
  const preselectedSlotId = state.preselectedSlotId ?? '';
  const preselectedDate = state.preselectedDate;
  const doctorSnapshot =
    state.doctorSnapshot ?? storedContext?.doctorSnapshot ?? null;

  const { user } = useAuthStore();
  const patientId = user?.roleId ?? '';

  const selectedDoctorId = doctorId;
  const [currentWeekOffset, setCurrentWeekOffset] = useState(() =>
    getInitialWeekOffset(preselectedDate)
  );
  const [selectedSlot, setSelectedSlot] =
    useState<AppointmentSlotListDto | null>(null);
  const [reservation, setReservation] = useState<SlotReservationResult | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightedDate, setHighlightedDate] = useState<string | null>(
    preselectedDate ?? null
  );
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

  // Calculate week range
  const weekRange = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + 1 + currentWeekOffset * 7
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      from: toLocalDateKey(startOfWeek),
      to: toLocalDateKey(endOfWeek),
      label: formatWeekRange(startOfWeek, endOfWeek),
    };
  }, [currentWeekOffset]);

  const {
    data: slotsData,
    isLoading,
    error: slotsError,
  } = useAppointmentSlots(
    {
      ophthalId: selectedDoctorId || undefined,
      status: 1, // Available status
      fromDate: weekRange.from,
      toDate: weekRange.to,
      pageSize: 100,
    },
    { enabled: !!selectedDoctorId }
  );

  const reserveMutation = useReserveSlot();
  const releaseMutation = useReleaseReservation();

  const slots = useMemo(
    () =>
      (slotsData?.items ?? []).filter(
        (slot) => !isExpiredAppointmentSlot(slot)
      ),
    [slotsData?.items]
  );

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentSlotListDto[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    });
    // Sort slots by start time
    Object.values(grouped).forEach((daySlots) =>
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [slots]);

  // Get all days of the current week
  const weekDays = useMemo(() => {
    const days: {
      date: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
    }[] = [];
    const startDate = new Date(weekRange.from + 'T00:00:00');
    const today = toLocalDateKey(new Date());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = toLocalDateKey(d);
      days.push({
        date: dateStr,
        dayName: formatWeekDayLabel(d),
        dayNum: d.getDate(),
        isToday: dateStr === today,
      });
    }
    return days;
  }, [weekRange.from]);

  const handleSlotClick = useCallback(
    async (slot: AppointmentSlotListDto) => {
      if (slot.status !== 'Available') return;
      if (!patientId) {
        setErrorMessage('Vui lòng đăng nhập để đặt lịch tư vấn.');
        return;
      }

      setErrorMessage('');
      setHighlightedDate(slot.date);
      try {
        const result = await reserveMutation.mutateAsync({
          slotId: slot.id,
          request: {
            patientId,
            reservationMinutes: 5,
          },
        });
        setSelectedSlot(slot);
        setReservation(result);
        setShowModal(true);
      } catch (error) {
        setErrorMessage(mapOnlineConsultationErrorMessage(error));
      }
    },
    [patientId, reserveMutation]
  );

  const handleConfirm = useCallback(() => {
    if (!selectedSlot) return;
    sessionStorage.setItem(
      'patient-booking-confirm-context',
      JSON.stringify({ slotId: selectedSlot.id })
    );

    navigate('/patient/book/confirm', {
      state: {
        slotId: selectedSlot.id,
      },
    });
  }, [selectedSlot, navigate]);

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
      const nearestDate = findNearestAvailableDate(slots, preselectedDate);
      if (nearestDate) setHighlightedDate(nearestDate);
      return;
    }

    autoSelectedRef.current = true;
    setHighlightedDate(matchedSlot.date);

    void (async () => {
      if (!patientId) {
        setErrorMessage('Vui lòng đăng nhập để đặt lịch tư vấn.');
        return;
      }

      setErrorMessage('');
      try {
        const result = await reserveMutation.mutateAsync({
          slotId: matchedSlot.id,
          request: {
            patientId,
            reservationMinutes: 5,
          },
        });

        setSelectedSlot(matchedSlot);
        setReservation(result);
        setShowModal(true);
      } catch (error) {
        const message = mapOnlineConsultationErrorMessage(error);
        toast.warn(
          `${message}. Slot này vừa được giữ bởi người khác. Vui lòng chọn slot còn trống gần nhất.`
        );

        const nearestDate = findNearestAvailableDate(slots, matchedSlot.date);
        if (nearestDate) {
          setHighlightedDate(nearestDate);
        }
      }
    })();
  }, [
    preselectedSlotId,
    preselectedDate,
    slots,
    isLoading,
    patientId,
    reserveMutation,
  ]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a doctor and choose an available time slot for your
            consultation.
          </p>
        </div>

        {(errorMessage || slotsError) && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {errorMessage || mapOnlineConsultationErrorMessage(slotsError)}
          </div>
        )}

        {/* Doctor Information */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Selected Doctor
            </p>

            {!selectedDoctorId ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Missing doctorId in URL. Please choose a doctor first.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarUrl({
                    userAvatarUrl: doctorSnapshot?.userAvatarUrl ?? null,
                    userFullName: doctorInfo?.userFullName ?? null,
                  })}
                  alt={doctorInfo?.userFullName ?? 'Doctor'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {doctorInfo?.userFullName ?? 'Ophthalmologist'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {doctorInfo?.userEmail ?? 'No email available'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {doctorInfo?.yearsOfExperience ?? 0} years experience
                  </p>
                  {doctorLoading && (
                    <p className="text-xs text-gray-400 mt-1">
                      Loading doctor profile...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {!!preselectedSlotId && (
            <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-300">
              A slot from the doctors page has been pre-selected for you.
            </p>
          )}
        </div>

        {/* Week Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {weekRange.label}
              </span>
            </div>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        {!selectedDoctorId ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Please pick a doctor from the doctors page to view available
              appointment slots.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex items-center justify-center">
            <Spinner />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading available slots...
            </span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className={`p-4 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${
                    day.isToday
                      ? 'bg-cyan-50 dark:bg-cyan-900/20'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  } ${
                    highlightedDate === day.date
                      ? 'ring-2 ring-cyan-400 ring-inset'
                      : ''
                  }`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {day.dayName}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 ${
                      day.isToday
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {day.dayNum}
                  </div>
                </div>
              ))}
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-7 min-h-75">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className="p-2 border-r last:border-r-0 border-gray-200 dark:border-gray-700"
                >
                  {slotsByDate[day.date]?.length ? (
                    <div className="space-y-2">
                      {slotsByDate[day.date].map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotClick(slot)}
                          disabled={
                            slot.status !== 'Available' ||
                            reserveMutation.isPending
                          }
                          className={`w-full px-2 py-2 rounded-lg border text-xs font-medium transition ${getSlotStatusColor(slot.status)} disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatSlotTime(slot.startTime)}
                          </div>
                          {slot.maxCapacity > 1 && (
                            <div className="text-[10px] mt-1 opacity-75">
                              {slot.availableCapacity}/{slot.maxCapacity} slots
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">No slots</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300" />
            <span className="text-gray-600 dark:text-gray-400">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800 border border-gray-300" />
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showModal && selectedSlot && reservation && (
        <ReservationModal
          slot={selectedSlot}
          reservation={reservation}
          onConfirm={handleConfirm}
          onCancel={handleCancelReservation}
          isLoading={false}
        />
      )}
    </PatientLayout>
  );
}
