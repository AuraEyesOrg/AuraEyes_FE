import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Wallet,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { useWallet } from '../hooks/use-wallet';
import { walletApi } from '../api/patient.api';
import type { VerifyPaymentResponse } from '../types';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/lib/helper';
import { useTranslation } from 'react-i18next';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled';

/**
 * Payment Callback Page
 *
 * After a user completes (or cancels) payment on PayOS, they are redirected
 * back to this page with query params such as `orderCode`, `status`, etc.
 *
 * NOTE: We call walletApi.verifyPayment() directly instead of via useMutation.
 * React 18 StrictMode re-mounts the component (mount → unmount → remount),
 * which destroys the first MutationObserver. Inline callbacks registered on
 * that observer's `.mutate()` call never fire on the replacement observer,
 * leaving the page stuck on "loading". A plain promise is immune to this.
 */
export default function PaymentCallbackPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderCode =
    searchParams.get('orderCode') ?? searchParams.get('order_code') ?? '';
  const cancelled =
    searchParams.get('cancel') === 'true' ||
    searchParams.get('status') === 'CANCELLED';

  const { refetch: refetchWallet } = useWallet();

  const [status, setStatus] = useState<PaymentStatus>(
    cancelled ? 'cancelled' : 'loading'
  );
  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse | null>(
    null
  );

  // Guard against React 18 StrictMode double-invoke
  const hasVerified = useRef(false);

  // Verify payment on mount by calling the API directly
  useEffect(() => {
    if (!orderCode || cancelled || hasVerified.current) return;

    hasVerified.current = true;

    walletApi.verifyPayment({ orderCode }).then(
      (data) => {
        setPaymentData(data);
        setStatus(data.isSuccess ? 'success' : 'failed');
        if (data.isSuccess) {
          toast.success(t('PatientPaymentCallback.toast.depositSuccess'));
        }
        refetchWallet();
      },
      () => {
        setStatus('failed');
      }
    );
  }, [orderCode, cancelled]);

  return (
    <PatientLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="medical-card w-full max-w-md text-center">
          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Spinner size={32} />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.loading.title')}
              </h1>
              <p className="text-(--text-secondary)">
                {t('PatientPaymentCallback.loading.description')}
              </p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.success.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6">
                {t('PatientPaymentCallback.success.description')}
              </p>

              {/* Payment details */}
              <div className="bg-(--bg-secondary) rounded-xl p-4 mb-6 space-y-3">
                {paymentData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-(--text-secondary)">
                        {t('PatientPaymentCallback.labels.amount')}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(paymentData.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-(--text-secondary)">
                        {t('PatientPaymentCallback.labels.orderCode')}
                      </span>
                      <span className="font-mono text-sm text-(--text-primary)">
                        {paymentData.orderCode}
                      </span>
                    </div>
                    {paymentData.newBalance !== null && (
                      <div className="flex items-center justify-between pt-3 border-t border-(--border-color)">
                        <span className="text-sm text-(--text-secondary) flex items-center gap-1">
                          <Wallet className="w-4 h-4" />{' '}
                          {t('PatientPaymentCallback.labels.newBalance')}
                        </span>
                        <span className="font-bold text-brand text-lg">
                          {formatCurrency(paymentData.newBalance)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Failed */}
          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.failed.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6">
                {paymentData?.message ||
                  t('PatientPaymentCallback.failed.fallbackDescription')}
              </p>

              {orderCode && (
                <div className="bg-(--bg-secondary) rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--text-secondary)">
                      {t('PatientPaymentCallback.labels.orderCode')}
                    </span>
                    <span className="font-mono text-sm text-(--text-primary)">
                      {orderCode}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cancelled */}
          {status === 'cancelled' && (
            <>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                {t('PatientPaymentCallback.cancelled.title')}
              </h1>
              <p className="text-(--text-secondary) mb-6">
                {t('PatientPaymentCallback.cancelled.description')}
              </p>
            </>
          )}

          {/* Actions */}
          {status !== 'loading' && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/patient/wallet')}
                className="flex-1 py-3 bg-brand hover:brightness-110 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('PatientPaymentCallback.actions.backToWallet')}
              </button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
