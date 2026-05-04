import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  Mail,
  Network,
  Loader2,
  Stethoscope,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { postsApi } from '@/features/professional-network/api/network.api';
import { resolveAuthorType } from '@/features/professional-network/utils/authorType';
import { getDiseaseUrgency } from '@/features/patient/mock/disease-mapping';
import i18n from '@/i18n/i18n';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { aiCoreClient } from '@/lib/axios';
import useAuthStore from '@/store/auth-store';
import { unwrapApiData } from '@/types/api-response';

import { clinicScreeningApi } from '../api/screening.api';
import { clinicQueueApi, type ClinicFlowState } from '../api/queue.api';
import { ClinicRetinalViewerCard } from '../components/ClinicRetinalViewerCard';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { ClinicScreeningStepper } from '../components/ClinicScreeningStepper';
import type {
  AIStandardResponse,
  AiFindingItem,
  AnnotationMode,
  DetectionBox,
  ImageLayout,
  OrgScreeningSessionDetail,
  ResultDraft,
} from '../types/screening-result.types';
import {
  buildFindingsFromBoxes,
  buildFindingsText,
  buildSummary,
  clampConfidence,
  extractTopKFromRaw,
  extractVisualArtifactsFromRaw,
  getErrorMessage,
  mapAiFindings,
  mergeBoxesIntoRawJson,
  normalizeRiskLevel,
  riskConfig,
  splitFindingsAndNote,
  toRiskLevelFromUrgency,
} from '../utils/screening-result.util';

interface ScreeningResultLocationState {
  patientName?: string;
  autoAnalyze?: boolean;
}

type ShareTab = 'email' | 'network';

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const TEMPLATE_TOKEN_PATTERN = /{{\s*[\w.]+\s*}}/;

const hasTemplateToken = (value?: string): boolean =>
  typeof value === 'string' && TEMPLATE_TOKEN_PATTERN.test(value);

export default function ClinicStaffScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const screeningId = searchParams.get('id');
  const locationState = location.state as ScreeningResultLocationState | null;
  const locationPatientName = locationState?.patientName?.trim() ?? '';

  const currentLanguage = useMemo(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'vi',
    [i18n.language, i18n.resolvedLanguage]
  );

  const translateResultText = useCallback(
    (key: string, fallback: string, options?: TranslationParams) =>
      t(key, fallback, options),
    [t]
  );

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [enhancingAnalysis, setEnhancingAnalysis] = useState(false);
  const [sendingToDoctor, setSendingToDoctor] = useState(false);
  const [queueVisitId, setQueueVisitId] = useState<string | null>(null);
  const [bookedDoctorId, setBookedDoctorId] = useState<string | null>(null);
  const [currentFlowState, setCurrentFlowState] =
    useState<ClinicFlowState | null>(null);

  const [sessionData, setSessionData] =
    useState<OrgScreeningSessionDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | undefined>();
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const [aiFindings, setAiFindings] = useState<AiFindingItem[]>([]);
  const [detectedBoxes, setDetectedBoxes] = useState<DetectionBox[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | undefined>();
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [annotationMode, setAnnotationMode] =
    useState<AnnotationMode>('select');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTab, setShareTab] = useState<ShareTab>('email');
  const [sharingEmail, setSharingEmail] = useState(false);
  const [sharingNetwork, setSharingNetwork] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareIncludePdf, setShareIncludePdf] = useState(true);
  const [shareIncludeRetinalImages, setShareIncludeRetinalImages] =
    useState(false);
  const [consultationNote, setConsultationNote] = useState('');

  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoAnalyzeTriggeredRef = useRef(false);

  const selectedImage =
    sessionData?.images[selectedImageIndex] ?? sessionData?.images[0];
  const canSendToDoctor = Boolean(
    screeningId &&
    sessionData?.latestResult &&
    !sendingToDoctor &&
    currentFlowState !== 'SentToDoctor' &&
    currentFlowState !== 'ConsultationInProgress' &&
    currentFlowState !== 'Finalized'
  );
  const patientDisplayName =
    sessionData?.patientName?.trim() ||
    locationPatientName ||
    t('ClinicStaff.screeningResult.patientFallback', 'Patient');

  const hydrateVisualArtifacts = useCallback(
    (imageWidth: number, imageHeight: number) => {
      const { boxes, heatmapUrl: nextHeatmapUrl } =
        extractVisualArtifactsFromRaw(
          rawJsonOutput,
          imageWidth,
          imageHeight,
          currentLanguage
        );
      setDetectedBoxes(boxes);
      setHeatmapUrl(nextHeatmapUrl);
      if (!nextHeatmapUrl) {
        setShowHeatmap(false);
      }
    },
    [rawJsonOutput, currentLanguage]
  );

  const updateImageLayout = useCallback(() => {
    const imageElement = imageRef.current;
    const containerElement = imageContainerRef.current;
    if (!imageElement || !containerElement) return;

    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;
    const containerWidth = containerElement.clientWidth;
    const containerHeight = containerElement.clientHeight;

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      setImageLayout(null);
      setDetectedBoxes([]);
      return;
    }

    const scale = Math.min(
      containerWidth / naturalWidth,
      containerHeight / naturalHeight
    );
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;

    setImageLayout({
      offsetX: (containerWidth - renderedWidth) / 2,
      offsetY: (containerHeight - renderedHeight) / 2,
      width: renderedWidth,
      height: renderedHeight,
    });

    hydrateVisualArtifacts(naturalWidth, naturalHeight);
  }, [hydrateVisualArtifacts]);

  const hydrateStateFromSession = useCallback(
    (detail: OrgScreeningSessionDetail) => {
      const topK = extractTopKFromRaw(detail.rawJsonOutput);
      const mappedFindings = mapAiFindings(topK, currentLanguage);
      const generatedFindings = buildFindingsText(
        mappedFindings,
        translateResultText
      );

      setAiFindings(mappedFindings);
      setRawJsonOutput(detail.rawJsonOutput);
      setSelectedImageIndex((currentIndex) => {
        const maxIndex = Math.max(detail.images.length - 1, 0);
        return Math.min(currentIndex, maxIndex);
      });

      if (detail.latestResult) {
        const normalizedRiskLevel = normalizeRiskLevel(
          detail.latestResult.riskLevel
        );
        const parsedSavedFindings = splitFindingsAndNote(
          detail.latestResult.findings
        );
        const fallbackSummary = buildSummary(
          normalizedRiskLevel,
          mappedFindings[0]?.localizedName,
          translateResultText
        );
        const fallbackFindings =
          generatedFindings ||
          translateResultText(
            'ClinicStaff.screeningResult.findings.emptyFallback',
            'No significant AI findings were identified.'
          );

        const savedSummary = detail.latestResult.summary?.trim() ?? '';
        const savedFindings = parsedSavedFindings.findings?.trim() ?? '';

        setDraft({
          riskLevel: normalizedRiskLevel,
          confidenceScore: clampConfidence(detail.latestResult.confidenceScore),
          summary:
            savedSummary.length > 0 && !hasTemplateToken(savedSummary)
              ? savedSummary
              : fallbackSummary,
          findings:
            savedFindings.length > 0 && !hasTemplateToken(savedFindings)
              ? savedFindings
              : fallbackFindings,
        });
        return;
      }

      if (mappedFindings.length === 0) {
        setDraft(null);
        return;
      }

      const primaryFinding = mappedFindings[0];
      const riskLevel = toRiskLevelFromUrgency(
        getDiseaseUrgency(primaryFinding.name),
        primaryFinding.confidence
      );

      setDraft({
        riskLevel,
        confidenceScore: clampConfidence(primaryFinding.confidence),
        summary: buildSummary(
          riskLevel,
          primaryFinding.localizedName,
          translateResultText
        ),
        findings:
          generatedFindings ||
          translateResultText(
            'ClinicStaff.screeningResult.findings.emptyFallback',
            'No significant AI findings were identified.'
          ),
      });
    },
    [currentLanguage, translateResultText]
  );

  const loadSession = useCallback(
    async (showLoader = true) => {
      if (!screeningId) return;
      if (showLoader) setLoading(true);
      try {
        const response = await clinicScreeningApi.getSessionDetail(screeningId);
        const data = unwrapApiData<OrgScreeningSessionDetail>(response);
        setSessionData(data);
        hydrateStateFromSession(data);
      } catch (error) {
        setSessionData(null);
        toast.error(
          getErrorMessage(
            error,
            t(
              'ClinicStaff.screeningResult.toast.loadFailed',
              'Unable to load screening result.'
            )
          )
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [screeningId, hydrateStateFromSession, t]
  );

  const hydrateQueueContext = useCallback(async () => {
    if (!screeningId) return;

    try {
      const queueItems = await clinicQueueApi.getQueue();
      const queueItem = queueItems.find(
        (item) => item.screeningId === screeningId
      );

      setQueueVisitId(queueItem?.visitId ?? null);
      setBookedDoctorId(queueItem?.assignedDoctorId ?? null);
      setCurrentFlowState(queueItem?.flowState ?? null);
    } catch {
      setQueueVisitId(null);
      setBookedDoctorId(null);
      setCurrentFlowState(null);
    }
  }, [screeningId]);

  const runAiAnalysis = useCallback(async () => {
    if (!screeningId || !selectedImage?.imageUrl || analyzing) return;

    const analyzeToastId = toast.loading(
      t(
        'ClinicStaff.screeningResult.toast.analyzing',
        'Analyzing retinal image...'
      ),
      {
        closeButton: false,
      }
    );

    setAnalyzing(true);
    setEnhancingAnalysis(false);

    try {
      const imageResponse = await fetch(selectedImage.imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Unable to download retinal image for analysis.');
      }
      const imageBlob = await imageResponse.blob();
      const fileName =
        selectedImage.imageUrl.split('/').pop() ??
        `retinal-clinic-${Date.now().toString()}.jpg`;
      const file = new File([imageBlob], fileName, {
        type: imageBlob.type || 'image/jpeg',
      });

      const imageWidth = imageRef.current?.naturalWidth ?? 0;
      const imageHeight = imageRef.current?.naturalHeight ?? 0;

      const fastFormData = new FormData();
      fastFormData.append('file', file);
      fastFormData.append('topk', '5');

      const { data: fastData } = await aiCoreClient.post<AIStandardResponse>(
        '/api/v2/diagnosis/v2/analyze/fast',
        fastFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      let finalRawOutput = JSON.stringify(fastData);
      let finalMappedFindings = mapAiFindings(
        extractTopKFromRaw(finalRawOutput),
        currentLanguage
      );
      if (finalMappedFindings.length === 0) {
        throw new Error(
          t(
            'ClinicStaff.screeningResult.toast.noPredictionData',
            'AI service returned no prediction data.'
          )
        );
      }

      let finalVisualArtifacts = extractVisualArtifactsFromRaw(
        finalRawOutput,
        imageWidth,
        imageHeight,
        currentLanguage
      );
      let primaryFinding = finalMappedFindings[0];
      let finalRiskLevel = toRiskLevelFromUrgency(
        getDiseaseUrgency(primaryFinding.name),
        primaryFinding.confidence
      );
      let finalDraft: ResultDraft = {
        riskLevel: finalRiskLevel,
        confidenceScore: clampConfidence(primaryFinding.confidence),
        summary: buildSummary(
          finalRiskLevel,
          primaryFinding.localizedName,
          translateResultText
        ),
        findings:
          buildFindingsText(finalMappedFindings, translateResultText) ||
          buildFindingsFromBoxes(
            finalVisualArtifacts.boxes,
            translateResultText
          ),
      };

      setAiFindings(finalMappedFindings);
      setRawJsonOutput(finalRawOutput);
      setDetectedBoxes(finalVisualArtifacts.boxes);
      setHeatmapUrl(finalVisualArtifacts.heatmapUrl);
      setShowHighlights(true);
      setDraft(finalDraft);

      setEnhancingAnalysis(true);
      try {
        const fullFormData = new FormData();
        fullFormData.append('file', file);
        fullFormData.append('threshold', '0.55');
        fullFormData.append('topk', '5');

        const { data: fullData } = await aiCoreClient.post<AIStandardResponse>(
          '/api/v2/diagnosis/v2/analyze',
          fullFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const fullRawOutput = JSON.stringify(fullData);
        const fullMappedFindings = mapAiFindings(
          extractTopKFromRaw(fullRawOutput),
          currentLanguage
        );

        if (fullMappedFindings.length > 0) {
          const fullVisualArtifacts = extractVisualArtifactsFromRaw(
            fullRawOutput,
            imageWidth,
            imageHeight,
            currentLanguage
          );
          const fullPrimaryFinding = fullMappedFindings[0];
          const fullRiskLevel = toRiskLevelFromUrgency(
            getDiseaseUrgency(fullPrimaryFinding.name),
            fullPrimaryFinding.confidence
          );

          finalRawOutput = fullRawOutput;
          finalMappedFindings = fullMappedFindings;
          finalVisualArtifacts = fullVisualArtifacts;
          finalDraft = {
            riskLevel: fullRiskLevel,
            confidenceScore: clampConfidence(fullPrimaryFinding.confidence),
            summary: buildSummary(
              fullRiskLevel,
              fullPrimaryFinding.localizedName,
              translateResultText
            ),
            findings:
              buildFindingsText(fullMappedFindings, translateResultText) ||
              buildFindingsFromBoxes(
                fullVisualArtifacts.boxes,
                translateResultText
              ),
          };

          setAiFindings(fullMappedFindings);
          setRawJsonOutput(fullRawOutput);
          setDetectedBoxes(fullVisualArtifacts.boxes);
          setHeatmapUrl(fullVisualArtifacts.heatmapUrl);
          setDraft(finalDraft);
        }
      } catch (fullAnalyzeError) {
        console.warn(
          'Clinic full AI analysis failed, fallback to fast result:',
          fullAnalyzeError
        );
      } finally {
        setEnhancingAnalysis(false);
      }

      await clinicScreeningApi.saveResults(screeningId, {
        rawJsonOutput: mergeBoxesIntoRawJson(
          finalRawOutput,
          finalVisualArtifacts.boxes
        ),
        riskLevel: finalDraft.riskLevel,
        confidenceScore: finalDraft.confidenceScore,
        summary: finalDraft.summary,
        findings: finalDraft.findings,
      });

      await loadSession(false);

      toast.update(analyzeToastId, {
        render: t(
          'ClinicStaff.screeningResult.toast.analyzeSuccess',
          'AI analysis completed successfully.'
        ),
        type: 'success',
        isLoading: false,
        autoClose: 2800,
        closeButton: true,
      });
    } catch (error) {
      toast.update(analyzeToastId, {
        render: getErrorMessage(
          error,
          t(
            'ClinicStaff.screeningResult.toast.analyzeFailed',
            'AI analysis failed. Please try again.'
          )
        ),
        type: 'error',
        isLoading: false,
        autoClose: 3200,
        closeButton: true,
      });
    } finally {
      setAnalyzing(false);
      setEnhancingAnalysis(false);
    }
  }, [
    analyzing,
    currentLanguage,
    loadSession,
    screeningId,
    selectedImage?.imageUrl,
    t,
    translateResultText,
  ]);

  const handleShareEmail = useCallback(async () => {
    if (!screeningId || !sessionData || sharingEmail) return;

    if (!shareIncludePdf && !shareIncludeRetinalImages) {
      toast.error(
        t(
          'ClinicStaff.screeningResult.toast.selectShareOption',
          'Please select at least one item to share.'
        )
      );
      return;
    }

    const trimmedEmail = shareEmail.trim();
    if (sessionData.isWalkIn && !trimmedEmail) {
      toast.error(
        t(
          'ClinicStaff.screeningResult.toast.walkInEmailRequired',
          'Please enter recipient email for walk-in patient.'
        )
      );
      return;
    }

    setSharingEmail(true);
    try {
      const response = await clinicScreeningApi.shareSessionResult(
        screeningId,
        {
          recipientEmail: trimmedEmail || undefined,
          includePdf: shareIncludePdf,
          includeRetinalImages: shareIncludeRetinalImages,
        }
      );
      const shareResult = unwrapApiData(response);
      toast.success(
        t(
          'ClinicStaff.screeningResult.toast.shareEmailSuccess',
          'Result sent to {{email}}.',
          {
            email: shareResult.recipientEmail,
          }
        )
      );
      setShareModalOpen(false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            'ClinicStaff.screeningResult.toast.shareEmailFailed',
            'Unable to share result at this time.'
          )
        )
      );
    } finally {
      setSharingEmail(false);
    }
  }, [
    screeningId,
    sessionData,
    sharingEmail,
    shareIncludePdf,
    shareIncludeRetinalImages,
    shareEmail,
    t,
  ]);

  const buildNetworkShareContent = useCallback(() => {
    if (!sessionData || !draft) return '';

    const topFindings = aiFindings.slice(0, 3);
    const findingText =
      topFindings.length > 0
        ? topFindings.map((item) => `- ${item.localizedName}`).join('\n')
        : `- ${t(
            'ClinicStaff.screeningResult.network.noFindings',
            'No clear abnormal findings'
          )}`;

    return [
      t(
        'ClinicStaff.screeningResult.network.title',
        'AI screening case shared by clinic coordinator'
      ),
      t('ClinicStaff.screeningResult.network.session', 'Session: {{id}}...', {
        id: sessionData.screeningId.slice(0, 8),
      }),
      t('ClinicStaff.screeningResult.network.risk', 'Risk level: {{risk}}', {
        risk: draft.riskLevel,
      }),
      '',
      t('ClinicStaff.screeningResult.network.summaryLabel', 'Summary:'),
      draft.summary,
      '',
      t('ClinicStaff.screeningResult.network.findingsLabel', 'Top findings:'),
      findingText,
      '',
      t(
        'ClinicStaff.screeningResult.network.noteLabel',
        'Coordinator note: {{note}}',
        {
          note:
            consultationNote.trim() ||
            t('ClinicStaff.screeningResult.network.noteEmpty', 'Not provided'),
        }
      ),
    ].join('\n');
  }, [aiFindings, consultationNote, draft, sessionData, t]);

  const handleShareToNetwork = useCallback(async () => {
    if (!sessionData || !draft || sharingNetwork) return;

    setSharingNetwork(true);
    try {
      const formData = new FormData();
      formData.append('content', buildNetworkShareContent());
      formData.append(
        'authorType',
        resolveAuthorType(user?.roles, 'Organisation')
      );
      formData.append('isPublic', 'true');

      await postsApi.createPost(formData);
      toast.success(
        t(
          'ClinicStaff.screeningResult.toast.shareNetworkSuccess',
          'Case shared to Professional Network successfully.'
        )
      );
      setShareModalOpen(false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            'ClinicStaff.screeningResult.toast.shareNetworkFailed',
            'Unable to post to Professional Network.'
          )
        )
      );
    } finally {
      setSharingNetwork(false);
    }
  }, [
    buildNetworkShareContent,
    draft,
    sessionData,
    sharingNetwork,
    t,
    user?.roles,
  ]);

  const handleSendToBookedDoctor = useCallback(async () => {
    if (!screeningId) return;
    if (!sessionData?.latestResult) {
      toast.info(
        t(
          'ClinicStaff.screeningResult.toast.sendToDoctorRequiresAi',
          'Please complete AI analysis first.'
        )
      );
      return;
    }
    if (!queueVisitId || !bookedDoctorId) {
      toast.error(
        t(
          'ClinicStaff.screeningResult.toast.bookedDoctorMissing',
          'Bệnh nhân chưa có bác sĩ trong booking. Vui lòng kiểm tra lại lịch hẹn.'
        )
      );
      return;
    }

    setSendingToDoctor(true);
    try {
      await clinicQueueApi.sendToDoctor(queueVisitId, {
        screeningId,
        doctorId: bookedDoctorId,
      });
      setCurrentFlowState('SentToDoctor');
      toast.success(
        t(
          'ClinicStaff.screeningResult.toast.sendToDoctorSuccess',
          'Case sent to doctor successfully.'
        )
      );
      queryClient.invalidateQueries({ queryKey: ['clinic-staff', 'queue'] });
      void hydrateQueueContext();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            'ClinicStaff.screeningResult.toast.sendToDoctorFailed',
            'Unable to send this case to doctor.'
          )
        )
      );
    } finally {
      setSendingToDoctor(false);
    }
  }, [
    bookedDoctorId,
    hydrateQueueContext,
    queueVisitId,
    screeningId,
    sessionData?.latestResult,
    t,
  ]);

  useEffect(() => {
    autoAnalyzeTriggeredRef.current = false;
  }, [screeningId]);

  useEffect(() => {
    if (!screeningId) {
      setLoading(false);
      return;
    }
    void loadSession(true);
    void hydrateQueueContext();
  }, [screeningId, loadSession, hydrateQueueContext]);

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, [updateImageLayout]);

  useEffect(() => {
    updateImageLayout();
  }, [selectedImage?.imageUrl, rawJsonOutput, updateImageLayout]);

  useEffect(() => {
    if (!shareModalOpen || !sessionData) return;
    setShareTab('email');
    setShareEmail(sessionData.isWalkIn ? '' : (sessionData.patientEmail ?? ''));
    setShareIncludePdf(true);
    setShareIncludeRetinalImages(false);
  }, [shareModalOpen, sessionData]);

  useEffect(() => {
    if (
      !locationState?.autoAnalyze ||
      autoAnalyzeTriggeredRef.current ||
      !sessionData ||
      !selectedImage?.imageUrl ||
      analyzing ||
      enhancingAnalysis
    ) {
      return;
    }

    autoAnalyzeTriggeredRef.current = true;
    void runAiAnalysis();
  }, [
    locationState?.autoAnalyze,
    sessionData,
    selectedImage?.imageUrl,
    analyzing,
    enhancingAnalysis,
    runAiAnalysis,
  ]);

  if (!screeningId) {
    return (
      <ClinicStaffLayout>
        <div className="text-sm text-red-500">
          {t(
            'ClinicStaff.screeningResult.states.missingId',
            'Missing screening id.'
          )}
        </div>
      </ClinicStaffLayout>
    );
  }

  if (loading) {
    return (
      <ClinicStaffLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-(--text-secondary)">
              {t(
                'ClinicStaff.screeningResult.states.loading',
                'Loading screening result...'
              )}
            </p>
          </div>
        </div>
      </ClinicStaffLayout>
    );
  }

  if (!sessionData) {
    return (
      <ClinicStaffLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <p className="text-sm font-semibold text-(--text-primary)">
              {t(
                'ClinicStaff.screeningResult.states.notFound',
                'Screening session not found.'
              )}
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(resolvePathWithLocale('/clinic-staff/screenings'))
              }
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              {t(
                'ClinicStaff.screeningResult.actions.backToList',
                'Back to screening list'
              )}
            </button>
          </div>
        </div>
      </ClinicStaffLayout>
    );
  }

  const riskLevel = draft?.riskLevel ?? 'Low';
  const risk = riskConfig[riskLevel] ?? riskConfig.Low;
  const RiskIcon = risk.icon;

  return (
    <ClinicStaffLayout>
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-(--text-primary)">
                {t(
                  'ClinicStaff.screeningResult.header.title',
                  'Screening Result'
                )}
              </h1>
              <p className="text-sm text-(--text-tertiary)">
                {t('ClinicStaff.screeningResult.header.patient', 'Patient')}:{' '}
                {patientDisplayName} ·{' '}
                {t('ClinicStaff.screeningResult.header.session', 'Session')}{' '}
                {sessionData.screeningId.slice(0, 8)}... ·{' '}
                {new Date(sessionData.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void runAiAnalysis()}
                disabled={analyzing || enhancingAnalysis || !selectedImage}
                className="inline-flex min-w-[148px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-2.5 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing || enhancingAnalysis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {analyzing
                  ? t(
                      'ClinicStaff.screeningResult.actions.analyzing',
                      'Analyzing...'
                    )
                  : enhancingAnalysis
                    ? t(
                        'ClinicStaff.screeningResult.actions.refining',
                        'Refining...'
                      )
                    : t(
                        'ClinicStaff.screeningResult.actions.reanalyze',
                        'Re-analyze'
                      )}
              </button>

              <button
                type="button"
                onClick={() => void handleSendToBookedDoctor()}
                disabled={!canSendToDoctor}
                className="inline-flex min-w-[164px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Stethoscope className="h-4 w-4" />
                {sendingToDoctor
                  ? t(
                      'ClinicStaff.screeningResult.actions.sendingToDoctor',
                      'Sending...'
                    )
                  : currentFlowState === 'SentToDoctor' ||
                      currentFlowState === 'ConsultationInProgress' ||
                      currentFlowState === 'Finalized'
                    ? t(
                        'ClinicStaff.screeningResult.actions.sentToDoctorSuccess',
                        'Sent to Doctor'
                      )
                    : t(
                        'ClinicStaff.screeningResult.actions.sendToDoctor',
                        'Send to Doctor'
                      )}
              </button>

              <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {t(
                  'ClinicStaff.screeningResult.badges.viewOnly',
                  'View mode - AI result only'
                )}
              </span>
            </div>
          </div>
        </section>

        <ClinicScreeningStepper activeStep="review-save" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
          <div className="space-y-4">
            <ClinicRetinalViewerCard
              selectedImage={selectedImage}
              selectedImageIndex={selectedImageIndex}
              images={sessionData.images}
              analyzing={analyzing || enhancingAnalysis}
              detectedBoxes={detectedBoxes}
              showHighlights={showHighlights}
              showHeatmap={showHeatmap}
              heatmapUrl={heatmapUrl}
              heatmapCanvasRef={heatmapCanvasRef}
              imageLayout={imageLayout}
              imageContainerRef={imageContainerRef}
              imageRef={imageRef}
              onToggleHighlights={() =>
                setShowHighlights((current) => !current)
              }
              onToggleHeatmap={() => setShowHeatmap((current) => !current)}
              onImageLoad={updateImageLayout}
              onSelectImage={setSelectedImageIndex}
              isEditable={false}
              annotationMode={annotationMode}
              selectedBoxId={undefined}
              onAnnotationModeChange={setAnnotationMode}
              onBoxCreate={undefined}
              onBoxUpdate={undefined}
              onBoxDelete={undefined}
              onBoxSelect={undefined}
              onBoxDoubleClick={undefined}
              canUndo={false}
            />

            <div className="space-y-3 rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                <Bot className="h-4 w-4 text-primary" />
                {t(
                  'ClinicStaff.screeningResult.aiResults.title',
                  'AI Analysis Results'
                )}
              </h3>
              {aiFindings.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {aiFindings.slice(0, 6).map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-(--border-primary) px-3 py-2.5"
                    >
                      {index === 0 && (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {t(
                            'ClinicStaff.screeningResult.aiResults.primary',
                            'Primary Finding'
                          )}
                        </p>
                      )}
                      <p className="truncate text-sm font-medium text-(--text-primary)">
                        {item.localizedName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-(--text-secondary)">
                  {t(
                    'ClinicStaff.screeningResult.aiResults.empty',
                    'Analysis results will appear here after AI processing is complete.'
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6">
            <div className={`rounded-2xl border p-6 ${risk.bg} ${risk.border}`}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${risk.bg}`}
                >
                  <RiskIcon className={`h-6 w-6 ${risk.color}`} />
                </div>
                <div>
                  <p className="text-sm text-(--text-tertiary)">
                    {t(
                      'ClinicStaff.screeningResult.riskCard.title',
                      'Risk level'
                    )}
                  </p>
                  <p className={`text-2xl font-bold ${risk.color}`}>
                    {riskLevel}
                  </p>
                </div>
              </div>
              {draft && (
                <p className="text-sm font-semibold text-(--text-primary)">
                  {t(
                    'ClinicStaff.screeningResult.riskCard.confidence',
                    'Confidence score: {{score}}%',
                    {
                      score: draft.confidenceScore,
                    }
                  )}
                </p>
              )}
            </div>

            {draft ? (
              <>
                <div className="space-y-3 rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                    <Activity className="h-4 w-4 text-primary" />
                    {t(
                      'ClinicStaff.screeningResult.cards.summaryTitle',
                      'AI Summary'
                    )}
                  </h3>
                  <textarea
                    value={draft.summary}
                    readOnly
                    rows={4}
                    className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                    <Bot className="h-4 w-4 text-primary" />
                    {t(
                      'ClinicStaff.screeningResult.cards.findingsTitle',
                      'Diagnosis Findings'
                    )}
                  </h3>
                  <textarea
                    value={draft.findings}
                    readOnly
                    rows={5}
                    className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-(--border-primary) bg-(--bg-secondary) p-5">
                <p className="text-sm text-(--text-secondary)">
                  <Sparkles className="mr-1 inline h-4 w-4" />
                  {t(
                    'ClinicStaff.screeningResult.states.noDraft',
                    'No AI result yet. Press "Re-analyze" to generate results.'
                  )}
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5">
              <h3 className="text-sm font-semibold text-(--text-primary)">
                {t(
                  'ClinicStaff.screeningResult.sessionInfo.title',
                  'Session Information'
                )}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">
                    {t(
                      'ClinicStaff.screeningResult.sessionInfo.model',
                      'Model'
                    )}
                  </span>
                  <span className="font-medium text-(--text-primary)">
                    {sessionData.modelVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">
                    {t(
                      'ClinicStaff.screeningResult.sessionInfo.imageCount',
                      'Image count'
                    )}
                  </span>
                  <span className="font-medium text-(--text-primary)">
                    {sessionData.images.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">
                    {t(
                      'ClinicStaff.screeningResult.sessionInfo.createdAt',
                      'Created at'
                    )}
                  </span>
                  <span className="font-medium text-(--text-primary)">
                    {new Date(sessionData.createdAt).toLocaleDateString(
                      'vi-VN'
                    )}
                  </span>
                </div>
                {sessionData.latestResult?.assessedAt && (
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'ClinicStaff.screeningResult.sessionInfo.assessedAt',
                        'Last assessed'
                      )}
                    </span>
                    <span className="font-medium text-(--text-primary)">
                      {new Date(
                        sessionData.latestResult.assessedAt
                      ).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-(--text-tertiary)">
                    {t(
                      'ClinicStaff.screeningResult.sessionInfo.sessionCode',
                      'Session code'
                    )}
                  </span>
                  <span className="text-xs font-medium text-(--text-primary)">
                    {sessionData.screeningId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {shareModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-(--text-primary)">
                  {t(
                    'ClinicStaff.screeningResult.shareModal.title',
                    'Share screening result'
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!sharingEmail && !sharingNetwork) {
                      setShareModalOpen(false);
                    }
                  }}
                  className="rounded-md p-1 text-(--text-tertiary) hover:bg-(--bg-primary)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex gap-1 rounded-xl bg-(--bg-primary) p-1">
                <button
                  type="button"
                  onClick={() => setShareTab('email')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    shareTab === 'email'
                      ? 'bg-(--bg-secondary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  {t(
                    'ClinicStaff.screeningResult.shareModal.tabs.email',
                    'Send email'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShareTab('network')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    shareTab === 'network'
                      ? 'bg-(--bg-secondary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  <Network className="h-4 w-4" />
                  {t(
                    'ClinicStaff.screeningResult.shareModal.tabs.network',
                    'Post to Network'
                  )}
                </button>
              </div>

              {shareTab === 'email' && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-(--text-secondary)">
                    {sessionData.isWalkIn
                      ? t(
                          'ClinicStaff.screeningResult.shareModal.email.walkInHint',
                          'Walk-in patient: enter recipient email for result delivery.'
                        )
                      : t(
                          'ClinicStaff.screeningResult.shareModal.email.defaultHint',
                          'Email can be edited before sending.'
                        )}
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-(--text-tertiary)">
                      {t(
                        'ClinicStaff.screeningResult.shareModal.email.recipient',
                        'Recipient email'
                      )}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-tertiary)" />
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(event) => setShareEmail(event.target.value)}
                        placeholder={t(
                          'ClinicStaff.screeningResult.shareModal.email.placeholder',
                          'patient@example.com'
                        )}
                        className="w-full rounded-xl border border-(--border-primary) bg-(--bg-primary) py-2 pl-10 pr-3 text-sm text-(--text-primary)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-(--text-primary)">
                      <input
                        type="checkbox"
                        checked={shareIncludePdf}
                        onChange={(event) =>
                          setShareIncludePdf(event.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      {t(
                        'ClinicStaff.screeningResult.shareModal.email.attachPdf',
                        'Attach PDF report'
                      )}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-(--text-primary)">
                      <input
                        type="checkbox"
                        checked={shareIncludeRetinalImages}
                        onChange={(event) =>
                          setShareIncludeRetinalImages(event.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      {t(
                        'ClinicStaff.screeningResult.shareModal.email.attachImages',
                        'Share retinal image links'
                      )}
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!sharingEmail) setShareModalOpen(false);
                      }}
                      disabled={sharingEmail}
                      className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-secondary)"
                    >
                      {t('ClinicStaff.common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShareEmail()}
                      disabled={sharingEmail}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {sharingEmail && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(
                        'ClinicStaff.screeningResult.shareModal.email.send',
                        'Send share'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {shareTab === 'network' && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-(--text-secondary)">
                    {t(
                      'ClinicStaff.screeningResult.shareModal.network.hint',
                      'Post this screening case to Professional Network as a case presentation.'
                    )}
                  </p>
                  {draft ? (
                    <div className="space-y-1 rounded-xl border border-(--border-primary) bg-(--bg-primary) p-3 text-xs text-(--text-secondary)">
                      <p>
                        <span className="font-semibold text-(--text-primary)">
                          {t(
                            'ClinicStaff.screeningResult.shareModal.network.riskLabel',
                            'Risk level:'
                          )}
                        </span>{' '}
                        {draft.riskLevel}
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-semibold text-(--text-primary)">
                          {t(
                            'ClinicStaff.screeningResult.shareModal.network.summaryLabel',
                            'Summary:'
                          )}
                        </span>{' '}
                        {draft.summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600">
                      {t(
                        'ClinicStaff.screeningResult.shareModal.network.noDraft',
                        'No AI result yet. Please run analysis first.'
                      )}
                    </p>
                  )}
                  <textarea
                    value={consultationNote}
                    onChange={(event) =>
                      setConsultationNote(event.target.value)
                    }
                    rows={4}
                    placeholder={t(
                      'ClinicStaff.screeningResult.shareModal.network.notePlaceholder',
                      'Add an optional note for this case...'
                    )}
                    className="w-full rounded-xl border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!sharingNetwork) setShareModalOpen(false);
                      }}
                      disabled={sharingNetwork}
                      className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-secondary)"
                    >
                      {t('ClinicStaff.common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShareToNetwork()}
                      disabled={sharingNetwork || !draft}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {sharingNetwork && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(
                        'ClinicStaff.screeningResult.shareModal.network.post',
                        'Post to Network'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClinicStaffLayout>
  );
}
