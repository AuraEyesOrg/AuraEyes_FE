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
                Unable to load roadmap
              </h2>
              <p className="text-sm text-(--text-secondary)">
                Please refresh the page or try again later.
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
            Health Roadmap
          </h1>
          <p className="text-(--text-secondary)">
            Your personalized roadmap will appear after your doctor finalizes a
            diagnosis.
          </p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Health Roadmap
        </h1>
        <p className="text-(--text-secondary)">
          Personalized guidance generated from your doctor diagnosis and AI
          screening context.
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
                {latestRoadmap.riskLevel} RISK
              </span>
            </div>
            <p className="text-(--text-primary) text-lg font-semibold">
              {latestRoadmap.summary}
            </p>
            <div className="text-sm text-(--text-muted)">
              Generated on {formatShortDate(latestRoadmap.generatedAt)}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-xl">
            <ShieldAlert className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-(--text-secondary)">
              Source: {latestRoadmap.source}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">Next Steps</h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.nextSteps,
            'No immediate next steps were generated.'
          )}
        </section>

        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">
              Lifestyle Advice
            </h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.lifestyleAdvice,
            'No lifestyle guidance was generated.'
          )}
        </section>

        <section className="medical-card space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-(--text-primary)">
              Warning Signs
            </h2>
          </div>
          {renderGuidanceList(
            latestRoadmap.warningSigns,
            'No warning signs were listed.'
          )}
        </section>
      </div>

      <section className="medical-card border-brand/20 bg-brand-soft/40">
        <div className="flex items-start gap-3">
          <CalendarClock className="w-5 h-5 text-brand mt-0.5" />
          <div>
            <h2 className="font-semibold text-(--text-primary)">
              Follow-up Recommendation
            </h2>
            <p className="text-sm text-(--text-secondary) mt-1">
              {latestRoadmap.followUp.needed
                ? `Follow-up is recommended: ${latestRoadmap.followUp.timeframe || 'Please contact your doctor for schedule details.'}`
                : 'No immediate follow-up is required.'}
            </p>
            <p className="text-xs text-(--text-muted) mt-3">
              Clinical diagnosis and treatment decisions remain under doctor
              responsibility. This roadmap is patient-facing guidance.
            </p>
          </div>
        </div>
      </section>
    </PatientLayout>
  );
}
