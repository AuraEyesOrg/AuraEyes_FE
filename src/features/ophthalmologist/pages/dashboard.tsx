import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw } from 'lucide-react';
import {
  DoctorSidebar,
  DoctorHeader,
  StatsCardGrid,
  ReviewQueue,
  QueueFilters,
  PatientPreviewPanel,
} from '../components';
import type { QueueFilter } from '../components/QueueFilters';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import {
  getOphthalmologistDashboardMetrics,
  getReviewQueue,
  type ReviewQueueItem,
} from '../api/dashboard.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';

function getGreeting(
  hour: number,
  t: (key: string, fallback?: string) => string
): string {
  if (hour < 12)
    return t('Ophthalmologist.dashboard.greeting.morning', 'Good Morning');
  if (hour < 17)
    return t('Ophthalmologist.dashboard.greeting.afternoon', 'Good Afternoon');
  return t('Ophthalmologist.dashboard.greeting.evening', 'Good Evening');
}

export default function OphthalmologistDashboard() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<QueueFilter>('all');

  const metricsQuery = useQuery({
    queryKey: ['ophthalmologist-dashboard', 'metrics'],
    queryFn: getOphthalmologistDashboardMetrics,
  });

  const queueQuery = useQuery({
    queryKey: ['ophthalmologist-dashboard', 'review-queue'],
    queryFn: getReviewQueue,
    refetchInterval: 15_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (metricsQuery.isError) {
      ophthalToast.error(
        t(
          'Ophthalmologist.dashboard.loadError',
          'Unable to load the live ophthalmologist dashboard.'
        )
      );
    }
  }, [metricsQuery.isError, t]);

  const metrics = metricsQuery.data ?? {
    pendingReviews: 0,
    urgentCases: 0,
    completedToday: 0,
    openSlotsToday: 0,
    urgentCaseList: [],
  };

  const queueItems = queueQuery.data ?? [];

  const filterCounts = useMemo(
    () => ({
      all: queueItems.length,
      highRisk: queueItems.filter((i) => {
        const r = i.riskLevel.toLowerCase();
        return r === 'high' || r === 'critical';
      }).length,
      waitingLong: queueItems.filter((i) => i.waitingMinutes >= 30).length,
    }),
    [queueItems]
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === 'high_risk') {
      return queueItems.filter((i) => {
        const r = i.riskLevel.toLowerCase();
        return r === 'high' || r === 'critical';
      });
    }
    if (activeFilter === 'waiting_long') {
      return queueItems.filter((i) => i.waitingMinutes >= 30);
    }
    return queueItems;
  }, [queueItems, activeFilter]);

  // Auto-select first item when queue loads/refreshes and nothing is selected
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedItem) {
      setSelectedItem(filteredItems[0]);
    }
    // If selected item is no longer in the filtered list, reset
    if (
      selectedItem &&
      !filteredItems.some(
        (i) => i.consultationSessionId === selectedItem.consultationSessionId
      )
    ) {
      setSelectedItem(filteredItems[0] ?? null);
    }
  }, [filteredItems, selectedItem]);

  const handleSelect = useCallback((item: ReviewQueueItem) => {
    setSelectedItem(item);
  }, []);

  const displayName =
    user?.fullName || t('Ophthalmologist.common.doctor', 'Doctor');
  const greeting = getGreeting(new Date().getHours(), t);

  const metricsFirstLoad = metricsQuery.isLoading && !metricsQuery.data;
  const queueFirstLoad = queueQuery.isLoading && !queueQuery.data;
  const queueRefetching = queueQuery.isFetching && !queueFirstLoad;

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={metrics.pendingReviews} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.sidebar.Dashboard', 'Dashboard')}
        />

        <main className="p-6">
          {metricsQuery.isError ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
                <p className="text-slate-700 dark:text-slate-200">
                  {t(
                    'Ophthalmologist.dashboard.loadError',
                    'Unable to load the live ophthalmologist dashboard.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void metricsQuery.refetch();
                  }}
                  className="mt-3 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  {t('Ophthalmologist.common.retry', 'Retry')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top bar: Greeting + Mini Stats */}
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {greeting}, {displayName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.dashboard.subtitle',
                      'Your workspace — review queue and patient cases'
                    )}
                  </p>
                </div>
                <div className="shrink-0">
                  {metricsFirstLoad ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#1e3a5f] dark:bg-[#0a1f44]" />
                      <div className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#1e3a5f] dark:bg-[#0a1f44]" />
                    </div>
                  ) : (
                    <StatsCardGrid stats={metrics} />
                  )}
                </div>
              </div>

              {/* Main workspace: Queue (left) + Preview Panel (right) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                {/* LEFT: Review Queue */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-900/30">
                        <ClipboardList className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.dashboard.reviewQueue.title',
                            'Review Queue'
                          )}
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t(
                            'Ophthalmologist.dashboard.reviewQueue.description',
                            'Cases sorted by risk level and waiting time'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {queueRefetching && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {t(
                            'Ophthalmologist.dashboard.queue.updating',
                            'Updating...'
                          )}
                        </span>
                      )}
                      <Link
                        to="/ophthalmologist/screenings"
                        className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
                      >
                        {t(
                          'Ophthalmologist.dashboard.reviewQueue.viewAll',
                          'View all screenings'
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void queueQuery.refetch();
                        }}
                        disabled={queueQuery.isFetching}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#1a2f4f] dark:hover:text-gray-300 disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${queueQuery.isFetching ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="mb-4">
                    <QueueFilters
                      active={activeFilter}
                      onChange={setActiveFilter}
                      counts={filterCounts}
                    />
                  </div>

                  {/* Queue List */}
                  {queueFirstLoad ? (
                    <div className="flex items-center justify-center py-10">
                      <Spinner size={28} />
                    </div>
                  ) : (
                    <ReviewQueue
                      items={filteredItems}
                      selectedId={selectedItem?.consultationSessionId ?? null}
                      onSelect={handleSelect}
                    />
                  )}
                </section>

                {/* RIGHT: Patient Preview Panel */}
                <aside className="hidden lg:block">
                  <div className="sticky top-6">
                    <PatientPreviewPanel item={selectedItem} />
                  </div>
                </aside>
              </div>

              {/* Mobile: show preview below queue when selected */}
              <div className="mt-4 lg:hidden">
                {selectedItem && <PatientPreviewPanel item={selectedItem} />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
