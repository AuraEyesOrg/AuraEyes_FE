import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, RefreshCw, Search, Wallet, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  cashflowApi,
  type CashflowActorRole,
  type CashflowStatus,
  type CashflowTransactionDetail,
} from '../api/cashflow.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const ROLE_FILTERS: Array<{
  labelKey: string;
  labelFallback: string;
  value: 'all' | CashflowActorRole;
}> = [
  {
    labelKey: 'SystemAdmin.cashflow.filters.role.all',
    labelFallback: 'All roles',
    value: 'all',
  },
  {
    labelKey: 'SystemAdmin.cashflow.roles.patient',
    labelFallback: 'Patient',
    value: 'Patient',
  },
  {
    labelKey: 'SystemAdmin.cashflow.roles.ophthalmologist',
    labelFallback: 'Ophthalmologist',
    value: 'Ophthalmologist',
  },
  {
    labelKey: 'SystemAdmin.cashflow.roles.organisation',
    labelFallback: 'Organisation',
    value: 'Organisation',
  },
];

const STATUS_FILTERS: Array<{
  labelKey: string;
  labelFallback: string;
  value: 'all' | CashflowStatus;
}> = [
  {
    labelKey: 'SystemAdmin.cashflow.filters.status.all',
    labelFallback: 'All statuses',
    value: 'all',
  },
  {
    labelKey: 'SystemAdmin.common.status.pending',
    labelFallback: 'Pending',
    value: 'Pending',
  },
  {
    labelKey: 'SystemAdmin.common.status.processing',
    labelFallback: 'Processing',
    value: 'Processing',
  },
  {
    labelKey: 'SystemAdmin.common.status.completed',
    labelFallback: 'Completed',
    value: 'Completed',
  },
  {
    labelKey: 'SystemAdmin.common.status.failed',
    labelFallback: 'Failed',
    value: 'Failed',
  },
  {
    labelKey: 'SystemAdmin.common.status.cancelled',
    labelFallback: 'Cancelled',
    value: 'Cancelled',
  },
  {
    labelKey: 'SystemAdmin.cashflow.status.refunded',
    labelFallback: 'Refunded',
    value: 'Refunded',
  },
];

const formatMoney = (value: number, locale: string) =>
  value.toLocaleString(locale, {
    style: 'currency',
    currency: 'VND',
  });

const formatDateTime = (value: string, locale: string, fallback: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleString(locale);
};

export default function CashflowPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [actorRole, setActorRole] = useState<'all' | CashflowActorRole>('all');
  const [status, setStatus] = useState<'all' | CashflowStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashflowTransactionDetail | null>(null);

  const query = useQuery({
    queryKey: [
      'admin',
      'cashflow',
      { pageNumber, pageSize, actorRole, status, searchTerm },
    ],
    queryFn: () =>
      cashflowApi.getTransactions({
        pageNumber,
        pageSize,
        actorRole: actorRole === 'all' ? undefined : actorRole,
        status: status === 'all' ? undefined : status,
        searchTerm: searchTerm.trim() || undefined,
      }),
  });

  const rows = query.data?.items ?? [];
  const pageMeta = query.data;

  const pageTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (row.amount || 0), 0),
    [rows]
  );

  const roleSummary = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.actorRole] = (acc[row.actorRole] || 0) + row.amount;
      return acc;
    }, {});
  }, [rows]);

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title={t('SystemAdmin.cashflow.title', 'Payment Transactions')}
          description={t(
            'SystemAdmin.cashflow.description',
            'Manage wallet top-up and withdrawal transactions in one financial table'
          )}
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title={t(
                'SystemAdmin.cashflow.summary.totalCurrentPage',
                'Total on current page'
              )}
              value={formatMoney(pageTotal, dateLocale)}
              tone="cyan"
            />
            <SummaryCard
              title={t('SystemAdmin.cashflow.summary.patients', 'Patients')}
              value={formatMoney(roleSummary.Patient ?? 0, dateLocale)}
              tone="emerald"
            />
            <SummaryCard
              title={t(
                'SystemAdmin.cashflow.summary.ophthalmologists',
                'Ophthalmologists'
              )}
              value={formatMoney(roleSummary.Ophthalmologist ?? 0, dateLocale)}
              tone="amber"
            />
            <SummaryCard
              title={t(
                'SystemAdmin.cashflow.summary.organisations',
                'Organisations'
              )}
              value={formatMoney(roleSummary.Organisation ?? 0, dateLocale)}
              tone="violet"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 min-w-64">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setPageNumber(1);
                    setSearchTerm(e.target.value);
                  }}
                  placeholder={t(
                    'SystemAdmin.cashflow.filters.searchPlaceholder',
                    'Search actor, reference, description...'
                  )}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={actorRole}
                  onChange={(e) => {
                    setPageNumber(1);
                    setActorRole(e.target.value as 'all' | CashflowActorRole);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {ROLE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey, option.labelFallback)}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => {
                    setPageNumber(1);
                    setStatus(e.target.value as 'all' | CashflowStatus);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey, option.labelFallback)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => query.refetch()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('SystemAdmin.common.actions.refresh', 'Refresh')}
                </button>
              </div>
            </div>

            {query.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t(
                  'SystemAdmin.cashflow.states.loading',
                  'Loading transaction records...'
                )}
              </div>
            ) : query.isError ? (
              <div className="py-10 text-center text-sm text-rose-500">
                {t(
                  'SystemAdmin.cashflow.states.loadError',
                  'Unable to load transaction records from API.'
                )}
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t(
                  'SystemAdmin.cashflow.states.empty',
                  'No transaction records found.'
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <th className="py-3 pr-3">
                          {t('SystemAdmin.cashflow.table.columns.date', 'Date')}
                        </th>
                        <th className="py-3 pr-3">
                          {t(
                            'SystemAdmin.cashflow.table.columns.actor',
                            'Actor'
                          )}
                        </th>
                        <th className="py-3 pr-3">
                          {t('SystemAdmin.cashflow.table.columns.role', 'Role')}
                        </th>
                        <th className="py-3 pr-3">
                          {t('SystemAdmin.cashflow.table.columns.type', 'Type')}
                        </th>
                        <th className="py-3 pr-3">
                          {t(
                            'SystemAdmin.cashflow.table.columns.amount',
                            'Amount'
                          )}
                        </th>
                        <th className="py-3 pr-3">
                          {t(
                            'SystemAdmin.cashflow.table.columns.status',
                            'Status'
                          )}
                        </th>
                        <th className="py-3 pr-3">
                          {t(
                            'SystemAdmin.cashflow.table.columns.reference',
                            'Reference'
                          )}
                        </th>
                        <th className="py-3 pr-3 text-right">
                          {t(
                            'SystemAdmin.cashflow.table.columns.action',
                            'Action'
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                            {formatDateTime(
                              row.createdAt,
                              dateLocale,
                              notAvailableLabel
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {row.actorName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.actorEmail || notAvailableLabel}
                            </p>
                          </td>
                          <td className="py-3 pr-3 text-slate-700 dark:text-slate-300">
                            {t(
                              `SystemAdmin.cashflow.roles.${row.actorRole.toLowerCase()}`,
                              row.actorRole
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="text-slate-700 dark:text-slate-300">
                              {row.transactionType}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.referenceType || notAvailableLabel}
                            </p>
                          </td>
                          <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            {formatMoney(row.amount, dateLocale)}
                          </td>
                          <td className="py-3 pr-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="py-3 pr-3 text-xs text-slate-500">
                            {row.bookingCode ||
                              row.referenceId ||
                              row.depositOrderCode ||
                              notAvailableLabel}
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTransaction(row)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {t(
                                'SystemAdmin.cashflow.table.actions.details',
                                'Details'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {t(
                      'SystemAdmin.cashflow.pagination.pageSummary',
                      'Showing page {{page}} of {{totalPages}}',
                      {
                        page: pageMeta?.pageNumber ?? pageNumber,
                        totalPages: pageMeta?.totalPages ?? 1,
                      }
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPageNumber((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pageMeta?.hasPrevious}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      {t(
                        'SystemAdmin.common.pagination.previous',
                        'Previous page'
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setPageNumber((prev) =>
                          pageMeta?.hasNext ? prev + 1 : prev
                        )
                      }
                      disabled={!pageMeta?.hasNext}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      {t('SystemAdmin.common.pagination.next', 'Next page')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: 'cyan' | 'emerald' | 'amber' | 'violet';
}) {
  const palette = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    emerald:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    violet:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
  };

  return (
    <div className={`rounded-2xl border p-4 ${palette[tone]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Wallet className="w-4 h-4" />
        <p className="text-sm">{title}</p>
      </div>
      <p className="min-w-0 break-words leading-tight text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CashflowStatus }) {
  const { t } = useSafeTranslation();

  const statusLabelMap: Record<CashflowStatus, string> = {
    Pending: t('SystemAdmin.common.status.pending', 'Pending'),
    Processing: t('SystemAdmin.common.status.processing', 'Processing'),
    Completed: t('SystemAdmin.common.status.completed', 'Completed'),
    Failed: t('SystemAdmin.common.status.failed', 'Failed'),
    Cancelled: t('SystemAdmin.common.status.cancelled', 'Cancelled'),
    Refunded: t('SystemAdmin.cashflow.status.refunded', 'Refunded'),
  };

  const classes =
    status === 'Completed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : status === 'Pending' || status === 'Processing'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : status === 'Refunded'
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {statusLabelMap[status]}
    </span>
  );
}

function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: CashflowTransactionDetail;
  onClose: () => void;
}) {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');

  const hasWithdrawalDetails =
    Boolean(transaction.withdrawalBankName) ||
    Boolean(transaction.withdrawalBankAccountNumber) ||
    Boolean(transaction.withdrawalExternalPayoutId) ||
    transaction.referenceType === 'WithdrawalRequest';

  const hasDepositDetails =
    Boolean(transaction.depositOrderCode) ||
    Boolean(transaction.depositPaymentMethod) ||
    Boolean(transaction.depositProviderTxnRef) ||
    transaction.referenceType === 'DepositRequest' ||
    transaction.transactionType === 'Deposit';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t(
                'SystemAdmin.cashflow.detailModal.title',
                'Payment Transaction Details'
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('SystemAdmin.cashflow.detailModal.idLabel', 'ID')}:{' '}
              {transaction.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          <section>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {t(
                'SystemAdmin.cashflow.detailModal.sections.general',
                'General Information'
              )}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.createdAt',
                  'Created At'
                )}
                value={formatDateTime(
                  transaction.createdAt,
                  dateLocale,
                  notAvailableLabel
                )}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.status',
                  'Status'
                )}
                value={transaction.status}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.actor',
                  'Actor'
                )}
                value={transaction.actorName}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.actorEmail',
                  'Actor Email'
                )}
                value={transaction.actorEmail || notAvailableLabel}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.actorRole',
                  'Actor Role'
                )}
                value={transaction.actorRole}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.amount',
                  'Amount'
                )}
                value={formatMoney(transaction.amount, dateLocale)}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.transactionType',
                  'Transaction Type'
                )}
                value={transaction.transactionType}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.referenceType',
                  'Reference Type'
                )}
                value={transaction.referenceType || notAvailableLabel}
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.referenceId',
                  'Reference ID'
                )}
                value={
                  transaction.referenceId ||
                  transaction.bookingCode ||
                  notAvailableLabel
                }
              />
              <DetailRow
                label={t(
                  'SystemAdmin.cashflow.detailModal.fields.description',
                  'Description'
                )}
                value={transaction.description || notAvailableLabel}
              />
            </div>
          </section>

          {hasDepositDetails && (
            <section>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {t(
                  'SystemAdmin.cashflow.detailModal.sections.topUp',
                  'Top-up Information'
                )}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.orderCode',
                    'Order Code'
                  )}
                  value={transaction.depositOrderCode || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.paymentMethod',
                    'Payment Method'
                  )}
                  value={transaction.depositPaymentMethod || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.completedAt',
                    'Completed At'
                  )}
                  value={
                    transaction.depositCompletedAt
                      ? formatDateTime(
                          transaction.depositCompletedAt,
                          dateLocale,
                          notAvailableLabel
                        )
                      : notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.providerTxnRef',
                    'Provider Txn Ref'
                  )}
                  value={transaction.depositProviderTxnRef || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.failureReason',
                    'Failure Reason'
                  )}
                  value={transaction.depositFailureReason || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.paymentUrl',
                    'Payment URL'
                  )}
                  value={transaction.depositPaymentUrl || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.returnUrl',
                    'Return URL'
                  )}
                  value={transaction.depositReturnUrl || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.cancelUrl',
                    'Cancel URL'
                  )}
                  value={transaction.depositCancelUrl || notAvailableLabel}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {t(
                    'SystemAdmin.cashflow.detailModal.fields.providerResponse',
                    'Provider Response'
                  )}
                </p>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">
                  {transaction.depositProviderResponse || notAvailableLabel}
                </div>
              </div>
            </section>
          )}

          {hasWithdrawalDetails && (
            <section>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {t(
                  'SystemAdmin.cashflow.detailModal.sections.withdrawal',
                  'Withdrawal Information'
                )}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.processedAt',
                    'Processed At'
                  )}
                  value={
                    transaction.withdrawalProcessedAt
                      ? formatDateTime(
                          transaction.withdrawalProcessedAt,
                          dateLocale,
                          notAvailableLabel
                        )
                      : notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.processedByAdmin',
                    'Processed By Admin'
                  )}
                  value={
                    transaction.withdrawalProcessedByAdminId ||
                    notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.bankName',
                    'Bank Name'
                  )}
                  value={transaction.withdrawalBankName || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.bankAccountNumber',
                    'Bank Account Number'
                  )}
                  value={
                    transaction.withdrawalBankAccountNumber || notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.accountHolder',
                    'Account Holder'
                  )}
                  value={
                    transaction.withdrawalAccountHolderName || notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.bankBin',
                    'Bank BIN'
                  )}
                  value={transaction.withdrawalBankBin || notAvailableLabel}
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.transferReference',
                    'Transfer Reference'
                  )}
                  value={
                    transaction.withdrawalTransferReference || notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.payOSExternalPayoutId',
                    'PayOS External Payout ID'
                  )}
                  value={
                    transaction.withdrawalExternalPayoutId || notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.payOSReferenceId',
                    'PayOS Reference ID'
                  )}
                  value={
                    transaction.withdrawalPayOSReferenceId || notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.payOSTransactionId',
                    'PayOS Transaction ID'
                  )}
                  value={
                    transaction.withdrawalPayOSTransactionId ||
                    notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.payOSApprovalState',
                    'PayOS Approval State'
                  )}
                  value={
                    transaction.withdrawalPayOSApprovalState ||
                    notAvailableLabel
                  }
                />
                <DetailRow
                  label={t(
                    'SystemAdmin.cashflow.detailModal.fields.payoutFee',
                    'Payout Fee'
                  )}
                  value={
                    transaction.withdrawalFee !== null &&
                    transaction.withdrawalFee !== undefined
                      ? formatMoney(transaction.withdrawalFee, dateLocale)
                      : notAvailableLabel
                  }
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="font-medium text-slate-800 dark:text-slate-100 break-all">
        {value}
      </p>
    </div>
  );
}
