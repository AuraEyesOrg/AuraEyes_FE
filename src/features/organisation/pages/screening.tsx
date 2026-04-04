import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ScanEye,
  Upload,
  CheckCircle2,
  User,
  Search,
  X,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
  Plus,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import AvatarFallback from '@/components/ui/avatar-fallback';
import CreateWalkInPatientModal from '../components/CreateWalkInPatientModal';
import { getOrganisationRecentPatients } from '../api/patients.api';
import type { OrganisationRecentPatientDto } from '../api/patients.api';
import { orgScreeningApi } from '../api/screening.api';
import { unwrapApiData } from '@/types/api-response';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';

/* ═══════════════════════════════════════════════════════════════════════
   STEP DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════ */
type Step = 'select-patient' | 'upload-images' | 'confirm-launch';

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: 'select-patient', label: 'Select Patient', icon: User },
  { key: 'upload-images', label: 'Upload Images', icon: Upload },
  { key: 'confirm-launch', label: 'Launch AI', icon: Sparkles },
];

interface UploadedImage {
  file: File;
  preview: string;
  eyeSide: 'Left' | 'Right' | 'Both';
  url?: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function OrganisationScreeningPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>('select-patient');
  const [selectedPatient, setSelectedPatient] =
    useState<OrganisationRecentPatientDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Fetch patients — use consistent query key with patients page
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
  });

  // Pre-select patient from URL params (from "Screen Now" on Patients page)
  const preSelectedPatientId = searchParams.get('patientId');
  useEffect(() => {
    if (preSelectedPatientId && patients.length > 0 && !selectedPatient) {
      const match = patients.find((p) => p.id === preSelectedPatientId);
      if (match) {
        setSelectedPatient(match);
        setCurrentStep('upload-images');
      }
    }
  }, [preSelectedPatientId, patients, selectedPatient]);

  // Filter patients by search
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phoneNumber &&
        p.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ── Step Navigation ──
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1].key);
  };
  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].key);
  };

  // ── Image Handling ──
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newImages: UploadedImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          eyeSide: i % 2 === 0 ? 'Left' : 'Right',
        });
      }
      setImages((prev) => [...prev, ...newImages]);
      e.target.value = '';
    },
    []
  );

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateEyeSide = (index: number, side: 'Left' | 'Right' | 'Both') => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, eyeSide: side } : img))
    );
  };

  // ── Launch Screening ──
  const handleLaunchScreening = async () => {
    if (!selectedPatient || images.length === 0) return;

    try {
      setIsCreating(true);

      // Step 1: Upload images to storage
      setIsUploading(true);
      const uploadResponse = await orgScreeningApi.uploadImages(
        images.map((img) => img.file)
      );
      const uploadData = unwrapApiData<{
        uploadedUrls: string[];
        count: number;
      }>(uploadResponse);
      setIsUploading(false);

      // Step 2: Create screening session
      const retinalImages = (uploadData?.uploadedUrls ?? []).map((url, i) => ({
        imageUrl: url,
        eyeSide: images[i]?.eyeSide ?? ('Both' as const),
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
          `/organisation/screening/result?id=${sessionData.screeningId}`
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
  const canProceed =
    currentStep === 'select-patient'
      ? !!selectedPatient
      : currentStep === 'upload-images'
        ? images.length > 0
        : !!selectedPatient && images.length > 0;

  // ── Walk-in success handler ──
  const handleWalkInSuccess = (patientId: string) => {
    setIsWalkInModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['organisation-patients'] });
    // After walk-in created, patient list will refresh, user can then select
  };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganisationHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScanEye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--text-primary)">
                  AI Eye Screening
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Perform retinal screening on behalf of a patient
                </p>
              </div>
            </div>
          </div>

          {/* ── Stepper ── */}
          <div className="flex items-center gap-2 mb-8 px-4">
            {STEPS.map((step, i) => {
              const isActive = i === stepIndex;
              const isCompleted = i < stepIndex;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-(--bg-secondary) text-(--text-tertiary)'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full transition-colors ${
                        isCompleted ? 'bg-emerald-500' : 'bg-(--border-primary)'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Step Content ── */}
          <div className="max-w-4xl mx-auto">
            {/* STEP 1: Select Patient */}
            {currentStep === 'select-patient' && (
              <div className="space-y-6">
                {/* Search + Walk-in button */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-tertiary)" />
                    <input
                      type="text"
                      placeholder="Search by patient name or phone number..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-(--bg-secondary) border border-(--border-primary) text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWalkInModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-primary) text-sm font-medium text-(--text-secondary) hover:border-primary/60 hover:text-primary transition whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Walk-in
                  </button>
                </div>

                {/* Patient List */}
                <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {loadingPatients && (
                    <div className="flex items-center justify-center py-12 text-(--text-tertiary)">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading
                      patients…
                    </div>
                  )}
                  {!loadingPatients && filteredPatients.length === 0 && (
                    <div className="text-center py-12 text-(--text-tertiary)">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No patients found</p>
                      <p className="text-sm mt-1">
                        Try a different search or create a walk-in patient
                      </p>
                    </div>
                  )}
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        selectedPatient?.id === patient.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-(--border-primary) bg-(--bg-secondary) hover:border-primary/40'
                      }`}
                    >
                      <AvatarFallback
                        fullName={patient.name}
                        avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(patient.id.slice(0, 8))}`}
                        size="w-11 h-11"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-(--text-primary) truncate">
                          {patient.name}
                        </p>
                        <p className="text-xs text-(--text-tertiary)">
                          {patient.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                          {patient.age} yrs
                          {patient.phoneNumber && ` · ${patient.phoneNumber}`}
                          {patient.lastScreening && (
                            <>
                              {' · Last: '}
                              {new Date(
                                patient.lastScreening
                              ).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {selectedPatient?.id === patient.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Upload Images */}
            {currentStep === 'upload-images' && (
              <div className="space-y-6">
                {/* Selected patient summary */}
                {selectedPatient && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-(--bg-secondary) border border-(--border-primary)">
                    <AvatarFallback
                      fullName={selectedPatient.name}
                      avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(selectedPatient.id.slice(0, 8))}`}
                      size="w-9 h-9"
                      className="shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {selectedPatient.name}
                      </p>
                      <p className="text-xs text-(--text-tertiary)">
                        {selectedPatient.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                        {selectedPatient.age} yrs
                      </p>
                    </div>
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-(--border-primary) hover:border-primary/60 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-(--text-tertiary) group-hover:text-primary transition-colors" />
                  <p className="text-lg font-semibold text-(--text-primary)">
                    Drag & drop retinal images here
                  </p>
                  <p className="text-sm text-(--text-tertiary) mt-1">
                    or click to browse · JPG, PNG, TIFF, BMP, WebP · Max 50 MB
                    each
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

                {/* Uploaded Images Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)"
                      >
                        <img
                          src={img.preview}
                          alt={img.file.name}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="p-3">
                          <p className="text-xs text-(--text-primary) font-medium truncate">
                            {img.file.name}
                          </p>
                          <select
                            value={img.eyeSide}
                            onChange={(e) =>
                              updateEyeSide(
                                i,
                                e.target.value as 'Left' | 'Right' | 'Both'
                              )
                            }
                            className="mt-2 w-full text-xs py-1.5 px-2 rounded-lg bg-(--bg-primary) border border-(--border-primary) text-(--text-primary)"
                          >
                            <option value="Left">Left Eye (OS)</option>
                            <option value="Right">Right Eye (OD)</option>
                            <option value="Both">Both Eyes (OU)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Confirm & Launch */}
            {currentStep === 'confirm-launch' && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-6 space-y-5">
                  <h3 className="text-lg font-bold text-(--text-primary)">
                    Screening Summary
                  </h3>

                  {/* Patient */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-(--bg-primary) border border-(--border-primary)">
                    <AvatarFallback
                      fullName={selectedPatient?.name || ''}
                      avatarUrl={
                        selectedPatient
                          ? `${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(selectedPatient.id.slice(0, 8))}`
                          : ''
                      }
                      size="w-12 h-12"
                      className="shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-(--text-primary)">
                        {selectedPatient?.name}
                      </p>
                      <p className="text-sm text-(--text-tertiary)">
                        {selectedPatient?.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                        {selectedPatient?.age} yrs
                        {selectedPatient?.phoneNumber &&
                          ` · ${selectedPatient.phoneNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-(--text-secondary)">
                      <FileImage className="w-4 h-4 inline mr-1" />
                      {images.length} retinal image
                      {images.length !== 1 ? 's' : ''} ready
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img.preview}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-(--border-primary)"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      AI Analysis Notice
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      This will consume 1 AI screening credit from your
                      organisation quota. Results are for screening purposes
                      only and do not constitute a medical diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div className="flex justify-between mt-8 pb-4">
              <button
                onClick={goBack}
                disabled={stepIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {currentStep === 'confirm-launch' ? (
                <button
                  onClick={handleLaunchScreening}
                  disabled={!canProceed || isCreating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-primary/25"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isUploading ? 'Uploading…' : 'Creating session…'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Perform AI Screening
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-primary/25"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Walk-in Modal */}
          <CreateWalkInPatientModal
            isOpen={isWalkInModalOpen}
            onClose={() => setIsWalkInModalOpen(false)}
            onSuccess={handleWalkInSuccess}
          />
        </main>
      </div>
    </div>
  );
}
