import { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Edit3,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
  Clipboard,
  Shield,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { Link } from 'react-router-dom';
import Spinner from '@/components/ui/spinner';
import { formatDate, formatMonthYear } from '@/lib/date-utils';
import PatientLayout from '../components/PatientLayout';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '../hooks/useProfile';
import { profileSchema, type ProfileFormData } from '../schemas/profile.schema';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolveAvatarUrl } from '@/lib/user-avatar';

export default function ProfilePage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  // Avatar upload state
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Profile form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      citizenId: '',
    },
  });

  // Reset form when profile data loads or editing starts
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split('T')[0]
          : '',
        gender: profile.gender ?? '',
        address: profile.address ?? '',
        citizenId: profile.citizenId ?? '',
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    setAvatarImageError(false);
  }, [profile?.avatarUrl]);

  const resolvedAvatarUrl = resolveAvatarUrl(profile?.avatarUrl);

  // ============ PROFILE FORM HANDLERS ============

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(
      {
        fullName: data.fullName,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: (data.gender as 'male' | 'female' | 'other') || undefined,
        address: data.address || undefined,
        citizenId: data.citizenId || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('PatientProfile.toast.profileUpdated'));
          setIsEditing(false);
        },
        onError: (error) => {
          toast.error(
            extractApiErrorMessage(
              error,
              t('PatientProfile.toast.profileUpdateFailed')
            )
          );
        },
      }
    );
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split('T')[0]
          : '',
        gender: profile.gender ?? '',
        address: profile.address ?? '',
        citizenId: profile.citizenId ?? '',
      });
    }
    setIsEditing(false);
  };

  const processImageFile = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error(t('PatientProfile.avatar.selectImageFile')));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          reject(new Error(t('PatientProfile.avatar.maxSizeError')));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(new Error(t('PatientProfile.avatar.readFileFailed')));
        reader.readAsDataURL(file);
      });
    },
    [t]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        setPreviewUrl(dataUrl);
        setAvatarFile(file);
      } catch {
        toast.error(t('PatientProfile.toast.loadImageFailed'));
      }
    },
    [processImageFile, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        setPreviewUrl(dataUrl);
        setAvatarFile(file);
      } catch {
        toast.error(t('PatientProfile.toast.loadImageFailed'));
      }
    },
    [processImageFile, t]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!showAvatarUpload) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          try {
            const dataUrl = await processImageFile(file);
            setPreviewUrl(dataUrl);
            setAvatarFile(file);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : t('PatientProfile.toast.loadImageFailed')
            );
          }
          break;
        }
      }
    },
    [showAvatarUpload, processImageFile, t]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleAvatarSave = () => {
    if (!avatarFile) return;
    uploadAvatarMutation.mutate(avatarFile, {
      onSuccess: () => {
        toast.success(t('PatientProfile.toast.avatarUpdated'));
        setShowAvatarUpload(false);
        setPreviewUrl(null);
        setAvatarFile(null);
      },
      onError: (_err) => {
        toast.error(t('PatientProfile.toast.avatarUploadFailed'));
      },
    });
  };

  const handleAvatarCancel = () => {
    setShowAvatarUpload(false);
    setPreviewUrl(null);
    setAvatarFile(null);
    setIsDragging(false);
  };

  // ============ LOADING / ERROR STATES ============

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={40} />
            <p className="text-[var(--text-secondary)]">
              {t('PatientProfile.loading.profile')}
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (error || !profile) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-[var(--text-primary)] font-medium">
              {t('PatientProfile.error.title')}
            </p>
            <p className="text-[var(--text-secondary)] text-sm">
              {error?.message || t('PatientProfile.error.fallback')}
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('PatientProfile.page.title')}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t('PatientProfile.page.subtitle')}
          </p>
        </div>

        <Link
          to={resolvePathWithLocale('/patient/schedule')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 shadow-sm"
        >
          <PlusCircle className="h-5 w-5" strokeWidth={2} />
          <span>{t('PatientDashboard.quickActions.bookAppointment')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="medical-card">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-brand">
                {resolvedAvatarUrl && !avatarImageError ? (
                  <img
                    src={resolvedAvatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile.fullName.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAvatarUpload(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white hover:brightness-110 transition-all shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Upload Modal */}
            {showAvatarUpload && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-[var(--bg-primary)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {t('PatientProfile.avatar.modalTitle')}
                    </h3>
                    <button
                      onClick={handleAvatarCancel}
                      className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                  </div>

                  {/* Drop Zone */}
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-brand bg-brand-soft/20 scale-[1.02]'
                        : 'border-[var(--border-color)] hover:border-brand/50 hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand shadow-lg">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t('PatientProfile.avatar.changeHint')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isDragging
                              ? 'bg-brand text-white'
                              : 'bg-brand-soft text-brand'
                          }`}
                        >
                          {isDragging ? (
                            <Upload className="w-8 h-8 animate-bounce" />
                          ) : (
                            <ImageIcon className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium mb-1">
                            {isDragging
                              ? t('PatientProfile.avatar.dropHere')
                              : t('PatientProfile.avatar.dragDrop')}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {t('PatientProfile.avatar.browseHint')}
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Paste hint */}
                  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <Clipboard className="w-4 h-4 text-brand" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {t('PatientProfile.avatar.pastePrefix')}{' '}
                      <span className="text-brand font-medium">Ctrl+V</span> to
                      {t('PatientProfile.avatar.pasteSuffix')}
                    </span>
                  </div>

                  {/* File requirements */}
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    {t('PatientProfile.avatar.supportedFormats')}
                  </p>

                  {/* Upload error */}
                  {uploadAvatarMutation.isError && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {uploadAvatarMutation.error?.message ||
                        t('PatientProfile.toast.avatarUploadFailed')}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAvatarCancel}
                      className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors border border-[var(--border-color)]"
                    >
                      {t('PatientProfile.actions.cancel')}
                    </button>
                    <button
                      onClick={handleAvatarSave}
                      disabled={!avatarFile || uploadAvatarMutation.isPending}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadAvatarMutation.isPending ? (
                        <>
                          <Spinner size={16} />
                          {t('PatientProfile.avatar.uploading')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {t('PatientProfile.avatar.savePhoto')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {profile.fullName}
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">{profile.email}</p>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                profile.isEmailVerified
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {profile.isEmailVerified
                  ? t('PatientProfile.labels.emailVerified')
                  : t('PatientProfile.labels.emailNotVerified')}
              </span>
            </div>
          </div>

          <hr className="my-6 border-[var(--border-color)]" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">
                {t('PatientProfile.labels.memberSince')}
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {formatMonthYear(profile.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">
                {t('PatientProfile.labels.twoFactorStatus')}
              </span>
              <span
                className={`font-medium ${
                  profile.isTwoFactorEnabled
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              >
                {profile.isTwoFactorEnabled
                  ? t('PatientProfile.labels.enabled')
                  : t('PatientProfile.labels.disabled')}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <form
            onSubmit={handleSubmit(onProfileSubmit)}
            className="medical-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('PatientProfile.sections.personalInformation')}
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  <Edit3 className="w-4 h-4" />
                  {t('PatientProfile.actions.edit')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {t('PatientProfile.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <Spinner size={16} />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {t('PatientProfile.actions.save')}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <User className="w-4 h-4" />
                  {t('PatientProfile.fields.fullName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      {...register('fullName')}
                      type="text"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.fullName.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Mail className="w-4 h-4" />
                  {t('PatientProfile.fields.email')}
                </label>
                <p className="text-[var(--text-primary)] font-medium">
                  {profile.email}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  <span className="text-red-500">(*)</span>{' '}
                  {t('PatientProfile.fields.emailImmutable')}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Phone className="w-4 h-4" />
                  {t('PatientProfile.fields.phoneNumber')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.phone.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.phone || '\u2014'}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Calendar className="w-4 h-4" />
                  {t('PatientProfile.fields.dateOfBirth')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.dateOfBirth.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.dateOfBirth
                      ? formatDate(profile.dateOfBirth)
                      : '\u2014'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  {t('PatientProfile.fields.gender')}
                </label>
                {isEditing ? (
                  <div>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="">
                        {t('PatientProfile.gender.preferNotToSay')}
                      </option>
                      <option value="male">
                        {t('PatientProfile.gender.male')}
                      </option>
                      <option value="female">
                        {t('PatientProfile.gender.female')}
                      </option>
                      <option value="other">
                        {t('PatientProfile.gender.other')}
                      </option>
                    </select>
                    {formErrors.gender && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.gender.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium capitalize">
                    {profile.gender || '\u2014'}
                  </p>
                )}
              </div>

              {/* Citizen ID */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Shield className="w-4 h-4" />
                  Citizen ID (CCCD)
                </label>
                {isEditing ? (
                  <div>
                    <input
                      {...register('citizenId')}
                      type="text"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                      placeholder="Enter CCCD"
                    />
                    {formErrors.citizenId && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.citizenId.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.citizenId || '\u2014'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <MapPin className="w-4 h-4" />
                  {t('PatientProfile.fields.address')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      {...register('address')}
                      type="text"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                    {formErrors.address && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(formErrors.address.message ?? '')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.address || '\u2014'}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </PatientLayout>
  );
}
