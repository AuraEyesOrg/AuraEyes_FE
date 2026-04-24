import { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ExternalLink,
  Copy,
  Receipt,
  PartyPopper,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/helper';
import { useOrderDetails } from '../hooks/use-billing';

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
  const [method, setMethod] = useState<'Cash' | 'PayOS'>('Cash');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Poll order status if PayOS is generated and not yet successful
  const { data: orderDetails } = useOrderDetails(
    paymentResult?.orderId || null,
    paymentResult && !isSuccess ? 3000 : 0
  );

  useEffect(() => {
    if (orderDetails?.status === 'Completed' && !isSuccess) {
      setIsSuccess(true);
      toast.success('Thanh toán PayOS thành công!');
      // Keep showing success for 2 seconds then close
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setPaymentResult(null);
      }, 3000);
    }
  }, [orderDetails, isSuccess, onClose]);

  if (!open || !appointment) return null;

  const handleConfirm = async () => {
    try {
      const result = await onConfirm(method);
      if (method === 'PayOS' && result?.paymentUrl) {
        setPaymentResult(result);
      } else {
        onClose();
      }
    } catch (error) {
      // Error handled by parent toast
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép liên kết thanh toán');
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
                Xác nhận thanh toán
              </h3>
              <p className="text-xs text-slate-500">
                Đơn hàng: {appointment.orderId?.slice(0, 8)}
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
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                  <PartyPopper className="h-12 w-12" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  Thanh toán thành công!
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Hệ thống đã ghi nhận giao dịch của khách hàng.
                </p>
              </div>
              <div className="w-full mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Mã đơn hàng
                  </span>
                  <span className="text-emerald-900 dark:text-emerald-200 font-bold uppercase">
                    {paymentResult?.paymentOrderCode || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : !paymentResult ? (
            <div className="space-y-6">
              {/* Patient Info Summary */}
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">
                    Bệnh nhân
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {appointment.patientName}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-500">
                    Tổng phí dịch vụ
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(appointment.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-slate-500">
                    Đã cọc (Online)
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    -{formatCurrency(appointment.depositAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Cần thanh toán nốt
                  </span>
                  <span className="text-xl font-black text-rose-600">
                    {formatCurrency(appointment.remainingAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Phương thức thanh toán
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
                      Tiền mặt
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
                      PayOS QR
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
                  ? 'Xác nhận thu tiền mặt'
                  : 'Tạo mã QR thanh toán'}
              </button>
            </div>
          ) : (
            /* PayOS QR Display */
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border-4 border-brand/20 p-4 bg-white shadow-inner">
                  <QRCodeSVG
                    value={paymentResult.paymentUrl}
                    size={220}
                    includeMargin={true}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Mã đơn hàng PayOS
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    {paymentResult.paymentOrderCode}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="flex-1 text-xs text-slate-500 truncate text-left">
                    {paymentResult.paymentUrl}
                  </p>
                  <button
                    onClick={() => copyToClipboard(paymentResult.paymentUrl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={paymentResult.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mở link
                  </a>
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-md shadow-brand/20 hover:bg-brand/90"
                  >
                    Xong
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 flex items-start gap-2 dark:bg-amber-900/10">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 text-left">
                  Vui lòng chờ khách hàng quét mã và xác nhận thanh toán trên
                  ứng dụng ngân hàng. Hệ thống sẽ tự động cập nhật khi nhận được
                  tín hiệu từ PayOS.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
