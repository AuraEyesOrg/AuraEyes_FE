import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ScanEye,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
  Plus,
  Zap,
  Coins,
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
import { organisationWalletApi } from '../api/wallet.api';
import { unwrapApiData } from '@/types/api-response';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { UploadedImage, analyzeImageQuality } from '../utils/screening.util';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type ScreeningCreationStep = Extract<
  ScreeningFlowStep,
  'upload-images' | 'launch-ai'
>;

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function OrganisationScreeningPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useSafeTranslation();

  // Wizard state
  const [currentStep, setCurrentStep] =
    useState<ScreeningCreationStep>('upload-images');
  const [selectedPatient, setSelectedPatient] =
    useState<OrganisationRecentPatientDto | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaAmountInput, setQuotaAmountInput] = useState('50');

  const { data: patients = [] } = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
  });

  const { data: billingSummary, isLoading: isBillingLoading } = useQuery({
    queryKey: ['org-billing-summary'],
    queryFn: () => orgBillingApi.getSummary(),
  });

  const remainingQuota = billingSummary?.remainingQuota ?? 0;
  const isQuotaExhausted =
    !isBillingLoading && remainingQuota !== null && remainingQuota <= 0;
  const walletBalance = billingSummary?.walletBalance ?? 0;
  const calculatedOrganisationUnitPriceFromPatient =
    billingSummary?.patientUnitPrice && billingSummary.patientUnitPrice > 0
      ? Math.round(billingSummary.patientUnitPrice * 0.6)
      : 0;
  const effectiveOrganisationUnitPrice =
    billingSummary?.organisationUnitPrice &&
    billingSummary.organisationUnitPrice > 0
      ? billingSummary.organisationUnitPrice
      : calculatedOrganisationUnitPriceFromPatient;
  const hasValidUnitPrice = effectiveOrganisationUnitPrice > 0;

  const parsedQuotaAmount = Number.parseInt(quotaAmountInput, 10);
  const selectedQuotaAmount = Number.isFinite(parsedQuotaAmount)
    ? Math.max(1, Math.min(parsedQuotaAmount, 5000))
    : 1;
  const selectedTotalCost =
    selectedQuotaAmount * effectiveOrganisationUnitPrice;
  const missingAmount = Math.max(0, selectedTotalCost - walletBalance);
  const hasEnoughBalance = selectedTotalCost > 0 && missingAmount === 0;
  const suggestedTopUpAmount =
    missingAmount > 0
      ? Math.ceil(Math.max(missingAmount, 10000) / 1000) * 1000
      : 0;

  const buyQuotaMutation = useMutation({
    mutationFn: (quotaAmount: number) =>
      orgBillingApi.buyQuota({ quotaAmount }),
    onSuccess: () => {
      toast.success(
        t(
          'Organisation.screening.toast.buyQuotaSuccess',
          'Purchased {{count}} AI quota credits successfully.',
          {
            count: selectedQuotaAmount,
          }
        )
      );
      setIsQuotaModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 402) {
        toast.error(
          t(
            'Organisation.screening.toast.walletInsufficient',
            'Insufficient wallet balance. Please top up your wallet.'
          )
        );
        return;
      }

      const message =
        (isAxiosError(error) &&
          ((error.response?.data as { message?: string; detail?: string })
            ?.message ||
            (error.response?.data as { detail?: string })?.detail)) ||
        t(
          'Organisation.screening.toast.buyQuotaFailed',
          'Unable to buy quota. Please try again.'
        );

      toast.error(message);
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: (amountVnd: number) =>
      organisationWalletApi.createDeposit({
        amountVnd,
        description: t(
          'Organisation.screening.wallet.topUpDescription',
          'Top up for organisation quota purchase ({{amount}} VND)',
          {
            amount: amountVnd.toLocaleString('vi-VN'),
          }
        ),
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      }),
    onSuccess: (response) => {
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      toast.error(
        t(
          'Organisation.screening.toast.paymentLinkUnavailable',
          'Unable to get payment link. Please try again.'
        )
      );
    },
    onError: (error) => {
      const message =
        (isAxiosError(error) &&
          ((error.response?.data as { message?: string; detail?: string })
            ?.message ||
            (error.response?.data as { detail?: string })?.detail)) ||
        t(
          'Organisation.screening.toast.createTopUpFailed',
          'Unable to create top-up request. Please try again.'
        );

      toast.error(message);
    },
  });

  const preSelectedPatientId = searchParams.get('patientId');
  useEffect(() => {
    if (!preSelectedPatientId) {
      toast.error(
        t(
          'Organisation.screening.toast.noPatientSelected',
          'No patient selected'
        ),
        {
          toastId: 'no-patient',
        }
      );
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

  const handleBuyQuotaFromModal = () => {
    if (!hasValidUnitPrice) {
      toast.error(
        t(
          'Organisation.screening.toast.quotaUnitPriceUnavailable',
          'Quota unit price is unavailable. Please try again later.'
        )
      );
      return;
    }

    buyQuotaMutation.mutate(selectedQuotaAmount);
  };

  const handleTopUpWalletFromModal = () => {
    if (suggestedTopUpAmount <= 0) {
      toast.error(
        t(
          'Organisation.screening.toast.invalidTopUpAmount',
          'Invalid top-up amount.'
        )
      );
      return;
    }

    createDepositMutation.mutate(suggestedTopUpAmount);
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
              message: t(
                'Organisation.screening.upload.analyzingQuality',
                'Analyzing image quality...'
              ),
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
        eyeSide: 'Both',
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

  // ── Launch Screening ──
  const handleLaunchScreening = async () => {
    const validImages = images.filter(
      (img) => img.status === 'ready' || img.status === 'warning'
    );
    if (!selectedPatient || validImages.length === 0) return;

    if (remainingQuota <= 0) {
      toast.error(
        t(
          'Organisation.screening.toast.quotaExhausted',
          'Quota exhausted. Please buy more quota from wallet or top up your balance.'
        )
      );
      setIsQuotaModalOpen(true);
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

      // Step 2: Create screening session (backend handles quota deduction).
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

      if (!sessionData?.screeningId) {
        throw new Error(
          t(
            'Organisation.screening.toast.createSessionFailed',
            'Unable to create screening session for AI analysis.'
          )
        );
      }

      // Keep summary in sync after session creation.
      queryClient.invalidateQueries({ queryKey: ['org-billing-summary'] });

      navigate(
        resolvePathWithLocale(
          `/organisation/screening/result?id=${sessionData.screeningId}`
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
      let errorMessage = t(
        'Organisation.screening.toast.createSessionFailedGeneric',
        'Failed to create screening session. Please try again.'
      );
      if (isAxiosError(err) && err.response?.data) {
        if (err.response.status === 402) {
          toast.error(
            t(
              'Organisation.screening.toast.quotaExhausted',
              'Quota exhausted. Please buy more quota from wallet or top up your balance.'
            )
          );
          setIsQuotaModalOpen(true);
          return;
        }

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
        <OrganisationHeader
          pageName={t('Organisation.screening.pageName', 'Screening')}
        />
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
                    {t(
                      'Organisation.screening.header.title',
                      'AI Retinal Screening'
                    )}
                  </h1>
                </div>
                <p className="text-sm text-slate-500 max-w-[60ch]">
                  {t(
                    'Organisation.screening.header.subtitle',
                    'Upload high-resolution DICOM or fundus images for diagnostic AI triage. Ensure image clarity before proceeding to the algorithm.'
                  )}
                </p>
              </div>
              {/* Quota badge — patient-like style, org shows remain only */}
              <div className="ml-auto inline-flex items-center gap-2">
                {isBillingLoading ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-(--bg-secondary) border border-(--border-primary)">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-(--text-secondary)" />
                    <span className="text-xs text-(--text-tertiary)">
                      {t('Organisation.common.loading', 'Loading...')}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white ${
                      isQuotaExhausted
                        ? 'bg-red-500'
                        : remainingQuota <= 3
                          ? 'bg-amber-500'
                          : 'bg-(--color-brand-primary)'
                    }`}
                    title={`Còn ${remainingQuota} lượt`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        'Organisation.screening.badges.remainingQuota',
                        '{{count}} credits left',
                        {
                          count: remainingQuota,
                        }
                      )}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-(--color-brand-primary) text-(--color-brand-primary) text-xs font-semibold hover:bg-(--color-brand-primary) hover:text-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('Organisation.screening.actions.buyMoreQuota', 'Buy more')}
                </button>
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
                      {selectedPatient.gender === 'M'
                        ? t('Organisation.common.gender.male', 'Male')
                        : t('Organisation.common.gender.female', 'Female')}{' '}
                      · {selectedPatient.age}{' '}
                      {t('Organisation.common.yearsAbbr', 'yrs')} ·{' '}
                      {t('Organisation.common.idLabel', 'ID')}:{' '}
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
                        {t(
                          'Organisation.screening.upload.title',
                          'Image Acquisition'
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        {t(
                          'Organisation.screening.upload.subtitle',
                          'Select or drag retinal scan files for processing.'
                        )}
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
                          {t(
                            'Organisation.screening.upload.dropzone.title',
                            'Drag files or click to browse'
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t(
                            'Organisation.screening.upload.dropzone.supportedFormats',
                            'Supported formats: JPG, PNG, TIFF (Max 50MB per file)'
                          )}
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
                            {t(
                              'Organisation.screening.upload.inventoryTitle',
                              'Scan Inventory'
                            )}
                          </h3>
                          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {t(
                              'Organisation.screening.upload.inventoryFiles',
                              '{{count}} files',
                              {
                                count: images.length,
                              }
                            )}
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
                      {t(
                        'Organisation.screening.launch.title',
                        'Launch Diagnostic Model'
                      )}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">
                      {t(
                        'Organisation.screening.launch.readyDescription',
                        'System is ready to process {{count}} scan{{suffix}}. This will consume 1 AI screening credit.',
                        {
                          count: readyImages.length,
                          suffix: readyImages.length > 1 ? 's' : '',
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 text-sm">
                        {t(
                          'Organisation.screening.launch.clinicalAdvisory.title',
                          'Clinical Advisory'
                        )}
                      </h4>
                      <p className="text-sm text-amber-800/80 mt-1">
                        {t(
                          'Organisation.screening.launch.clinicalAdvisory.description',
                          'Aura AI triage results provide preliminary probabilities. They are not intended to replace formal diagnosis by an ophthalmologist or clinical specialist.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border border-slate-200 rounded-lg bg-slate-50 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      {t(
                        'Organisation.screening.launch.includedScans',
                        'Included Scans'
                      )}
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Bar — thay toàn bộ đoạn navigation bar + quota warning */}
              <div className="mt-8 space-y-3">
                {/* Quota exhausted banner — chỉ hiện khi đã load xong VÀ thực sự hết */}
                {isQuotaExhausted && (
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/40 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          {t(
                            'Organisation.screening.quotaBanner.title',
                            'Quota exhausted'
                          )}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 truncate">
                          {t(
                            'Organisation.screening.quotaBanner.description',
                            'Buy more quota from wallet. If your balance is insufficient, top up your wallet first.'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsQuotaModalOpen(true)}
                        className="rounded-lg bg-primary hover:bg-primary/90 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        {t(
                          'Organisation.screening.actions.buyQuota',
                          'Buy quota'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            resolvePathWithLocale('/organisation/wallet')
                          )
                        }
                        className="rounded-lg bg-red-600 hover:bg-red-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        {t(
                          'Organisation.screening.actions.topUpWallet',
                          'Top up wallet'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nav row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goBack}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t(
                      'Organisation.screening.navigation.cancelAndReturn',
                      'Cancel & Return'
                    )}
                  </button>

                  {currentStep === 'upload-images' ? (
                    <button
                      onClick={goNext}
                      disabled={!canProceed}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {t(
                        'Organisation.screening.navigation.proceedToReview',
                        'Proceed to Review'
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleLaunchScreening}
                      disabled={!canProceed || isCreating || isQuotaExhausted}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isUploading
                            ? t(
                                'Organisation.screening.navigation.transferringFiles',
                                'Transferring Files...'
                              )
                            : t(
                                'Organisation.screening.navigation.executingAiModel',
                                'Executing AI Model...'
                              )}
                        </>
                      ) : (
                        <>
                          <ScanEye className="w-4 h-4" />
                          {t(
                            'Organisation.screening.navigation.startAiAnalysis',
                            'Start AI Analysis'
                          )}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {isQuotaModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-(--text-primary)">
                  {t(
                    'Organisation.screening.quotaModal.title',
                    'Buy more AI quota'
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="p-1.5 rounded-lg text-(--text-tertiary) hover:bg-(--bg-tertiary)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-(--text-primary)">
                  {t(
                    'Organisation.screening.quotaModal.quantityLabel',
                    'Number of credits to purchase'
                  )}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quotaAmountInput}
                  onChange={(event) => setQuotaAmountInput(event.target.value)}
                  className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
                />

                <div className="rounded-xl border border-(--border-primary) p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.unitPriceLabel',
                        'Unit price/credit'
                      )}
                    </span>
                    <span className="font-semibold text-(--text-primary)">
                      {hasValidUnitPrice
                        ? `${effectiveOrganisationUnitPrice.toLocaleString('vi-VN')} VND`
                        : t('Organisation.common.notAvailable', 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.totalPaymentLabel',
                        'Total payment'
                      )}
                    </span>
                    <span className="font-bold text-(--text-primary)">
                      {selectedTotalCost.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-tertiary)">
                      {t(
                        'Organisation.screening.quotaModal.walletBalanceLabel',
                        'Wallet balance'
                      )}
                    </span>
                    <span className="font-semibold text-(--text-primary)">
                      {walletBalance.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                {hasEnoughBalance ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    {t(
                      'Organisation.screening.quotaModal.walletSufficient',
                      'Your wallet has sufficient balance to buy quota.'
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                    {t(
                      'Organisation.screening.quotaModal.walletInsufficientPrefix',
                      'Insufficient balance. Missing'
                    )}{' '}
                    <span className="font-semibold">
                      {missingAmount.toLocaleString('vi-VN')} VND
                    </span>
                    .{' '}
                    {t(
                      'Organisation.screening.quotaModal.walletInsufficientSuffix',
                      'Please top up your wallet.'
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-(--border-primary) text-sm font-semibold text-(--text-primary) hover:bg-(--bg-tertiary)"
                >
                  {t('Organisation.common.close', 'Close')}
                </button>

                {hasEnoughBalance ? (
                  <button
                    type="button"
                    onClick={handleBuyQuotaFromModal}
                    disabled={buyQuotaMutation.isPending || !hasValidUnitPrice}
                    className="px-4 py-2 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {buyQuotaMutation.isPending
                      ? t('Organisation.common.processing', 'Processing...')
                      : t(
                          'Organisation.screening.actions.buyQuota',
                          'Buy quota'
                        )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTopUpWalletFromModal}
                    disabled={
                      createDepositMutation.isPending ||
                      suggestedTopUpAmount <= 0
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {createDepositMutation.isPending
                      ? t(
                          'Organisation.screening.quotaModal.creatingPayment',
                          'Creating payment...'
                        )
                      : t(
                          'Organisation.screening.quotaModal.topUpAction',
                          'Top up {{amount}} VND',
                          {
                            amount:
                              suggestedTopUpAmount.toLocaleString('vi-VN'),
                          }
                        )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
