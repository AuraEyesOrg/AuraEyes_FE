import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  ArrowLeft,
  Printer,
  RefreshCw,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Loader2,
  ShieldCheck,
  Activity,
  ScanEye,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { OrganisationScreeningStepper } from '../components/OrganisationScreeningStepper';
import { orgScreeningApi } from '../api/screening.api';
import { unwrapApiData } from '@/types/api-response';
import { aiCoreClient } from '@/lib/axios';
import { getDiseaseUrgency } from '@/features/patient/mock/disease-mapping';
import i18n from '@/i18n/i18n';
import { toDisplayDiseaseName } from '@/features/patient/lib/disease-translation';

type RiskLevel = 'Low' | 'Moderate' | 'High';

interface OrgScreeningSessionDetail {
  screeningId: string;
  patientId: string;
  modelVersion: string;
  createdAt: string;
  rawJsonOutput?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    eyeSide: string;
  }>;
  latestResult?: {
    screeningResultId: string;
    riskLevel: string;
    confidenceScore: number;
    summary?: string;
    findings?: string;
    assessedAt: string;
  };
}

interface AIStandardPrediction {
  rank: number;
  class_name: string;
  confidence: number;
  status: string;
}

interface AIStandardResponse {
  prediction: {
    top_k: AIStandardPrediction[];
  };
  localization?: {
    all_lesions: Array<{
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence?: number;
    }>;
  } | null;
  heatmap_colormap_url?: string;
}

interface DetectionBoxLocation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionBox {
  id: string;
  name: string;
  localizedName: string;
  confidence: number;
  type: 'warning' | 'priority_high' | 'info';
  location: DetectionBoxLocation;
}

interface ImageLayout {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

interface AiFindingItem {
  id: string;
  name: string;
  localizedName: string;
  confidence: number;
  status: string;
}

interface ResultDraft {
  riskLevel: RiskLevel;
  confidenceScore: number;
  summary: string;
  findings: string;
}

const riskConfig: Record<
  RiskLevel,
  { color: string; bg: string; border: string; icon: typeof ShieldCheck }
> = {
  Low: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: ShieldCheck,
  },
  Moderate: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    icon: AlertTriangle,
  },
  High: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800/40',
    icon: AlertCircle,
  },
};

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function normalizeRiskLevel(value?: string): RiskLevel {
  const normalized = value?.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'moderate') return 'Moderate';
  return 'Low';
}

function toRiskLevelFromUrgency(
  urgency: 'critical' | 'warning' | 'caution' | 'info' | 'normal',
  confidence: number
): RiskLevel {
  if (urgency === 'critical') return 'High';

  if (urgency === 'warning') {
    return confidence >= 70 ? 'High' : 'Moderate';
  }

  if (urgency === 'caution') {
    return confidence >= 70 ? 'Moderate' : 'Low';
  }

  return 'Low';
}

function buildSummary(riskLevel: RiskLevel, primaryLabel?: string): string {
  if (riskLevel === 'High') {
    return `Findings need attention from an ophthalmologist${primaryLabel ? ` (${primaryLabel})` : ''}.`;
  }

  if (riskLevel === 'Moderate') {
    return `Some findings may need specialist review${primaryLabel ? ` (${primaryLabel})` : ''}.`;
  }

  return primaryLabel
    ? `Low-risk findings detected (${primaryLabel}). Routine specialist follow-up is recommended.`
    : 'Low-risk findings detected. Routine specialist follow-up is recommended.';
}

function buildFindingsText(items: AiFindingItem[]): string {
  return items
    .slice(0, 4)
    .map((item) => `${item.localizedName} (${item.confidence}%)`)
    .join(', ');
}

function toPercentLocation(
  bbox: { x: number; y: number; width: number; height: number },
  imgWidth: number,
  imgHeight: number
): DetectionBoxLocation | undefined {
  if (imgWidth <= 0 || imgHeight <= 0) return undefined;

  return {
    x: Math.round((bbox.x / imgWidth) * 1000) / 10,
    y: Math.round((bbox.y / imgHeight) * 1000) / 10,
    width: Math.round((bbox.width / imgWidth) * 1000) / 10,
    height: Math.round((bbox.height / imgHeight) * 1000) / 10,
  };
}

function resolveAiAssetUrl(url?: string): string | undefined {
  if (!url) return undefined;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  try {
    const base =
      typeof aiCoreClient.defaults.baseURL === 'string' &&
      aiCoreClient.defaults.baseURL.length > 0
        ? aiCoreClient.defaults.baseURL
        : window.location.origin;

    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function toDetectionType(
  confidence: number,
  status?: string
): 'warning' | 'priority_high' | 'info' {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === 'primary' || confidence >= 70) return 'warning';
  if (confidence >= 45) return 'priority_high';
  return 'info';
}

function getDetectionStyle(type: DetectionBox['type']) {
  if (type === 'warning') {
    return {
      borderColor: 'rgba(239, 68, 68, 0.88)',
      backgroundColor: 'rgba(239, 68, 68, 0.14)',
      labelClass: 'bg-red-600/90 text-white border-red-400/40',
    };
  }

  if (type === 'priority_high') {
    return {
      borderColor: 'rgba(245, 158, 11, 0.88)',
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      labelClass: 'bg-amber-500/90 text-white border-amber-300/40',
    };
  }

  return {
    borderColor: 'rgba(59, 130, 246, 0.82)',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    labelClass: 'bg-blue-500/85 text-white border-blue-300/40',
  };
}

function extractVisualArtifactsFromRaw(
  rawJsonOutput: string | undefined,
  imgWidth: number,
  imgHeight: number,
  language: string
): { boxes: DetectionBox[]; heatmapUrl?: string } {
  if (!rawJsonOutput) return { boxes: [] };

  try {
    const parsed = JSON.parse(rawJsonOutput) as AIStandardResponse & {
      anomalies?: Array<{
        id?: string;
        name?: string;
        confidence?: number;
        status?: string;
        location?: DetectionBoxLocation;
      }>;
    };

    const heatmapUrl = resolveAiAssetUrl(parsed.heatmap_colormap_url);

    const topK = [...(parsed.prediction?.top_k ?? [])].sort(
      (a, b) => a.rank - b.rank
    );
    const lesions = parsed.localization?.all_lesions ?? [];

    if (
      topK.length > 0 &&
      lesions.length > 0 &&
      imgWidth > 0 &&
      imgHeight > 0
    ) {
      const boxes = topK
        .map((prediction, index) => {
          const lesion = lesions[index];
          if (!lesion?.bbox) return null;

          const location = toPercentLocation(lesion.bbox, imgWidth, imgHeight);
          if (!location) return null;

          const confidence = clampConfidence(
            (prediction.confidence ?? 0) * 100
          );

          return {
            id: `${prediction.rank}-${prediction.class_name}`,
            name: prediction.class_name,
            localizedName: toDisplayDiseaseName(
              prediction.class_name,
              language
            ),
            confidence,
            type: toDetectionType(confidence, prediction.status),
            location,
          } satisfies DetectionBox;
        })
        .filter((item): item is DetectionBox => Boolean(item));

      return { boxes, heatmapUrl };
    }

    if (Array.isArray(parsed.anomalies)) {
      const boxes = parsed.anomalies
        .map((item, index) => {
          if (!item.location || !item.name) return null;

          const rawConfidence = Number(item.confidence ?? 0);
          const confidence = clampConfidence(
            rawConfidence > 1 ? rawConfidence : rawConfidence * 100
          );

          return {
            id: item.id ?? `saved-${index + 1}`,
            name: item.name,
            localizedName: toDisplayDiseaseName(item.name, language),
            confidence,
            type: toDetectionType(confidence, item.status),
            location: item.location,
          } satisfies DetectionBox;
        })
        .filter((item): item is DetectionBox => Boolean(item));

      return { boxes, heatmapUrl };
    }

    return { boxes: [], heatmapUrl };
  } catch {
    return { boxes: [] };
  }
}

function extractTopKFromRaw(rawJsonOutput?: string): AIStandardPrediction[] {
  if (!rawJsonOutput) return [];

  try {
    const parsed = JSON.parse(rawJsonOutput) as Partial<AIStandardResponse>;
    const topK = parsed.prediction?.top_k ?? [];
    return [...topK].sort((a, b) => a.rank - b.rank);
  } catch {
    return [];
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error) || !error.response?.data) return fallback;

  const payload = error.response.data as {
    message?: string;
    detail?: string;
    errors?: Array<{ error?: string }>;
  };

  if (payload.message) return payload.message;
  if (payload.detail) return payload.detail;
  if (Array.isArray(payload.errors) && payload.errors[0]?.error) {
    return payload.errors
      .map((item) => item.error)
      .filter(Boolean)
      .join(', ');
  }

  return fallback;
}

export default function OrganisationScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const screeningId = searchParams.get('id');
  const autoAnalysisTriggeredRef = useRef(false);
  const currentLanguage = useMemo(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'vi',
    [i18n.language, i18n.resolvedLanguage]
  );

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sessionData, setSessionData] =
    useState<OrgScreeningSessionDetail | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | undefined>();
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const [aiFindings, setAiFindings] = useState<AiFindingItem[]>([]);
  const [detectedBoxes, setDetectedBoxes] = useState<DetectionBox[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | undefined>();
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedImage =
    sessionData?.images[selectedImageIndex] ?? sessionData?.images[0];

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
  }, [hydrateVisualArtifacts]);

  const hydrateStateFromSession = useCallback(
    (detail: OrgScreeningSessionDetail) => {
      const topK = extractTopKFromRaw(detail.rawJsonOutput);
      const mappedFindings: AiFindingItem[] = topK.slice(0, 6).map((item) => ({
        id: `${item.rank}-${item.class_name}`,
        name: item.class_name,
        localizedName: toDisplayDiseaseName(item.class_name, currentLanguage),
        confidence: clampConfidence((item.confidence ?? 0) * 100),
        status: item.status,
      }));

      setAiFindings(mappedFindings);
      setRawJsonOutput(detail.rawJsonOutput);

      if (detail.latestResult) {
        setDraft({
          riskLevel: normalizeRiskLevel(detail.latestResult.riskLevel),
          confidenceScore: clampConfidence(detail.latestResult.confidenceScore),
          summary:
            detail.latestResult.summary ??
            buildSummary(
              normalizeRiskLevel(detail.latestResult.riskLevel),
              mappedFindings[0]?.localizedName
            ),
          findings:
            detail.latestResult.findings ?? buildFindingsText(mappedFindings),
        });
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
          summary: buildSummary(nextRiskLevel, primary.localizedName),
          findings: buildFindingsText(mappedFindings),
        });
      } else {
        setDraft(null);
      }

      setSaved(false);
    },
    [currentLanguage]
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
        toast.error(getErrorMessage(error, 'Unable to load screening detail.'));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [screeningId, hydrateStateFromSession]
  );

  useEffect(() => {
    if (!screeningId) {
      setLoading(false);
      return;
    }

    autoAnalysisTriggeredRef.current = false;
    void loadSessionDetail(true);
  }, [screeningId, loadSessionDetail]);

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, [updateImageLayout]);

  useEffect(() => {
    updateImageLayout();
  }, [selectedImage?.imageUrl, rawJsonOutput, updateImageLayout]);

  const updateDraft = useCallback(
    <K extends keyof ResultDraft>(key: K, value: ResultDraft[K]) => {
      setDraft((current) => {
        if (!current) return current;
        return { ...current, [key]: value };
      });
      setSaved(false);
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!sessionData || sessionData.images.length === 0 || analyzing) return;

    const targetImage =
      sessionData.images[selectedImageIndex] ?? sessionData.images[0];
    if (!targetImage) return;

    setAnalyzing(true);

    try {
      const imgResponse = await fetch(targetImage.imageUrl);
      const blob = await imgResponse.blob();

      const fileName =
        targetImage.imageUrl.split('/').pop() ??
        `retinal-org-${Date.now().toString()}.jpg`;
      const file = new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('file', file);

      const { data } = await aiCoreClient.post<AIStandardResponse>(
        '/diagnosis/analyze',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { threshold: 0.6, localization: true },
        }
      );

      const topK = [...(data.prediction?.top_k ?? [])]
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 6);

      if (topK.length === 0) {
        throw new Error('AI service returned no prediction data.');
      }

      const mappedFindings: AiFindingItem[] = topK.map((item) => ({
        id: `${item.rank}-${item.class_name}`,
        name: item.class_name,
        localizedName: toDisplayDiseaseName(item.class_name, currentLanguage),
        confidence: clampConfidence((item.confidence ?? 0) * 100),
        status: item.status,
      }));

      const primary = mappedFindings[0];
      const nextRiskLevel = toRiskLevelFromUrgency(
        getDiseaseUrgency(primary.name),
        primary.confidence
      );

      setAiFindings(mappedFindings);
      setRawJsonOutput(JSON.stringify(data));
      setShowHighlights(true);
      setShowHeatmap(false);
      setDraft({
        riskLevel: nextRiskLevel,
        confidenceScore: primary.confidence,
        summary: buildSummary(nextRiskLevel, primary.localizedName),
        findings: buildFindingsText(mappedFindings),
      });
      setSaved(false);

      toast.success(
        'AI analysis completed. You can edit the result before saving.'
      );
    } catch (error) {
      console.error('Organisation AI analysis failed:', error);
      toast.error(
        getErrorMessage(
          error,
          'AI analysis failed. Please check AI service and try again.'
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }, [sessionData, selectedImageIndex, analyzing, currentLanguage]);

  useEffect(() => {
    if (!sessionData || sessionData.latestResult) return;
    if (sessionData.images.length === 0 || analyzing) return;
    if (draft) return;
    if (autoAnalysisTriggeredRef.current) return;

    autoAnalysisTriggeredRef.current = true;
    void handleAnalyze();
  }, [sessionData, analyzing, draft, handleAnalyze]);

  const handleSaveResults = async () => {
    if (!screeningId || !sessionData || !draft) return;

    const jsonOutput = rawJsonOutput ?? sessionData.rawJsonOutput;
    if (!jsonOutput) {
      toast.error('Please run AI analysis before saving this record.');
      return;
    }

    setSaving(true);

    try {
      await orgScreeningApi.saveResults(screeningId, {
        rawJsonOutput: jsonOutput,
        riskLevel: draft.riskLevel,
        confidenceScore: clampConfidence(draft.confidenceScore),
        summary: draft.summary,
        findings: draft.findings,
      });

      setSaved(true);
      toast.success('Screening result saved successfully.');
      await loadSessionDetail(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(
        getErrorMessage(err, 'Unable to save screening result. Please retry.')
      );
    } finally {
      setSaving(false);
    }
  };

  const riskLevel = draft?.riskLevel ?? 'Low';
  const risk = riskConfig[riskLevel] || riskConfig.Low;
  const RiskIcon = risk.icon;

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader pageName="Screening Results" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-(--text-secondary)">
                Loading screening results…
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-[100dvh] overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader pageName="Screening Results" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-(--text-primary) font-semibold">
                Screening not found
              </p>
              <button
                onClick={() => navigate('/organisation/screening')}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
              >
                Go back to screening
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader pageName="Screening Results" />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/organisation/screening')}
                      className="w-10 h-10 rounded-xl bg-(--bg-primary) border border-(--border-primary) flex items-center justify-center hover:bg-(--bg-tertiary) transition"
                    >
                      <ArrowLeft className="w-5 h-5 text-(--text-secondary)" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-(--text-primary)">
                        Screening Results
                      </h1>
                      <p className="text-sm text-(--text-tertiary)">
                        Patient: {sessionData.patientId.slice(0, 8)}… · Session{' '}
                        {screeningId?.slice(0, 8)}… ·{' '}
                        {new Date(sessionData.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => navigate('/organisation/screening')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) transition"
                  >
                    Screening History
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) transition"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={
                      analyzing || loading || !sessionData.images.length
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-60 transition"
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {analyzing ? 'Analyzing…' : 'Re-analyze'}
                  </button>
                  <button
                    onClick={handleSaveResults}
                    disabled={saving || analyzing || !draft}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${
                      saved && !saving
                        ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                        : 'bg-primary text-white shadow-primary/25 hover:bg-primary/90 disabled:opacity-50'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saved && !saving
                      ? 'Saved'
                      : saving
                        ? 'Saving…'
                        : 'Save Record'}
                  </button>
                </div>
              </div>
            </section>

            <OrganisationScreeningStepper activeStep="review-save" />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)">
                  <div className="px-5 py-4 border-b border-(--border-primary) flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        Retinal Viewer
                      </p>
                      <p className="text-xs text-(--text-tertiary)">
                        {selectedImage?.eyeSide ?? 'Unknown eye'} · Image{' '}
                        {Math.min(
                          selectedImageIndex + 1,
                          sessionData.images.length
                        )}
                        /{sessionData.images.length}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {detectedBoxes.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowHighlights((current) => !current)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            showHighlights
                              ? 'border-primary/35 bg-primary/10 text-primary'
                              : 'border-(--border-primary) bg-(--bg-primary) text-(--text-secondary)'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {showHighlights ? 'Hide boxes' : 'Show boxes'}
                        </button>
                      )}

                      {heatmapUrl && (
                        <button
                          type="button"
                          onClick={() => setShowHeatmap((current) => !current)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            showHeatmap
                              ? 'border-amber-300 bg-amber-100 text-amber-700'
                              : 'border-(--border-primary) bg-(--bg-primary) text-(--text-secondary)'
                          }`}
                        >
                          <Activity className="w-3.5 h-3.5" />
                          {showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
                        </button>
                      )}

                      {analyzing ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI
                          scanner active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-(--border-primary) bg-(--bg-primary) px-3 py-1 text-xs font-medium text-(--text-secondary)">
                          <ScanEye className="w-3.5 h-3.5" /> Ready for review
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    ref={imageContainerRef}
                    className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center bg-black"
                  >
                    {selectedImage ? (
                      <>
                        <img
                          ref={imageRef}
                          src={selectedImage.imageUrl}
                          alt="Retinal scan"
                          className="w-full h-full object-contain"
                          onLoad={updateImageLayout}
                        />

                        {showHeatmap && heatmapUrl && imageLayout && (
                          <img
                            src={heatmapUrl}
                            alt="AI heatmap overlay"
                            className="absolute pointer-events-none"
                            style={{
                              left: imageLayout.offsetX,
                              top: imageLayout.offsetY,
                              width: imageLayout.width,
                              height: imageLayout.height,
                              opacity: 0.42,
                              mixBlendMode: 'screen',
                            }}
                          />
                        )}

                        {showHighlights &&
                          detectedBoxes.length > 0 &&
                          imageLayout && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                left: imageLayout.offsetX,
                                top: imageLayout.offsetY,
                                width: imageLayout.width,
                                height: imageLayout.height,
                              }}
                            >
                              {detectedBoxes.map((box) => {
                                const style = getDetectionStyle(box.type);

                                return (
                                  <div
                                    key={box.id}
                                    className="absolute"
                                    style={{
                                      top: `${box.location.y}%`,
                                      left: `${box.location.x}%`,
                                      width: `${box.location.width}%`,
                                      height: `${box.location.height}%`,
                                    }}
                                  >
                                    <div
                                      className="absolute inset-0 rounded-md border-2"
                                      style={{
                                        borderColor: style.borderColor,
                                        backgroundColor: style.backgroundColor,
                                      }}
                                    />
                                    <div
                                      className={`absolute left-0 bottom-full mb-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${style.labelClass}`}
                                    >
                                      {box.localizedName} ({box.confidence}%)
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        {analyzing && (
                          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                            <div
                              className="absolute -top-full left-0 h-full w-full bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent"
                              style={{
                                animation:
                                  'orgScanSweep 2.5s ease-in-out infinite',
                              }}
                            />
                            <div
                              className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
                              style={{
                                animation:
                                  'orgScanCross 2.8s ease-in-out infinite',
                              }}
                            />
                            <div
                              className="absolute inset-0 bg-cyan-300/5"
                              style={{
                                animation:
                                  'orgScanPulse 1.8s ease-in-out infinite',
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="h-24 w-24 rounded-full border border-cyan-300/40"
                                style={{
                                  animation:
                                    'orgScanRing 2.2s ease-out infinite',
                                }}
                              />
                              <span
                                className="absolute h-36 w-36 rounded-full border border-cyan-300/30"
                                style={{
                                  animation:
                                    'orgScanRing 2.2s ease-out 0.65s infinite',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Eye className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                  </div>
                </div>

                {sessionData.images.length > 1 && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {sessionData.images.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(i)}
                          className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                            i === selectedImageIndex
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-(--border-primary) opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.eyeSide}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    AI Candidate Findings
                  </h3>

                  {aiFindings.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {aiFindings.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-(--border-primary) px-3 py-2.5"
                        >
                          <p className="text-sm font-medium text-(--text-primary) truncate">
                            {item.localizedName}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                            <span className="text-(--text-tertiary)">
                              {item.status.replace(/_/g, ' ')}
                            </span>
                            <span className="font-semibold text-(--text-secondary)">
                              {item.confidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-(--text-secondary)">
                      Candidate findings will appear here after AI analysis.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 xl:sticky xl:top-6">
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
                        Risk Level
                      </p>
                      <p className={`text-2xl font-bold ${risk.color}`}>
                        {riskLevel}
                      </p>
                    </div>
                  </div>

                  {draft && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-(--text-secondary)">
                            Confidence
                          </span>
                          <span className="font-semibold text-(--text-primary)">
                            {clampConfidence(draft.confidenceScore)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${clampConfidence(draft.confidenceScore)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(['Low', 'Moderate', 'High'] as RiskLevel[]).map(
                          (item) => (
                            <button
                              key={item}
                              onClick={() => updateDraft('riskLevel', item)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                draft.riskLevel === item
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-(--border-primary) text-(--text-secondary) hover:bg-(--bg-tertiary)'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-(--text-tertiary)">
                          Confidence Score (0-100)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={draft.confidenceScore}
                          onChange={(event) =>
                            updateDraft(
                              'confidenceScore',
                              clampConfidence(Number(event.target.value))
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      AI Summary (Editable)
                    </h3>
                    <textarea
                      value={draft.summary}
                      onChange={(event) =>
                        updateDraft('summary', event.target.value)
                      }
                      rows={4}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </div>
                )}

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      Findings (Editable)
                    </h3>
                    <textarea
                      value={draft.findings}
                      onChange={(event) =>
                        updateDraft('findings', event.target.value)
                      }
                      rows={5}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </div>
                )}

                {!draft && (
                  <div className="rounded-2xl border border-dashed border-(--border-primary) bg-(--bg-secondary) p-5">
                    <p className="text-sm text-(--text-secondary)">
                      <Sparkles className="inline w-4 h-4 mr-1" />
                      AI result is not generated yet. Click Analyze/Re-analyze
                      to run AI and prepare editable output.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-(--text-primary)">
                    Session Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Model</span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.modelVersion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Images</span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.images.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Created</span>
                      <span className="text-(--text-primary) font-medium">
                        {new Date(sessionData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {sessionData.latestResult?.assessedAt && (
                      <div className="flex justify-between">
                        <span className="text-(--text-tertiary)">
                          Last assessed
                        </span>
                        <span className="text-(--text-primary) font-medium">
                          {new Date(
                            sessionData.latestResult.assessedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Session ID</span>
                      <span className="text-(--text-primary) font-medium text-xs">
                        {sessionData.screeningId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
                @keyframes orgScanSweep {
                  0% {
                    transform: translateY(0%);
                    opacity: 0;
                  }
                  12% {
                    opacity: 1;
                  }
                  88% {
                    opacity: 1;
                  }
                  100% {
                    transform: translateY(200%);
                    opacity: 0;
                  }
                }

                @keyframes orgScanCross {
                  0% {
                    transform: translateX(0%);
                    opacity: 0;
                  }
                  12% {
                    opacity: 1;
                  }
                  88% {
                    opacity: 1;
                  }
                  100% {
                    transform: translateX(200%);
                    opacity: 0;
                  }
                }

                @keyframes orgScanPulse {
                  0%,
                  100% {
                    opacity: 0.12;
                  }
                  50% {
                    opacity: 0.32;
                  }
                }

                @keyframes orgScanRing {
                  0% {
                    transform: scale(0.75);
                    opacity: 0.5;
                  }
                  100% {
                    transform: scale(1.5);
                    opacity: 0;
                  }
                }
              `}</style>
        </main>
      </div>
    </div>
  );
}
