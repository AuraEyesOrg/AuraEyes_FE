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
import { aiCoreClient } from '../../../lib/axios';

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

const isSupportedImage = (file: File): boolean => {
  const lowerName = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

const _STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload & Validate', number: 1 },
  { key: 'analysis', label: 'Analysis', number: 2 },
  { key: 'review', label: 'Review', number: 3 },
];

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
      '/diagnosis/validate-fundus',
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
        message:
          'This does not look like a retinal fundus image. Please upload a valid fundus photo only.',
      };
    }

    const warnings = data.warnings ?? [];
    if (warnings.includes('cropped_edges')) {
      return {
        status: 'warning',
        quality: 'low',
        message:
          'Retina appears cropped at the edge. Please recapture with better centering.',
      };
    }

    if (warnings.includes('blurry')) {
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image appears blurry for reliable analysis. Please retake.',
      };
    }

    if (warnings.includes('too_dark')) {
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image is too dark. Please retake with better lighting.',
      };
    }

    if (warnings.includes('overexposed')) {
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image is overexposed. Please reduce brightness and retake.',
      };
    }

    return {
      status: 'ready',
      quality: data.quality === 'high' ? 'high' : 'medium',
      message:
        data.quality === 'high' ? 'High quality image' : 'Acceptable quality',
    };
  } catch {
    return {
      status: 'error',
      quality: 'low',
      message:
        'Fundus validation service is unavailable. Please try again in a moment.',
    };
  }
}

export default function ScreeningNewPage() {
  const navigate = useNavigate();
  const [_currentStep, _setCurrentStep] = useState<Step>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);
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
        `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
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
      toast.warning('These images have already been uploaded!');
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
              message: 'Processing...',
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
              message: 'Analyzing image quality...',
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

  const startAnalysis = () => {
    navigate('/patient/analysis', {
      state: {
        images: readyImages.map((img) => ({
          id: img.id,
          name: img.file.name,
          preview: img.preview,
          quality: img.quality,
        })),
        source: 'new-screening',
      },
    });
  };

  const getStatusBadge = (img: UploadedImage) => {
    switch (img.status) {
      case 'uploading':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Spinner size={12} />
            Uploading...
          </span>
        );
      case 'validating':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <Spinner size={12} />
            Analysing...
          </span>
        );
      case 'ready':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            {img.quality === 'high' ? 'High Quality' : 'Ready'}
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            Quality Warning
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <X className="w-3 h-3" />
            Not Fundus
          </span>
        );
    }
  };

  return (
    <FocusModeLayout
      currentStep="upload"
      title="New Screening"
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
                Upload Retinal Images
              </h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                High-resolution fundus photography for AI analysis. Quality
                validated in real-time.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">
                Quality Standards
              </h3>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Even Lighting
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Avoid dark spots or overexposure.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Focus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Sharp Focus
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Ensure vascular details are crisp.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-l-brand">
                <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Centered Optic Disc
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Retina should be centered in frame.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-brand-soft border border-brand/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand">
                    Supported Formats
                  </p>
                  <p className="text-xs text-brand/70">
                    DICOM, JPG, PNG (Max 10MB)
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
                        ? 'Drop images here'
                        : 'Drag & Drop fundus images here'}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      or{' '}
                      <span className="text-brand font-medium hover:underline">
                        browse files
                      </span>{' '}
                      from your computer
                    </p>
                  </div>

                  {/* Paste hint */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <Clipboard className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      <span className="text-brand font-medium">Ctrl+V</span> to
                      paste from clipboard
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
                    Validation Queue ({images.length})
                  </h3>
                  <div className="flex items-center gap-3">
                    {images.some(
                      (img) =>
                        img.status === 'uploading' ||
                        img.status === 'validating'
                    ) ? (
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        Processing locally...
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
                          Clear All
                        </button>
                      )
                    )}
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <p className="text-sm">
                      No images uploaded yet. Drag & drop or click to upload.
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
                            title="Retry"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => removeImage(img.id)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove"
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
                    {readyImages.length} file
                    {readyImages.length !== 1 ? 's' : ''} ready to submit
                  </span>
                  <button
                    disabled={!canProceed}
                    onClick={() => setShowPolicyPopup(true)}
                    className="px-6 py-2.5 rounded-lg bg-brand hover:brightness-110 text-white text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand"
                  >
                    <>
                      Start AI Analysis
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
            Your data is encrypted and HIPAA compliant. Uploaded images are used
            solely for your diagnostic session.
          </p>
        </footer>

        {showPolicyPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                Data Sharing Consent
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                By continuing, you agree that your retinal images and AI
                analysis results can be processed and securely stored for
                diagnosis, medical review, and improving service quality.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPolicyPopup(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPolicyPopup(false);
                    startAnalysis();
                  }}
                  className="px-4 py-2 rounded-lg bg-brand text-white font-semibold hover:brightness-110"
                >
                  I Agree, Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FocusModeLayout>
  );
}
