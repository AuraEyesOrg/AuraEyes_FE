import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { appointmentsApi } from '../api/appointments.api';
import { extractApiErrorMessage } from '@/lib/api-error';

const formatMoney = (value: number, locale: string) =>
  value.toLocaleString(locale, { style: 'currency', currency: 'VND' });

const formatDate = (value: string, locale: string) => {
  return new Date(value).toLocaleString(locale);
};

export default function RefundRequestsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';

  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const {
    data: cancellations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'pending-cancellations'],
    queryFn: () => appointmentsApi.getPendingCancellations(),
  });

  const confirmRefundMutation = useMutation({
    mutationFn: (id: string) =>
      appointmentsApi.confirmRefund(id, {
        refundTransactionId: refundTransactionId.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.refundRequests.toasts.confirmSuccess',
          'Refund confirmed successfully.'
        )
      );
      setConfirmingId(null);
      setRefundTransactionId('');
      setAdminNote('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'pending-cancellations'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.refundRequests.toasts.confirmError',
            'Unable to confirm refund.'
          )
        )
      );
    },
  });

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return cancellations;
    return cancellations.filter(
      (item) =>
        item.patientName.toLowerCase().includes(keyword) ||
        item.refundBankNumber.toLowerCase().includes(keyword)
    );
  }, [cancellations, searchTerm]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title={t('SystemAdmin.refundRequests.title', 'Refund Requests')}
          description={t(
            'SystemAdmin.refundRequests.description',
            'Process appointment cancellation refunds'
          )}
        />

        <main className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 min-w-80 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(
                  'SystemAdmin.refundRequests.searchPlaceholder',
                  'Search patient, phone, bank...'
                )}
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              {t('SystemAdmin.common.actions.refresh', 'Refresh')}
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-brand animate-spin mx-auto opacity-20" />
              <p className="text-sm text-slate-500 font-medium">
                {t('SystemAdmin.common.loadingData', 'Loading data...')}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                {t(
                  'SystemAdmin.refundRequests.empty',
                  'No pending refund requests found.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800/50 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {t('SystemAdmin.common.status.pending', 'Pending')}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white truncate tracking-tight uppercase text-sm">
                          {item.patientName}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t(
                            'SystemAdmin.refundRequests.labels.appointmentDate',
                            'Appointment Time'
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-brand" />
                          {formatDate(
                            new Date(`${item.date}T${item.startTime}`),
                            dateLocale
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t(
                            'SystemAdmin.refundRequests.labels.refundAmount',
                            'Refund Amount'
                          )}
                        </p>
                        <p className="text-lg font-black text-emerald-600 tracking-tight">
                          {formatMoney(
                            item.depositAmount || item.totalAmount * 0.3,
                            dateLocale
                          )}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 italic">
                          (30% of {formatMoney(item.totalAmount, dateLocale)})
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                          {t(
                            'SystemAdmin.refundRequests.labels.bankingInfo',
                            'Banking Information'
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {t(
                              'SystemAdmin.refundRequests.labels.bankName',
                              'Bank'
                            )}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.refundBankName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {t(
                              'SystemAdmin.refundRequests.labels.accountName',
                              'Account'
                            )}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.refundAccountName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {t(
                              'SystemAdmin.refundRequests.labels.accountNumber',
                              'Number'
                            )}
                          </span>
                          <span className="font-mono font-bold text-brand">
                            {item.refundBankNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.cancellationReason && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t(
                            'SystemAdmin.refundRequests.labels.reason',
                            'Cancellation Reason'
                          )}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800 px-3 py-2 rounded-xl italic">
                          "{item.cancellationReason}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => setConfirmingId(item.id)}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t(
                          'SystemAdmin.refundRequests.actions.confirmRefund',
                          'Confirm & Complete Refund'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setConfirmingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t(
                  'SystemAdmin.refundRequests.modals.confirm.title',
                  'Process Refund'
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t(
                  'SystemAdmin.refundRequests.modals.confirm.subtitle',
                  'Enter refund details after completing the bank transfer.'
                )}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  {t(
                    'SystemAdmin.refundRequests.modals.confirm.transactionId',
                    'Transaction ID (Optional)'
                  )}
                </label>
                <input
                  value={refundTransactionId}
                  onChange={(e) => setRefundTransactionId(e.target.value)}
                  placeholder="e.g. REF123456789"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  {t('SystemAdmin.common.adminNote', 'Admin note')}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder={t(
                    'SystemAdmin.refundRequests.modals.confirm.notePlaceholder',
                    'e.g. Refunded via Vietcombank app'
                  )}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmingId(null)}
                className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                {t('SystemAdmin.common.actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => confirmRefundMutation.mutate(confirmingId)}
                disabled={confirmRefundMutation.isPending}
                className="flex-[1.5] px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {confirmRefundMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {confirmRefundMutation.isPending
                  ? t('SystemAdmin.common.actions.processing', 'Processing...')
                  : t('SystemAdmin.common.actions.confirm', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
