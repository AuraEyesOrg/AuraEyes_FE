import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { DoctorHeader, DoctorSidebar } from '../components';
import Spinner from '@/components/ui/spinner';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { formatCurrency } from '@/lib/helper';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { toast } from 'react-toastify';
import {
  TransactionType,
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

const getTransactionLabel = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.Deposit:
      return 'Nạp tiền';
    case TransactionType.Withdrawal:
      return 'Rút tiền';
    case TransactionType.Payment:
      return 'Thanh toán';
    case TransactionType.Refund:
      return 'Hoàn tiền';
    case TransactionType.Transfer:
      return 'Chuyển khoản';
    case TransactionType.Bonus:
      return 'Thưởng';
    default:
      return 'Giao dịch';
  }
};

const isCreditTransaction = (transaction: WalletTransactionDto): boolean => {
  return (
    transaction.transactionType === TransactionType.Deposit ||
    transaction.transactionType === TransactionType.Refund ||
    transaction.transactionType === TransactionType.Transfer ||
    transaction.transactionType === TransactionType.Bonus
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
  const [contractNumber, setContractNumber] = useState('');
  const [note, setNote] = useState('');

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
      .filter(
        (item) =>
          item.referenceType === 'Booking' &&
          item.transactionType === TransactionType.Transfer
      )
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
    setContractNumber('');
    setNote('');
  };

  const getWithdrawStatusBadge = (status: WithdrawalRequestDto['status']) => {
    if (status === 'Completed') {
      return {
        label: 'Đã hoàn tất',
        className:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: BadgeCheck,
      };
    }

    if (status === 'Failed' || status === 'Cancelled') {
      return {
        label: status === 'Cancelled' ? 'Đã hủy' : 'Từ chối',
        className:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: XCircle,
      };
    }

    return {
      label: status === 'Processing' ? 'Đang xử lý' : 'Đang chờ',
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      icon: Clock3,
    };
  };

  const handleSubmitWithdrawalRequest = async () => {
    if (!wallet) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Số tiền rút không hợp lệ.');
      return;
    }

    if (numericAmount > wallet.balance) {
      toast.error('Số tiền rút vượt quá số dư ví hiện tại.');
      return;
    }

    if (
      !bankName.trim() ||
      !bankAccountNumber.trim() ||
      !accountHolderName.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ thông tin ngân hàng nhận tiền.');
      return;
    }

    try {
      await createWithdrawalRequestMutation.mutateAsync({
        amountVnd: numericAmount,
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        contractNumber: contractNumber.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast.success(
        'Đã gửi yêu cầu rút tiền. Vui lòng chờ admin xác nhận chuyển khoản.'
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
          : 'Không thể gửi yêu cầu rút tiền.';
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
              Gửi yêu cầu rút tiền
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
                {t('Ophthalmologist.wallet.thisMonthIn', 'Nạp/thu tháng này')}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  wallet.totalDepositsThisMonth,
                  vndCurrencyOptions
                )}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {wallet.transactionsThisMonth} giao dịch tháng này
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                Yêu cầu rút đang chờ
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
                yêu cầu đang xử lý
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Yêu cầu rút tiền
            </h2>

            {withdrawalRequestsQuery.isLoading ? (
              <div className="py-8 flex justify-center">
                <Spinner size={24} />
              </div>
            ) : withdrawalRequests.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có yêu cầu rút tiền nào.
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
                          Gửi lúc: {formatDateTimeWithYear(request.createdAt)}
                        </p>
                        {request.contractNumber ? (
                          <p>Hợp đồng tham chiếu: {request.contractNumber}</p>
                        ) : null}
                        {request.transferReference ? (
                          <p>Mã tham chiếu CK: {request.transferReference}</p>
                        ) : null}
                        {request.adminNote ? (
                          <p>Phản hồi admin: {request.adminNote}</p>
                        ) : null}
                        {request.note ? (
                          <p>Ghi chú của bạn: {request.note}</p>
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
                  Trước
                </button>
                <p className="text-sm text-slate-500">
                  Trang {withdrawPagination.pageNumber}/
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
                  Sau
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
                            {tx.description ||
                              getTransactionLabel(tx.transactionType)}
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
                        <p className="text-xs text-slate-500">
                          {getTransactionLabel(tx.transactionType)}
                        </p>
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
                  Trước
                </button>
                <p className="text-sm text-slate-500">
                  Trang {txPagination.pageNumber}/{txPagination.totalPages}
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
                  Sau
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
                  Tạo yêu cầu rút tiền
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Số tiền rút (VND)
                    </span>
                    <input
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9]/g, ''))
                      }
                      placeholder="Ví dụ: 500000"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Số hợp đồng (nếu có)
                    </span>
                    <input
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="AURA-OPH-..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Ngân hàng
                    </span>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="VD: Vietcombank"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Số tài khoản
                    </span>
                    <input
                      value={bankAccountNumber}
                      onChange={(e) =>
                        setBankAccountNumber(e.target.value.replace(/\s+/g, ''))
                      }
                      placeholder="Nhập số tài khoản"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm block">
                  <span className="text-slate-600 dark:text-slate-300">
                    Tên chủ tài khoản
                  </span>
                  <input
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Theo thông tin hợp đồng"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-sm block">
                  <span className="text-slate-600 dark:text-slate-300">
                    Ghi chú
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú thêm cho admin (không bắt buộc)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </label>

                <div className="text-xs text-slate-500">
                  Số dư hiện tại:{' '}
                  {formatCurrency(wallet.balance, vndCurrencyOptions)}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    disabled={createWithdrawalRequestMutation.isPending}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitWithdrawalRequest}
                    disabled={createWithdrawalRequestMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {createWithdrawalRequestMutation.isPending
                      ? 'Đang gửi...'
                      : 'Gửi yêu cầu'}
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
