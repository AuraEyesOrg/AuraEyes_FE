import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  History,
  RefreshCw,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { useMyOrders, useSyncOrder } from '../hooks/use-financial';
import type { OrderStatus, PaymentStatus } from '../types/financial.types';
import { useTranslation } from 'react-i18next';

type FilterType = 'all' | 'completed' | 'pending' | 'cancelled';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: 'Chờ thanh toán',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang xử lý',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Refunded: 'Hoàn tiền',
};

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Failed: 'bg-red-500/10 text-red-500 dark:text-red-400',
  Refunded: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Cancelled: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
};

export default function WalletPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: ordersData, isLoading, error } = useMyOrders(page, PAGE_SIZE);
  const { mutateAsync: syncOrder } = useSyncOrder();
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const orders = ordersData?.items ?? [];

  // ── Filter ──────────────────────────────────────────────────────────────────
  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'completed')
      return orders.filter(
        (o) => o.status === 'Completed' || o.status === 'Confirmed'
      );
    if (activeFilter === 'pending')
      return orders.filter(
        (o) => o.status === 'Pending' || o.status === 'Processing'
      );
    if (activeFilter === 'cancelled')
      return orders.filter(
        (o) => o.status === 'Cancelled' || o.status === 'Refunded'
      );
    return orders;
  }, [activeFilter, orders]);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const completedOrders = orders.filter(
      (o) => o.status === 'Completed' || o.status === 'Confirmed'
    );
    const refundedOrders = orders.filter((o) => o.status === 'Refunded');
    const totalPaid = completedOrders.reduce((sum, order) => {
      // If we have specific payments, sum their successful amounts
      // This is more accurate for deposit + future balance flow
      const paidInOrder = order.payments
        .filter((p) => p.status === 'Completed')
        .reduce((pSum, p) => pSum + p.amount, 0);

      // Fallback: if no specific payments recorded but order is confirmed/completed,
      // count the amount we expected to be paid
      return (
        sum +
        (paidInOrder > 0
          ? paidInOrder
          : (order.depositAmount ?? order.totalAmount))
      );
    }, 0);
    const totalRefund = refundedOrders.reduce(
      (s, o) => s + (o.depositAmount ?? o.totalAmount),
      0
    );

    return {
      totalPaid,
      totalRefund,
      orderCount: ordersData?.totalCount ?? 0,
    };
  }, [orders, ordersData]);

  const getPaymentUrl = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    return order?.payments?.[0]?.paymentUrl ?? null;
  };

  const handleSyncAll = async () => {
    const pendingOrders = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Processing'
    );
    if (pendingOrders.length === 0) return;

    setIsSyncingAll(true);
    try {
      await Promise.all(pendingOrders.map((o) => syncOrder(o.id)));
    } finally {
      setIsSyncingAll(false);
    }
  };

  const getOrderStatusIcon = (status: OrderStatus) => {
    if (status === 'Completed' || status === 'Confirmed')
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    if (status === 'Refunded')
      return (
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      );
    if (status === 'Cancelled')
      return (
        <div className="w-10 h-10 rounded-2xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
          <XCircle className="w-5 h-5 text-slate-400" />
        </div>
      );
    // Pending / Processing
    return (
      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
        <ShoppingCart className="w-5 h-5 text-amber-500" />
      </div>
    );
  };

  return (
    <PatientLayout>
      <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 md:px-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand/20 blur-[100px]" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 rounded-full bg-brand" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                  Financial Hub
                </p>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {t('PatientWallet.page.paymentOrdersTitle', {
                  defaultValue: 'Transaction history',
                })}
              </h1>
              <p className="max-w-[45ch] text-lg font-medium text-slate-400">
                {t('PatientWallet.page.paymentOrdersSubtitle', {
                  defaultValue:
                    'Manage your medical appointments and financial records securely.',
                })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleSyncAll}
                disabled={
                  isSyncingAll ||
                  !orders.some(
                    (o) => o.status === 'Pending' || o.status === 'Processing'
                  )
                }
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-white/10 px-6 py-4 rounded-2xl group"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand ${isSyncingAll ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                >
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                    Update Status
                  </p>
                  <p className="text-sm font-black text-white leading-none mt-1">
                    Sync All
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                    Lifetime records
                  </p>
                  <p className="text-3xl font-black text-white leading-none mt-1">
                    {summary.orderCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Total Paid */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 transition-all hover:shadow-2xl hover:shadow-red-500/5 hover:-translate-y-1">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  {t('PatientWallet.stats.totalPaid', {
                    defaultValue: 'Total amount spent',
                  })}
                </p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(summary.totalPaid, { absolute: true })}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    VND
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500/10">
              <div className="h-full w-2/3 bg-red-500 rounded-r-full" />
            </div>
          </div>

          {/* Total Refund */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  {t('PatientWallet.stats.totalRefund', {
                    defaultValue: 'Total refunded',
                  })}
                </p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(summary.totalRefund, { absolute: true })}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    VND
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <RefreshCw className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/10">
              <div className="h-full w-1/3 bg-emerald-500 rounded-r-full" />
            </div>
          </div>
        </section>

        {/* ── Order List ─────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('PatientWallet.transactions.paymentOrderTitle', {
                  defaultValue: 'Orders & Payments',
                })}
              </h2>
            </div>

            {/* Filter tabs */}
            <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              {(
                ['all', 'completed', 'pending', 'cancelled'] as FilterType[]
              ).map((option) => {
                const active = activeFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setActiveFilter(option);
                      setPage(1);
                    }}
                    className={[
                      'relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                      active
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                    ].join(' ')}
                  >
                    {option === 'all'
                      ? t('PatientWallet.filters.all', { defaultValue: 'All' })
                      : option === 'completed'
                        ? t('PatientWallet.filters.payment', {
                            defaultValue: 'Completed',
                          })
                        : option === 'pending'
                          ? 'Pending'
                          : t('PatientWallet.filters.refund', {
                              defaultValue: 'Cancelled',
                            })}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`order-skeleton-${index}`}
                  className="rounded-3xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse bg-slate-50/50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-[2rem] border-2 border-dashed border-red-500/20 bg-red-500/5 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Connection Error
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {t('PatientWallet.transactions.loadFailed')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-red-500 px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-red-500/20"
              >
                {t('PatientWallet.error.retry', {
                  defaultValue: 'Retry connection',
                })}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && visibleOrders.length === 0 && (
            <div className="text-center py-20 px-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {activeFilter === 'all'
                  ? t('PatientWallet.transactions.emptyPaymentOrdersTitle', {
                      defaultValue: 'No transactions yet',
                    })
                  : t('PatientWallet.transactions.emptyByFilterTitle', {
                      defaultValue: 'No records found',
                    })}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {activeFilter === 'all'
                  ? t(
                      'PatientWallet.transactions.emptyPaymentOrdersDescription',
                      {
                        defaultValue:
                          'When you make a booking, your transaction history will appear here.',
                      }
                    )
                  : t('PatientWallet.transactions.emptyByFilterDescription', {
                      defaultValue:
                        'Try adjusting your filters to see more results.',
                    })}
              </p>
            </div>
          )}

          {/* Order list */}
          {!isLoading && !error && visibleOrders.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4">
                {visibleOrders.map((order) => {
                  const isCompleted =
                    order.status === 'Completed' ||
                    order.status === 'Confirmed';
                  const isRefunded = order.status === 'Refunded';
                  const isCancelled = order.status === 'Cancelled';
                  const isPending =
                    order.status === 'Pending' || order.status === 'Processing';
                  const paymentUrl = getPaymentUrl(order.id);
                  const firstPayment = order.payments?.[0];

                  return (
                    <article
                      key={order.id}
                      className="group rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 transition-all hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 min-w-0 flex-1">
                          {/* Icon Container */}
                          <div className="shrink-0 transition-transform group-hover:scale-110">
                            {getOrderStatusIcon(order.status)}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate pr-4">
                              {order.description ||
                                'Medical Appointment Booking'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateTimeWithYear(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock3 className="w-3.5 h-3.5" />
                                REF: {order.id.slice(0, 8)}
                              </span>
                            </div>

                            {/* Internal Payment Status Badge */}
                            {firstPayment && (
                              <div className="pt-1.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${PAYMENT_STATUS_COLOR[firstPayment.status]}`}
                                >
                                  {firstPayment.status === 'Completed'
                                    ? 'Payment successful'
                                    : firstPayment.status === 'Pending'
                                      ? 'Payment required'
                                      : firstPayment.status === 'Cancelled'
                                        ? 'Transaction cancelled'
                                        : firstPayment.status === 'Failed'
                                          ? 'Payment failed'
                                          : firstPayment.status === 'Refunded'
                                            ? 'Amount refunded'
                                            : 'Transaction processing'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount + Action */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                          <div className="space-y-1 text-right">
                            <p
                              className={`text-2xl font-black tabular-nums ${
                                isRefunded
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : isCancelled
                                    ? 'text-slate-300'
                                    : isCompleted
                                      ? 'text-red-500 dark:text-red-400'
                                      : 'text-amber-500'
                              }`}
                            >
                              {formatCurrency(
                                order.depositAmount ?? order.totalAmount,
                                {
                                  absolute: true,
                                }
                              )}
                              <span className="text-xs ml-1 opacity-60">đ</span>
                            </p>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : isCancelled
                                    ? 'bg-slate-500/10 text-slate-400'
                                    : isRefunded
                                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {isCompleted && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {ORDER_STATUS_LABEL[order.status]}
                            </span>
                          </div>

                          {/* Pay now button for pending orders */}
                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => syncOrder(order.id)}
                                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group/sync"
                                title="Check payment status"
                              >
                                <RefreshCw className="w-4 h-4 text-slate-500 group-hover/sync:rotate-180 transition-transform duration-500" />
                              </button>
                              {paymentUrl && (
                                <a
                                  href={paymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20 transition-all hover:scale-105 hover:bg-brand/90"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Pay Now
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!ordersData.hasPrevious}
                    className="group inline-flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {t('PatientWallet.pagination.previous')}
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Page
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-black text-white shadow-xl shadow-brand/20">
                      {ordersData.pageNumber}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      of {ordersData.totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(ordersData.totalPages, p + 1))
                    }
                    disabled={!ordersData.hasNext}
                    className="group inline-flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    {t('PatientWallet.pagination.next')}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
