import { useEffect, useMemo, useState } from 'react';
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
  CheckCircle2,
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
import { hydrateFullScreeningData } from './retinal-analysis';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import i18n from '@/i18n/i18n';
import {
  isNormalDisease,
  toDisplayDiseaseName,
} from '@/features/patient/lib/disease-translation';
import useAuthStore from '@/store/auth-store';
import { useConsultationSessions } from '@/features/consultation/hooks';

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
const RESOURCE_SKELETON_COUNT = 3;
const MOCK_EDUCATIONAL_RESOURCES: PatientEducationalResourceItem[] = [
  {
    id: 'mock-eye-health-1',
    title: 'Huong dan cham soc mat sau khi nhan ket qua AI screening',
    description:
      'Cac buoc theo doi trieu chung, lich tai kham, va nhung dau hieu can gap bac si som.',
    link: 'https://www.nei.nih.gov/learn-about-eye-health',
    image: null,
  },
  {
    id: 'mock-eye-health-2',
    title: 'Tong hop benh vong mac thuong gap va cach phong ngua',
    description:
      'Kien thuc can ban ve ton thuong vong mac, yeu to nguy co, va khuyen nghi song khoe.',
    link: 'https://www.who.int/news-room/fact-sheets/detail/blindness-and-vision-impairment',
    image: null,
  },
  {
    id: 'mock-eye-health-3',
    title: 'Tai lieu hoi dap de chuan bi khi di kham mat',
    description:
      'Danh sach cau hoi nen trao doi voi bac si de hieu ro ket qua va huong dieu tri.',
    link: 'https://medlineplus.gov/eyediseases.html',
    image: null,
  },
];

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const patientId = user?.roleId ?? undefined;
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

  const { data: hydratedSession, isLoading: isHydratedSessionLoading } =
    useQuery({
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
            name:
              img.imageUrl.split('/').pop() ??
              t('PatientReview.labels.retinalImage', 'Retinal image'),
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
        const { anomalies, heatmapUrl, heatmapData } =
          await hydrateFullScreeningData(session.rawJsonOutput, firstImageUrl);

        const enrichedImages = mappedImages.map((img, idx) =>
          idx === 0
            ? { ...img, analyzed: true, anomalies, heatmapUrl, heatmapData }
            : { ...img, analyzed: true }
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
          images: enrichedImages,
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

  const {
    data: educationalResources = [],
    isLoading: isEducationalResourcesLoading,
    isFetching: isEducationalResourcesFetching,
  } = useQuery<PatientEducationalResourceItem[]>({
    queryKey: ['patient-eye-health-resources', diseaseKeywords],
    queryFn: () =>
      getEyeHealthResourcesForPatient({
        diseases: diseaseKeywords.length > 0 ? diseaseKeywords : undefined,
        limit: 3,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
  const [loadedResourceImageIds, setLoadedResourceImageIds] = useState<
    Record<string, boolean>
  >({});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
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
    : t('PatientReview.status.high', 'Needs Attention');
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

  const {
    data: linkedConsultationSessions,
    isLoading: isLinkedConsultationLoading,
    isFetching: isLinkedConsultationFetching,
  } = useConsultationSessions(
    {
      patientId,
      aiScreeningId: screeningId,
      pageNumber: 1,
      pageSize: 5,
    },
    {
      enabled: Boolean(patientId && screeningId),
    }
  );

  const latestLinkedConsultation =
    linkedConsultationSessions?.items?.[0] ?? null;
  const hasBookedOrConsultedThisCase =
    (linkedConsultationSessions?.totalCount ?? 0) > 0;
  const consultationProgressLabel = latestLinkedConsultation
    ? latestLinkedConsultation.statusName
    : null;
  const consultationBookedAtLabel = latestLinkedConsultation?.createdAt
    ? new Date(latestLinkedConsultation.createdAt).toLocaleString()
    : null;
  const rawJsonForAnalysis =
    activeState?.rawJsonOutput ??
    relevantStoredContext?.rawJsonOutput ??
    hydratedSession?.rawJsonOutput;
  const resultsPersisted =
    activeState?.resultsPersisted ??
    hydratedSession?.resultsPersisted ??
    Boolean(rawJsonForAnalysis);

  const patientFriendlyFindings = useMemo(() => {
    const isVietnamese = currentLanguage.toLowerCase().startsWith('vi');
    const labels = anomalies
      .filter((a) => !isNormalDisease(a.code ?? a.name))
      .map((a) => {
        if (isVietnamese) {
          const friendlyVi = a.friendlyName?.trim();
          if (friendlyVi) {
            return toDisplayDiseaseName(friendlyVi, currentLanguage).trim();
          }
          return toDisplayDiseaseName(a.name ?? '', currentLanguage).trim();
        }

        const friendlyEn = a.friendlyDescription?.trim();
        if (friendlyEn) {
          return toDisplayDiseaseName(friendlyEn, currentLanguage).trim();
        }

        return toDisplayDiseaseName(a.name ?? '', currentLanguage).trim();
      })
      .filter(Boolean);

    const deduped: string[] = [];
    const seen = new Set<string>();
    for (const label of labels) {
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(label);
    }
    return deduped;
  }, [anomalies, currentLanguage]);

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
  const isPageLoading = shouldHydrateFromApi && isHydratedSessionLoading;
  const showEducationalResourcesSkeleton =
    (isEducationalResourcesLoading || isEducationalResourcesFetching) &&
    educationalResources.length === 0;
  const displayedEducationalResources =
    educationalResources.length > 0
      ? educationalResources
      : MOCK_EDUCATIONAL_RESOURCES;

  const markResourceImageReady = (resourceId: string) => {
    setLoadedResourceImageIds((previous) =>
      previous[resourceId] ? previous : { ...previous, [resourceId]: true }
    );
  };

  const downloadPatientReportPdf = async () => {
    if (!screeningId || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const { blob, contentDisposition } =
        await screeningApi.downloadPatientReportPdf(screeningId);
      const fallbackFileName = `screening-report-${screeningId.slice(0, 8)}.pdf`;
      const fileNameFromHeader = contentDisposition
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.toLowerCase().startsWith('filename='))
        ?.split('=')[1]
        ?.replace(/^"|"$/g, '');
      const fileName = fileNameFromHeader || fallbackFileName;

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download patient screening PDF', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  /* guard: no route state */
  if (!activeState && !storedConsultationContext && !hydratedSession) {
    return (
      <FocusModeLayout
        currentStep="review"
        title={t('PatientReview.page.title', 'Review & Next Steps')}
        exitPath="/patient/screening"
        showQuotaBadge={false}
        showBreadcrumb={false}
      >
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-(--text-secondary) text-[15px]">
              {t('PatientReview.empty.description')}
            </p>
            <button
              onClick={() => navigate('/patient/screening/new')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t('PatientReview.actions.startNewScreening')}
            </button>
          </div>
        </div>
      </FocusModeLayout>
    );
  }

  return (
    <FocusModeLayout
      currentStep="review"
      title={t('PatientReview.page.title', 'Review & Next Steps')}
      exitPath="/patient/screening"
      showQuotaBadge={false}
      showBreadcrumb={false}
    >
      <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-(--text-primary)">
                {t('PatientReview.page.title')}
              </h1>
              <p className="text-(--text-secondary) font-medium text-lg">
                {t('PatientReview.page.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/patient/doctors')}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-brand/90 hover:shadow-md active:scale-95"
              >
                <CalendarCheck className="w-5 h-5" />
                {t(
                  'PatientDashboard.actions.bookNewAppointment',
                  'Book Appointment'
                )}
              </button>
            </div>
          </div>

          {isPageLoading ? (
            /* ── Hero Card Skeleton ── */
            <div className="w-full surface-primary rounded-2xl shadow-sm surface-border overflow-hidden flex flex-col md:flex-row">
              {/* Image skeleton */}
              <div className="skeleton-shimmer w-full md:w-1/3 min-h-[240px] bg-slate-200 dark:bg-slate-700" />
              {/* Content skeleton */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="skeleton-shimmer h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="skeleton-shimmer h-7 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="skeleton-shimmer h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="pt-4 border-t border-(--border-color)">
                  <div className="skeleton-shimmer h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full surface-primary rounded-2xl shadow-sm surface-border overflow-hidden flex flex-col md:flex-row">
              {/* Image */}
              <div className="w-full md:w-1/3 min-h-[240px] md:min-h-full bg-slate-900 relative group">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={t('PatientReview.labels.retinalScanAlt')}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    {t('PatientReview.labels.noImage')}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                  {eyeLabel}
                </div>
                <button
                  className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-lg text-white transition-colors"
                  title={t('PatientReview.actions.zoomImage')}
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
                        {t('PatientReview.labels.scanId', { id: scanId })}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {t('PatientReview.labels.capturedAt')}{' '}
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
                    {t('PatientReview.labels.aiAssessment')}
                  </h3>
                  <p className="text-(--text-secondary) leading-relaxed max-w-2xl">
                    {riskSummary}
                    {patientFriendlyFindings.length > 0 && (
                      <>
                        {' '}
                        {t(
                          'PatientReview.findingsDetected',
                          'Detected findings include:'
                        )}{' '}
                        <strong className="text-(--text-primary)">
                          {patientFriendlyFindings.slice(0, 4).join(', ')}
                          {patientFriendlyFindings.length > 4
                            ? t('PatientReview.findingsMore', {
                                count: patientFriendlyFindings.length - 4,
                                defaultValue: currentLanguage
                                  .toLowerCase()
                                  .startsWith('vi')
                                  ? ' và {{count}} dấu hiệu khác'
                                  : ' and {{count}} more findings',
                              })
                            : ''}
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
                        navigate('/patient/screening/new');
                        return;
                      }
                      navigate('/patient/analysis/details', {
                        state: {
                          screeningId,
                          rawJsonOutput: rawJsonForAnalysis,
                          resultsPersisted,
                          images,
                          anomalies,
                          riskLevel: effectiveRiskLevel,
                        },
                      });
                    }}
                    className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('PatientReview.actions.viewFullAnalysisDetails')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-(--text-primary)">
              {isPageLoading ? (
                <span className="skeleton-shimmer inline-block h-7 w-56 rounded bg-slate-200 dark:bg-slate-700" />
              ) : (
                t('PatientReview.sections.recommendedActions')
              )}
            </h2>

            {isPageLoading ? (
              /* ── Recommended Actions Skeleton ── */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Primary card skeleton */}
                <div className="col-span-1 md:col-span-3 lg:col-span-2 rounded-2xl p-6 md:p-8 border border-(--border-color) surface-primary space-y-5">
                  <div className="skeleton-shimmer h-5 w-36 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-7 w-64 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="skeleton-shimmer h-11 w-40 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="skeleton-shimmer h-11 w-44 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                {/* Secondary cards skeleton */}
                <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={`action-skeleton-${i}`}
                      className="surface-primary rounded-2xl p-4 border border-(--border-color) flex items-center gap-4"
                    >
                      <div className="skeleton-shimmer w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="skeleton-shimmer h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                      <div className="skeleton-shimmer w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* PRIMARY — Book Consultation */}
                <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-[#1e3a5f] rounded-2xl p-6 md:p-8 shadow-sm border border-primary/20 dark:border-primary/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.2] pointer-events-none">
                    <Stethoscope className="w-44 h-44 text-primary" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    <div className="max-w-md">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
                        {t('PatientReview.labels.primaryRecommendation')}
                      </div>
                      <h3 className="text-2xl font-bold text-(--text-primary) mb-2">
                        {t('PatientReview.actions.bookConsultation')}
                      </h3>
                      <p className="text-(--text-secondary) leading-relaxed">
                        {t('PatientReview.descriptions.bookConsultation')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {hasBookedOrConsultedThisCase ? (
                        <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                {t(
                                  'PatientReview.consultation.alreadyBookedTitle',
                                  'You already submitted this case for consultation'
                                )}
                              </p>
                              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                {t(
                                  'PatientReview.consultation.alreadyBookedDescription',
                                  'To avoid duplicate bookings, specialist booking and AI chat are locked for this case.'
                                )}
                              </p>
                              {(consultationProgressLabel ||
                                consultationBookedAtLabel) && (
                                <p className="pt-1 text-xs font-medium text-emerald-700/90 dark:text-emerald-200/90">
                                  {consultationProgressLabel
                                    ? `${t('PatientReview.consultation.statusLabel', 'Status')}: ${consultationProgressLabel}`
                                    : ''}
                                  {consultationProgressLabel &&
                                  consultationBookedAtLabel
                                    ? ' • '
                                    : ''}
                                  {consultationBookedAtLabel
                                    ? `${t('PatientReview.consultation.createdAtLabel', 'Booked at')}: ${consultationBookedAtLabel}`
                                    : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              navigate('/patient/doctors', {
                                state: {
                                  consultationContext,
                                },
                              })
                            }
                            disabled={
                              isLinkedConsultationLoading ||
                              isLinkedConsultationFetching
                            }
                            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                          >
                            <CalendarCheck className="w-5 h-5" />
                            {t('PatientReview.actions.findSpecialist')}
                          </button>
                          <button
                            onClick={openN8nChat}
                            disabled={
                              isLinkedConsultationLoading ||
                              isLinkedConsultationFetching
                            }
                            className="flex items-center justify-center gap-2 surface-primary hover:bg-gray-50 dark:hover:bg-[#2d4a6f] text-(--text-primary) font-semibold py-3 px-6 rounded-xl surface-border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Bot className="w-5 h-5" />
                            {t('PatientReview.actions.askAuraAssistant')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECONDARY actions column */}
                <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
                  <SecondaryActionCard
                    icon={<FileDown className="w-5 h-5" />}
                    iconBg="bg-blue-50 text-blue-600"
                    title={
                      isDownloadingPdf
                        ? t(
                            'PatientReview.actions.downloadingReport',
                            'Downloading report...'
                          )
                        : t('PatientReview.actions.downloadReport')
                    }
                    subtitle={t('PatientReview.labels.pdfFormat')}
                    actionIcon={<FileDown className="w-4 h-4" />}
                    onClick={downloadPatientReportPdf}
                  />

                  <SecondaryActionCard
                    icon={<ImagePlus className="w-5 h-5" />}
                    iconBg="bg-emerald-50 text-emerald-600"
                    title={t('PatientReview.actions.newScan')}
                    subtitle={t('PatientReview.descriptions.startNewAnalysis')}
                    actionIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate('/patient/screening/new')}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="border-t border-(--border-color) pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--text-primary)">
                {t('PatientReview.sections.learnMore')}
              </h2>
              <a
                href="https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/diabetic-retinopathy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
              >
                {t('PatientReview.actions.viewAllResources')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {showEducationalResourcesSkeleton
                ? Array.from({ length: RESOURCE_SKELETON_COUNT }).map(
                    (_, index) => (
                      <div
                        key={`resource-skeleton-${index}`}
                        className="flex flex-col"
                      >
                        <div className="skeleton-shimmer h-40 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3" />
                        <div className="skeleton-shimmer h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                        <div className="skeleton-shimmer h-3 w-full rounded bg-slate-200 dark:bg-slate-700 mb-1.5" />
                        <div className="skeleton-shimmer h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    )
                  )
                : displayedEducationalResources.map((resource) => {
                    const resourceId = String(resource.id);
                    const isResourceImageLoaded = Boolean(
                      loadedResourceImageIds[resourceId]
                    );

                    return (
                      <a
                        key={resource.id}
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col group"
                      >
                        <div className="relative h-40 rounded-xl bg-gray-200 dark:bg-slate-700 overflow-hidden mb-3">
                          {!isResourceImageLoaded && (
                            <div className="absolute inset-0 skeleton-shimmer bg-slate-200 dark:bg-slate-700" />
                          )}
                          <img
                            src={resource.image || FALLBACK_RESOURCE_IMAGE}
                            alt={resource.title}
                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                              isResourceImageLoaded
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                            onLoad={() => markResourceImageReady(resourceId)}
                            onError={() => markResourceImageReady(resourceId)}
                          />
                        </div>
                        <h4 className="font-bold text-(--text-primary) mb-1 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-(--text-secondary) line-clamp-2">
                          {resource.description}
                        </p>
                      </a>
                    );
                  })}
            </div>
          </section>

          <footer className="pb-6 pt-4 border-t border-(--border-color)">
            <div className="text-center text-sm text-(--text-muted) space-y-1">
              <p>
                <strong className="text-(--text-secondary)">Important:</strong>{' '}
                {t('PatientReview.footer.importantDisclaimer')}
              </p>
              <p>
                {t('PatientReview.footer.copyright', {
                  year: new Date().getFullYear(),
                })}
              </p>
            </div>
          </footer>
        </div>
      </div>
      {!hasBookedOrConsultedThisCase ? (
        <N8nChatWidget consultationContext={consultationContext} />
      ) : null}
    </FocusModeLayout>
  );
}
