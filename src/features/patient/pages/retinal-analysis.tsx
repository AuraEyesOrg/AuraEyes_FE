import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import FocusModeLayout from '../components/FocusModeLayout';
import PatientImageViewer from '../components/ImageViewer';
import PatientFindings from '../components/AnalysisSidebar';
import PatientImageStrip from '../components/ReadOnlyImageGallery';
import { ToggleState, Anomaly, RetinalImage } from '../types/type';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Download,
  CalendarCheck,
  Phone,
  RefreshCw,
  Info,
} from 'lucide-react';

const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: '1',
    name: 'Microaneurysms',
    confidence: 98,
    description: 'Cluster detected in the superior temporal quadrant.',
    color: 'bg-red-500',
    type: 'warning',
    location: { x: 58, y: 32, width: 12, height: 10 },
    friendlyName: 'Tiny blood vessel changes',
    friendlyDescription:
      'We found small changes in the blood vessels in the upper area of your eye. This is one of the earliest signs your doctor may want to monitor.',
  },
  {
    id: '2',
    name: 'Hard Exudates',
    confidence: 94,
    description: 'Lipid residues near the macula.',
    color: 'bg-yellow-400',
    type: 'priority_high',
    location: { x: 30, y: 68, width: 15, height: 12 },
    friendlyName: 'Protein deposits near the retina',
    friendlyDescription:
      'Small protein deposits were found near the central part of your eye. Your eye specialist can assess whether any follow-up is needed.',
  },
];

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
      label: 'Low Risk',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      barColor: 'bg-emerald-400',
      summary:
        'Great news! Your retinal scan looks healthy. No significant concerns were found. We recommend maintaining regular eye check-ups to keep your vision in great shape.',
    },
    moderate: {
      label: 'Moderate',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      barColor: 'bg-amber-400',
      summary:
        "Our AI found some areas that may need attention. This doesn't mean there's a problem — a specialist can review these results and provide you with clear guidance.",
    },
    high: {
      label: 'High Risk',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      barColor: 'bg-rose-400',
      summary:
        "We've detected some findings that are worth discussing with an eye specialist. Please don't worry — early detection is the best path to protecting your vision.",
    },
  };

  const risk = riskConfig[riskLevel];

  // --- AI Analysis Handler ---
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

      let base64Image = '';
      try {
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setAnomalies(MOCK_ANOMALIES);
        setAnalyzed(true);
        setIsFallback(true);
        setErrorMessage('Using demo mode (image fetch failed)');
        setIsAnalyzing(false);
        return;
      }

      if (!import.meta.env.VITE_API_KEY) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAnomalies(MOCK_ANOMALIES);
        setAnalyzed(true);
        setIsFallback(true);
        setErrorMessage('Demo mode: No API key configured');
        setIsAnalyzing(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            {
              text: `Analyze this retinal fundus image. Identify anomalies like Microaneurysms, Hemorrhages, Hard Exudates, Cotton Wool Spots, Drusen, Neovascularization, etc.
Return a JSON object with a key "anomalies" containing an array.
Each item must have:
- id (string)
- name (string, the medical/clinical term)
- confidence (number 0-100)
- description (short clinical description string)
- type ('warning' | 'priority_high' | 'info')
- color (tailwind class e.g. 'bg-red-500')
- location object { x, y, width, height } (percentages 0-100 relative to image)
- friendlyName (string, a patient-friendly plain-language name, e.g. "Tiny blood vessel changes" instead of "Microaneurysms")
- friendlyDescription (string, a reassuring 1-2 sentence explanation in simple language that a non-medical person can understand, avoid clinical jargon)

The friendlyName and friendlyDescription should be written as if explaining to a worried patient — use calm, simple words and avoid alarming language.`,
            },
          ],
        },
        config: { responseMimeType: 'application/json' },
      });

      const json = JSON.parse(response?.text || '{}');
      if (json.anomalies) {
        setAnomalies(json.anomalies);
        if (currentImage) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === currentImage.id
                ? { ...img, analyzed: true, anomalies: json.anomalies }
                : img
            )
          );
        }
      }
      setAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      const err = error as { status?: number; message?: string };
      const isQuotaError =
        err.status === 429 ||
        err.message?.includes('429') ||
        err.message?.includes('quota') ||
        err.message?.includes('RESOURCE_EXHAUSTED');
      setErrorMessage(
        isQuotaError
          ? 'API quota exceeded. Showing demo results.'
          : 'AI analysis unavailable. Showing demo results.'
      );
      setIsFallback(true);
      setAnomalies(MOCK_ANOMALIES);
      setAnalyzed(true);
      if (currentImage) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? { ...img, analyzed: true, anomalies: MOCK_ANOMALIES }
              : img
          )
        );
      }
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
          <div className="flex-1 flex flex-col min-w-0 relative bg-slate-900">
            {/* Image — fills entire left panel */}
            <div className="flex-1 min-h-0">
              <PatientImageViewer
                toggles={toggles}
                zoomLevel={1}
                anomalies={anomalies}
                isAnalyzing={isAnalyzing}
                currentImage={currentImage}
                showHighlights={showHighlights}
              />
            </div>

            {/* Toggle overlay — floats on top-right of image */}
            {analyzed && (
              <div className="absolute top-3 right-3 z-10">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">
                    Show AI Highlights
                  </span>
                  <button
                    role="switch"
                    aria-checked={showHighlights}
                    onClick={() => setShowHighlights(!showHighlights)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showHighlights ? 'bg-teal-500' : 'bg-slate-300'
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
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}
                      >
                        {risk.icon}
                        {risk.label} {riskScore}/10
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-md shadow-teal-500/20"
                      >
                        <Sparkles className="w-5 h-5" />
                        Start Screening
                      </button>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex items-center gap-4 py-2">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-teal-500 animate-spin" />
                      </div>
                      <p className="text-[15px] text-slate-500">
                        Analyzing your retinal scan…
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[15px] text-slate-600 leading-relaxed">
                        Here's what our AI screening found. Your doctor will
                        confirm the results.
                      </p>
                      <p className="text-[15px] text-slate-600 leading-relaxed">
                        {risk.summary}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={handleAnalyze}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Re-analyze
                        </button>
                        {isFallback && errorMessage && (
                          <span className="text-xs text-amber-600 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {errorMessage}
                          </span>
                        )}
                      </div>
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
                  <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                      What You Can Do Next
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <ActionCard
                        icon={
                          <CalendarCheck className="w-5 h-5 text-teal-600" />
                        }
                        title="Book Consultation"
                        description="Book a consultation or referral."
                      />
                      <ActionCard
                        icon={
                          <CalendarCheck className="w-5 h-5 text-amber-600" />
                        }
                        title="Rescreen Later"
                        description="Rescreen in scheduled months."
                      />
                      <ActionCard
                        icon={<Download className="w-5 h-5 text-slate-600" />}
                        title="Download Report"
                        description="Download report to share."
                      />
                      <ActionCard
                        icon={<Phone className="w-5 h-5 text-indigo-600" />}
                        title="Talk to Expert"
                        description="Talk to expert for guidance."
                      />
                    </div>
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

// --- Action Card Component ---
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ActionCard({ icon, title, description }: ActionCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}
