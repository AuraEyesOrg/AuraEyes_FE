import { useState } from 'react';
import { X, Banknote, CheckCircle2, QrCode, Receipt } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/helper';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  onConfirm: (method: 'Cash' | 'PayOS') => Promise<any>;
  isProcessing: boolean;
}

export default function PaymentConfirmationModal({
  open,
  onClose,
  appointment,
  onConfirm,
  isProcessing,
}: PaymentConfirmationModalProps) {
  const { t } = useSafeTranslation();
  const [method, setMethod] = useState<'Cash' | 'PayOS'>('Cash');

  if (!open || !appointment) return null;

  const handleConfirm = async () => {
    try {
      const result = await onConfirm(method);
      if (method === 'PayOS' && result?.paymentUrl) {
        // Redirect directly to PayOS checkout page
        window.location.href = result.paymentUrl;
      } else {
        // Cash payment completed, just close
        onClose();
      }
    } catch (error) {
      // Error handled by parent toast
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t(
                  'ClinicStaff.paymentConfirmationModal.header.title',
                  'Confirm payment'
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'ClinicStaff.paymentConfirmationModal.header.order',
                  'Order: {{orderId}}',
                  { orderId: appointment.orderId?.slice(0, 8) ?? 'N/A' }
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Patient Info Summary */}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">
                  {t(
                    'ClinicStaff.paymentConfirmationModal.summary.patient',
                    'Patient'
                  )}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {appointment.patientName}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-500">
                  {t(
                    'ClinicStaff.paymentConfirmationModal.summary.totalFee',
                    'Total service fee'
                  )}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(appointment.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-slate-500">
                  {t(
                    'ClinicStaff.paymentConfirmationModal.summary.alreadyPaid',
                    'Already paid'
                  )}
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  -{formatCurrency(appointment.paidAmount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {t(
                    'ClinicStaff.paymentConfirmationModal.summary.remaining',
                    'Remaining amount'
                  )}
                </span>
                <span className="text-xl font-black text-rose-600">
                  {formatCurrency(appointment.remainingAmount || 0)}
                </span>
              </div>
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t(
                  'ClinicStaff.paymentConfirmationModal.methods.label',
                  'Payment method'
                )}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod('Cash')}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    method === 'Cash'
                      ? 'border-brand bg-brand/5 dark:bg-brand/10'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${method === 'Cash' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    <Banknote className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-sm font-bold ${method === 'Cash' ? 'text-brand' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {t(
                      'ClinicStaff.paymentConfirmationModal.methods.cash',
                      'Cash'
                    )}
                  </span>
                </button>

                <button
                  onClick={() => setMethod('PayOS')}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    method === 'PayOS'
                      ? 'border-brand bg-brand/5 dark:bg-brand/10'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${method === 'PayOS' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    <QrCode className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-sm font-bold ${method === 'PayOS' ? 'text-brand' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {t(
                      'ClinicStaff.paymentConfirmationModal.methods.payosQr',
                      'PayOS QR'
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirmation Button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <Spinner size={20} className="text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {method === 'Cash'
                ? t(
                    'ClinicStaff.paymentConfirmationModal.actions.confirmCash',
                    'Confirm cash payment'
                  )
                : t(
                    'ClinicStaff.paymentConfirmationModal.actions.goToPayment',
                    'Go to payment page'
                  )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
