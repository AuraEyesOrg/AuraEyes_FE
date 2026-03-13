/**
 * Book Appointment Page
 * Patient can browse doctors, view available slots, and book appointments.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

// ============ HELPERS ============

const formatTime = (timeStr: string) => {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
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
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId') ?? '';

  const { user } = useAuthStore();
  const patientId = user?.id ?? '';

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] =
    useState<AppointmentSlotListDto | null>(null);
  const [reservation, setReservation] = useState<SlotReservationResult | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      from: startOfWeek.toISOString().split('T')[0],
      to: endOfWeek.toISOString().split('T')[0],
      label: `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
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

  const slots = slotsData?.items ?? [];

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
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
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
    // Navigate to confirmation page with slot details
    navigate(`/patient/book/confirm?slotId=${selectedSlot.id}`);
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

        {/* Doctor Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Doctor ID
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                placeholder="Enter doctor ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Enter the ophthalmologist ID to view their available slots. You can
            get this from the doctor&apos;s profile page.
          </p>
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
              Enter a doctor ID above to view available appointment slots.
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
                            {formatTime(slot.startTime)}
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
