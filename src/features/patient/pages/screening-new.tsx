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

const _STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload & Validate', number: 1 },
  { key: 'analysis', label: 'Analysis', number: 2 },
  { key: 'review', label: 'Review', number: 3 },
];

export default function ScreeningNewPage() {
  const navigate = useNavigate();
  const [_currentStep, _setCurrentStep] = useState<Step>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
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

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/') || file.name.endsWith('.dcm')
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as ImageStatus,
      progress: 0,
    }));

    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((img) => {
      simulateUploadAndValidation(img.id);
    });
  };

  const simulateUploadAndValidation = (imageId: string) => {
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: 'validating', progress: 100 }
              : img
          )
        );

        // Simulate validation
        setTimeout(() => {
          const random = Math.random();
          let status: ImageStatus;
          let quality: 'high' | 'medium' | 'low' | undefined;
          let message: string | undefined;

          if (random > 0.7) {
            status = 'warning';
            quality = 'low';
            message =
              'Image is too blurry for accurate AI analysis. Please retake.';
          } else if (random > 0.3) {
            status = 'ready';
            quality = 'high';
            message = 'Ready for analysis';
          } else {
            status = 'ready';
            quality = 'medium';
            message = 'Acceptable quality';
          }

          setImages((prev) =>
            prev.map((img) =>
              img.id === imageId ? { ...img, status, quality, message } : img
            )
          );
        }, 1500);
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, progress: Math.min(progress, 99) }
              : img
          )
        );
      }
    }, 150);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const retryImage = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: 'uploading',
              progress: 0,
              quality: undefined,
              message: undefined,
            }
          : img
      )
    );
    simulateUploadAndValidation(imageId);
  };

  const readyImages = images.filter((img) => img.status === 'ready');
  const canProceed = readyImages.length > 0;

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
            Blur Detected
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <X className="w-3 h-3" />
            Failed
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
                    accept="image/jpeg,image/png,application/dicom,.dcm"
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
                          onClick={() => setImages([])}
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

                          {/* Warning message */}
                          {img.status === 'warning' && img.message && (
                            <p className="text-xs text-amber-400 mt-1">
                              {img.message}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        {getStatusBadge(img)}

                        {/* Actions */}
                        {img.status === 'warning' ? (
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
                    onClick={() => {
                      // Navigate to AI Analysis page with ready images
                      // In a real app, you'd send these to the backend first
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
                    }}
                    className="px-6 py-2.5 rounded-lg bg-brand hover:brightness-110 text-white text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand"
                  >
                    Start AI Analysis
                    <ArrowRight className="w-4 h-4" />
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
      </div>
    </FocusModeLayout>
  );
}
