import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, RefreshCw, Search, Wallet, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  cashflowApi,
  type CashflowActorRole,
  type CashflowStatus,
  type CashflowTransactionDetail,
} from '../api/cashflow.api';

const ROLE_FILTERS: Array<{ label: string; value: 'all' | CashflowActorRole }> =
  [
    { label: 'All roles', value: 'all' },
    { label: 'Patient', value: 'Patient' },
    { label: 'Ophthalmologist', value: 'Ophthalmologist' },
    { label: 'Organisation', value: 'Organisation' },
  ];

const STATUS_FILTERS: Array<{ label: string; value: 'all' | CashflowStatus }> =
  [
    { label: 'All statuses', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Refunded', value: 'Refunded' },
  ];

const formatMoney = (value: number) =>
  value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString('vi-VN');
};

export default function CashflowPage() {
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
          title="Payment Transactions"
          description="Manage wallet top-up and withdrawal transactions in one financial table"
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total on current page"
              value={formatMoney(pageTotal)}
              tone="cyan"
            />
            <SummaryCard
              title="Patients"
              value={formatMoney(roleSummary.Patient ?? 0)}
              tone="emerald"
            />
            <SummaryCard
              title="Ophthalmologists"
              value={formatMoney(roleSummary.Ophthalmologist ?? 0)}
              tone="amber"
            />
            <SummaryCard
              title="Organisations"
              value={formatMoney(roleSummary.Organisation ?? 0)}
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
                  placeholder="Search actor, reference, description..."
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
                      {option.label}
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
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => query.refetch()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {query.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Loading transaction records...
              </div>
            ) : query.isError ? (
              <div className="py-10 text-center text-sm text-rose-500">
                Unable to load transaction records from API.
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No transaction records found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <th className="py-3 pr-3">Date</th>
                        <th className="py-3 pr-3">Actor</th>
                        <th className="py-3 pr-3">Role</th>
                        <th className="py-3 pr-3">Type</th>
                        <th className="py-3 pr-3">Amount</th>
                        <th className="py-3 pr-3">Status</th>
                        <th className="py-3 pr-3">Reference</th>
                        <th className="py-3 pr-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                            {formatDateTime(row.createdAt)}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {row.actorName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.actorEmail || 'N/A'}
                            </p>
                          </td>
                          <td className="py-3 pr-3 text-slate-700 dark:text-slate-300">
                            {row.actorRole}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="text-slate-700 dark:text-slate-300">
                              {row.transactionType}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.referenceType || 'N/A'}
                            </p>
                          </td>
                          <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            {formatMoney(row.amount)}
                          </td>
                          <td className="py-3 pr-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="py-3 pr-3 text-xs text-slate-500">
                            {row.bookingCode ||
                              row.referenceId ||
                              row.depositOrderCode ||
                              'N/A'}
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTransaction(row)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Showing page {pageMeta?.pageNumber ?? pageNumber} of{' '}
                    {pageMeta?.totalPages ?? 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPageNumber((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pageMeta?.hasPrevious}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      Previous
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
                      Next
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
      {status}
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
              Payment Transaction Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {transaction.id}
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
              General Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <DetailRow
                label="Created At"
                value={formatDateTime(transaction.createdAt)}
              />
              <DetailRow label="Status" value={transaction.status} />
              <DetailRow label="Actor" value={transaction.actorName} />
              <DetailRow
                label="Actor Email"
                value={transaction.actorEmail || 'N/A'}
              />
              <DetailRow label="Actor Role" value={transaction.actorRole} />
              <DetailRow
                label="Amount"
                value={formatMoney(transaction.amount)}
              />
              <DetailRow
                label="Transaction Type"
                value={transaction.transactionType}
              />
              <DetailRow
                label="Reference Type"
                value={transaction.referenceType || 'N/A'}
              />
              <DetailRow
                label="Reference ID"
                value={
                  transaction.referenceId || transaction.bookingCode || 'N/A'
                }
              />
              <DetailRow
                label="Description"
                value={transaction.description || 'N/A'}
              />
            </div>
          </section>

          {hasDepositDetails && (
            <section>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Top-up Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailRow
                  label="Order Code"
                  value={transaction.depositOrderCode || 'N/A'}
                />
                <DetailRow
                  label="Payment Method"
                  value={transaction.depositPaymentMethod || 'N/A'}
                />
                <DetailRow
                  label="Completed At"
                  value={
                    transaction.depositCompletedAt
                      ? formatDateTime(transaction.depositCompletedAt)
                      : 'N/A'
                  }
                />
                <DetailRow
                  label="Provider Txn Ref"
                  value={transaction.depositProviderTxnRef || 'N/A'}
                />
                <DetailRow
                  label="Failure Reason"
                  value={transaction.depositFailureReason || 'N/A'}
                />
                <DetailRow
                  label="Payment URL"
                  value={transaction.depositPaymentUrl || 'N/A'}
                />
                <DetailRow
                  label="Return URL"
                  value={transaction.depositReturnUrl || 'N/A'}
                />
                <DetailRow
                  label="Cancel URL"
                  value={transaction.depositCancelUrl || 'N/A'}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Provider Response
                </p>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">
                  {transaction.depositProviderResponse || 'N/A'}
                </div>
              </div>
            </section>
          )}

          {hasWithdrawalDetails && (
            <section>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Withdrawal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailRow
                  label="Processed At"
                  value={
                    transaction.withdrawalProcessedAt
                      ? formatDateTime(transaction.withdrawalProcessedAt)
                      : 'N/A'
                  }
                />
                <DetailRow
                  label="Processed By Admin"
                  value={transaction.withdrawalProcessedByAdminId || 'N/A'}
                />
                <DetailRow
                  label="Bank Name"
                  value={transaction.withdrawalBankName || 'N/A'}
                />
                <DetailRow
                  label="Bank Account Number"
                  value={transaction.withdrawalBankAccountNumber || 'N/A'}
                />
                <DetailRow
                  label="Account Holder"
                  value={transaction.withdrawalAccountHolderName || 'N/A'}
                />
                <DetailRow
                  label="Bank BIN"
                  value={transaction.withdrawalBankBin || 'N/A'}
                />
                <DetailRow
                  label="Transfer Reference"
                  value={transaction.withdrawalTransferReference || 'N/A'}
                />
                <DetailRow
                  label="PayOS External Payout ID"
                  value={transaction.withdrawalExternalPayoutId || 'N/A'}
                />
                <DetailRow
                  label="PayOS Reference ID"
                  value={transaction.withdrawalPayOSReferenceId || 'N/A'}
                />
                <DetailRow
                  label="PayOS Transaction ID"
                  value={transaction.withdrawalPayOSTransactionId || 'N/A'}
                />
                <DetailRow
                  label="PayOS Approval State"
                  value={transaction.withdrawalPayOSApprovalState || 'N/A'}
                />
                <DetailRow
                  label="Payout Fee"
                  value={
                    transaction.withdrawalFee !== null &&
                    transaction.withdrawalFee !== undefined
                      ? formatMoney(transaction.withdrawalFee)
                      : 'N/A'
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
