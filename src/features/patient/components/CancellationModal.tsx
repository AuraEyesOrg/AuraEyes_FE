import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, AlertTriangle } from 'lucide-react';
import type { RequestCancellationRequest } from '../types/clinic-booking.types';

const cancellationSchema = yup
  .object({
    bankName: yup.string().required('Bank Name is required'),
    accountName: yup.string().required('Account Name is required'),
    bankNumber: yup.string().required('Bank Account Number is required'),
    reason: yup.string().optional(),
  })
  .required();

interface CancellationModalProps {
  open: boolean;
  isSubmitting?: boolean;
  initialValues?: {
    bankName?: string | null;
    accountName?: string | null;
    bankNumber?: string | null;
  };
  labels: {
    modalTitle: string;
    modalSubtitle: string;
    bankName: string;
    accountName: string;
    bankNumber: string;
    reason: string;
    confirmLabel: string;
    cancelling: string;
    ruleNotice: string;
  };
  onClose: () => void;
  onSubmit: (values: RequestCancellationRequest) => void;
}

export const CancellationModal = ({
  open,
  isSubmitting,
  initialValues,
  labels,
  onClose,
  onSubmit,
}: CancellationModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestCancellationRequest>({
    resolver: yupResolver(cancellationSchema) as any,
    defaultValues: {
      bankName: initialValues?.bankName ?? '',
      accountName: initialValues?.accountName ?? '',
      bankNumber: initialValues?.bankNumber ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        bankName: initialValues?.bankName ?? '',
        accountName: initialValues?.accountName ?? '',
        bankNumber: initialValues?.bankNumber ?? '',
        reason: '',
      });
    }
  }, [open, reset, initialValues]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {labels.modalTitle}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              {labels.modalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
              {labels.ruleNotice}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {labels.bankName}
              </label>
              <input
                {...register('bankName')}
                placeholder="e.g. Vietcombank"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors shadow-sm"
              />
              {errors.bankName && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {labels.accountName}
              </label>
              <input
                {...register('accountName')}
                placeholder="NGUYEN VAN A"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors shadow-sm"
              />
              {errors.accountName && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.accountName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {labels.bankNumber}
              </label>
              <input
                {...register('bankNumber')}
                placeholder="1234567890"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors shadow-sm"
              />
              {errors.bankNumber && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.bankNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {labels.reason}
              </label>
              <textarea
                {...register('reason')}
                rows={3}
                placeholder={labels.reason}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors shadow-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] px-6 py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? labels.cancelling : labels.confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancellationModal;
