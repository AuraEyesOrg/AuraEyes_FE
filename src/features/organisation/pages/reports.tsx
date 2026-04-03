import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Loader2,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { orgReportsApi } from '../api/billing.api';

export default function OrganisationReportsPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['org-screening-reports'],
    queryFn: () => orgReportsApi.getScreeningReports(),
  });

  // Compute donut chart percentages
  const total = report?.totalScreenings || 1;
  const highPct = Math.round(((report?.highRiskCount ?? 0) / total) * 100);
  const modPct = Math.round(((report?.moderateRiskCount ?? 0) / total) * 100);
  const lowPct = Math.round(((report?.lowRiskCount ?? 0) / total) * 100);

  const handleExport = () => {
    if (!report) return;
    const csvRows = [
      'Month,Total,High Risk,Moderate Risk,Low Risk',
      ...(report.monthlyBreakdown ?? []).map(
        (m) =>
          `${m.month},${m.count},${m.highRisk},${m.moderateRisk},${m.lowRisk}`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screening-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--text-primary)">
                  Screening Reports
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Aggregate analytics and insights from AI screenings
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={!report}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-primary/25"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                  icon={BarChart3}
                  label="Total Screenings"
                  value={report?.totalScreenings ?? 0}
                  iconBg="bg-blue-500/10"
                  iconColor="text-blue-500"
                />
                <MetricCard
                  icon={AlertTriangle}
                  label="High Risk Cases"
                  value={report?.highRiskCount ?? 0}
                  iconBg="bg-red-500/10"
                  iconColor="text-red-500"
                />
                <MetricCard
                  icon={ShieldCheck}
                  label="Low Risk Cases"
                  value={report?.lowRiskCount ?? 0}
                  iconBg="bg-emerald-500/10"
                  iconColor="text-emerald-500"
                />
                <MetricCard
                  icon={Activity}
                  label="Avg. Confidence"
                  value={`${report?.averageConfidence ?? 0}%`}
                  iconBg="bg-purple-500/10"
                  iconColor="text-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Risk Distribution */}
                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
                  <h3 className="text-base font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Risk Distribution
                  </h3>
                  <div className="space-y-4">
                    <DistributionBar
                      label="High Risk"
                      count={report?.highRiskCount ?? 0}
                      percentage={highPct}
                      color="bg-red-500"
                    />
                    <DistributionBar
                      label="Moderate Risk"
                      count={report?.moderateRiskCount ?? 0}
                      percentage={modPct}
                      color="bg-amber-500"
                    />
                    <DistributionBar
                      label="Low Risk"
                      count={report?.lowRiskCount ?? 0}
                      percentage={lowPct}
                      color="bg-emerald-500"
                    />
                  </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="lg:col-span-2 rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden">
                  <div className="px-6 py-4 border-b border-(--border-primary)">
                    <h3 className="text-base font-bold text-(--text-primary) flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Monthly Breakdown
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-(--border-primary)">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                            Month
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                            Total
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                            High
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                            Moderate
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                            Low
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--border-primary)">
                        {(report?.monthlyBreakdown ?? []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-12 text-center text-(--text-tertiary)"
                            >
                              No data available yet
                            </td>
                          </tr>
                        ) : (
                          (report?.monthlyBreakdown ?? []).map((m) => (
                            <tr
                              key={m.month}
                              className="hover:bg-(--bg-tertiary) transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-(--text-primary)">
                                {m.month}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-(--text-primary)">
                                {m.count}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                  {m.highRisk}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                  {m.moderateRisk}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                  {m.lowRisk}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function MetricCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 hover:border-primary/40 transition-colors">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-3xl font-bold text-(--text-primary)">{value}</p>
      <p className="text-sm text-(--text-tertiary) mt-1">{label}</p>
    </div>
  );
}

function DistributionBar({
  label,
  count,
  percentage,
  color,
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-(--text-secondary) font-medium">{label}</span>
        <span className="text-(--text-primary) font-semibold">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
