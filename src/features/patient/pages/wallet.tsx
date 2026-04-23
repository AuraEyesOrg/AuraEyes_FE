import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  RefreshCw,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { useWalletTransactions } from '../hooks/use-wallet';
import { TransactionType } from '../types';
import { useTranslation } from 'react-i18next';

const TRANSACTION_TYPE_MAP: Record<string | number, string> = {
  [TransactionType.Payment]: 'payment',
  [TransactionType.Refund]: 'refund',
  Payment: 'payment',
  Refund: 'refund',
};

export default function WalletPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'payment' | 'refund'
  >('all');
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 10;

  const {
    data: transactionsData,
    isLoading: txLoading,
    error: txError,
  } = useWalletTransactions(txPage, TX_PAGE_SIZE);

  const transactions = transactionsData?.items ?? [];

  const getTransactionType = (txType: TransactionType) =>
    TRANSACTION_TYPE_MAP[txType] ?? 'payment';

  // Only show payment-order related records, hide wallet top-up/withdraw flows.
  const paymentOrders = useMemo(
    () =>
      transactions.filter((tx) => {
        const type = getTransactionType(tx.transactionType);
        return type === 'payment' || type === 'refund';
      }),
    [transactions]
  );

  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') return paymentOrders;
    return paymentOrders.filter(
      (tx) => getTransactionType(tx.transactionType) === activeFilter
    );
  }, [activeFilter, paymentOrders]);

  const paymentSummary = useMemo(() => {
    const totalPaid = paymentOrders
      .filter((tx) => getTransactionType(tx.transactionType) === 'payment')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalRefund = paymentOrders
      .filter((tx) => getTransactionType(tx.transactionType) === 'refund')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalPaid,
      totalRefund,
      orderCount: paymentOrders.length,
    };
  }, [paymentOrders]);

  const formatDate = formatDateTimeWithYear;

  const getOrderLabel = (txType: TransactionType) => {
    const type = getTransactionType(txType);
    return type === 'refund'
      ? t('PatientWallet.transactionTypes.refund')
      : t('PatientWallet.transactionTypes.payment');
  };

  return (
    <PatientLayout>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-(--border-color) bg-gradient-to-br from-(--bg-primary) via-(--bg-secondary) to-(--bg-primary) p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, rgba(20,184,166,0.08), transparent 45%), radial-gradient(circle at 90% 10%, rgba(20,184,166,0.1), transparent 38%)',
            }}
          />
          <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
                {t('PatientWallet.page.paymentOrdersTitle', {
                  defaultValue: 'Payment order history',
                })}
              </h1>
              <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-(--text-secondary)">
                {t('PatientWallet.page.paymentOrdersSubtitle', {
                  defaultValue:
                    'Follow all appointment-related payments and refunds in one place.',
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('PatientWallet.stats.totalPaid', {
                defaultValue: 'Total paid',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400">
              -{formatCurrency(paymentSummary.totalPaid, { absolute: true })}
            </p>
          </div>
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('PatientWallet.stats.totalRefund', {
                defaultValue: 'Total refund',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              +{formatCurrency(paymentSummary.totalRefund, { absolute: true })}
            </p>
          </div>
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('PatientWallet.stats.orders', {
                defaultValue: 'Orders',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-(--text-primary)">
              {paymentSummary.orderCount}
            </p>
          </div>
        </section>

        <section className="medical-card">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              {t('PatientWallet.transactions.paymentOrderTitle', {
                defaultValue: 'Payment orders',
              })}
            </h2>

            <div className="inline-flex rounded-xl border border-(--border-color) bg-(--bg-secondary) p-1">
              {(['all', 'payment', 'refund'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setActiveFilter(option)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeFilter === option
                      ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  {option === 'all'
                    ? t('PatientWallet.filters.all', { defaultValue: 'All' })
                    : option === 'payment'
                      ? t('PatientWallet.filters.payment', {
                          defaultValue: 'Payments',
                        })
                      : t('PatientWallet.filters.refund', {
                          defaultValue: 'Refunds',
                        })}
                </button>
              ))}
            </div>
          </div>

          {txLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`payment-order-skeleton-${index}`}
                  className="rounded-2xl border border-(--border-color) p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="skeleton-shimmer h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="skeleton-shimmer h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="skeleton-shimmer h-5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {txError && !txLoading && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-(--text-secondary)">
                {t('PatientWallet.transactions.loadFailed')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
              >
                {t('PatientWallet.error.retry', { defaultValue: 'Try again' })}
              </button>
            </div>
          )}

          {!txLoading && !txError && visibleOrders.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-(--text-muted) mx-auto mb-3" />
              <p className="text-(--text-secondary) font-medium">
                {activeFilter === 'all'
                  ? t('PatientWallet.transactions.emptyPaymentOrdersTitle', {
                      defaultValue: 'No payment orders yet',
                    })
                  : t('PatientWallet.transactions.emptyByFilterTitle', {
                      defaultValue: 'No records match this filter',
                    })}
              </p>
              <p className="text-sm text-(--text-muted) mt-1">
                {activeFilter === 'all'
                  ? t(
                      'PatientWallet.transactions.emptyPaymentOrdersDescription',
                      {
                        defaultValue:
                          'Your completed payment orders will appear here.',
                      }
                    )
                  : t('PatientWallet.transactions.emptyByFilterDescription', {
                      defaultValue: 'Try switching to a different filter.',
                    })}
              </p>
            </div>
          )}

          {!txLoading && !txError && visibleOrders.length > 0 && (
            <>
              <div className="space-y-3">
                {visibleOrders.map((transaction) => {
                  const type = getTransactionType(transaction.transactionType);
                  const isRefund = type === 'refund';

                  return (
                    <article
                      key={transaction.id}
                      className="group rounded-2xl border border-(--border-color) bg-(--bg-primary) p-5 transition-all hover:border-brand/40 hover:-translate-y-[1px]"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-(--bg-secondary)">
                            {isRefund ? (
                              <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <CreditCard className="w-5 h-5 text-brand" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-(--text-primary) font-semibold truncate">
                              {transaction.description ||
                                getOrderLabel(transaction.transactionType)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-(--text-secondary)">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {formatDate(transaction.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="w-3 h-3 shrink-0" />
                                ID: {transaction.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <p
                            className={`font-bold text-lg mb-1 ${
                              isRefund
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-500 dark:text-red-400'
                            }`}
                          >
                            {isRefund ? '+' : '-'}
                            {formatCurrency(transaction.amount, {
                              absolute: true,
                            })}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            {t('PatientWallet.transactionStatus.completed')}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {transactionsData && transactionsData.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-(--border-color) gap-3">
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
        </section>
      </div>
    </PatientLayout>
  );
}
