import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { clinicScreeningApi } from '../api/screening.api';
import {
  analyzeImageQuality,
  type UploadedImage,
} from '@/features/organisation/utils/screening.util';
import { getClinicPatients, type ClinicPatientDto } from '../api/patients.api';
import AvatarFallback from '@/components/ui/avatar-fallback';
import { unwrapApiData } from '@/types/api-response';

type ScreeningStep = 'upload-images' | 'launch-ai';

export default function ClinicStaffScreeningNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t: i18nT } = useTranslation();
  const t = (key: string, defaultValue?: string) =>
    i18nT(key as never, { defaultValue } as never) as unknown as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] =
    useState<ScreeningStep>('upload-images');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<ClinicPatientDto | null>(null);

  const { data: patients = [] } = useQuery({
    queryKey: ['clinic-staff', 'patients'],
    queryFn: getClinicPatients,
  });

  const preSelectedPatientId = searchParams.get('patientId');
  const preSelectedVisitId = searchParams.get('visitId');

  useEffect(() => {
    if (!preSelectedPatientId || !preSelectedVisitId) {
      toast.error(
        t(
          'ClinicStaff.screeningNew.toast.missingVisit',
          'A clinic visit (check-in) is required to start screening.'
        ),
        { toastId: 'missing-visit' }
      );
      navigate(resolvePathWithLocale('/clinic-staff/screenings'));
      return;
    }
    if (patients.length > 0 && !selectedPatient) {
      const match = patients.find((p) => p.id === preSelectedPatientId);
      if (match) setSelectedPatient(match);
    }
  }, [
    preSelectedPatientId,
    preSelectedVisitId,
    patients,
    selectedPatient,
    navigate,
    t,
  ]);

  // Image handlers
  const validateImage = async (imageId: string, file: File) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, status: 'validating', progress: 30 }
          : img
      )
    );
    let animatedProgress = 30;
    const timer = window.setInterval(() => {
      animatedProgress = Math.min(animatedProgress + 7, 92);
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, progress: animatedProgress } : img
        )
      );
    }, 100);
    const result = await analyzeImageQuality(file, (key, fallback) =>
      t(key, fallback)
    );
    window.clearInterval(timer);
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              status: result.status,
              quality: result.quality,
              message: result.message,
              progress: 100,
            }
          : img
      )
    );
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newImgs: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImgs.push({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        eyeSide: 'Both',
        status: 'validating',
        progress: 0,
      });
    }
    setImages((prev) => [...prev, ...newImgs]);
    newImgs.forEach((img) => {
      void validateImage(img.id, img.file);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles]
  );

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target?.preview.startsWith('blob:'))
        URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const readyImages = images.filter(
    (img) => img.status === 'ready' || img.status === 'warning'
  );
  const canProceed =
    !!selectedPatient && !!preSelectedVisitId && readyImages.length > 0;

  const handleLaunchScreening = async () => {
    if (!selectedPatient || !preSelectedVisitId || readyImages.length === 0)
      return;
    try {
      setIsCreating(true);
      setIsUploading(true);
      const uploadResponse = await clinicScreeningApi.uploadImages(
        readyImages.map((img) => img.file)
      );
      const uploadData = unwrapApiData<{
        uploadedUrls: string[];
        count: number;
      }>(uploadResponse);
      setIsUploading(false);

      const retinalImages = (uploadData?.uploadedUrls ?? []).map((url, i) => ({
        imageUrl: url,
        eyeSide: readyImages[i]?.eyeSide ?? ('Both' as const),
      }));

      const sessionResponse = await clinicScreeningApi.createSession({
        patientId: selectedPatient.id,
        patientVisitId: preSelectedVisitId,
        retinalImages,
      });
      // BE trả data là string UUID trực tiếp (không phải object { screeningId })
      const rawSessionData = unwrapApiData<string | { screeningId: string }>(
        sessionResponse
      );
      const screeningId =
        typeof rawSessionData === 'string'
          ? rawSessionData
          : rawSessionData?.screeningId;

      if (!screeningId) {
        throw new Error(
          t(
            'ClinicStaff.screeningNew.errors.createFailed',
            'Failed to create screening session.'
          )
        );
      }

      navigate(
        resolvePathWithLocale(
          `/clinic-staff/screenings/result?id=${screeningId}`
        ),
        {
          state: {
            patientName: selectedPatient.name,
            autoAnalyze: true,
            skipQuotaDeduction: true,
          },
        }
      );
    } catch (err) {
      console.error('Screening creation failed:', err);
      toast.error(
        t(
          'ClinicStaff.screeningNew.errors.createFailed',
          'Failed to create screening session.'
        )
      );
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const goBack = () => {
    if (currentStep === 'upload-images') {
      navigate(resolvePathWithLocale('/clinic-staff/screenings'));
    } else {
      setCurrentStep('upload-images');
    }
  };

  return (
    <ClinicStaffLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-(--border-primary) pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              {t(
                'ClinicStaff.screeningNew.page.title',
                'New Retinal Screening'
              )}
            </h1>
            <p className="text-sm text-(--text-secondary)">
              {t(
                'ClinicStaff.screeningNew.page.subtitle',
                'Upload retinal scan images for AI diagnostic triage.'
              )}
            </p>
          </div>
          {selectedPatient && (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-(--bg-secondary) border border-(--border-primary) shadow-sm shrink-0 min-w-[280px]">
              <AvatarFallback
                fullName={selectedPatient.name}
                avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(selectedPatient.id.slice(0, 8))}`}
                size="w-10 h-10 rounded-md"
                className="shrink-0"
              />
              <div className="pr-2">
                <p className="text-sm font-semibold text-(--text-primary)">
                  {selectedPatient.name}
                </p>
                <p className="text-xs text-(--text-secondary) mt-0.5">
                  {selectedPatient.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                  {selectedPatient.age} yrs
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${currentStep === 'upload-images' ? 'bg-primary text-white' : 'bg-(--bg-secondary) text-(--text-secondary) border border-(--border-primary)'}`}
          >
            1. {t('ClinicStaff.screeningNew.steps.upload', 'Upload Images')}
          </div>
          <div className="w-8 h-px bg-(--border-primary)" />
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${currentStep === 'launch-ai' ? 'bg-primary text-white' : 'bg-(--bg-secondary) text-(--text-secondary) border border-(--border-primary)'}`}
          >
            2. {t('ClinicStaff.screeningNew.steps.launch', 'Launch AI')}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6 overflow-y-auto">
          {/* Step 1: Upload */}
          {currentStep === 'upload-images' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: quality tips */}
                <div className="lg:w-64 flex-shrink-0 space-y-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-(--text-muted) mb-2">
                    {t(
                      'ClinicStaff.screeningNew.quality.title',
                      'Image Quality Standards'
                    )}
                  </h3>
                  {[
                    {
                      Icon: Sun,
                      label: t(
                        'ClinicStaff.screeningNew.quality.lighting',
                        'Even Lighting'
                      ),
                      desc: t(
                        'ClinicStaff.screeningNew.quality.lightingDesc',
                        'Avoid glare and uneven illumination'
                      ),
                    },
                    {
                      Icon: Focus,
                      label: t(
                        'ClinicStaff.screeningNew.quality.focus',
                        'Sharp Focus'
                      ),
                      desc: t(
                        'ClinicStaff.screeningNew.quality.focusDesc',
                        'Image should be clear and not blurry'
                      ),
                    },
                    {
                      Icon: Target,
                      label: t(
                        'ClinicStaff.screeningNew.quality.centered',
                        'Centered Optic Disc'
                      ),
                      desc: t(
                        'ClinicStaff.screeningNew.quality.centeredDesc',
                        'Optic disc should be visible and centered'
                      ),
                    },
                  ].map(({ Icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex gap-2 p-3 rounded-lg bg-(--bg-primary) border-l-4 border-l-brand"
                    >
                      <div className="text-brand p-1.5 bg-brand/10 rounded-lg h-fit">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-(--text-primary)">
                          {label}
                        </h4>
                        <p className="text-xs text-(--text-secondary) mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-brand-soft border border-brand/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-brand">
                          {t(
                            'ClinicStaff.screeningNew.quality.supportedFormats',
                            'Supported Formats'
                          )}
                        </p>
                        <p className="text-xs text-brand/70">
                          {t(
                            'ClinicStaff.screeningNew.quality.supportedFormatsList',
                            'JPG, PNG, TIFF, BMP'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: drop zone + list */}
                <div className="flex-1 space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all py-10 px-6 cursor-pointer ${isDragActive ? 'border-brand bg-brand/10 scale-[1.01]' : 'border-brand/30 hover:border-brand hover:bg-brand/5'}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full bg-(--bg-primary) shadow-md flex items-center justify-center text-brand transition-transform ${isDragActive ? 'scale-110' : ''}`}
                    >
                      <Upload
                        className={`w-7 h-7 ${isDragActive ? 'animate-bounce' : ''}`}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-lg font-bold text-(--text-primary)">
                        {isDragActive
                          ? t(
                              'ClinicStaff.screeningNew.dropzone.dropHere',
                              'Drop files here'
                            )
                          : t(
                              'ClinicStaff.screeningNew.dropzone.dragDrop',
                              'Drag & drop retinal images'
                            )}
                      </p>
                      <p className="text-sm text-(--text-secondary)">
                        {t('ClinicStaff.screeningNew.dropzone.or', 'or')}{' '}
                        <span className="text-brand font-medium hover:underline">
                          {t(
                            'ClinicStaff.screeningNew.dropzone.browse',
                            'browse files'
                          )}
                        </span>
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Image queue */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-(--text-primary)">
                        {t(
                          'ClinicStaff.screeningNew.queue.title',
                          'Uploaded Images'
                        )}{' '}
                        ({images.length})
                      </h3>
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${img.status === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : img.status === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-(--border-primary) bg-(--bg-primary)'}`}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-(--bg-secondary) shrink-0 relative">
                            <img
                              src={img.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            {(img.status === 'validating' ||
                              img.status === 'uploading') && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-(--text-primary) truncate">
                              {img.file.name}
                            </p>
                            <p className="text-xs text-(--text-muted)">
                              {(img.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {img.message && (
                              <p
                                className={`text-xs mt-0.5 ${img.status === 'error' ? 'text-red-400' : img.status === 'warning' ? 'text-amber-400' : 'text-green-400'}`}
                              >
                                {img.message}
                              </p>
                            )}
                            {(img.status === 'validating' ||
                              img.status === 'uploading') && (
                              <div className="mt-1.5 w-full h-1.5 bg-(--bg-secondary) rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-amber-400 animate-pulse"
                                  style={{ width: `${img.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {/* Status badge */}
                          {img.status === 'ready' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Ready
                            </span>
                          )}
                          {img.status === 'warning' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                              <AlertCircle className="w-3 h-3" />
                              Warning
                            </span>
                          )}
                          {img.status === 'error' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                              <X className="w-3 h-3" />
                              Invalid
                            </span>
                          )}
                          {/* Retry / Remove */}
                          {img.status === 'error' ||
                          img.status === 'warning' ? (
                            <button
                              onClick={() => {
                                void validateImage(img.id, img.file);
                              }}
                              className="p-2 text-(--text-muted) hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                              title="Retry"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => removeImage(img.id)}
                              className="p-2 text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
              </div>
            </div>
          )}

          {/* Step 2: Confirm & Launch */}
          {currentStep === 'launch-ai' && (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              <div className="text-center border-b border-(--border-primary) pb-6">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-(--text-primary)">
                  {t(
                    'ClinicStaff.screeningNew.launch.title',
                    'Launch AI Diagnostic Model'
                  )}
                </h2>
                <p className="text-sm text-(--text-secondary) mt-2">
                  {i18nT('ClinicStaff.screeningNew.launch.readyCount', {
                    count: readyImages.length,
                    defaultValue: `Ready to analyse ${readyImages.length} scan(s). This will consume 1 AI screening credit.`,
                  })}
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
                    {t(
                      'ClinicStaff.screeningNew.launch.advisory.title',
                      'Clinical Advisory'
                    )}
                  </p>
                  <p className="text-sm text-amber-800/80 dark:text-amber-400/80 mt-1">
                    {t(
                      'ClinicStaff.screeningNew.launch.advisory.description',
                      'AI triage results provide preliminary probabilities. They are not intended to replace formal diagnosis by a clinical specialist.'
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {readyImages.filter((img) => img.status === 'ready').length >
                  0 && (
                  <div>
                    <h3 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 uppercase tracking-wider">
                      {t(
                        'ClinicStaff.screeningNew.launch.scansIncluded',
                        'Optimal Scans'
                      )}
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      {readyImages
                        .filter((img) => img.status === 'ready')
                        .map((img) => (
                          <div
                            key={img.id}
                            className="w-20 h-20 rounded-lg overflow-hidden border border-green-200 dark:border-green-900/30 bg-green-50/50"
                          >
                            <img
                              src={img.preview}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {readyImages.filter((img) => img.status === 'warning').length >
                  0 && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">
                      {t(
                        'ClinicStaff.screeningNew.launch.scansWarning',
                        'Scans with Warnings'
                      )}
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      {readyImages
                        .filter((img) => img.status === 'warning')
                        .map((img) => (
                          <div
                            key={img.id}
                            className="w-20 h-20 rounded-lg overflow-hidden border border-amber-200 dark:border-amber-900/30 bg-amber-50/50"
                          >
                            <img
                              src={img.preview}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-(--border-primary)">
          <button
            type="button"
            onClick={goBack}
            disabled={isCreating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) border border-(--border-primary) transition disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 'upload-images'
              ? t('ClinicStaff.screeningNew.actions.cancel', 'Cancel')
              : t('ClinicStaff.screeningNew.actions.back', 'Back')}
          </button>

          {currentStep === 'upload-images' ? (
            <button
              type="button"
              onClick={() => setCurrentStep('launch-ai')}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {t(
                'ClinicStaff.screeningNew.actions.proceed',
                'Proceed to Review'
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void handleLaunchScreening();
              }}
              disabled={!canProceed || isCreating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading
                    ? t(
                        'ClinicStaff.screeningNew.actions.uploading',
                        'Uploading...'
                      )
                    : t(
                        'ClinicStaff.screeningNew.actions.analyzing',
                        'Launching AI...'
                      )}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t(
                    'ClinicStaff.screeningNew.actions.launch',
                    'Start AI Analysis'
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </ClinicStaffLayout>
  );
}
