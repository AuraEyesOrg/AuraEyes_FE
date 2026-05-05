import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Calendar, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '@/features/system-admin/api/dashboard.api';

const NS = 'SystemAdmin.dashboard.transactionChart';

// --- Types ---
type Period = 'daily' | 'weekly' | 'monthly';

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    value
  );

const compactVND = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return formatVND(value);
};

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const amount = payload[0].value;
    const count = payload[0].payload.Count;

    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-md">
        <p className="mb-2 font-medium text-slate-200">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
              {t(`${NS}.volume`, 'Volume')}:
            </span>
            <span className="font-semibold text-indigo-400">
              {formatVND(amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
              {t(`${NS}.count`, 'Count')}:
            </span>
            <span className="font-medium text-slate-200">{count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
export const TransactionVolumeChart = () => {
  const [period, setPeriod] = useState<Period>('daily');
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'transaction-stats', period],
    queryFn: () => dashboardApi.getTransactionStats(period),
  });

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/20 bg-white/5 p-6 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-black/20">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {t(`${NS}.title`, 'Transaction Overview')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(`${NS}.subtitle`, 'Monitor volume and activity across periods')}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/50 bg-slate-50/50 p-1 dark:border-white/10 dark:bg-black/40">
          <Calendar className="ml-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="cursor-pointer appearance-none bg-transparent py-1 pl-2 pr-6 text-sm font-medium text-slate-700 outline-none focus:ring-0 dark:text-slate-200"
          >
            <option value="daily" className="dark:bg-slate-900">
              {t(`${NS}.daily`, 'Last 7 Days')}
            </option>
            <option value="weekly" className="dark:bg-slate-900">
              {t(`${NS}.weekly`, 'Last 4 Weeks')}
            </option>
            <option value="monthly" className="dark:bg-slate-900">
              {t(`${NS}.monthly`, 'This Year')}
            </option>
          </select>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[350px] w-full">
        {isLoading ? (
          <div className="flex h-full w-full items-end justify-between gap-2">
            {/* Skeleton bars */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-full animate-pulse rounded-t-md bg-slate-200/50 dark:bg-slate-800/50"
                style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center text-rose-500">
            <AlertCircle className="mb-2 h-8 w-8 opacity-80" />
            <p className="text-sm font-medium">
              {t(`${NS}.loadError`, 'Failed to load chart data.')}
            </p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800/50">
              <Calendar className="h-6 w-6 opacity-50" />
            </div>
            <p className="text-sm">
              {t(`${NS}.noData`, 'No transactions found for this period.')}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="opacity-10 dark:opacity-20 text-slate-300 dark:text-slate-600"
              />
              <XAxis
                dataKey="Date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickFormatter={(value) => compactVND(value)}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: 'currentColor',
                  className: 'text-slate-100 dark:text-white/5',
                }}
              />
              <Bar
                dataKey="Amount"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="url(#colorAmount)"
                    className="transition-opacity duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
