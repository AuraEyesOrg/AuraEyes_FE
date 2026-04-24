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
  ShoppingCart,
  XCircle,
  User,
} from 'lucide-react';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { useAllOrders, useCompleteOrder } from '../hooks/use-billing';
import type {
  OrderStatus,
  PaymentStatus,
} from '@/features/patient/types/financial.types';
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

export default function BillingPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: ordersData, isLoading, error } = useAllOrders(page, PAGE_SIZE);
  const completeMutation = useCompleteOrder();

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
    const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalRefund = refundedOrders.reduce((s, o) => s + o.totalAmount, 0);

    return {
      totalRevenue,
      totalRefund,
      orderCount: ordersData?.totalCount ?? 0,
    };
  }, [orders, ordersData]);

  const getOrderStatusIcon = (status: OrderStatus) => {
    if (status === 'Completed' || status === 'Confirmed')
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    if (status === 'Refunded')
      return (
        <XCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      );
    if (status === 'Cancelled')
      return <XCircle className="w-5 h-5 text-slate-400" />;
    return <ShoppingCart className="w-5 h-5 text-amber-500" />;
  };

  return (
    <ClinicStaffLayout>
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
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
                {t('ClinicStaffBilling.page.title', {
                  defaultValue: 'Quản lý thanh toán',
                })}
              </h1>
              <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-(--text-secondary)">
                {t('ClinicStaffBilling.page.subtitle', {
                  defaultValue:
                    'Theo dõi tất cả đơn thanh toán khám chữa bệnh của bệnh nhân.',
                })}
              </p>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('ClinicStaffBilling.stats.totalRevenue', {
                defaultValue: 'Tổng doanh thu (ước tính)',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalRevenue, { absolute: true })}
            </p>
          </div>
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('ClinicStaffBilling.stats.totalRefund', {
                defaultValue: 'Đã hoàn tiền',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400">
              {formatCurrency(summary.totalRefund, { absolute: true })}
            </p>
          </div>
          <div className="medical-card md:col-span-2">
            <p className="text-xs font-medium tracking-wide text-(--text-muted)">
              {t('ClinicStaffBilling.stats.orders', {
                defaultValue: 'Tổng đơn',
              })}
            </p>
            <p className="mt-2 text-2xl font-bold text-(--text-primary)">
              {summary.orderCount}
            </p>
          </div>
        </section>

        {/* ── Order List ─────────────────────────────────────────────────── */}
        <section className="medical-card">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              {t('ClinicStaffBilling.transactions.title', {
                defaultValue: 'Danh sách đơn hàng',
              })}
            </h2>

            {/* Filter tabs */}
            <div className="inline-flex rounded-xl border border-(--border-color) bg-(--bg-secondary) p-1">
              {(
                ['all', 'completed', 'pending', 'cancelled'] as FilterType[]
              ).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setActiveFilter(option);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeFilter === option
                      ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  {option === 'all'
                    ? t('ClinicStaffBilling.filters.all', {
                        defaultValue: 'Tất cả',
                      })
                    : option === 'completed'
                      ? t('ClinicStaffBilling.filters.completed', {
                          defaultValue: 'Hoàn thành',
                        })
                      : option === 'pending'
                        ? 'Chờ thanh toán'
                        : t('ClinicStaffBilling.filters.cancelled', {
                            defaultValue: 'Đã hủy',
                          })}
                </button>
              ))}
            </div>
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`order-skeleton-${index}`}
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

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-(--text-secondary)">
                {t('ClinicStaffBilling.transactions.loadFailed', {
                  defaultValue: 'Lỗi khi tải dữ liệu',
                })}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
              >
                {t('ClinicStaffBilling.error.retry', {
                  defaultValue: 'Thử lại',
                })}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && visibleOrders.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-(--text-muted) mx-auto mb-3" />
              <p className="text-(--text-secondary) font-medium">
                {t('ClinicStaffBilling.transactions.emptyTitle', {
                  defaultValue: 'Không có đơn nào',
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
                    order.status === 'Confirmed';
                  const isRefunded = order.status === 'Refunded';
                  const isCancelled = order.status === 'Cancelled';
                  const isOnlineDeposit = order.depositAmount != null;

                  const firstPayment = order.payments?.[0];

                  return (
                    <article
                      key={order.id}
                      className="group rounded-2xl border border-(--border-color) bg-(--bg-primary) p-5 transition-all hover:border-brand/40 hover:-translate-y-[1px]"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex min-w-0 items-center gap-4">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-(--bg-secondary)">
                            {getOrderStatusIcon(order.status)}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <p className="text-(--text-primary) font-semibold truncate flex items-center gap-2">
                              {order.description || 'Thanh toán phòng khám'}
                              {isOnlineDeposit ? (
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
                                  Đặt cọc Online
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
                                  Walk-in / Full
                                </span>
                              )}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-(--text-secondary)">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {formatDateTimeWithYear(order.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                                <User className="w-3 h-3 shrink-0" />
                                {order.patientName ||
                                  `ID: ${order.userId.slice(0, 8)}`}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="w-3 h-3 shrink-0" />
                                Đơn: {order.id.slice(0, 8)}
                              </span>
                            </div>

                            {/* Payment status badge */}
                            {firstPayment && (
                              <span
                                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLOR[firstPayment.status]}`}
                              >
                                {firstPayment.status === 'Completed'
                                  ? 'Đã thanh toán cọc/100%'
                                  : firstPayment.status === 'Pending'
                                    ? 'Chờ thanh toán'
                                    : firstPayment.status === 'Cancelled'
                                      ? 'Đã hủy'
                                      : firstPayment.status === 'Failed'
                                        ? 'Thất bại'
                                        : firstPayment.status === 'Refunded'
                                          ? 'Hoàn tiền'
                                          : 'Đang xử lý'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount + Action */}
                        <div className="text-left md:text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="font-bold text-lg text-(--text-primary)">
                            {formatCurrency(order.totalAmount, {
                              absolute: true,
                            })}
                          </p>
                          {isOnlineDeposit && (
                            <p className="text-sm text-(--text-secondary) font-medium flex items-center gap-2">
                              Đã cọc:{' '}
                              <span className="text-blue-600 dark:text-blue-400">
                                {formatCurrency(order.depositAmount!)}
                              </span>
                              <span className="text-(--text-muted)">|</span>
                              Còn lại:{' '}
                              <span className="text-rose-500">
                                {formatCurrency(
                                  order.totalAmount - order.depositAmount!
                                )}
                              </span>
                            </p>
                          )}

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              isCompleted
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : isCancelled
                                  ? 'bg-slate-500/10 text-slate-500'
                                  : isRefunded
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="w-3 h-3" />}
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>

                          {!isCompleted && !isCancelled && !isRefunded && (
                            <button
                              onClick={() => completeMutation.mutate(order.id)}
                              disabled={completeMutation.isPending}
                              className="mt-2 px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand/90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                              {completeMutation.isPending
                                ? 'Đang xử lý...'
                                : 'Xác nhận thanh toán nốt'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-(--border-color) gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!ordersData.hasPrevious}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('ClinicStaffBilling.pagination.previous', {
                      defaultValue: 'Trước',
                    })}
                  </button>

                  <span className="text-sm text-(--text-secondary)">
                    {t('ClinicStaffBilling.pagination.pageOf', {
                      page: ordersData.pageNumber,
                      total: ordersData.totalPages,
                      defaultValue: `Trang ${ordersData.pageNumber} / ${ordersData.totalPages}`,
                    })}
                  </span>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(ordersData.totalPages, p + 1))
                    }
                    disabled={!ordersData.hasNext}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('ClinicStaffBilling.pagination.next', {
                      defaultValue: 'Sau',
                    })}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </ClinicStaffLayout>
  );
}
