import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Bell,
  Key,
  Save,
  Edit3,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
  Clipboard,
  AlertCircle,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { formatDate, formatMonthYear } from '@/lib/date-utils';
import PatientLayout from '../components/PatientLayout';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
} from '../hooks/useProfile';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
} from '../schemas/profile.schema';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const changePasswordMutation = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);

  // Avatar upload state
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Change password modal state
  const [showChangePassword, setShowChangePassword] = useState(false);

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
    },
  });

  // Change password form
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
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
      });
    }
  }, [profile, reset]);

  // ============ PROFILE FORM HANDLERS ============

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(
      {
        fullName: data.fullName,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: (data.gender as 'male' | 'female' | 'other') || undefined,
        address: data.address || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully');
          setIsEditing(false);
        },
        onError: (_err) => {
          toast.error('Failed to update profile');
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
      });
    }
    setIsEditing(false);
  };

  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image must be less than 5MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        setPreviewUrl(dataUrl);
        setAvatarFile(file);
      } catch {
        toast.error('Failed to load image');
      }
    },
    [processImageFile]
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
        toast.error('Failed to load image');
      }
    },
    [processImageFile]
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
              err instanceof Error ? err.message : 'Failed to load image'
            );
          }
          break;
        }
      }
    },
    [showAvatarUpload, processImageFile]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleAvatarSave = () => {
    if (!avatarFile) return;
    uploadAvatarMutation.mutate(avatarFile, {
      onSuccess: () => {
        toast.success('Profile photo updated successfully');
        setShowAvatarUpload(false);
        setPreviewUrl(null);
        setAvatarFile(null);
      },
      onError: (_err) => {
        toast.error('Failed to upload avatar');
      },
    });
  };

  const handleAvatarCancel = () => {
    setShowAvatarUpload(false);
    setPreviewUrl(null);
    setAvatarFile(null);
    setIsDragging(false);
  };

  // ============ CHANGE PASSWORD HANDLERS ============

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setShowChangePassword(false);
        resetPw();
      },
      onError: (_err) => {
        toast.error('Failed to change password');
      },
    });
  };

  // ============ LOADING / ERROR STATES ============

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={40} />
            <p className="text-[var(--text-secondary)]">Loading profile...</p>
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
              Failed to load profile
            </p>
            <p className="text-[var(--text-secondary)] text-sm">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          My Profile
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="medical-card">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-brand">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile.fullName.charAt(0)}
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
                      Update Profile Photo
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
                          Click or drop another image to change
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
                              ? 'Drop your image here'
                              : 'Drag & drop your photo'}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            or click to browse files
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
                      You can also{' '}
                      <span className="text-brand font-medium">Ctrl+V</span> to
                      paste an image
                    </span>
                  </div>

                  {/* File requirements */}
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    Supported formats: JPG, PNG, GIF, WebP &bull; Max size: 5MB
                  </p>

                  {/* Upload error */}
                  {uploadAvatarMutation.isError && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {uploadAvatarMutation.error?.message ||
                        'Failed to upload avatar'}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAvatarCancel}
                      className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors border border-[var(--border-color)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAvatarSave}
                      disabled={!avatarFile || uploadAvatarMutation.isPending}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadAvatarMutation.isPending ? (
                        <>
                          <Spinner size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Photo
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
                  ? 'Email Verified'
                  : 'Email Not Verified'}
              </span>
            </div>
          </div>

          <hr className="my-6 border-[var(--border-color)]" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Member Since</span>
              <span className="text-[var(--text-primary)] font-medium">
                {formatMonthYear(profile.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">2FA Status</span>
              <span
                className={`font-medium ${
                  profile.isTwoFactorEnabled
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              >
                {profile.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
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
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
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
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Update error */}
            {updateProfileMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {updateProfileMutation.error?.message ||
                  'Failed to update profile'}
              </div>
            )}

            {/* Update success */}
            {updateProfileMutation.isSuccess && !isEditing && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                Profile updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <User className="w-4 h-4" />
                  Full Name
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
                        {formErrors.fullName.message}
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
                  Email
                </label>
                <p className="text-[var(--text-primary)] font-medium">
                  {profile.email}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  <span className="text-red-500">(*)</span> Email cannot be
                  changed{' '}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
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
                        {formErrors.phone.message}
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
                  Date of Birth
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
                        {formErrors.dateOfBirth.message}
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
                  Gender
                </label>
                {isEditing ? (
                  <div>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.gender.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium capitalize">
                    {profile.gender || '\u2014'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
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
                        {formErrors.address.message}
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

          {/* Security Settings */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Security Settings
            </h2>

            <div className="space-y-4">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Password
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Change your account password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  Change
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      profile.isTwoFactorEnabled
                        ? 'bg-green-50'
                        : 'bg-yellow-50'
                    }`}
                  >
                    <Shield
                      className={`w-5 h-5 ${
                        profile.isTwoFactorEnabled
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Two-Factor Authentication
                    </p>
                    <p
                      className={`text-sm ${
                        profile.isTwoFactorEnabled
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {profile.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/patient/security"
                  className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  Manage
                </Link>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Notification Preferences
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Email & Push notifications
                    </p>
                  </div>
                </div>
                <Link
                  to="/patient/notifications"
                  className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  Configure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  resetPw();
                  changePasswordMutation.reset();
                }}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {changePasswordMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {changePasswordMutation.error?.message ||
                  'Failed to change password'}
              </div>
            )}

            {changePasswordMutation.isSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                Password changed successfully!
              </div>
            )}

            <form
              onSubmit={handleSubmitPw(onPasswordSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Current Password
                </label>
                <input
                  {...registerPw('currentPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {pwErrors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {pwErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  New Password
                </label>
                <input
                  {...registerPw('newPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {pwErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {pwErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Confirm New Password
                </label>
                <input
                  {...registerPw('confirmNewPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {pwErrors.confirmNewPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {pwErrors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    resetPw();
                    changePasswordMutation.reset();
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors border border-[var(--border-color)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner size={16} />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
