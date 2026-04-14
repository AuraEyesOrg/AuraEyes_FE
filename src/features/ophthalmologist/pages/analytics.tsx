import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import { useConsultationSessions } from '@/features/consultation/hooks';
import { formatRelativeTime } from '@/lib/date-utils';
import {
  getOphthalmologistDashboardMetrics,
  type OphthalmologistDashboardMetrics,
} from '../api/dashboard.api';
import {
  listOphthalmologistScreenings,
  type OphthalmologistScreeningListItemDto,
} from '../api/ophthalmologist-screenings.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type ActivityItem = {
  day: string;
  screenings: number;
  reviews: number;
};

type ConditionItem = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

const CONDITION_COLORS = [
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
];

const REVIEWED_STATUSES = new Set([
  'reviewed',
  'approved',
  'rejected',
  'flagged',
]);

const HIGH_RISK_LEVELS = new Set(['high', 'critical']);

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDateKeyFromIso = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return toDateKey(date);
};

const toPercent = (numerator: number, denominator: number) =>
  denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;

const calcChange = (current: number, previous: number) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getChangeClass = (change: number) =>
  change >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-500 dark:text-red-400';

const toChangeLabel = (change: number) =>
  `${change > 0 ? '+' : ''}${Math.abs(change)}%`;

const getMostCommonModelVersion = (
  screenings: OphthalmologistScreeningListItemDto[],
  notAvailableLabel: string
) => {
  if (screenings.length === 0) return notAvailableLabel;
  const counts = new Map<string, number>();
  for (const item of screenings) {
    const key = item.modelVersion?.trim() || notAvailableLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    notAvailableLabel
  );
};

const isReviewed = (status: string | null | undefined) =>
  REVIEWED_STATUSES.has((status ?? '').trim().toLowerCase());

const isHighRisk = (riskLevel: string | null | undefined) =>
  HIGH_RISK_LEVELS.has((riskLevel ?? '').trim().toLowerCase());

export default function AnalyticsPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const currentDoctorId = user?.roleId ?? '';

  const metricsQuery = useQuery({
    queryKey: ['ophthalmologist-analytics', 'dashboard-metrics'],
    queryFn: getOphthalmologistDashboardMetrics,
  });

  const screeningsQuery = useQuery({
    queryKey: ['ophthalmologist-analytics', 'screenings'],
    queryFn: listOphthalmologistScreenings,
    enabled: Boolean(currentDoctorId),
  });

  const sessionsQuery = useConsultationSessions(
    {
      ophthalmologistId: currentDoctorId || undefined,
      pageSize: 200,
    },
    { enabled: Boolean(currentDoctorId) }
  );

  const screenings = screeningsQuery.data ?? [];
  const sessions = sessionsQuery.data?.items ?? [];
  const metrics: OphthalmologistDashboardMetrics | null =
    metricsQuery.data ?? null;

  const {
    screeningsThisWeek,
    patientsThisWeek,
    confidenceThisWeek,
    urgentThisWeek,
    screeningsChange,
    patientsChange,
    confidenceChange,
    urgentChange,
    weeklyActivity,
    conditionBreakdown,
    reviewedRate,
    highRiskRate,
    modelVersion,
    recentActivity,
  } = useMemo(() => {
    const now = new Date();
    const startCurrent = new Date(now);
    startCurrent.setHours(0, 0, 0, 0);
    startCurrent.setDate(startCurrent.getDate() - 6);

    const startPrevious = new Date(startCurrent);
    startPrevious.setDate(startPrevious.getDate() - 7);
    const endPrevious = new Date(startCurrent);
    endPrevious.setDate(endPrevious.getDate() - 1);

    const isInRange = (
      value: string | null | undefined,
      start: Date,
      end: Date
    ) => {
      if (!value) return false;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return false;
      return d >= start && d <= end;
    };

    const currentWeekScreenings = screenings.filter((s) =>
      isInRange(s.createdAt, startCurrent, now)
    );
    const previousWeekScreenings = screenings.filter((s) =>
      isInRange(s.createdAt, startPrevious, endPrevious)
    );

    const currentWeekSessions = sessions.filter((s) =>
      isInRange(s.createdAt, startCurrent, now)
    );
    const previousWeekSessions = sessions.filter((s) =>
      isInRange(s.createdAt, startPrevious, endPrevious)
    );

    const patientsCurrent = new Set(currentWeekSessions.map((s) => s.patientId))
      .size;
    const patientsPrevious = new Set(
      previousWeekSessions.map((s) => s.patientId)
    ).size;

    const avgConfidence = (items: OphthalmologistScreeningListItemDto[]) => {
      const confidence = items
        .map((s) => s.confidenceScore)
        .filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
      if (confidence.length === 0) return 0;
      const normalized = confidence.map((v) => (v > 0 && v <= 1 ? v * 100 : v));
      return Math.round(
        normalized.reduce((sum, v) => sum + v, 0) / normalized.length
      );
    };

    const currentConfidence = avgConfidence(currentWeekScreenings);
    const previousConfidence = avgConfidence(previousWeekScreenings);

    const urgentCurrent = currentWeekScreenings.filter((s) =>
      isHighRisk(s.latestRiskLevel)
    ).length;
    const urgentPrevious = previousWeekScreenings.filter((s) =>
      isHighRisk(s.latestRiskLevel)
    ).length;

    const activity: ActivityItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const dayKey = toDateKey(day);
      const weekday = day.getDay();
      const dayLabel =
        weekday === 0
          ? t('Ophthalmologist.analytics.weekday.sun', 'Sun')
          : weekday === 1
            ? t('Ophthalmologist.analytics.weekday.mon', 'Mon')
            : weekday === 2
              ? t('Ophthalmologist.analytics.weekday.tue', 'Tue')
              : weekday === 3
                ? t('Ophthalmologist.analytics.weekday.wed', 'Wed')
                : weekday === 4
                  ? t('Ophthalmologist.analytics.weekday.thu', 'Thu')
                  : weekday === 5
                    ? t('Ophthalmologist.analytics.weekday.fri', 'Fri')
                    : t('Ophthalmologist.analytics.weekday.sat', 'Sat');

      const dayScreenings = screenings.filter(
        (s) => getDateKeyFromIso(s.createdAt) === dayKey
      ).length;

      const dayReviews = screenings.filter((s) => {
        if (!isReviewed(s.reviewStatus)) return false;
        const sourceDate = s.processedAt ?? s.createdAt;
        return getDateKeyFromIso(sourceDate) === dayKey;
      }).length;

      activity.push({
        day: dayLabel,
        screenings: dayScreenings,
        reviews: dayReviews,
      });
    }

    const conditionCounter = new Map<string, number>();
    for (const s of screenings) {
      const label =
        s.aiPrimaryLabel?.trim() ||
        s.latestRiskLevel?.trim() ||
        t('Ophthalmologist.analytics.unknown', 'Unknown');
      conditionCounter.set(label, (conditionCounter.get(label) ?? 0) + 1);
    }

    const conditions: ConditionItem[] = [...conditionCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        count,
        percentage: toPercent(count, screenings.length),
        color: CONDITION_COLORS[index % CONDITION_COLORS.length],
      }));

    const reviewedCount = screenings.filter((s) =>
      isReviewed(s.reviewStatus)
    ).length;
    const highRiskCount = screenings.filter((s) =>
      isHighRisk(s.latestRiskLevel)
    ).length;

    const activityFeed = [...screenings]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((item) => {
        const reviewed = isReviewed(item.reviewStatus);
        const highRisk = isHighRisk(item.latestRiskLevel);
        const icon = reviewed ? CheckCircle : highRisk ? AlertTriangle : Eye;
        const color = reviewed
          ? 'text-emerald-500'
          : highRisk
            ? 'text-amber-500'
            : 'text-blue-500';

        const message = reviewed
          ? t(
              'Ophthalmologist.analytics.activity.reviewedScreening',
              `Reviewed screening for ${item.patientName}`
            )
          : highRisk
            ? t(
                'Ophthalmologist.analytics.activity.flaggedHighRisk',
                `Flagged high-risk case for ${item.patientName}`
              )
            : t(
                'Ophthalmologist.analytics.activity.newScreeningReceived',
                `New screening received from ${item.patientName}`
              );

        return {
          message,
          time: formatRelativeTime(item.createdAt),
          icon,
          color,
        };
      });

    return {
      screeningsThisWeek: currentWeekScreenings.length,
      patientsThisWeek: patientsCurrent,
      confidenceThisWeek: currentConfidence,
      urgentThisWeek: urgentCurrent,
      screeningsChange: calcChange(
        currentWeekScreenings.length,
        previousWeekScreenings.length
      ),
      patientsChange: calcChange(patientsCurrent, patientsPrevious),
      confidenceChange: calcChange(currentConfidence, previousConfidence),
      urgentChange: calcChange(urgentCurrent, urgentPrevious),
      weeklyActivity: activity,
      conditionBreakdown: conditions,
      reviewedRate: toPercent(reviewedCount, screenings.length),
      highRiskRate: toPercent(highRiskCount, screenings.length),
      modelVersion: getMostCommonModelVersion(
        screenings,
        t('Ophthalmologist.analytics.notAvailable', 'N/A')
      ),
      recentActivity: activityFeed,
    };
  }, [screenings, sessions, t]);

  const maxScreenings = Math.max(1, ...weeklyActivity.map((d) => d.screenings));
  const isLoading =
    metricsQuery.isLoading ||
    screeningsQuery.isLoading ||
    sessionsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader
            pageName={t('Ophthalmologist.analytics.title', 'Analytics')}
          />
          <main className="p-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <Spinner size={40} className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.analytics.loading',
                    'Loading analytics...'
                  )}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const hasAnyData = screenings.length > 0 || sessions.length > 0;

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.analytics.title', 'Analytics')}
        />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('Ophthalmologist.analytics.title', 'Analytics')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(
                'Ophthalmologist.analytics.subtitle',
                'Performance metrics and insights'
              )}
            </p>
          </div>

          {/* Compact Stats */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {screeningsThisWeek}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.analytics.stats.screeningsThisWeek',
                  'Screenings This Week'
                )}
              </span>
              <span
                className={`text-[11px] font-semibold ${getChangeClass(screeningsChange)}`}
              >
                {toChangeLabel(screeningsChange)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {patientsThisWeek}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.analytics.stats.patientsServed',
                  'Patients Served'
                )}
              </span>
              <span
                className={`text-[11px] font-semibold ${getChangeClass(patientsChange)}`}
              >
                {toChangeLabel(patientsChange)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {confidenceThisWeek}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.analytics.stats.avgConfidence',
                  'Avg Confidence'
                )}
              </span>
              <span
                className={`text-[11px] font-semibold ${getChangeClass(confidenceChange)}`}
              >
                {toChangeLabel(confidenceChange)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {metrics?.urgentCases ?? urgentThisWeek}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.analytics.stats.urgentCases',
                  'Urgent Cases'
                )}
              </span>
              <span
                className={`text-[11px] font-semibold ${getChangeClass(urgentChange)}`}
              >
                {toChangeLabel(urgentChange)}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Weekly Activity Chart */}
            <div className="col-span-2 bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {t(
                  'Ophthalmologist.analytics.weeklyActivity',
                  'Weekly Activity'
                )}
              </h3>
              <div className="flex items-end justify-between gap-3 h-36">
                {weeklyActivity.map((day) => (
                  <div
                    key={day.day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex flex-col items-center gap-0.5 h-28 justify-end">
                      <div
                        className="w-6 bg-cyan-500 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max((day.screenings / maxScreenings) * 100, 0)}px`,
                        }}
                        title={`${day.screenings} ${t('Ophthalmologist.analytics.screenings', 'screenings')}`}
                      />
                      <div
                        className="w-6 bg-cyan-200 rounded-b-sm transition-all"
                        style={{
                          height: `${Math.max((day.reviews / maxScreenings) * 100, 0)}px`,
                        }}
                        title={`${day.reviews} ${t('Ophthalmologist.analytics.reviews', 'reviews')}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {day.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.analytics.legend.screenings',
                      'Screenings'
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-200 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.analytics.legend.reviewsCompleted',
                      'Reviews Completed'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                {t(
                  'Ophthalmologist.analytics.conditionBreakdown',
                  'Condition Breakdown'
                )}
              </h3>
              {conditionBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {conditionBreakdown.map((condition) => (
                    <div key={condition.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {condition.name}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {condition.count}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${condition.percentage}%`,
                            backgroundColor: condition.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.analytics.noConditionData',
                    'No condition distribution data yet.'
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* AI Performance */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {t(
                  'Ophthalmologist.analytics.aiModelPerformance',
                  'AI Model Performance'
                )}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t(
                      'Ophthalmologist.analytics.stats.avgConfidence',
                      'Avg Confidence'
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {confidenceThisWeek}%
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {confidenceChange >= 0 ? '+' : ''}
                    {confidenceChange}%{' '}
                    {t(
                      'Ophthalmologist.analytics.fromLastWeek',
                      'from last week'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t(
                      'Ophthalmologist.analytics.highRiskRatio',
                      'High Risk Ratio'
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {highRiskRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t(
                      'Ophthalmologist.analytics.basedOnReviewedScreenings',
                      'Based on reviewed screenings'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t(
                      'Ophthalmologist.analytics.reviewedRate',
                      'Reviewed Rate'
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {reviewedRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {screenings.length}{' '}
                    {t(
                      'Ophthalmologist.analytics.totalScreenings',
                      'total screenings'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a1929] rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t(
                      'Ophthalmologist.analytics.modelVersion',
                      'Model Version'
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {modelVersion}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t(
                      'Ophthalmologist.analytics.mostUsedRecentScreenings',
                      'Most used in recent screenings'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {t(
                  'Ophthalmologist.analytics.recentActivity',
                  'Recent Activity'
                )}
              </h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gray-50 dark:bg-[#0a1929] ${activity.color}`}
                      >
                        <activity.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.analytics.noRecentActivity',
                    'No recent screening activity.'
                  )}
                </p>
              )}
            </div>
          </div>

          {!hasAnyData && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-gray-300">
              {t(
                'Ophthalmologist.analytics.noData',
                'No analytics data available yet for this ophthalmologist.'
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
