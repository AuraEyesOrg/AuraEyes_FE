import { useQuery } from '@tanstack/react-query';
import { Activity, Database, ExternalLink, Radio, Server } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { dashboardApi } from '../api';
import type { SystemAdminDashboardMetrics } from '../types/system-admin.types';

export default function SystemAdminStatusPage() {
  const metricsQuery = useQuery<SystemAdminDashboardMetrics>({
    queryKey: ['system-admin-dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
  });

  const metrics = metricsQuery.data;
  const isLoading = metricsQuery.isLoading;

  const betterStackMonitors = metrics?.betterStack.monitors ?? [];
  const configuredMonitorCount = betterStackMonitors.filter(
    (item) => item.configured
  ).length;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="System Status"
          description="Infrastructure health and BetterStack heartbeats"
          showNotifications={true}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-8 py-5 max-w-[1680px] mx-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size={36} />
              </div>
            ) : !metrics ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                Unable to load status metrics.
              </div>
            ) : (
              <div className="space-y-5">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard
                    title="API"
                    value={
                      metrics.systemStatus.apiHealthy ? 'Operational' : 'Issue'
                    }
                    icon={Server}
                    healthy={metrics.systemStatus.apiHealthy}
                    description="Backend API availability"
                  />
                  <StatusCard
                    title="Database"
                    value={
                      metrics.systemStatus.databaseHealthy
                        ? 'Connected'
                        : 'Unreachable'
                    }
                    icon={Database}
                    healthy={metrics.systemStatus.databaseHealthy}
                    description="Primary data store health"
                  />
                  <StatusCard
                    title="Live consultations"
                    value={metrics.systemStatus.liveConsultationSessions.toString()}
                    icon={Radio}
                    healthy={metrics.systemStatus.liveConsultationSessions >= 0}
                    description="Sessions with open chat window"
                  />
                </section>

                <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-slate-900 dark:text-white text-sm font-bold mb-0.5 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-500" />
                        BetterStack heartbeats
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Background workers and Hangfire recurring jobs
                      </p>
                    </div>

                    {metrics.betterStack.embedUrl ? (
                      <a
                        href={metrics.betterStack.embedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Open BetterStack
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                    Enabled:{' '}
                    <span className="font-semibold">
                      {metrics.betterStack.enabled ? 'Yes' : 'No'}
                    </span>
                    {' · '}Configured monitors:{' '}
                    <span className="font-semibold">
                      {configuredMonitorCount}/{betterStackMonitors.length}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {betterStackMonitors.length === 0 ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        No monitors available.
                      </span>
                    ) : (
                      betterStackMonitors.map((monitor) => (
                        <span
                          key={monitor.key}
                          className={`rounded-full border px-2.5 py-1 text-[11px] ${
                            monitor.configured
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                          }`}
                        >
                          {monitor.name} · {monitor.category}
                        </span>
                      ))
                    )}
                  </div>

                  {metrics.betterStack.embedUrl ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <iframe
                        title="BetterStack Heartbeats"
                        src={metrics.betterStack.embedUrl}
                        loading="lazy"
                        className="h-[620px] w-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                      BetterStack embed URL is not configured yet.
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: string;
  description: string;
  healthy: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function StatusCard({
  title,
  value,
  description,
  healthy,
  icon: Icon,
}: StatusCardProps) {
  return (
    <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            healthy ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}
