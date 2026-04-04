import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { aiCoreClient } from '../../../lib/axios';
import { quotaApi } from '../api/quota.api';
import { screeningApi } from '../api/screening.api';
import { agreeScreeningConsent } from '../api/consent.api';
import { UPLOAD_SCREENING_CONSENT_CONTENT } from '../constants/consent-content';
import { quotaKeys } from '../hooks/use-quota';
import { useQuotaBalance } from '../hooks/use-quota';
import FocusModeLayout from '../components/FocusModeLayout';
import PatientImageViewer from '../components/ImageViewer';
import PatientFindings from '../components/AnalysisSidebar';
import PatientImageStrip from '../components/ReadOnlyImageGallery';
import {
  ToggleState,
  Anomaly,
  RetinalImage,
  Location as AnomalyBox,
} from '../types/type';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { getDiseaseUrgency } from '../mock';
import i18n from '@/i18n/i18n';
import {
  isNormalDisease,
  toDisplayDiseaseName,
} from '@/features/patient/lib/disease-translation';

const tRetinal = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key as never, options as never) as unknown as string;

/** Map AI DiagnosisType → frontend Anomaly type */
function mapDiagnosisType(
  confidence: number
): 'warning' | 'priority_high' | 'info' {
  if (confidence >= 0.6) return 'warning';
  if (confidence >= 0.3) return 'priority_high';
  return 'info';
}

/** Get Tailwind color class based on confidence */
function getColorClass(confidence: number): string {
  if (confidence >= 0.8) return 'bg-red-600';
  if (confidence >= 0.6) return 'bg-red-500';
  if (confidence >= 0.4) return 'bg-orange-500';
  return 'bg-yellow-500';
}

/** Patient-friendly name mapping for common retinal disease classes */
const FRIENDLY_NAMES: Record<string, { name: string; description: string }> = {
  CRVO: {
    name: 'Retinal vein blockage',
    description:
      'A blood flow issue was detected in one of the veins in your retina. An eye specialist can help determine the best course of action.',
  },
  BRVO: {
    name: 'Branch vein blockage',
    description:
      'A partial blood flow issue was found in a branch vein of your retina. Early monitoring can help manage this condition.',
  },
  DR2: {
    name: 'Moderate diabetic eye changes',
    description:
      'Moderate changes related to diabetes were noticed. Regular specialist visits can help protect your vision.',
  },
  DR3: {
    name: 'Signs of diabetic eye changes',
    description:
      'Some changes related to diabetes were noticed in your retina. Regular specialist visits can help protect your vision.',
  },
  CSCR: {
    name: 'Fluid under the retina',
    description:
      'There appears to be some fluid build-up under your retina. This is often manageable with proper care.',
  },
  Normal: {
    name: 'Healthy retina',
    description:
      'Your retinal scan looks normal. Keep up with regular eye check-ups to maintain good eye health.',
  },
  Glaucoma: {
    name: 'Eye pressure concern',
    description:
      'Signs suggest possible elevated eye pressure. An eye specialist can perform additional tests to confirm.',
  },
  Maculopathy: {
    name: 'Macular area changes',
    description:
      'Some changes were detected in the macular region of your retina. A specialist can advise on monitoring.',
  },
  'Preretinal hemorrhage': {
    name: 'Bleeding near the retina',
    description:
      'Some bleeding was detected near the surface of your retina. An eye specialist can evaluate this further.',
  },
  'Macular hole': {
    name: 'Small gap in the macula',
    description:
      'A small gap was detected in the central area of your retina. A specialist can advise on the best approach.',
  },
  'Cotton-wool spots': {
    name: 'Nerve fiber changes',
    description:
      'Some changes in the nerve fibers of your retina were detected. This may warrant further evaluation.',
  },
};

/**
 * Convert AI pixel-based bbox to percentage-based location relative to original image.
 * AI Score-CAM returns coords in the original image pixel space.
 */
function toPercentLocation(
  bbox: { x: number; y: number; width: number; height: number },
  imgWidth: number,
  imgHeight: number
) {
  if (imgWidth === 0 || imgHeight === 0) return undefined;
  return {
    x: Math.round((bbox.x / imgWidth) * 1000) / 10,
    y: Math.round((bbox.y / imgHeight) * 1000) / 10,
    width: Math.round((bbox.width / imgWidth) * 1000) / 10,
    height: Math.round((bbox.height / imgHeight) * 1000) / 10,
  };
}

// --- Standard /analyze response types ---
interface AICentroid {
  x: number;
  y: number;
}
interface AIBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface AILesionLocation {
  centroid: AICentroid;
  bbox: AIBBox;
  area: number;
  confidence: number;
}
interface AIPredictionItem {
  rank: number;
  class_name: string;
  class_index: number;
  confidence: number;
  status: string; // "primary" | "possible_co_occurrence" | "low_probability"
}
interface AIStandardResponse {
  image_id: string;
  filename: string;
  prediction: {
    primary: { class_name: string; class_index: number; confidence: number };
    top_k: AIPredictionItem[];
    multi_disease_analysis: {
      likely_multi_disease: boolean;
      num_candidates: number;
      threshold: number;
      candidates: string[];
    };
  };
  localization: {
    primary: AICentroid | null;
    method: string;
    type: string;
    threshold: number;
    num_lesions: number;
    all_lesions: AILesionLocation[];
  } | null;
  heatmap_colormap_url?: string;
}

/** Get the natural dimensions of an image from its URL */
function getImageNaturalSize(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = url;
  });
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

function extractHeatmapUrlFromRaw(rawJsonOutput?: string): string | undefined {
  if (!rawJsonOutput) return undefined;

  try {
    const parsed = JSON.parse(rawJsonOutput) as Partial<AIStandardResponse>;
    return resolveAiAssetUrl(parsed.heatmap_colormap_url);
  } catch {
    return undefined;
  }
}
/**
 * Map AI standard response → Anomaly[] for the frontend.
 * Faithfully reflects the API top_k predictions.
 * The primary prediction gets the best Score-CAM lesion bbox.
 */
function mapStandardResponseToAnomalies(
  data: AIStandardResponse,
  imgWidth: number,
  imgHeight: number
): Anomaly[] {
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'vi';
  const preferVietnamese = currentLanguage.toLowerCase().startsWith('vi');
  const anomalies: Anomaly[] = [];
  const lesions = data.localization?.all_lesions ?? [];
  const bestLesion = lesions.length > 0 ? lesions[0] : null;

  // Map each top_k prediction → one Anomaly card
  for (const pred of data.prediction.top_k) {
    const isPrimary = pred.rank === 1;
    const friendly = FRIENDLY_NAMES[pred.class_name];
    const localizedDiseaseName = toDisplayDiseaseName(
      pred.class_name,
      currentLanguage
    );

    // Primary gets the best lesion bbox, others get no location
    const location =
      isPrimary && bestLesion
        ? toPercentLocation(bestLesion.bbox, imgWidth, imgHeight)
        : undefined;

    anomalies.push({
      id: String(pred.rank),
      name: pred.class_name,
      confidence: Math.round(pred.confidence * 100),
      description: isPrimary
        ? tRetinal(
            'PatientRetinalAnalysis.analysis.helper.primaryFindingDescription',
            {
              disease: pred.class_name,
              confidence: Math.round(pred.confidence * 100),
            }
          )
        : tRetinal(
            'PatientRetinalAnalysis.analysis.helper.secondaryFindingDescription',
            {
              disease: pred.class_name,
              status: pred.status.replace(/_/g, ' '),
              confidence: Math.round(pred.confidence * 100),
            }
          ),
      color: getColorClass(pred.confidence),
      type: mapDiagnosisType(pred.confidence),
      location,
      friendlyName: preferVietnamese
        ? localizedDiseaseName
        : (friendly?.name ?? pred.class_name),
      friendlyDescription:
        friendly?.description ??
        tRetinal(
          'PatientRetinalAnalysis.analysis.helper.detectedByAiWithReview',
          {
            disease: pred.class_name,
          }
        ),
      isHighest: isPrimary,
    });
  }

  // Additionally, if there are extra lesion regions from Score-CAM,
  // distribute them among the top candidates that don't already have a location
  if (lesions.length > 1) {
    const extraLesions = lesions.slice(1);
    let lesionIdx = 0;
    for (const anomaly of anomalies) {
      if (
        anomaly.isHighest ||
        anomaly.location ||
        lesionIdx >= extraLesions.length
      )
        continue;
      anomaly.location = toPercentLocation(
        extraLesions[lesionIdx].bbox,
        imgWidth,
        imgHeight
      );
      lesionIdx++;
    }
  }

  return anomalies;
}

// Interface for route state from screening-new
interface RouteStateImage {
  id: string;
  name: string;
  preview: string;
  quality?: 'high' | 'medium' | 'low';
}

interface LocationState {
  screeningId?: string; // From new screening flow
  images?: RouteStateImage[];
  source?: string;
  consentAccepted?: boolean;
  rawJsonOutput?: string;
  resultsPersisted?: boolean;
}

const LAST_SCREENING_ID_KEY = 'patient:lastScreeningId';

function loadLastScreeningId(): string | null {
  try {
    return window.localStorage.getItem(LAST_SCREENING_ID_KEY);
  } catch {
    return null;
  }
}

function saveLastScreeningId(id: string) {
  try {
    window.localStorage.setItem(LAST_SCREENING_ID_KEY, id);
  } catch {
    // Ignore storage errors.
  }
}

function clearLastScreeningId() {
  try {
    window.localStorage.removeItem(LAST_SCREENING_ID_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function mapEyeSideLabel(
  eyeSide?: string
): 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes' {
  if (!eyeSide) return 'Both Eyes';
  const normalized = eyeSide.toLowerCase();
  if (normalized === 'left') return 'Left Eye (OS)';
  if (normalized === 'right') return 'Right Eye (OD)';
  return 'Both Eyes';
}

function getFileNameFromUrl(url: string): string {
  try {
    const clean = url.split('?')[0];
    const last = clean.substring(clean.lastIndexOf('/') + 1);
    return last || `retinal-scan-${Date.now()}.jpg`;
  } catch {
    return `retinal-scan-${Date.now()}.jpg`;
  }
}

function inferEyeSideFromName(
  name: string,
  index: number,
  total: number
): 'Left' | 'Right' | 'Both' {
  const n = name.toLowerCase();
  if (total === 1) return 'Both';
  if (n.includes('left') || n.includes('_os') || n.includes('(os)'))
    return 'Left';
  if (n.includes('right') || n.includes('_od') || n.includes('(od)'))
    return 'Right';
  return index % 2 === 0 ? 'Right' : 'Left';
}

/**
 * Restore anomalies from persisted raw JSON. When the payload matches the
 * standard /diagnosis/analyze shape and we have an image URL, bbox locations
 * are recomputed with the same mapping as live analysis.
 */
async function mapSavedAnomaliesFromRaw(
  rawJsonOutput?: string,
  imageUrl?: string
): Promise<{ anomalies: Anomaly[]; rawJsonOutput?: string }> {
  if (!rawJsonOutput) return { anomalies: [] };

  try {
    const parsed = JSON.parse(rawJsonOutput) as unknown;

    if (
      parsed &&
      typeof parsed === 'object' &&
      'prediction' in parsed &&
      (parsed as AIStandardResponse).prediction?.top_k
    ) {
      const standard = parsed as AIStandardResponse;
      let w = 0;
      let h = 0;
      if (imageUrl) {
        const size = await getImageNaturalSize(imageUrl);
        w = size.w;
        h = size.h;
      }
      if (w > 0 && h > 0 && standard.localization?.all_lesions?.length) {
        return {
          anomalies: mapStandardResponseToAnomalies(standard, w, h),
          rawJsonOutput,
        };
      }
      const mapped = standard.prediction.top_k.map((pred, idx) => ({
        id: String(pred.rank ?? idx + 1),
        name: pred.class_name,
        confidence: Math.round((pred.confidence ?? 0) * 100),
        description: tRetinal(
          'PatientRetinalAnalysis.analysis.helper.confidenceDescription',
          {
            disease: pred.class_name,
            confidence: Math.round((pred.confidence ?? 0) * 100),
          }
        ),
        color: getColorClass(pred.confidence ?? 0),
        type: mapDiagnosisType(pred.confidence ?? 0),
        friendlyName: FRIENDLY_NAMES[pred.class_name]?.name ?? pred.class_name,
        friendlyDescription:
          FRIENDLY_NAMES[pred.class_name]?.description ??
          tRetinal('PatientRetinalAnalysis.analysis.helper.detectedByAi', {
            disease: pred.class_name,
          }),
        isHighest: (pred.rank ?? 1) === 1,
      })) as Anomaly[];

      return { anomalies: mapped, rawJsonOutput };
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { anomalies?: unknown }).anomalies)
    ) {
      const withAnomalies = parsed as {
        anomalies: Array<{
          name: string;
          confidence?: number;
          location?: AnomalyBox;
        }>;
      };
      const mapped = withAnomalies.anomalies.map((a, idx) => ({
        id: String(idx + 1),
        name: a.name,
        confidence: Number(a.confidence ?? 0),
        description: tRetinal(
          'PatientRetinalAnalysis.analysis.helper.confidenceDescription',
          {
            disease: a.name,
            confidence: Math.round(Number(a.confidence ?? 0)),
          }
        ),
        color: getColorClass(
          Math.min(1, Math.max(0, Number(a.confidence ?? 0) / 100))
        ),
        type: mapDiagnosisType(
          Math.min(1, Math.max(0, Number(a.confidence ?? 0) / 100))
        ),
        location: a.location,
        friendlyName: FRIENDLY_NAMES[a.name]?.name ?? a.name,
        friendlyDescription:
          FRIENDLY_NAMES[a.name]?.description ??
          tRetinal('PatientRetinalAnalysis.analysis.helper.detectedByAi', {
            disease: a.name,
          }),
        isHighest: idx === 0,
      })) as Anomaly[];

      return { anomalies: mapped, rawJsonOutput };
    }
  } catch {
    // Ignore parse errors and fallback to empty anomalies.
  }

  return { anomalies: [] };
}

export async function hydrateConsultationPreviewAnomalies(
  rawJsonOutput: string | undefined,
  imageUrl: string | undefined
): Promise<Anomaly[]> {
  if (!rawJsonOutput || !imageUrl) return [];
  const { anomalies } = await mapSavedAnomaliesFromRaw(rawJsonOutput, imageUrl);
  return anomalies;
}

// --- Helpers: use AI-generated friendly fields, fallback to raw name/description ---
function friendlyName(anomaly: Anomaly): string {
  return anomaly.friendlyName || anomaly.name;
}

function friendlyDescription(anomaly: Anomaly): string {
  return (
    anomaly.friendlyDescription ||
    anomaly.description ||
    tRetinal('PatientRetinalAnalysis.analysis.helper.detectedByAiTool')
  );
}

function toRiskLevelFromUrgency(
  urgency: 'critical' | 'warning' | 'caution' | 'info' | 'normal',
  confidence: number
): 'low' | 'moderate' | 'high' {
  if (urgency === 'critical') return 'high';

  if (urgency === 'warning') {
    return confidence >= 70 ? 'high' : 'moderate';
  }

  if (urgency === 'caution') {
    return confidence >= 70 ? 'moderate' : 'low';
  }

  return 'low';
}

export default function RetinalAnalysis() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const routeState = location.state as LocationState | null;
  const { data: quotaBalance } = useQuotaBalance();

  const [toggles, setToggles] = useState<ToggleState>({
    vesselSegmentation: false,
    hemorrhages: true,
    exudates: true,
    opticDisc: false,
  });

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | undefined>(
    routeState?.rawJsonOutput
  );
  const [resultsPersisted, setResultsPersisted] = useState<boolean>(
    Boolean(routeState?.resultsPersisted)
  );
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const sessionCreationPromiseRef = useRef<Promise<string> | null>(null);

  // Image management
  const [images, setImages] = useState<RetinalImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const ensureScreeningSession = async (): Promise<string> => {
    if (screeningId) return screeningId;
    if (sessionCreationPromiseRef.current) {
      return sessionCreationPromiseRef.current;
    }

    const createPromise = (async () => {
      if (images.length === 0) {
        throw new Error('No images available to create screening session');
      }

      setIsPreparingSession(true);
      const files = await Promise.all(
        images.map(async (img, idx) => {
          const resp = await fetch(img.url);
          const imgBlob = await resp.blob();
          const fileType = imgBlob.type || 'image/jpeg';
          const fileNameForUpload = img.name || `retinal-scan-${idx + 1}.jpg`;
          return new File([imgBlob], fileNameForUpload, { type: fileType });
        })
      );

      const uploadResp = await screeningApi.uploadRetinalImages(files);
      const uploadedUrls = uploadResp.data?.uploadedUrls ?? [];

      if (uploadedUrls.length === 0) {
        throw new Error('Failed to upload retinal images');
      }

      const retinalImages = uploadedUrls.map((url, idx) => ({
        imageUrl: url,
        eyeSide: inferEyeSideFromName(
          images[idx]?.name || '',
          idx,
          uploadedUrls.length
        ),
        deviceName: 'Retinal Camera',
      }));

      const sessionResp = await screeningApi.createSession({
        modelVersion: '1.0',
        retinalImages,
      });

      const createdId = sessionResp.data?.screeningId;
      if (!createdId) {
        throw new Error('Missing screening ID from createSession response');
      }

      setScreeningId(createdId);
      saveLastScreeningId(createdId);
      setSearchParams({ screeningId: createdId }, { replace: true });
      return createdId;
    })().finally(() => {
      setIsPreparingSession(false);
      sessionCreationPromiseRef.current = null;
    });

    sessionCreationPromiseRef.current = createPromise;
    return createPromise;
  };

  useEffect(() => {
    const queryScreeningId = searchParams.get('screeningId') ?? undefined;
    const storedScreeningId = loadLastScreeningId() ?? undefined;
    const hasFreshRouteImages =
      Boolean(routeState?.images?.length) && !routeState?.screeningId;
    const incomingScreeningId = hasFreshRouteImages
      ? undefined
      : (routeState?.screeningId ?? queryScreeningId ?? storedScreeningId);

    if (hasFreshRouteImages) {
      setScreeningId(null);
      clearLastScreeningId();
      if (queryScreeningId) {
        setSearchParams({}, { replace: true });
      }
    }

    if (
      routeState?.source === 'new-screening' &&
      (!incomingScreeningId || !routeState.consentAccepted)
    ) {
      navigate('/patient/screening/new', { replace: true });
      return;
    }

    if (incomingScreeningId) {
      setScreeningId(incomingScreeningId);
      saveLastScreeningId(incomingScreeningId);

      if (queryScreeningId !== incomingScreeningId) {
        setSearchParams(
          { screeningId: incomingScreeningId },
          { replace: true }
        );
      }
    }

    const loadSession = async () => {
      if (!incomingScreeningId) {
        const routeImages: RetinalImage[] =
          routeState?.images?.map((img) => ({
            id: img.id,
            url: img.preview,
            name: img.name,
            eye:
              img.name.toLowerCase().includes('right') ||
              img.name.toLowerCase().includes('(od)')
                ? 'Right Eye (OD)'
                : img.name.toLowerCase().includes('left') ||
                    img.name.toLowerCase().includes('(os)')
                  ? 'Left Eye (OS)'
                  : 'Both Eyes',
            uploadedAt: new Date().toISOString(),
            analyzed: false,
            anomalies: [],
            heatmapUrl: undefined,
          })) ?? [];

        if (routeImages.length === 0) {
          navigate('/patient/screening/new', { replace: true });
          return;
        }

        setImages(routeImages);
        setSelectedImageId(routeImages[0].id);
        setAnalyzed(false);
        setAnomalies([]);
        return;
      }

      try {
        const response = await screeningApi.getSessionById(incomingScreeningId);
        const persisted = response.data?.images ?? [];

        const mappedPersisted: RetinalImage[] = persisted.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          name: getFileNameFromUrl(img.imageUrl),
          eye: mapEyeSideLabel(img.eyeSide),
          uploadedAt: img.capturedAt,
          analyzed: false,
          anomalies: [],
          heatmapUrl: undefined,
        }));

        const sessionImages = mappedPersisted;

        const mergedRawJson =
          response.data?.rawJsonOutput ?? routeState?.rawJsonOutput;
        const restoredHeatmapUrl = extractHeatmapUrlFromRaw(mergedRawJson);
        setRawJsonOutput(mergedRawJson);
        setResultsPersisted(Boolean(response.data?.latestResult));

        if (sessionImages.length === 0) {
          setErrorMessage(t('PatientRetinalAnalysis.errors.noImagesInSession'));
          return;
        }

        const restoreUrl = sessionImages[0]?.url;
        const restored = await mapSavedAnomaliesFromRaw(
          mergedRawJson,
          restoreUrl
        );
        const restoredAnomalies = restored.anomalies;

        const hydratedImages = sessionImages.map((img, idx) =>
          idx === 0
            ? {
                ...img,
                analyzed: restoredAnomalies.length > 0,
                anomalies: restoredAnomalies,
                heatmapUrl: restoredHeatmapUrl,
              }
            : img
        );

        setImages(hydratedImages);
        setSelectedImageId(hydratedImages[0].id);
        setAnalyzed(restoredAnomalies.length > 0);
        setAnomalies(restoredAnomalies);
        setShowHighlights(restoredAnomalies.length > 0);
      } catch (error) {
        console.error('Failed to load screening session:', error);
        setErrorMessage(t('PatientRetinalAnalysis.errors.loadScreeningFailed'));
      }
    };

    loadSession();
  }, [navigate, routeState, searchParams, setSearchParams]);

  const currentImage =
    images.find((img) => img.id === selectedImageId) || images[0] || null;

  const handleSelectImage = (imageId: string) => {
    setSelectedImageId(imageId);
    const selectedImg = images.find((img) => img.id === imageId);
    if (selectedImg) {
      setAnomalies(selectedImg.anomalies);
      setAnalyzed(selectedImg.analyzed);
      setIsFallback(false);
      setErrorMessage(null);

      if (!selectedImg.heatmapUrl) {
        setShowHeatmap(false);
      }
    }
  };

  // --- Risk score computation (primary finding + disease urgency) ---
  const primaryAnomaly =
    anomalies.find((a) => a.isHighest) ??
    (anomalies.length > 0
      ? [...anomalies].sort((a, b) => b.confidence - a.confidence)[0]
      : null);
  const primaryConfidence = primaryAnomaly?.confidence ?? 0;
  const primaryUrgency = getDiseaseUrgency(primaryAnomaly?.name ?? 'Normal');
  const isPrimaryNormal =
    primaryAnomaly != null
      ? isNormalDisease(primaryAnomaly.name)
      : anomalies.length === 0;

  const riskScore = Math.round(primaryConfidence / 10);
  const riskLevel: 'low' | 'moderate' | 'high' = toRiskLevelFromUrgency(
    primaryUrgency,
    primaryConfidence
  );

  const riskConfig = {
    low: {
      label: t('PatientRetinalAnalysis.risk.low.label'),
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      summary: t('PatientRetinalAnalysis.risk.low.summary'),
    },
    moderate: {
      label: t('PatientRetinalAnalysis.risk.moderate.label'),
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      summary: t('PatientRetinalAnalysis.risk.moderate.summary'),
    },
    high: {
      label: t('PatientRetinalAnalysis.risk.high.label'),
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      summary: t('PatientRetinalAnalysis.risk.high.summary'),
    },
  };

  const healthyRisk = {
    label: t('PatientRetinalAnalysis.risk.healthy.label'),
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    summary: t('PatientRetinalAnalysis.risk.healthy.summary'),
  };

  const risk = isPrimaryNormal ? healthyRisk : riskConfig[riskLevel];

  // --- AI Analysis Handler (AURA AI /analyze endpoint) ---
  const handleAnalyze = async () => {
    if (isAnalyzing || (quotaBalance?.remainingQuota ?? 0) <= 0) return;
    setIsAnalyzing(true);
    setAnalyzed(false);
    setAnomalies([]);
    setIsFallback(false);
    setErrorMessage(null);

    try {
      const imageUrl = currentImage?.url;
      if (!imageUrl) {
        setErrorMessage(t('PatientRetinalAnalysis.errors.noImageForAnalysis'));
        setIsAnalyzing(false);
        return;
      }

      // Deduct 1 quota credit before running AI analysis
      try {
        await quotaApi.deduct();
        // Invalidate quota cache so QuotaBadge reflects the deduction
        queryClient.invalidateQueries({ queryKey: quotaKeys.all });
      } catch (quotaErr) {
        const err = quotaErr as { response?: { status?: number } };
        const message =
          err.response?.status === 402
            ? t('PatientRetinalAnalysis.errors.quotaExceeded')
            : t('PatientRetinalAnalysis.errors.quotaDeductFailed');
        setErrorMessage(message);
        setIsAnalyzing(false);
        return;
      }

      // Get the natural image dimensions for accurate coordinate mapping
      const { w: imgWidth, h: imgHeight } = await getImageNaturalSize(imageUrl);

      // Convert blob/data URL to File for FormData upload
      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();
      const fileName = currentImage?.name || 'retinal-scan.jpg';
      const file = new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('file', file);

      // Call AURA AI standard /diagnosis/analyze endpoint (includes Score-CAM + top_k)
      const { data } = await aiCoreClient.post<AIStandardResponse>(
        '/diagnosis/analyze',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { threshold: 0.6, localization: true },
        }
      );

      const resolvedHeatmapUrl = resolveAiAssetUrl(data.heatmap_colormap_url);

      // Map AI response → deduplicated Anomaly[] with correct image-relative coords
      const mapped = mapStandardResponseToAnomalies(data, imgWidth, imgHeight);
      const rawOutput = JSON.stringify(data);
      setRawJsonOutput(rawOutput);

      let ensuredScreeningId = screeningId;

      if (!screeningId) {
        const files = await Promise.all(
          images.map(async (img, idx) => {
            const resp = await fetch(img.url);
            const imgBlob = await resp.blob();
            const fileType = imgBlob.type || 'image/jpeg';
            const fileNameForUpload = img.name || `retinal-scan-${idx + 1}.jpg`;
            return new File([imgBlob], fileNameForUpload, { type: fileType });
          })
        );

        const uploadResp = await screeningApi.uploadRetinalImages(files);
        const uploadedUrls = uploadResp.data?.uploadedUrls ?? [];

        if (uploadedUrls.length === 0) {
          throw new Error('Failed to upload retinal images');
        }

        const retinalImages = uploadedUrls.map((url, idx) => ({
          imageUrl: url,
          eyeSide: inferEyeSideFromName(
            images[idx]?.name || '',
            idx,
            uploadedUrls.length
          ),
          deviceName: 'Retinal Camera',
        }));

        const sessionResp = await screeningApi.createSession({
          modelVersion: '1.0',
          retinalImages,
        });

        if (sessionResp.data?.screeningId) {
          ensuredScreeningId = sessionResp.data.screeningId;
          setScreeningId(sessionResp.data.screeningId);

          await agreeScreeningConsent(sessionResp.data.screeningId, {
            content: UPLOAD_SCREENING_CONSENT_CONTENT,
          });
        }
      }

      if (!ensuredScreeningId) {
        throw new Error('Screening session not available to save AI results');
      }

      const primaryMapped =
        mapped.find((a) => a.isHighest) ??
        (mapped.length > 0
          ? [...mapped].sort((a, b) => b.confidence - a.confidence)[0]
          : null);
      const persistedConfidence = primaryMapped?.confidence ?? 0;
      const persistedUrgency = getDiseaseUrgency(
        primaryMapped?.name ?? 'Normal'
      );
      const mappedRiskLevel: 'Low' | 'Moderate' | 'High' =
        toRiskLevelFromUrgency(persistedUrgency, persistedConfidence) === 'high'
          ? 'High'
          : toRiskLevelFromUrgency(persistedUrgency, persistedConfidence) ===
              'moderate'
            ? 'Moderate'
            : 'Low';

      const significantFindings = mapped
        .filter((a, idx) => idx === 0 || a.confidence >= 15)
        .slice(0, 3);

      await screeningApi.saveAiResults(ensuredScreeningId, {
        rawJsonOutput: rawOutput,
        riskLevel: mappedRiskLevel,
        confidenceScore: persistedConfidence,
        summary:
          mappedRiskLevel === 'High'
            ? t('PatientRetinalAnalysis.analysis.persistedSummary.high')
            : mappedRiskLevel === 'Moderate'
              ? t('PatientRetinalAnalysis.analysis.persistedSummary.moderate')
              : persistedUrgency === 'normal'
                ? t('PatientRetinalAnalysis.analysis.persistedSummary.normal')
                : t('PatientRetinalAnalysis.analysis.persistedSummary.low'),
        findings: significantFindings
          .map((a) => `${a.name} (${Math.round(a.confidence)}%)`)
          .join(', '),
      });

      setResultsPersisted(true);

      setAnomalies(mapped);
      setShowHighlights(true);

      if (currentImage) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? {
                  ...img,
                  analyzed: true,
                  anomalies: mapped,
                  heatmapUrl: resolvedHeatmapUrl,
                }
              : img
          )
        );
      }
      setAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis failed:', error);

      const err = error as { response?: { status?: number }; message?: string };
      const status = err.response?.status;

      if (status === 503) {
        setErrorMessage(t('PatientRetinalAnalysis.errors.modelLoading'));
      } else if (status === 400) {
        setErrorMessage(t('PatientRetinalAnalysis.errors.invalidImage'));
      } else {
        setErrorMessage(t('PatientRetinalAnalysis.errors.analysisUnavailable'));
      }
      setIsFallback(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatmapUrl = currentImage?.heatmapUrl;
  useEffect(() => {
    if (!heatmapUrl) {
      setShowHeatmap(false);
    }
  }, [heatmapUrl]);
  if (images.length === 0) {
    return null;
  }

  return (
    <FocusModeLayout
      currentStep="analysis"
      title={t('PatientRetinalAnalysis.page.title')}
      exitPath="/patient/screening/new"
      showBreadcrumb={false}
    >
      {/* Left: Image + toggle  |  Right: Summary / Findings / Actions     */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5]">
        {/* --- Main row --- */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT — Image Viewer                                          */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toggle — above image, aligned right */}
            {analyzed && (
              <div className="flex-shrink-0 flex justify-end px-4 py-2">
                {/* Toggle bounding box */}
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">
                    {t('PatientRetinalAnalysis.toggles.showHighlights')}
                  </span>
                  <button
                    role="switch"
                    aria-checked={showHighlights}
                    onClick={() => setShowHighlights(!showHighlights)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showHighlights ? 'bg-cyan-300' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        showHighlights ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                {/* Toggle heatmap overlay nếu có heatmapUrl */}
                {heatmapUrl && (
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600">
                      {t('PatientRetinalAnalysis.toggles.showHeatmap')}
                    </span>
                    <button
                      role="switch"
                      aria-checked={showHeatmap}
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showHeatmap ? 'bg-orange-400' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          showHeatmap ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                )}
              </div>
            )}

            {/* Image — pushed below toggle */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <PatientImageViewer
                toggles={toggles}
                zoomLevel={1}
                anomalies={anomalies}
                isAnalyzing={isAnalyzing}
                currentImage={currentImage}
                showHighlights={showHighlights}
                showHeatmap={showHeatmap}
                heatmapUrl={heatmapUrl}
              />
            </div>

            {/* Image strip below image */}
            {images.length > 1 && (
              <div className="flex-shrink-0 px-4 py-2">
                <PatientImageStrip
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelectImage={handleSelectImage}
                />
              </div>
            )}
          </div>

          {/* RIGHT — Results Panel                                        */}
          <div className="w-[520px] flex-shrink-0 p-6 pl-3 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="px-8 py-8 space-y-7">
                <section>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                      {t('PatientRetinalAnalysis.summary.title')}
                    </h1>
                    {analyzed && (
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}
                      >
                        {risk.icon}
                        {risk.label}
                      </span>
                    )}
                  </div>

                  {/* -- Pre-analysis / Analyzing / Result summary -- */}
                  {!analyzed && !isAnalyzing ? (
                    <div className="space-y-4">
                      <p className="text-[15px] text-slate-500 leading-relaxed">
                        {t(
                          'PatientRetinalAnalysis.summary.preAnalyzeDescription'
                        )}
                      </p>
                      <button
                        onClick={handleAnalyze}
                        disabled={(quotaBalance?.remainingQuota ?? 0) <= 0}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-cyan-500/20"
                      >
                        <Sparkles className="w-5 h-5" />
                        {isPreparingSession
                          ? t('PatientRetinalAnalysis.actions.preparingSession')
                          : (quotaBalance?.remainingQuota ?? 0) <= 0
                            ? t('PatientRetinalAnalysis.actions.outOfQuota')
                            : t(
                                'PatientRetinalAnalysis.actions.startScreening'
                              )}
                      </button>
                      {(quotaBalance?.remainingQuota ?? 0) <= 0 && (
                        <p className="text-sm text-amber-600">
                          {t('PatientRetinalAnalysis.errors.quotaExceeded')}
                        </p>
                      )}
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex items-center gap-4 py-2">
                      <Spinner size={40} className="flex-shrink-0" />
                      <p className="text-[15px] text-slate-500">
                        {t('PatientRetinalAnalysis.summary.analyzing')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[15px] text-slate-600 leading-relaxed">
                        {risk.summary}
                      </p>
                      {isFallback && errorMessage && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {errorMessage}
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* ---- Findings ---- */}
                {analyzed && (
                  <PatientFindings
                    anomalies={anomalies}
                    toggles={toggles}
                    onToggleChange={(key) =>
                      setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    friendlyName={friendlyName}
                    friendlyDescription={friendlyDescription}
                  />
                )}

                {/* ---- Actions ---- */}
                {analyzed && (
                  <section className="space-y-3">
                    <button
                      onClick={() =>
                        navigate('/patient/screening/review', {
                          state: {
                            screeningId,
                            images,
                            anomalies,
                            riskLevel,
                            riskScore,
                            rawJsonOutput,
                            resultsPersisted,
                          },
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-cyan-500/15"
                    >
                      {t('PatientRetinalAnalysis.actions.continueToReview')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="w-full inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('PatientRetinalAnalysis.actions.reanalyze')}
                    </button>
                  </section>
                )}

                {/* ---- Disclaimer ---- */}
                <section className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    <strong className="text-slate-600">
                      {t('PatientRetinalAnalysis.disclaimer.importantLabel')}
                    </strong>{' '}
                    {t('PatientRetinalAnalysis.disclaimer.message')}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FocusModeLayout>
  );
}
