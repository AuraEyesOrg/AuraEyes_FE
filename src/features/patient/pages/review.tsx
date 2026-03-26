import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { SecondaryActionCard } from '../components';
import {
  loadScreeningConsultationContext,
  saveScreeningConsultationContext,
  type ScreeningConsultationContext,
} from '../types/consultation-context';

interface LocationState {
  screeningId?: string;
  images?: RetinalImage[];
  anomalies?: Anomaly[];
  riskLevel?: 'low' | 'moderate' | 'high';
  riskScore?: number;
  rawJsonOutput?: string;
  resultsPersisted?: boolean;
}

const RISK_CONFIG = {
  low: {
    label: 'Looks Healthy',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    summary:
      'Your scan looks healthy. No significant concerns were found — keep up with regular eye check-ups.',
  },
  moderate: {
    label: 'Moderate Risk',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    summary:
      'Signs consistent with moderate changes were detected. It is recommended to consult a specialist for a comprehensive dilated eye exam.',
  },
  high: {
    label: 'Needs Attention',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
    summary:
      'We found areas worth discussing with an eye specialist. Early attention is the best path to protecting your vision.',
  },
};

const EDUCATIONAL_RESOURCES = [
  {
    id: 'dr',
    title: 'Understanding Diabetic Retinopathy',
    description:
      'Learn about the stages, symptoms, and how early detection can save your vision.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFxR93NOalryhGlOgqi9T2v42o3TU2nUkxD2awyslYXzeIeL7QpKDbRbu3KpR5_C491ji76qlH-rcoR5o39Owmw0wF5aYE42CvhbMPXXXIRMn-i_LGybNNTBGYtUjsN3OlkiRDkAvPmT3bRDp8DFAbos8cibPcXaqaD4gOpl6hBIN1nPVbGU1Js2qfBYJHMsPXsn7C6cBOCDdqTL4dySyTmsThxuIHYoO4R1jSwfadoavpJv0-dGPU8K8xA_FT75lZScHxFHCt_UWm',
    link: 'https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/diabetic-retinopathy',
  },
  {
    id: 'exam',
    title: 'What to Expect During an Exam',
    description:
      'A guide to what happens during a comprehensive dilated eye exam.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKEOtY08TxayEZx3M249ftjERzcDDIrwgAQQPMHSgWFrMOD2ObVFHPOs3Z9ztyP0VC7UB2heF46McYllL2JWZyE-_zoWhyjrHy9pJhV8T-IE0sjrnKV5GiqK_FdNhDr7RCJKzxa8KC2rQny59GGaI9cHxw4FK3kFFOxSbwyHLjwhCfoSMjNHqERFO5FNHI68tmdirVXOYodVHchrso_xU2EtlWZzUCNadijthqdFyrf4Tb7WZ5yVGU0ZRc7y-3kEf9FbTSLbZHpoxf',
    link: 'https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases',
  },
  {
    id: 'nutrition',
    title: 'Nutrition for Healthy Vision',
    description:
      'Discover which foods are best for maintaining long-term retinal health.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkX4UhnrdBtgxk5oxAyPZsIWw03yBNx4oQeyWqJvuz-5gyd6Z2BsW_s2NDyjSvhV0S-h_zirpX6u6Jg2C_9SaW6YuRKeQpu8PY1JfMEwToqQnnAY-IBrQgSxJHngUpwpm4B4mtFymYYWFJvy4h9SN_TQsGXMiMO6ThX2Pbtd6jAguXDF-pF4x81HaWevRq5LiqUTWWztKfWXYsUYRVRKg9gAsK64yp1xXpaaz3LXLx0qClurKEGeBvR0N6bXeUnhuUj_JBx-_Rh8fL',
    link: 'https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/keep-your-eyes-healthy',
  },
];

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const storedConsultationContext = useMemo(
    () => loadScreeningConsultationContext(),
    []
  );

  const activeState = state ?? null;

  const images = activeState?.images ?? storedConsultationContext?.images ?? [];
  const anomalies =
    activeState?.anomalies ?? storedConsultationContext?.anomalies ?? [];
  const riskLevel =
    activeState?.riskLevel ?? storedConsultationContext?.riskLevel ?? 'low';
  const risk = RISK_CONFIG[riskLevel];
  const screeningId =
    activeState?.screeningId ?? storedConsultationContext?.screeningId;
  const rawJsonForAnalysis =
    activeState?.rawJsonOutput ?? storedConsultationContext?.rawJsonOutput;
  const resultsPersisted =
    activeState?.resultsPersisted ?? Boolean(rawJsonForAnalysis);

  const primaryAiConfidence = useMemo(() => {
    if (anomalies.length === 0) return null;
    const primary = anomalies.find((a) => a.isHighest);
    if (primary != null) return primary.confidence;
    return Math.max(...anomalies.map((a) => a.confidence));
  }, [anomalies]);

  const consultationContext =
    useMemo<ScreeningConsultationContext | null>(() => {
      if (!screeningId) return null;
      return {
        screeningId,
        images,
        anomalies,
        riskLevel,
        riskScore:
          activeState?.riskScore ??
          storedConsultationContext?.riskScore ??
          undefined,
        rawJsonOutput:
          activeState?.rawJsonOutput ??
          storedConsultationContext?.rawJsonOutput,
        createdAt: new Date().toISOString(),
      };
    }, [
      screeningId,
      images,
      anomalies,
      riskLevel,
      activeState?.riskScore,
      activeState?.rawJsonOutput,
      storedConsultationContext?.riskScore,
      storedConsultationContext?.rawJsonOutput,
    ]);

  useEffect(() => {
    if (!consultationContext) return;
    saveScreeningConsultationContext(consultationContext);
  }, [consultationContext]);

  const thumbnail = images[0]?.url;
  const eyeLabel = images[0]?.eye ?? 'Left Eye (OS)';
  const scanId = screeningId?.slice(0, 8);

  /* guard: no route state */
  if (!activeState && !storedConsultationContext) {
    return (
      <FocusModeLayout
        currentStep="review"
        title="Review & Next Steps"
        exitPath="/patient/screening/new"
        showBreadcrumb={false}
      >
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-(--text-secondary) text-[15px]">
              No analysis results to review. Please start a new screening first.
            </p>
            <button
              onClick={() => navigate('/patient/screening/new')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start New Screening
            </button>
          </div>
        </div>
      </FocusModeLayout>
    );
  }

  return (
    <FocusModeLayout
      currentStep="review"
      title="Review & Next Steps"
      exitPath="/patient/screening/new"
      showBreadcrumb={false}
    >
      <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-(--text-primary)">
                Review &amp; Next Actions
              </h1>
              <p className="text-(--text-secondary) text-lg">
                Analysis complete. Please review your results and recommended
                next steps.
              </p>
            </div>
          </div>

          <div className="w-full surface-primary rounded-2xl shadow-sm surface-border overflow-hidden flex flex-col md:flex-row">
            {/* Image */}
            <div className="w-full md:w-1/3 min-h-[240px] md:min-h-full bg-slate-900 relative group">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Retinal scan"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  No image
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                {eyeLabel}
              </div>
              <button
                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-lg text-white transition-colors"
                title="Zoom Image"
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
                      Scan ID: {scanId}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      Captured:{' '}
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}
                  >
                    {risk.icon}
                    {risk.label}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-(--text-primary)">
                  AI Assessment
                </h3>
                <p className="text-(--text-secondary) leading-relaxed max-w-2xl">
                  {risk.summary}
                  {anomalies.length > 0 && (
                    <>
                      {' '}
                      Detected findings include:{' '}
                      <strong className="text-(--text-primary)">
                        {anomalies
                          .map((a) => a.friendlyName || a.name)
                          .join(', ')}
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
                      navigate('/patient/analysis');
                      return;
                    }
                    navigate('/patient/analysis', {
                      state: {
                        screeningId,
                        rawJsonOutput: rawJsonForAnalysis,
                        resultsPersisted,
                        images: images.map((img) => ({
                          id: img.id,
                          name: img.name,
                          preview: img.url,
                        })),
                      },
                    });
                  }}
                  className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  View Full Analysis Details
                </button>
                {primaryAiConfidence != null && (
                  <>
                    <span className="text-(--border-color)">|</span>
                    <span className="text-xs text-(--text-muted)">
                      AI Confidence: {primaryAiConfidence}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-(--text-primary)">
              Recommended Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* PRIMARY — Book Consultation */}
              <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-[#1e3a5f] rounded-2xl p-6 md:p-8 shadow-sm border border-primary/20 dark:border-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.2] pointer-events-none">
                  <Stethoscope className="w-44 h-44 text-primary" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
                      Primary Recommendation
                    </div>
                    <h3 className="text-2xl font-bold text-(--text-primary) mb-2">
                      Book a Consultation
                    </h3>
                    <p className="text-(--text-secondary) leading-relaxed">
                      Connect with a certified ophthalmologist to review these
                      results in detail. Early intervention is key to
                      maintaining eye health.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        navigate('/patient/doctors', {
                          state: {
                            consultationContext,
                          },
                        })
                      }
                      className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Find a Specialist
                    </button>
                    <button
                      onClick={openN8nChat}
                      className="flex items-center justify-center gap-2 surface-primary hover:bg-gray-50 dark:hover:bg-[#2d4a6f] text-(--text-primary) font-semibold py-3 px-6 rounded-xl surface-border transition-colors"
                    >
                      <Bot className="w-5 h-5" />
                      Ask AURA AI Assistant
                    </button>
                  </div>
                </div>
              </div>

              {/* SECONDARY actions column */}
              <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
                <SecondaryActionCard
                  icon={<FileDown className="w-5 h-5" />}
                  iconBg="bg-blue-50 text-blue-600"
                  title="Download Report"
                  subtitle="PDF Format"
                  actionIcon={<FileDown className="w-4 h-4" />}
                />

                <SecondaryActionCard
                  icon={<ImagePlus className="w-5 h-5" />}
                  iconBg="bg-emerald-50 text-emerald-600"
                  title="New Scan"
                  subtitle="Start a new analysis"
                  actionIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => navigate('/patient/screening/new')}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-(--border-color) pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--text-primary)">
                Learn More About Your Eyes
              </h2>
              <a
                href="https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/diabetic-retinopathy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
              >
                View all resources
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EDUCATIONAL_RESOURCES.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col group"
                >
                  <div className="h-40 rounded-xl bg-gray-200 dark:bg-slate-700 overflow-hidden mb-3">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-bold text-(--text-primary) mb-1 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-(--text-secondary) line-clamp-2">
                    {resource.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          <footer className="pb-6 pt-4 border-t border-(--border-color)">
            <div className="text-center text-sm text-(--text-muted) space-y-1">
              <p>
                <strong className="text-(--text-secondary)">Important:</strong>{' '}
                AURA is an AI-assisted screening tool and does not provide a
                definitive medical diagnosis.
              </p>
              <p>
                &copy; {new Date().getFullYear()} AURA Health. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
      <N8nChatWidget />
    </FocusModeLayout>
  );
}
