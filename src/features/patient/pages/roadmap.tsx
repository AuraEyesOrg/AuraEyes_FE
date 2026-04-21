import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  FileDown,
  FileSearch,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PatientLayout from '../components/PatientLayout';
import { formatShortDate } from '@/lib/date-utils';
import { getRoadmaps } from '../api/patient.api';
import { generateHealthRoadmapPdf } from '../utils/roadmapPdfGenerator';
import type { HealthRoadmap } from '../types';
import { getLocaleFromPathname, withLocalePathname } from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const riskLevelStyle: Record<
  HealthRoadmap['riskLevel'],
  {
    badge: string;
    panel: string;
    dot: string;
  }
> = {
  LOW: {
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/50',
    panel:
      'border-emerald-200 bg-emerald-50/70 dark:border-emerald-700/50 dark:bg-emerald-900/20',
    dot: 'bg-emerald-600',
  },
  MEDIUM: {
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/50',
    panel:
      'border-amber-200 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-900/20',
    dot: 'bg-amber-500',
  },
  HIGH: {
    badge:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700/50',
    panel:
      'border-orange-200 bg-orange-50/70 dark:border-orange-700/50 dark:bg-orange-900/20',
    dot: 'bg-orange-500',
  },
  CRITICAL: {
    badge:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/50',
    panel:
      'border-red-200 bg-red-50/70 dark:border-red-700/50 dark:bg-red-900/20',
    dot: 'bg-red-600',
  },
};

const warningKeywords = [
  'blurred vision',
  'vision loss',
  'dark spots',
  'severe pain',
  'flashes',
  'floaters',
  'redness',
  'sudden',
  'headache',
  'double vision',
];

const highlightMedicalKeywords = (text: string) => {
  const escaped = warningKeywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`(${escaped.join('|')})`, 'ig');
  const segments = text.split(pattern);

  return segments.map((segment, index) => {
    const isKeyword = warningKeywords.some(
      (keyword) => segment.toLowerCase() === keyword.toLowerCase()
    );

    if (!isKeyword) {
      return <Fragment key={`${segment}-${index}`}>{segment}</Fragment>;
    }

    return (
      <mark
        key={`${segment}-${index}`}
        className="bg-(--roadmap-warning-highlight-bg) text-(--roadmap-warning-highlight-text) font-semibold rounded px-1"
      >
        {segment}
      </mark>
    );
  });
};

export default function RoadmapPage() {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const currentLocale = getLocaleFromPathname(location.pathname) ?? 'vi';
  const [isDownloadingRoadmapPdf, setIsDownloadingRoadmapPdf] = useState(false);

  const roadmapQuery = useQuery({
    queryKey: ['patient', 'roadmaps'],
    queryFn: getRoadmaps,
  });

  const latestRoadmap = useMemo(
    () => roadmapQuery.data?.[0] ?? null,
    [roadmapQuery.data]
  );

  const localizedPath = (pathname: string) =>
    withLocalePathname(currentLocale, pathname);

  const ctaLinks = useMemo(() => {
    const fallbackDiagnosisPath = `${localizedPath('/patient/screening')}?openDiagnosis=latest`;

    return {
      viewDiagnosis: latestRoadmap?.screeningId
        ? `${localizedPath('/patient/screening')}?screeningId=${latestRoadmap.screeningId}`
        : fallbackDiagnosisPath,
    };
  }, [currentLocale, latestRoadmap?.screeningId]);

  const handleDownloadRoadmapPdf = async () => {
    if (!latestRoadmap || isDownloadingRoadmapPdf) {
      return;
    }

    try {
      setIsDownloadingRoadmapPdf(true);
      await generateHealthRoadmapPdf(latestRoadmap);
      toast.success(
        t(
          'PatientRoadmap.toast.downloadPdfSuccess',
          'Roadmap PDF downloaded successfully.'
        )
      );
    } catch (error) {
      console.error('Failed to download roadmap PDF:', error);
      toast.error(
        t(
          'PatientRoadmap.toast.downloadPdfFailed',
          'Failed to download roadmap PDF. Please try again.'
        )
      );
    } finally {
      setIsDownloadingRoadmapPdf(false);
    }
  };

  const timelineItems = useMemo(() => {
    if (!latestRoadmap) {
      return [];
    }

    return [
      {
        phase: t('PatientRoadmap.timeline.phases.today', 'Today'),
        title: t(
          'PatientRoadmap.timeline.titles.immediateActions',
          'Immediate Actions'
        ),
        bullets:
          latestRoadmap.nextSteps.length > 0
            ? latestRoadmap.nextSteps.slice(0, 2)
            : [
                t(
                  'PatientRoadmap.timeline.fallbacks.immediateActions',
                  'Review your roadmap summary and monitor symptoms closely.'
                ),
              ],
      },
      {
        phase: latestRoadmap.followUp.needed
          ? latestRoadmap.followUp.timeframe ||
            t('PatientRoadmap.timeline.phases.followUpInTwoWeeks', 'In 2 weeks')
          : t(
              'PatientRoadmap.timeline.phases.followUpOptional',
              'Follow-up optional'
            ),
        title: t(
          'PatientRoadmap.timeline.titles.followUpPlan',
          'Follow-up Plan'
        ),
        bullets: latestRoadmap.followUp.needed
          ? [
              latestRoadmap.followUp.timeframe ||
                t(
                  'PatientRoadmap.timeline.fallbacks.followUpNeeded',
                  'Schedule follow-up based on your doctor instructions.'
                ),
            ]
          : [
              t(
                'PatientRoadmap.timeline.fallbacks.followUpNotNeeded',
                'No urgent follow-up required unless symptoms worsen.'
              ),
            ],
      },
      {
        phase: t('PatientRoadmap.timeline.phases.ongoing', 'Ongoing'),
        title: t(
          'PatientRoadmap.timeline.titles.lifestyleRoutine',
          'Lifestyle Routine'
        ),
        bullets:
          latestRoadmap.lifestyleAdvice.length > 0
            ? latestRoadmap.lifestyleAdvice.slice(0, 2)
            : [
                t(
                  'PatientRoadmap.timeline.fallbacks.lifestyleRoutine',
                  'Continue healthy eye-care habits and regular rest.'
                ),
              ],
      },
    ];
  }, [latestRoadmap, t]);

  if (roadmapQuery.isLoading) {
    return (
      <PatientLayout>
        <div className="space-y-5 animate-pulse">
          <div className="h-32 rounded-2xl bg-(--bg-secondary)" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="h-96 lg:col-span-8 rounded-2xl bg-(--bg-secondary)" />
            <div className="h-96 lg:col-span-4 rounded-2xl bg-(--bg-secondary)" />
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
                {t('PatientRoadmap.error.title', 'Unable to load roadmap')}
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {t(
                  'PatientRoadmap.error.description',
                  'Please refresh the page or try again later.'
                )}
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
        <div className="medical-card space-y-3">
          <h1 className="text-2xl font-bold text-(--text-primary)">
            {t('PatientRoadmap.page.title', 'Health Roadmap')}
          </h1>
          <p className="text-(--text-secondary)">
            {t(
              'PatientRoadmap.empty.description',
              'Your personalized roadmap will appear after your doctor finalizes a diagnosis.'
            )}
          </p>
        </div>
      </PatientLayout>
    );
  }

  const sourceBadge =
    latestRoadmap.source === 'DOCTOR_OVERRIDE'
      ? {
          label: t(
            'PatientRoadmap.sourceBadges.doctorReviewed',
            'Doctor Reviewed'
          ),
          icon: <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />,
          className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-200',
        }
      : {
          label: t('PatientRoadmap.sourceBadges.aiGenerated', 'AI Generated'),
          icon: <Sparkles className="w-4.5 h-4.5 text-brand" />,
          className:
            'border-(--border-color) bg-(--bg-secondary) text-(--text-secondary)',
        };

  const riskStyle = riskLevelStyle[latestRoadmap.riskLevel];
  const riskLevelLabel = t(
    `PatientRoadmap.risk.levels.${latestRoadmap.riskLevel}`,
    latestRoadmap.riskLevel
  );

  return (
    <PatientLayout>
      <div className="space-y-6">
        <section className={`medical-card border-2 ${riskStyle.panel}`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`px-5 py-2 border rounded-2xl text-lg font-bold tracking-wide ${riskStyle.badge}`}
                >
                  {t('PatientRoadmap.risk.badge', '{{risk}} Risk', {
                    risk: riskLevelLabel,
                  })}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${riskStyle.dot}`} />
                <span className="text-sm text-(--text-secondary)">
                  {t('PatientRoadmap.generatedOn', 'Generated on {{date}}', {
                    date: formatShortDate(latestRoadmap.generatedAt),
                  })}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-(--text-primary)">
                {t('PatientRoadmap.page.title', 'Health Roadmap')}
              </h1>

              <p className="text-base text-(--text-secondary) leading-relaxed line-clamp-2">
                {latestRoadmap.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-xl ${sourceBadge.className}`}
                >
                  {sourceBadge.icon}
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    {sourceBadge.label}
                  </span>
                </div>
                {latestRoadmap.source === 'DOCTOR_OVERRIDE' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-200 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    {t(
                      'PatientRoadmap.sourceBadges.doctorVerified',
                      'Doctor Verified'
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 min-w-60">
              <Link
                to={ctaLinks.viewDiagnosis}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm font-semibold hover:bg-(--bg-secondary) transition-colors"
              >
                <FileSearch className="w-4.5 h-4.5" />
                {t('PatientRoadmap.actions.viewDiagnosis', 'View Diagnosis')}
              </Link>
              <button
                type="button"
                onClick={handleDownloadRoadmapPdf}
                disabled={isDownloadingRoadmapPdf}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm font-semibold hover:bg-(--bg-secondary) transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4.5 h-4.5" />
                {isDownloadingRoadmapPdf
                  ? t('PatientRoadmap.actions.preparingPdf', 'Preparing PDF...')
                  : t('PatientRoadmap.actions.downloadPdf', 'Download PDF')}
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <article className="medical-card border-2 border-brand/25 bg-(--bg-primary)">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4.5 h-4.5 text-brand" />
                <h2 className="text-xl font-semibold text-(--text-primary)">
                  {t('PatientRoadmap.sections.nextSteps.title', 'Next Steps')}
                </h2>
              </div>
              {latestRoadmap.nextSteps.length === 0 ? (
                <p className="text-sm text-(--text-muted)">
                  {t(
                    'PatientRoadmap.sections.nextSteps.empty',
                    'No immediate next steps were generated.'
                  )}
                </p>
              ) : (
                <ol className="space-y-3">
                  {latestRoadmap.nextSteps.map((step, index) => (
                    <li
                      key={`${step}-${index}`}
                      className="flex gap-3 p-3 rounded-xl bg-(--bg-secondary) border border-(--border-color)"
                    >
                      <span className="mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full bg-(--roadmap-step-chip-bg) text-(--roadmap-step-chip-text) text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-sm text-(--text-primary) leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </article>

            <article className="medical-card border border-(--border-color)">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="w-4.5 h-4.5 text-(--text-secondary)" />
                <h2 className="text-lg font-semibold text-(--text-primary)">
                  {t(
                    'PatientRoadmap.sections.lifestyleAdvice.title',
                    'Lifestyle Advice'
                  )}
                </h2>
              </div>
              {latestRoadmap.lifestyleAdvice.length === 0 ? (
                <p className="text-sm text-(--text-muted)">
                  {t(
                    'PatientRoadmap.sections.lifestyleAdvice.empty',
                    'No lifestyle guidance was generated.'
                  )}
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {latestRoadmap.lifestyleAdvice.map((advice, index) => (
                    <li
                      key={`${advice}-${index}`}
                      className="text-sm text-(--text-secondary) leading-relaxed"
                    >
                      • {advice}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <article className="medical-card border border-(--roadmap-warning-border) bg-(--roadmap-warning-bg)">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4.5 h-4.5 text-(--roadmap-warning-title)" />
                <h2 className="text-lg font-semibold text-(--roadmap-warning-title)">
                  {t(
                    'PatientRoadmap.sections.warningSigns.title',
                    'Warning Signs'
                  )}
                </h2>
              </div>
              {latestRoadmap.warningSigns.length === 0 ? (
                <p className="text-sm text-(--roadmap-warning-item-text)">
                  {t(
                    'PatientRoadmap.sections.warningSigns.empty',
                    'No warning signs were listed.'
                  )}
                </p>
              ) : (
                <ul className="space-y-3">
                  {latestRoadmap.warningSigns.map((sign, index) => (
                    <li
                      key={`${sign}-${index}`}
                      className="rounded-xl border border-(--roadmap-warning-item-border) bg-(--roadmap-warning-item-bg) px-3 py-2 text-sm text-(--roadmap-warning-item-text) leading-relaxed"
                    >
                      {highlightMedicalKeywords(sign)}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="medical-card border border-(--roadmap-followup-border) bg-(--roadmap-followup-bg)">
              <div className="flex items-start gap-3">
                <CalendarClock className="w-4.5 h-4.5 text-(--roadmap-followup-icon) mt-1" />
                <div>
                  <h2 className="text-base font-semibold text-(--text-primary)">
                    {t(
                      'PatientRoadmap.followUp.title',
                      'Follow-up Recommendation'
                    )}
                  </h2>
                  <p className="text-sm text-(--text-secondary) mt-1">
                    {latestRoadmap.followUp.needed
                      ? t(
                          'PatientRoadmap.followUp.needed',
                          'Follow-up is recommended: {{timeframe}}',
                          {
                            timeframe:
                              latestRoadmap.followUp.timeframe ||
                              t(
                                'PatientRoadmap.followUp.timeframeFallback',
                                'Please contact your doctor for schedule details.'
                              ),
                          }
                        )
                      : t(
                          'PatientRoadmap.followUp.notNeeded',
                          'No immediate follow-up is required.'
                        )}
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <section className="medical-card">
          <div className="flex items-center gap-2 mb-5">
            <CalendarClock className="w-4.5 h-4.5 text-brand" />
            <h2 className="text-xl font-semibold text-(--text-primary)">
              {t('PatientRoadmap.timeline.title', 'Care Timeline')}
            </h2>
          </div>

          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={`${item.phase}-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand mt-2" />
                  {index < timelineItems.length - 1 && (
                    <span className="mt-2 w-px h-full bg-(--border-color)" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold tracking-wide uppercase text-brand">
                      {item.phase}
                    </span>
                    <h3 className="text-sm font-semibold text-(--text-primary)">
                      {item.title}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="text-sm text-(--text-secondary)"
                      >
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-(--text-muted) mt-4">
            {t(
              'PatientRoadmap.followUp.disclaimer',
              'Clinical diagnosis and treatment decisions remain under doctor responsibility. This roadmap is patient-facing guidance.'
            )}
          </p>
        </section>
      </div>
    </PatientLayout>
  );
}
