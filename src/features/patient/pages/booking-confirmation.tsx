/**
 * Booking Confirmation Page
 * Patient confirms their reservation and completes the booking.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Timer,
  Eye,
  Brain,
  X,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useAppointmentSlot,
  useConfirmReservation,
  useReleaseReservation,
} from '../hooks/use-booking';
import useAuthStore from '@/store/auth-store';
import { mapOnlineConsultationErrorMessage } from '@/lib/api-error';
import { formatSlotTime, formatDate, formatCountdown } from '@/lib/date-utils';
import { toast } from 'react-toastify';
import {
  loadScreeningConsultationContext,
  saveScreeningConsultationContext,
  type ScreeningConsultationContext,
} from '../types/consultation-context';
import PatientImageViewer from '../components/ImageViewer';
import type { Anomaly, RetinalImage, ToggleState } from '../types/type';
import { hydrateConsultationPreviewAnomalies } from './retinal-analysis';
import { agreeScreeningConsent } from '../api/consent.api';
import { buildBookingShareConsentContent } from '../constants/consent-content';

export interface BookingConfirmationProps {
  embeddedSlotId?: string;
  embeddedConsultationContext?: ScreeningConsultationContext;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface StoredConfirmContext {
  slotId?: string;
  returnTo?: string;
}

/**
 * Parse the booking confirm context from sessionStorage once.
 * Returns a stable object so callers don't need to repeat try/catch.
 */
function parseStoredConfirmContext(): StoredConfirmContext {
  try {
    const raw = sessionStorage.getItem('patient-booking-confirm-context');
    if (!raw) return {};
    return (JSON.parse(raw) as StoredConfirmContext) ?? {};
  } catch {
    return {};
  }
}

const PREVIEW_TOGGLES: ToggleState = {
  vesselSegmentation: false,
  hemorrhages: false,
  exudates: false,
  opticDisc: false,
};

export default function BookingConfirmationPage(
  props: BookingConfirmationProps
) {
  const { embeddedSlotId, embeddedConsultationContext, onClose, onSuccess } =
    props;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // --- Resolve slotId and returnTo from all possible sources (once) ---
  const { slotId, returnToPath } = useMemo(() => {
    const querySlotId = searchParams.get('slotId') ?? '';
    const locationState = (location.state as StoredConfirmContext | null) ?? {};
    const stored = parseStoredConfirmContext();

    return {
      slotId:
        embeddedSlotId ?? locationState.slotId ?? stored.slotId ?? querySlotId,
      returnToPath:
        locationState.returnTo ?? stored.returnTo ?? '/patient/review',
    };
  }, [embeddedSlotId, searchParams, location.state]);

  // --- Resolve consultation context (read session storage only when prop is absent) ---
  const consultationContext =
    useMemo((): ScreeningConsultationContext | null => {
      if (embeddedConsultationContext?.screeningId)
        return embeddedConsultationContext;
      return loadScreeningConsultationContext();
    }, [embeddedConsultationContext]);

  const primaryOriginalImage = consultationContext?.images?.[0]?.url;
  const symptomNames = useMemo(
    () =>
      consultationContext?.anomalies?.map(
        (item) => item.friendlyName || item.name
      ) ?? [],
    [consultationContext?.anomalies]
  );

  const { user } = useAuthStore();
  const patientId = user?.roleId ?? '';

  // --- Sharing toggles ---
  const [shareRetinalImages, setShareRetinalImages] = useState(true);
  const [shareAiResults, setShareAiResults] = useState(true);

  const [previewAnomalies, setPreviewAnomalies] = useState<Anomaly[]>(
    () => consultationContext?.anomalies ?? []
  );

  useEffect(() => {
    const base = consultationContext?.anomalies ?? [];
    const img = consultationContext?.images?.[0]?.url;
    const raw = consultationContext?.rawJsonOutput;

    // Already have location data — no need to hydrate
    if (!img || !raw || (base.length > 0 && base.some((a) => a.location))) {
      setPreviewAnomalies(base);
      return;
    }

    let cancelled = false;
    hydrateConsultationPreviewAnomalies(raw, img).then((mapped) => {
      if (!cancelled) setPreviewAnomalies(mapped.length > 0 ? mapped : base);
    });
    return () => {
      cancelled = true;
    };
  }, [
    consultationContext?.anomalies,
    consultationContext?.rawJsonOutput,
    consultationContext?.images,
  ]);

  const previewRetinalImage = useMemo((): RetinalImage | null => {
    const img = consultationContext?.images?.[0];
    if (!img?.url) return null;
    return {
      id: img.id,
      url: img.url,
      name: img.name,
      eye: img.eye,
      uploadedAt: img.uploadedAt,
      analyzed: true,
      anomalies: previewAnomalies,
    };
  }, [consultationContext?.images, previewAnomalies]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const timeoutReleaseTriggeredRef = useRef(false);
  const shownErrorToastsRef = useRef(new Set<string>());

  const {
    data: slot,
    isLoading: slotLoading,
    error: slotError,
  } = useAppointmentSlot(slotId, {
    enabled: !!slotId,
  });

  const slotErrorMessage = slotError
    ? mapOnlineConsultationErrorMessage(slotError)
    : '';
  const displayErrorMessage = errorMessage || slotErrorMessage;

  const confirmMutation = useConfirmReservation();
  const releaseMutation = useReleaseReservation();

  const exitFlow = useCallback(() => {
    sessionStorage.removeItem('patient-booking-confirm-context');
    if (onClose) onClose();
    else navigate(returnToPath, { replace: true });
  }, [onClose, navigate, returnToPath]);

  const exitFlowOnSuccess = useCallback(() => {
    if (onSuccess) onSuccess();
    else navigate('/patient/appointments');
  }, [onSuccess, navigate]);

  const releaseOnTimeoutAndNavigate = useCallback(async () => {
    if (timeoutReleaseTriggeredRef.current) return;
    timeoutReleaseTriggeredRef.current = true;

    if (slotId && patientId) {
      try {
        await releaseMutation.mutateAsync({ slotId, request: { patientId } });
      } catch {
        // best-effort; still redirect to unblock user
      }
    }
    exitFlow();
  }, [slotId, patientId, releaseMutation, exitFlow]);

  useEffect(() => {
    if (!slotId) return;
    timeoutReleaseTriggeredRef.current = false;
    sessionStorage.setItem(
      'patient-booking-confirm-context',
      JSON.stringify({ slotId, returnTo: returnToPath })
    );
  }, [slotId, returnToPath]);

  useEffect(() => {
    if (!consultationContext?.screeningId) return;
    saveScreeningConsultationContext(consultationContext);
  }, [consultationContext]);

  useEffect(() => {
    const querySlotId = searchParams.get('slotId') ?? '';
    if (
      embeddedSlotId ||
      !querySlotId ||
      (location.state as StoredConfirmContext | null)?.slotId
    )
      return;
    navigate('/patient/book/confirm', {
      replace: true,
      state: { slotId: querySlotId },
    });
  }, [embeddedSlotId, searchParams, location.state, navigate]);

  useEffect(() => {
    if (!displayErrorMessage) return;
    if (shownErrorToastsRef.current.has(displayErrorMessage)) return;
    shownErrorToastsRef.current.add(displayErrorMessage);
    toast.error(displayErrorMessage, {
      toastId: `booking-confirm-error-${displayErrorMessage}`,
    });
  }, [displayErrorMessage]);

  useEffect(() => {
    if (!slot?.reservationExpireAt) return;

    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor(
          (new Date(slot.reservationExpireAt!).getTime() - Date.now()) / 1000
        )
      );
      setRemainingSeconds(diff);
      if (diff <= 0) void releaseOnTimeoutAndNavigate();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [slot?.reservationExpireAt, releaseOnTimeoutAndNavigate]);

  const handleConfirm = useCallback(async () => {
    if (!slotId || !patientId || confirmMutation.isPending) return;
    setErrorMessage('');

    try {
      if (
        consultationContext?.screeningId &&
        (shareRetinalImages || shareAiResults)
      ) {
        await agreeScreeningConsent(consultationContext.screeningId, {
          content: buildBookingShareConsentContent(
            shareRetinalImages,
            shareAiResults
          ),
        });
      }

      const result = await confirmMutation.mutateAsync({
        slotId,
        request: {
          patientId,
          aiScreeningId: consultationContext?.screeningId,
          shareRetinalImages,
          shareAiResults,
        },
      });

      toast.success('Bạn đã đặt lịch thành công!');
      sessionStorage.removeItem('patient-booking-confirm-context');
      setIsSuccess(true);
      setSessionId(result.consultationSessionId);
    } catch (error) {
      setErrorMessage(mapOnlineConsultationErrorMessage(error));
    }
  }, [
    slotId,
    patientId,
    shareRetinalImages,
    shareAiResults,
    consultationContext?.screeningId,
    confirmMutation,
  ]);

  const handleCancel = useCallback(async () => {
    if (!slotId || !patientId) return;
    setErrorMessage('');

    try {
      await releaseMutation.mutateAsync({ slotId, request: { patientId } });
    } catch (error) {
      setErrorMessage(mapOnlineConsultationErrorMessage(error));
      return;
    }
    exitFlow();
  }, [slotId, patientId, releaseMutation, exitFlow]);

  const isEmbedded = !!onClose;
  const Wrapper = isEmbedded ? 'div' : PatientLayout;
  const wrapperProps = isEmbedded
    ? {
        className:
          'fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10 flex justify-center items-start',
      }
    : {};
  const innerClass = isEmbedded
    ? 'bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col mx-4 p-8 mt-auto mb-auto'
    : 'p-6 max-w-2xl mx-auto';

  const urgencyClass =
    remainingSeconds !== null && remainingSeconds <= 60
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      : remainingSeconds !== null && remainingSeconds <= 120
        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';

  // ============ RENDER STATES ============

  if (slotLoading) {
    return (
      <Wrapper {...wrapperProps}>
        <div className={innerClass}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex items-center justify-center">
            <Spinner />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading booking details...
            </span>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!slot || slot.status !== 'Reserved') {
    return (
      <Wrapper {...wrapperProps}>
        <div className={innerClass}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center relative">
            {isEmbedded && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reservation Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The reservation may have expired or been cancelled. Please try
              booking again.
            </p>
            <button
              onClick={exitFlow}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (isSuccess && sessionId) {
    return (
      <Wrapper {...wrapperProps}>
        <div className={innerClass}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center relative">
            {isEmbedded && (
              <button
                onClick={exitFlowOnSuccess}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
                    {formatSlotTime(slot.startTime)} –{' '}
                    {formatSlotTime(slot.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Session ID
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {sessionId.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Consultation Fee
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {slot.cost?.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={exitFlowOnSuccess}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper {...wrapperProps}>
      <div className={innerClass}>
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel and go back
        </button>

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

        {/* Appointment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appointment Details
          </h2>
          <div className="space-y-4">
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
                  {formatSlotTime(slot.startTime)} –{' '}
                  {formatSlotTime(slot.endTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Online Consultation
                </p>
              </div>
            </div>
          </div>
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

        {/* AI Case Preview */}
        {consultationContext?.screeningId && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AI Case Attached
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Case ID:{' '}
              <span className="font-semibold">
                {consultationContext.screeningId}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/40">
                {primaryOriginalImage ? (
                  <img
                    src={primaryOriginalImage}
                    alt="Original retinal image"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full flex items-center justify-center text-sm text-gray-500">
                    No original image
                  </div>
                )}
                <p className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Original retinal image
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/40">
                {!shareAiResults ? (
                  <div className="h-40 w-full flex items-center justify-center text-sm text-gray-500 px-3 text-center">
                    Turn on &quot;AI Analysis Results&quot; to preview how the
                    doctor will see AI highlights.
                  </div>
                ) : !previewRetinalImage ? (
                  <div className="h-40 w-full flex items-center justify-center text-sm text-gray-500">
                    Add a retinal image in screening to preview AI overlays.
                  </div>
                ) : (
                  <div className="h-40 w-full relative overflow-hidden">
                    <PatientImageViewer
                      toggles={PREVIEW_TOGGLES}
                      zoomLevel={1}
                      anomalies={previewAnomalies}
                      isAnalyzing={false}
                      currentImage={previewRetinalImage}
                      showHighlights={previewAnomalies.some((a) => a.location)}
                    />
                  </div>
                )}
                <p className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  AI annotated preview
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Symptoms/findings ({symptomNames.length}):
            </p>
            {symptomNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {symptomNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No symptom tags extracted from AI result.
              </p>
            )}
          </div>
        )}

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
                <CheckCircle className="w-5 h-5" /> Confirm &amp; Pay
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          By confirming, you agree to the consultation terms and the fee will be
          deducted from your wallet.
        </p>
      </div>
    </Wrapper>
  );
}
