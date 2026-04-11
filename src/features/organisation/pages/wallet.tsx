import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  RefreshCw,
  ShoppingCart,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  CreditCard,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { orgBillingApi } from '../api/billing.api';
import {
  TransactionType,
  parseWalletTransactionType,
  type WalletTransactionDto,
} from '../api/wallet.api';
import {
  organisationWalletKeys,
  useOrganisationWallet,
  useOrganisationWalletTransactions,
} from '../hooks/use-wallet';
import { formatCurrency } from '@/lib/helper';
import { formatDateTimeWithYear } from '@/lib/date-utils';

const vndCurrencyOptions = {
  locale: 'vi-VN',
  currency: 'VND',
  minimumFractionDigits: 0,
} as const;

const getTransactionLabel = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.Deposit:
      return 'Deposit';
    case TransactionType.Withdrawal:
      return 'Withdrawal';
    case TransactionType.Payment:
      return 'Payment';
    case TransactionType.Refund:
      return 'Refund';
    case TransactionType.Transfer:
      return 'Transfer';
    case TransactionType.Bonus:
      return 'Bonus';
    default:
      return 'Transaction';
  }
};

const isCreditTransaction = (transaction: WalletTransactionDto): boolean => {
  const txType = parseWalletTransactionType(transaction.transactionType);
  return (
    txType === TransactionType.Deposit ||
    txType === TransactionType.Refund ||
    txType === TransactionType.Transfer ||
    txType === TransactionType.Bonus
  );
};

export default function OrganisationWalletPage() {
  const queryClient = useQueryClient();

  const [txPageNumber, setTxPageNumber] = useState(1);
  const [customQuotaAmount, setCustomQuotaAmount] = useState('100');
  const txPageSize = 10;

  const { data: billing, isLoading: isLoadingBilling } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const walletQuery = useOrganisationWallet();
  const transactionsQuery = useOrganisationWalletTransactions(
    txPageNumber,
    txPageSize
  );

  const buyQuotaMutation = useMutation({
    mutationFn: (quotaAmount: number) =>
      orgBillingApi.buyQuota({ quotaAmount }),
    onSuccess: (data, quotaAmount) => {
      toast.success(
        `Purchased ${quotaAmount} credits successfully. Wallet balance: ${data.walletBalance.toLocaleString('vi-VN')} VND`
      );
      queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['quotaBalance'] });
      queryClient.invalidateQueries({ queryKey: organisationWalletKeys.all });
    },
    onError: (error) => {
      let message = 'Unable to purchase quota. Please try again.';
      if (isAxiosError(error)) {
        const payload = error.response?.data as
          | { message?: string; detail?: string }
          | undefined;
        message = payload?.message || payload?.detail || message;
      }
      toast.error(message);
    },
  });

  const transactions = transactionsQuery.data?.items ?? [];
  const txPagination = transactionsQuery.data;
  const walletBalance =
    walletQuery.data?.balance ?? billing?.walletBalance ?? 0;

  const packageOptions = [50, 100, 500] as const;

  const handleBuyQuota = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please provide a valid quota amount.');
      return;
    }

    buyQuotaMutation.mutate(amount);
  };

  const handleRefresh = () => {
    walletQuery.refetch();
    transactionsQuery.refetch();
    queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });
  };

  const isLoading = isLoadingBilling || walletQuery.isLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--text-primary)">
                  Organisation Wallet
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Manage wallet balance, transactions, and buy quota packages.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-(--border-primary) text-sm font-semibold text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-5">
              <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium mb-2">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-cyan-800 dark:text-cyan-200">
                {formatCurrency(walletBalance, vndCurrencyOptions)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2">
                This Month In
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(
                  walletQuery.data?.totalDepositsThisMonth ?? 0,
                  vndCurrencyOptions
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                Remaining Quota
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {billing?.remainingQuota ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-5">
              <p className="text-sm text-violet-700 dark:text-violet-300 font-medium mb-2">
                Monthly Used
              </p>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {billing?.monthlyQuotaUsed ?? 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold text-(--text-primary)">
                  Buy Screening Quota
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {packageOptions.map((amount) => {
                  const totalCost =
                    (billing?.organisationUnitPrice ?? 0) * amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleBuyQuota(amount)}
                      disabled={buyQuotaMutation.isPending || isLoading}
                      className="rounded-xl border border-(--border-primary) p-4 text-left hover:border-primary/60 hover:bg-(--bg-tertiary) transition disabled:opacity-60"
                    >
                      <p className="text-lg font-bold text-(--text-primary)">
                        {amount} credits
                      </p>
                      <p className="text-xs text-(--text-tertiary) mt-1">
                        {totalCost.toLocaleString('vi-VN')} VND
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-(--border-primary) p-4">
                <p className="text-sm font-semibold text-(--text-primary) mb-2">
                  Custom package (10 - 5000)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={customQuotaAmount}
                    onChange={(event) =>
                      setCustomQuotaAmount(event.target.value)
                    }
                    className="flex-1 rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = Number(customQuotaAmount);
                      if (parsed < 10 || parsed > 5000) {
                        toast.error(
                          'Custom quota must be between 10 and 5000.'
                        );
                        return;
                      }
                      handleBuyQuota(parsed);
                    }}
                    disabled={buyQuotaMutation.isPending || isLoading}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {buyQuotaMutation.isPending ? 'Processing...' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold text-(--text-primary)">
                  Quota Sources
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">
                    Monthly contract
                  </span>
                  <span className="font-semibold text-(--text-primary)">
                    {billing?.monthlyQuotaRemaining ?? 0}/
                    {billing?.monthlyQuotaLimit ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">Purchased</span>
                  <span className="font-semibold text-(--text-primary)">
                    {billing?.purchasedQuota ?? 0}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-(--border-primary) flex justify-between">
                  <span className="text-(--text-tertiary)">Unit Price</span>
                  <span className="font-semibold text-(--text-primary)">
                    {(billing?.organisationUnitPrice ?? 0).toLocaleString(
                      'vi-VN'
                    )}{' '}
                    VND
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-(--border-primary) flex justify-between">
                  <span className="text-(--text-tertiary)">Monthly Spent</span>
                  <span className="font-semibold text-(--text-primary)">
                    {formatCurrency(
                      walletQuery.data?.totalSpentThisMonth ?? 0,
                      vndCurrencyOptions
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Wallet Transactions
              </h2>
            </div>

            {transactionsQuery.isLoading ? (
              <div className="py-10 flex justify-center text-sm text-(--text-tertiary)">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isCredit = isCreditTransaction(transaction);
                  const txType = parseWalletTransactionType(
                    transaction.transactionType
                  );
                  const isQuotaPurchase =
                    transaction.referenceType === 'AiQuota' ||
                    transaction.description
                      ?.toLowerCase()
                      .includes('ai screening');

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {transaction.description ||
                              getTransactionLabel(txType)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTimeWithYear(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-bold ${
                            isCredit ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatCurrency(
                            transaction.amount,
                            vndCurrencyOptions
                          )}
                        </p>
                        <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                          {isQuotaPurchase ? <Zap className="w-3 h-3" /> : null}
                          {isQuotaPurchase
                            ? 'Quota purchase'
                            : getTransactionLabel(txType)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {txPagination && txPagination.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setTxPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!txPagination.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <p className="text-sm text-slate-500">
                  Page {txPagination.pageNumber}/{txPagination.totalPages}
                </p>
                <button
                  onClick={() =>
                    setTxPageNumber((p) =>
                      Math.min(txPagination.totalPages, p + 1)
                    )
                  }
                  disabled={!txPagination.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
