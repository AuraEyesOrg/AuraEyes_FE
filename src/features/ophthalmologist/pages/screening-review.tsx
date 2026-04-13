import { useState, useRef, useEffect, useMemo } from 'react';
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
  Search as SearchIcon,
  Flag,
  Info,
  Settings2,
  Pencil,
  Save,
  X,
  Calendar,
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
import Spinner from '@/components/ui/spinner';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

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
  const [overlayEditMode, setOverlayEditMode] = useState(false);
  const [boxOverrides, setBoxOverrides] = useState<Record<string, BoxRect>>({});
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [focusedFinding, setFocusedFinding] = useState<string | null>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [codingSystem, setCodingSystem] = useState('ICD-10');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [severityLevel, setSeverityLevel] = useState('Moderate');
  const [confidenceLevel, setConfidenceLevel] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [diagnosisStatus, setDiagnosisStatus] = useState('Draft');
  const [referralRequired, setReferralRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const riskLevelConfig = useMemo(() => getRiskLevelConfig(t), [t]);

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
  const reportableSession = verificationSession ?? videoCallSession;

  const reportableSessionId = reportableSession?.id ?? null;
  const resolvedDoctorId =
    doctorFilterId ||
    reportableSession?.ophthalmologistId ||
    linkedSession?.ophthalmologistId ||
    '';

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
    // (based on `rawJsonOutput`) so it matches the Patient view.
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
      setFindings(anomalies.map(anomalyToFinding));
    });

    return () => {
      cancelled = true;
    };
  }, [detail?.rawJsonOutput, selectedImage?.imageUrl]);

  useEffect(() => {
    setBoxOverrides({});
  }, [detail?.rawJsonOutput, selectedImage?.imageUrl]);

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
    setBoxOverrides({});
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

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

  useEffect(() => {
    if (!showDiagnosisModal) return;
    if (confidenceLevel.trim().length > 0) return;
    if (aiConfidencePct <= 0) return;
    setConfidenceLevel(String(aiConfidencePct));
  }, [showDiagnosisModal, confidenceLevel, aiConfidencePct]);

  const handleSubmitDiagnosis = async () => {
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
            `Linked consultation exists but it is "${linkedSession.typeName}". Only Verification or VideoCall sessions can submit this report.`
          )
        : t(
            'Ophthalmologist.screeningReview.validation.noLinkedSession',
            'No linked Verification or VideoCall session was found for this screening.'
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

    const parsedConfidence =
      confidenceLevel.trim().length > 0 ? Number(confidenceLevel) : undefined;

    if (
      parsedConfidence !== undefined &&
      (!Number.isFinite(parsedConfidence) ||
        parsedConfidence < 0 ||
        parsedConfidence > 100)
    ) {
      const message = t(
        'Ophthalmologist.screeningReview.validation.confidenceRange',
        'Confidence level must be between 0 and 100.'
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
        confidenceLevel: parsedConfidence,
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

      ophthalToast.success(
        t(
          'Ophthalmologist.screeningReview.toast.saveSuccess',
          'Diagnosis report saved successfully.'
        )
      );
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
                <div className="col-span-3 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
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
                              'Ophthalmologist.screeningReview.selectEye',
                              'Select Eye'
                            )}
                          </p>
                          {retinalImages.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t(
                                'Ophthalmologist.screeningReview.noFundusImages',
                                'No fundus images for this screening.'
                              )}
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {retinalImages.map((img) => (
                                <button
                                  type="button"
                                  key={img.id}
                                  onClick={() => setSelectedImageId(img.id)}
                                  className={`p-3 rounded-lg border-2 transition-colors ${
                                    selectedImage?.id === img.id
                                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                      : 'border-gray-200 dark:border-[#1e3a5f] hover:border-cyan-300'
                                  }`}
                                >
                                  <Eye
                                    className={`w-5 h-5 mx-auto mb-1 ${
                                      selectedImage?.id === img.id
                                        ? 'text-cyan-600 dark:text-cyan-400'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                  <p
                                    className={`text-sm font-medium ${
                                      selectedImage?.id === img.id
                                        ? 'text-cyan-600 dark:text-cyan-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                  >
                                    {img.eyeSide}{' '}
                                    {t(
                                      'Ophthalmologist.screeningReview.eye',
                                      'Eye'
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Q:{' '}
                                    {img.qualityScore > 0
                                      ? `${img.qualityScore}%`
                                      : '—'}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

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
                <div className="col-span-6 bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
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
                      {findings.some((f) => f.location) ? (
                        <button
                          type="button"
                          onClick={resetOverlayBoxes}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                          title={t(
                            'Ophthalmologist.screeningReview.toolbar.resetAiBoxes',
                            'Reset boxes to AI positions (this image)'
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

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Image Container */}
                  <div
                    ref={imageContainerRef}
                    className="flex-1 relative overflow-hidden flex items-center justify-center bg-black"
                  >
                    <div
                      className="relative transition-transform duration-200 max-w-full max-h-full flex items-center justify-center p-4"
                      style={{ transform: `scale(${zoom})` }}
                    >
                      {selectedImage ? (
                        <div
                          ref={imgOverlayRef}
                          className="relative inline-block max-w-full max-h-[min(70vh,calc(100vh-280px))] touch-none"
                        >
                          <img
                            src={selectedImage.imageUrl}
                            alt={`${selectedImage.eyeSide} eye fundus`}
                            className="max-w-full max-h-[min(70vh,calc(100vh-280px))] object-contain block rounded-lg select-none pointer-events-none"
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
                                  className={`absolute border-2 transition-colors duration-200 ${
                                    overlayEditMode
                                      ? 'cursor-grab active:cursor-grabbing'
                                      : 'pointer-events-none'
                                  } ${
                                    isHighlighted
                                      ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50'
                                      : finding.severity === 'high'
                                        ? 'border-red-400/70 bg-red-400/25'
                                        : finding.severity === 'moderate'
                                          ? 'border-orange-400/70 bg-orange-400/25'
                                          : 'border-yellow-400/70 bg-yellow-400/25'
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
                          'Ophthalmologist.screeningReview.aiOverlay',
                          'AI Overlay'
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
                    </div>
                  </div>
                </div>

                {/* Right Panel - AI screening */}
                <div className="col-span-3 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {t(
                        'Ophthalmologist.screeningReview.savedAiResult',
                        'Kết quả đã lưu (AI)'
                      )}
                    </h3>

                    <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Mức rủi ro & độ tin cậy lấy từ bản ghi screening khi
                          phân tích xong — không phải “điểm AURA” riêng từ trang
                          này.
                        </span>
                        <span
                          className="shrink-0 text-gray-400"
                          title={t(
                            'Ophthalmologist.screeningReview.riskConfidenceHint',
                            'Risk level và confidence là trường đã lưu trong ScreeningResult trên server. Trước đây số /10 là công thức ước lượng gây hiểu nhầm nên đã bỏ.'
                          )}
                        >
                          <Info className="w-4 h-4" />
                        </span>
                      </div>

                      {detail.latestResult ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${riskLevelConfig[riskLevelUi].bg} ${riskLevelConfig[riskLevelUi].color}`}
                            >
                              {detail.latestResult.riskLevel}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {t(
                                'Ophthalmologist.screeningReview.modelConfidence',
                                'Độ tin cậy mô hình:'
                              )}{' '}
                              <strong className="text-gray-900 dark:text-white">
                                {aiConfidencePct}%
                              </strong>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {referralPillLabel}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.screeningReview.noSavedResult',
                            'Chưa có kết quả screening đã lưu cho ca này.'
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Detected Findings */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {t(
                        'Ophthalmologist.screeningReview.detectedFindings',
                        'Detected Findings'
                      )}{' '}
                      ({findings.length})
                    </p>
                    <div className="space-y-3">
                      {findings.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.screeningReview.noStructuredFindings',
                            'No structured findings for this image. If AI raw output exists, try another eye image or confirm results were saved for this screening.'
                          )}
                        </p>
                      ) : null}
                      {findings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`border-l-4 rounded-lg p-3 ${getSeverityColor(finding.severity)}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {finding.name}
                            </h4>
                            <span
                              className={`text-xs font-bold ${
                                finding.confidence >= 90
                                  ? 'text-red-600 dark:text-red-400'
                                  : finding.confidence >= 80
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-yellow-600 dark:text-yellow-400'
                              }`}
                            >
                              {finding.confidence}%{' '}
                              {t(
                                'Ophthalmologist.screeningReview.confAbbr',
                                'Conf.'
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {finding.description}
                          </p>
                          <button
                            onClick={() => handleFocusFinding(finding.id)}
                            className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                            <SearchIcon className="w-3 h-3" />
                            {t(
                              'Ophthalmologist.screeningReview.clickToFocus',
                              'CLICK TO FOCUS'
                            )}
                          </button>
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
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#1e3a5f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-lg font-medium transition-colors">
                        <Flag className="w-4 h-4" />
                        {t(
                          'Ophthalmologist.screeningReview.flagForReview',
                          'Flag for Review'
                        )}
                      </button>
                      <button
                        onClick={() => setShowDiagnosisModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {t(
                          'Ophthalmologist.screeningReview.generateReport',
                          'Generate Report'
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
                  <input
                    type="text"
                    value={diagnosisCode}
                    onChange={(e) => setDiagnosisCode(e.target.value)}
                    placeholder={t(
                      'Ophthalmologist.screeningReview.modal.diagnosisCode',
                      'Diagnosis code'
                    )}
                    className="md:col-span-2 px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
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

              {/* Confidence */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {t(
                    'Ophthalmologist.screeningReview.modal.confidenceLevel',
                    'Confidence Level (0 - 100)'
                  )}
                </h4>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(e.target.value)}
                  placeholder={t(
                    'Ophthalmologist.screeningReview.modal.confidenceExample',
                    'e.g., 92'
                  )}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Treatment and recommendations */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t(
                    'Ophthalmologist.screeningReview.modal.treatmentAdvice',
                    'Treatment and Advice'
                  )}
                </h4>
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
                <button className="px-6 py-2.5 bg-gray-100 dark:bg-[#1e3a5f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t(
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
