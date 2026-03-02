import { useLocation, useNavigate } from 'react-router-dom';
import FocusModeLayout from '../components/FocusModeLayout';
import { Anomaly, RetinalImage } from '../types/type';
import {
  ShieldCheck,
  AlertTriangle,
  CalendarCheck,
  FileDown,
  Send,
  ImagePlus,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  ChevronRight,
  Stethoscope,
  Bot,
  MessageCircle,
} from 'lucide-react';
import { SecondaryActionCard } from '../components';

interface LocationState {
  images?: RetinalImage[];
  anomalies?: Anomaly[];
  riskLevel?: 'low' | 'moderate' | 'high';
  riskScore?: number;
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

  const images = state?.images ?? [];
  const anomalies = state?.anomalies ?? [];
  const riskLevel = state?.riskLevel ?? 'low';
  const risk = RISK_CONFIG[riskLevel];

  const thumbnail = images[0]?.url;
  const eyeLabel = images[0]?.eye ?? 'Left Eye (OS)';
  const remainingMoney = 200000;
  const scanId = `#AUR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleShareToChat = () => {
    navigate('/patient/chat', {
      state: {
        sharedScan: {
          imageUrl: thumbnail,
          eyeLabel,
          riskLevel,
          riskLabel: risk.label,
          anomalies: anomalies.map((a) => a.friendlyName || a.name),
          summary: risk.summary,
          scanId,
        },
      },
    });
  };

  /* guard: no route state */
  if (!state) {
    return (
      <FocusModeLayout
        currentStep="review"
        title="Review & Next Steps"
        exitPath="/patient/screening/new"
        showBreadcrumb={false}
      >
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-slate-500 text-[15px]">
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
      <div className="flex-1 overflow-y-auto bg-[#f0f2f5]">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-800">
                Review &amp; Next Actions
              </h1>
              <p className="text-slate-500 text-lg">
                Analysis complete. Please review your results and recommended
                next steps.
              </p>
            </div>

            {/* Credit widget */}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Available Balance
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {remainingMoney.toLocaleString()}đ Left
                </span>
              </div>
              <button
                onClick={() => navigate('/patient/wallet')}
                className="text-cyan-600 hover:text-cyan-700 font-bold text-sm bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Top-up
              </button>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col md:flex-row">
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
                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
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
                    <p className="text-sm text-black-400 font-medium mb-0.5">
                      Scan ID: {scanId}
                    </p>
                    <p className="text-xs text-black-400">
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

                <h3 className="text-xl font-bold mb-2 text-slate-800">
                  AI Assessment
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-2xl">
                  {risk.summary}
                  {anomalies.length > 0 && (
                    <>
                      {' '}
                      Detected findings include:{' '}
                      <strong className="text-slate-700">
                        {anomalies
                          .map((a) => a.friendlyName || a.name)
                          .join(', ')}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  View Full Analysis Details
                </button>
                {anomalies.length > 0 && (
                  <>
                    <span className="text-slate-200">|</span>
                    <span className="text-xs text-slate-400">
                      AI Confidence:{' '}
                      {Math.round(
                        anomalies.reduce((s, a) => s + a.confidence, 0) /
                          anomalies.length
                      )}
                      %
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
              Recommended Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* PRIMARY — Book Consultation */}
              <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-cyan-50 to-white rounded-2xl p-6 md:p-8 shadow-sm border border-cyan-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.2] pointer-events-none">
                  <Stethoscope className="w-44 h-44 text-cyan-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100/60 text-cyan-700 text-[11px] font-bold uppercase tracking-wider mb-4">
                      Primary Recommendation
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Book a Consultation
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      Connect with a certified ophthalmologist to review these
                      results in detail. Early intervention is key to
                      maintaining eye health.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/patient/appointments')}
                      className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Find a Specialist
                    </button>
                    <button
                      onClick={() => navigate('/patient/chat')}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-colors"
                    >
                      <Bot className="w-5 h-5" />
                      Ask AURA AI Assistant
                    </button>
                    <button
                      onClick={handleShareToChat}
                      className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transform hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Send Results to Doctor
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
                  icon={<Send className="w-5 h-5" />}
                  iconBg="bg-violet-50 text-violet-600"
                  title="Share with Doctor"
                  subtitle="Send scan to chat"
                  actionIcon={<MessageCircle className="w-4 h-4" />}
                  onClick={handleShareToChat}
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

          <section className="border-t border-slate-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Learn More About Your Eyes
              </h2>
              <a
                href="https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/diabetic-retinopathy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition-colors"
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
                  <div className="h-40 rounded-xl bg-slate-200 overflow-hidden mb-3">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1 group-hover:text-cyan-600 transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {resource.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          <footer className="pb-6 pt-4 border-t border-slate-200">
            <div className="text-center text-sm text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-500">Important:</strong> AURA is
                an AI-assisted screening tool and does not provide a definitive
                medical diagnosis.
              </p>
              <p>
                &copy; {new Date().getFullYear()} AURA Health. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </FocusModeLayout>
  );
}
