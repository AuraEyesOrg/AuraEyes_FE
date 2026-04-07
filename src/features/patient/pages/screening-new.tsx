import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  Sun,
  Focus,
  Target,
  Info,
  ArrowRight,
  RefreshCw,
  Clipboard,
  Lock,
  Trash2,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import FocusModeLayout from '../components/FocusModeLayout';
import { toast } from 'react-toastify';
import { screeningApi } from '../api/screening.api';
import { agreeScreeningConsent } from '../api/consent.api';
import { UPLOAD_SCREENING_CONSENT_CONTENT } from '../constants/consent-content';
import { useTranslation } from 'react-i18next';

import { aiCoreClient } from '@/lib/axios';
import i18n from '@/i18n/i18n';

type ImageStatus = 'uploading' | 'validating' | 'ready' | 'warning' | 'error';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: ImageStatus;
  progress: number;
  quality?: 'high' | 'medium' | 'low';
  message?: string;
}

type Step = 'upload' | 'analysis' | 'review';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];

const inferEyeSideFromName = (
  name: string,
  index: number,
  total: number
): 'Left' | 'Right' | 'Both' => {
  const normalized = name.toLowerCase();
  if (total === 1) return 'Both';
  if (
    normalized.includes('left') ||
    normalized.includes('_os') ||
    normalized.includes('(os)')
  )
    return 'Left';
  if (
    normalized.includes('right') ||
    normalized.includes('_od') ||
    normalized.includes('(od)')
  )
    return 'Right';
  return index % 2 === 0 ? 'Right' : 'Left';
};

const isSupportedImage = (file: File): boolean => {
  const lowerName = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

const _STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload & Validate', number: 1 },
  { key: 'analysis', label: 'Analysis', number: 2 },
  { key: 'review', label: 'Review', number: 3 },
];

const tScreeningNew = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key as never, options as never) as unknown as string;

interface FundusValidationApiResponse {
  is_fundus: boolean;
  confidence: number;
  quality: 'high' | 'medium' | 'low';
  reason: string;
  warnings: string[];
  metrics: Record<string, number>;
}

async function analyzeImageQuality(file: File): Promise<{
  status: ImageStatus;
  quality?: 'high' | 'medium' | 'low';
  message?: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await aiCoreClient.post<FundusValidationApiResponse>(
      '/api/v1/diagnosis/validate-fundus',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      }
    );

    if (!data.is_fundus) {
      return {
        status: 'error',
        quality: 'low',
        message: tScreeningNew('PatientScreeningNew.validation.notFundus'),
      };
    }

    const warnings = data.warnings ?? [];
    if (warnings.includes('cropped_edges')) {
      return {
        status: 'warning',
        quality: 'low',
        message: tScreeningNew('PatientScreeningNew.validation.croppedEdges'),
      };
    }

    if (warnings.includes('blurry')) {
      return {
        status: 'warning',
        quality: 'low',
        message: tScreeningNew('PatientScreeningNew.validation.blurry'),
      };
    }

    if (warnings.includes('too_dark')) {
      return {
        status: 'warning',
        quality: 'low',
        message: tScreeningNew('PatientScreeningNew.validation.tooDark'),
      };
    }

    if (warnings.includes('overexposed')) {
      return {
        status: 'warning',
        quality: 'low',
        message: tScreeningNew('PatientScreeningNew.validation.overexposed'),
      };
    }

    return {
      status: 'ready',
      quality: data.quality === 'high' ? 'high' : 'medium',
      message:
        data.quality === 'high'
          ? tScreeningNew('PatientScreeningNew.validation.highQuality')
          : tScreeningNew('PatientScreeningNew.validation.acceptableQuality'),
    };
  } catch {
    return {
      status: 'error',
      quality: 'low',
      message: tScreeningNew(
        'PatientScreeningNew.validation.serviceUnavailable'
      ),
    };
  }
}

export default function ScreeningNewPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const navigate = useNavigate();
  const [_currentStep, _setCurrentStep] = useState<Step>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle paste from clipboard
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleFiles(imageFiles);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      if (
        dropZoneRef.current &&
        !dropZoneRef.current.contains(e.relatedTarget as Node)
      ) {
        setDragActive(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      isSupportedImage(file)
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => !isSupportedImage(file));
    if (invalidFiles.length > 0) {
      toast.error(
        t('PatientScreeningNew.toast.invalidFileType', {
          allowed: ALLOWED_EXTENSIONS.join(', '),
        })
      );
    }

    const validFiles = files.filter((file) => isSupportedImage(file));
    if (validFiles.length === 0) {
      return;
    }

    const newUniqueFiles = validFiles.filter((incomingFile) => {
      const isDuplicate = images.some(
        (existingImg) =>
          existingImg.file.name === incomingFile.name &&
          existingImg.file.size === incomingFile.size
      );

      return !isDuplicate;
    });

    if (newUniqueFiles.length === 0) {
      toast.warning(t('PatientScreeningNew.toast.duplicateImages'));
      return;
    }

    const newImages: UploadedImage[] = newUniqueFiles.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'validating' as ImageStatus,
      progress: 100,
    }));

    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((img) => {
      void validateUploadedImage(img.id, img.file);
    });
  };

  const validateUploadedImage = async (imageId: string, file: File) => {
    // Keep a smooth progress animation for better UX while validating.
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: 'uploading',
              progress: 18,
              message: t('PatientScreeningNew.processing.local'),
            }
          : img
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 120));

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: 'validating',
              progress: 30,
              message: t('PatientScreeningNew.processing.analyzingQuality'),
            }
          : img
      )
    );

    let animatedProgress = 30;
    const progressTimer = window.setInterval(() => {
      animatedProgress = Math.min(animatedProgress + 7, 92);
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, progress: animatedProgress } : img
        )
      );
    }, 70);

    const startedAt = performance.now();
    const qualityResult = await analyzeImageQuality(file);
    const elapsed = performance.now() - startedAt;
    if (elapsed < 350) {
      await new Promise((resolve) => setTimeout(resolve, 350 - elapsed));
    }

    window.clearInterval(progressTimer);

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: qualityResult.status,
              quality: qualityResult.quality,
              message: qualityResult.message,
              progress: 100,
            }
          : img
      )
    );
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }

      return prev.filter((img) => img.id !== imageId);
    });
  };

  const retryImage = (imageId: string) => {
    const retryTarget = images.find((img) => img.id === imageId);
    if (!retryTarget) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: 'validating',
              progress: 100,
              quality: undefined,
              message: undefined,
            }
          : img
      )
    );
    void validateUploadedImage(imageId, retryTarget.file);
  };

  const readyImages = images.filter((img) => img.status === 'ready');
  const canProceed = readyImages.length > 0;

  const startAnalysis = async () => {
    if (!canProceed || isPreparingSession) {
      return;
    }

    setIsPreparingSession(true);

    try {
      const files = readyImages.map((img) => img.file);
      const uploadResp = await screeningApi.uploadRetinalImages(files);
      const uploadedUrls = uploadResp.data?.uploadedUrls ?? [];

      if (uploadedUrls.length === 0) {
        throw new Error(t('PatientScreeningNew.errors.noUploadedUrl'));
      }

      const retinalImages = uploadedUrls.map((url, idx) => ({
        imageUrl: url,
        eyeSide: inferEyeSideFromName(
          readyImages[idx]?.file.name ?? '',
          idx,
          uploadedUrls.length
        ),
        deviceName: 'Retinal Camera',
      }));

      const sessionResp = await screeningApi.createSession({
        modelVersion: '1.0',
        retinalImages,
      });

      const createdScreeningId = sessionResp.data?.screeningId;
      if (!createdScreeningId) {
        throw new Error(t('PatientScreeningNew.errors.createSessionFailed'));
      }

      await agreeScreeningConsent(createdScreeningId, {
        content: UPLOAD_SCREENING_CONSENT_CONTENT,
      });

      navigate('/patient/analysis', {
        state: {
          screeningId: createdScreeningId,
          images: readyImages.map((img) => ({
            id: img.id,
            name: img.file.name,
            preview: img.preview,
            quality: img.quality,
          })),
          source: 'new-screening',
          consentAccepted: true,
        },
      });
    } catch (error) {
      console.error('Failed to prepare consented screening session:', error);
      toast.error(t('PatientScreeningNew.errors.startAnalysisFailed'));
    } finally {
      setIsPreparingSession(false);
    }
  };

  const getStatusBadge = (img: UploadedImage) => {
    switch (img.status) {
      case 'uploading':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Spinner size={12} />
            {t('PatientScreeningNew.status.uploading')}
          </span>
        );
      case 'validating':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <Spinner size={12} />
            {t('PatientScreeningNew.status.analyzing')}
          </span>
        );
      case 'ready':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            {img.quality === 'high'
              ? t('PatientScreeningNew.status.highQuality')
              : t('PatientScreeningNew.status.ready')}
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            {t('PatientScreeningNew.status.qualityWarning')}
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <X className="w-3 h-3" />
            {t('PatientScreeningNew.status.notFundus')}
          </span>
        );
    }
  };

  return (
    <FocusModeLayout
      currentStep="upload"
      title={t('PatientScreeningNew.page.title')}
      exitPath="/patient/screening"
      showBreadcrumb={false}
    >
      <div className="flex-1 flex flex-col p-6 lg:p-10">
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar - Quality Standards (Smaller) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {t('PatientScreeningNew.page.uploadTitle')}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {t('PatientScreeningNew.page.uploadSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">
                {t('PatientScreeningNew.qualityStandards.title')}
              </h3>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('PatientScreeningNew.qualityStandards.evenLighting')}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {t(
                      'PatientScreeningNew.qualityStandards.evenLightingDescription'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Focus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('PatientScreeningNew.qualityStandards.sharpFocus')}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {t(
                      'PatientScreeningNew.qualityStandards.sharpFocusDescription'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {t(
                      'PatientScreeningNew.qualityStandards.centeredOpticDisc'
                    )}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {t(
                      'PatientScreeningNew.qualityStandards.centeredOpticDiscDescription'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-brand-soft border border-brand/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand">
                    {t('PatientScreeningNew.supportedFormats.title')}
                  </p>
                  <p className="text-xs text-brand/70">
                    {t('PatientScreeningNew.supportedFormats.value')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Upload Area (Larger) */}
          <div className="lg:col-span-9">
            <div className="medical-card flex flex-col h-full">
              {/* Upload Zone */}
              <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <div
                  ref={dropZoneRef}
                  className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all py-10 px-6 cursor-pointer ${
                    dragActive
                      ? 'border-brand bg-brand/10 scale-[1.01]'
                      : 'border-brand/30 hover:border-brand hover:bg-brand/5'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-[var(--bg-primary)] shadow-md flex items-center justify-center text-brand transition-transform ${
                      dragActive ? 'scale-110' : ''
                    }`}
                  >
                    <Upload
                      className={`w-7 h-7 ${dragActive ? 'animate-bounce' : ''}`}
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {dragActive
                        ? t('PatientScreeningNew.dropzone.dropHere')
                        : t('PatientScreeningNew.dropzone.dragAndDrop')}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {t('PatientScreeningNew.dropzone.or')}{' '}
                      <span className="text-brand font-medium hover:underline">
                        {t('PatientScreeningNew.dropzone.browseFiles')}
                      </span>{' '}
                      {t('PatientScreeningNew.dropzone.fromComputer')}
                    </p>
                  </div>

                  {/* Paste hint */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <Clipboard className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      {t('PatientScreeningNew.dropzone.pasteHintPrefix')}{' '}
                      <span className="text-brand font-medium">Ctrl+V</span>{' '}
                      {t('PatientScreeningNew.dropzone.pasteHintSuffix')}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.bmp,.tiff"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Validation Queue */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('PatientScreeningNew.queue.title', {
                      count: images.length,
                    })}
                  </h3>
                  <div className="flex items-center gap-3">
                    {images.some(
                      (img) =>
                        img.status === 'uploading' ||
                        img.status === 'validating'
                    ) ? (
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {t('PatientScreeningNew.processing.local')}
                      </span>
                    ) : (
                      images.length > 0 && (
                        <button
                          onClick={() => {
                            images.forEach((image) => {
                              if (image.preview.startsWith('blob:')) {
                                URL.revokeObjectURL(image.preview);
                              }
                            });
                            setImages([]);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t('PatientScreeningNew.actions.clearAll')}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <p className="text-sm">
                      {t('PatientScreeningNew.queue.empty')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                          img.status === 'warning'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : img.status === 'error'
                              ? 'border-red-500/30 bg-red-500/5'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] shrink-0">
                          <img
                            src={img.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-primary)] font-medium truncate text-sm">
                            {img.file.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {(img.file.size / 1024 / 1024).toFixed(2)} MB
                            {img.message && img.status === 'ready' && (
                              <span className="text-green-400 ml-2">
                                • {img.message}
                              </span>
                            )}
                          </p>

                          {/* Progress Bar */}
                          {(img.status === 'uploading' ||
                            img.status === 'validating') && (
                            <div className="mt-2 w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  img.status === 'validating'
                                    ? 'bg-amber-400'
                                    : 'bg-brand'
                                }`}
                                style={{
                                  width:
                                    img.status === 'validating'
                                      ? '100%'
                                      : `${img.progress}%`,
                                }}
                              />
                            </div>
                          )}

                          {/* Warning / Error message */}
                          {(img.status === 'warning' ||
                            img.status === 'error') &&
                            img.message && (
                              <p
                                className={`text-xs mt-1 ${
                                  img.status === 'error'
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                }`}
                              >
                                {img.message}
                              </p>
                            )}
                        </div>

                        {/* Status Badge */}
                        {getStatusBadge(img)}

                        {/* Actions */}
                        {img.status === 'warning' || img.status === 'error' ? (
                          <button
                            onClick={() => retryImage(img.id)}
                            className="p-2 text-[var(--text-muted)] hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title={t('PatientScreeningNew.actions.retry')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => removeImage(img.id)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title={t('PatientScreeningNew.actions.remove')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="bg-[var(--bg-secondary)]/50 px-6 py-4 flex items-end justify-end border-t border-[var(--border-color)] mt-auto">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--text-muted)] hidden sm:block font-medium">
                    {t('PatientScreeningNew.queue.readyToSubmit', {
                      count: readyImages.length,
                    })}
                  </span>
                  <button
                    disabled={!canProceed || isPreparingSession}
                    onClick={() => setShowPolicyPopup(true)}
                    className="px-6 py-2.5 rounded-lg bg-brand hover:brightness-110 text-white text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand"
                  >
                    <>
                      {t('PatientScreeningNew.actions.startAnalysis')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HIPAA Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            {t('PatientScreeningNew.footer.hipaa')}
          </p>
        </footer>

        {showPolicyPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                {t('PatientScreeningNew.consent.title')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                {UPLOAD_SCREENING_CONSENT_CONTENT}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPolicyPopup(false)}
                  disabled={isPreparingSession}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                >
                  {t('PatientScreeningNew.actions.cancel')}
                </button>
                <button
                  type="button"
                  disabled={isPreparingSession}
                  onClick={async () => {
                    await startAnalysis();
                  }}
                  className="px-4 py-2 rounded-lg bg-brand text-white font-semibold hover:brightness-110"
                >
                  {isPreparingSession ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size={14} />
                      {t('PatientScreeningNew.actions.saving')}
                    </span>
                  ) : (
                    t('PatientScreeningNew.actions.agreeAndContinue')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FocusModeLayout>
  );
}
