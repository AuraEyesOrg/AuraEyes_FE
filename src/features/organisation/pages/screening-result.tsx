import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Printer,
  RefreshCw,
  Sparkles,
  Save,
  AlertCircle,
  Loader2,
  Activity,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { OrganisationScreeningStepper } from '../components/OrganisationScreeningStepper';
import { OrganisationRetinalViewerCard } from '../components/OrganisationRetinalViewerCard';
import ConfirmModal from '@/components/ui/confirm-modal';
import { orgScreeningApi } from '../api/screening.api';
import { unwrapApiData } from '@/types/api-response';
import { aiCoreClient } from '@/lib/axios';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { getDiseaseUrgency } from '@/features/patient/mock/disease-mapping';
import i18n from '@/i18n/i18n';
import type {
  AiFindingItem,
  AIStandardResponse,
  DetectionBox,
  ImageLayout,
  OrgScreeningSessionDetail,
  ResultDraft,
  RiskLevel,
} from '@/features/organisation/types/screening-result.types';
import {
  buildFindingsText,
  buildSummary,
  clampConfidence,
  composeFindingsWithNote,
  extractTopKFromRaw,
  extractVisualArtifactsFromRaw,
  getErrorMessage,
  mapAiFindings,
  normalizeRiskLevel,
  riskConfig,
  splitFindingsAndNote,
  toRiskLevelFromUrgency,
} from '@/features/organisation/utils/screening-result.util';

const HISTORY_BACK_INTENT = '__history_back__';
const HISTORY_GUARD_MARKER = '__screening_result_leave_guard__';

export default function OrganisationScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const screeningId = searchParams.get('id');
  const autoAnalysisTriggeredRef = useRef(false);
  const currentPathRef = useRef('');
  const allowNextPopRef = useRef(false);
  const currentLanguage = useMemo(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'vi',
    [i18n.language, i18n.resolvedLanguage]
  );

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sessionData, setSessionData] =
    useState<OrgScreeningSessionDetail | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | undefined>();
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const [consultationNote, setConsultationNote] = useState('');
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
  const isViewOnly = Boolean(sessionData?.latestResult);
  const hasUnsavedRecord = Boolean(draft) && !saved && !isViewOnly;

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
      const mappedFindings = mapAiFindings(topK, currentLanguage);

      setAiFindings(mappedFindings);
      setRawJsonOutput(detail.rawJsonOutput);

      if (detail.latestResult) {
        const parsed = splitFindingsAndNote(detail.latestResult.findings);
        setDraft({
          riskLevel: normalizeRiskLevel(detail.latestResult.riskLevel),
          confidenceScore: clampConfidence(detail.latestResult.confidenceScore),
          summary:
            detail.latestResult.summary ??
            buildSummary(
              normalizeRiskLevel(detail.latestResult.riskLevel),
              mappedFindings[0]?.localizedName
            ),
          findings: parsed.findings || buildFindingsText(mappedFindings),
        });
        setConsultationNote(parsed.note);
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

      setConsultationNote('');
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
    currentPathRef.current = `${location.pathname}${location.search}${location.hash}`;
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, [updateImageLayout]);

  useEffect(() => {
    updateImageLayout();
  }, [selectedImage?.imageUrl, rawJsonOutput, updateImageLayout]);

  const updateDraft = useCallback(
    <K extends keyof ResultDraft>(key: K, value: ResultDraft[K]) => {
      if (isViewOnly) {
        return;
      }

      setDraft((current) => {
        if (!current) return current;
        return { ...current, [key]: value };
      });
      setSaved(false);
    },
    [isViewOnly]
  );

  const handleNoteChange = (value: string) => {
    if (isViewOnly) {
      return;
    }

    setConsultationNote(value);
    setSaved(false);
  };

  const handleAnalyze = useCallback(async () => {
    if (
      isViewOnly ||
      !sessionData ||
      sessionData.images.length === 0 ||
      analyzing
    )
      return;

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

      const mappedFindings = mapAiFindings(topK, currentLanguage);

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
      setConsultationNote('');
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
  }, [sessionData, selectedImageIndex, analyzing, currentLanguage, isViewOnly]);

  useEffect(() => {
    if (!sessionData || sessionData.latestResult) return;
    if (sessionData.images.length === 0 || analyzing) return;
    if (draft) return;
    if (autoAnalysisTriggeredRef.current) return;

    autoAnalysisTriggeredRef.current = true;
    void handleAnalyze();
  }, [sessionData, analyzing, draft, handleAnalyze]);

  const executeSaveResults = async () => {
    if (isViewOnly || !screeningId || !sessionData || !draft) return;

    const note = consultationNote.trim();
    if (!note) {
      toast.error(
        'Please add an organisation consultation note before saving.'
      );
      return;
    }

    const jsonOutput = rawJsonOutput ?? sessionData.rawJsonOutput;
    if (!jsonOutput) {
      toast.error('Please run AI analysis before saving this record.');
      return;
    }

    setSaveConfirmOpen(false);
    setSaving(true);

    try {
      await orgScreeningApi.saveResults(screeningId, {
        rawJsonOutput: jsonOutput,
        riskLevel: draft.riskLevel,
        confidenceScore: clampConfidence(draft.confidenceScore),
        summary: draft.summary,
        findings: composeFindingsWithNote(draft.findings, note),
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

  const requestSaveResults = () => {
    if (!screeningId || !sessionData || !draft || isViewOnly) return;

    const note = consultationNote.trim();
    if (!note) {
      toast.error(
        'Please add an organisation consultation note before saving.'
      );
      return;
    }

    if (!(rawJsonOutput ?? sessionData.rawJsonOutput)) {
      toast.error('Please run AI analysis before saving this record.');
      return;
    }

    setSaveConfirmOpen(true);
  };

  const confirmExit = () => {
    const fallbackPath = resolvePathWithLocale('/organisation/patients');
    const targetPath = pendingNavigationPath ?? fallbackPath;

    setExitConfirmOpen(false);
    setPendingNavigationPath(null);

    if (targetPath === HISTORY_BACK_INTENT) {
      if (window.history.length >= 3) {
        allowNextPopRef.current = true;
        window.history.go(-2);
        return;
      }

      navigate(fallbackPath);
      return;
    }

    navigate(targetPath);
  };

  const cancelExit = () => {
    setExitConfirmOpen(false);
    setPendingNavigationPath(null);
  };

  useEffect(() => {
    if (!hasUnsavedRecord) {
      return;
    }

    window.history.pushState(
      { ...(window.history.state ?? {}), [HISTORY_GUARD_MARKER]: true },
      '',
      currentPathRef.current || window.location.href
    );
  }, [hasUnsavedRecord]);

  useEffect(() => {
    if (!hasUnsavedRecord) {
      return;
    }

    const handleHistoryNavigation = () => {
      if (allowNextPopRef.current) {
        allowNextPopRef.current = false;
        return;
      }

      const currentPath = currentPathRef.current || window.location.href;
      window.history.pushState(
        { ...(window.history.state ?? {}), [HISTORY_GUARD_MARKER]: true },
        '',
        currentPath
      );

      setPendingNavigationPath(HISTORY_BACK_INTENT);
      setExitConfirmOpen(true);
    };

    window.addEventListener('popstate', handleHistoryNavigation);
    return () =>
      window.removeEventListener('popstate', handleHistoryNavigation);
  }, [hasUnsavedRecord]);

  useEffect(() => {
    if (!hasUnsavedRecord) {
      return;
    }

    const handleDocumentNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.hasAttribute('download')) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.origin);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextPath === currentPath) {
        return;
      }

      event.preventDefault();
      setPendingNavigationPath(nextPath);
      setExitConfirmOpen(true);
    };

    window.addEventListener('click', handleDocumentNavigation, true);
    return () =>
      window.removeEventListener('click', handleDocumentNavigation, true);
  }, [hasUnsavedRecord]);

  useEffect(() => {
    if (!hasUnsavedRecord) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue =
        'Toan bo thay doi chua luu se mat. Ban co chac muon thoat?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedRecord]);

  const riskLevel = draft?.riskLevel ?? 'Low';
  const risk = riskConfig[riskLevel] || riskConfig.Low;
  const RiskIcon = risk.icon;

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
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
      <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
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
                onClick={() =>
                  navigate(resolvePathWithLocale('/organisation/screening'))
                }
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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader pageName="Screening Results" />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
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
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) transition"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>

                  {isViewOnly ? (
                    <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                      View-only mode: record already saved
                    </span>
                  ) : (
                    <>
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
                        onClick={requestSaveResults}
                        disabled={
                          saving ||
                          analyzing ||
                          !draft ||
                          consultationNote.trim().length === 0
                        }
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${
                          saved && !saving
                            ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                            : 'bg-primary text-white shadow-primary/25 hover:bg-primary/90 disabled:opacity-50'
                        }`}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saved && !saving
                          ? 'Saved'
                          : saving
                            ? 'Saving…'
                            : 'Save Record'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <OrganisationScreeningStepper activeStep="review-save" />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
              <div className="space-y-4">
                <OrganisationRetinalViewerCard
                  selectedImage={selectedImage}
                  selectedImageIndex={selectedImageIndex}
                  images={sessionData.images}
                  analyzing={analyzing}
                  detectedBoxes={detectedBoxes}
                  showHighlights={showHighlights}
                  showHeatmap={showHeatmap}
                  heatmapUrl={heatmapUrl}
                  imageLayout={imageLayout}
                  imageContainerRef={imageContainerRef}
                  imageRef={imageRef}
                  onToggleHighlights={() =>
                    setShowHighlights((current) => !current)
                  }
                  onToggleHeatmap={() => setShowHeatmap((current) => !current)}
                  onImageLoad={updateImageLayout}
                  onSelectImage={setSelectedImageIndex}
                />

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
                              disabled={isViewOnly}
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                draft.riskLevel === item
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-(--border-primary) text-(--text-secondary) hover:bg-(--bg-tertiary)'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                          disabled={isViewOnly}
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
                      readOnly={isViewOnly}
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
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
                      Organisation Consultation Note (Required)
                    </h3>
                    <p className="text-xs text-(--text-tertiary)">
                      This note is mandatory and will be stored with the saved
                      record.
                    </p>
                    <textarea
                      value={consultationNote}
                      readOnly={isViewOnly}
                      onChange={(event) => handleNoteChange(event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                      placeholder="Write the consultation note for this screening session..."
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
                      readOnly={isViewOnly}
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
        </main>

        <ConfirmModal
          open={saveConfirmOpen}
          title="Xac nhan luu ket qua"
          message="Ban co chac muon luu ket qua screening nay khong? Sau khi luu, phien nay se chuyen sang che do chi xem."
          confirmLabel="Luu ket qua"
          cancelLabel="Kiem tra lai"
          tone="default"
          isLoading={saving}
          onCancel={() => {
            if (!saving) {
              setSaveConfirmOpen(false);
            }
          }}
          onConfirm={() => {
            void executeSaveResults();
          }}
        />

        <ConfirmModal
          open={exitConfirmOpen}
          title="Xac nhan thoat"
          message="Toan bo thay doi chua luu se mat. Ban co chac muon thoat khong?"
          confirmLabel="Thoat"
          cancelLabel="O lai"
          tone="danger"
          onCancel={cancelExit}
          onConfirm={confirmExit}
        />
      </div>
    </div>
  );
}
