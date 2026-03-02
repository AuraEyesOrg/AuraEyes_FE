import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { useVerifyPayment, useWallet } from '../hooks/use-wallet';
import type { VerifyPaymentResponse } from '../types';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled';

/**
 * Payment Callback Page
 *
 * After a user completes (or cancels) payment on PayOS, they are redirected
 * back to this page with query params such as `orderCode`, `status`, etc.
 * This page automatically calls verify-payment to confirm the transaction
 * and credit the wallet.
 */
export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderCode =
    searchParams.get('orderCode') ?? searchParams.get('order_code') ?? '';
  const cancelled =
    searchParams.get('cancel') === 'true' ||
    searchParams.get('status') === 'CANCELLED';

  const verifyPayment = useVerifyPayment();
  const { refetch: refetchWallet } = useWallet();

  // Use explicit state so React guarantees a re-render on status change
  const [status, setStatus] = useState<PaymentStatus>(
    cancelled ? 'cancelled' : 'loading'
  );
  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse | null>(
    null
  );

  // Guard against React 18 StrictMode double-invoke
  const hasVerified = useRef(false);

  // Automatically verify on mount (only if not cancelled)
  useEffect(() => {
    if (!orderCode || cancelled || hasVerified.current) return;

    hasVerified.current = true;
    verifyPayment.mutate(
      { orderCode },
      {
        onSuccess: (data) => {
          setPaymentData(data);
          setStatus(data.isSuccess ? 'success' : 'failed');
          refetchWallet();
        },
        onError: () => {
          setStatus('failed');
        },
      }
    );
  }, [orderCode, cancelled]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  return (
    <PatientLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="medical-card w-full max-w-md text-center">
          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
              </div>
              <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                Verifying Payment...
              </h1>
              <p className="text-(--text-secondary)">
                Please wait while we confirm your payment.
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
                Payment Successful!
              </h1>
              <p className="text-(--text-secondary) mb-6">
                Your wallet has been credited successfully.
              </p>

              {/* Payment details */}
              <div className="bg-(--bg-secondary) rounded-xl p-4 mb-6 space-y-3">
                {paymentData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-(--text-secondary)">
                        Amount
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(paymentData.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-(--text-secondary)">
                        Order Code
                      </span>
                      <span className="font-mono text-sm text-(--text-primary)">
                        {paymentData.orderCode}
                      </span>
                    </div>
                    {paymentData.newBalance !== null && (
                      <div className="flex items-center justify-between pt-3 border-t border-(--border-color)">
                        <span className="text-sm text-(--text-secondary) flex items-center gap-1">
                          <Wallet className="w-4 h-4" /> New Balance
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
                Payment Failed
              </h1>
              <p className="text-(--text-secondary) mb-6">
                {paymentData?.message ||
                  'The payment could not be verified. No charges have been made.'}
              </p>

              {orderCode && (
                <div className="bg-(--bg-secondary) rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--text-secondary)">
                      Order Code
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
                Payment Cancelled
              </h1>
              <p className="text-(--text-secondary) mb-6">
                You cancelled the payment. No charges have been made.
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
                Back to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
