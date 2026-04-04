import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { formatShortDate } from '@/lib/date-utils';
import { getRoadmaps } from '../api/patient.api';
import type { HealthRoadmap } from '../types';
import { useTranslation } from 'react-i18next';

const riskLevelStyle: Record<HealthRoadmap['riskLevel'], string> = {
  LOW: 'bg-green-500/15 text-green-400 border-green-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const renderGuidanceList = (items: string[], emptyText: string) => {
  if (items.length === 0) {
    return <p className="text-sm text-(--text-muted)">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="text-sm text-(--text-secondary) bg-(--bg-secondary) border border-(--border-color) rounded-xl px-3 py-2"
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default function RoadmapPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const roadmapQuery = useQuery({
    queryKey: ['patient', 'roadmaps'],
    queryFn: getRoadmaps,
  });

  const latestRoadmap = useMemo(
    () => roadmapQuery.data?.[0] ?? null,
    [roadmapQuery.data]
  );

  if (roadmapQuery.isLoading) {
    return (
      <PatientLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-(--bg-secondary)" />
          <div className="h-40 rounded-2xl bg-(--bg-secondary)" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-64 rounded-2xl bg-(--bg-secondary)" />
            <div className="h-64 rounded-2xl bg-(--bg-secondary)" />
            <div className="h-64 rounded-2xl bg-(--bg-secondary)" />
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (roadmapQuery.error) {
    return (
      <PatientLayout>
        <div className="medical-card border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h2 className="font-semibold text-(--text-primary)">
                {t('PatientRoadmap.error.title')}
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {t('PatientRoadmap.error.description')}
              </p>
            </div>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!latestRoadmap) {
    return (
      <PatientLayout>
        <div className="medical-card">
          <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
            {t('PatientRoadmap.page.title')}
          </h1>
          <p className="text-(--text-secondary)">
            {t('PatientRoadmap.empty.description')}
          </p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          {t('PatientRoadmap.page.title')}
        </h1>
        <p className="text-(--text-secondary)">
          {t('PatientRoadmap.page.subtitle')}
        </p>
      </div>

      <div className="medical-card bg-brand-soft border-brand/20 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" />
              <span
                className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${riskLevelStyle[latestRoadmap.riskLevel]}`}
              >
                {t('PatientRoadmap.risk.badge', {
                  risk: t(
                    `PatientRoadmap.risk.levels.${latestRoadmap.riskLevel}`
                  ),
                })}
              </span>
            </div>
            <p className="text-(--text-primary) text-lg font-semibold">
              {latestRoadmap.summary}
            </p>
            <div className="text-sm text-(--text-muted)">
              {t('PatientRoadmap.generatedOn', {
                date: formatShortDate(latestRoadmap.generatedAt),
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-xl">
            <ShieldAlert className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-(--text-secondary)">
              {t('PatientRoadmap.source', { source: latestRoadmap.source })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">
              {t('PatientRoadmap.sections.nextSteps.title')}
            </h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.nextSteps,
            t('PatientRoadmap.sections.nextSteps.empty')
          )}
        </section>

        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">
              {t('PatientRoadmap.sections.lifestyleAdvice.title')}
            </h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.lifestyleAdvice,
            t('PatientRoadmap.sections.lifestyleAdvice.empty')
          )}
        </section>

        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">
              {t('PatientRoadmap.sections.warningSigns.title')}
            </h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.warningSigns,
            t('PatientRoadmap.sections.warningSigns.empty')
          )}
        </section>
      </div>

      <section className="medical-card border-brand/20 bg-brand-soft/40">
        <div className="flex items-start gap-3">
          <CalendarClock className="w-5 h-5 text-brand mt-0.5" />
          <div>
            <h2 className="font-semibold text-(--text-primary)">
              {t('PatientRoadmap.followUp.title')}
            </h2>
            <p className="text-sm text-(--text-secondary) mt-1">
              {latestRoadmap.followUp.needed
                ? t('PatientRoadmap.followUp.needed', {
                    timeframe:
                      latestRoadmap.followUp.timeframe ||
                      t('PatientRoadmap.followUp.timeframeFallback'),
                  })
                : t('PatientRoadmap.followUp.notNeeded')}
            </p>
            <p className="text-xs text-(--text-muted) mt-3">
              {t('PatientRoadmap.followUp.disclaimer')}
            </p>
          </div>
        </div>
      </section>
    </PatientLayout>
  );
}
