import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiCoreClient } from '../../../lib/axios';
import FocusModeLayout from '../components/FocusModeLayout';
import PatientImageViewer from '../components/ImageViewer';
import PatientFindings from '../components/AnalysisSidebar';
import PatientImageStrip from '../components/ReadOnlyImageGallery';
import { ToggleState, Anomaly, RetinalImage } from '../types/type';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';

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

/**
 * Map AI standard response → Anomaly[] for the frontend.
 * - Primary disease gets the best localization lesion(s) merged into one entry.
 * - Each unique top_k disease (excluding duplicates) is shown as a separate finding.
 */
function mapStandardResponseToAnomalies(
  data: AIStandardResponse,
  imgWidth: number,
  imgHeight: number
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const primary = data.prediction.primary;
  const lesions = data.localization?.all_lesions ?? [];

  // 1. Primary diagnosis — attach the highest-confidence lesion's bbox
  const bestLesion = lesions.length > 0 ? lesions[0] : null;
  const friendly = FRIENDLY_NAMES[primary.class_name];
  anomalies.push({
    id: '1',
    name: primary.class_name,
    confidence: Math.round(primary.confidence * 100),
    description: bestLesion
      ? `${primary.class_name} — primary region detected with ${Math.round(bestLesion.confidence * 100)}% localization confidence.`
      : `${primary.class_name} detected in the retinal image.`,
    color: getColorClass(primary.confidence),
    type: mapDiagnosisType(primary.confidence),
    location: bestLesion
      ? toPercentLocation(bestLesion.bbox, imgWidth, imgHeight)
      : undefined,
    friendlyName: friendly?.name,
    friendlyDescription: friendly?.description,
  });

  // 2. Add secondary lesion regions (skip first, already used) as area markers
  //    only if they're meaningfully spread apart (>5% from primary area)
  if (lesions.length > 1) {
    const secondaryLesions = lesions.slice(1, 4); // max 3 extra regions
    secondaryLesions.forEach((lesion, idx) => {
      const loc = toPercentLocation(lesion.bbox, imgWidth, imgHeight);
      anomalies.push({
        id: `region-${idx + 2}`,
        name: primary.class_name,
        confidence: Math.round(lesion.confidence * 100),
        description: `Additional affected region (${Math.round(lesion.confidence * 100)}% confidence).`,
        color: getColorClass(lesion.confidence),
        type: mapDiagnosisType(lesion.confidence),
        location: loc,
        friendlyName: 'Additional affected area',
        friendlyDescription:
          'Another area where our AI detected similar changes. Your specialist can evaluate all regions together.',
      });
    });
  }

  // 3. Other diseases from top_k (only those with status != primary, deduplicated)
  const seenNames = new Set([primary.class_name]);
  let nextId = anomalies.length + 1;

  for (const pred of data.prediction.top_k) {
    if (seenNames.has(pred.class_name)) continue;
    if (pred.confidence < 0.02) continue; // skip negligible
    seenNames.add(pred.class_name);

    const predFriendly = FRIENDLY_NAMES[pred.class_name];
    anomalies.push({
      id: String(nextId++),
      name: pred.class_name,
      confidence: Math.round(pred.confidence * 100),
      description: `Possible ${pred.class_name} — low probability finding (${Math.round(pred.confidence * 100)}%).`,
      color: getColorClass(pred.confidence),
      type: 'info',
      // No specific location for secondary predictions
      friendlyName: predFriendly?.name ?? pred.class_name,
      friendlyDescription:
        predFriendly?.description ??
        'A secondary observation our AI flagged. This is a low-probability finding that your specialist can assess.',
    });
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
  images?: RouteStateImage[];
  source?: string;
}

// --- Helpers: use AI-generated friendly fields, fallback to raw name/description ---
function friendlyName(anomaly: Anomaly): string {
  return anomaly.friendlyName || anomaly.name;
}

function friendlyDescription(anomaly: Anomaly): string {
  return (
    anomaly.friendlyDescription ||
    anomaly.description ||
    'Detected by our AI screening tool.'
  );
}

export default function RetinalAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as LocationState | null;

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

  // Image management
  const [images, setImages] = useState<RetinalImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (routeState?.images && routeState.images.length > 0) {
      const incomingImages: RetinalImage[] = routeState.images.map((img) => ({
        id: img.id,
        url: img.preview,
        name: img.name,
        eye:
          img.name.toLowerCase().includes('od') ||
          img.name.toLowerCase().includes('right')
            ? 'Right Eye (OD)'
            : 'Left Eye (OS)',
        uploadedAt: new Date().toISOString(),
        analyzed: false,
        anomalies: [],
      }));
      setImages(incomingImages);
      setSelectedImageId(incomingImages[0].id);
      setAnalyzed(false);
      setAnomalies([]);
      window.history.replaceState({}, document.title);
    } else {
      navigate('/patient/screening/new', { replace: true });
    }
  }, []);

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
    }
  };

  // --- Risk score computation ---
  const riskScore =
    anomalies.length > 0
      ? Math.round(
          anomalies.reduce((acc, curr) => acc + curr.confidence, 0) /
            anomalies.length /
            10
        )
      : 0;

  const riskLevel: 'low' | 'moderate' | 'high' =
    riskScore >= 7 ? 'high' : riskScore >= 4 ? 'moderate' : 'low';

  const riskConfig = {
    low: {
      label: 'Looks Healthy',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      summary:
        'Great news — your retinal scan looks healthy. No significant concerns were found. We recommend maintaining regular eye check-ups to keep your vision in great shape.',
    },
    moderate: {
      label: 'Worth Reviewing',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      summary:
        "Our AI noticed some areas that may benefit from a specialist\'s review. This doesn\'t mean there\'s a problem — it simply means a closer look could be helpful.",
    },
    high: {
      label: 'Needs Attention',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      summary:
        "We\'ve found some areas worth discussing with an eye specialist. Early detection is the best path to protecting your vision — your next step is to have these results reviewed by a doctor.",
    },
  };

  const risk = riskConfig[riskLevel];

  // --- AI Analysis Handler (AURA AI /analyze endpoint) ---
  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalyzed(false);
    setAnomalies([]);
    setIsFallback(false);
    setErrorMessage(null);

    try {
      const imageUrl = currentImage?.url;
      if (!imageUrl) {
        setErrorMessage('No image available for analysis');
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

      // Map AI response → deduplicated Anomaly[] with correct image-relative coords
      const mapped = mapStandardResponseToAnomalies(data, imgWidth, imgHeight);
      setAnomalies(mapped);
      setShowHighlights(true);

      if (currentImage) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? { ...img, analyzed: true, anomalies: mapped }
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
        setErrorMessage('AI model is loading. Please try again in a moment.');
      } else if (status === 400) {
        setErrorMessage(
          'Invalid image. Please upload a valid retinal fundus image.'
        );
      } else {
        setErrorMessage(
          'AI analysis unavailable. Please check that the AI service is running.'
        );
      }
      setIsFallback(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <FocusModeLayout
      currentStep="analysis"
      title="Your Screening Results"
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
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">
                    Show AI Highlights
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
                      Your Retinal Health Summary
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
                        Our AI will examine your retinal images for any signs
                        that need attention. This usually takes just a few
                        seconds.
                      </p>
                      <button
                        onClick={handleAnalyze}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-cyan-500/20"
                      >
                        <Sparkles className="w-5 h-5" />
                        Start Screening
                      </button>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex items-center gap-4 py-2">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-cyan-500 animate-spin" />
                      </div>
                      <p className="text-[15px] text-slate-500">
                        Analyzing your retinal scan…
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
                          state: { images, anomalies, riskLevel, riskScore },
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-cyan-500/15"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="w-full inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-analyze scan
                    </button>
                  </section>
                )}

                {/* ---- Disclaimer ---- */}
                <section className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    <strong className="text-slate-600">Important:</strong> This
                    AI screening assists but does not replace professional
                    medical advice. Results should be reviewed by a qualified
                    ophthalmologist.
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
