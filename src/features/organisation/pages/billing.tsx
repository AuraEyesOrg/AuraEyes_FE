import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Receipt,
  CreditCard,
  TrendingUp,
  Zap,
  Loader2,
  BarChart3,
  ShoppingCart,
  Coins,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { orgBillingApi } from '../api/billing.api';
import { orgScreeningApi } from '../api/screening.api';

export default function OrganisationBillingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customQuotaAmount, setCustomQuotaAmount] = useState('100');
  const { data: billing, isLoading: loadingBilling } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['org-screening-history'],
    queryFn: () => orgScreeningApi.getHistory(50),
  });

  const buyQuotaMutation = useMutation({
    mutationFn: (quotaAmount: number) =>
      orgBillingApi.buyQuota({ quotaAmount }),
    onSuccess: (data, quotaAmount) => {
      toast.success(
        `Purchased ${quotaAmount} credits successfully. Wallet balance: ${data.walletBalance.toLocaleString('vi-VN')} VND`
      );
      queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['org-screening-history'] });
      queryClient.invalidateQueries({ queryKey: ['quotaBalance'] });
    },
    onError: (error) => {
      let message = 'Unable to purchase quota. Please try again.';
      if (isAxiosError(error)) {
        const payload = error.response?.data as
          | { message?: string; detail?: string }
          | undefined;
        message = payload?.message || payload?.detail || message;
      }
      toast.error(message);
    },
  });

  const packageOptions = [50, 100, 500] as const;

  const isLoading = loadingBilling || loadingHistory;

  const handleBuyQuota = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please provide a valid quota amount.');
      return;
    }

    buyQuotaMutation.mutate(amount);
  };

  const summaryCards = [
    {
      icon: BarChart3,
      label: 'Screenings This Month',
      value: billing?.totalScreeningsThisMonth ?? 0,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: TrendingUp,
      label: 'All-Time Screenings',
      value: billing?.totalScreeningsAllTime ?? 0,
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      icon: Zap,
      label: 'Remaining Quota',
      value: billing?.remainingQuota ?? 0,
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      icon: CreditCard,
      label: 'Monthly Used',
      value: billing?.monthlyQuotaUsed ?? 0,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-(--text-primary)">
                Billing & Usage
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Track your AI screening quota and usage history
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                      >
                        <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-(--text-primary)">
                      {card.value}
                    </p>
                    <p className="text-sm text-(--text-tertiary) mt-1">
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <div className="xl:col-span-2 rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold text-(--text-primary)">
                      Buy Screening Quota
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {packageOptions.map((amount) => {
                      const totalCost =
                        (billing?.organisationUnitPrice ?? 0) * amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleBuyQuota(amount)}
                          disabled={buyQuotaMutation.isPending}
                          className="rounded-xl border border-(--border-primary) p-4 text-left hover:border-primary/60 hover:bg-(--bg-tertiary) transition disabled:opacity-60"
                        >
                          <p className="text-lg font-bold text-(--text-primary)">
                            {amount} credits
                          </p>
                          <p className="text-xs text-(--text-tertiary) mt-1">
                            {totalCost.toLocaleString('vi-VN')} VND
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-(--border-primary) p-4">
                    <p className="text-sm font-semibold text-(--text-primary) mb-2">
                      Custom package (10 - 5000)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={customQuotaAmount}
                        onChange={(event) =>
                          setCustomQuotaAmount(event.target.value)
                        }
                        className="flex-1 rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = Number(customQuotaAmount);
                          if (parsed < 10 || parsed > 5000) {
                            toast.error(
                              'Custom quota must be between 10 and 5000.'
                            );
                            return;
                          }
                          handleBuyQuota(parsed);
                        }}
                        disabled={buyQuotaMutation.isPending}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                      >
                        {buyQuotaMutation.isPending ? 'Processing…' : 'Buy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold text-(--text-primary)">
                      Quota Sources
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">
                        Monthly contract
                      </span>
                      <span className="font-semibold text-(--text-primary)">
                        {billing?.monthlyQuotaRemaining ?? 0}/
                        {billing?.monthlyQuotaLimit ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Purchased</span>
                      <span className="font-semibold text-(--text-primary)">
                        {billing?.purchasedQuota ?? 0}
                      </span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-(--border-primary) flex justify-between">
                      <span className="text-(--text-tertiary)">Unit Price</span>
                      <span className="font-semibold text-(--text-primary)">
                        {(billing?.organisationUnitPrice ?? 0).toLocaleString(
                          'vi-VN'
                        )}{' '}
                        VND
                      </span>
                    </div>
                    <p className="text-xs text-(--text-tertiary)">
                      Organisation pricing is 60% of patient unit price.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden">
                <div className="px-6 py-4 border-b border-(--border-primary) flex items-center justify-between">
                  <h2 className="text-lg font-bold text-(--text-primary)">
                    Screening History
                  </h2>
                  <span className="text-sm text-(--text-tertiary)">
                    {(history ?? []).length} records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-(--border-primary)">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-primary)">
                      {(history ?? []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-(--text-tertiary)"
                          >
                            No screening records yet
                          </td>
                        </tr>
                      ) : (
                        (history ?? []).map((item) => (
                          <tr
                            key={item.screeningId}
                            className="hover:bg-(--bg-tertiary) transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-(--text-primary)">
                                {item.patientName}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-(--text-secondary)">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  item.latestRiskLevel === 'High'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : item.latestRiskLevel === 'Moderate'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}
                              >
                                {item.latestRiskLevel || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-(--text-secondary)">
                              {item.confidenceScore
                                ? `${item.confidenceScore}%`
                                : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : item.status === 'saved'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/organisation/screening/result?id=${item.screeningId}`
                                  )
                                }
                                disabled={
                                  !item.screeningId ||
                                  item.screeningId ===
                                    '00000000-0000-0000-0000-000000000000'
                                }
                                className="inline-flex items-center rounded-lg border border-(--border-primary) px-3 py-1.5 text-xs font-semibold text-(--text-primary) hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                View Record
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
