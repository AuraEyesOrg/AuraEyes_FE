import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
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
import { formatCurrency, cleanDescription } from '@/lib/helper';
import { useMyOrders, useSyncOrder } from '../hooks/use-financial';
import type { OrderStatus, PaymentStatus } from '../types/financial.types';
import { useTranslation } from 'react-i18next';

type FilterType = 'all' | 'completed' | 'pending' | 'cancelled';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: 'PatientWallet.orderStatus.Pending',
  Confirmed: 'PatientWallet.orderStatus.Confirmed',
  Processing: 'PatientWallet.orderStatus.Processing',
  Completed: 'PatientWallet.orderStatus.Completed',
  Cancelled: 'PatientWallet.orderStatus.Cancelled',
  Refunded: 'PatientWallet.orderStatus.Refunded',
  FullyPaid: 'PatientWallet.orderStatus.FullyPaid',
  PartiallyPaid: 'PatientWallet.orderStatus.PartiallyPaid',
  CancellationRequested: 'PatientWallet.orderStatus.CancellationRequested',
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
        (o) =>
          o.status === 'Completed' ||
          o.status === 'Confirmed' ||
          o.status === 'FullyPaid' ||
          o.status === 'PartiallyPaid'
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
      (o) =>
        o.status === 'Completed' ||
        o.status === 'Confirmed' ||
        o.status === 'FullyPaid' ||
        o.status === 'PartiallyPaid'
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
    if (
      status === 'Completed' ||
      status === 'Confirmed' ||
      status === 'FullyPaid' ||
      status === 'PartiallyPaid'
    )
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    if (status === 'Refunded' || status === 'CancellationRequested')
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
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('PatientWallet.page.paymentOrdersTitle', {
                defaultValue: 'Lịch sử giao dịch',
              })}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t('PatientWallet.page.paymentOrdersSubtitle', {
                defaultValue: 'Quản lý hồ sơ tài chính và giao dịch của bạn',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={
                isSyncingAll ||
                !orders.some(
                  (o) => o.status === 'Pending' || o.status === 'Processing'
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 disabled:opacity-40"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`}
                strokeWidth={2}
              />
              {isSyncingAll
                ? t('PatientWallet.actions.syncing', {
                    defaultValue: 'Đang cập nhật...',
                  })
                : t('PatientWallet.actions.syncAll', {
                    defaultValue: 'Cập nhật trạng thái',
                  })}
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Paid */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <CreditCard className="w-5 h-5 text-red-500" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('PatientWallet.stats.spending', {
                  defaultValue: 'Chi tiêu',
                })}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                {t('PatientWallet.stats.totalPaid', {
                  defaultValue: 'Tổng chi tiêu',
                })}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-red-500">
                  {formatCurrency(summary.totalPaid, { absolute: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Total Refund */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <RefreshCw
                  className="w-5 h-5 text-emerald-500"
                  strokeWidth={2}
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('PatientWallet.stats.refund', { defaultValue: 'Hoàn tiền' })}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                {t('PatientWallet.stats.totalRefund', {
                  defaultValue: 'Tổng hoàn tiền',
                })}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-emerald-500">
                  {formatCurrency(summary.totalRefund, { absolute: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order List Section */}
        <section className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <CreditCard className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t('PatientWallet.transactions.paymentOrderTitle', {
                  defaultValue: 'Giao dịch & Đơn hàng',
                })}
              </h2>
            </div>

            {/* Filter tabs */}
            <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
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
                      'relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap',
                      active
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                    ].join(' ')}
                  >
                    {option === 'all'
                      ? t('PatientWallet.filters.all', {
                          defaultValue: 'Tất cả',
                        })
                      : option === 'completed'
                        ? t('PatientWallet.filters.payment', {
                            defaultValue: 'Đã thanh toán',
                          })
                        : option === 'pending'
                          ? t('PatientWallet.filters.pending', {
                              defaultValue: 'Chờ thanh toán',
                            })
                          : t('PatientWallet.filters.refund', {
                              defaultValue: 'Hủy/Hoàn tiền',
                            })}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Skeleton */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`order-skeleton-${index}`}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 animate-pulse bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-2 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="rounded-xl border-2 border-dashed border-red-500/20 bg-red-500/5 p-8 text-center">
                <AlertCircle
                  className="w-10 h-10 text-red-500 mx-auto mb-3"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {t('PatientWallet.transactions.loadFailed', {
                    defaultValue: 'Không thể tải giao dịch',
                  })}
                </h3>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600"
                >
                  {t('PatientWallet.error.retry', {
                    defaultValue: 'Thử lại',
                  })}
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && visibleOrders.length === 0 && (
              <div className="text-center py-12">
                <History
                  className="w-12 h-12 text-slate-300 mx-auto mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {activeFilter === 'all'
                    ? t('PatientWallet.transactions.emptyPaymentOrdersTitle', {
                        defaultValue: 'Chưa có giao dịch',
                      })
                    : t('PatientWallet.transactions.emptyByFilterTitle', {
                        defaultValue: 'Không tìm thấy giao dịch',
                      })}
                </h3>
                <p className="text-sm text-slate-500">
                  {activeFilter === 'all'
                    ? t(
                        'PatientWallet.transactions.emptyPaymentOrdersDescription',
                        {
                          defaultValue:
                            'Khi bạn đặt lịch, giao dịch sẽ hiển thị ở đây.',
                        }
                      )
                    : t('PatientWallet.transactions.emptyByFilterDescription', {
                        defaultValue:
                          'Hãy thử thay đổi bộ lọc để xem kết quả khác.',
                      })}
                </p>
              </div>
            )}

            {/* Order list */}
            {!isLoading && !error && visibleOrders.length > 0 && (
              <>
                <div className="space-y-3">
                  {visibleOrders.map((order) => {
                    const isCompleted =
                      order.status === 'Completed' ||
                      order.status === 'Confirmed' ||
                      order.status === 'FullyPaid' ||
                      order.status === 'PartiallyPaid';
                    const isRefunded = order.status === 'Refunded';
                    const isCancelled = order.status === 'Cancelled';
                    const isPending =
                      order.status === 'Pending' ||
                      order.status === 'Processing';
                    const paymentUrl = getPaymentUrl(order.id);

                    return (
                      <article
                        key={order.id}
                        className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 transition-all hover:border-brand/40 hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {getOrderStatusIcon(order.status)}
                            <div className="min-w-0 space-y-1">
                              <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                                {cleanDescription(order.description) ||
                                  t('PatientWallet.transactions.medicalAppt', {
                                    defaultValue: 'Đặt lịch khám tại cơ sở',
                                  })}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {formatDateTimeWithYear(order.createdAt)} •{' '}
                                {t('PatientWallet.transactions.ref', {
                                  defaultValue: 'Mã',
                                })}
                                : {order.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="text-right">
                              <p
                                className={`text-lg font-black tabular-nums ${
                                  isRefunded
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : isCancelled
                                      ? 'text-slate-400'
                                      : isCompleted
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'text-amber-500'
                                }`}
                              >
                                {formatCurrency(
                                  order.paidAmount > 0
                                    ? order.paidAmount
                                    : (order.depositAmount ??
                                        order.totalAmount),
                                  {
                                    absolute: true,
                                  }
                                )}
                              </p>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : isCancelled
                                      ? 'bg-slate-500/10 text-slate-400'
                                      : isRefunded ||
                                          order.status ===
                                            'CancellationRequested'
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {isCompleted && (
                                  <CheckCircle
                                    className="w-2.5 h-2.5"
                                    strokeWidth={2}
                                  />
                                )}
                                {t(ORDER_STATUS_LABEL[order.status], {
                                  defaultValue: order.status,
                                })}
                              </span>
                            </div>

                            {isPending && paymentUrl && (
                              <a
                                href={paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-brand/90 active:scale-95"
                              >
                                <ExternalLink
                                  className="w-3 h-3"
                                  strokeWidth={2}
                                />
                                {t('PatientWallet.transactions.payNow', {
                                  defaultValue: 'Thanh toán',
                                })}
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {ordersData && ordersData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!ordersData.hasPrevious}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                      {t('PatientWallet.pagination.previous')}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {t('PatientWallet.pagination.page', {
                          defaultValue: 'Trang',
                        })}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-[10px] font-black text-white">
                        {ordersData.pageNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {t('PatientWallet.pagination.of', {
                          defaultValue: 'trên',
                        })}{' '}
                        {ordersData.totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(ordersData.totalPages, p + 1))
                      }
                      disabled={!ordersData.hasNext}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                    >
                      {t('PatientWallet.pagination.next')}
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
}
