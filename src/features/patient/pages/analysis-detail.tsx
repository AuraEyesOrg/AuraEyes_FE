import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import PatientImageViewer from '../components/ImageViewer';
import PatientFindings from '../components/AnalysisSidebar';
import PatientImageStrip from '../components/ReadOnlyImageGallery';
import { screeningApi } from '../api/screening.api';
import { hydrateFullScreeningData } from './retinal-analysis';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { Anomaly, RetinalImage, ToggleState } from '../types/type';
import { getDiseaseUrgency } from '../mock';
import { isNormalDisease } from '@/features/patient/lib/disease-translation';

interface AnalysisDetailLocationState {
  screeningId?: string;
  images?: RetinalImage[];
  anomalies?: Anomaly[];
  riskLevel?: 'low' | 'moderate' | 'high';
  rawJsonOutput?: string;
}

const DEFAULT_TOGGLES: ToggleState = {
  vesselSegmentation: false,
  hemorrhages: true,
  exudates: true,
  opticDisc: false,
};

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

function urgencyRank(
  urgency: 'critical' | 'warning' | 'caution' | 'info' | 'normal'
): number {
  if (urgency === 'critical') return 5;
  if (urgency === 'warning') return 4;
  if (urgency === 'caution') return 3;
  if (urgency === 'info') return 2;
  return 1;
}

function toRiskLevelFromUrgency(
  urgency: 'critical' | 'warning' | 'caution' | 'info' | 'normal',
  confidence: number
): 'low' | 'moderate' | 'high' {
  if (urgency === 'critical') return 'high';
  if (urgency === 'warning') return confidence >= 70 ? 'high' : 'moderate';
  if (urgency === 'caution') return confidence >= 70 ? 'moderate' : 'low';
  return 'low';
}

export default function AnalysisDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const routeState =
    (location.state as AnalysisDetailLocationState | null) ?? null;

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<RetinalImage[]>(
    routeState?.images ?? []
  );
  const [anomalies, setAnomalies] = useState<Anomaly[]>(
    routeState?.anomalies ?? []
  );
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    routeState?.images?.[0]?.id ?? null
  );
  const [toggles, setToggles] = useState<ToggleState>(DEFAULT_TOGGLES);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const rawJson = routeState?.rawJsonOutput;
    const hasRouteImages = (routeState?.images?.length ?? 0) > 0;

    if (hasRouteImages && rawJson) {
      const firstImageUrl = routeState!.images![0]?.url;
      hydrateFullScreeningData(rawJson, firstImageUrl).then(
        ({ anomalies: hydrated, heatmapUrl: heatmap, heatmapData: matrix }) => {
          const enrichedImages = routeState!.images!.map((img, idx) =>
            idx === 0
              ? {
                  ...img,
                  analyzed: true,
                  anomalies: hydrated,
                  heatmapUrl: heatmap,
                  heatmapData: matrix,
                }
              : { ...img, analyzed: true }
          );
          setImages(enrichedImages);
          setSelectedImageId(enrichedImages[0]?.id ?? null);
          setAnomalies(hydrated);
        }
      );
      return;
    }

    const screeningId = routeState?.screeningId;
    if (!screeningId || images.length > 0) return;

    const loadSession = async () => {
      setIsLoading(true);
      try {
        const response = await screeningApi.getSessionById(screeningId);
        const session = response.data;
        if (!session) return;

        const mergedRawJson = rawJson ?? session.rawJsonOutput;
        const mappedImages: RetinalImage[] = (session.images ?? []).map(
          (img) => ({
            id: img.id,
            url: img.imageUrl,
            name: getFileNameFromUrl(img.imageUrl),
            eye: mapEyeSideLabel(img.eyeSide),
            uploadedAt: img.capturedAt,
            analyzed: true,
            anomalies: [],
          })
        );

        const firstImageUrl = mappedImages[0]?.url;
        const {
          anomalies: hydrated,
          heatmapUrl: heatmap,
          heatmapData: matrix,
        } = await hydrateFullScreeningData(mergedRawJson, firstImageUrl);

        const enrichedImages = mappedImages.map((img, idx) =>
          idx === 0
            ? {
                ...img,
                anomalies: hydrated,
                heatmapUrl: heatmap,
                heatmapData: matrix,
              }
            : img
        );

        setImages(enrichedImages);
        setSelectedImageId(enrichedImages[0]?.id ?? null);
        setAnomalies(hydrated);
      } catch (error) {
        console.error('Failed to load patient analysis detail session', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, [
    routeState?.screeningId,
    routeState?.rawJsonOutput,
    routeState?.images,
    images.length,
  ]);

  const currentImage =
    images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;
  const heatmapUrl = currentImage?.heatmapUrl;
  const heatmapData = currentImage?.heatmapData ?? null;
  const hasAnyHeatmap =
    Boolean(heatmapUrl) || (heatmapData != null && heatmapData.length > 0);
  const hasBoundingBoxes = anomalies.some((anomaly) =>
    Boolean(anomaly.location)
  );

  useEffect(() => {
    if (!hasAnyHeatmap) setShowHeatmap(false);
  }, [hasAnyHeatmap]);

  const dominantAnomaly =
    anomalies.length > 0
      ? [...anomalies].sort((a, b) => {
          const urgencyDiff =
            urgencyRank(getDiseaseUrgency(b.code ?? b.name)) -
            urgencyRank(getDiseaseUrgency(a.code ?? a.name));
          if (urgencyDiff !== 0) return urgencyDiff;
          return (b.confidence ?? 0) - (a.confidence ?? 0);
        })[0]
      : null;

  const primaryAnomaly =
    anomalies.find((a) => a.isHighest) ??
    (anomalies.length > 0
      ? [...anomalies].sort((a, b) => b.confidence - a.confidence)[0]
      : null);
  const isPrimaryNormal =
    primaryAnomaly != null
      ? isNormalDisease(primaryAnomaly.name)
      : anomalies.length === 0;

  const effectiveRiskLevel = useMemo<'low' | 'moderate' | 'high'>(() => {
    if (routeState?.riskLevel) return routeState.riskLevel;
    const urgency = getDiseaseUrgency(dominantAnomaly?.code ?? 'WNL');
    const confidence = dominantAnomaly?.confidence ?? 0;
    return toRiskLevelFromUrgency(urgency, confidence);
  }, [
    dominantAnomaly?.code,
    dominantAnomaly?.confidence,
    routeState?.riskLevel,
  ]);

  const riskConfig = {
    low: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      summary: t(
        'PatientRetinalAnalysis.risk.low.summary',
        'Low-risk findings were detected. Keep regular follow-up with your eye specialist.'
      ),
    },
    moderate: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      summary: t(
        'PatientRetinalAnalysis.risk.moderate.summary',
        'Findings should be reviewed by an eye specialist for confirmation.'
      ),
    },
    high: {
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      summary: t(
        'PatientRetinalAnalysis.risk.high.summary',
        'Important findings were detected and should be reviewed as soon as possible.'
      ),
    },
  };

  const healthyRisk = {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    summary: t(
      'PatientRetinalAnalysis.risk.healthy.summary',
      'No significant concerns were identified in this scan.'
    ),
  };

  const risk = isPrimaryNormal ? healthyRisk : riskConfig[effectiveRiskLevel];
  const riskTagLabel = isPrimaryNormal
    ? t('PatientRetinalAnalysis.badge.looksHealthy', 'Looks Healthy')
    : t('PatientRetinalAnalysis.badge.needsAttention', 'Needs Attention');

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f0f2f5]">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/patient/screening/review')}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {t('PatientAnalysisDetail.page.title', 'Analysis Details')}
            </h1>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5]">
        {(hasBoundingBoxes || hasAnyHeatmap) && (
          <div className="flex-shrink-0 flex justify-center items-center gap-3 px-4 py-2 bg-[#f0f2f5] border-b border-slate-200/60 z-10">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-slate-200/60">
              <span className="text-sm font-medium text-slate-600">
                {t('PatientRetinalAnalysis.toggles.showHighlights')}
              </span>
              <button
                role="switch"
                aria-checked={showHighlights}
                onClick={() => {
                  if (hasBoundingBoxes) setShowHighlights(!showHighlights);
                }}
                disabled={!hasBoundingBoxes}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  !hasBoundingBoxes
                    ? 'bg-slate-200 cursor-not-allowed'
                    : showHighlights
                      ? 'bg-cyan-400'
                      : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${showHighlights ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </label>
            {hasAnyHeatmap && (
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-slate-200/60">
                <span className="text-sm font-medium text-slate-600">
                  {t('PatientRetinalAnalysis.toggles.showHeatmap')}
                </span>
                <button
                  role="switch"
                  aria-checked={showHeatmap}
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    showHeatmap ? 'bg-orange-400' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${showHeatmap ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </label>
            )}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col min-w-0 min-h-0 p-3 gap-2">
            <div
              className={`relative rounded-2xl overflow-hidden bg-black shadow-lg ${
                images.length > 1
                  ? 'flex-1 min-h-0 max-h-[calc(100vh-220px)]'
                  : 'flex-1 min-h-0 max-h-[calc(100vh-160px)]'
              }`}
            >
              <PatientImageViewer
                toggles={toggles}
                zoomLevel={1}
                anomalies={anomalies}
                isAnalyzing={isLoading}
                currentImage={currentImage}
                showHighlights={showHighlights}
                showHeatmap={showHeatmap}
                heatmapUrl={heatmapUrl}
                heatmapData={heatmapData}
              />
            </div>
            {images.length > 1 && (
              <div className="flex-shrink-0">
                <PatientImageStrip
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelectImage={setSelectedImageId}
                />
              </div>
            )}
          </div>

          <div className="w-[500px] flex-shrink-0 p-4 pl-2 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="px-7 py-7 space-y-7">
                <section className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                      {t(
                        'PatientAnalysisDetail.summary.title',
                        'Detailed AI Findings'
                      )}
                    </h1>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}
                    >
                      {risk.icon}
                      {riskTagLabel}
                    </span>
                  </div>
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    {risk.summary}
                  </p>
                </section>

                <PatientFindings
                  anomalies={anomalies}
                  toggles={toggles}
                  onToggleChange={(key) =>
                    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  friendlyName={(anomaly) =>
                    anomaly.friendlyName || anomaly.name
                  }
                  friendlyDescription={(anomaly) =>
                    anomaly.friendlyDescription ||
                    anomaly.description ||
                    t(
                      'PatientRetinalAnalysis.analysis.helper.detectedByAiTool',
                      'Detected by AuraEyes AI'
                    )
                  }
                />

                <section className="space-y-3">
                  <button
                    onClick={() => navigate('/patient/screening/review')}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-cyan-500/15"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t(
                      'PatientAnalysisDetail.actions.backToReview',
                      'Back to Review'
                    )}
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
