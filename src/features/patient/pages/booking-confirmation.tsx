/**
 * Booking Confirmation Page
 * Patient confirms their reservation and completes the booking.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Timer,
  Eye,
  Brain,
  Building,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useAppointmentSlot,
  useConfirmReservation,
  useReleaseReservation,
} from '../hooks/use-booking';
import { ScheduleStatus, SLOT_TYPE_LABELS } from '@/types/schedule';
import useAuthStore from '@/store/auth-store';

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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId') ?? '';

  const { user } = useAuthStore();
  const patientId = user?.id ?? '';

  const [shareRetinalImages, setShareRetinalImages] = useState(true);
  const [shareAiResults, setShareAiResults] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: slot, isLoading: slotLoading } = useAppointmentSlot(slotId, {
    enabled: !!slotId,
  });

  const confirmMutation = useConfirmReservation();
  const releaseMutation = useReleaseReservation();

  // Calculate remaining time from slot's reservationExpireAt
  useEffect(() => {
    if (!slot?.reservationExpireAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(slot.reservationExpireAt!).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        // Reservation expired, redirect back
        navigate('/patient/book', { replace: true });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [slot?.reservationExpireAt, navigate]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = useCallback(async () => {
    if (!slotId || !patientId) return;

    try {
      const result = await confirmMutation.mutateAsync({
        slotId,
        request: {
          patientId,
          shareRetinalImages,
          shareAiResults,
        },
      });
      setIsSuccess(true);
      setSessionId(result.consultationSessionId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to confirm booking. Please try again.';
      alert(errorMessage);
    }
  }, [slotId, patientId, shareRetinalImages, shareAiResults, confirmMutation]);

  const handleCancel = useCallback(async () => {
    if (!slotId || !patientId) return;

    try {
      await releaseMutation.mutateAsync({
        slotId,
        request: { patientId },
      });
    } catch {
      // Ignore release errors
    }
    navigate('/patient/book', { replace: true });
  }, [slotId, patientId, releaseMutation, navigate]);

  const handleGoToAppointments = useCallback(() => {
    navigate('/patient/appointments');
  }, [navigate]);

  // Loading state
  if (slotLoading) {
    return (
      <PatientLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex items-center justify-center">
            <Spinner />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading booking details...
            </span>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Slot not found or not reserved
  if (!slot || slot.status !== ScheduleStatus.Reserved) {
    return (
      <PatientLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reservation Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The reservation may have expired or been cancelled. Please try
              booking again.
            </p>
            <button
              onClick={() => navigate('/patient/book')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Success state
  if (isSuccess && sessionId) {
    return (
      <PatientLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your appointment has been successfully booked. You will receive a
              confirmation email with the meeting details.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(slot.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Time
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Doctor
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {slot.ophthalmologistName ?? 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Session ID
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {sessionId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoToAppointments}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Countdown warning class
  const urgencyClass =
    remainingSeconds !== null && remainingSeconds <= 60
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      : remainingSeconds !== null && remainingSeconds <= 120
        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';

  return (
    <PatientLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel and go back
        </button>

        {/* Header with Timer */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Confirm Your Booking
          </h1>
          {remainingSeconds !== null && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${urgencyClass}`}
            >
              <Timer className="w-4 h-4" />
              <span className="font-medium">
                Complete within {formatCountdown(remainingSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appointment Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Doctor
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {slot.ophthalmologistName ?? 'Not specified'}
                </p>
              </div>
            </div>

            {slot.organisationName && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Organisation
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {slot.organisationName}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(slot.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {SLOT_TYPE_LABELS[slot.slotType]}
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Consultation Fee
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {slot.cost?.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
        </div>

        {/* Data Sharing Options */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Share Your Medical Data
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Allow the doctor to access your previous screenings and AI analysis
            results for a more personalized consultation.
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500 cursor-pointer">
              <input
                type="checkbox"
                checked={shareRetinalImages}
                onChange={(e) => setShareRetinalImages(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <Eye className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Retinal Images
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share your uploaded retinal images
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500 cursor-pointer">
              <input
                type="checkbox"
                checked={shareAiResults}
                onChange={(e) => setShareAiResults(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <Brain className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  AI Analysis Results
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share AI screening results and risk assessments
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={releaseMutation.isPending || confirmMutation.isPending}
            className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel Reservation
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              confirmMutation.isPending ||
              releaseMutation.isPending ||
              (remainingSeconds !== null && remainingSeconds <= 0)
            }
            className="flex-1 px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirmMutation.isPending ? (
              <>
                <Spinner /> Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirm & Pay
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          By confirming, you agree to the consultation terms and the fee will be
          deducted from your wallet.
        </p>
      </div>
    </PatientLayout>
  );
}
