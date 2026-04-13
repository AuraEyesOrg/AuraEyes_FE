import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ScanEye,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import {
  OrganisationScreeningStepper,
  type ScreeningFlowStep,
} from '../components/OrganisationScreeningStepper';
import AvatarFallback from '@/components/ui/avatar-fallback';
import { getOrganisationRecentPatients } from '../api/patients.api';
import type { OrganisationRecentPatientDto } from '../api/patients.api';
import { orgScreeningApi } from '../api/screening.api';
import { orgBillingApi } from '../api/billing.api';
import { unwrapApiData } from '@/types/api-response';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { UploadedImage, analyzeImageQuality } from '../utils/screening.util';

type ScreeningCreationStep = Extract<
  ScreeningFlowStep,
  'upload-images' | 'launch-ai'
>;

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function OrganisationScreeningPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard state
  const [currentStep, setCurrentStep] =
    useState<ScreeningCreationStep>('upload-images');
  const [selectedPatient, setSelectedPatient] =
    useState<OrganisationRecentPatientDto | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
  });

  const { data: billingSummary } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const remainingQuota = billingSummary?.remainingQuota ?? 0;

  const preSelectedPatientId = searchParams.get('patientId');
  useEffect(() => {
    if (!preSelectedPatientId) {
      toast.error('No patient selected', { toastId: 'no-patient' });
      navigate(resolvePathWithLocale('/organisation/patients'));
      return;
    }
    if (patients.length > 0 && !selectedPatient) {
      const match = patients.find((p) => p.id === preSelectedPatientId);
      if (match) {
        setSelectedPatient(match);
      }
    }
  }, [preSelectedPatientId, patients, selectedPatient, navigate]);

  // ── Step Navigation ──
  const goNext = () => {
    setCurrentStep('launch-ai');
  };
  const goBack = () => {
    if (currentStep === 'upload-images') {
      navigate(resolvePathWithLocale('/organisation/patients'));
    } else {
      setCurrentStep('upload-images');
    }
  };

  // ── Image Handling ──
  const validateUploadedImage = async (imageId: string, file: File) => {
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
    }, 100);

    const qualityResult = await analyzeImageQuality(file);

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

  const processFiles = useCallback((files: FileList | File[]) => {
    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImages.push({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        eyeSide: i % 2 === 0 ? 'Left' : 'Right',
        status: 'validating',
        progress: 0,
      });
    }
    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((img) => {
      void validateUploadedImage(img.id, img.file);
    });
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles]
  );

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const updateEyeSide = (imageId: string, side: 'Left' | 'Right' | 'Both') => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, eyeSide: side } : img))
    );
  };

  // ── Launch Screening ──
  const handleLaunchScreening = async () => {
    const validImages = images.filter(
      (img) => img.status === 'ready' || img.status === 'warning'
    );
    if (!selectedPatient || validImages.length === 0) return;

    if (remainingQuota <= 0) {
      toast.error('Your organisation has no remaining quota. Please top up.');
      navigate('/organisation/wallet');
      return;
    }

    try {
      setIsCreating(true);

      // Step 1: Upload images to storage
      setIsUploading(true);
      const uploadResponse = await orgScreeningApi.uploadImages(
        validImages.map((img) => img.file)
      );
      const uploadData = unwrapApiData<{
        uploadedUrls: string[];
        count: number;
      }>(uploadResponse);
      setIsUploading(false);

      // Step 2: Create screening session
      const retinalImages = (uploadData?.uploadedUrls ?? []).map((url, i) => ({
        imageUrl: url,
        eyeSide: validImages[i]?.eyeSide ?? ('Both' as const),
      }));

      const sessionResponse = await orgScreeningApi.createSession({
        patientId: selectedPatient.id,
        retinalImages,
      });

      const sessionData = unwrapApiData<{ screeningId: string }>(
        sessionResponse
      );

      if (sessionData?.screeningId) {
        navigate(
          resolvePathWithLocale(
            `/organisation/screening/result?id=${sessionData.screeningId}`
          ),
          {
            state: {
              patientName: selectedPatient.name,
            },
          }
        );
      }
    } catch (err) {
      console.error('Screening creation failed:', err);
      let errorMessage =
        'Failed to create screening session. Please try again.';
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as any;
        if (data.message) {
          errorMessage = data.message;
        } else if (
          Array.isArray(data.errors) &&
          data.errors.length > 0 &&
          data.errors[0]?.error
        ) {
          errorMessage = data.errors.map((e: any) => e.error).join(', ');
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  // ── Can proceed checks ──
  const readyImages = images.filter(
    (img) => img.status === 'ready' || img.status === 'warning'
  );
  const canProceed = !!selectedPatient && readyImages.length > 0;

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader pageName="Screening" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-[1280px] mx-auto w-full relative z-10">
            {/* Header: Clinical Layout */}
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ScanEye className="w-5 h-5 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white">
                    AI Retinal Screening
                  </h1>
                </div>
                <p className="text-sm text-slate-500 max-w-[60ch]">
                  Upload high-resolution DICOM or Fundus images for diagnostic
                  AI triage. Ensure image clarity before proceeding to the
                  algorithm.
                </p>
              </div>
              <div className="ml-auto rounded-xl border border-(--border-primary) bg-(--bg-secondary) px-3 py-2 text-right">
                <p className="text-xs text-(--text-tertiary)">
                  Remaining quota
                </p>
                <p className="text-lg font-bold text-(--text-primary)">
                  {remainingQuota}
                </p>
              </div>

              {/* Context: Selected Patient */}
              {selectedPatient && (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0 min-w-[280px]">
                  <AvatarFallback
                    fullName={selectedPatient.name}
                    avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(selectedPatient.id.slice(0, 8))}`}
                    size="w-10 h-10 rounded-md"
                    className="shrink-0"
                  />
                  <div className="pr-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedPatient.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                      {selectedPatient.age} yrs · ID:{' '}
                      {selectedPatient.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <OrganisationScreeningStepper
              activeStep={currentStep}
              className="mb-8"
            />

            {/* Content Area - Professional Clinical Container */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-10">
              {/* Step 1: Upload */}
              {currentStep === 'upload-images' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Image Acquisition
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Select or drag retinal scan files for processing.
                      </p>

                      {/* Drop Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`group relative overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 p-8 text-center flex flex-col items-center justify-center min-h-[250px] ${
                          isDragActive
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-slate-300 hover:border-primary bg-slate-50 hover:bg-primary/5'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-base font-medium text-slate-800 mb-1">
                          Drag files or click to browse
                        </p>
                        <p className="text-xs text-slate-500">
                          Supported formats: JPG, PNG, TIFF (Max 50MB per file)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </div>
                    </div>

                    {/* Uploaded Images Preview Side */}
                    {images.length > 0 && (
                      <div className="w-full lg:w-96 flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h3 className="text-sm font-semibold text-slate-700">
                            Scan Inventory
                          </h3>
                          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {images.length} files
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                          {images.map((img) => (
                            <div
                              key={img.id}
                              className={`group relative rounded-lg border bg-white p-2.5 flex gap-3 transition-all shadow-sm ${
                                img.status === 'warning'
                                  ? 'border-amber-300 bg-amber-50/50'
                                  : img.status === 'error'
                                    ? 'border-red-300 bg-red-50/50'
                                    : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative">
                                <img
                                  src={img.preview}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                {img.status === 'validating' && (
                                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 py-0.5 pr-6 min-w-0 flex flex-col justify-between">
                                <div>
                                  <p
                                    className="text-xs font-medium text-slate-800 truncate"
                                    title={img.file.name}
                                  >
                                    {img.file.name}
                                  </p>
                                  {img.message && (
                                    <p
                                      className={`text-[10px] mt-0.5 font-medium ${
                                        img.status === 'error'
                                          ? 'text-red-600'
                                          : img.status === 'warning'
                                            ? 'text-amber-600'
                                            : 'text-green-600'
                                      }`}
                                    >
                                      {img.message}
                                    </p>
                                  )}
                                </div>
                                <select
                                  disabled={img.status === 'validating'}
                                  value={img.eyeSide}
                                  onChange={(e) =>
                                    updateEyeSide(img.id, e.target.value as any)
                                  }
                                  className="w-full text-xs py-1 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-1 disabled:opacity-50"
                                >
                                  <option value="Left">Left Eye (OS)</option>
                                  <option value="Right">Right Eye (OD)</option>
                                  <option value="Both">Both / Unknown</option>
                                </select>
                              </div>
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute top-2 right-2 w-6 h-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Confirm */}
              {currentStep === 'launch-ai' && (
                <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
                  <div className="text-center mb-8 border-b border-slate-100 pb-8">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-800">
                      Launch Diagnostic Model
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">
                      System is ready to process {readyImages.length} scan
                      {readyImages.length > 1 ? 's' : ''}. This will consume 1
                      AI screening credit.
                    </p>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 text-sm">
                        Clinical Advisory
                      </h4>
                      <p className="text-sm text-amber-800/80 mt-1">
                        Aura AI triage results provide preliminary
                        probabilities. They are not intended to replace formal
                        diagnosis by an ophthalmologist or clinical specialist.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border border-slate-200 rounded-lg bg-slate-50 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      Included Scans
                    </h3>
                    <div className="flex gap-4 items-center flex-wrap">
                      {readyImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <div className="w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-white shadow-sm">
                            <img
                              src={img.preview}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {img.eyeSide === 'Left'
                              ? 'OS'
                              : img.eyeSide === 'Right'
                                ? 'OD'
                                : 'OU'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {remainingQuota <= 0 && (
                <div className="flex items-start justify-between gap-3 p-4 mt-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Quota exhausted
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      You need to purchase more quota before starting a new
                      screening.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/organisation/wallet')}
                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Go to Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors"
                disabled={isCreating}
              >
                <ArrowLeft className="w-4 h-4" /> Cancel & Return
              </button>

              {currentStep === 'upload-images' ? (
                <button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Proceed to Review <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleLaunchScreening}
                  disabled={!canProceed || isCreating || remainingQuota <= 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isUploading
                        ? 'Transferring Files…'
                        : 'Executing AI Model…'}
                    </>
                  ) : (
                    <>
                      <ScanEye className="w-4 h-4" /> Start AI Analysis
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
