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
import {
  useWallet,
  useWalletTransactions,
  useCreateDeposit,
} from '../hooks/use-wallet';
import { TransactionType, PaymentMethod } from '../types';

const DEPOSIT_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

/** Map backend TransactionType enum to display string */
const TRANSACTION_TYPE_MAP: Record<TransactionType, string> = {
  [TransactionType.Deposit]: 'deposit',
  [TransactionType.Withdrawal]: 'withdrawal',
  [TransactionType.Payment]: 'payment',
  [TransactionType.Refund]: 'refund',
  [TransactionType.Transfer]: 'transfer',
  [TransactionType.Bonus]: 'bonus',
};

export default function WalletPage() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<
    'payos' | 'vnpay' | null
  >(null);
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalDeposits = 0;
    let totalSpent = 0;
    let txCount = 0;

    for (const tx of transactions) {
      const txDate = new Date(tx.createdAt);
      if (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      ) {
        txCount++;
        const type = TRANSACTION_TYPE_MAP[tx.transactionType];
        if (type === 'deposit' || type === 'refund' || type === 'bonus') {
          totalDeposits += tx.amount;
        } else if (type === 'payment' || type === 'withdrawal') {
          totalSpent += tx.amount;
        }
      }
    }

    return { totalDeposits, totalSpent, txCount };
  }, [transactions]);

  // ── Helpers ──
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount));

  const formatDate = formatDateTimeWithYear;

  const getTransactionIcon = (txType: TransactionType) => {
    const type = TRANSACTION_TYPE_MAP[txType];
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
    const type = TRANSACTION_TYPE_MAP[txType];
    switch (type) {
      case 'deposit':
      case 'bonus':
        return 'bg-green-50 dark:bg-green-500/20';
      case 'refund':
        return 'bg-blue-50 dark:bg-blue-500/20';
      default:
        return 'bg-red-50 dark:bg-red-500/20';
    }
  };

  const isPositiveAmount = (txType: TransactionType) => {
    const type = TRANSACTION_TYPE_MAP[txType];
    return type === 'deposit' || type === 'refund' || type === 'bonus';
  };

  // ── Deposit handler ──
  const handleDeposit = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 10000 || !selectedMethod) return;

    const paymentMethod =
      selectedMethod === 'payos' ? PaymentMethod.PayOS : PaymentMethod.VNPay;

    const returnUrl = `${window.location.origin}/patient/wallet/payment-callback`;
    const cancelUrl = `${window.location.origin}/patient/wallet`;

    createDepositMutation.mutate(
      {
        amountVnd: amount,
        paymentMethod,
        description: `Wallet Top-up via ${selectedMethod === 'payos' ? 'PayOS' : 'VNPay'}`,
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
            <p className="text-(--text-secondary)">Loading wallet...</p>
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
              Unable to load wallet
            </h2>
            <p className="text-(--text-secondary) mb-4">
              {walletError instanceof Error
                ? walletError.message
                : 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand text-white rounded-xl font-semibold hover:brightness-110 transition-all"
            >
              Retry
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
          Digital Wallet
        </h1>
        <p className="text-(--text-secondary)">
          Manage your balance and view transaction history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Balance & Quick Actions */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="medical-card bg-linear-to-br from-brand via-[#00d4e6] to-[#00b8cc] text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/90 font-medium">
                  Available Balance
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(wallet?.balance ?? 0)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full py-3 bg-white hover:bg-white/95 rounded-xl font-semibold transition-all text-brand flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Top Up Wallet
            </button>
          </div>

          {/* Quick Stats */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              This Month
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    Total Deposits
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +{formatCurrency(monthlyStats.totalDeposits)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    Total Spent
                  </span>
                </div>
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  -{formatCurrency(monthlyStats.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-(--text-secondary) text-sm">
                    Transactions
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
              Payment Methods
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl border border-(--border-color) hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">VNPay</p>
                    <p className="text-xs text-(--text-secondary)">
                      Cards, Bank Transfer, QR
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl border border-(--border-color) hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">PayOS</p>
                    <p className="text-xs text-(--text-secondary)">
                      Bank Transfer, QR
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
                Transaction History
              </h2>
              {transactionsData && transactionsData.totalCount > 0 && (
                <span className="text-sm text-(--text-secondary)">
                  {transactionsData.totalCount} total
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
                  Failed to load transactions
                </p>
              </div>
            )}

            {/* Empty */}
            {!txLoading && !txError && transactions.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-(--text-muted) mx-auto mb-3" />
                <p className="text-(--text-secondary) font-medium">
                  No transactions yet
                </p>
                <p className="text-sm text-(--text-muted) mt-1">
                  Top up your wallet to get started
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
                              TRANSACTION_TYPE_MAP[transaction.transactionType]
                                ?.charAt(0)
                                .toUpperCase() +
                                TRANSACTION_TYPE_MAP[
                                  transaction.transactionType
                                ]?.slice(1)}
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
                          {formatCurrency(transaction.amount)}
                        </p>
                        <span className="flex items-center justify-end gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Completed
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
                      Previous
                    </button>

                    <span className="text-sm text-(--text-secondary)">
                      Page {transactionsData.pageNumber} of{' '}
                      {transactionsData.totalPages}
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
                      Next
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
                  Top Up Your Wallet
                </h2>
                <p className="text-sm text-(--text-secondary) mt-1">
                  Choose an amount and payment method
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
                Select Amount
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
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Or enter custom amount (min 10,000)"
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
                  VND
                </span>
              </div>

              {/* Validation hint */}
              {customAmount && parseInt(customAmount) < 10000 && (
                <p className="text-xs text-red-500 mt-1">
                  Minimum deposit amount is 10,000 VND
                </p>
              )}
              {customAmount && parseInt(customAmount) > 50000000 && (
                <p className="text-xs text-red-500 mt-1">
                  Maximum deposit amount is 50,000,000 VND
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-(--text-primary) mb-3 block">
                Payment Method
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
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-(--text-primary) font-semibold">PayOS</p>
                    <p className="text-xs text-(--text-secondary)">
                      Bank Transfer, QR Code
                    </p>
                  </div>
                  {selectedMethod === 'payos' && (
                    <CheckCircle className="w-5 h-5 text-brand" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedMethod('vnpay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'vnpay'
                      ? 'bg-brand-soft border-brand shadow-brand'
                      : 'bg-(--bg-secondary) border-(--border-color) hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-(--text-primary) font-semibold">VNPay</p>
                    <p className="text-xs text-(--text-secondary)">
                      Credit/Debit Card, Bank Transfer
                    </p>
                  </div>
                  {selectedMethod === 'vnpay' && (
                    <CheckCircle className="w-5 h-5 text-brand" />
                  )}
                </button>
              </div>
            </div>

            {/* Deposit Error */}
            {createDepositMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to create deposit. Please try again.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-(--border-color)">
              <button
                onClick={resetDepositModal}
                disabled={createDepositMutation.isPending}
                className="flex-1 py-3 bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-primary) border border-(--border-color) rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                Cancel
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
                    Creating...
                  </>
                ) : (
                  'Proceed to Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
