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
import {
  downloadBlobFile,
  getFileNameFromContentDisposition,
} from '@/lib/file-export';
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

export default function OrganisationScreeningResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const screeningId = searchParams.get('id');

  const locationState = location.state as { patientName?: string } | null;
  const locationPatientName = locationState?.patientName?.trim() ?? '';

  const currentLanguage = useMemo(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'vi',
    [i18n.language, i18n.resolvedLanguage]
  );

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
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
  const canDownloadPdf = Boolean(screeningId && sessionData?.latestResult);
  const hasUnsavedRecord = Boolean(draft) && !saved && !isViewOnly;
  const patientDisplayName =
    sessionData?.patientName?.trim() || locationPatientName || 'Bệnh nhân';

  // ─── Navigation Guard ────────────────────────────────────────────────────────

  // Xử lý beforeunload (F5, đóng tab) — vẫn cần vì nằm ngoài React Router
  useEffect(() => {
    if (!hasUnsavedRecord) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedRecord]);
  // ─────────────────────────────────────────────────────────────────────────────

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
        toast.error(getErrorMessage(error, 'Không thể tải kết quả khám.'));
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

    void loadSessionDetail(true);
  }, [screeningId, loadSessionDetail]);

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, [updateImageLayout]);

  useEffect(() => {
    updateImageLayout();
  }, [selectedImage?.imageUrl, rawJsonOutput, updateImageLayout]);

  const updateDraft = useCallback(
    <K extends keyof ResultDraft>(key: K, value: ResultDraft[K]) => {
      if (isViewOnly) return;

      setDraft((current) => {
        if (!current) return current;
        return { ...current, [key]: value };
      });
      setSaved(false);
    },
    [isViewOnly]
  );

  const handleNoteChange = (value: string) => {
    if (isViewOnly) return;
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
        'Phân tích AI hoàn tất. Bạn có thể chỉnh sửa kết quả trước khi lưu.'
      );
    } catch (error) {
      console.error('Organisation AI analysis failed:', error);
      toast.error(
        getErrorMessage(
          error,
          'Phân tích AI thất bại. Vui lòng kiểm tra dịch vụ AI và thử lại.'
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }, [sessionData, selectedImageIndex, analyzing, currentLanguage, isViewOnly]);

  const handleDownloadPdf = useCallback(async () => {
    if (downloadingPdf || !screeningId) return;
    if (!canDownloadPdf) {
      toast.info('Vui lòng lưu hồ sơ trước khi in PDF.');
      return;
    }

    setDownloadingPdf(true);
    try {
      const { blob, contentDisposition } =
        await orgScreeningApi.downloadSessionReportPdf(screeningId);

      const fallbackFileName = `screening-report-${screeningId.slice(0, 8)}.pdf`;
      const fileName =
        getFileNameFromContentDisposition(contentDisposition) ||
        fallbackFileName;

      downloadBlobFile(blob, fileName);
      toast.success('Đã tải báo cáo PDF.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải báo cáo PDF.'));
    } finally {
      setDownloadingPdf(false);
    }
  }, [screeningId, downloadingPdf, canDownloadPdf]);

  const executeSaveResults = async () => {
    if (isViewOnly || !screeningId || !sessionData || !draft) return;

    const note = consultationNote.trim();
    if (!note) {
      toast.error('Vui lòng thêm ghi chú tư vấn trước khi lưu.');
      return;
    }

    const jsonOutput = rawJsonOutput ?? sessionData.rawJsonOutput;
    if (!jsonOutput) {
      toast.error('Vui lòng chạy phân tích AI trước khi lưu hồ sơ.');
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
      toast.success('Lưu kết quả khám thành công.');
      await loadSessionDetail(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(
        getErrorMessage(err, 'Không thể lưu kết quả. Vui lòng thử lại.')
      );
    } finally {
      setSaving(false);
    }
  };

  const requestSaveResults = () => {
    if (!screeningId || !sessionData || !draft || isViewOnly) return;

    const note = consultationNote.trim();
    if (!note) {
      toast.error('Vui lòng thêm ghi chú tư vấn trước khi lưu.');
      return;
    }

    if (!(rawJsonOutput ?? sessionData.rawJsonOutput)) {
      toast.error('Vui lòng chạy phân tích AI trước khi lưu hồ sơ.');
      return;
    }

    setSaveConfirmOpen(true);
  };

  const riskLevel = draft?.riskLevel ?? 'Low';
  const risk = riskConfig[riskLevel] || riskConfig.Low;
  const RiskIcon = risk.icon;

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrganisationHeader pageName="Kết quả khám" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-(--text-secondary)">Đang tải kết quả khám…</p>
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
          <OrganisationHeader pageName="Kết quả khám" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-(--text-primary) font-semibold">
                Không tìm thấy phiên khám
              </p>
              <button
                onClick={() =>
                  navigate(resolvePathWithLocale('/organisation/screening'))
                }
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
              >
                Quay lại danh sách khám
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
        <OrganisationHeader pageName="Kết quả khám" />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-(--text-primary)">
                        Kết quả khám
                      </h1>
                      <p className="text-sm text-(--text-tertiary)">
                        Bệnh nhân: {patientDisplayName} · Phiên{' '}
                        {screeningId?.slice(0, 8)}… ·{' '}
                        {new Date(sessionData.createdAt).toLocaleString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={
                      downloadingPdf ||
                      loading ||
                      !screeningId ||
                      !canDownloadPdf
                    }
                    title={
                      canDownloadPdf
                        ? 'Tải báo cáo PDF'
                        : 'Vui lòng lưu hồ sơ trước khi in PDF.'
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                    {downloadingPdf
                      ? 'Đang tạo PDF…'
                      : canDownloadPdf
                        ? 'Tải PDF'
                        : 'Lưu hồ sơ để in PDF'}
                  </button>

                  {isViewOnly ? (
                    <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                      Chế độ xem — hồ sơ đã được lưu
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
                        {analyzing ? 'Đang phân tích…' : 'Phân tích'}
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
                          ? 'Đã lưu'
                          : saving
                            ? 'Đang lưu…'
                            : 'Lưu hồ sơ'}
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
                    Kết quả phân tích AI
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
                      Kết quả phân tích sẽ hiển thị ở đây sau khi AI hoàn tất.
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
                        Mức độ rủi ro
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
                            Độ tin cậy
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
                          Điểm tin cậy (0–100)
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
                      Tóm tắt AI (có thể chỉnh sửa)
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
                      Ghi chú tư vấn tổ chức (bắt buộc)
                    </h3>
                    <p className="text-xs text-(--text-tertiary)">
                      Ghi chú này là bắt buộc và sẽ được lưu cùng hồ sơ.
                    </p>
                    <textarea
                      value={consultationNote}
                      readOnly={isViewOnly}
                      onChange={(event) => handleNoteChange(event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                      placeholder="Nhập ghi chú tư vấn cho phiên khám này…"
                    />
                  </div>
                )}

                {draft && (
                  <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      Kết quả chẩn đoán (có thể chỉnh sửa)
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
                      Chưa có kết quả AI. Nhấn "Phân tích lại" để chạy AI và
                      chuẩn bị kết quả có thể chỉnh sửa.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-(--text-primary)">
                    Thông tin phiên khám
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Mô hình</span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.modelVersion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Số ảnh</span>
                      <span className="text-(--text-primary) font-medium">
                        {sessionData.images.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Ngày tạo</span>
                      <span className="text-(--text-primary) font-medium">
                        {new Date(sessionData.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                    {sessionData.latestResult?.assessedAt && (
                      <div className="flex justify-between">
                        <span className="text-(--text-tertiary)">
                          Đánh giá lần cuối
                        </span>
                        <span className="text-(--text-primary) font-medium">
                          {new Date(
                            sessionData.latestResult.assessedAt
                          ).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-(--text-tertiary)">Mã phiên</span>
                      <span className="text-(--text-primary) font-medium text-xs">
                        {sessionData.screeningId.slice(0, 8)}…
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal xác nhận lưu kết quả */}
        <ConfirmModal
          open={saveConfirmOpen}
          title="Xác nhận lưu kết quả"
          message="Bạn có chắc muốn lưu kết quả khám này không? Sau khi lưu, phiên này sẽ chuyển sang chế độ chỉ xem và không thể chỉnh sửa."
          confirmLabel="Lưu kết quả"
          cancelLabel="Kiểm tra lại"
          tone="default"
          isLoading={saving}
          onCancel={() => {
            if (!saving) setSaveConfirmOpen(false);
          }}
          onConfirm={() => {
            void executeSaveResults();
          }}
        />
      </div>
    </div>
  );
}
