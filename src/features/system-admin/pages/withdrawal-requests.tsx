import { useMemo, useState, type ComponentType } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock3,
  RefreshCw,
  Search,
  Send,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  ophthalmologistApi,
  type AdminWithdrawalRequestItem,
  type WithdrawalRequestStatus,
} from '../api/ophthalmologist.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';

const WITHDRAWAL_TOAST_IDS = {
  confirm: 'system-admin-withdraw-confirm',
  reject: 'system-admin-withdraw-reject',
  payosPayout: 'system-admin-withdraw-payos-payout',
  payosSync: 'system-admin-withdraw-payos-sync',
} as const;

const formatMoney = (value: number, locale: string) =>
  value.toLocaleString(locale, { style: 'currency', currency: 'VND' });

const formatDate = (
  value: string | undefined | null,
  locale: string,
  fallback: string
) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleString(locale);
};

/** Color coding for PayOS approvalState values */
const getPayOSStateBadgeClass = (state: string) => {
  if (state === 'COMPLETED' || state === 'SUCCEEDED')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (state === 'FAILED')
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
  return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
};

export default function WithdrawalRequestsPage() {
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');

  const statusOptions: Array<{
    label: string;
    value: WithdrawalRequestStatus | 'all';
  }> = [
    {
      label: t('SystemAdmin.withdrawalRequests.filters.status.all', 'All'),
      value: 'all',
    },
    {
      label: t('SystemAdmin.common.status.pending', 'Pending'),
      value: 'Pending',
    },
    {
      label: t('SystemAdmin.common.status.processing', 'Processing'),
      value: 'Processing',
    },
    {
      label: t('SystemAdmin.common.status.completed', 'Completed'),
      value: 'Completed',
    },
    {
      label: t('SystemAdmin.common.status.failed', 'Failed'),
      value: 'Failed',
    },
    {
      label: t('SystemAdmin.common.status.cancelled', 'Cancelled'),
      value: 'Cancelled',
    },
  ];

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<WithdrawalRequestStatus | 'all'>(
    'Pending'
  );
  const [historyPageNumber, setHistoryPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const historyPageSize = 10;

  // Manual confirm modal state
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [transferReference, setTransferReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Track which request is being processed via PayOS or synced
  const [payosProcessingId, setPayosProcessingId] = useState<string | null>(
    null
  );
  const [payosSyncingId, setPayosSyncingId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [
      'admin',
      'withdrawal-requests',
      { pageNumber, pageSize, status },
    ],
    queryFn: () =>
      ophthalmologistApi.getWithdrawalRequests(
        pageNumber,
        pageSize,
        status === 'all' ? undefined : status
      ),
  });

  const withdrawHistoryQuery = useQuery({
    queryKey: [
      'admin',
      'completed-withdrawal-requests',
      { historyPageNumber, historyPageSize },
    ],
    queryFn: () =>
      ophthalmologistApi.getWithdrawalRequests(
        historyPageNumber,
        historyPageSize,
        'Completed'
      ),
  });

  const confirmMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.confirmWithdrawalRequest(requestId, {
        transferReference: transferReference.trim() || undefined,
        note: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.withdrawalRequests.toasts.confirmSuccess',
          'Withdrawal transfer confirmed successfully.'
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.confirm,
        }
      );
      setConfirmingId(null);
      setTransferReference('');
      setAdminNote('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.withdrawalRequests.toasts.confirmError',
            'Unable to confirm withdrawal request.'
          )
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.confirm,
        }
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.rejectWithdrawalRequest(requestId, {
        reason: rejectReason.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.withdrawalRequests.toasts.rejectSuccess',
          'Withdrawal request rejected.'
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.reject,
        }
      );
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.withdrawalRequests.toasts.rejectError',
            'Unable to reject withdrawal request.'
          )
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.reject,
        }
      );
    },
  });

  /**
   * PayOS Payout mutation — triggers automatic bank transfer via PayOS API.
   * Requires the withdrawal request to have a valid BankBin set by the doctor.
   */
  const payosPayoutMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.processPayoutViaPayOS(requestId),
    onSuccess: (data) => {
      const state = data.approvalState ?? 'UNKNOWN';
      toast.success(
        t(
          'SystemAdmin.withdrawalRequests.toasts.payosPayoutSuccess',
          'PayOS payout successful. State: {{state}}. PayOS ID: {{payOSId}}',
          {
            state,
            payOSId: data.externalPayoutId,
          }
        ),
        { toastId: WITHDRAWAL_TOAST_IDS.payosPayout }
      );
      setPayosProcessingId(null);
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.withdrawalRequests.toasts.payosPayoutError',
            'Unable to process payout via PayOS.'
          )
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.payosPayout,
        }
      );
      setPayosProcessingId(null);
    },
  });

  /**
   * Sync PayOS payout status mutation — fetches latest state from PayOS and
   * updates the WithdrawalRequest in the DB.
   */
  const syncPayoutStatusMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.syncPayoutStatus(requestId),
    onSuccess: (data) => {
      toast.success(
        t(
          'SystemAdmin.withdrawalRequests.toasts.payosSyncSuccess',
          'Synced payout state: {{approvalState}} -> Withdrawal: {{withdrawalStatus}}',
          {
            approvalState: data.approvalState,
            withdrawalStatus: data.withdrawalStatus,
          }
        ),
        { toastId: WITHDRAWAL_TOAST_IDS.payosSync }
      );
      setPayosSyncingId(null);
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.withdrawalRequests.toasts.payosSyncError',
            'Unable to sync PayOS payout status.'
          )
        ),
        {
          toastId: WITHDRAWAL_TOAST_IDS.payosSync,
        }
      );
      setPayosSyncingId(null);
    },
  });

  const handlePayOSPayout = (requestId: string) => {
    setPayosProcessingId(requestId);
    payosPayoutMutation.mutate(requestId);
  };

  const handleSyncPayoutStatus = (requestId: string) => {
    setPayosSyncingId(requestId);
    syncPayoutStatusMutation.mutate(requestId);
  };

  const filteredItems = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) => {
      return (
        item.doctorFullName.toLowerCase().includes(keyword) ||
        item.doctorEmail.toLowerCase().includes(keyword) ||
        item.bankAccountNumber.toLowerCase().includes(keyword) ||
        item.bankName.toLowerCase().includes(keyword) ||
        (item.contractNumber ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [listQuery.data?.items, searchTerm]);

  const summary = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const pending = items.filter(
      (x) => x.status === 'Pending' || x.status === 'Processing'
    ).length;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    return { pending, totalAmount };
  }, [listQuery.data?.items]);

  const withdrawalHistoryItems = useMemo(() => {
    const items = withdrawHistoryQuery.data?.items ?? [];
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) =>
      [
        item.doctorFullName,
        item.doctorEmail,
        item.bankAccountNumber,
        item.bankName,
        item.contractNumber ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [withdrawHistoryQuery.data?.items, searchTerm]);

  const getStatusChip = (status: WithdrawalRequestStatus) => {
    if (status === 'Completed') {
      return {
        label: t('SystemAdmin.common.status.completed', 'Completed'),
        className:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: BadgeCheck,
      };
    }

    if (status === 'Failed' || status === 'Cancelled') {
      return {
        label:
          status === 'Cancelled'
            ? t('SystemAdmin.common.status.cancelled', 'Cancelled')
            : t('SystemAdmin.common.status.failed', 'Failed'),
        className:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: XCircle,
      };
    }

    return {
      label:
        status === 'Processing'
          ? t('SystemAdmin.common.status.processing', 'Processing')
          : t('SystemAdmin.common.status.pending', 'Pending'),
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      icon: Clock3,
    };
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title={t(
            'SystemAdmin.withdrawalRequests.title',
            'Withdrawal Requests'
          )}
          description={t(
            'SystemAdmin.withdrawalRequests.description',
            'Process withdrawal requests from ophthalmologists'
          )}
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t(
                  'SystemAdmin.withdrawalRequests.summary.pendingRequests',
                  'Requests waiting for processing'
                )}
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {summary.pending}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-4">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                {t(
                  'SystemAdmin.withdrawalRequests.summary.totalAmountCurrentPage',
                  'Total amount on current page'
                )}
              </p>
              <p className="min-w-0 wrap-break-word leading-tight text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                {formatMoney(summary.totalAmount, dateLocale)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 min-w-60">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t(
                    'SystemAdmin.withdrawalRequests.filters.searchPlaceholder',
                    'Search doctor, email, bank account...'
                  )}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(
                      e.target.value as WithdrawalRequestStatus | 'all'
                    );
                    setPageNumber(1);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => listQuery.refetch()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('SystemAdmin.common.actions.refresh', 'Refresh')}
                </button>
              </div>
            </div>

            {listQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t('SystemAdmin.common.loadingData', 'Loading data...')}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t(
                  'SystemAdmin.withdrawalRequests.states.empty',
                  'No withdrawal requests found.'
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const statusChip = getStatusChip(item.status);
                  const StatusIcon = statusChip.icon;
                  const canProcess =
                    item.status === 'Pending' || item.status === 'Processing';
                  const hasBankBin = Boolean(item.bankBin);
                  const hasPayOSPayout = Boolean(item.externalPayoutId);
                  const isPayOSProcessing = payosProcessingId === item.id;
                  const isPayOSSyncing = payosSyncingId === item.id;

                  return (
                    <RequestCard
                      key={item.id}
                      item={item}
                      canProcess={canProcess}
                      hasBankBin={hasBankBin}
                      hasPayOSPayout={hasPayOSPayout}
                      isPayOSProcessing={isPayOSProcessing}
                      isPayOSSyncing={isPayOSSyncing}
                      statusLabel={statusChip.label}
                      statusClassName={statusChip.className}
                      StatusIcon={StatusIcon}
                      locale={dateLocale}
                      notAvailableLabel={notAvailableLabel}
                      onConfirm={() => {
                        setConfirmingId(item.id);
                        setTransferReference(item.transferReference ?? '');
                        setAdminNote(item.adminNote ?? '');
                      }}
                      onReject={() => {
                        setRejectingId(item.id);
                        setRejectReason('');
                      }}
                      onPayOSPayout={() => handlePayOSPayout(item.id)}
                      onSyncPayoutStatus={() => handleSyncPayoutStatus(item.id)}
                    />
                  );
                })}
              </div>
            )}

            {listQuery.data && listQuery.data.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!listQuery.data.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('SystemAdmin.common.pagination.previous', 'Previous page')}
                </button>
                <p className="text-sm text-slate-500">
                  {t(
                    'SystemAdmin.common.pagination.label',
                    'Page {{page}}/{{total}}',
                    {
                      page: listQuery.data.pageNumber,
                      total: listQuery.data.totalPages,
                    }
                  )}
                </p>
                <button
                  onClick={() =>
                    setPageNumber((p) =>
                      Math.min(listQuery.data!.totalPages, p + 1)
                    )
                  }
                  disabled={!listQuery.data.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  {t('SystemAdmin.common.pagination.next', 'Next page')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {t(
                  'SystemAdmin.withdrawalRequests.history.title',
                  'Withdrawal Transaction History'
                )}
              </h3>
              <button
                onClick={() => withdrawHistoryQuery.refetch()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {t(
                  'SystemAdmin.withdrawalRequests.history.refresh',
                  'Refresh history'
                )}
              </button>
            </div>

            {withdrawHistoryQuery.isLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {t(
                  'SystemAdmin.withdrawalRequests.history.loading',
                  'Loading withdrawal history...'
                )}
              </div>
            ) : withdrawalHistoryItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {t(
                  'SystemAdmin.withdrawalRequests.history.empty',
                  'No withdrawal transaction history yet.'
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.created',
                          'Created'
                        )}
                      </th>
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.doctor',
                          'Doctor'
                        )}
                      </th>
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.amount',
                          'Amount'
                        )}
                      </th>
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.type',
                          'Type'
                        )}
                      </th>
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.reference',
                          'Reference'
                        )}
                      </th>
                      <th className="py-2 pr-3">
                        {t(
                          'SystemAdmin.withdrawalRequests.history.columns.description',
                          'Description'
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalHistoryItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {formatDate(
                            item.createdAt,
                            dateLocale,
                            notAvailableLabel
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {item.doctorFullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.doctorEmail ?? notAvailableLabel}
                          </p>
                        </td>
                        <td className="py-2 pr-3 font-semibold text-amber-600">
                          {formatMoney(item.amount, dateLocale)}
                        </td>
                        <td className="py-2 pr-3">
                          {t(
                            'SystemAdmin.withdrawalRequests.history.withdrawalType',
                            'Withdrawal'
                          )}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-500">
                          {item.transferReference ??
                            item.externalPayoutId ??
                            notAvailableLabel}
                        </td>
                        <td className="py-2 pr-3">
                          {item.adminNote ?? item.note ?? notAvailableLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {withdrawHistoryQuery.data &&
            withdrawHistoryQuery.data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() =>
                    setHistoryPageNumber((p) => Math.max(1, p - 1))
                  }
                  disabled={!withdrawHistoryQuery.data.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('SystemAdmin.common.pagination.previous', 'Previous page')}
                </button>
                <p className="text-sm text-slate-500">
                  {t(
                    'SystemAdmin.common.pagination.label',
                    'Page {{page}}/{{total}}',
                    {
                      page: withdrawHistoryQuery.data.pageNumber,
                      total: withdrawHistoryQuery.data.totalPages,
                    }
                  )}
                </p>
                <button
                  onClick={() =>
                    setHistoryPageNumber((p) =>
                      Math.min(withdrawHistoryQuery.data!.totalPages, p + 1)
                    )
                  }
                  disabled={!withdrawHistoryQuery.data.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  {t('SystemAdmin.common.pagination.next', 'Next page')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Manual confirm transfer modal */}
      {confirmingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-lg font-semibold">
              {t(
                'SystemAdmin.withdrawalRequests.modals.confirm.title',
                'Confirm transfer completed'
              )}
            </h3>
            <label className="block space-y-1 text-sm">
              <span>
                {t(
                  'SystemAdmin.withdrawalRequests.modals.confirm.transferReference',
                  'Transfer reference'
                )}
              </span>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>{t('SystemAdmin.common.adminNote', 'Admin note')}</span>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
              >
                {t('SystemAdmin.common.actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => confirmMutation.mutate(confirmingId)}
                disabled={confirmMutation.isPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {confirmMutation.isPending
                  ? t(
                      'SystemAdmin.withdrawalRequests.modals.confirm.processing',
                      'Confirming...'
                    )
                  : t(
                      'SystemAdmin.withdrawalRequests.modals.confirm.confirm',
                      'Confirm'
                    )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reject modal */}
      {rejectingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRejectingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-lg font-semibold">
              {t(
                'SystemAdmin.withdrawalRequests.modals.reject.title',
                'Reject withdrawal request'
              )}
            </h3>
            <label className="block space-y-1 text-sm">
              <span>
                {t(
                  'SystemAdmin.withdrawalRequests.modals.reject.reasonOptional',
                  'Reason (optional)'
                )}
              </span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
              >
                {t('SystemAdmin.common.actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => rejectMutation.mutate(rejectingId)}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {rejectMutation.isPending
                  ? t(
                      'SystemAdmin.withdrawalRequests.modals.reject.processing',
                      'Rejecting...'
                    )
                  : t('SystemAdmin.common.actions.reject', 'Reject')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface RequestCardProps {
  item: AdminWithdrawalRequestItem;
  canProcess: boolean;
  hasBankBin: boolean;
  hasPayOSPayout: boolean;
  isPayOSProcessing: boolean;
  isPayOSSyncing: boolean;
  statusLabel: string;
  statusClassName: string;
  StatusIcon: ComponentType<{ className?: string }>;
  locale: string;
  notAvailableLabel: string;
  onConfirm: () => void;
  onReject: () => void;
  onPayOSPayout: () => void;
  onSyncPayoutStatus: () => void;
}

function RequestCard({
  item,
  canProcess,
  hasBankBin,
  hasPayOSPayout,
  isPayOSProcessing,
  isPayOSSyncing,
  statusLabel,
  statusClassName,
  StatusIcon,
  locale,
  notAvailableLabel,
  onConfirm,
  onReject,
  onPayOSPayout,
  onSyncPayoutStatus,
}: RequestCardProps) {
  const { t } = useSafeTranslation();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {item.doctorFullName}
          </p>
          <p className="text-xs text-slate-500">{item.doctorEmail}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusLabel}
          </span>

          {/* PayOS payout state badge */}
          {item.payOSApprovalState ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPayOSStateBadgeClass(item.payOSApprovalState)}`}
            >
              {t(
                'SystemAdmin.withdrawalRequests.requestCard.payOSLabel',
                'PayOS'
              )}
              : {item.payOSApprovalState}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">
            {t('SystemAdmin.withdrawalRequests.requestCard.amount', 'Amount')}
          </p>
          <p className="font-semibold text-slate-900 dark:text-white mt-1">
            {formatMoney(item.amount, locale)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.bankAndAccount',
              'Bank / Account'
            )}
          </p>
          <p className="font-semibold text-slate-900 dark:text-white mt-1">
            {item.bankName}
            {item.bankBin ? (
              <span className="ml-1 text-xs text-slate-400 font-mono">
                (
                {t(
                  'SystemAdmin.withdrawalRequests.requestCard.bankBinLabel',
                  'BIN'
                )}
                : {item.bankBin})
              </span>
            ) : null}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {item.bankAccountNumber}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {item.accountHolderName}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">
            {t('SystemAdmin.withdrawalRequests.requestCard.time', 'Time')}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
            {t('SystemAdmin.common.createdAt', 'Created at')}:{' '}
            {formatDate(item.createdAt, locale, notAvailableLabel)}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.processedAt',
              'Processed at'
            )}
            : {formatDate(item.processedAt, locale, notAvailableLabel)}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 space-y-1">
        {item.contractNumber ? (
          <p>
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.contract',
              'Contract'
            )}
            : {item.contractNumber}
          </p>
        ) : null}
        {item.transferReference ? (
          <p>
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.transferCode',
              'Transfer code'
            )}
            : {item.transferReference}
          </p>
        ) : null}
        {item.note ? (
          <p>
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.doctorNote',
              'Doctor note'
            )}
            : {item.note}
          </p>
        ) : null}
        {item.adminNote ? (
          <p>
            {t('SystemAdmin.common.adminNote', 'Admin note')}: {item.adminNote}
          </p>
        ) : null}
        {item.externalPayoutId ? (
          <p className="font-mono text-indigo-600 dark:text-indigo-400">
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.payOSId',
              'PayOS ID'
            )}
            : {item.externalPayoutId}
          </p>
        ) : null}
        {item.payOSReferenceId ? (
          <p className="font-mono text-slate-400">
            {t(
              'SystemAdmin.withdrawalRequests.requestCard.reference',
              'Reference'
            )}
            : {item.payOSReferenceId}
          </p>
        ) : null}
      </div>

      {canProcess ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {/* Left: PayOS auto-payout actions */}
          <div className="flex items-center gap-2">
            {/* "Chi qua PayOS" — only shown if BankBin is set and no payout yet */}
            {hasBankBin && !hasPayOSPayout ? (
              <button
                onClick={onPayOSPayout}
                disabled={isPayOSProcessing}
                title={t(
                  'SystemAdmin.withdrawalRequests.requestCard.tooltips.payoutViaPayOS',
                  'Automatically process payout via PayOS API'
                )}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isPayOSProcessing
                  ? t(
                      'SystemAdmin.withdrawalRequests.requestCard.actions.payoutProcessing',
                      'Processing payout...'
                    )
                  : t(
                      'SystemAdmin.withdrawalRequests.requestCard.actions.payoutViaPayOS',
                      'Payout via PayOS'
                    )}
              </button>
            ) : null}

            {/* "Sync" — shown if a PayOS payout exists */}
            {hasPayOSPayout ? (
              <button
                onClick={onSyncPayoutStatus}
                disabled={isPayOSSyncing}
                title={t(
                  'SystemAdmin.withdrawalRequests.requestCard.tooltips.syncPayOS',
                  'Sync payout status from PayOS'
                )}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 dark:text-indigo-300 text-sm font-medium disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                {isPayOSSyncing
                  ? t(
                      'SystemAdmin.withdrawalRequests.requestCard.actions.syncingPayOS',
                      'Syncing...'
                    )
                  : t(
                      'SystemAdmin.withdrawalRequests.requestCard.actions.syncPayOS',
                      'Sync PayOS'
                    )}
              </button>
            ) : null}

            {/* Warn if no BankBin */}
            {!hasBankBin && !hasPayOSPayout ? (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {t(
                  'SystemAdmin.withdrawalRequests.requestCard.warnings.missingBankBin',
                  'Missing BankBIN - cannot auto payout via PayOS'
                )}
              </span>
            ) : null}
          </div>

          {/* Right: Manual confirm / reject */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 text-sm font-medium"
            >
              {t('SystemAdmin.common.actions.reject', 'Reject')}
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
            >
              {t(
                'SystemAdmin.withdrawalRequests.requestCard.actions.confirmManual',
                'Manual confirm'
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Sync button for completed/failed requests that have a PayOS ID */}
      {!canProcess && hasPayOSPayout ? (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onSyncPayoutStatus}
            disabled={isPayOSSyncing}
            title={t(
              'SystemAdmin.withdrawalRequests.requestCard.tooltips.syncPayOS',
              'Sync payout status from PayOS'
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 dark:text-indigo-300 text-sm font-medium disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" />
            {isPayOSSyncing
              ? t(
                  'SystemAdmin.withdrawalRequests.requestCard.actions.syncingPayOS',
                  'Syncing...'
                )
              : t(
                  'SystemAdmin.withdrawalRequests.requestCard.actions.syncPayOS',
                  'Sync PayOS'
                )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
