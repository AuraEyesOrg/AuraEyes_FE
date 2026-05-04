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
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { getAllOrders } from '@/features/clinic-staff/api/billing.api';
import { formatDateTimeWithYear } from '@/lib/date-utils';
import {
  OrderStatus,
  PaymentStatus,
} from '@/features/patient/types/financial.types';
import { formatCurrency, cleanDescription } from '@/lib/helper';
import { useQuery } from '@tanstack/react-query';

type FilterType = 'all' | 'completed' | 'pending' | 'cancelled';

type TransactionRow = any;

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

  const translateDescription = (description: string) => {
    if (!description) return '';

    // 1. Clean metadata
    let result = cleanDescription(description);

    // 2. Map of common phrases to translate
    const phraseMap = [
      {
        vi: 'Thanh toán thuốc & dịch vụ',
        key: 'description.medicationAndService',
        def: 'Medication & Service Payment',
      },
      { vi: 'Đặt cọc khám', key: 'description.deposit', def: 'Online Deposit' },
      {
        vi: 'Thanh toán nốt khám',
        key: 'description.finalPayment',
        def: 'Final Payment',
      },
      {
        vi: 'Hoàn tiền:',
        key: 'description.refund',
        def: 'Refund:',
      },
      {
        vi: 'Refund:',
        key: 'description.refund',
        def: 'Refund:',
      },
    ];

    phraseMap.forEach(({ vi, key, def }) => {
      const regex = new RegExp(vi, 'gi'); // Case-insensitive
      if (regex.test(result)) {
        result = result.replace(
          regex,
          t(`ClinicStaffBilling.${key}`, { defaultValue: def })
        );
      }
    });

    // 3. Map of labels to translate
    const labelMap = [
      {
        vi: 'BN:',
        en: `${t('ClinicStaffBilling.orderDetails.patientLabelShort', { defaultValue: 'PT' })}:`,
      },
      {
        vi: 'BS:',
        en: `${t('ClinicStaffBilling.orderDetails.doctorLabelShort', { defaultValue: 'DR' })}:`,
      },
      {
        vi: 'Đơn',
        en: t('ClinicStaffBilling.orderDetails.orderLabel', {
          defaultValue: 'Order',
        }),
      },
    ];

    labelMap.forEach(({ vi, en }) => {
      const regex = new RegExp(vi, 'g');
      result = result.replace(regex, en);
    });

    return result;
  };

  const ORDER_STATUS_LABEL: Record<string, string> = useMemo(
    () => ({
      Pending: t('ClinicStaffBilling.filters.pending', {
        defaultValue: 'Pending',
      }),
      PartiallyPaid: t('ClinicStaffBilling.status.partiallyPaid', {
        defaultValue: 'Deposit Paid',
      }),
      Confirmed: t('ClinicStaffBilling.status.partiallyPaid', {
        defaultValue: 'Deposit Paid',
      }),
      FullyPaid: t('ClinicStaffBilling.status.fullyPaid', {
        defaultValue: 'Fully Paid',
      }),
      Completed: t('ClinicStaffBilling.status.fullyPaid', {
        defaultValue: 'Fully Paid',
      }),
      Cancelled: t('ClinicStaffBilling.filters.cancelled', {
        defaultValue: 'Cancelled',
      }),
      Refunded: t('ClinicStaffBilling.description.refund', {
        defaultValue: 'Refunded',
      }),
    }),
    [t]
  );

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const query = useQuery({
    queryKey: ['system-admin', 'orders', page, activeFilter],
    queryKeyHashFn: (key) => JSON.stringify(key),
    queryFn: () => getAllOrders(page, PAGE_SIZE),
  });

  const orders = query.data?.items ?? [];

  // ── Filter ──────────────────────────────────────────────────────────────────
  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'completed')
      return orders.filter(
        (o) =>
          o.status === 'Completed' ||
          o.status === 'Confirmed' ||
          o.status === 'PartiallyPaid' ||
          o.status === 'FullyPaid'
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

  // ── Flatten Orders to Transactions ──────────────────────────────────────────
  const visibleTransactions = useMemo<any[]>(() => {
    return visibleOrders.flatMap((order) => {
      if (!order.payments || order.payments.length === 0) {
        return [{ ...order, currentPayment: null, paymentIndex: 0 }] as any[];
      }
      // Sort payments by date to keep history chronological
      const sortedPayments = [...order.payments].sort(
        (a, b) =>
          new Date(a.paidAt || order.createdAt).getTime() -
          new Date(b.paidAt || order.createdAt).getTime()
      );
      return sortedPayments.map((p, index) => ({
        ...order,
        currentPayment: p,
        paymentIndex: index,
      }));
    }) as any[];
  }, [visibleOrders]);

  const summary = useMemo(() => {
    return {
      totalRevenue: query.data?.totalRevenue ?? 0,
      totalPending: query.data?.totalPending ?? 0,
      orderCount: query.data?.totalCount ?? 0,
    };
  }, [query.data]);

  const getOrderStatusIcon = (status: OrderStatus) => {
    if (
      status === 'Completed' ||
      status === 'Confirmed' ||
      status === 'FullyPaid'
    )
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    if (status === 'Refunded')
      return (
        <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      );
    if (status === 'Cancelled') return <X className="w-5 h-5 text-slate-400" />;
    return <ShoppingCart className="w-5 h-5 text-amber-500" />;
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
                defaultValue: 'Tổng doanh thu',
              })}
              value={formatCurrency(summary.totalRevenue, { absolute: true })}
              tone="emerald"
              icon={Wallet}
            />
            <SummaryCard
              title={t('SystemAdmin.cashflow.stats.pendingAmount', {
                defaultValue: 'Tổng chờ thanh toán',
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
              icon={ShoppingCart}
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

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  {
                    id: 'all',
                    label: t('ClinicStaffBilling.filters.all', {
                      defaultValue: 'All',
                    }),
                  },
                  {
                    id: 'completed',
                    label: t('ClinicStaffBilling.filters.completed', {
                      defaultValue: 'Completed',
                    }),
                  },
                  {
                    id: 'pending',
                    label: t('ClinicStaffBilling.filters.pending', {
                      defaultValue: 'Pending',
                    }),
                  },
                  {
                    id: 'cancelled',
                    label: t('ClinicStaffBilling.filters.cancelled', {
                      defaultValue: 'Cancelled',
                    }),
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id as FilterType);
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeFilter === f.id
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {f.label}
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
                    defaultValue: 'Error loading order data',
                  })}
                </p>
              </div>
            )}

            {!query.isLoading && !query.error && visibleOrders.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {t('SystemAdmin.cashflow.noData', {
                    defaultValue: 'No orders found',
                  })}
                </p>
              </div>
            )}

            {!query.isLoading &&
              !query.error &&
              visibleTransactions.length > 0 && (
                <div className="space-y-3">
                  {visibleTransactions.map((tx: TransactionRow) => {
                    const order = tx;
                    const payment = tx.currentPayment;

                    const isCompleted =
                      (payment?.status ?? order.status) === 'Completed' ||
                      order.status === 'Confirmed';
                    const isRefunded =
                      (payment?.status ?? order.status) === 'Refunded';
                    const isCancelled =
                      (payment?.status ?? order.status) === 'Cancelled';
                    const isOnlineDeposit =
                      payment?.description?.includes('Đặt cọc') ||
                      (order.depositAmount != null && tx.paymentIndex === 0);

                    return (
                      <article
                        key={`${order.id}-${payment?.id ?? 'none'}-${tx.paymentIndex}`}
                        className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:border-brand/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                              {getOrderStatusIcon(
                                (payment?.status ?? order.status) as OrderStatus
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <p className="text-slate-900 dark:text-white font-bold truncate">
                                  {translateDescription(
                                    payment?.description ||
                                      order.description ||
                                      ''
                                  ) ||
                                    t(
                                      'SystemAdmin.cashflow.table.defaultDescription',
                                      {
                                        defaultValue: 'Thanh toán dịch vụ y tế',
                                      }
                                    )}
                                </p>

                                <div className="flex items-center gap-2">
                                  {isOnlineDeposit ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-tighter">
                                      {t(
                                        'SystemAdmin.cashflow.table.onlineDeposit',
                                        {
                                          defaultValue: 'Đặt cọc Online',
                                        }
                                      )}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-tighter">
                                      {t(
                                        'SystemAdmin.cashflow.table.fullPayment',
                                        {
                                          defaultValue: 'Tất toán đơn hàng',
                                        }
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-[8px] font-bold">
                                    {order.patientName
                                      ? (order.patientName as string)
                                          .split(' ')
                                          .map((n: string) => n[0])
                                          .join('')
                                          .toUpperCase()
                                          .slice(0, 2)
                                      : 'PT'}
                                  </div>
                                  {order.patientName ||
                                    `${t('SystemAdmin.cashflow.table.patientFallback', { defaultValue: 'Bệnh nhân' })} ${order.userId.slice(0, 8)}`}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="inline-flex items-center gap-1.5 transition-colors">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  {formatDateTimeWithYear(
                                    payment?.paidAt || order.createdAt
                                  )}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock3 className="w-3.5 h-3.5 shrink-0" />
                                  ID: {(payment?.id ?? order.id).slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left md:text-right shrink-0 flex flex-col items-end gap-2">
                            <p
                              className={`font-bold text-lg ${
                                isRefunded
                                  ? 'text-rose-600'
                                  : isCancelled
                                    ? 'text-slate-400'
                                    : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {isRefunded
                                ? '-'
                                : isCancelled || payment?.status === 'Pending'
                                  ? ''
                                  : '+'}
                              {formatCurrency(
                                payment?.amount ?? order.totalAmount,
                                { absolute: true }
                              )}
                            </p>
                            {isRefunded && (
                              <p className="text-[10px] text-rose-500 font-medium italic">
                                {t(
                                  'SystemAdmin.cashflow.table.refundedDeposit',
                                  { defaultValue: 'Đã hoàn tiền' }
                                )}
                              </p>
                            )}
                            {payment?.method && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                {t(
                                  `ClinicStaffBilling.methods.${payment.method}`,
                                  { defaultValue: payment.method }
                                )}
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                PAYMENT_STATUS_COLOR[
                                  (payment?.status ||
                                    (order.status === 'FullyPaid'
                                      ? 'Completed'
                                      : order.status === 'PartiallyPaid'
                                        ? 'Processing'
                                        : order.status)) as PaymentStatus
                                ] || 'bg-slate-500/10 text-slate-500'
                              }`}
                            >
                              {payment?.status === 'Completed' ||
                              order.status === 'Completed' ||
                              order.status === 'FullyPaid'
                                ? isOnlineDeposit
                                  ? t(
                                      'ClinicStaffBilling.orderDetails.confirmedDeposit',
                                      { defaultValue: 'Đã xác nhận cọc' }
                                    )
                                  : t('ClinicStaffBilling.status.fullyPaid', {
                                      defaultValue: 'Đã tất toán',
                                    })
                                : payment?.status === 'Failed' ||
                                    payment?.status === 'Cancelled' ||
                                    order.status === 'Cancelled'
                                  ? t('SystemAdmin.cashflow.status.cancelled', {
                                      defaultValue: 'Đã hủy',
                                    })
                                  : payment?.status === 'Pending' ||
                                      order.status === 'Pending'
                                    ? t('SystemAdmin.cashflow.status.pending', {
                                        defaultValue: 'Chờ thanh toán',
                                      })
                                    : ORDER_STATUS_LABEL[
                                        order.status as OrderStatus
                                      ] || order.status}
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
