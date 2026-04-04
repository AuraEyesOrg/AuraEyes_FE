import { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  CreditCard,
  Building2,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  X,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import {
  useWallet,
  useWalletTransactions,
  useCreateDeposit,
} from '../hooks/use-wallet';
import { TransactionType, PaymentMethod } from '../types';
import { useTranslation } from 'react-i18next';

const DEPOSIT_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

/** Map backend TransactionType enum to display string */
const TRANSACTION_TYPE_MAP: Record<string | number, string> = {
  [TransactionType.Deposit]: 'deposit',
  [TransactionType.Withdrawal]: 'withdrawal',
  [TransactionType.Payment]: 'payment',
  [TransactionType.Refund]: 'refund',
  [TransactionType.Transfer]: 'transfer',
  [TransactionType.Bonus]: 'bonus',
  // Map string values if backend uses string enums
  Deposit: 'deposit',
  Withdrawal: 'withdrawal',
  Payment: 'payment',
  Refund: 'refund',
  Transfer: 'transfer',
  Bonus: 'bonus',
};

export default function WalletPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'payos' | null>(null);
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 10;

  // ── Real API data ──
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useWallet();
  const {
    data: transactionsData,
    isLoading: txLoading,
    error: txError,
  } = useWalletTransactions(txPage, TX_PAGE_SIZE);
  const createDepositMutation = useCreateDeposit();

  const transactions = transactionsData?.items ?? [];

  // ── Computed stats ──
  const monthlyStats = useMemo(() => {
    return {
      totalDeposits: wallet?.totalDepositsThisMonth ?? 0,
      totalSpent: wallet?.totalSpentThisMonth ?? 0,
      txCount: wallet?.transactionsThisMonth ?? 0,
    };
  }, [wallet]);

  // ── Helpers ──
  const formatDate = formatDateTimeWithYear;

  const getTransactionType = (txType: TransactionType) =>
    TRANSACTION_TYPE_MAP[txType] ?? 'payment';

  const getTransactionLabel = (txType: TransactionType) => {
    const type = getTransactionType(txType);
    return t(`PatientWallet.transactionTypes.${type}`);
  };

  const getTransactionIcon = (txType: TransactionType) => {
    const type = getTransactionType(txType);
    switch (type) {
      case 'deposit':
      case 'bonus':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'payment':
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getTransactionBgClass = (txType: TransactionType) => {
    const type = getTransactionType(txType);
    switch (type) {
      case 'deposit':
      case 'bonus':
        return 'bg-(--bg-secondary)';
      case 'refund':
        return 'bg-(--bg-secondary)';
      default:
        return 'bg-(--bg-secondary)';
    }
  };

  const isPositiveAmount = (txType: TransactionType) => {
    const type = getTransactionType(txType);
    return type === 'deposit' || type === 'refund' || type === 'bonus';
  };

  // ── Deposit handler ──
  const handleDeposit = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 10000 || !selectedMethod) return;

    const paymentMethod = PaymentMethod.PayOS;

    const returnUrl = `${window.location.origin}/patient/wallet/payment-callback`;
    const cancelUrl = `${window.location.origin}/patient/wallet`;

    createDepositMutation.mutate(
      {
        amountVnd: amount,
        paymentMethod,
        description: t('PatientWallet.deposit.description', {
          method: 'PayOS',
        }),
        returnUrl,
        cancelUrl,
      },
      {
        onSuccess: (response) => {
          // Redirect user to PayOS payment page
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl;
          }
        },
        onError: (error) => {
          console.error('Deposit creation failed:', error);
        },
      }
    );
  };

  const resetDepositModal = () => {
    setShowDepositModal(false);
    setSelectedAmount(null);
    setCustomAmount('');
    setSelectedMethod(null);
  };

  // ── Loading state ──
  if (walletLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size={32} className="mx-auto mb-3" />
            <p className="text-(--text-secondary)">
              {t('PatientWallet.loading.wallet')}
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // ── Error state ──
  if (walletError) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-(--text-primary) mb-2">
              {t('PatientWallet.error.title')}
            </h2>
            <p className="text-(--text-secondary) mb-4">
              {walletError instanceof Error
                ? walletError.message
                : t('PatientWallet.error.fallback')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand text-white rounded-xl font-semibold hover:brightness-110 transition-all"
            >
              {t('PatientWallet.error.retry')}
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          {t('PatientWallet.page.title')}
        </h1>
        <p className="text-(--text-secondary)">
          {t('PatientWallet.page.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Balance & Quick Actions */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="medical-card border border-(--border-color) bg-(--bg-primary)">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-(--bg-secondary) rounded-xl flex items-center justify-center border border-(--border-color)">
                <Wallet className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-sm text-(--text-secondary) font-medium">
                  {t('PatientWallet.balance.available')}
                </p>
                <p className="text-3xl font-bold mt-1 text-(--text-primary)">
                  {formatCurrency(wallet?.balance ?? 0, { absolute: true })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full py-3 rounded-xl font-semibold transition-all border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) hover:bg-(--bg-tertiary) flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5 text-brand" />
              {t('PatientWallet.actions.topUpWallet')}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              {t('PatientWallet.stats.thisMonth')}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    {t('PatientWallet.stats.totalDeposits')}
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +
                  {formatCurrency(monthlyStats.totalDeposits, {
                    absolute: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    {t('PatientWallet.stats.totalSpent')}
                  </span>
                </div>
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  -
                  {formatCurrency(monthlyStats.totalSpent, {
                    absolute: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    {t('PatientWallet.stats.transactions')}
                  </span>
                </div>
                <span className="text-(--text-primary) font-semibold">
                  {transactionsData?.totalCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              {t('PatientWallet.paymentMethods.title')}
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl border border-(--border-color) hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-(--bg-tertiary) rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">PayOS</p>
                    <p className="text-xs text-(--text-secondary)">
                      {t('PatientWallet.paymentMethods.payosDescription')}
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="medical-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
                <History className="w-5 h-5 text-brand" />
                {t('PatientWallet.transactions.title')}
              </h2>
              {transactionsData && transactionsData.totalCount > 0 && (
                <span className="text-sm text-(--text-secondary)">
                  {t('PatientWallet.transactions.totalCount', {
                    count: transactionsData.totalCount,
                  })}
                </span>
              )}
            </div>

            {/* Loading */}
            {txLoading && (
              <div className="flex items-center justify-center py-12">
                <Spinner size={24} />
              </div>
            )}

            {/* Error */}
            {txError && !txLoading && (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-(--text-secondary)">
                  {t('PatientWallet.transactions.loadFailed')}
                </p>
              </div>
            )}

            {/* Empty */}
            {!txLoading && !txError && transactions.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-(--text-muted) mx-auto mb-3" />
                <p className="text-(--text-secondary) font-medium">
                  {t('PatientWallet.transactions.emptyTitle')}
                </p>
                <p className="text-sm text-(--text-muted) mt-1">
                  {t('PatientWallet.transactions.emptyDescription')}
                </p>
              </div>
            )}

            {/* Transaction List */}
            {!txLoading && !txError && transactions.length > 0 && (
              <>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl border border-(--border-color) hover:border-brand/30 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTransactionBgClass(transaction.transactionType)}`}
                        >
                          {getTransactionIcon(transaction.transactionType)}
                        </div>
                        <div>
                          <p className="text-(--text-primary) font-medium">
                            {transaction.description ||
                              getTransactionLabel(transaction.transactionType)}
                          </p>
                          <p className="text-sm text-(--text-secondary) mt-0.5 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-bold text-lg mb-1 ${
                            isPositiveAmount(transaction.transactionType)
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}
                        >
                          {isPositiveAmount(transaction.transactionType)
                            ? '+'
                            : '-'}
                          {formatCurrency(transaction.amount, {
                            absolute: true,
                          })}
                        </p>
                        <span className="flex items-center justify-end gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {t('PatientWallet.transactionStatus.completed')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {transactionsData && transactionsData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-(--border-color)">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={!transactionsData.hasPrevious}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('PatientWallet.pagination.previous')}
                    </button>

                    <span className="text-sm text-(--text-secondary)">
                      {t('PatientWallet.pagination.pageOf', {
                        page: transactionsData.pageNumber,
                        total: transactionsData.totalPages,
                      })}
                    </span>

                    <button
                      onClick={() =>
                        setTxPage((p) =>
                          Math.min(transactionsData.totalPages, p + 1)
                        )
                      }
                      disabled={!transactionsData.hasNext}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('PatientWallet.pagination.next')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="medical-card w-full max-w-lg shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-(--text-primary) flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-brand" />
                  {t('PatientWallet.deposit.title')}
                </h2>
                <p className="text-sm text-(--text-secondary) mt-1">
                  {t('PatientWallet.deposit.subtitle')}
                </p>
              </div>
              <button
                onClick={resetDepositModal}
                className="w-8 h-8 rounded-lg hover:bg-(--bg-secondary) flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-(--text-secondary)" />
              </button>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-(--text-primary) mb-3 block">
                {t('PatientWallet.deposit.selectAmount')}
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {DEPOSIT_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-brand text-white shadow-brand'
                        : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-tertiary) border border-(--border-color) hover:border-brand/30'
                    }`}
                  >
                    {formatCurrency(amount, { absolute: true })}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder={t(
                    'PatientWallet.deposit.customAmountPlaceholder'
                  )}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  min={10000}
                  max={50000000}
                  className="w-full px-4 py-3 bg-(--bg-secondary) border-2 border-(--border-color) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-brand transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-muted) font-medium">
                  {t('PatientWallet.deposit.currency')}
                </span>
              </div>

              {/* Validation hint */}
              {customAmount && parseInt(customAmount) < 10000 && (
                <p className="text-xs text-red-500 mt-1">
                  {t('PatientWallet.deposit.minAmount')}
                </p>
              )}
              {customAmount && parseInt(customAmount) > 50000000 && (
                <p className="text-xs text-red-500 mt-1">
                  {t('PatientWallet.deposit.maxAmount')}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-(--text-primary) mb-3 block">
                {t('PatientWallet.deposit.paymentMethod')}
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('payos')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'payos'
                      ? 'bg-brand-soft border-brand shadow-brand'
                      : 'bg-(--bg-secondary) border-(--border-color) hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-(--bg-tertiary) rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-(--text-primary) font-semibold">PayOS</p>
                    <p className="text-xs text-(--text-secondary)">
                      {t('PatientWallet.paymentMethods.payosDescription')}
                    </p>
                  </div>
                  {selectedMethod === 'payos' && (
                    <CheckCircle className="w-5 h-5 text-brand" />
                  )}
                </button>
              </div>
            </div>

            {/* Deposit Error */}
            {createDepositMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {t('PatientWallet.deposit.createFailed')}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-(--border-color)">
              <button
                onClick={resetDepositModal}
                disabled={createDepositMutation.isPending}
                className="flex-1 py-3 bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-primary) border border-(--border-color) rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {t('PatientWallet.actions.cancel')}
              </button>
              <button
                onClick={handleDeposit}
                disabled={
                  createDepositMutation.isPending ||
                  !selectedMethod ||
                  (!selectedAmount && !customAmount) ||
                  (!!customAmount &&
                    (parseInt(customAmount) < 10000 ||
                      parseInt(customAmount) > 50000000))
                }
                className="flex-1 py-3 bg-brand hover:brightness-110 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {createDepositMutation.isPending ? (
                  <>
                    <Spinner size={16} className="shrink-0" />
                    {t('PatientWallet.deposit.creating')}
                  </>
                ) : (
                  t('PatientWallet.deposit.proceedToPay')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
