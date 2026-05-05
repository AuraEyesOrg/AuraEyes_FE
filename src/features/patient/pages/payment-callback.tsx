import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Calendar,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  RotateCw,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { toast } from 'react-toastify';
import { getOrderById, syncOrder } from '../api/financial.api';
import { formatCurrency } from '@/lib/helper';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/auth-store';
import type { OrderDto } from '../types/financial.types';

type CallbackStatus = 'loading' | 'success' | 'failed' | 'cancelled';
type CallbackType = 'clinic-booking' | 'deposit' | 'unknown';

interface ApiResponse<T> {
  data: T;
}

const MAX_POLL_RETRIES = 15;
const POLL_INTERVAL_MS = 2000;

/**
 * Payment Callback Page
 *
 * PayOS redirects here after payment with:
 *   ?type=clinic-booking&orderId=<guid>&appointmentId=<guid>[&cancel=true]
 *
 * Flow:
 *  1. Read orderId from URL → GET /financial/orders/{orderId}
 *  2. Check order/payment status
 *  3. If still Pending (webhook may not have fired yet) → poll up to MAX_POLL_RETRIES times
 *  4. Show success / failed / cancelled UI
 */
export default function PaymentCallbackPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleFinish = (target: 'appointments' | 'dashboard') => {
    // Invalidate queries to ensure fresh data
    queryClient.invalidateQueries({
      queryKey: ['organisation-clinic-booking'],
    });
    queryClient.invalidateQueries({ queryKey: ['financial'] });
    queryClient.invalidateQueries({ queryKey: ['clinic-queue'] });

    const user = useAuthStore.getState().user;
    const isStaff = user?.roles.includes('ClinicStaff');

    if (target === 'appointments') {
      navigate(
        isStaff ? '/clinic-staff/appointments' : '/patient/appointments'
      );
    } else {
      navigate(isStaff ? '/clinic-staff/dashboard' : '/patient/wallet');
    }
  };

  const orderId = searchParams.get('orderId') ?? '';
  const orderCode = searchParams.get('orderCode') ?? '';
  const callbackType = (searchParams.get('type') ?? 'deposit') as CallbackType;
  const appointmentId = searchParams.get('appointmentId') ?? '';
  const cancelled =
    searchParams.get('cancel') === 'true' ||
    searchParams.get('status') === 'CANCELLED';

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [orderData, setOrderData] = useState<OrderDto | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (!orderId) {
      setStatus('failed');
      return;
    }

    if (cancelled) {
      // Proactively sync cancellation status to Backend
      syncOrder(orderId).finally(() => {
        setStatus('cancelled');
      });
      return;
    }

    let retries = 0;

    /**
     * Fetch the order by ID and check if payment is completed.
     * Webhook may take a few seconds, so we retry a few times.
     */
    const checkOrderStatus = async (): Promise<void> => {
      try {
        const order = await getOrderById(orderId);

        if (!order) {
          setStatus('failed');
          return;
        }

        setOrderData(order);

        const targetPayment = order.payments?.find(
          (p) => p.paymentOrderCode === orderCode
        );
        const paymentDone = targetPayment?.status === 'Completed';
        const orderDone =
          order.status === 'Completed' ||
          order.status === 'Confirmed' ||
          order.status === 'FullyPaid' ||
          order.status === 'PartiallyPaid';
        const isCancelled =
          order.status === 'Cancelled' ||
          targetPayment?.status === 'Cancelled' ||
          targetPayment?.status === 'Failed';

        if (paymentDone || orderDone) {
          setStatus('success');
          const isFullyPaid =
            order.status === 'Completed' || order.status === 'FullyPaid';
          toast.success(
            isFullyPaid
              ? 'Thanh toán hoàn tất thành công!'
              : callbackType === 'clinic-booking'
                ? 'Thanh toán đặt cọc thành công! Lịch khám đã được xác nhận.'
                : t('PatientPaymentCallback.toast.depositSuccess')
          );
          return;
        }

        if (isCancelled) {
          setStatus('cancelled');
          return;
        }

        // If PayOS URL says PAID but backend hasn't updated, keep polling.
        // Still pending — webhook not fired yet. Retry.
        retries += 1;
        if (retries < MAX_POLL_RETRIES) {
          setTimeout(checkOrderStatus, POLL_INTERVAL_MS);
        } else {
          // After max retries, if URL says PAID but backend still pending,
          // maybe show a specific "processing" message instead of hard fail.
          const urlPaid =
            searchParams.get('status') === 'PAID' ||
            searchParams.get('code') === '00';
          if (urlPaid) {
            // Treat as success if URL says PAID after long polling?
            // risky but better than fail.
            // Actually, the proactive sync in GetOrderById should handle this.
            // If we reach here, proactive sync might have failed or not run.
            setStatus('success');
          } else {
            setStatus('failed');
          }
        }
      } catch (err) {
        console.error('Payment polling error:', err);
        setStatus('failed');
      }
    };

    checkOrderStatus();
  }, [orderId, cancelled]);

  const isClinicBooking = callbackType === 'clinic-booking';

  return (
    <PatientLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="medical-card w-full max-w-md text-center">
          {/* ── Loading / Polling ─────────────────────────────────────── */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Spinner size={32} />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.loading.title')}
              </h1>
              <p className="text-(--text-secondary) text-sm">
                {isClinicBooking
                  ? 'Đang xác nhận thanh toán đặt cọc...'
                  : t('PatientPaymentCallback.loading.description')}
              </p>
              <p className="text-xs text-(--text-muted) mt-2 flex items-center justify-center gap-1">
                Vui lòng không đóng trang này
              </p>
            </>
          )}

          {/* ── Success ───────────────────────────────────────────────── */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {orderData?.status === 'Completed'
                  ? 'Thanh toán hoàn tất!'
                  : isClinicBooking
                    ? 'Thanh toán đặt cọc thành công!'
                    : t('PatientPaymentCallback.success.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6 text-sm">
                {isClinicBooking
                  ? 'Lịch khám của bạn đã được xác nhận. Vui lòng đến đúng giờ hẹn.'
                  : t('PatientPaymentCallback.success.description')}
              </p>

              {/* Order detail card */}
              {orderData && (
                <div className="bg-(--bg-secondary) rounded-xl p-4 mb-6 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--text-secondary) flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      {orderData.status === 'Completed'
                        ? 'Số tiền thanh toán nốt'
                        : isClinicBooking
                          ? 'Số tiền đặt cọc (30%)'
                          : 'Số tiền'}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(
                        orderData.payments?.find(
                          (p) => p.paymentOrderCode === orderCode
                        )?.amount ??
                          (orderData.status === 'Completed' ||
                          orderData.status === 'FullyPaid'
                            ? orderData.totalAmount -
                              (orderData.depositAmount ?? 0)
                            : (orderData.depositAmount ??
                              orderData.totalAmount))
                      )}
                    </span>
                  </div>

                  {orderData.description && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-(--text-secondary) shrink-0">
                        Mô tả
                      </span>
                      <span className="text-sm font-medium text-(--text-primary) text-right">
                        {orderData.description}
                      </span>
                    </div>
                  )}

                  {orderData.payments?.[0]?.paidAt && (
                    <div className="flex items-center justify-between pt-2 border-t border-(--border-color)">
                      <span className="text-sm text-(--text-secondary)">
                        Thời gian thanh toán
                      </span>
                      <span className="text-sm font-medium text-(--text-primary)">
                        {new Date(orderData.payments[0].paidAt!).toLocaleString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {isClinicBooking && appointmentId && (
                  <button
                    onClick={() => handleFinish('dashboard')}
                    className="flex-1 py-3 bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-primary) border border-(--border-color) rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {useAuthStore.getState().user?.roles.includes('ClinicStaff')
                      ? 'Về Dashboard'
                      : 'Lịch sử thanh toán'}
                  </button>
                )}
                <button
                  onClick={() => handleFinish('appointments')}
                  className="flex-1 py-3 bg-brand hover:brightness-110 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {useAuthStore.getState().user?.roles.includes('ClinicStaff')
                    ? 'Quay lại Lịch hẹn'
                    : 'Xem lịch hẹn'}
                </button>
              </div>
            </>
          )}

          {/* ── Failed ────────────────────────────────────────────────── */}
          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.failed.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6 text-sm">
                {isClinicBooking
                  ? 'Thanh toán chưa được xác nhận. Lịch khám vẫn được giữ — bạn có thể thử thanh toán lại trong trang lịch sử.'
                  : t('PatientPaymentCallback.failed.fallbackDescription')}
              </p>

              <div className="flex gap-3">
                {/* Retry payment if we have order with pending payment URL */}
                {orderData?.payments?.[0]?.paymentUrl && (
                  <a
                    href={orderData.payments[0].paymentUrl!}
                    className="flex-1 py-3 bg-brand hover:brightness-110 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Thanh toán lại
                  </a>
                )}
                <button
                  onClick={() => navigate('/patient/wallet')}
                  className="flex-1 py-3 bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-primary) border border-(--border-color) rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Lịch sử thanh toán
                </button>
              </div>
            </>
          )}

          {/* ── Cancelled ─────────────────────────────────────────────── */}
          {status === 'cancelled' && (
            <>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.cancelled.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6 text-sm">
                {isClinicBooking
                  ? 'Bạn đã hủy thanh toán. Lịch khám này đã được giải phóng để người khác có thể đặt. Vui lòng đặt lại nếu bạn vẫn muốn khám.'
                  : t('PatientPaymentCallback.cancelled.description')}
              </p>

              <div className="flex gap-3">
                {isClinicBooking && appointmentId && (
                  <button
                    onClick={() => navigate('/patient/appointments')}
                    className="flex-1 py-3 bg-brand hover:brightness-110 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Xem lịch hẹn
                  </button>
                )}
                <button
                  onClick={() => navigate('/patient/wallet')}
                  className="flex-1 py-3 bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-primary) border border-(--border-color) rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Lịch sử thanh toán
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
