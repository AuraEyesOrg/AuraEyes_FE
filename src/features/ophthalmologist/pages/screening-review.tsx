import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Maximize2,
  Download,
  FileText,
  Eye,
  User,
  Stethoscope,
  Info,
  Settings2,
  Pencil,
  Save,
  X,
  Calendar,
  Eraser,
  PlusSquare,
  Trash2,
  Undo2,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  getOphthalmologistScreeningDetail,
  type OphthalmologistScreeningDetailDto,
  type OphthalmologistRetinalImageDto,
} from '../api/ophthalmologist-screenings.api';
import {
  useConsultationSessions,
  useSubmitVerificationReport,
} from '@/features/consultation/hooks/use-consultation';
import { ConsultationSessionType } from '@/types/consultation';
import { hydrateConsultationPreviewAnomalies } from '@/features/patient/pages/retinal-analysis';
import type { Anomaly } from '@/features/patient/types/type';
import useAuthStore from '@/store/auth-store';
import i18n from '@/i18n/i18n';
import Spinner from '@/components/ui/spinner';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
// import { mergeBoxesIntoRawJson } from '@/features/organisation/utils/screening-result.util';
import type { DetectionBox } from '@/features/organisation/types/screening-result.types';

type RiskLevel = 'None' | 'Low' | 'Moderate' | 'High' | 'Critical';
type EyeSide = 'Left' | 'Right' | 'Both';

interface RetinalImage {
  id: string;
  imageUrl: string;
  eyeSide: EyeSide;
  qualityScore: number;
  capturedAt: string;
  deviceName?: string;
}

interface DetectedFinding {
  id: string;
  name: string;
  description: string;
  confidence: number;
  location?: { x: number; y: number; width: number; height: number };
  severity: 'low' | 'moderate' | 'high';
}

type BoxRect = { x: number; y: number; width: number; height: number };
type TranslateFn = (key: string, fallback: string) => string;
type ShareAssetKind =
  | 'retinal'
  | 'heatmap-matrix'
  | 'heatmap-url'
  | 'annotated'
  | 'boxed-generated';
type ShareAssetOption = {
  id: string;
  label: string;
  previewUrl: string;
  kind: ShareAssetKind;
  sourceImageUrl?: string;
};

const DIAGNOSIS_CODE_PRESETS = [
  { value: 'H35.9', label: 'H35.9 - Retinal disorder, unspecified' },
  {
    value: 'E11.311',
    label: 'E11.311 - Type 2 diabetic retinopathy with macular edema',
  },
  { value: 'H34.9', label: 'H34.9 - Retinal vascular occlusion, unspecified' },
  { value: 'H40.9', label: 'H40.9 - Glaucoma, unspecified' },
  { value: 'OTHER', label: 'Other diagnosis code' },
] as const;

const TREATMENT_PLAN_PRESETS = [
  'Monitor and re-evaluate in 4-6 weeks.',
  'Refer to retina specialist for further evaluation.',
  'Initiate urgent in-person ophthalmic assessment within 24 hours.',
  'Continue current treatment and monitor progression.',
] as const;

const RECOMMENDATION_PRESETS = [
  'Schedule follow-up fundus imaging as advised.',
  'Report immediately if vision becomes blurred or distorted.',
  'Maintain blood sugar and blood pressure control.',
  'Avoid delaying specialist consultation.',
] as const;

type FindingLexiconEntry = {
  en: string;
  vi: string;
  synonyms: string[];
};

const FINDING_LEXICON: FindingLexiconEntry[] = [
  {
    en: 'Diabetic Retinopathy',
    vi: 'Benh vong mac do dai thao duong',
    synonyms: ['diabetic retinopathy', 'dr', 'benh vong mac tieu duong'],
  },
  {
    en: 'Macular Edema',
    vi: 'Phu hoang diem',
    synonyms: ['macular edema', 'edema', 'phu diem vang'],
  },
  {
    en: 'Glaucoma Suspect',
    vi: 'Nghi ngo glaucoma',
    synonyms: ['glaucoma suspect', 'nghi ngo tang nhan ap', 'glaucoma'],
  },
  {
    en: 'Retinal Hemorrhage',
    vi: 'Xuat huyet vong mac',
    synonyms: ['retinal hemorrhage', 'hemorrhage', 'xuat huyet day mat'],
  },
  {
    en: 'Cotton Wool Spot',
    vi: 'Dom bong gon',
    synonyms: ['cotton wool spot', 'cws', 'dom bong', 'dom trang mem'],
  },
  {
    en: 'Age-related Macular Degeneration',
    vi: 'Thoai hoa hoang diem tuoi gia',
    synonyms: [
      'age-related macular degeneration',
      'amd',
      'thoai hoa diem vang',
    ],
  },
  {
    en: 'Hard Exudates',
    vi: 'Xuat tiet cung',
    synonyms: ['hard exudates', 'hard exudate', 'xuat tiet cung', 'exudate'],
  },
  {
    en: 'Fundus Neoplasm',
    vi: 'U day mat',
    synonyms: ['fundus neoplasm', 'retinal tumor', 'u day mat'],
  },
  {
    en: 'Congenital Disc Abnormality',
    vi: 'Bat thuong gai thi bam sinh',
    synonyms: [
      'congenital disc abnormality',
      'optic disc anomaly',
      'bat thuong gai thi',
    ],
  },
  {
    en: 'Myelinated Nerve Fibers',
    vi: 'Tho than kinh co myelin',
    synonyms: [
      'myelinated nerve fibers',
      'myelinated nerve fibre',
      'day than kinh co myelin',
    ],
  },
];

const FINDING_NAME_SUGGESTIONS = Array.from(
  new Set(FINDING_LEXICON.flatMap((item) => [item.en, item.vi]))
);

function normalizeFindingToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function resolveFindingLocale(): 'vi' | 'en' {
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
  return lang.startsWith('vi') ? 'vi' : 'en';
}

function canonicalizeFindingName(name: string, locale: 'vi' | 'en'): string {
  const normalizedName = normalizeFindingToken(name);
  if (!normalizedName) return name.trim();

  for (const entry of FINDING_LEXICON) {
    const candidates = [entry.en, entry.vi, ...entry.synonyms].map(
      normalizeFindingToken
    );
    const isMatched = candidates.some(
      (candidate) =>
        normalizedName === candidate ||
        normalizedName.includes(candidate) ||
        candidate.includes(normalizedName)
    );
    if (isMatched) {
      return locale === 'vi' ? entry.vi : entry.en;
    }
  }

  return name.trim();
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s
  );
}

function mapApiImage(img: OphthalmologistRetinalImageDto): RetinalImage {
  const side = (img.eyeSide ?? '').toLowerCase();
  const eyeSide: EyeSide =
    side === 'right' ? 'Right' : side === 'left' ? 'Left' : 'Both';
  const qRaw =
    img.qualityScore != null && Number.isFinite(Number(img.qualityScore))
      ? Number(img.qualityScore)
      : 0;
  const qualityScore =
    qRaw > 0 && qRaw <= 1 ? Math.round(qRaw * 100) : Math.round(qRaw);
  return {
    id: img.id,
    imageUrl: img.imageUrl,
    eyeSide,
    qualityScore,
    capturedAt: img.capturedAt,
    deviceName: img.deviceName ?? undefined,
  };
}

function normalizeRiskLevel(risk: string | undefined): RiskLevel {
  const level = (risk ?? '').toLowerCase();
  if (level.includes('critical')) return 'Critical';
  if (level.includes('high')) return 'High';
  if (level.includes('moderate') || level.includes('medium')) return 'Moderate';
  if (level.includes('low')) return 'Low';
  return 'None';
}

function toConfidencePercent(score: number | null | undefined): number {
  if (score == null || !Number.isFinite(Number(score))) return 0;
  const n = Number(score);
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function anomalyToFinding(a: Anomaly): DetectedFinding {
  return {
    id: a.id,
    name: a.friendlyName ?? a.name,
    description: a.friendlyDescription ?? a.description,
    confidence: a.confidence,
    location: a.location
      ? {
          x: a.location.x,
          y: a.location.y,
          width: a.location.width,
          height: a.location.height,
        }
      : undefined,
    severity:
      a.confidence >= 80 ? 'high' : a.confidence >= 55 ? 'moderate' : 'low',
  };
}

const getRiskLevelConfig = (
  t: TranslateFn
): Record<RiskLevel, { label: string; color: string; bg: string }> => ({
  None: {
    label: t('Ophthalmologist.screeningReview.risk.none', 'No Risk'),
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  Low: {
    label: t('Ophthalmologist.screeningReview.risk.low', 'Low Risk'),
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  Moderate: {
    label: t('Ophthalmologist.screeningReview.risk.moderate', 'Moderate'),
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  High: {
    label: t('Ophthalmologist.screeningReview.risk.high', 'High Risk'),
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  Critical: {
    label: t('Ophthalmologist.screeningReview.risk.critical', 'Critical'),
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
});

type SidebarTab = 'patient' | 'history' | 'exam' | 'reports';

export default function ScreeningReviewPage() {
  const { t } = useSafeTranslation();
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentDoctorId = user?.roleId ?? '';
  const doctorFilterId = isUuid(currentDoctorId) ? currentDoctorId : undefined;

  const [detail, setDetail] =
    useState<OphthalmologistScreeningDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('exam');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [findings, setFindings] = useState<DetectedFinding[]>([]);
  const [sidebarFindings, setSidebarFindings] = useState<DetectedFinding[]>([]);
  const [overlayEditMode, setOverlayEditMode] = useState(false);
  const [boxOverrides, setBoxOverrides] = useState<Record<string, BoxRect>>({});
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [focusedFinding, setFocusedFinding] = useState<string | null>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisCodePreset, setDiagnosisCodePreset] =
    useState<(typeof DIAGNOSIS_CODE_PRESETS)[number]['value']>('H35.9');
  const [customDiagnosisCode, setCustomDiagnosisCode] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('H35.9');
  const [codingSystem, setCodingSystem] = useState('ICD-10');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [severityLevel, setSeverityLevel] = useState('Moderate');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [diagnosisStatus, setDiagnosisStatus] = useState('Draft');
  const [referralRequired, setReferralRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [isDiagnosisLocked, setIsDiagnosisLocked] = useState(false);
  const [sharingImages, setSharingImages] = useState(false);
  const [showShareImagePicker, setShowShareImagePicker] = useState(false);
  const [shareCandidateAssetId, setShareCandidateAssetId] = useState<
    string | null
  >(null);
  const riskLevelConfig = useMemo(() => getRiskLevelConfig(t), [t]);

  // ─── Heatmap toolkit draggable state ────────────────────────────────────
  const [toolkitPos, setToolkitPos] = useState({ x: 0, y: 0 });
  const [isDraggingToolkit, setIsDraggingToolkit] = useState(false);
  const handleToolkitDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingToolkit) return;
      setToolkitPos((prev: { x: number; y: number }) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    },
    [isDraggingToolkit]
  );

  // ─── Heatmap matrix states ──────────────────────────────────────────────
  const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.55);
  const [heatmapThreshold, setHeatmapThreshold] = useState(0.15);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapEditMode, setHeatmapEditMode] = useState<
    'draw' | 'erase' | null
  >(null);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [brushTargetHeat, setBrushTargetHeat] = useState<number>(1.0);
  const [hasHeatmapEdits, setHasHeatmapEdits] = useState(false);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapDragRef = useRef(false);

  // ─── Manual findings states ──────────────────────────────────────────
  const [newFindingName, setNewFindingName] = useState('');
  const [newFindingDescription, setNewFindingDescription] = useState('');
  const [newFindingSeverity, setNewFindingSeverity] = useState<
    'low' | 'moderate' | 'high'
  >('moderate');
  const [isAddingFinding, setIsAddingFinding] = useState(false);
  const didAutoFillClinicalFindingsRef = useRef(false);

  // ─── Undo stack ────────────────────────────────────────────────────────────
  interface EditorSnapshot {
    findings: DetectedFinding[];
    boxOverrides: Record<string, BoxRect>;
    heatmapData: number[][] | null;
  }
  const undoStackRef = useRef<EditorSnapshot[]>([]);
  const MAX_UNDO = 50;

  /** Push current state onto undo stack before any mutation */
  const pushUndo = useCallback(() => {
    undoStackRef.current.push({
      findings: findings.map((f) => ({
        ...f,
        location: f.location ? { ...f.location } : undefined,
      })),
      boxOverrides: Object.fromEntries(
        Object.entries(boxOverrides).map(([k, v]) => [k, { ...v }])
      ),
      heatmapData: heatmapData ? heatmapData.map((row) => [...row]) : null,
    });
    if (undoStackRef.current.length > MAX_UNDO) {
      undoStackRef.current.shift();
    }
  }, [findings, boxOverrides, heatmapData]);

  const handleUndo = useCallback(() => {
    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return;
    setFindings(snapshot.findings);
    setBoxOverrides(snapshot.boxOverrides);
    setHeatmapData(snapshot.heatmapData);
    setFocusedFinding(null);
  }, []);

  const canUndo = undoStackRef.current.length > 0;

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imgOverlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    kind: 'move' | 'resize-se';
    id: string;
    startClientX: number;
    startClientY: number;
    rect: BoxRect;
    cw: number;
    ch: number;
  } | null>(null);

  const retinalImages = useMemo(
    () => detail?.images.map(mapApiImage) ?? [],
    [detail]
  );

  const submitVerificationReportMutation = useSubmitVerificationReport();
  const consultationSessionsQuery = useConsultationSessions(
    {
      ophthalmologistId: doctorFilterId,
      aiScreeningId: screeningId,
      pageNumber: 1,
      pageSize: 100,
    },
    { enabled: Boolean(screeningId && isUuid(screeningId)) }
  );

  const linkedSessions = consultationSessionsQuery.data?.items ?? [];
  const linkedSession = linkedSessions[0] ?? null;
  const verificationSession =
    linkedSessions.find(
      (session) => session.type === ConsultationSessionType.Verification
    ) ?? null;
  const videoCallSession =
    linkedSessions.find(
      (session) => session.type === ConsultationSessionType.VideoCall
    ) ?? null;
  const clinicBookingSession =
    linkedSessions.find(
      (session) => session.type === ConsultationSessionType.ClinicBooking
    ) ?? null;
  const reportableSession =
    verificationSession ?? videoCallSession ?? clinicBookingSession;

  const reportableSessionId = reportableSession?.id ?? null;
  const isFinalizedDiagnosis =
    isDiagnosisLocked || detail?.reviewStatus?.toLowerCase() === 'approved';
  const resolvedDoctorId =
    doctorFilterId ||
    reportableSession?.ophthalmologistId ||
    linkedSession?.ophthalmologistId ||
    '';

  const shareableAssets = useMemo<ShareAssetOption[]>(() => {
    const assets: ShareAssetOption[] = [];
    const retinalSources = detail?.images.slice(0, 3) ?? [];
    retinalSources.forEach((image, index) => {
      assets.push({
        id: `retinal-${image.id}`,
        label: `Retinal image ${index + 1} (${image.eyeSide})`,
        previewUrl: image.imageUrl,
        kind: 'retinal',
      });
    });

    const rawJson = detail?.rawJsonOutput;
    if (!rawJson) return assets;

    try {
      const parsed = JSON.parse(rawJson) as {
        heatmap_url?: string;
        heatmapUrl?: string;
        heatmap_data?: number[][];
        annotated_image_url?: string;
        annotatedImageUrl?: string;
        image_url?: string;
        doctor_bbox_overrides?: Array<{ location?: BoxRect }>;
      };

      const heatmapUrl = parsed.heatmap_url ?? parsed.heatmapUrl;
      const hasHeatmapMatrix =
        Array.isArray(parsed.heatmap_data) && parsed.heatmap_data.length > 0;

      // Prefer the live matrix (reflects doctor edits) over the static Cloudinary URL
      if (hasHeatmapMatrix && retinalSources[0]) {
        assets.push({
          id: 'heatmap-matrix',
          label: 'Heatmap (edited view)',
          // Use static URL as thumbnail in the picker; actual share renders from matrix
          previewUrl: heatmapUrl ?? retinalSources[0].imageUrl,
          kind: 'heatmap-matrix',
          sourceImageUrl: retinalSources[0].imageUrl,
        });
      } else if (heatmapUrl) {
        assets.push({
          id: 'heatmap-url',
          label: 'Heatmap image (original)',
          previewUrl: heatmapUrl,
          kind: 'heatmap-url',
        });
      }

      const annotatedUrl =
        parsed.annotated_image_url ??
        parsed.annotatedImageUrl ??
        parsed.image_url;
      if (annotatedUrl) {
        assets.push({
          id: 'annotated-url',
          label: 'AI annotated image',
          previewUrl: annotatedUrl,
          kind: 'annotated',
        });
      }

      if (
        (parsed.doctor_bbox_overrides?.length ?? 0) > 0 &&
        retinalSources[0]
      ) {
        assets.push({
          id: 'boxed-generated',
          label: 'Doctor boxed overlay',
          previewUrl: retinalSources[0].imageUrl,
          kind: 'boxed-generated',
          sourceImageUrl: retinalSources[0].imageUrl,
        });
      }
    } catch {
      // ignore malformed rawJson
    }

    return assets;
  }, [detail?.images, detail?.rawJsonOutput, heatmapData]);

  const selectedImage = useMemo(() => {
    return (
      retinalImages.find((i) => i.id === selectedImageId) ??
      retinalImages[0] ??
      null
    );
  }, [retinalImages, selectedImageId]);

  const riskLevelUi = normalizeRiskLevel(detail?.latestResult?.riskLevel);
  const confidencePct = toConfidencePercent(
    detail?.latestResult?.confidenceScore
  );
  const aiConfidencePct = useMemo(() => {
    // Derived from the same `Detected Findings` that we show in the right panel
    if (findings.length === 0) return confidencePct;
    const max = Math.max(...findings.map((f) => f.confidence ?? 0));
    if (!Number.isFinite(max)) return confidencePct;
    return Math.min(100, Math.max(0, Math.round(max)));
  }, [findings, confidencePct]);
  const showAttentionBadge =
    riskLevelUi === 'High' ||
    riskLevelUi === 'Critical' ||
    findings.some((f) => f.severity === 'high');

  const referralPillLabel =
    riskLevelUi === 'High' || riskLevelUi === 'Critical'
      ? t(
          'Ophthalmologist.screeningReview.referral.recommended',
          'Referral Recommended'
        )
      : riskLevelUi === 'Moderate'
        ? t(
            'Ophthalmologist.screeningReview.referral.monitor',
            'Monitor closely'
          )
        : t(
            'Ophthalmologist.screeningReview.referral.routine',
            'Routine follow-up'
          );

  useEffect(() => {
    if (!screeningId || !isUuid(screeningId)) {
      setLoading(false);
      setLoadError(
        t(
          'Ophthalmologist.screeningReview.invalidIdentifier',
          'Invalid screening identifier.'
        )
      );
      setDetail(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const d = await getOphthalmologistScreeningDetail(screeningId);
        if (cancelled) return;
        setDetail(d);
        const first = d.images[0];
        setSelectedImageId(first?.id ?? null);
      } catch (e) {
        if (cancelled) return;
        if (isAxiosError(e) && e.response?.status === 404) {
          setLoadError(
            t(
              'Ophthalmologist.screeningReview.notFound',
              'Screening not found or you do not have access.'
            )
          );
        } else {
          setLoadError(
            t(
              'Ophthalmologist.screeningReview.loadFailed',
              'Could not load screening. Please try again.'
            )
          );
        }
        setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [screeningId, t]);

  useEffect(() => {
    if (!detail?.rawJsonOutput || !selectedImage?.imageUrl) {
      setFindings([]);
      return;
    }

    let cancelled = false;
    hydrateConsultationPreviewAnomalies(
      detail.rawJsonOutput,
      selectedImage.imageUrl
    ).then((anomalies) => {
      if (cancelled) return;
      const mapped = anomalies.map(anomalyToFinding);
      setSidebarFindings(mapped);

      // Check if doctor bbox overrides were saved previously
      try {
        const rawJson = detail?.rawJsonOutput ?? '';
        if (!rawJson) {
          setFindings(mapped);
          return;
        }
        const parsed = JSON.parse(rawJson) as Record<string, unknown>;
        const saved = parsed.doctor_bbox_overrides as
          | Array<{
              id: string;
              name: string;
              description?: string;
              confidence: number;
              severity: 'low' | 'moderate' | 'high';
              location: { x: number; y: number; width: number; height: number };
            }>
          | undefined;

        const manualSaved = parsed.doctor_manual_findings as
          | DetectedFinding[]
          | undefined;

        if (saved && Array.isArray(saved) && saved.length > 0) {
          // Use saved overlay state instead of AI-parsed bboxes
          setFindings(
            saved.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description ?? s.name,
              confidence: s.confidence,
              severity: s.severity,
              location: s.location,
            }))
          );
        } else {
          setFindings(mapped);
        }

        if (manualSaved && Array.isArray(manualSaved)) {
          setSidebarFindings([...mapped, ...manualSaved]);
        } else {
          setSidebarFindings(mapped);
        }
      } catch {
        setFindings(mapped);
        setSidebarFindings(mapped);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [detail?.rawJsonOutput, selectedImage?.imageUrl]);

  useEffect(() => {
    setBoxOverrides({});
  }, [detail?.rawJsonOutput, selectedImage?.imageUrl]);

  // ─── Parse heatmap_data từ rawJsonOutput ──────────────────────────────────
  useEffect(() => {
    if (!detail?.rawJsonOutput) {
      setHeatmapData(null);
      setShowHeatmap(false);
      return;
    }
    try {
      const parsed = JSON.parse(detail.rawJsonOutput) as {
        heatmap_data?: number[][];
      };
      const data = parsed.heatmap_data ?? null;
      setHeatmapData(data);
      if (!data) setShowHeatmap(false);
    } catch {
      setHeatmapData(null);
    }
  }, [detail?.rawJsonOutput]);

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
          // Hide cold spots entirely
          imageData.data[idx + 3] = 0;
        } else {
          // Normalize value above threshold
          const nv = (v - heatmapThreshold) / (1 - heatmapThreshold);

          // JET colormap
          const r4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 3)));
          const g4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 2)));
          const b4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 1)));

          // Alpha scaling for smoother transition
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
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rows = heatmapData.length;
      const cols = heatmapData[0].length;

      // transform client px to 64x64 grid coordinates
      const c = Math.floor((x / rect.width) * cols);
      const r = Math.floor((y / rect.height) * rows);

      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        setHasHeatmapEdits(true);
        if (!heatmapDragRef.current) pushUndo();
        setHeatmapData((prev) => {
          if (!prev) return prev;
          const next = prev.map((row) => [...row]); // shallow clone rows
          const intensity = 0.15; // Speed of blending into target color

          for (let ir = -brushSize; ir <= brushSize; ir++) {
            for (let ic = -brushSize; ic <= brushSize; ic++) {
              const distSq = ir * ir + ic * ic;
              if (distSq <= brushSize * brushSize) {
                const nr = r + ir;
                const nc = c + ic;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  // falloff mượt hơn (Gaussian-like curve)
                  const dist = Math.sqrt(distSq);
                  const falloff = Math.pow(1 - dist / brushSize, 1.5);

                  const current = next[nr][nc];
                  const target =
                    heatmapEditMode === 'erase' ? 0 : brushTargetHeat;

                  // Trộn dần về target
                  const blendAmount = intensity * falloff;
                  next[nr][nc] = current + (target - current) * blendAmount;
                }
              }
            }
          }
          return next;
        });
      }
    },
    [heatmapData, heatmapEditMode, brushSize, brushTargetHeat]
  );

  /** Convert current findings + boxOverrides → DetectionBox[] để persist về server */
  const buildDetectionBoxesForSave = useCallback((): DetectionBox[] => {
    return findings
      .filter((f) => f.location)
      .map((f): DetectionBox => {
        const loc = boxOverrides[f.id] ?? f.location!;
        return {
          id: f.id,
          name: f.name,
          localizedName: f.name,
          confidence: f.confidence,
          type:
            f.severity === 'high'
              ? 'warning'
              : f.severity === 'moderate'
                ? 'priority_high'
                : 'info',
          location: {
            x: loc.x,
            y: loc.y,
            width: loc.width,
            height: loc.height,
          },
          source: 'ai',
        };
      });
  }, [findings, boxOverrides]);

  const getEffectiveBox = (findingId: string): BoxRect | undefined => {
    const o = boxOverrides[findingId];
    if (o) return o;
    return findings.find((f) => f.id === findingId)?.location;
  };

  const beginOverlayDrag = (
    e: React.PointerEvent,
    findingId: string,
    kind: 'move' | 'resize-se'
  ) => {
    if (!overlayEditMode || !imgOverlayRef.current) return;
    pushUndo();
    setFocusedFinding(findingId);
    const wrap = imgOverlayRef.current;
    const cr = wrap.getBoundingClientRect();
    const base = getEffectiveBox(findingId);
    if (!base) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      kind,
      id: findingId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      rect: { ...base },
      cw: cr.width,
      ch: cr.height,
    };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dxPct = ((ev.clientX - d.startClientX) / d.cw) * 100;
      const dyPct = ((ev.clientY - d.startClientY) / d.ch) * 100;
      if (d.kind === 'move') {
        let nx = d.rect.x + dxPct;
        let ny = d.rect.y + dyPct;
        nx = Math.max(0, Math.min(100 - d.rect.width, nx));
        ny = Math.max(0, Math.min(100 - d.rect.height, ny));
        setBoxOverrides((prev) => ({
          ...prev,
          [d.id]: { ...d.rect, x: nx, y: ny },
        }));
      } else {
        let nw = d.rect.width + dxPct;
        let nh = d.rect.height + dyPct;
        nw = Math.max(2, Math.min(100 - d.rect.x, nw));
        nh = Math.max(2, Math.min(100 - d.rect.y, nh));
        setBoxOverrides((prev) => ({
          ...prev,
          [d.id]: { ...d.rect, width: nw, height: nh },
        }));
      }
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const resetOverlayBoxes = () => {
    pushUndo();
    setBoxOverrides({});
    setHasHeatmapEdits(false);
    if (detail?.rawJsonOutput) {
      try {
        const parsed = JSON.parse(detail.rawJsonOutput) as {
          heatmap_data?: number[][];
        };
        setHeatmapData(parsed.heatmap_data ?? null);
      } catch {
        setHeatmapData(null);
      }
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleAddNewBox = useCallback(() => {
    pushUndo();
    const newBoxId = `custom-box-${Date.now()}`;
    const cx = 40;
    const cy = 40;
    const cw = 15;
    const ch = 15;
    const newFinding: DetectedFinding = {
      id: newBoxId,
      name: 'Custom User Box',
      description: 'Manual annotation',
      confidence: 100,
      severity: 'moderate',
      location: { x: cx, y: cy, width: cw, height: ch },
    };
    setFindings((prev) => [...prev, newFinding]);
    setBoxOverrides((prev) => ({
      ...prev,
      [newBoxId]: { x: cx, y: cy, width: cw, height: ch },
    }));
    setOverlayEditMode(true);
    setFocusedFinding(newBoxId);
    setShowOverlay(true);
  }, []);

  const handleChangeFocusedBoxColor = (
    severity: 'low' | 'moderate' | 'high'
  ) => {
    if (!focusedFinding) return;
    pushUndo();
    setFindings((prev) =>
      prev.map((f) => (f.id === focusedFinding ? { ...f, severity } : f))
    );
  };

  const handleDeleteFocusedBox = useCallback(() => {
    if (!focusedFinding) return;
    pushUndo();
    setFindings((prev) => prev.filter((f) => f.id !== focusedFinding));
    setBoxOverrides((prev) => {
      const next = { ...prev };
      delete next[focusedFinding];
      return next;
    });
    setFocusedFinding(null);
  }, [focusedFinding]);

  const handleFullscreen = () => {
    if (!imageContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (imageContainerRef.current.requestFullscreen) {
        imageContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const [savingEdits, setSavingEdits] = useState(false);

  const handleSaveEdits = useCallback(async () => {
    if (!screeningId || !detail?.rawJsonOutput) return;
    if (isFinalizedDiagnosis) {
      ophthalToast.info(
        t(
          'Ophthalmologist.screeningReview.status.finalizedLocked',
          'This case is finalized. Editing is locked.'
        )
      );
      return;
    }
    setSavingEdits(true);
    try {
      // Parse the original JSON, preserve everything, only add our overlay data
      const parsed = JSON.parse(detail.rawJsonOutput) as Record<
        string,
        unknown
      >;

      // Save bbox state as a separate overlay layer (keeps original AI data intact)
      const currentBoxes = findings
        .filter((f) => f.location)
        .map((f) => {
          const loc = boxOverrides[f.id] ?? f.location!;
          return {
            id: f.id,
            name: f.name,
            description: f.description,
            confidence: f.confidence,
            severity: f.severity,
            location: {
              x: loc.x,
              y: loc.y,
              width: loc.width,
              height: loc.height,
            },
          };
        });
      parsed.doctor_bbox_overrides = currentBoxes;

      // Write heatmap_data if edited
      if (hasHeatmapEdits && heatmapData) {
        parsed.heatmap_data = heatmapData;
      }

      // Persist manual findings
      // We identify manual findings by their ID prefix 'manual-find-'
      parsed.doctor_manual_findings = sidebarFindings.filter((sf) =>
        sf.id.startsWith('manual-find-')
      );

      const finalJsonString = JSON.stringify(parsed);

      const { api } = await import('@/lib/api');
      await api.post(`/screenings/${screeningId}/save-results`, {
        rawJsonOutput: finalJsonString,
        riskLevel: detail.latestResult?.riskLevel ?? 'Low',
        confidenceScore: detail.latestResult?.confidenceScore ?? 0,
        summary: detail.latestResult?.summary,
        findings: detail.latestResult?.findings,
      });

      // Cập nhật local state để reflect dữ liệu đã lưu
      setDetail((prev) =>
        prev ? { ...prev, rawJsonOutput: finalJsonString } : prev
      );
      setBoxOverrides({});
      setHasHeatmapEdits(false);
      undoStackRef.current = [];
      ophthalToast.success(
        t(
          'Ophthalmologist.screeningReview.toast.saveSuccess',
          'Đã lưu chỉnh sửa thành công.'
        )
      );
    } catch (e) {
      ophthalToast.error(
        t(
          'Ophthalmologist.screeningReview.toast.saveFailed',
          'Lỗi khi lưu chỉnh sửa.'
        )
      );
    } finally {
      setSavingEdits(false);
    }
  }, [
    screeningId,
    detail,
    isFinalizedDiagnosis,
    hasHeatmapEdits,
    heatmapData,
    buildDetectionBoxesForSave,
    t,
    sidebarFindings,
    findings,
  ]);

  const handleFocusFinding = (findingId: string) => {
    setFocusedFinding(findingId);
    // Could also animate/scroll to the finding location
  };

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'moderate':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const aiFindingsNarrative = useMemo(() => {
    if (sidebarFindings.length === 0) return '';
    const locale = resolveFindingLocale();
    const normalizedSet = new Set<string>();
    const lines: string[] = [];

    for (const item of sidebarFindings) {
      const canonicalName = canonicalizeFindingName(item.name, locale);
      const dedupeKey = normalizeFindingToken(canonicalName);
      if (!dedupeKey || normalizedSet.has(dedupeKey)) {
        continue;
      }
      normalizedSet.add(dedupeKey);
      lines.push(canonicalName);
      if (lines.length >= 8) break;
    }

    return lines.join('\n');
  }, [sidebarFindings]);

  const handleDownloadPdf = useCallback(async () => {
    if (downloadingPdf || !screeningId) return;
    setDownloadingPdf(true);
    try {
      const { api } = await import('@/lib/api');
      const { downloadBlobFile, getFileNameFromContentDisposition } =
        await import('@/lib/file-export');

      // Attempt to download from common endpoint
      const response = reportableSessionId
        ? await api
            .get(`/consultation-sessions/${reportableSessionId}/report-pdf`, {
              responseType: 'blob',
            })
            .catch(() =>
              api.get(`/screenings/${screeningId}/report-pdf`, {
                responseType: 'blob',
              })
            )
        : await api
            .get(`/screenings/${screeningId}/report-pdf`, {
              responseType: 'blob',
            })
            .catch(() =>
              api.get(`/organisations/screenings/${screeningId}/report-pdf`, {
                responseType: 'blob',
              })
            );

      const fallbackFileName = `screening-report-${screeningId.slice(0, 8)}.pdf`;
      const fileName =
        getFileNameFromContentDisposition(
          response.headers?.['content-disposition'] as string
        ) || fallbackFileName;

      downloadBlobFile(response.data as Blob, fileName);
      ophthalToast.success(
        t(
          'Ophthalmologist.screeningReview.toast.downloadReportSuccess',
          'Đã tải báo cáo PDF.'
        )
      );
    } catch (error) {
      ophthalToast.error(
        t(
          'Ophthalmologist.screeningReview.toast.downloadReportError',
          'Không thể tải báo cáo PDF.'
        )
      );
    } finally {
      setDownloadingPdf(false);
    }
  }, [screeningId, downloadingPdf, reportableSessionId, t]);

  useEffect(() => {
    const effectiveCode =
      diagnosisCodePreset === 'OTHER'
        ? customDiagnosisCode.trim()
        : diagnosisCodePreset;
    setDiagnosisCode(effectiveCode);
  }, [diagnosisCodePreset, customDiagnosisCode]);

  useEffect(() => {
    if (!showDiagnosisModal) {
      didAutoFillClinicalFindingsRef.current = false;
      return;
    }

    if (didAutoFillClinicalFindingsRef.current) return;
    if (clinicalFindings.trim().length > 0) return;
    if (!aiFindingsNarrative) return;

    setClinicalFindings(aiFindingsNarrative);
    didAutoFillClinicalFindingsRef.current = true;
  }, [showDiagnosisModal, clinicalFindings, aiFindingsNarrative]);

  const handleSubmitDiagnosis = async () => {
    if (isFinalizedDiagnosis) {
      ophthalToast.info(
        t(
          'Ophthalmologist.screeningReview.status.finalizedLocked',
          'This case is finalized. Editing is locked.'
        )
      );
      return;
    }

    if (
      consultationSessionsQuery.isLoading ||
      consultationSessionsQuery.isFetching
    ) {
      const message = t(
        'Ophthalmologist.screeningReview.sessionLinkLoading',
        'Still loading linked consultation session. Please retry in a moment.'
      );
      ophthalToast.info(message);
      return;
    }

    if (!resolvedDoctorId) {
      const message = t(
        'Ophthalmologist.screeningReview.validation.missingDoctorIdentity',
        'Missing doctor identity.'
      );
      ophthalToast.error(message);
      return;
    }

    if (!reportableSessionId) {
      const message = linkedSession
        ? t(
            'Ophthalmologist.screeningReview.validation.invalidLinkedSession',
            `Linked consultation exists but it is "${linkedSession.typeName}". Only Verification, VideoCall, or ClinicBooking sessions can submit this report.`
          )
        : t(
            'Ophthalmologist.screeningReview.validation.noLinkedSession',
            'No linked Verification, VideoCall, or ClinicBooking session was found for this screening.'
          );
      ophthalToast.error(message);
      return;
    }

    const normalizedDiagnosisCode = diagnosisCode.trim();
    const normalizedFindings = clinicalFindings.trim();

    if (!normalizedDiagnosisCode || !normalizedFindings) {
      const message = t(
        'Ophthalmologist.screeningReview.validation.requiredDiagnosisAndFindings',
        'Diagnosis code and clinical findings are required before saving.'
      );
      ophthalToast.error(message);
      return;
    }

    try {
      await submitVerificationReportMutation.mutateAsync({
        sessionId: reportableSessionId,
        doctorId: resolvedDoctorId,
        diagnosisCode: normalizedDiagnosisCode,
        diagnosesCode: normalizedDiagnosisCode,
        codingSystem: codingSystem.trim() || undefined,
        clinicalFindings: normalizedFindings,
        diagnosesText: normalizedFindings,
        severityLevel: severityLevel.trim() || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        recommendations: recommendations.trim() || undefined,
        isUrgent,
        status: diagnosisStatus.trim() || undefined,
        followUpDate: followUpDate
          ? new Date(`${followUpDate}T00:00:00`).toISOString()
          : undefined,
        isReferralNeeded: referralRequired,
        finalizedAt:
          diagnosisStatus.trim().toLowerCase() === 'finalized'
            ? new Date().toISOString()
            : undefined,
      });

      // Persist bbox/heatmap edits vào rawJsonOutput (nếu có chỉnh sửa và rawJson tồn tại)
      const hasBoxEdits = Object.keys(boxOverrides).length > 0;
      if (
        (hasBoxEdits || hasHeatmapEdits) &&
        detail?.rawJsonOutput &&
        screeningId
      ) {
        try {
          // Use the same logic as handleSaveEdits for consistency
          const currentBoxes = findings
            .filter((f) => f.location)
            .map((f) => {
              const loc = boxOverrides[f.id] ?? f.location!;
              return {
                id: f.id,
                name: f.name,
                description: f.description,
                confidence: f.confidence,
                severity: f.severity,
                location: {
                  x: loc.x,
                  y: loc.y,
                  width: loc.width,
                  height: loc.height,
                },
              };
            });

          const parsed = JSON.parse(detail.rawJsonOutput) as Record<
            string,
            unknown
          >;
          parsed.doctor_bbox_overrides = currentBoxes;

          if (hasHeatmapEdits && heatmapData) {
            parsed.heatmap_data = heatmapData;
          }

          parsed.doctor_manual_findings = sidebarFindings.filter((sf) =>
            sf.id.startsWith('manual-find-')
          );

          const finalJsonString = JSON.stringify(parsed);

          await import('@/lib/api').then(({ api }) =>
            api.post(`/screenings/${screeningId}/save-results`, {
              rawJsonOutput: finalJsonString,
              riskLevel: detail.latestResult?.riskLevel ?? 'Low',
              confidenceScore: detail.latestResult?.confidenceScore ?? 0,
              summary: detail.latestResult?.summary,
              findings: detail.latestResult?.findings,
            })
          );
        } catch (bboxErr) {
          // bbox save không nên làm fail toàn bộ flow diagnosis
          console.warn('Bbox save failed (non-critical):', bboxErr);
        }
      }

      ophthalToast.success(
        t(
          'Ophthalmologist.screeningReview.toast.saveSuccess',
          'Diagnosis report saved successfully.'
        )
      );
      if (diagnosisStatus.trim().toLowerCase() === 'finalized') {
        setIsDiagnosisLocked(true);
      }
      setShowDiagnosisModal(false);
    } catch (error) {
      const message =
        isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : t(
              'Ophthalmologist.screeningReview.toast.saveFailed',
              'Failed to submit diagnosis report. Please try again.'
            );

      ophthalToast.error(message);
    }
  };

  const handleOpenShareImagePicker = useCallback(() => {
    if (!reportableSessionId) {
      ophthalToast.error(
        t(
          'Ophthalmologist.screeningReview.validation.noLinkedSession',
          'No linked Verification, VideoCall, or ClinicBooking session was found for this screening.'
        )
      );
      return;
    }

    if (shareableAssets.length === 0) {
      ophthalToast.error(
        t(
          'Ophthalmologist.screeningReview.share.noImages',
          'No retinal images available to share.'
        )
      );
      return;
    }
    setShareCandidateAssetId(shareableAssets[0].id);
    setShowShareImagePicker(true);
  }, [reportableSessionId, shareableAssets, t]);

  const handleShareRetinalImage = useCallback(async () => {
    if (!reportableSessionId || !shareCandidateAssetId) return;
    const selectedAsset = shareableAssets.find(
      (asset) => asset.id === shareCandidateAssetId
    );
    if (!selectedAsset) return;

    setSharingImages(true);
    try {
      const { sendSessionMessage, uploadChatImages } =
        await import('@/features/consultation/api/consultation.api');

      // Composite heatmap matrix + retinal image → upload
      const uploadHeatmapComposite = async (
        sourceImageUrl: string,
        currentHeatmapData: number[][],
        opacity: number,
        threshold: number
      ): Promise<string | null> => {
        const rows = currentHeatmapData.length;
        const cols = currentHeatmapData[0]?.length ?? 0;
        if (rows === 0 || cols === 0) return null;

        const imageElement = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error('Failed to load source image'));
            img.src = sourceImageUrl;
          }
        );

        // Render the heatmap matrix to an offscreen canvas (same JET algorithm)
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = cols;
        heatCanvas.height = rows;
        const heatCtx = heatCanvas.getContext('2d');
        if (!heatCtx) return null;
        const heatImageData = heatCtx.createImageData(cols, rows);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const v = Math.max(0, Math.min(1, currentHeatmapData[r]?.[c] ?? 0));
            const idx = (r * cols + c) * 4;
            if (v <= threshold) {
              heatImageData.data[idx + 3] = 0;
            } else {
              const nv = (v - threshold) / (1 - threshold);
              const rr = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 3)));
              const gg = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 2)));
              const bb = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 1)));
              const alpha = Math.min(
                255,
                Math.max(0, Math.round((0.3 + 0.7 * nv) * 255))
              );
              heatImageData.data[idx] = Math.round(rr * 255);
              heatImageData.data[idx + 1] = Math.round(gg * 255);
              heatImageData.data[idx + 2] = Math.round(bb * 255);
              heatImageData.data[idx + 3] = alpha;
            }
          }
        }
        heatCtx.putImageData(heatImageData, 0, 0);

        // Composite: retinal image below, heatmap on top
        const composite = document.createElement('canvas');
        composite.width = imageElement.width;
        composite.height = imageElement.height;
        const ctx = composite.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(imageElement, 0, 0);
        ctx.globalAlpha = opacity;
        ctx.drawImage(heatCanvas, 0, 0, composite.width, composite.height);
        ctx.globalAlpha = 1;

        const blob = await new Promise<Blob | null>((resolve) =>
          composite.toBlob(resolve, 'image/png')
        );
        if (!blob) return null;
        const file = new File([blob], `heatmap-composite-${Date.now()}.png`, {
          type: 'image/png',
        });
        const uploadResult = await uploadChatImages([file]);
        return uploadResult.uploadedUrls[0] ?? null;
      };

      const uploadGeneratedBoxedImage = async (
        sourceImageUrl: string
      ): Promise<string | null> => {
        const rawJson = detail?.rawJsonOutput;
        if (!rawJson) return null;
        const parsed = JSON.parse(rawJson) as {
          doctor_bbox_overrides?: Array<{
            location?: { x: number; y: number; width: number; height: number };
          }>;
        };
        const boxes = parsed.doctor_bbox_overrides ?? [];
        if (boxes.length === 0) return null;

        const imageElement = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error('Failed to load source image'));
            img.src = sourceImageUrl;
          }
        );

        const canvas = document.createElement('canvas');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(imageElement, 0, 0);
        ctx.lineWidth = Math.max(
          2,
          Math.round(Math.min(canvas.width, canvas.height) * 0.004)
        );
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239,68,68,0.18)';

        boxes.forEach((item) => {
          const loc = item.location;
          if (!loc) return;
          const isPercent =
            loc.x <= 100 &&
            loc.y <= 100 &&
            loc.width <= 100 &&
            loc.height <= 100;
          const x = isPercent ? (loc.x / 100) * canvas.width : loc.x;
          const y = isPercent ? (loc.y / 100) * canvas.height : loc.y;
          const width = isPercent
            ? (loc.width / 100) * canvas.width
            : loc.width;
          const height = isPercent
            ? (loc.height / 100) * canvas.height
            : loc.height;
          if (width <= 0 || height <= 0) return;
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (!blob) return null;

        const boxedFile = new File([blob], `doctor-boxed-${Date.now()}.png`, {
          type: 'image/png',
        });
        const uploadResult = await uploadChatImages([boxedFile]);
        return uploadResult.uploadedUrls[0] ?? null;
      };

      await sendSessionMessage(reportableSessionId, {
        message: t(
          'Ophthalmologist.screeningReview.share.header',
          'Shared retinal image for this screening review:'
        ),
      });

      let finalUrl = selectedAsset.previewUrl;
      if (
        selectedAsset.kind === 'heatmap-matrix' &&
        selectedAsset.sourceImageUrl &&
        heatmapData &&
        heatmapData.length > 0
      ) {
        const uploadedUrl = await uploadHeatmapComposite(
          selectedAsset.sourceImageUrl,
          heatmapData,
          heatmapOpacity,
          heatmapThreshold
        );
        if (uploadedUrl) {
          finalUrl = uploadedUrl;
        }
      } else if (
        selectedAsset.kind === 'boxed-generated' &&
        selectedAsset.sourceImageUrl
      ) {
        const uploadedUrl = await uploadGeneratedBoxedImage(
          selectedAsset.sourceImageUrl
        );
        if (uploadedUrl) {
          finalUrl = uploadedUrl;
        }
      }

      await sendSessionMessage(reportableSessionId, {
        message: `[Image Attached: ${finalUrl} | Name: ${selectedAsset.label}]`,
      });

      ophthalToast.success(
        t(
          'Ophthalmologist.screeningReview.share.success',
          'Shared retinal image to consultation chat.'
        )
      );
      setShowShareImagePicker(false);
      setShareCandidateAssetId(null);
    } catch (error) {
      ophthalToast.error(
        t(
          'Ophthalmologist.screeningReview.share.failed',
          'Unable to share retinal images right now.'
        )
      );
    } finally {
      setSharingImages(false);
    }
  }, [
    detail?.rawJsonOutput,
    reportableSessionId,
    shareCandidateAssetId,
    shareableAssets,
    t,
  ]);

  const sidebarTabs = [
    {
      id: 'patient' as SidebarTab,
      icon: User,
      label: t(
        'Ophthalmologist.screeningReview.tabs.patientSummary',
        'Patient Summary'
      ),
    },
    {
      id: 'history' as SidebarTab,
      icon: Stethoscope,
      label: t(
        'Ophthalmologist.screeningReview.tabs.medicalHistory',
        'Medical History'
      ),
    },
    {
      id: 'exam' as SidebarTab,
      icon: Eye,
      label: t(
        'Ophthalmologist.screeningReview.tabs.currentExam',
        'Current Exam'
      ),
    },
    {
      id: 'reports' as SidebarTab,
      icon: FileText,
      label: t(
        'Ophthalmologist.screeningReview.tabs.previousReports',
        'Previous Reports'
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      {/* Sidebar */}
      <DoctorSidebar pendingCount={0} />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        {/* Header */}
        <DoctorHeader />

        {/* Review Content */}
        <main className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <Spinner size={40} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.screeningReview.loading',
                  'Loading screening...'
                )}
              </p>
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 p-6 text-red-800 dark:text-red-200">
              <p className="font-medium">{loadError}</p>
              <button
                type="button"
                onClick={() => navigate('/ophthalmologist/screenings')}
                className="mt-4 text-sm text-cyan-600 dark:text-cyan-400 underline"
              >
                {t(
                  'Ophthalmologist.screeningReview.backToScreenings',
                  'Back to screenings'
                )}
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t(
                        'Ophthalmologist.screeningReview.title',
                        'Screening Review'
                      )}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.screeningReview.subtitle',
                        'Case details and AI findings'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                    {t('Ophthalmologist.screeningReview.aiModel', 'AI Model')}:{' '}
                    {detail.modelVersion?.trim()
                      ? detail.modelVersion
                      : t(
                          'Ophthalmologist.screeningReview.screeningAi',
                          'Screening AI'
                        )}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(detail.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
                {/* Left Sidebar - Patient Info */}
                <div className="col-span-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
                  {/* Patient Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {detail.patientFullName.trim().charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-gray-900 dark:text-white font-semibold">
                          {detail.patientFullName}
                        </h2>
                      </div>
                    </div>

                    {/* Vitals — not provided by screening API */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          BP
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          —
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          A1C
                        </p>
                        <p className="text-orange-600 dark:text-orange-400 font-semibold">
                          —
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-[#1e3a5f]">
                    <nav className="flex">
                      {sidebarTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-center text-xs font-medium transition-colors relative ${
                              activeTab === tab.id
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            {tab.label.split(' ')[0]}
                            {activeTab === tab.id && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'exam' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {t(
                              'Ophthalmologist.screeningReview.imageDetails',
                              'Image Details'
                            )}
                          </p>
                          {selectedImage ? (
                            <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t(
                                    'Ophthalmologist.screeningReview.device',
                                    'Device'
                                  )}
                                </span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {selectedImage.deviceName ?? '—'}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t(
                                    'Ophthalmologist.screeningReview.captured',
                                    'Captured'
                                  )}
                                </span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {new Date(
                                    selectedImage.capturedAt
                                  ).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t(
                                    'Ophthalmologist.screeningReview.quality',
                                    'Quality'
                                  )}
                                </span>
                                <span
                                  className={`font-medium ${
                                    selectedImage.qualityScore >= 90
                                      ? 'text-green-600 dark:text-green-400'
                                      : selectedImage.qualityScore >= 70
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : selectedImage.qualityScore > 0
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  {selectedImage.qualityScore >= 90
                                    ? t(
                                        'Ophthalmologist.screeningReview.qualityOptimal',
                                        'Optimal'
                                      )
                                    : selectedImage.qualityScore >= 70
                                      ? t(
                                          'Ophthalmologist.screeningReview.qualityGood',
                                          'Good'
                                        )
                                      : selectedImage.qualityScore > 0
                                        ? t(
                                            'Ophthalmologist.screeningReview.qualityPoor',
                                            'Poor'
                                          )
                                        : t(
                                            'Ophthalmologist.screeningReview.qualityUnknown',
                                            'Unknown'
                                          )}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t(
                                'Ophthalmologist.screeningReview.selectImageForDetails',
                                'Select an image to see capture details.'
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'patient' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {t(
                              'Ophthalmologist.screeningReview.demographics',
                              'Demographics'
                            )}
                          </p>
                          <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                {t(
                                  'Ophthalmologist.common.fullName',
                                  'Full Name'
                                )}
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {detail.patientFullName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {t(
                              'Ophthalmologist.screeningReview.medicalConditions',
                              'Medical Conditions'
                            )}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {t(
                              'Ophthalmologist.screeningReview.medicalConditionsHint',
                              'Full medical history is available from the patient chart. This screening view only includes AI summary text when present.'
                            )}
                          </p>
                          {detail.latestResult?.summary ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              {detail.latestResult.summary}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {activeTab === 'reports' && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {t(
                            'Ophthalmologist.screeningReview.previousScans',
                            'Previous Scans'
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.screeningReview.previousScansHint',
                            'Prior screenings are not listed in this view yet.'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center - Image Viewer */}
                <div
                  ref={imageContainerRef}
                  className="col-span-7 bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden flex flex-col fullscreen:border-none fullscreen:rounded-none"
                >
                  {/* Toolbar */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-800">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleZoomIn}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.zoomIn',
                          'Zoom In'
                        )}
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleZoomOut}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.zoomOut',
                          'Zoom Out'
                        )}
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-gray-700 mx-1" />
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.pan',
                          'Pan'
                        )}
                      >
                        <Move className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.reset',
                          'Reset'
                        )}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleFullscreen}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.fullscreen',
                          'Fullscreen'
                        )}
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-gray-700 mx-1" />
                      <button
                        type="button"
                        onClick={() => setOverlayEditMode((v) => !v)}
                        className={`p-2 rounded-lg transition-colors ${
                          overlayEditMode
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                        title={
                          overlayEditMode
                            ? t(
                                'Ophthalmologist.screeningReview.toolbar.exitOverlayEdit',
                                'Exit overlay edit (drag / resize handles)'
                              )
                            : t(
                                'Ophthalmologist.screeningReview.toolbar.editOverlay',
                                'Edit AI boxes: drag to move, drag corner to resize'
                              )
                        }
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewBox}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.addNewBox',
                          'Add new custom bounding box'
                        )}
                      >
                        <PlusSquare className="w-5 h-5" />
                      </button>

                      {overlayEditMode && focusedFinding ? (
                        <>
                          <div className="w-px h-6 bg-gray-700 mx-1" />
                          <button
                            type="button"
                            onClick={() => handleChangeFocusedBoxColor('high')}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Change to Red (High)"
                          >
                            <div className="w-4 h-4 rounded-full bg-red-400 border border-red-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeFocusedBoxColor('moderate')
                            }
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Change to Orange (Moderate)"
                          >
                            <div className="w-4 h-4 rounded-full bg-orange-400 border border-orange-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeFocusedBoxColor('low')}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Change to Yellow (Low)"
                          >
                            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-500" />
                          </button>
                          <div className="w-px h-6 bg-gray-700 mx-1" />
                          <button
                            type="button"
                            onClick={handleDeleteFocusedBox}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg transition-colors"
                            title={t(
                              'Ophthalmologist.screeningReview.toolbar.deleteBox',
                              'Delete selected box'
                            )}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`p-2 rounded-lg transition-colors ${
                          canUndo
                            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                            : 'text-gray-600 cursor-not-allowed opacity-40'
                        }`}
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.undo',
                          'Undo last action'
                        )}
                      >
                        <Undo2 className="w-5 h-5" />
                      </button>
                      {findings.some((f) => f.location) ? (
                        <button
                          type="button"
                          onClick={resetOverlayBoxes}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                          title={t(
                            'Ophthalmologist.screeningReview.toolbar.resetAiBoxes',
                            'Reset all to AI positions'
                          )}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      ) : null}
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={t(
                          'Ophthalmologist.screeningReview.toolbar.measure',
                          'Measure'
                        )}
                      >
                        <Settings2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Container */}
                  <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                    <div
                      className="relative transition-transform duration-200 max-w-full max-h-full flex items-center justify-center p-4"
                      style={{ transform: `scale(${zoom})` }}
                    >
                      {selectedImage ? (
                        <div
                          ref={imgOverlayRef}
                          className="relative inline-flex items-center justify-center max-w-[95%] max-h-[95%] w-full h-full touch-none"
                        >
                          <img
                            src={selectedImage.imageUrl}
                            alt={`${selectedImage.eyeSide} eye fundus`}
                            className="max-w-full max-h-full object-contain block rounded-lg select-none pointer-events-none"
                            draggable={false}
                          />
                          {overlayEditMode ? (
                            <p className="absolute bottom-1 left-1 right-1 z-20 mx-auto max-w-md rounded bg-black/75 px-2 py-1 text-center text-[11px] text-white/90">
                              {t(
                                'Ophthalmologist.screeningReview.overlayEditHint',
                                'Kéo khung để di chuyển · Kéo ô vuông góc phải dưới để phóng to/thu nhỏ. Chỉnh sửa chỉ lưu trên trình duyệt (chưa gửi server).'
                              )}
                            </p>
                          ) : null}
                          {showOverlay &&
                            findings.map((finding) => {
                              const isHighlighted =
                                focusedFinding === finding.id;
                              const loc = getEffectiveBox(finding.id);
                              if (!loc) return null;
                              return (
                                <div
                                  key={finding.id}
                                  role="presentation"
                                  onPointerDown={(e) => {
                                    if (!overlayEditMode) return;
                                    beginOverlayDrag(e, finding.id, 'move');
                                  }}
                                  className={`absolute transition-colors duration-200 ${
                                    overlayEditMode
                                      ? 'cursor-grab active:cursor-grabbing'
                                      : 'pointer-events-none'
                                  } ${
                                    finding.severity === 'high'
                                      ? 'border-red-400 bg-red-400/25'
                                      : finding.severity === 'moderate'
                                        ? 'border-orange-400 bg-orange-400/25'
                                        : 'border-yellow-400 bg-yellow-400/25'
                                  } ${
                                    isHighlighted
                                      ? 'border-[3px] shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                                      : 'border-2 opacity-70'
                                  }`}
                                  style={{
                                    left: `${loc.x}%`,
                                    top: `${loc.y}%`,
                                    width: `${loc.width}%`,
                                    height: `${loc.height}%`,
                                  }}
                                >
                                  {!overlayEditMode ? (
                                    <>
                                      <span className="pointer-events-none absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-current" />
                                      <span className="pointer-events-none absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-current" />
                                      <span className="pointer-events-none absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-current" />
                                      <span className="pointer-events-none absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-current" />
                                    </>
                                  ) : null}
                                  {overlayEditMode ? (
                                    <div
                                      role="presentation"
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        beginOverlayDrag(
                                          e,
                                          finding.id,
                                          'resize-se'
                                        );
                                      }}
                                      className="absolute -bottom-1 -right-1 z-10 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-cyan-400 bg-white shadow"
                                    />
                                  ) : null}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center max-w-xs">
                          {t(
                            'Ophthalmologist.screeningReview.noSelectedFundusImage',
                            'No fundus image selected. Uploads attached to this screening will appear here.'
                          )}
                        </p>
                      )}
                    </div>

                    {/* Heatmap canvas overlay */}
                    {showHeatmap && heatmapData && selectedImage && (
                      <canvas
                        ref={heatmapCanvasRef}
                        className={`absolute inset-0 w-full h-full rounded-lg ${
                          heatmapEditMode
                            ? 'cursor-crosshair'
                            : 'pointer-events-none'
                        }`}
                        style={{
                          opacity: heatmapOpacity,
                          mixBlendMode: 'normal',
                          touchAction: heatmapEditMode ? 'none' : 'auto',
                        }}
                        onPointerDown={(e) => {
                          if (!heatmapEditMode) return;
                          heatmapDragRef.current = true;
                          e.currentTarget.setPointerCapture(e.pointerId);
                          paintHeatmap(e);
                        }}
                        onPointerMove={(e) => {
                          if (!heatmapDragRef.current || !heatmapEditMode)
                            return;
                          paintHeatmap(e);
                        }}
                        onPointerUp={(e) => {
                          heatmapDragRef.current = false;
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }}
                      />
                    )}
                    {selectedImage ? (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-gray-900/80 backdrop-blur rounded-lg text-white text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          {selectedImage.eyeSide} Eye (O
                          {selectedImage.eyeSide === 'Left'
                            ? 'S'
                            : selectedImage.eyeSide === 'Right'
                              ? 'D'
                              : 'S/D'}
                          )
                        </span>
                      </div>
                    ) : null}

                    {selectedImage && showAttentionBadge ? (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur rounded-lg text-white text-sm font-semibold">
                          {t(
                            'Ophthalmologist.screeningReview.attentionNeeded',
                            'ATTENTION NEEDED'
                          )}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom Bar */}
                  <div className="flex items-center justify-between p-3 border-t border-gray-800">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>
                        {t(
                          'Ophthalmologist.screeningReview.magnification',
                          'Magnification'
                        )}
                        : {zoom.toFixed(1)}x
                      </span>
                      <span>
                        {t(
                          'Ophthalmologist.screeningReview.modalityColorFundus',
                          'Modality: Color Fundus'
                        )}
                      </span>
                      <span>
                        {t(
                          'Ophthalmologist.screeningReview.quality',
                          'Quality'
                        )}
                        :{' '}
                        <span
                          className={
                            !selectedImage || selectedImage.qualityScore <= 0
                              ? 'text-gray-400'
                              : selectedImage.qualityScore >= 90
                                ? 'text-green-400'
                                : selectedImage.qualityScore >= 70
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                          }
                        >
                          {!selectedImage || selectedImage.qualityScore <= 0
                            ? t(
                                'Ophthalmologist.screeningReview.qualityUnknown',
                                'Unknown'
                              )
                            : selectedImage.qualityScore >= 90
                              ? t(
                                  'Ophthalmologist.screeningReview.qualityOptimal',
                                  'Optimal'
                                )
                              : selectedImage.qualityScore >= 70
                                ? t(
                                    'Ophthalmologist.screeningReview.qualityGood',
                                    'Good'
                                  )
                                : t(
                                    'Ophthalmologist.screeningReview.qualityPoor',
                                    'Poor'
                                  )}
                        </span>
                      </span>
                    </div>

                    {/* Overlay Toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowOverlay(true)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          showOverlay
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t(
                          'Ophthalmologist.screeningReview.boundingboxLabel',
                          'Bounding Box'
                        )}
                      </button>
                      <button
                        onClick={() => setShowOverlay(false)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          !showOverlay
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t(
                          'Ophthalmologist.screeningReview.original',
                          'Original'
                        )}
                      </button>
                      {heatmapData && (
                        <>
                          <button
                            onClick={() => setShowHeatmap((v) => !v)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              showHeatmap
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                            title="Toggle AI heatmap (Grad-CAM)"
                          >
                            🌡 Heatmap
                          </button>
                          {showHeatmap && (
                            <div className="flex items-center gap-4 flex-wrap border-l border-gray-700 pl-4 relative">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="text-xs text-gray-500"
                                  title="Opacity"
                                >
                                  Opa
                                </span>
                                <input
                                  type="range"
                                  min={0.05}
                                  max={1}
                                  step={0.05}
                                  value={heatmapOpacity}
                                  onChange={(e) =>
                                    setHeatmapOpacity(Number(e.target.value))
                                  }
                                  className="w-16 h-1.5 accent-orange-500 cursor-pointer"
                                  title={`Opacity: ${Math.round(heatmapOpacity * 100)}%`}
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="text-xs text-gray-500"
                                  title="Heat Threshold"
                                >
                                  Thr
                                </span>
                                <input
                                  type="range"
                                  min={0.0}
                                  max={0.9}
                                  step={0.05}
                                  value={heatmapThreshold}
                                  onChange={(e) =>
                                    setHeatmapThreshold(Number(e.target.value))
                                  }
                                  className="w-16 h-1.5 accent-red-500 cursor-pointer"
                                  title={`Threshold: ${Math.round(heatmapThreshold * 100)}%`}
                                />
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() =>
                                    setHeatmapEditMode((p) =>
                                      p !== null ? null : 'draw'
                                    )
                                  }
                                  className={`px-3 py-1 flex items-center gap-1.5 rounded-md text-xs font-semibold transition-all ${
                                    heatmapEditMode !== null
                                      ? 'bg-cyan-600 text-white shadow-inner'
                                      : 'bg-gray-800 text-gray-400 hover:text-white'
                                  }`}
                                  title="Mở bộ công cụ vẽ Heatmap"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                  {heatmapEditMode !== null
                                    ? 'Đóng Tool'
                                    : 'Bộ Vẽ Heatmap'}
                                </button>

                                {heatmapEditMode !== null && (
                                  <div
                                    onPointerMove={handleToolkitDrag}
                                    onPointerUp={() =>
                                      setIsDraggingToolkit(false)
                                    }
                                    onPointerLeave={() =>
                                      setIsDraggingToolkit(false)
                                    }
                                    style={{
                                      transform: `translate(${toolkitPos.x}px, ${toolkitPos.y}px)`,
                                    }}
                                    className="absolute bottom-full mb-3 right-0 flex items-center gap-4 px-4 py-2 border border-gray-700 bg-gray-900/90 rounded-xl backdrop-blur-md shadow-2xl z-50 select-none"
                                  >
                                    {/* Drag Handle */}
                                    <div
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        setIsDraggingToolkit(true);
                                        (
                                          e.currentTarget as HTMLElement
                                        ).setPointerCapture(e.pointerId);
                                      }}
                                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-500 hover:text-cyan-400 transition-colors"
                                      title="Kéo để di chuyển bộ công cụ"
                                    >
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                      >
                                        <circle cx="4" cy="4" r="1.5" />
                                        <circle cx="4" cy="8" r="1.5" />
                                        <circle cx="4" cy="12" r="1.5" />
                                        <circle cx="8" cy="4" r="1.5" />
                                        <circle cx="8" cy="8" r="1.5" />
                                        <circle cx="8" cy="12" r="1.5" />
                                        <circle cx="12" cy="4" r="1.5" />
                                        <circle cx="12" cy="8" r="1.5" />
                                        <circle cx="12" cy="12" r="1.5" />
                                      </svg>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        Size
                                      </span>
                                      <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        step="1"
                                        value={brushSize}
                                        onChange={(e) =>
                                          setBrushSize(Number(e.target.value))
                                        }
                                        className="w-20 h-1.5 accent-cyan-400 cursor-pointer"
                                        title={`Cỡ cọ: ${brushSize}`}
                                      />
                                    </div>
                                    <div className="w-px h-5 bg-gray-700 mx-1" />
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mr-1">
                                        Heat
                                      </span>
                                      <button
                                        onClick={() => {
                                          setHeatmapEditMode('draw');
                                          setBrushTargetHeat(1.0);
                                        }}
                                        className={`w-5 h-5 rounded-full bg-red-600 transition-transform shadow-sm ${brushTargetHeat === 1.0 && heatmapEditMode === 'draw' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                                        title="Lõi đỏ (Nhiệt cao nhất)"
                                      />
                                      <button
                                        onClick={() => {
                                          setHeatmapEditMode('draw');
                                          setBrushTargetHeat(0.7);
                                        }}
                                        className={`w-5 h-5 rounded-full bg-orange-500 transition-transform shadow-sm ${brushTargetHeat === 0.7 && heatmapEditMode === 'draw' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                                        title="Tỏa cam"
                                      />
                                      <button
                                        onClick={() => {
                                          setHeatmapEditMode('draw');
                                          setBrushTargetHeat(0.4);
                                        }}
                                        className={`w-5 h-5 rounded-full bg-yellow-400 transition-transform shadow-sm ${brushTargetHeat === 0.4 && heatmapEditMode === 'draw' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                                        title="Lan vàng"
                                      />
                                    </div>
                                    <div className="w-px h-5 bg-gray-700 mx-1" />
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          setHeatmapEditMode('erase')
                                        }
                                        className={`flex items-center justify-center p-1.5 rounded w-max bg-gray-800 text-gray-200 transition-all shadow-sm ${heatmapEditMode === 'erase' ? 'ring-2 ring-cyan-400 text-white bg-gray-600' : 'hover:bg-gray-600 hover:text-white'}`}
                                        title="Cục Tẩy"
                                      >
                                        <Eraser className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleUndo}
                                        disabled={!canUndo}
                                        className={`p-1.5 rounded transition-all shadow-sm ${
                                          canUndo
                                            ? 'bg-gray-700 text-cyan-400 hover:text-white hover:bg-gray-600'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-40'
                                        }`}
                                        title="Hoàn tác"
                                      >
                                        <Undo2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setHeatmapData((prev) =>
                                            prev
                                              ? prev.map((r) => r.map(() => 0))
                                              : null
                                          );
                                          setHasHeatmapEdits(true);
                                        }}
                                        className="ml-1 flex items-center gap-1 px-2 py-1 rounded border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-all text-[9px] uppercase font-bold tracking-wider"
                                        title="Xóa toàn bộ bản đồ nhiệt"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel - AI screening */}
                <div className="col-span-3 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
                  {/* Detected Findings */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t(
                          'Ophthalmologist.screeningReview.detectedFindings',
                          'Detected Findings'
                        )}{' '}
                        ({sidebarFindings.length})
                      </p>
                      <button
                        onClick={() => {
                          if (!isFinalizedDiagnosis) setIsAddingFinding(true);
                        }}
                        disabled={isFinalizedDiagnosis}
                        className="p-1 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors disabled:opacity-50"
                        title="Thêm thẻ (Add finding)"
                      >
                        <PlusSquare className="w-4 h-4" />
                      </button>
                    </div>

                    {isAddingFinding && (
                      <div className="mb-4 space-y-3 p-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl shadow-sm">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-gray-400">
                            Tên bệnh / Dấu hiệu
                          </label>
                          <input
                            type="text"
                            autoFocus
                            value={newFindingName}
                            onChange={(e) => setNewFindingName(e.target.value)}
                            list="finding-name-suggestions"
                            placeholder="Nhập tên..."
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                          />
                          <datalist id="finding-name-suggestions">
                            {[
                              ...new Set([
                                ...FINDING_NAME_SUGGESTIONS,
                                ...findings.map((f) => f.name),
                              ]),
                            ].map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-gray-400">
                            Mô tả chi tiết
                          </label>
                          <textarea
                            value={newFindingDescription}
                            onChange={(e) =>
                              setNewFindingDescription(e.target.value)
                            }
                            placeholder="Nhập mô tả..."
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400 mr-1">
                              Rủi ro:
                            </label>
                            <button
                              type="button"
                              onClick={() => setNewFindingSeverity('low')}
                              className={`w-6 h-6 rounded-full bg-yellow-400 border-2 transition-all ${newFindingSeverity === 'low' ? 'border-white ring-2 ring-yellow-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              title="Low (Yellow)"
                            />
                            <button
                              type="button"
                              onClick={() => setNewFindingSeverity('moderate')}
                              className={`w-6 h-6 rounded-full bg-orange-500 border-2 transition-all ${newFindingSeverity === 'moderate' ? 'border-white ring-2 ring-orange-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              title="Moderate (Orange)"
                            />
                            <button
                              type="button"
                              onClick={() => setNewFindingSeverity('high')}
                              className={`w-6 h-6 rounded-full bg-red-600 border-2 transition-all ${newFindingSeverity === 'high' ? 'border-white ring-2 ring-red-600 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              title="High (Red)"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsAddingFinding(false)}
                              className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => {
                                if (!newFindingName.trim()) return;
                                const id = `manual-find-${Date.now()}`;
                                const newFinding: DetectedFinding = {
                                  id,
                                  name: newFindingName.trim(),
                                  description:
                                    newFindingDescription.trim() ||
                                    'Physician indicated finding',
                                  confidence: 100,
                                  severity: newFindingSeverity,
                                };
                                setSidebarFindings((prev) => [
                                  ...prev,
                                  newFinding,
                                ]);
                                setFindings((prev) => [...prev, newFinding]);
                                setNewFindingName('');
                                setNewFindingDescription('');
                                setIsAddingFinding(false);
                              }}
                              className="px-4 py-1.5 bg-cyan-600 text-white text-[11px] font-bold rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-1.5"
                              disabled={isFinalizedDiagnosis}
                            >
                              <PlusSquare className="w-3.5 h-3.5" /> Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {sidebarFindings.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.screeningReview.noStructuredFindings',
                            'No structured findings for this image. If AI raw output exists, try another eye image or confirm results were saved for this screening.'
                          )}
                        </p>
                      ) : null}
                      {sidebarFindings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`border-l-4 rounded-lg p-3 ${getSeverityColor(finding.severity)}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <input
                              type="text"
                              value={finding.name}
                              list="finding-name-suggestions"
                              onChange={(e) => {
                                const val = e.target.value;
                                setSidebarFindings((prev) =>
                                  prev.map((f) =>
                                    f.id === finding.id
                                      ? { ...f, name: val }
                                      : f
                                  )
                                );
                                setFindings((prev) =>
                                  prev.map((f) =>
                                    f.id === finding.id
                                      ? { ...f, name: val }
                                      : f
                                  )
                                );
                              }}
                              disabled={isFinalizedDiagnosis}
                              className="font-semibold text-gray-900 dark:text-white text-sm bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded w-full"
                            />
                            <button
                              onClick={() => {
                                setSidebarFindings((prev) =>
                                  prev.filter((f) => f.id !== finding.id)
                                );
                                setFindings((prev) =>
                                  prev.filter((f) => f.id !== finding.id)
                                );
                              }}
                              disabled={isFinalizedDiagnosis}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                              title="Delete Finding"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            value={finding.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSidebarFindings((prev) =>
                                prev.map((f) =>
                                  f.id === finding.id
                                    ? { ...f, description: val }
                                    : f
                                )
                              );
                              setFindings((prev) =>
                                prev.map((f) =>
                                  f.id === finding.id
                                    ? { ...f, description: val }
                                    : f
                                )
                              );
                            }}
                            disabled={isFinalizedDiagnosis}
                            rows={1}
                            className="w-full text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded resize-none min-h-[1.25rem] overflow-hidden"
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* AI Disclaimer */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <span className="font-semibold">
                            {t('Ophthalmologist.screeningReview.note', 'Note:')}
                          </span>{' '}
                          {t(
                            'Ophthalmologist.screeningReview.aiDisclaimer',
                            'AI generated insights are screening aids only. Final diagnosis requires physician review.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
                    {isFinalizedDiagnosis ? (
                      <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                        {t(
                          'Ophthalmologist.screeningReview.status.finalizedLocked',
                          'This case is finalized. Editing is locked.'
                        )}
                      </p>
                    ) : null}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button
                        onClick={handleSaveEdits}
                        disabled={savingEdits || isFinalizedDiagnosis}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2a4e75] dark:bg-[#11315b] dark:text-gray-200 dark:hover:bg-[#1c3f67]"
                      >
                        {savingEdits ? (
                          <Spinner size={16} />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {t(
                          'Ophthalmologist.screeningReview.saveButton',
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (!isFinalizedDiagnosis)
                            setShowDiagnosisModal(true);
                        }}
                        disabled={isFinalizedDiagnosis}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white shadow-sm shadow-cyan-600/25 transition-all hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md hover:shadow-cyan-600/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FileText className="w-4 h-4" />
                        {t(
                          'Ophthalmologist.screeningReview.generateReport',
                          'Generate Report'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const formData = {
                            fullName: detail?.patientFullName || '',
                            age: '', // Age is not in detail, maybe I can find it elsewhere or leave blank
                            maYT:
                              detail?.screeningId
                                .substring(0, 8)
                                .toUpperCase() || '',
                            admissionReason:
                              detail?.latestResult?.summary || '',
                            finalDiagnosisMain:
                              detail?.latestResult?.findings || '',
                            // Add other fields if needed
                          };
                          navigate('/erm-test', { state: { formData } });
                        }}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FileText className="w-4 h-4" />
                        {t(
                          'Ophthalmologist.screeningReview.createMedicalRecord',
                          'Tạo hồ sơ bệnh án'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>

      {showShareImagePicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-xl shadow-2xl border border-gray-200 dark:border-[#1e3a5f]">
            <div className="p-5 border-b border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(
                    'Ophthalmologist.screeningReview.share.selectImageTitle',
                    'Select retinal image to share'
                  )}
                </h3>
                <button
                  onClick={() => setShowShareImagePicker(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {shareableAssets.map((asset, index) => (
                <label
                  key={asset.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                    shareCandidateAssetId === asset.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-[#1e3a5f]'
                  }`}
                >
                  <input
                    type="radio"
                    name="share-retinal-image"
                    checked={shareCandidateAssetId === asset.id}
                    onChange={() => setShareCandidateAssetId(asset.id)}
                  />
                  <img
                    src={asset.previewUrl}
                    alt={`Retinal image ${index + 1}`}
                    className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-[#1e3a5f]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {asset.label}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-[#1e3a5f] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowShareImagePicker(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleShareRetinalImage}
                disabled={sharingImages || !shareCandidateAssetId}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-60"
              >
                {sharingImages
                  ? t('Ophthalmologist.common.saving', 'Saving...')
                  : t(
                      'Ophthalmologist.screeningReview.share.sendSelected',
                      'Send selected image'
                    )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(
                    'Ophthalmologist.screeningReview.modal.completeDiagnosis',
                    'Complete Diagnosis'
                  )}
                </h2>
                <button
                  onClick={() => setShowDiagnosisModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t(
                  'Ophthalmologist.screeningReview.modal.description',
                  'Review AI findings and provide your clinical assessment'
                )}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* AI Summary */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
                  {t(
                    'Ophthalmologist.screeningReview.modal.aiSummary',
                    'AI Analysis Summary'
                  )}
                </h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                  {detail?.latestResult?.summary?.trim() ||
                    t(
                      'Ophthalmologist.screeningReview.modal.noAiSummary',
                      'No AI summary stored for this screening.'
                    )}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-cyan-600 dark:text-cyan-400">
                    {t(
                      'Ophthalmologist.screeningReview.modal.riskLevel',
                      'Risk Level'
                    )}
                    :{' '}
                    <strong>
                      {detail?.latestResult?.riskLevel ?? riskLevelUi}
                    </strong>
                  </span>
                  <span className="text-sm text-cyan-600 dark:text-cyan-400">
                    {t(
                      'Ophthalmologist.screeningReview.modal.confidence',
                      'Confidence'
                    )}
                    : <strong>{aiConfidencePct}%</strong>
                  </span>
                </div>
              </div>

              {/* Diagnosis core */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t(
                    'Ophthalmologist.screeningReview.modal.diagnosisCore',
                    'Diagnosis Core'
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={diagnosisCodePreset}
                    onChange={(e) =>
                      setDiagnosisCodePreset(
                        e.target
                          .value as (typeof DIAGNOSIS_CODE_PRESETS)[number]['value']
                      )
                    }
                    className="md:col-span-2 px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {DIAGNOSIS_CODE_PRESETS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={codingSystem}
                    onChange={(e) => setCodingSystem(e.target.value)}
                    className="px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="ICD-10">ICD-10</option>
                    <option value="SNOMED CT">SNOMED CT</option>
                    <option value="Other">
                      {t('Ophthalmologist.common.other', 'Other')}
                    </option>
                  </select>
                </div>
                {diagnosisCodePreset === 'OTHER' && (
                  <input
                    type="text"
                    value={customDiagnosisCode}
                    onChange={(e) => setCustomDiagnosisCode(e.target.value)}
                    placeholder={t(
                      'Ophthalmologist.screeningReview.modal.diagnosisCode',
                      'Diagnosis code'
                    )}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                )}
                <select
                  value={diagnosisStatus}
                  onChange={(e) => setDiagnosisStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="Draft">
                    {t('Ophthalmologist.common.status.draft', 'Draft')}
                  </option>
                  <option value="Reviewed">
                    {t('Ophthalmologist.common.status.reviewed', 'Reviewed')}
                  </option>
                  <option value="Finalized">
                    {t('Ophthalmologist.common.status.finalized', 'Finalized')}
                  </option>
                </select>
              </div>

              {/* Clinical findings */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {t(
                    'Ophthalmologist.screeningReview.modal.clinicalFindings',
                    'Clinical Findings'
                  )}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t(
                    'Ophthalmologist.screeningReview.modal.clinicalFindingsHint',
                    'Auto-filled from AI findings. You can adjust before saving.'
                  )}
                </p>
                <textarea
                  value={clinicalFindings}
                  onChange={(e) => setClinicalFindings(e.target.value)}
                  placeholder={t(
                    'Ophthalmologist.screeningReview.modal.clinicalFindingsPlaceholder',
                    'Document physician findings and interpretation...'
                  )}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Severity and urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.screeningReview.modal.severityLevel',
                      'Severity Level'
                    )}
                  </p>
                  <select
                    value={severityLevel}
                    onChange={(e) => setSeverityLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="Mild">
                      {t('Ophthalmologist.common.severity.mild', 'Mild')}
                    </option>
                    <option value="Moderate">
                      {t(
                        'Ophthalmologist.common.severity.moderate',
                        'Moderate'
                      )}
                    </option>
                    <option value="Severe">
                      {t('Ophthalmologist.common.severity.severe', 'Severe')}
                    </option>
                    <option value="Critical">
                      {t(
                        'Ophthalmologist.common.severity.critical',
                        'Critical'
                      )}
                    </option>
                  </select>
                </div>

                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t(
                          'Ophthalmologist.screeningReview.modal.urgentCase',
                          'Urgent Case'
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'Ophthalmologist.screeningReview.modal.urgentCaseHint',
                          'Mark if immediate attention is required'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUrgent(!isUrgent)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        isUrgent ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          isUrgent ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Treatment and recommendations */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t(
                    'Ophthalmologist.screeningReview.modal.treatmentAdvice',
                    'Treatment and Advice'
                  )}
                </h4>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setTreatmentPlan(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">
                    {t(
                      'Ophthalmologist.screeningReview.modal.selectTreatmentTemplate',
                      'Select a treatment template'
                    )}
                  </option>
                  {TREATMENT_PLAN_PRESETS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder={t(
                    'Ophthalmologist.screeningReview.modal.treatmentPlan',
                    'Treatment plan...'
                  )}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setRecommendations(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">
                    {t(
                      'Ophthalmologist.screeningReview.modal.selectRecommendationTemplate',
                      'Select a recommendation template'
                    )}
                  </option>
                  {RECOMMENDATION_PRESETS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder={t(
                    'Ophthalmologist.screeningReview.modal.recommendations',
                    'Recommendations for patient and follow-up care...'
                  )}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Follow-up and referral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t(
                          'Ophthalmologist.screeningReview.modal.referralRequired',
                          'Referral Required'
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'Ophthalmologist.screeningReview.modal.referralHint',
                          'Recommend specialist consultation'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setReferralRequired(!referralRequired)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        referralRequired
                          ? 'bg-cyan-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          referralRequired ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    {t(
                      'Ophthalmologist.screeningReview.modal.followUpDate',
                      'Follow-up Date'
                    )}
                  </p>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-[#1e3a5f] flex items-center justify-between">
              <button
                onClick={() => setShowDiagnosisModal(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-[#1e3a5f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloadingPdf ? (
                    <Spinner size={16} />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloadingPdf
                    ? t(
                        'Ophthalmologist.screeningReview.modal.exportingPdf',
                        'Exporting...'
                      )
                    : t(
                        'Ophthalmologist.screeningReview.modal.exportPdf',
                        'Export PDF'
                      )}
                </button>
                <button
                  onClick={handleSubmitDiagnosis}
                  disabled={
                    submitVerificationReportMutation.isPending ||
                    consultationSessionsQuery.isLoading ||
                    consultationSessionsQuery.isFetching
                  }
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitVerificationReportMutation.isPending
                    ? t('Ophthalmologist.common.saving', 'Saving...')
                    : consultationSessionsQuery.isLoading ||
                        consultationSessionsQuery.isFetching
                      ? t(
                          'Ophthalmologist.screeningReview.modal.linkingSession',
                          'Linking session...'
                        )
                      : diagnosisStatus === 'Finalized'
                        ? t(
                            'Ophthalmologist.screeningReview.modal.sendToCashier',
                            'Finalize & Send to Cashier'
                          )
                        : t(
                            'Ophthalmologist.screeningReview.modal.confirmAndSave',
                            'Confirm & Save'
                          )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
