import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Loader2,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { orgScreeningApi } from '../api/screening.api';
import { unwrapApiData } from '@/types/api-response';

type RiskLevel = 'Low' | 'Moderate' | 'High';

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

export default function OrganisationScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const screeningId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sessionData, setSessionData] = useState<{
    screeningId: string;
    patientId: string;
    modelVersion: string;
    createdAt: string;
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
  } | null>(null);

  useEffect(() => {
    if (!screeningId) return;

    orgScreeningApi
      .getSessionDetail(screeningId)
      .then((res) => {
        const data = unwrapApiData(res);
        setSessionData(data as typeof sessionData);
        if (data?.latestResult) setSaved(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [screeningId]);

  const handleSaveResults = async () => {
    if (!screeningId || !sessionData) return;
    setSaving(true);

    try {
      await orgScreeningApi.saveResults(screeningId, {
        rawJsonOutput: JSON.stringify({ source: 'organisation-screening' }),
        riskLevel: (sessionData.latestResult?.riskLevel as RiskLevel) || 'Low',
        confidenceScore: sessionData.latestResult?.confidenceScore || 0,
        summary: sessionData.latestResult?.summary || 'AI screening completed',
        findings: sessionData.latestResult?.findings || '',
      });
      setSaved(true);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const riskLevel =
    (sessionData?.latestResult?.riskLevel as RiskLevel) || 'Low';
  const risk = riskConfig[riskLevel] || riskConfig.Low;
  const RiskIcon = risk.icon;

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader />
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
      <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader />
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
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/organisation/screening')}
                className="w-10 h-10 rounded-xl bg-(--bg-secondary) border border-(--border-primary) flex items-center justify-center hover:bg-(--bg-tertiary) transition"
              >
                <ArrowLeft className="w-5 h-5 text-(--text-secondary)" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-(--text-primary)">
                  Screening Results
                </h1>
                <p className="text-sm text-(--text-tertiary)">
                  Session {screeningId?.slice(0, 8)}… ·{' '}
                  {new Date(sessionData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-secondary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={handleSaveResults}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${
                  saved
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
                {saved ? 'Saved' : saving ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Image Viewer */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image */}
              <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)">
                {sessionData.images.length > 0 ? (
                  <img
                    src={sessionData.images[selectedImageIndex]?.imageUrl}
                    alt="Retinal scan"
                    className="w-full h-96 object-contain bg-black"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-slate-900">
                    <Eye className="w-16 h-16 text-slate-700" />
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {sessionData.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sessionData.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                        i === selectedImageIndex
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-(--border-primary) opacity-60 hover:opacity-100'
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
              )}
            </div>

            {/* Right: Results Panel */}
            <div className="space-y-4">
              {/* Risk Level Card */}
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
                    <p className="text-sm text-(--text-tertiary)">Risk Level</p>
                    <p className={`text-2xl font-bold ${risk.color}`}>
                      {riskLevel}
                    </p>
                  </div>
                </div>

                {sessionData.latestResult && (
                  <div className="space-y-3">
                    {/* Confidence */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-(--text-secondary)">
                          Confidence
                        </span>
                        <span className="font-semibold text-(--text-primary)">
                          {sessionData.latestResult.confidenceScore}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${sessionData.latestResult.confidenceScore}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {sessionData.latestResult?.summary && (
                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5">
                  <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Summary
                  </h3>
                  <p className="text-sm text-(--text-secondary) leading-relaxed">
                    {sessionData.latestResult.summary}
                  </p>
                </div>
              )}

              {/* Findings */}
              {sessionData.latestResult?.findings && (
                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5">
                  <h3 className="text-sm font-semibold text-(--text-primary) mb-2">
                    Findings
                  </h3>
                  <p className="text-sm text-(--text-secondary) leading-relaxed whitespace-pre-wrap">
                    {sessionData.latestResult.findings}
                  </p>
                </div>
              )}

              {/* Metadata */}
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
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
