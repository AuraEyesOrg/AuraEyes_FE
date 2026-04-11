import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Landmark,
  BadgeCheck,
  XCircle,
  Clock3,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { DoctorHeader, DoctorSidebar } from '../components';
import Spinner from '@/components/ui/spinner';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { formatCurrency } from '@/lib/helper';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { toast } from 'react-toastify';
import { VIETNAMESE_BANKS } from '@/constants/vietnameseBanks';
import {
  TransactionType,
  parseWalletTransactionType,
  type WalletTransactionDto,
  type WithdrawalRequestDto,
} from '../api/wallet.api';
import {
  useCreateOphthalmologistWithdrawalRequest,
  useOphthalmologistWallet,
  useOphthalmologistWithdrawalRequests,
  useOphthalmologistWalletTransactions,
} from '../hooks/use-wallet';

const vndCurrencyOptions = {
  locale: 'vi-VN',
  currency: 'VND',
  minimumFractionDigits: 0,
} as const;

type TranslateFn = (key: string, fallback: string) => string;

const getTransactionLabel = (type: TransactionType, t: TranslateFn): string => {
  switch (type) {
    case TransactionType.Deposit:
      return t('Ophthalmologist.wallet.transactionType.deposit', 'Deposit');
    case TransactionType.Withdrawal:
      return t(
        'Ophthalmologist.wallet.transactionType.withdrawal',
        'Withdrawal'
      );
    case TransactionType.Payment:
      return t('Ophthalmologist.wallet.transactionType.payment', 'Payment');
    case TransactionType.Refund:
      return t('Ophthalmologist.wallet.transactionType.refund', 'Refund');
    case TransactionType.Transfer:
      return t('Ophthalmologist.wallet.transactionType.transfer', 'Transfer');
    case TransactionType.Bonus:
      return t('Ophthalmologist.wallet.transactionType.bonus', 'Bonus');
    default:
      return t(
        'Ophthalmologist.wallet.transactionType.transaction',
        'Transaction'
      );
  }
};

const getBookingConsultationSubLabel = (
  transaction: WalletTransactionDto,
  t: TranslateFn
): string | null => {
  if (transaction.referenceType !== 'Booking') {
    return null;
  }
  const txType = parseWalletTransactionType(transaction.transactionType);
  if (
    txType === TransactionType.Deposit ||
    txType === TransactionType.Transfer
  ) {
    return t(
      'Ophthalmologist.wallet.consultationIncomeShort',
      'Consultation income'
    );
  }
  return null;
};

const isCreditTransaction = (transaction: WalletTransactionDto): boolean => {
  const t = parseWalletTransactionType(transaction.transactionType);
  return (
    t === TransactionType.Deposit ||
    t === TransactionType.Refund ||
    t === TransactionType.Transfer ||
    t === TransactionType.Bonus
  );
};

export default function OphthalmologistWalletPage() {
  const { t } = useSafeTranslation();
  const [txPageNumber, setTxPageNumber] = useState(1);
  const [withdrawPageNumber, setWithdrawPageNumber] = useState(1);
  const txPageSize = 10;
  const withdrawPageSize = 5;

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankBin, setBankBin] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [note, setNote] = useState('');

  // Bank combobox state
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.toLowerCase();
    return VIETNAMESE_BANKS.filter(
      (b) =>
        b.fullName.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.bin.includes(q)
    );
  }, [bankSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(e.target as Node)
      ) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const walletQuery = useOphthalmologistWallet();
  const transactionsQuery = useOphthalmologistWalletTransactions(
    txPageNumber,
    txPageSize
  );
  const withdrawalRequestsQuery = useOphthalmologistWithdrawalRequests(
    withdrawPageNumber,
    withdrawPageSize
  );
  const createWithdrawalRequestMutation =
    useCreateOphthalmologistWithdrawalRequest();

  const wallet = walletQuery.data;
  const transactions = transactionsQuery.data?.items ?? [];
  const txPagination = transactionsQuery.data;
  const withdrawalRequests = withdrawalRequestsQuery.data?.items ?? [];
  const withdrawPagination = withdrawalRequestsQuery.data;

  const consultationEarnings = useMemo(() => {
    return transactions
      .filter((item) => {
        if (item.referenceType !== 'Booking') {
          return false;
        }
        const t = parseWalletTransactionType(item.transactionType);
        return t === TransactionType.Transfer || t === TransactionType.Deposit;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }, [transactions]);

  const pendingWithdrawAmount = useMemo(() => {
    return withdrawalRequests
      .filter(
        (item) => item.status === 'Pending' || item.status === 'Processing'
      )
      .reduce((sum, item) => sum + item.amount, 0);
  }, [withdrawalRequests]);

  const resetWithdrawForm = () => {
    setAmount('');
    setBankName('');
    setBankAccountNumber('');
    setAccountHolderName('');
    setBankBin('');
    setContractNumber('');
    setNote('');
  };

  const getWithdrawStatusBadge = (status: WithdrawalRequestDto['status']) => {
    if (status === 'Completed') {
      return {
        label: t(
          'Ophthalmologist.wallet.withdraw.status.completed',
          'Completed'
        ),
        className:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: BadgeCheck,
      };
    }

    if (status === 'Failed' || status === 'Cancelled') {
      return {
        label:
          status === 'Cancelled'
            ? t('Ophthalmologist.wallet.withdraw.status.cancelled', 'Cancelled')
            : t('Ophthalmologist.wallet.withdraw.status.failed', 'Rejected'),
        className:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: XCircle,
      };
    }

    return {
      label:
        status === 'Processing'
          ? t('Ophthalmologist.wallet.withdraw.status.processing', 'Processing')
          : t('Ophthalmologist.wallet.withdraw.status.pending', 'Pending'),
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      icon: Clock3,
    };
  };

  const handleSubmitWithdrawalRequest = async () => {
    if (!wallet) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error(
        t(
          'Ophthalmologist.wallet.toast.invalidWithdrawAmount',
          'Invalid withdrawal amount.'
        )
      );
      return;
    }

    if (numericAmount > wallet.balance) {
      toast.error(
        t(
          'Ophthalmologist.wallet.toast.withdrawExceedsBalance',
          'Withdrawal amount exceeds current wallet balance.'
        )
      );
      return;
    }

    if (
      !bankName.trim() ||
      !bankAccountNumber.trim() ||
      !accountHolderName.trim()
    ) {
      toast.error(
        t(
          'Ophthalmologist.wallet.toast.missingBankInfo',
          'Please provide complete recipient bank information.'
        )
      );
      return;
    }

    if (!bankBin.trim()) {
      toast.error(
        t(
          'Ophthalmologist.wallet.toast.missingBankBin',
          'Please provide the bank BIN code for automated PayOS payout.'
        )
      );
      return;
    }

    try {
      await createWithdrawalRequestMutation.mutateAsync({
        amountVnd: numericAmount,
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        bankBin: bankBin.trim(),
        contractNumber: contractNumber.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast.success(
        t(
          'Ophthalmologist.wallet.toast.withdrawSubmitted',
          'Withdrawal request submitted. Please wait for admin confirmation.'
        )
      );
      setShowWithdrawModal(false);
      resetWithdrawForm();
      setWithdrawPageNumber(1);
      withdrawalRequestsQuery.refetch();
      walletQuery.refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(
              'Ophthalmologist.wallet.toast.withdrawSubmitFailed',
              'Unable to submit withdrawal request.'
            );
      toast.error(errorMessage);
    }
  };

  if (walletQuery.isLoading || !wallet) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={40} />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('Ophthalmologist.wallet.loading', 'Đang tải ví...')}
          </p>
        </div>
      </div>
    );
  }

  if (walletQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {t(
            'Ophthalmologist.wallet.loadError',
            'Không thể tải dữ liệu ví. Vui lòng thử lại.'
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName={t('Ophthalmologist.sidebar.wallet', 'Ví')} />

        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('Ophthalmologist.wallet.title', 'Ví bác sĩ')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t(
                  'Ophthalmologist.wallet.subtitle',
                  'Theo dõi thu nhập tư vấn và các giao dịch ví của bạn.'
                )}
              </p>
            </div>
            <button
              onClick={() => {
                walletQuery.refetch();
                transactionsQuery.refetch();
                withdrawalRequestsQuery.refetch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('Ophthalmologist.contract.refresh', 'Làm mới')}
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Landmark className="w-4 h-4" />
              {t(
                'Ophthalmologist.wallet.actions.createWithdrawRequest',
                'Create withdrawal request'
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
                  {t('Ophthalmologist.wallet.balance', 'Số dư hiện tại')}
                </p>
              </div>
              <p className="text-2xl font-bold text-cyan-800 dark:text-cyan-200">
                {formatCurrency(wallet.balance, vndCurrencyOptions)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2">
                {t(
                  'Ophthalmologist.wallet.consultationIncome',
                  'Thu nhập tư vấn (trang hiện tại)'
                )}
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(consultationEarnings, vndCurrencyOptions)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">
                {t(
                  'Ophthalmologist.wallet.thisMonthIn',
                  'Tiền vào ví tháng này'
                )}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  wallet.totalDepositsThisMonth,
                  vndCurrencyOptions
                )}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {t(
                  'Ophthalmologist.wallet.thisMonthInDescription',
                  'Includes top-ups, bonuses, refunds, and consultation income'
                )}{' '}
                - {wallet.transactionsThisMonth}{' '}
                {t(
                  'Ophthalmologist.wallet.transactionsInMonth',
                  'transactions this month'
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                {t(
                  'Ophthalmologist.wallet.pendingWithdrawRequests',
                  'Pending withdrawal requests'
                )}
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(pendingWithdrawAmount, vndCurrencyOptions)}
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-200/80 mt-2">
                {
                  withdrawalRequests.filter(
                    (item) =>
                      item.status === 'Pending' || item.status === 'Processing'
                  ).length
                }{' '}
                {t(
                  'Ophthalmologist.wallet.requestsProcessing',
                  'requests processing'
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {t(
                'Ophthalmologist.wallet.withdrawRequestsTitle',
                'Withdrawal Requests'
              )}
            </h2>

            {withdrawalRequestsQuery.isLoading ? (
              <div className="py-8 flex justify-center">
                <Spinner size={24} />
              </div>
            ) : withdrawalRequests.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t(
                  'Ophthalmologist.wallet.noWithdrawRequests',
                  'No withdrawal requests yet.'
                )}
              </p>
            ) : (
              <div className="space-y-3">
                {withdrawalRequests.map((request) => {
                  const status = getWithdrawStatusBadge(request.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(request.amount, vndCurrencyOptions)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {request.accountHolderName} - {request.bankName} -{' '}
                            {request.bankAccountNumber}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <p>
                          {t(
                            'Ophthalmologist.wallet.submittedAt',
                            'Submitted at'
                          )}
                          : {formatDateTimeWithYear(request.createdAt)}
                        </p>
                        {request.contractNumber ? (
                          <p>
                            {t(
                              'Ophthalmologist.wallet.contractReference',
                              'Contract reference'
                            )}
                            : {request.contractNumber}
                          </p>
                        ) : null}
                        {request.transferReference ? (
                          <p>
                            {t(
                              'Ophthalmologist.wallet.transferReference',
                              'Transfer reference'
                            )}
                            : {request.transferReference}
                          </p>
                        ) : null}
                        {request.adminNote ? (
                          <p>
                            {t(
                              'Ophthalmologist.wallet.adminNote',
                              'Admin note'
                            )}
                            : {request.adminNote}
                          </p>
                        ) : null}
                        {request.note ? (
                          <p>
                            {t('Ophthalmologist.wallet.yourNote', 'Your note')}:{' '}
                            {request.note}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {withdrawPagination && withdrawPagination.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() =>
                    setWithdrawPageNumber((p) => Math.max(1, p - 1))
                  }
                  disabled={!withdrawPagination.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('Ophthalmologist.common.previous', 'Previous')}
                </button>
                <p className="text-sm text-slate-500">
                  {t('Ophthalmologist.common.page', 'Page')}{' '}
                  {withdrawPagination.pageNumber}/
                  {withdrawPagination.totalPages}
                </p>
                <button
                  onClick={() =>
                    setWithdrawPageNumber((p) =>
                      Math.min(withdrawPagination.totalPages, p + 1)
                    )
                  }
                  disabled={!withdrawPagination.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Ophthalmologist.common.next', 'Next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {t('Ophthalmologist.wallet.transactions', 'Lịch sử giao dịch')}
            </h2>

            {transactionsQuery.isLoading ? (
              <div className="py-10 flex justify-center">
                <Spinner size={28} />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t(
                  'Ophthalmologist.wallet.noTransactions',
                  'Chưa có giao dịch nào.'
                )}
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isCredit = isCreditTransaction(tx);
                  const txType = parseWalletTransactionType(tx.transactionType);
                  const bookingSub = getBookingConsultationSubLabel(tx, t);
                  const typeSubLabel =
                    bookingSub ?? getTransactionLabel(txType, t);
                  return (
                    <div
                      key={tx.id}
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
                            {tx.description || getTransactionLabel(txType, t)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTimeWithYear(tx.createdAt)}
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
                          {formatCurrency(tx.amount, vndCurrencyOptions)}
                        </p>
                        <p className="text-xs text-slate-500">{typeSubLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {txPagination && txPagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setTxPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!txPagination.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('Ophthalmologist.common.previous', 'Previous')}
                </button>
                <p className="text-sm text-slate-500">
                  {t('Ophthalmologist.common.page', 'Page')}{' '}
                  {txPagination.pageNumber}/{txPagination.totalPages}
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
                  {t('Ophthalmologist.common.next', 'Next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {showWithdrawModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() =>
                  !createWithdrawalRequestMutation.isPending &&
                  setShowWithdrawModal(false)
                }
              />

              <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t(
                    'Ophthalmologist.wallet.withdrawModal.title',
                    'Create Withdrawal Request'
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t(
                        'Ophthalmologist.wallet.withdrawModal.amountLabel',
                        'Withdrawal Amount (VND)'
                      )}
                    </span>
                    <input
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9]/g, ''))
                      }
                      placeholder={t(
                        'Ophthalmologist.wallet.withdrawModal.amountPlaceholder',
                        'Example: 500000'
                      )}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t(
                        'Ophthalmologist.wallet.withdrawModal.contractLabel',
                        'Contract Number (optional)'
                      )}
                    </span>
                    <input
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="AURA-OPH-..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>

                  {/* Bank searchable combobox — spans both columns on md+ */}
                  <div
                    className="md:col-span-2 space-y-1 text-sm"
                    ref={bankDropdownRef}
                  >
                    <span className="text-slate-600 dark:text-slate-300 block">
                      {t(
                        'Ophthalmologist.wallet.withdrawModal.bankLabel',
                        'Bank'
                      )}
                      <span className="text-rose-500 ml-1">*</span>
                    </span>

                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => setBankDropdownOpen((o) => !o)}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-left"
                    >
                      <span
                        className={
                          bankName
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400'
                        }
                      >
                        {bankName
                          ? `${bankName}${bankBin ? ` (BIN: ${bankBin})` : ''}`
                          : t(
                              'Ophthalmologist.wallet.withdrawModal.bankPlaceholder',
                              'Search and select bank…'
                            )}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        {bankName && (
                          <X
                            className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBankName('');
                              setBankBin('');
                              setBankSearch('');
                            }}
                          />
                        )}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </span>
                    </button>

                    {/* Dropdown */}
                    {bankDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full max-w-[calc(100%-3rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                        {/* Search input */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                          <Search className="w-4 h-4 text-slate-400 shrink-0" />
                          <input
                            autoFocus
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            placeholder={t(
                              'Ophthalmologist.wallet.withdrawModal.bankSearchPlaceholder',
                              'Search bank name or BIN…'
                            )}
                            className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                          />
                          {bankSearch && (
                            <button
                              onClick={() => setBankSearch('')}
                              type="button"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          )}
                        </div>

                        {/* Bank list */}
                        <ul className="max-h-52 overflow-y-auto py-1">
                          {filteredBanks.length === 0 ? (
                            <li className="px-4 py-2 text-xs text-slate-400">
                              {t(
                                'Ophthalmologist.wallet.withdrawModal.noBankFound',
                                'No bank found.'
                              )}
                            </li>
                          ) : (
                            filteredBanks.map((bank) => (
                              <li key={bank.bin}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBankName(bank.shortName);
                                    setBankBin(bank.bin);
                                    setBankSearch('');
                                    setBankDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                                    bankBin === bank.bin
                                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {bank.shortName}
                                  </span>
                                  <span className="ml-2 text-xs text-slate-400">
                                    BIN {bank.bin}
                                  </span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Show selected BIN as read-only hint */}
                    {bankBin && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ✓ BIN {bankBin} — {bankName}
                      </p>
                    )}
                  </div>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t(
                        'Ophthalmologist.wallet.withdrawModal.accountNumberLabel',
                        'Account Number'
                      )}
                    </span>
                    <input
                      value={bankAccountNumber}
                      onChange={(e) =>
                        setBankAccountNumber(e.target.value.replace(/\s+/g, ''))
                      }
                      placeholder={t(
                        'Ophthalmologist.wallet.withdrawModal.accountNumberPlaceholder',
                        'Enter account number'
                      )}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm block">
                  <span className="text-slate-600 dark:text-slate-300">
                    {t(
                      'Ophthalmologist.wallet.withdrawModal.accountHolderLabel',
                      'Account Holder Name'
                    )}
                  </span>
                  <input
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder={t(
                      'Ophthalmologist.wallet.withdrawModal.accountHolderPlaceholder',
                      'As stated in contract'
                    )}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-sm block">
                  <span className="text-slate-600 dark:text-slate-300">
                    {t(
                      'Ophthalmologist.wallet.withdrawModal.noteLabel',
                      'Note'
                    )}
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder={t(
                      'Ophthalmologist.wallet.withdrawModal.notePlaceholder',
                      'Additional note for admin (optional)'
                    )}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </label>

                <div className="text-xs text-slate-500">
                  {t('Ophthalmologist.wallet.balance', 'Current balance')}:{' '}
                  {formatCurrency(wallet.balance, vndCurrencyOptions)}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    disabled={createWithdrawalRequestMutation.isPending}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
                  >
                    {t('Ophthalmologist.common.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSubmitWithdrawalRequest}
                    disabled={createWithdrawalRequestMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {createWithdrawalRequestMutation.isPending
                      ? t('Ophthalmologist.common.submitting', 'Submitting...')
                      : t(
                          'Ophthalmologist.common.submitRequest',
                          'Submit Request'
                        )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
