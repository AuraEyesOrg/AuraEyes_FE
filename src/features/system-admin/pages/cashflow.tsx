import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  ShoppingCart,
  Clock3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  AlertCircle,
  X,
  Wallet,
  ArrowUp,
  ArrowDown,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { getAllOrders } from '@/features/clinic-staff/api/billing.api';
import type {
  OrderStatus,
  PaymentStatus,
} from '@/features/patient/types/financial.types';
import { formatCurrency } from '@/lib/helper';
import { useQuery } from '@tanstack/react-query';

type FilterType = 'all' | 'completed' | 'pending' | 'cancelled';

// We move the labels inside the component to use the 't' function reactively
const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Failed: 'bg-red-500/10 text-red-500 dark:text-red-400',
  Refunded: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Cancelled: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
};

export default function CashflowPage() {
  const { t } = useTranslation();

  const ORDER_STATUS_LABEL: Record<OrderStatus, string> = useMemo(
    () => ({
      Pending: t('SystemAdmin.cashflow.status.pending', {
        defaultValue: 'Chờ thanh toán',
      }),
      Confirmed: t('SystemAdmin.cashflow.status.confirmed', {
        defaultValue: 'Đã xác nhận',
      }),
      Processing: t('SystemAdmin.cashflow.status.processing', {
        defaultValue: 'Đang xử lý',
      }),
      Completed: t('SystemAdmin.cashflow.status.completed', {
        defaultValue: 'Hoàn thành',
      }),
      Cancelled: t('SystemAdmin.cashflow.status.cancelled', {
        defaultValue: 'Đã hủy',
      }),
      Refunded: t('SystemAdmin.cashflow.status.refunded', {
        defaultValue: 'Hoàn tiền',
      }),
      PartiallyPaid: t('SystemAdmin.cashflow.status.partiallyPaid', {
        defaultValue: 'Thanh toán cọc',
      }),
      FullyPaid: t('SystemAdmin.cashflow.status.fullyPaid', {
        defaultValue: 'Đã tất toán',
      }),
    }),
    [t]
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const query = useQuery({
    queryKey: ['system-admin', 'orders', page, activeFilter],
    queryKeyHashFn: (key) => JSON.stringify(key),
    queryFn: () => getAllOrders(page, PAGE_SIZE),
  });

  const orders = query.data?.items ?? [];

  const visibleOrders = useMemo(() => {
    let result = [...orders];
    if (activeFilter === 'completed') {
      result = result.filter(
        (o) => o.status === 'Completed' || o.status === 'Confirmed'
      );
    } else if (activeFilter === 'pending') {
      result = result.filter(
        (o) => o.status === 'Pending' || o.status === 'Processing'
      );
    } else if (activeFilter === 'cancelled') {
      result = result.filter(
        (o) => o.status === 'Cancelled' || o.status === 'Refunded'
      );
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[sortBy as keyof typeof a];
      const valB = b[sortBy as keyof typeof b];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const factor = sortDirection === 'asc' ? 1 : -1;
      return valA < valB ? -factor : factor;
    });

    return result;
  }, [activeFilter, orders, sortBy, sortDirection]);

  const summary = useMemo(() => {
    const completedOrders = orders.filter(
      (o) => o.status === 'Completed' || o.status === 'Confirmed'
    );
    const pendingOrders = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Processing'
    );
    const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalPending = pendingOrders.reduce((s, o) => s + o.totalAmount, 0);

    return {
      totalRevenue,
      totalPending,
      orderCount: query.data?.totalCount ?? 0,
    };
  }, [orders, query.data?.totalCount]);

  const getOrderStatusIcon = (status: OrderStatus) => {
    if (status === 'Completed' || status === 'Confirmed')
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    if (status === 'Refunded')
      return <X className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    if (status === 'Cancelled') return <X className="w-5 h-5 text-slate-400" />;
    return <ShoppingCart className="w-5 h-5 text-amber-500" />;
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 inline-block text-slate-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 inline-block text-slate-500" />
    );
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title={t('SystemAdmin.cashflow.title', {
            defaultValue: 'Quản lý thanh toán',
          })}
          description={t('SystemAdmin.cashflow.description', {
            defaultValue:
              'Theo dõi tất cả đơn thanh toán khám chữa bệnh của bệnh nhân trên toàn hệ thống.',
          })}
        />

        <main className="p-6 space-y-6 max-w-[1200px] mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title={t('SystemAdmin.cashflow.stats.totalVolume', {
                defaultValue: 'Tổng doanh thu (Trang này)',
              })}
              value={formatCurrency(summary.totalRevenue, { absolute: true })}
              tone="emerald"
              icon={DollarSign}
            />
            <SummaryCard
              title={t('SystemAdmin.cashflow.stats.pendingAmount', {
                defaultValue: 'Tổng chờ (Trang này)',
              })}
              value={formatCurrency(summary.totalPending, { absolute: true })}
              tone="amber"
              icon={Clock3}
            />
            <SummaryCard
              title={t('SystemAdmin.cashflow.stats.completedOrders', {
                defaultValue: 'Tổng số đơn hàng',
              })}
              value={summary.orderCount.toString()}
              tone="violet"
              icon={BarChart3}
            />
          </div>

          {/* Order List Card */}
          <div className="medical-card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand" />
                {t('SystemAdmin.cashflow.table.list', {
                  defaultValue: 'Danh sách đơn hàng',
                })}
              </h2>

              {/* Filter tabs */}
              <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
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
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {option === 'all'
                      ? t('SystemAdmin.cashflow.filters.all', {
                          defaultValue: 'Tất cả',
                        })
                      : option === 'completed'
                        ? t('SystemAdmin.cashflow.filters.completed', {
                            defaultValue: 'Hoàn thành',
                          })
                        : option === 'pending'
                          ? t('SystemAdmin.cashflow.filters.pending', {
                              defaultValue: 'Chờ',
                            })
                          : t('SystemAdmin.cashflow.filters.failed', {
                              defaultValue: 'Đã hủy/Hoàn',
                            })}
                  </button>
                ))}
              </div>
            </div>

            {query.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`order-skeleton-${index}`}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        <div className="h-3 w-36 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.error && (
              <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                <p>
                  {t('SystemAdmin.cashflow.error', {
                    defaultValue: 'Lỗi khi tải dữ liệu đơn hàng',
                  })}
                </p>
              </div>
            )}

            {!query.isLoading && !query.error && visibleOrders.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {t('SystemAdmin.cashflow.noData', {
                    defaultValue: 'Không tìm thấy đơn hàng nào',
                  })}
                </p>
              </div>
            )}

            {!query.isLoading && !query.error && visibleOrders.length > 0 && (
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
                      className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:border-brand/40 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                            {getOrderStatusIcon(order.status)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-[10px] font-bold">
                                {order.patientName
                                  ? order.patientName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : 'PT'}
                              </div>
                              <p className="text-slate-900 dark:text-white font-bold truncate flex items-center gap-2">
                                {order.patientName ||
                                  `${t('SystemAdmin.cashflow.table.patientFallback', { defaultValue: 'Patient' })} ${order.userId.slice(0, 8)}`}
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                              {order.description ||
                                t(
                                  'SystemAdmin.cashflow.table.defaultDescription',
                                  {
                                    defaultValue: 'Thanh toán phòng khám',
                                  }
                                )}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span
                                className="inline-flex items-center gap-1.5 cursor-pointer hover:text-brand transition-colors"
                                onClick={() => handleSort('createdAt')}
                              >
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                {new Date(order.createdAt).toLocaleString()}
                                {renderSortIcon('createdAt')}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                                <Clock3 className="w-3.5 h-3.5 shrink-0" />
                                ID: {order.id.slice(0, 8)}
                              </span>
                              <span className="text-slate-300">|</span>
                              {isOnlineDeposit ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-tighter">
                                  {t(
                                    'SystemAdmin.cashflow.table.onlineDeposit',
                                    {
                                      defaultValue: 'Online Deposit',
                                    }
                                  )}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-tighter">
                                  {t('SystemAdmin.cashflow.table.fullPayment', {
                                    defaultValue: 'Full Payment',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {formatCurrency(order.totalAmount, {
                              absolute: true,
                            })}
                          </p>
                          {isOnlineDeposit && (
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                              {t('SystemAdmin.cashflow.table.deposited', {
                                defaultValue: 'Đã cọc',
                              })}
                              :{' '}
                              <span className="text-blue-600 dark:text-blue-400">
                                {formatCurrency(order.depositAmount!)}
                              </span>
                              <span className="text-slate-300">|</span>
                              {t('SystemAdmin.cashflow.table.remaining', {
                                defaultValue: 'Còn lại',
                              })}
                              :{' '}
                              <span className="text-rose-500">
                                {formatCurrency(
                                  order.totalAmount - order.depositAmount!
                                )}
                              </span>
                            </p>
                          )}

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : isCancelled
                                  ? 'bg-slate-500/10 text-slate-500'
                                  : isRefunded
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {query.data && query.data.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!query.data.hasPrevious}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('SystemAdmin.cashflow.pagination.previous', {
                    defaultValue: 'Trước',
                  })}
                </button>
                <span className="text-sm text-slate-500">
                  {t('SystemAdmin.cashflow.pagination.page', {
                    defaultValue: 'Trang',
                  })}{' '}
                  {query.data.pageNumber} / {query.data.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(query.data!.totalPages, p + 1))
                  }
                  disabled={!query.data.hasNext}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {t('SystemAdmin.cashflow.pagination.next', {
                    defaultValue: 'Sau',
                  })}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone,
  icon: Icon = Wallet,
}: {
  title: string;
  value: string;
  tone: 'cyan' | 'emerald' | 'amber' | 'violet' | 'teal';
  icon?: React.ElementType;
}) {
  const palette = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    emerald:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    violet:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
    teal: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
  };

  return (
    <div className={`rounded-2xl border p-4 ${palette[tone]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <p className="text-sm">{title}</p>
      </div>
      <p className="min-w-0 break-words leading-tight text-xl font-bold">
        {value}
      </p>
    </div>
  );
}
