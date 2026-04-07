import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Loader2,
  Users,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { orgBillingApi } from '../api/billing.api';

export default function OrganisationBillingPage() {
  const navigate = useNavigate();
  const { data: billing, isLoading: loadingBilling } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const isLoading = loadingBilling;
  const purchasedQuota = billing?.purchasedQuota ?? 0;
  const remainingQuota = billing?.remainingQuota ?? 0;
  const consumedQuota = Math.max(0, purchasedQuota - remainingQuota);
  const usagePercent =
    purchasedQuota > 0
      ? Math.min(100, Math.round((consumedQuota / purchasedQuota) * 100))
      : 0;

  const summaryCards = [
    {
      icon: BarChart3,
      label: 'Screenings This Month',
      value: billing?.totalScreeningsThisMonth ?? 0,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Zap,
      label: 'Remaining Quota',
      value: billing?.remainingQuota ?? 0,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      icon: CreditCard,
      label: 'Used Today',
      value: billing?.usedQuotaToday ?? 0,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
    },
    {
      icon: CalendarDays,
      label: 'Purchased Quota',
      value: purchasedQuota,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader pageName="Billing" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-(--text-primary)">
                Billing & Usage
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Track quota consumption and monthly billing usage for your
                organisation.
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

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6">
                <section className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
                  <h2 className="text-lg font-bold text-(--text-primary)">
                    Quota Utilization
                  </h2>
                  <p className="text-sm text-(--text-tertiary) mt-1">
                    Current package usage for the active billing cycle.
                  </p>

                  <div className="mt-6 rounded-xl border border-(--border-primary) bg-(--bg-primary) p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-(--text-secondary)">
                        Consumed quota
                      </span>
                      <span className="font-semibold text-(--text-primary)">
                        {consumedQuota} / {purchasedQuota}
                      </span>
                    </div>
                    <div className="mt-3 h-3 w-full rounded-full bg-(--bg-tertiary) overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.max(usagePercent, purchasedQuota ? 2 : 0)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-(--text-tertiary)">
                      {usagePercent}% of purchased quota has been used.
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) p-3.5">
                      <p className="text-xs text-(--text-tertiary)">
                        All-time screenings
                      </p>
                      <p className="mt-1 text-xl font-bold text-(--text-primary)">
                        {billing?.totalScreeningsAllTime ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) p-3.5">
                      <p className="text-xs text-(--text-tertiary)">
                        Available now
                      </p>
                      <p className="mt-1 text-xl font-bold text-(--text-primary)">
                        {remainingQuota}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6">
                  <h2 className="text-lg font-bold text-(--text-primary)">
                    Workflow Guidance
                  </h2>
                  <p className="text-sm text-(--text-tertiary) mt-1">
                    Billing is for quota and payment reporting. Screening
                    timeline is managed in patient records.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-3">
                      <p className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Patients &
                        History
                      </p>
                      <p className="mt-1 text-xs text-(--text-tertiary)">
                        Open a patient profile to view all screening sessions,
                        retinal images, and saved records.
                      </p>
                    </div>

                    <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-3">
                      <p className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Reports
                      </p>
                      <p className="mt-1 text-xs text-(--text-tertiary)">
                        Use reports for monthly aggregate analytics and
                        accounting exports.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          resolvePathWithLocale('/organisation/patients')
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                    >
                      <Users className="h-3.5 w-3.5" /> Open Patients
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(resolvePathWithLocale('/organisation/reports'))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3.5 py-2 text-xs font-semibold text-(--text-primary) hover:bg-(--bg-tertiary) transition"
                    >
                      <FileText className="h-3.5 w-3.5" /> Open Reports
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
