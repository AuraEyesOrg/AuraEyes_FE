import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FocusModeLayout from '../components/FocusModeLayout';
import { Anomaly, RetinalImage } from '../types/type';
import N8nChatWidget, { openN8nChat } from '../components/N8nChatWidget';
import {
  ShieldCheck,
  AlertTriangle,
  CalendarCheck,
  FileDown,
  ImagePlus,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  ChevronRight,
  Stethoscope,
  Bot,
} from 'lucide-react';
import { SecondaryActionCard } from '../components';
import {
  loadScreeningConsultationContext,
  saveScreeningConsultationContext,
  type ScreeningConsultationContext,
} from '../types/consultation-context';
import { screeningApi } from '../api/screening.api';
import {
  getEyeHealthResourcesForPatient,
  type PatientEducationalResourceItem,
} from '../api/patient.api';
import { hydrateConsultationPreviewAnomalies } from './retinal-analysis';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import i18n from '@/i18n/i18n';
import {
  isNormalDisease,
  toDisplayDiseaseName,
} from '@/features/patient/lib/disease-translation';

interface LocationState {
  screeningId?: string;
  images?: RetinalImage[];
  anomalies?: Anomaly[];
  riskLevel?: 'low' | 'moderate' | 'high';
  riskScore?: number;
  rawJsonOutput?: string;
  resultsPersisted?: boolean;
}

const RISK_STYLE_CONFIG = {
  low: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
  },
  moderate: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  },
  high: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  },
};

const FALLBACK_RESOURCE_IMAGE =
  'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80';

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'vi';
  const state = location.state as LocationState | null;
  const storedConsultationContext = useMemo(
    () => loadScreeningConsultationContext(),
    []
  );

  const activeState = state ?? null;
  const screeningIdFromRoute = activeState?.screeningId;

  const storedMatchesCurrent =
    storedConsultationContext?.screeningId != null &&
    storedConsultationContext.screeningId ===
      (screeningIdFromRoute ?? storedConsultationContext.screeningId);

  const relevantStoredContext = storedMatchesCurrent
    ? storedConsultationContext
    : null;

  const screeningIdFromRouteOrStore =
    screeningIdFromRoute ?? storedConsultationContext?.screeningId;

  const shouldHydrateFromApi =
    Boolean(screeningIdFromRouteOrStore) &&
    (activeState?.images?.length ?? 0) === 0 &&
    (activeState?.anomalies?.length ?? 0) === 0 &&
    (relevantStoredContext?.images?.length ?? 0) === 0 &&
    (relevantStoredContext?.anomalies?.length ?? 0) === 0;

  const { data: hydratedSession } = useQuery({
    queryKey: ['patient-screening-review', screeningIdFromRouteOrStore],
    enabled: shouldHydrateFromApi,
    queryFn: async () => {
      if (!screeningIdFromRouteOrStore) return null;
      const response = await screeningApi.getSessionById(
        screeningIdFromRouteOrStore
      );
      const session = response.data;
      if (!session) return null;

      const mappedImages: RetinalImage[] = (session.images ?? []).map(
        (img) => ({
          id: img.id,
          url: img.imageUrl,
          name: img.imageUrl.split('/').pop() ?? 'Retinal image',
          eye:
            img.eyeSide?.toLowerCase() === 'right'
              ? 'Right Eye (OD)'
              : img.eyeSide?.toLowerCase() === 'left'
                ? 'Left Eye (OS)'
                : 'Both Eyes',
          uploadedAt: img.capturedAt,
          analyzed: false,
          anomalies: [],
        })
      );

      const firstImageUrl = mappedImages[0]?.url;
      const anomalies = await hydrateConsultationPreviewAnomalies(
        session.rawJsonOutput,
        firstImageUrl
      );

      const normalizedRiskLevel =
        session.latestResult?.riskLevel?.toLowerCase();
      const riskLevel: 'low' | 'moderate' | 'high' =
        normalizedRiskLevel === 'moderate'
          ? 'moderate'
          : normalizedRiskLevel === 'high'
            ? 'high'
            : 'low';

      return {
        screeningId: session.screeningId,
        images: mappedImages,
        anomalies,
        riskLevel,
        riskScore: session.latestResult?.confidenceScore,
        rawJsonOutput: session.rawJsonOutput,
        resultsPersisted: Boolean(session.latestResult),
      };
    },
  });
  const images =
    activeState?.images ??
    relevantStoredContext?.images ??
    hydratedSession?.images ??
    [];
  const anomalies =
    activeState?.anomalies ??
    relevantStoredContext?.anomalies ??
    hydratedSession?.anomalies ??
    [];

  // Derive disease keywords from anomaly data for SerpApi search.
  // Prefer friendlyName (e.g. "Bệnh võng mạc tiểu đường") over the raw ML label.
  const diseaseKeywords = useMemo(
    () =>
      anomalies
        .slice()
        .sort((a, b) => b.confidence - a.confidence)
        .map((a) => a.friendlyName?.trim() || a.name.trim())
        .filter(Boolean),
    [anomalies]
  );

  const { data: educationalResources = [] } = useQuery<
    PatientEducationalResourceItem[]
  >({
    queryKey: ['patient-eye-health-resources', diseaseKeywords],
    queryFn: () =>
      getEyeHealthResourcesForPatient({
        diseases: diseaseKeywords.length > 0 ? diseaseKeywords : undefined,
        limit: 3,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
  const riskLevel =
    activeState?.riskLevel ??
    relevantStoredContext?.riskLevel ??
    hydratedSession?.riskLevel ??
    'low';
  const primaryAnomaly =
    anomalies.find((a) => a.isHighest) ??
    (anomalies.length > 0
      ? [...anomalies].sort((a, b) => b.confidence - a.confidence)[0]
      : null);
  const isPrimaryNormal =
    primaryAnomaly != null
      ? isNormalDisease(primaryAnomaly.name)
      : anomalies.length === 0;
  const showHealthyStatus = isPrimaryNormal && riskLevel === 'low';
  const effectiveRiskLevel: 'low' | 'moderate' | 'high' =
    !isPrimaryNormal && riskLevel === 'low' ? 'moderate' : riskLevel;
  const riskStyle = RISK_STYLE_CONFIG[effectiveRiskLevel];
  const riskLabel = showHealthyStatus
    ? t('PatientReview.status.healthy', 'Looks Healthy')
    : effectiveRiskLevel === 'high'
      ? t('PatientReview.status.high', 'Needs Attention')
      : effectiveRiskLevel === 'moderate'
        ? t('PatientReview.status.moderate', 'Needs Review')
        : t('PatientReview.status.low', 'Low Risk');
  const riskSummary = showHealthyStatus
    ? t(
        'PatientReview.summary.healthy',
        'Your scan looks healthy. No significant concerns were found - keep up with regular eye check-ups.'
      )
    : effectiveRiskLevel === 'high'
      ? t(
          'PatientReview.summary.high',
          'We found areas worth discussing with an eye specialist. Early attention is the best path to protecting your vision.'
        )
      : effectiveRiskLevel === 'moderate'
        ? t(
            'PatientReview.summary.moderate',
            'Findings were detected and should be reviewed by an eye specialist for confirmation and next steps.'
          )
        : t(
            'PatientReview.summary.low',
            'Low-risk findings were detected. Keep regular follow-up with your eye specialist.'
          );
  const screeningId =
    activeState?.screeningId ??
    relevantStoredContext?.screeningId ??
    hydratedSession?.screeningId;
  const rawJsonForAnalysis =
    activeState?.rawJsonOutput ??
    relevantStoredContext?.rawJsonOutput ??
    hydratedSession?.rawJsonOutput;
  const resultsPersisted =
    activeState?.resultsPersisted ??
    hydratedSession?.resultsPersisted ??
    Boolean(rawJsonForAnalysis);

  const primaryAiConfidence = useMemo(() => {
    if (anomalies.length === 0) return null;
    const primary = anomalies.find((a) => a.isHighest);
    if (primary != null) return primary.confidence;
    return Math.max(...anomalies.map((a) => a.confidence));
  }, [anomalies]);

  const consultationContext =
    useMemo<ScreeningConsultationContext | null>(() => {
      if (!screeningId) return null;
      return {
        screeningId,
        images,
        anomalies,
        riskLevel: effectiveRiskLevel,
        riskScore:
          activeState?.riskScore ??
          relevantStoredContext?.riskScore ??
          hydratedSession?.riskScore ??
          undefined,
        rawJsonOutput:
          activeState?.rawJsonOutput ??
          relevantStoredContext?.rawJsonOutput ??
          hydratedSession?.rawJsonOutput,
        createdAt: new Date().toISOString(),
      };
    }, [
      screeningId,
      images,
      anomalies,
      effectiveRiskLevel,
      activeState?.riskScore,
      activeState?.rawJsonOutput,
      relevantStoredContext?.riskScore,
      relevantStoredContext?.rawJsonOutput,
      hydratedSession?.riskScore,
      hydratedSession?.rawJsonOutput,
    ]);

  useEffect(() => {
    if (!consultationContext) return;
    saveScreeningConsultationContext(consultationContext);
  }, [consultationContext]);

  const thumbnail = images[0]?.url;
  const eyeLabel = images[0]?.eye ?? 'Left Eye (OS)';
  const scanId = screeningId?.slice(0, 8);

  /* guard: no route state */
  if (!activeState && !storedConsultationContext && !hydratedSession) {
    return (
      <FocusModeLayout
        currentStep="review"
        title="Review & Next Steps"
        exitPath="/patient/screening/new"
        showBreadcrumb={false}
      >
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-(--text-secondary) text-[15px]">
              No analysis results to review. Please start a new screening first.
            </p>
            <button
              onClick={() => navigate('/patient/screening/new')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start New Screening
            </button>
          </div>
        </div>
      </FocusModeLayout>
    );
  }

  return (
    <FocusModeLayout
      currentStep="review"
      title="Review & Next Steps"
      exitPath="/patient/screening/new"
      showBreadcrumb={false}
    >
      <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-(--text-primary)">
                Review &amp; Next Actions
              </h1>
              <p className="text-(--text-secondary) text-lg">
                Analysis complete. Please review your results and recommended
                next steps.
              </p>
            </div>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-(--border-color) bg-white hover:bg-slate-50 text-(--text-primary) font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('PatientReview.backToDashboard', 'Back to Dashboard')}
            </button>
          </div>

          <div className="w-full surface-primary rounded-2xl shadow-sm surface-border overflow-hidden flex flex-col md:flex-row">
            {/* Image */}
            <div className="w-full md:w-1/3 min-h-[240px] md:min-h-full bg-slate-900 relative group">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Retinal scan"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  No image
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                {eyeLabel}
              </div>
              <button
                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-lg text-white transition-colors"
                title="Zoom Image"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-(--text-secondary) font-medium mb-0.5">
                      Scan ID: {scanId}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      Captured:{' '}
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${riskStyle.color} ${riskStyle.bg} border ${riskStyle.border}`}
                  >
                    {riskStyle.icon}
                    {riskLabel}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-(--text-primary)">
                  AI Assessment
                </h3>
                <p className="text-(--text-secondary) leading-relaxed max-w-2xl">
                  {riskSummary}
                  {anomalies.length > 0 && (
                    <>
                      {' '}
                      {t(
                        'PatientReview.findingsDetected',
                        'Detected findings include:'
                      )}{' '}
                      <strong className="text-(--text-primary)">
                        {anomalies
                          .map((a) =>
                            toDisplayDiseaseName(a.name, currentLanguage)
                          )
                          .join(', ')}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-(--border-color)">
                <button
                  onClick={() => {
                    if (!screeningId && images.length === 0) {
                      navigate('/patient/analysis');
                      return;
                    }
                    navigate('/patient/analysis', {
                      state: {
                        screeningId,
                        rawJsonOutput: rawJsonForAnalysis,
                        resultsPersisted,
                        images: images.map((img) => ({
                          id: img.id,
                          name: img.name,
                          preview: img.url,
                        })),
                      },
                    });
                  }}
                  className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  View Full Analysis Details
                </button>
                {primaryAiConfidence != null && (
                  <>
                    <span className="text-(--border-color)">|</span>
                    <span className="text-xs text-(--text-muted)">
                      AI Confidence: {primaryAiConfidence}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-(--text-primary)">
              Recommended Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* PRIMARY — Book Consultation */}
              <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-[#1e3a5f] rounded-2xl p-6 md:p-8 shadow-sm border border-primary/20 dark:border-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.2] pointer-events-none">
                  <Stethoscope className="w-44 h-44 text-primary" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
                      Primary Recommendation
                    </div>
                    <h3 className="text-2xl font-bold text-(--text-primary) mb-2">
                      Book a Consultation
                    </h3>
                    <p className="text-(--text-secondary) leading-relaxed">
                      Connect with a certified ophthalmologist to review these
                      results in detail. Early intervention is key to
                      maintaining eye health.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        navigate('/patient/doctors', {
                          state: {
                            consultationContext,
                          },
                        })
                      }
                      className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Find a Specialist
                    </button>
                    <button
                      onClick={openN8nChat}
                      className="flex items-center justify-center gap-2 surface-primary hover:bg-gray-50 dark:hover:bg-[#2d4a6f] text-(--text-primary) font-semibold py-3 px-6 rounded-xl surface-border transition-colors"
                    >
                      <Bot className="w-5 h-5" />
                      Ask AURA AI Assistant
                    </button>
                  </div>
                </div>
              </div>

              {/* SECONDARY actions column */}
              <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
                <SecondaryActionCard
                  icon={<FileDown className="w-5 h-5" />}
                  iconBg="bg-blue-50 text-blue-600"
                  title="Download Report"
                  subtitle="PDF Format"
                  actionIcon={<FileDown className="w-4 h-4" />}
                />

                <SecondaryActionCard
                  icon={<ImagePlus className="w-5 h-5" />}
                  iconBg="bg-emerald-50 text-emerald-600"
                  title="New Scan"
                  subtitle="Start a new analysis"
                  actionIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => navigate('/patient/screening/new')}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-(--border-color) pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--text-primary)">
                Learn More About Your Eyes
              </h2>
              <a
                href="https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/diabetic-retinopathy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
              >
                View all resources
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col group"
                >
                  <div className="h-40 rounded-xl bg-gray-200 dark:bg-slate-700 overflow-hidden mb-3">
                    <img
                      src={resource.image || FALLBACK_RESOURCE_IMAGE}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-bold text-(--text-primary) mb-1 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-(--text-secondary) line-clamp-2">
                    {resource.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          <footer className="pb-6 pt-4 border-t border-(--border-color)">
            <div className="text-center text-sm text-(--text-muted) space-y-1">
              <p>
                <strong className="text-(--text-secondary)">Important:</strong>{' '}
                AURA is an AI-assisted screening tool and does not provide a
                definitive medical diagnosis.
              </p>
              <p>
                &copy; {new Date().getFullYear()} AURA Health. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
      <N8nChatWidget />
    </FocusModeLayout>
  );
}
