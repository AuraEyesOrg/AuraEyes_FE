import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Printer,
  RefreshCw,
  Sparkles,
  Save,
  AlertCircle,
  Loader2,
  Activity,
  Share2,
  Mail,
  Network,
  Plus,
  Zap,
  Coins,
  X,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { OrganisationScreeningStepper } from '../components/OrganisationScreeningStepper';
import { OrganisationRetinalViewerCard } from '../components/OrganisationRetinalViewerCard';
import ConfirmModal from '@/components/ui/confirm-modal';
import { orgBillingApi } from '../api/billing.api';
import { orgScreeningApi } from '../api/screening.api';
import { organisationWalletApi } from '../api/wallet.api';
import { unwrapApiData } from '@/types/api-response';
import { aiCoreClient } from '@/lib/axios';
import {
  downloadBlobFile,
  getFileNameFromContentDisposition,
} from '@/lib/file-export';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getDiseaseUrgency } from '@/features/patient/mock/disease-mapping';
import i18n from '@/i18n/i18n';
import { postsApi } from '@/features/professional-network/api/network.api';
import { resolveAuthorType } from '@/features/professional-network/utils/authorType';
import useAuthStore from '@/store/auth-store';
import { BoxLabelSelector } from '../components/BoxLabelSelector';
import type {
  AiFindingItem,
  AIStandardResponse,
  AnnotationMode,
  BoxCreatePayload,
  BoxUpdatePayload,
  DetectionBox,
  ImageLayout,
  OrgScreeningSessionDetail,
  ResultDraft,
  RiskLevel,
} from '@/features/organisation/types/screening-result.types';
import {
  buildFindingsFromBoxes,
  buildFindingsText,
  buildSummary,
  clampConfidence,
  composeFindingsWithNote,
  createManualBox,
  extractTopKFromRaw,
  extractVisualArtifactsFromRaw,
  getErrorMessage,
  mapAiFindings,
  mergeBoxesIntoRawJson,
  normalizeRiskLevel,
  riskConfig,
  splitFindingsAndNote,
  toRiskLevelFromUrgency,
} from '@/features/organisation/utils/screening-result.util';

// ─── Share modal tab type ────────────────────────────────────────────────────
type ShareTab = 'email' | 'network';

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

interface ScreeningResultLocationState {
  patientName?: string;
  autoAnalyze?: boolean;
  skipQuotaDeduction?: boolean;
}

export default function OrganisationScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const screeningId = searchParams.get('id');
  const { user } = useAuthStore();

  const locationState = location.state as ScreeningResultLocationState | null;
  const locationPatientName = locationState?.patientName?.trim() ?? '';
  const shouldAutoAnalyze = Boolean(locationState?.autoAnalyze);
  const skipQuotaDeductionOnAutoAnalyze = Boolean(
    locationState?.skipQuotaDeduction
  );
  const { t } = useSafeTranslation();
  const currencyVndLabel = t('Organisation.common.currencyVnd', 'VND');

  const currentLanguage = useMemo(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'vi',
    [i18n.language, i18n.resolvedLanguage]
  );

  const translateResultText = useCallback(
    (key: string, fallback: string, options?: TranslationParams) =>
      t(key, fallback, options),
    [t]
  );

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaAmountInput, setQuotaAmountInput] = useState('50');

  const { data: billingSummary, isLoading: isBillingLoading } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const remainingQuota = billingSummary?.remainingQuota ?? 0;
  const isQuotaExhausted =
    !isBillingLoading && remainingQuota !== null && remainingQuota <= 0;
  const walletBalance = billingSummary?.walletBalance ?? 0;
  const calculatedOrganisationUnitPriceFromPatient =
    billingSummary?.patientUnitPrice && billingSummary.patientUnitPrice > 0
      ? Math.round(billingSummary.patientUnitPrice * 0.6)
      : 0;
  const effectiveOrganisationUnitPrice =
    billingSummary?.organisationUnitPrice &&
    billingSummary.organisationUnitPrice > 0
      ? billingSummary.organisationUnitPrice
      : calculatedOrganisationUnitPriceFromPatient;
  const hasValidUnitPrice = effectiveOrganisationUnitPrice > 0;

  const parsedQuotaAmount = Number.parseInt(quotaAmountInput, 10);
  const selectedQuotaAmount = Number.isFinite(parsedQuotaAmount)
    ? Math.max(1, Math.min(parsedQuotaAmount, 5000))
    : 1;
  const selectedTotalCost =
    selectedQuotaAmount * effectiveOrganisationUnitPrice;
  const missingAmount = Math.max(0, selectedTotalCost - walletBalance);
  const hasEnoughBalance = selectedTotalCost > 0 && missingAmount === 0;
  const suggestedTopUpAmount =
    missingAmount > 0
      ? Math.ceil(Math.max(missingAmount, 10000) / 1000) * 1000
      : 0;

  const buyQuotaMutation = useMutation({
    mutationFn: (quotaAmount: number) =>
      orgBillingApi.buyQuota({ quotaAmount }),
    onSuccess: () => {
      toast.success(
        t(
          'Organisation.screening.toast.buyQuotaSuccess',
          'Purchased {{count}} AI quota credits successfully.',
          {
            count: selectedQuotaAmount,
          }
        )
      );
      setIsQuotaModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 402) {
        toast.error(
          t(
            'Organisation.screening.toast.walletInsufficient',
            'Insufficient wallet balance. Please top up your wallet.'
          )
        );
        return;
      }

      const message =
        (isAxiosError(error) &&
          ((error.response?.data as { message?: string; detail?: string })
            ?.message ||
            (error.response?.data as { detail?: string })?.detail)) ||
        t(
          'Organisation.screening.toast.buyQuotaFailed',
          'Unable to buy quota. Please try again.'
        );

      toast.error(message);
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: (amountVnd: number) =>
      organisationWalletApi.createDeposit({
        amountVnd,
        description: t(
          'Organisation.screening.wallet.topUpDescription',
          'Top up for organisation quota purchase ({{amount}} VND)',
          {
            amount: amountVnd.toLocaleString('vi-VN'),
          }
        ),
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      }),
    onSuccess: (response) => {
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      toast.error(
        t(
          'Organisation.screening.toast.paymentLinkUnavailable',
          'Unable to get payment link. Please try again.'
        )
      );
    },
    onError: (error) => {
      const message =
        (isAxiosError(error) &&
          ((error.response?.data as { message?: string; detail?: string })
            ?.message ||
            (error.response?.data as { detail?: string })?.detail)) ||
        t(
          'Organisation.screening.toast.createTopUpFailed',
          'Unable to create top-up request. Please try again.'
        );

      toast.error(message);
    },
  });

  // ─── Core loading / action states ────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [enhancingAnalysis, setEnhancingAnalysis] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  // ─── Share modal states (email + network, separate loading) ──────────────
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTab, setShareTab] = useState<ShareTab>('email');
  const [sharingEmail, setSharingEmail] = useState(false); // loading riêng
  const [sharingNetwork, setSharingNetwork] = useState(false); // loading riêng
  const [shareEmail, setShareEmail] = useState('');
  const [shareIncludePdf, setShareIncludePdf] = useState(true);
  const [shareIncludeRetinalImages, setShareIncludeRetinalImages] =
    useState(false);

  // ─── Session & AI data states ─────────────────────────────────────────────
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sessionData, setSessionData] =
    useState<OrgScreeningSessionDetail | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | undefined>();
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const [consultationNote, setConsultationNote] = useState('');
  const [aiFindings, setAiFindings] = useState<AiFindingItem[]>([]);
  const [detectedBoxes, setDetectedBoxes] = useState<DetectionBox[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | undefined>();
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);

  // Heatmap interactive states
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.42);
  const [heatmapThreshold, setHeatmapThreshold] = useState(0.25);
  const [heatmapEditMode, setHeatmapEditMode] = useState<
    'draw' | 'erase' | null
  >(null);
  const [brushTargetHeat, setBrushTargetHeat] = useState(0.9);
  const [brushSize, setBrushSize] = useState(3);
  const [hasHeatmapEdits, setHasHeatmapEdits] = useState(false);

  // ─── Annotation editing states ──────────────────────────────────────────
  const [annotationMode, setAnnotationMode] =
    useState<AnnotationMode>('select');
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [labelSelectorBoxId, setLabelSelectorBoxId] = useState<string | null>(
    null
  );

  // ─── Undo/Redo System ───────────────────────────────────────────────────
  interface EditorSnapshot {
    detectedBoxes: DetectionBox[];
    heatmapData: number[][] | null;
  }
  const undoStackRef = useRef<EditorSnapshot[]>([]);
  const MAX_UNDO = 40;

  const pushUndo = useCallback(() => {
    undoStackRef.current.push({
      detectedBoxes: detectedBoxes.map((b) => ({
        ...b,
        location: { ...b.location },
      })),
      heatmapData: heatmapData ? heatmapData.map((row) => [...row]) : null,
    });
    if (undoStackRef.current.length > MAX_UNDO) {
      undoStackRef.current.shift();
    }
  }, [detectedBoxes, heatmapData]);

  const handleUndo = useCallback(() => {
    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return;
    setDetectedBoxes(snapshot.detectedBoxes);
    setHeatmapData(snapshot.heatmapData);
    setSaved(false);
  }, []);

  const canUndo = undoStackRef.current.length > 0;

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const autoAnalyzeTriggeredRef = useRef(false);

  const selectedImage =
    sessionData?.images[selectedImageIndex] ?? sessionData?.images[0];
  const isViewOnly = Boolean(sessionData?.latestResult);
  const canDownloadPdf = Boolean(screeningId && sessionData?.latestResult);
  const canShareResult = Boolean(screeningId && sessionData?.latestResult);
  const hasUnsavedRecord = Boolean(draft) && !saved && !isViewOnly;
  const patientDisplayName =
    sessionData?.patientName?.trim() ||
    locationPatientName ||
    t('Organisation.screeningResult.patientFallback', 'Patient');
  const isWalkInPatient = sessionData?.isWalkIn ?? false;

  // ─── Navigation Guard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasUnsavedRecord) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedRecord]);

  // ─── Image layout & visual artifacts ─────────────────────────────────────
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
      if (!nextHeatmapUrl) setShowHeatmap(false);
    },
    [rawJsonOutput, currentLanguage]
  );

  const updateImageLayout = useCallback(() => {
    const img = imageRef.current;
    const container = imageContainerRef.current;
    if (!img || !container) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

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

    // Extract heatmap_data for interactive canvas editing
    try {
      if (rawJsonOutput) {
        const parsed = JSON.parse(rawJsonOutput) as {
          heatmap_data?: number[][];
        };
        if (parsed.heatmap_data) {
          setHeatmapData(parsed.heatmap_data);
          setHasHeatmapEdits(false);
        }
      }
    } catch {
      // Ignore
    }
  }, [hydrateVisualArtifacts, rawJsonOutput]);

  // ─── Render dynamic heatmap lên canvas ────────────────────────────────────
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas || !heatmapData || heatmapData.length === 0) return;
    const rows = heatmapData.length;
    const cols = heatmapData[0]?.length ?? 0;
    if (cols === 0) return;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cols, rows);
    const imageData = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = Math.max(0, Math.min(1, heatmapData[r]?.[c] ?? 0));
        const idx = (r * cols + c) * 4;

        if (v <= heatmapThreshold) {
          imageData.data[idx + 3] = 0;
        } else {
          const nv = (v - heatmapThreshold) / (1 - heatmapThreshold);
          const r4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 3)));
          const g4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 2)));
          const b4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 1)));
          const alpha = Math.min(
            255,
            Math.max(0, Math.round((0.3 + 0.7 * nv) * 255))
          );
          imageData.data[idx] = Math.round(r4 * 255);
          imageData.data[idx + 1] = Math.round(g4 * 255);
          imageData.data[idx + 2] = Math.round(b4 * 255);
          imageData.data[idx + 3] = alpha;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [heatmapData, heatmapThreshold]);

  const paintHeatmap = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!heatmapData || !heatmapEditMode) return;

      // Push undo on start of stroke
      if (e.type === 'pointerdown') {
        pushUndo();
      }

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rows = heatmapData.length;
      const cols = heatmapData[0].length;
      const c = Math.floor((x / rect.width) * cols);
      const r = Math.floor((y / rect.height) * rows);

      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        setHasHeatmapEdits(true);
        setHeatmapData((prev) => {
          if (!prev) return prev;
          const next = prev.map((row) => [...row]);
          const intensity = 0.15;
          for (let ir = -brushSize; ir <= brushSize; ir++) {
            for (let ic = -brushSize; ic <= brushSize; ic++) {
              const distSq = ir * ir + ic * ic;
              if (distSq <= brushSize * brushSize) {
                const nr = r + ir;
                const nc = c + ic;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  const dist = Math.sqrt(distSq);
                  const falloff = Math.pow(1 - dist / brushSize, 1.5);
                  const current = next[nr][nc];
                  const target =
                    heatmapEditMode === 'erase' ? 0 : brushTargetHeat;
                  next[nr][nc] =
                    current + (target - current) * (intensity * falloff);
                }
              }
            }
          }
          return next;
        });
      }
    },
    [heatmapData, heatmapEditMode, brushSize, brushTargetHeat, pushUndo]
  );

  // ─── Session hydration ────────────────────────────────────────────────────
  const hydrateStateFromSession = useCallback(
    (detail: OrgScreeningSessionDetail) => {
      const topK = extractTopKFromRaw(detail.rawJsonOutput);
      const mappedFindings = mapAiFindings(topK, currentLanguage);

      setAiFindings(mappedFindings);
      setRawJsonOutput(detail.rawJsonOutput);

      if (detail.latestResult) {
        const parsed = splitFindingsAndNote(detail.latestResult.findings);
        setDraft({
          riskLevel: normalizeRiskLevel(detail.latestResult.riskLevel),
          confidenceScore: clampConfidence(detail.latestResult.confidenceScore),
          summary:
            detail.latestResult.summary ??
            buildSummary(
              normalizeRiskLevel(detail.latestResult.riskLevel),
              mappedFindings[0]?.localizedName,
              translateResultText
            ),
          findings:
            parsed.findings ||
            buildFindingsText(mappedFindings, translateResultText),
        });
        setConsultationNote(parsed.note);
        setSaved(true);
        return;
      }

      if (mappedFindings.length > 0) {
        const primary = mappedFindings[0];
        const nextRiskLevel = toRiskLevelFromUrgency(
          getDiseaseUrgency(primary.name),
          primary.confidence
        );
        setDraft({
          riskLevel: nextRiskLevel,
          confidenceScore: primary.confidence,
          summary: buildSummary(
            nextRiskLevel,
            primary.localizedName,
            translateResultText
          ),
          findings: buildFindingsText(mappedFindings, translateResultText),
        });
      } else {
        setDraft(null);
      }

      setConsultationNote('');
      setSaved(false);
    },
    [currentLanguage, translateResultText]
  );

  const loadSessionDetail = useCallback(
    async (showLoader = true) => {
      if (!screeningId) return;
      if (showLoader) setLoading(true);
      try {
        const response = await orgScreeningApi.getSessionDetail(screeningId);
        const detail = unwrapApiData<OrgScreeningSessionDetail>(response);
        setSessionData(detail);
        hydrateStateFromSession(detail);
      } catch (error) {
        console.error('Failed to load organization screening detail:', error);
        setSessionData(null);
        toast.error(
          getErrorMessage(
            error,
            t(
              'Organisation.screeningResult.toast.loadResultFailed',
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

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!screeningId) {
      setLoading(false);
      return;
    }
    void loadSessionDetail(true);
  }, [screeningId, loadSessionDetail]);

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, [updateImageLayout]);

  useEffect(() => {
    updateImageLayout();
  }, [selectedImage?.imageUrl, rawJsonOutput, updateImageLayout]);

  // Reset share modal state khi mở
  useEffect(() => {
    if (!shareModalOpen || !sessionData) return;
    setShareTab('email');
    setShareEmail(sessionData.isWalkIn ? '' : (sessionData.patientEmail ?? ''));
    setShareIncludePdf(true);
    setShareIncludeRetinalImages(false);
  }, [shareModalOpen, sessionData]);

  const handleBuyQuotaFromModal = () => {
    if (!hasValidUnitPrice) {
      toast.error(
        t(
          'Organisation.screening.toast.quotaUnitPriceUnavailable',
          'Quota unit price is unavailable. Please try again later.'
        )
      );
      return;
    }

    buyQuotaMutation.mutate(selectedQuotaAmount);
  };

  const handleTopUpWalletFromModal = () => {
    if (suggestedTopUpAmount <= 0) {
      toast.error(
        t(
          'Organisation.screening.toast.invalidTopUpAmount',
          'Invalid top-up amount.'
        )
      );
      return;
    }

    createDepositMutation.mutate(suggestedTopUpAmount);
  };

  // ─── Draft helpers ────────────────────────────────────────────────────────
  const updateDraft = useCallback(
    <K extends keyof ResultDraft>(key: K, value: ResultDraft[K]) => {
      if (isViewOnly) return;
      setDraft((current) => {
        if (!current) return current;
        return { ...current, [key]: value };
      });
      setSaved(false);
    },
    [isViewOnly]
  );

  const handleNoteChange = (value: string) => {
    if (isViewOnly) return;
    setConsultationNote(value);
    setSaved(false);
  };

  // ─── Box annotation CRUD ────────────────────────────────────────────────
  const syncFindingsFromBoxes = useCallback(
    (nextBoxes: DetectionBox[]) => {
      const nextFindings = buildFindingsFromBoxes(
        nextBoxes,
        translateResultText
      );
      setDraft((prev) => {
        if (!prev) return prev;
        return { ...prev, findings: nextFindings };
      });
    },
    [translateResultText]
  );

  const handleBoxCreate = useCallback(
    (payload: BoxCreatePayload) => {
      if (isViewOnly) return;
      pushUndo();
      const newBox = createManualBox(payload.location);
      setDetectedBoxes((prev) => {
        const next = [...prev, newBox];
        syncFindingsFromBoxes(next);
        return next;
      });
      setSelectedBoxId(newBox.id);
      setAnnotationMode('select');
      setSaved(false);
    },
    [isViewOnly, syncFindingsFromBoxes, pushUndo]
  );

  const handleBoxUpdate = useCallback(
    (payload: BoxUpdatePayload) => {
      if (isViewOnly) return;
      pushUndo();
      setDetectedBoxes((prev) => {
        const next = prev.map((box) =>
          box.id === payload.id ? { ...box, ...payload } : box
        );
        // Only sync findings when label/name changed (not during drag moves)
        if (payload.name !== undefined || payload.localizedName !== undefined) {
          syncFindingsFromBoxes(next);
        }
        return next;
      });
      setSaved(false);
    },
    [isViewOnly, syncFindingsFromBoxes]
  );

  const handleBoxDelete = useCallback(
    (id: string) => {
      if (isViewOnly) return;
      pushUndo();
      setDetectedBoxes((prev) => {
        const next = prev.filter((box) => box.id !== id);
        syncFindingsFromBoxes(next);
        return next;
      });
      if (selectedBoxId === id) setSelectedBoxId(null);
      if (labelSelectorBoxId === id) setLabelSelectorBoxId(null);
      setSaved(false);
    },
    [isViewOnly, selectedBoxId, labelSelectorBoxId, syncFindingsFromBoxes]
  );

  const handleBoxSelect = useCallback((id: string | null) => {
    setSelectedBoxId(id);
    if (!id) setLabelSelectorBoxId(null);
  }, []);

  const selectedBoxForLabel = labelSelectorBoxId
    ? (detectedBoxes.find((b) => b.id === labelSelectorBoxId) ?? null)
    : null;

  // ─── AI Analyze ───────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(
    async (options?: { skipQuotaDeduction?: boolean }) => {
      if (
        isViewOnly ||
        !sessionData ||
        sessionData.images.length === 0 ||
        analyzing
      )
        return;

      if (!screeningId) {
        toast.error(
          t(
            'Organisation.screeningResult.toast.sessionNotFoundForAi',
            'No screening session found for AI analysis.'
          )
        );
        return;
      }

      const targetImage =
        sessionData.images[selectedImageIndex] ?? sessionData.images[0];
      if (!targetImage) return;

      const analysisToastId = toast.loading(
        t('Organisation.screeningResult.toast.analyzingAi', 'Analyzing AI...'),
        {
          closeButton: false,
        }
      );

      setAnalyzing(true);
      try {
        if (!options?.skipQuotaDeduction) {
          await orgBillingApi.deductQuota();
        }

        void queryClient.invalidateQueries({
          queryKey: ['org-billing-summary'],
        });

        const imgResponse = await fetch(targetImage.imageUrl);
        const blob = await imgResponse.blob();
        const fileName =
          targetImage.imageUrl.split('/').pop() ??
          `retinal-org-${Date.now().toString()}.jpg`;
        const file = new File([blob], fileName, {
          type: blob.type || 'image/jpeg',
        });
        const fastFormData = new FormData();
        fastFormData.append('file', file);
        fastFormData.append('topk', '5');

        // Phase 1: fast inference for quicker initial feedback.
        const { data: fastData } = await aiCoreClient.post<AIStandardResponse>(
          '/api/v2/diagnosis/v2/analyze/fast',
          fastFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        const topK = [...(fastData.prediction?.top_k ?? [])]
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 6);

        if (topK.length === 0)
          throw new Error(
            t(
              'Organisation.screeningResult.toast.aiNoPredictionData',
              'AI service returned no prediction data.'
            )
          );

        const mappedFindings = mapAiFindings(topK, currentLanguage);
        const primary = mappedFindings[0];
        const nextRiskLevel = toRiskLevelFromUrgency(
          getDiseaseUrgency(primary.name),
          primary.confidence
        );

        setAiFindings(mappedFindings);
        setRawJsonOutput(JSON.stringify(fastData));
        setShowHighlights(true);
        setShowHeatmap(false);
        setDraft({
          riskLevel: nextRiskLevel,
          confidenceScore: primary.confidence,
          summary: buildSummary(
            nextRiskLevel,
            primary.localizedName,
            translateResultText
          ),
          findings: buildFindingsText(mappedFindings, translateResultText),
        });
        setConsultationNote('');
        setSaved(false);

        // Phase 2: full inference for localization + heatmap details.
        setEnhancingAnalysis(true);
        try {
          const fullFormData = new FormData();
          fullFormData.append('file', file);
          fullFormData.append('threshold', '0.55');
          fullFormData.append('topk', '5');

          const { data: fullData } =
            await aiCoreClient.post<AIStandardResponse>(
              '/api/v2/diagnosis/v2/analyze',
              fullFormData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            );

          const fullTopK = [...(fullData.prediction?.top_k ?? [])]
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 6);

          if (fullTopK.length > 0) {
            const mappedFullFindings = mapAiFindings(fullTopK, currentLanguage);
            const primaryFull = mappedFullFindings[0];
            const fullRiskLevel = toRiskLevelFromUrgency(
              getDiseaseUrgency(primaryFull.name),
              primaryFull.confidence
            );

            setAiFindings(mappedFullFindings);
            setRawJsonOutput(JSON.stringify(fullData));
            setDraft({
              riskLevel: fullRiskLevel,
              confidenceScore: primaryFull.confidence,
              summary: buildSummary(
                fullRiskLevel,
                primaryFull.localizedName,
                translateResultText
              ),
              findings: buildFindingsText(
                mappedFullFindings,
                translateResultText
              ),
            });
          }
        } catch (fullError) {
          console.warn(
            'Full organization AI analyze failed, using fast result:',
            fullError
          );
        } finally {
          setEnhancingAnalysis(false);
        }

        toast.update(analysisToastId, {
          render: t(
            'Organisation.screeningResult.toast.analyzeCompleted',
            'AI analysis completed. You can edit the result before saving.'
          ),
          type: 'success',
          isLoading: false,
          autoClose: 2800,
          closeButton: true,
        });
      } catch (error) {
        console.error('Organisation AI analysis failed:', error);

        if (isAxiosError(error) && error.response?.status === 402) {
          setIsQuotaModalOpen(true);
          toast.update(analysisToastId, {
            render: t(
              'Organisation.screeningResult.toast.quotaExhaustedForAnalyze',
              'Quota exhausted. Please buy more quota from wallet before analysis.'
            ),
            type: 'error',
            isLoading: false,
            autoClose: 3200,
            closeButton: true,
          });
          return;
        }

        toast.update(analysisToastId, {
          render: getErrorMessage(
            error,
            t(
              'Organisation.screeningResult.toast.analyzeFailed',
              'AI analysis failed. Please verify AI service and try again.'
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
    },
    [
      screeningId,
      sessionData,
      selectedImageIndex,
      analyzing,
      currentLanguage,
      isViewOnly,
      queryClient,
      t,
      translateResultText,
    ]
  );

  useEffect(() => {
    if (
      !shouldAutoAnalyze ||
      autoAnalyzeTriggeredRef.current ||
      !sessionData ||
      isViewOnly ||
      analyzing ||
      sessionData.images.length === 0
    ) {
      return;
    }

    const autoAnalyzeStorageKey = screeningId
      ? `org-screening-auto-analyze:${screeningId}`
      : '';

    if (
      autoAnalyzeStorageKey &&
      window.sessionStorage.getItem(autoAnalyzeStorageKey) === 'done'
    ) {
      autoAnalyzeTriggeredRef.current = true;
      return;
    }

    autoAnalyzeTriggeredRef.current = true;
    if (autoAnalyzeStorageKey) {
      window.sessionStorage.setItem(autoAnalyzeStorageKey, 'done');
    }
    void handleAnalyze({
      skipQuotaDeduction: skipQuotaDeductionOnAutoAnalyze,
    });
  }, [
    screeningId,
    shouldAutoAnalyze,
    sessionData,
    isViewOnly,
    analyzing,
    handleAnalyze,
    skipQuotaDeductionOnAutoAnalyze,
  ]);

  // ─── Download PDF ─────────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    if (downloadingPdf || !screeningId) return;
    if (!canDownloadPdf) {
      toast.info(
        t(
          'Organisation.screeningResult.toast.saveBeforePdf',
          'Please save the record before exporting PDF.'
        )
      );
      return;
    }
    setDownloadingPdf(true);
    try {
      const { blob, contentDisposition } =
        await orgScreeningApi.downloadSessionReportPdf(screeningId);
      const fallbackFileName = `screening-report-${screeningId.slice(0, 8)}.pdf`;
      const fileName =
        getFileNameFromContentDisposition(contentDisposition) ||
        fallbackFileName;
      downloadBlobFile(blob, fileName);
      toast.success(
        t(
          'Organisation.screeningResult.toast.downloadPdfSuccess',
          'PDF report downloaded successfully.'
        )
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            'Organisation.screeningResult.toast.downloadPdfFailed',
            'Unable to download PDF report.'
          )
        )
      );
    } finally {
      setDownloadingPdf(false);
    }
  }, [screeningId, downloadingPdf, canDownloadPdf, t]);

  // ─── Share via email ──────────────────────────────────────────────────────
  const handleShareEmail = useCallback(async () => {
    if (!screeningId || !sessionData || sharingEmail) return;

    if (!shareIncludePdf && !shareIncludeRetinalImages) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.shareSelectAtLeastOne',
          'Please select at least one item to share.'
        )
      );
      return;
    }
    const trimmedEmail = shareEmail.trim();
    if (isWalkInPatient && !trimmedEmail) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.shareWalkInEmailRequired',
          'Please enter recipient email for walk-in patient.'
        )
      );
      return;
    }

    setSharingEmail(true);
    try {
      const response = await orgScreeningApi.shareSessionResult(screeningId, {
        recipientEmail: trimmedEmail || undefined,
        includePdf: shareIncludePdf,
        includeRetinalImages: shareIncludeRetinalImages,
      });
      const shareResult = unwrapApiData(response);
      toast.success(
        t(
          'Organisation.screeningResult.toast.shareEmailSuccess',
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
            'Organisation.screeningResult.toast.shareEmailFailed',
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
    isWalkInPatient,
    t,
  ]);

  // ─── Share to Professional Network ───────────────────────────────────────
  const buildNetworkShareContent = useCallback(() => {
    if (!sessionData || !draft) return '';
    const topFindings = aiFindings.slice(0, 3);
    const findingText =
      topFindings.length > 0
        ? topFindings.map((f) => `- ${f.localizedName}`).join('\n')
        : `- ${t(
            'Organisation.screeningResult.network.noAbnormalFindings',
            'No clear abnormal findings'
          )}`;

    return [
      t(
        'Organisation.screeningResult.network.title',
        'AI screening case shared by organisation'
      ),
      t('Organisation.screeningResult.network.session', 'Session: {{id}}...', {
        id: sessionData.screeningId.slice(0, 8),
      }),
      t(
        'Organisation.screeningResult.network.riskLevel',
        'Risk level: {{risk}}',
        {
          risk: draft.riskLevel,
        }
      ),
      '',
      t('Organisation.screeningResult.network.summary', 'Summary:'),
      draft.summary,
      '',
      t('Organisation.screeningResult.network.topFindings', 'Top findings:'),
      findingText,
      '',
      t(
        'Organisation.screeningResult.network.consultationNote',
        'Consultation note: {{note}}',
        {
          note:
            consultationNote.trim() ||
            t(
              'Organisation.screeningResult.network.notProvidedYet',
              'Not provided yet'
            ),
        }
      ),
    ].join('\n');
  }, [aiFindings, consultationNote, draft, sessionData, t]);

  const handleShareToNetwork = useCallback(async () => {
    if (!sessionData || !draft || sharingNetwork) return;

    setSharingNetwork(true);
    try {
      const formData = new FormData();
      formData.append(
        'authorType',
        resolveAuthorType(user?.roles, 'Organisation')
      );
      formData.append('category', 'CasePresentation');
      formData.append('allowComments', 'true');
      formData.append('isInternalCase', 'false');
      formData.append('isAnonymizationConfirmed', 'true');
      formData.append('aiScreeningId', sessionData.screeningId);
      formData.append('content', buildNetworkShareContent());

      const targetImage =
        sessionData.images[selectedImageIndex] ?? sessionData.images[0];
      if (targetImage?.imageUrl) {
        try {
          const imageResponse = await fetch(targetImage.imageUrl);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const extension =
              imageBlob.type.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
            const fileName = `org-screening-${sessionData.screeningId.slice(0, 8)}.${extension}`;
            formData.append(
              'attachments',
              new File([imageBlob], fileName, {
                type: imageBlob.type || 'image/jpeg',
              })
            );
          }
        } catch (imageError) {
          console.warn('Unable to attach selected retinal image:', imageError);
        }
      }

      await postsApi.createPost(formData);
      toast.success(
        t(
          'Organisation.screeningResult.toast.shareNetworkSuccess',
          'Case shared to Professional Network successfully.'
        )
      );
      setShareModalOpen(false);
    } catch (error) {
      console.error('Failed to share organisation screening case:', error);
      toast.error(
        getErrorMessage(
          error,
          t(
            'Organisation.screeningResult.toast.shareNetworkFailed',
            'Unable to post to Professional Network. Please try again.'
          )
        )
      );
    } finally {
      setSharingNetwork(false);
    }
  }, [
    buildNetworkShareContent,
    draft,
    selectedImageIndex,
    sessionData,
    sharingNetwork,
    user?.roles,
    t,
  ]);

  // ─── Save results ─────────────────────────────────────────────────────────
  const executeSaveResults = async () => {
    if (isViewOnly || !screeningId || !sessionData || !draft) return;

    const note = consultationNote.trim();
    if (!note) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.noteRequiredBeforeSave',
          'Please add consultation note before saving.'
        )
      );
      return;
    }
    const jsonOutput = rawJsonOutput ?? sessionData.rawJsonOutput;
    if (!jsonOutput) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.analyzeBeforeSave',
          'Please run AI analysis before saving the record.'
        )
      );
      return;
    }

    let finalJsonOutput = mergeBoxesIntoRawJson(jsonOutput, detectedBoxes);

    if (hasHeatmapEdits && heatmapData) {
      try {
        const parsed = JSON.parse(finalJsonOutput) as Record<string, unknown>;
        parsed.heatmap_data = heatmapData;
        finalJsonOutput = JSON.stringify(parsed);
      } catch {
        // Ignore JSON error
      }
    }

    setSaveConfirmOpen(false);
    setSaving(true);
    try {
      await orgScreeningApi.saveResults(screeningId, {
        rawJsonOutput: finalJsonOutput,
        riskLevel: draft.riskLevel,
        confidenceScore: clampConfidence(draft.confidenceScore),
        summary: draft.summary,
        findings: composeFindingsWithNote(draft.findings, note),
      });
      setSaved(true);
      toast.success(
        t(
          'Organisation.screeningResult.toast.saveSuccess',
          'Screening result saved successfully.'
        )
      );
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      await loadSessionDetail(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(
        getErrorMessage(
          err,
          t(
            'Organisation.screeningResult.toast.saveFailed',
            'Unable to save result. Please try again.'
          )
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const requestSaveResults = () => {
    if (!screeningId || !sessionData || !draft || isViewOnly) return;
    const note = consultationNote.trim();
    if (!note) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.noteRequiredBeforeSave',
          'Please add consultation note before saving.'
        )
      );
      return;
    }
    if (!(rawJsonOutput ?? sessionData.rawJsonOutput)) {
      toast.error(
        t(
          'Organisation.screeningResult.toast.analyzeBeforeSave',
          'Please run AI analysis before saving the record.'
        )
      );
      return;
    }
    setSaveConfirmOpen(true);
  };

  const riskLevel = draft?.riskLevel ?? 'Low';
  const risk = riskConfig[riskLevel] || riskConfig.Low;
  const RiskIcon = risk.icon;

  // ─── Loading / empty states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader
            pageName={t(
              'Organisation.screeningResult.pageName',
              'Screening Result'
            )}
          />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-(--text-secondary)">
                {t(
                  'Organisation.screeningResult.states.loading',
                  'Loading screening result...'
                )}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader
            pageName={t(
              'Organisation.screeningResult.pageName',
              'Screening Result'
            )}
          />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-(--text-primary) font-semibold">
                {t(
                  'Organisation.screeningResult.states.notFound',
                  'Screening session not found'
                )}
              </p>
              <button
                onClick={() =>
                  navigate(resolvePathWithLocale('/organisation/screening'))
                }
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
              >
                {t(
                  'Organisation.screeningResult.actions.backToScreening',
                  'Back to screening list'
                )}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader
          pageName={t(
            'Organisation.screeningResult.pageName',
            'Screening Result'
          )}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            {/* ── Header section ── */}
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-(--text-primary)">
                        {t(
                          'Organisation.screeningResult.header.title',
                          'Screening Result'
                        )}
                      </h1>
                      <p className="text-sm text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.header.patientLabel',
                          'Patient'
                        )}
                        : {patientDisplayName} ·{' '}
                        {t(
                          'Organisation.screeningResult.header.sessionLabel',
                          'Session'
                        )}{' '}
                        {screeningId
                          ? `${screeningId.slice(0, 8)}...`
                          : t(
                              'Organisation.screeningResult.header.newDraft',
                              'New draft'
                            )}{' '}
                        ·{' '}
                        {new Date(sessionData.createdAt).toLocaleString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2">
                    {isBillingLoading ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-(--bg-primary) border border-(--border-primary)">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-(--text-secondary)" />
                        <span className="text-xs text-(--text-tertiary)">
                          {t('Organisation.common.loading', 'Loading...')}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white ${
                          isQuotaExhausted
                            ? 'bg-red-500'
                            : remainingQuota <= 3
                              ? 'bg-amber-500'
                              : 'bg-(--color-brand-primary)'
                        }`}
                        title={t(
                          'Organisation.screening.badges.remainingQuota',
                          '{{count}} credits left',
                          {
                            count: remainingQuota,
                          }
                        )}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>
                          {t(
                            'Organisation.screening.badges.remainingQuota',
                            '{{count}} credits left',
                            {
                              count: remainingQuota,
                            }
                          )}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsQuotaModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-(--color-brand-primary) text-(--color-brand-primary) text-xs font-semibold hover:bg-(--color-brand-primary) hover:text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t(
                        'Organisation.screening.actions.buyMoreQuota',
                        'Buy more'
                      )}
                    </button>
                  </div>

                  {/* Nút Chia sẻ — mở modal tổng hợp */}
                  <button
                    onClick={() => setShareModalOpen(true)}
                    disabled={!canShareResult}
                    title={
                      canShareResult
                        ? t(
                            'Organisation.screeningResult.actions.shareResultTitle',
                            'Share result'
                          )
                        : t(
                            'Organisation.screeningResult.actions.shareDisabledTitle',
                            'Please save the record before sharing.'
                          )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('Organisation.screeningResult.actions.share', 'Share')}
                  </button>

                  {/* Nút Tải PDF */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={
                      downloadingPdf ||
                      loading ||
                      !screeningId ||
                      !canDownloadPdf
                    }
                    title={
                      canDownloadPdf
                        ? t(
                            'Organisation.screeningResult.actions.downloadPdfTitle',
                            'Download PDF report'
                          )
                        : t(
                            'Organisation.screeningResult.actions.downloadPdfDisabledTitle',
                            'Please save the record before exporting PDF.'
                          )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                    {downloadingPdf
                      ? t(
                          'Organisation.screeningResult.actions.generatingPdf',
                          'Generating PDF...'
                        )
                      : canDownloadPdf
                        ? t(
                            'Organisation.screeningResult.actions.downloadPdf',
                            'Download PDF'
                          )
                        : t(
                            'Organisation.screeningResult.actions.printPdf',
                            'Print PDF'
                          )}
                  </button>

                  {isViewOnly ? (
                    <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                      {t(
                        'Organisation.screeningResult.badges.viewOnly',
                        'View mode - record has been saved'
                      )}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          void handleAnalyze();
                        }}
                        disabled={
                          analyzing ||
                          enhancingAnalysis ||
                          loading ||
                          !sessionData.images.length ||
                          isQuotaExhausted
                        }
                        className="inline-flex min-w-[148px] items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-60 transition"
                      >
                        {analyzing || enhancingAnalysis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        {analyzing
                          ? t(
                              'Organisation.screeningResult.actions.analyzing',
                              'Analyzing...'
                            )
                          : enhancingAnalysis
                            ? t(
                                'Organisation.screeningResult.actions.refining',
                                'Refining...'
                              )
                            : t(
                                'Organisation.screeningResult.actions.reanalyze',
                                'Re-analyze'
                              )}
                      </button>
                      <button
                        onClick={requestSaveResults}
                        disabled={
                          saving ||
                          analyzing ||
                          !draft ||
                          consultationNote.trim().length === 0
                        }
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${
                          saved && !saving
                            ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                            : 'bg-primary text-white shadow-primary/25 hover:bg-primary/90 disabled:opacity-50'
                        }`}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saved && !saving
                          ? t(
                              'Organisation.screeningResult.actions.saved',
                              'Saved'
                            )
                          : saving
                            ? t(
                                'Organisation.screeningResult.actions.saving',
                                'Saving...'
                              )
                            : t(
                                'Organisation.screeningResult.actions.saveRecord',
                                'Save record'
                              )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <OrganisationScreeningStepper activeStep="review-save" />

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
              {/* Left column */}
              <div className="space-y-4">
                <div className="relative">
                  <OrganisationRetinalViewerCard
                    selectedImage={selectedImage}
                    selectedImageIndex={selectedImageIndex}
                    images={sessionData.images}
                    analyzing={analyzing}
                    detectedBoxes={detectedBoxes}
                    showHighlights={showHighlights}
                    showHeatmap={showHeatmap}
                    heatmapUrl={heatmapUrl}
                    heatmapCanvasRef={heatmapCanvasRef}
                    heatmapData={heatmapData}
                    heatmapOpacity={heatmapOpacity}
                    heatmapThreshold={heatmapThreshold}
                    heatmapEditMode={heatmapEditMode}
                    setHeatmapOpacity={setHeatmapOpacity}
                    setHeatmapThreshold={setHeatmapThreshold}
                    setHeatmapEditMode={setHeatmapEditMode}
                    setHeatmapData={setHeatmapData}
                    setHasHeatmapEdits={setHasHeatmapEdits}
                    paintHeatmap={paintHeatmap}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    brushTargetHeat={brushTargetHeat}
                    setBrushTargetHeat={setBrushTargetHeat}
                    onUndo={handleUndo}
                    canUndo={canUndo}
                    imageLayout={imageLayout}
                    imageContainerRef={imageContainerRef}
                    imageRef={imageRef}
                    onToggleHighlights={() => setShowHighlights((c) => !c)}
                    onToggleHeatmap={() => setShowHeatmap((c) => !c)}
                    onImageLoad={updateImageLayout}
                    onSelectImage={setSelectedImageIndex}
                    isEditable={!isViewOnly}
                    annotationMode={annotationMode}
                    selectedBoxId={selectedBoxId}
                    onAnnotationModeChange={setAnnotationMode}
                    onBoxCreate={handleBoxCreate}
                    onBoxUpdate={handleBoxUpdate}
                    onBoxDelete={handleBoxDelete}
                    onBoxSelect={handleBoxSelect}
                    onBoxDoubleClick={(id) => setLabelSelectorBoxId(id)}
                  />

                  {/* Box label selector popover */}
                  {selectedBoxForLabel && !isViewOnly && (
                    <div className="absolute top-16 right-4 z-40">
                      <BoxLabelSelector
                        box={selectedBoxForLabel}
                        language={currentLanguage}
                        onUpdate={(patch) => {
                          handleBoxUpdate({
                            id: selectedBoxForLabel.id,
                            ...patch,
                          });
                          setLabelSelectorBoxId(null);
                        }}
                        onDelete={() => {
                          handleBoxDelete(selectedBoxForLabel.id);
                        }}
                        onClose={() => setLabelSelectorBoxId(null)}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    {t(
                      'Organisation.screeningResult.aiResults.title',
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
                                'Organisation.screeningResult.aiResults.primaryFinding',
                                'Primary Finding'
                              )}
                            </p>
                          )}
                          <p className="text-sm font-medium text-(--text-primary) truncate">
                            {item.localizedName}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-(--text-secondary)">
                      {t(
                        'Organisation.screeningResult.aiResults.emptyState',
                        'Analysis results will appear here after AI processing is complete.'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Right column (sticky) — giữ nguyên 100% từ code cũ */}
              <div className="space-y-4 xl:sticky xl:top-6">
                {/* Risk level card */}
                <div
                  className={`rounded-2xl p-6 border ${risk.bg} ${risk.border}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${risk.bg} flex items-center justify-center`}
                    >
                      <RiskIcon className={`w-6 h-6 ${risk.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.riskCard.title',
                          'Risk level'
                        )}
                      </p>
                      <p className={`text-2xl font-bold ${risk.color}`}>
                        {riskLevel}
                      </p>
                    </div>
                  </div>

                  {draft && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {(['Low', 'Moderate', 'High'] as RiskLevel[]).map(
                          (item) => (
                            <button
                              key={item}
                              onClick={() => updateDraft('riskLevel', item)}
                              disabled={isViewOnly}
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                draft.riskLevel === item
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-(--border-primary) text-(--text-secondary) hover:bg-(--bg-tertiary)'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      {t(
                        'Organisation.screeningResult.editable.summaryTitle',
                        'AI Summary (editable)'
                      )}
                    </h3>
                    <textarea
                      value={draft.summary}
                      readOnly={isViewOnly}
                      onChange={(e) => updateDraft('summary', e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </div>
                )}

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
                      {t(
                        'Organisation.screeningResult.editable.consultationTitle',
                        'Organisation consultation note (required)'
                      )}
                    </h3>
                    <p className="text-xs text-(--text-tertiary)">
                      {t(
                        'Organisation.screeningResult.editable.consultationHint',
                        'This note is required and will be stored with the record.'
                      )}
                    </p>
                    <textarea
                      value={consultationNote}
                      readOnly={isViewOnly}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                      placeholder={t(
                        'Organisation.screeningResult.editable.consultationPlaceholder',
                        'Enter consultation note for this screening session...'
                      )}
                    />
                  </div>
                )}

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      {t(
                        'Organisation.screeningResult.editable.diagnosisTitle',
                        'Diagnosis result (editable)'
                      )}
                    </h3>
                    <textarea
                      value={draft.findings}
                      readOnly={isViewOnly}
                      onChange={(e) => updateDraft('findings', e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </div>
                )}

                {!draft && (
                  <div className="rounded-2xl border border-dashed border-(--border-primary) bg-(--bg-secondary) p-5">
                    <p className="text-sm text-(--text-secondary)">
                      <Sparkles className="inline w-4 h-4 mr-1" />
                      {t(
                        'Organisation.screeningResult.states.noAiDraft',
                        'No AI result yet. Press "Re-analyze" to run AI and prepare editable results.'
                      )}
                    </p>
                  </div>
                )}

                {/* Session info */}
                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-(--text-primary)">
                    {t(
                      'Organisation.screeningResult.sessionInfo.title',
                      'Session Information'
                    )}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.sessionInfo.model',
                          'Model'
                        )}
                      </span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.modelVersion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.sessionInfo.imageCount',
                          'Image count'
                        )}
                      </span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.images.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.sessionInfo.createdAt',
                          'Created at'
                        )}
                      </span>
                      <span className="text-(--text-primary) font-medium">
                        {new Date(sessionData.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                    {sessionData.latestResult?.assessedAt && (
                      <div className="flex justify-between">
                        <span className="text-(--text-tertiary)">
                          {t(
                            'Organisation.screeningResult.sessionInfo.lastAssessed',
                            'Last assessed'
                          )}
                        </span>
                        <span className="text-(--text-primary) font-medium">
                          {new Date(
                            sessionData.latestResult.assessedAt
                          ).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">
                        {t(
                          'Organisation.screeningResult.sessionInfo.sessionCode',
                          'Session code'
                        )}
                      </span>
                      <span className="text-(--text-primary) font-medium text-xs">
                        {sessionData.screeningId.slice(0, 8)}…
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Confirm save modal ── */}
        <ConfirmModal
          open={saveConfirmOpen}
          title={t(
            'Organisation.screeningResult.confirmSave.title',
            'Confirm result save'
          )}
          message={t(
            'Organisation.screeningResult.confirmSave.message',
            'Are you sure you want to save this screening result? After saving, this session will become view-only and cannot be edited.'
          )}
          confirmLabel={t(
            'Organisation.screeningResult.confirmSave.confirmLabel',
            'Save result'
          )}
          cancelLabel={t(
            'Organisation.screeningResult.confirmSave.cancelLabel',
            'Review again'
          )}
          tone="default"
          isLoading={saving}
          onCancel={() => {
            if (!saving) setSaveConfirmOpen(false);
          }}
          onConfirm={() => {
            void executeSaveResults();
          }}
        />

        {isQuotaModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-(--text-primary)">
                  {t(
                    'Organisation.screening.quotaModal.title',
                    'Buy more AI quota'
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="p-1.5 rounded-lg text-(--text-tertiary) hover:bg-(--bg-tertiary)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-(--text-primary)">
                  {t(
                    'Organisation.screening.quotaModal.quantityLabel',
                    'Number of credits to purchase'
                  )}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quotaAmountInput}
                  onChange={(event) => setQuotaAmountInput(event.target.value)}
                  className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                />

                <div className="rounded-xl border border-(--border-primary) p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.unitPriceLabel',
                        'Unit price/credit'
                      )}
                    </span>
                    <span className="font-semibold text-(--text-primary)">
                      {hasValidUnitPrice
                        ? `${effectiveOrganisationUnitPrice.toLocaleString('vi-VN')} ${currencyVndLabel}`
                        : t('Organisation.common.notAvailable', 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.totalPaymentLabel',
                        'Total payment'
                      )}
                    </span>
                    <span className="font-bold text-(--text-primary)">
                      {selectedTotalCost.toLocaleString('vi-VN')}{' '}
                      {currencyVndLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.walletBalanceLabel',
                        'Wallet balance'
                      )}
                    </span>
                    <span className="font-semibold text-(--text-primary)">
                      {walletBalance.toLocaleString('vi-VN')} {currencyVndLabel}
                    </span>
                  </div>
                </div>

                {hasEnoughBalance ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    {t(
                      'Organisation.screening.quotaModal.walletSufficient',
                      'Your wallet has sufficient balance to buy quota.'
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                    {t(
                      'Organisation.screening.quotaModal.walletInsufficientPrefix',
                      'Insufficient balance. Missing'
                    )}{' '}
                    <span className="font-semibold">
                      {missingAmount.toLocaleString('vi-VN')} {currencyVndLabel}
                    </span>
                    .{' '}
                    {t(
                      'Organisation.screening.quotaModal.walletInsufficientSuffix',
                      'Please top up your wallet.'
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-(--border-primary) text-sm font-semibold text-(--text-primary) hover:bg-(--bg-tertiary)"
                >
                  {t('Organisation.common.close', 'Close')}
                </button>

                {hasEnoughBalance ? (
                  <button
                    type="button"
                    onClick={handleBuyQuotaFromModal}
                    disabled={buyQuotaMutation.isPending || !hasValidUnitPrice}
                    className="px-4 py-2 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {buyQuotaMutation.isPending
                      ? t('Organisation.common.processing', 'Processing...')
                      : t(
                          'Organisation.screening.actions.buyQuota',
                          'Buy quota'
                        )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTopUpWalletFromModal}
                    disabled={
                      createDepositMutation.isPending ||
                      suggestedTopUpAmount <= 0
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {createDepositMutation.isPending
                      ? t(
                          'Organisation.screening.quotaModal.creatingPayment',
                          'Creating payment...'
                        )
                      : t(
                          'Organisation.screening.quotaModal.topUpAction',
                          'Top up {{amount}} VND',
                          {
                            amount:
                              suggestedTopUpAmount.toLocaleString('vi-VN'),
                          }
                        )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Share modal (email + network trong 1 modal) ── */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-(--text-primary)">
                {t(
                  'Organisation.screeningResult.shareModal.title',
                  'Share screening result'
                )}
              </h3>

              {/* Tab switcher */}
              <div className="mt-3 flex gap-1 rounded-xl bg-(--bg-primary) p-1">
                <button
                  onClick={() => setShareTab('email')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    shareTab === 'email'
                      ? 'bg-(--bg-secondary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  {t(
                    'Organisation.screeningResult.shareModal.tabs.email',
                    'Send email to patient'
                  )}
                </button>
                <button
                  onClick={() => setShareTab('network')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    shareTab === 'network'
                      ? 'bg-(--bg-secondary) text-(--text-primary) shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  {t(
                    'Organisation.screeningResult.shareModal.tabs.network',
                    'Post to Network'
                  )}
                </button>
              </div>

              {/* Tab: email */}
              {shareTab === 'email' && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-(--text-secondary)">
                    {isWalkInPatient
                      ? t(
                          'Organisation.screeningResult.shareModal.email.walkInHint',
                          'Walk-in patient: enter recipient email for result delivery.'
                        )
                      : t(
                          'Organisation.screeningResult.shareModal.email.auraHint',
                          'Aura patient: email is prefilled and can be edited.'
                        )}
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-(--text-tertiary)">
                      {t(
                        'Organisation.screeningResult.shareModal.email.recipientLabel',
                        'Recipient email'
                      )}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-tertiary)" />
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder={t(
                          'Organisation.screeningResult.shareModal.email.placeholder',
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
                        onChange={(e) => setShareIncludePdf(e.target.checked)}
                        className="h-4 w-4"
                      />
                      {t(
                        'Organisation.screeningResult.shareModal.email.attachPdf',
                        'Attach PDF report'
                      )}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-(--text-primary)">
                      <input
                        type="checkbox"
                        checked={shareIncludeRetinalImages}
                        onChange={(e) =>
                          setShareIncludeRetinalImages(e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      {t(
                        'Organisation.screeningResult.shareModal.email.attachRetinalImages',
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
                      {t('Organisation.common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleShareEmail}
                      disabled={sharingEmail}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {sharingEmail && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(
                        'Organisation.screeningResult.shareModal.email.send',
                        'Send share'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: network */}
              {shareTab === 'network' && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-(--text-secondary)">
                    {t(
                      'Organisation.screeningResult.shareModal.network.intro',
                      'Post this screening case to Professional Network as a case presentation. The selected retinal image will be attached.'
                    )}
                  </p>
                  {draft ? (
                    <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) p-3 space-y-1 text-xs text-(--text-secondary)">
                      <p>
                        <span className="font-semibold text-(--text-primary)">
                          {t(
                            'Organisation.screeningResult.shareModal.network.riskLabel',
                            'Risk level:'
                          )}
                        </span>{' '}
                        {draft.riskLevel}
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-semibold text-(--text-primary)">
                          {t(
                            'Organisation.screeningResult.shareModal.network.summaryLabel',
                            'Summary:'
                          )}
                        </span>{' '}
                        {draft.summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {t(
                        'Organisation.screeningResult.shareModal.network.noDraft',
                        'No AI result yet. Please run analysis first.'
                      )}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!sharingNetwork) setShareModalOpen(false);
                      }}
                      disabled={sharingNetwork}
                      className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-secondary)"
                    >
                      {t('Organisation.common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleShareToNetwork}
                      disabled={sharingNetwork || !draft}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {sharingNetwork && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(
                        'Organisation.screeningResult.shareModal.network.post',
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
    </div>
  );
}
