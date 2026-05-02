import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  AlertCircle,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { formatMonthYear } from '@/lib/date-utils';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  useOphthalmologistProfile,
  useUpdateOphthalmologistProfile,
  useUploadOphthalmologistAvatar,
} from '../hooks/useOphthalmologistProfile';

const profileSchema = yup.object({
  fullName: yup
    .string()
    .required('Validation.Required')
    .max(200, 'Validation.MaxLength.FullName'),
  phone: yup
    .string()
    .optional()
    .default('')
    .max(20, 'Validation.MaxLength.Phone'),
  address: yup
    .string()
    .optional()
    .default('')
    .max(500, 'Validation.MaxLength.Address'),
  bio: yup
    .string()
    .optional()
    .default('')
    .max(1000, 'Validation.MaxLength.Bio'),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

const fieldInputClass =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/30';

export default function OphthalmologistProfilePage() {
  const { data: profileData, isLoading, error } = useOphthalmologistProfile();
  const updateMutation = useUpdateOphthalmologistProfile();
  const uploadAvatarMutation = useUploadOphthalmologistAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (!profileData) return;

    reset({
      fullName: profileData.userFullName ?? '',
      phone: profileData.userPhoneNumber ?? '',
      address: profileData.userAddress ?? '',
      bio: profileData.bio ?? '',
    });
  }, [profileData, reset]);

  useEffect(() => {
    setAvatarImageError(false);
  }, [profileData?.userAvatarUrl]);

  const resolvedAvatarUrl = resolveAvatarUrl(profileData?.userAvatarUrl);
  const displayName = profileData?.userFullName ?? '';

  const onSubmit = (formData: ProfileFormData) => {
    updateMutation.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        bio: formData.bio || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully');
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(extractApiErrorMessage(err, 'Failed to update profile'));
        },
      }
    );
  };

  const onAvatarFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveAvatar = () => {
    if (!avatarFile) return;

    uploadAvatarMutation.mutate(avatarFile, {
      onSuccess: () => {
        toast.success('Avatar updated successfully');
        setShowAvatarModal(false);
        setAvatarFile(null);
        setPreviewUrl(null);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err, 'Failed to upload avatar'));
      },
    });
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setAvatarFile(null);
    setPreviewUrl(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={36} />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-medium text-[var(--text-primary)]">
            Could not load profile
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {(error as Error | null)?.message ?? 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Profile" />

        <main className="p-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
                Profile
              </h1>
              <p className="text-[var(--text-secondary)]">
                Manage your personal information and professional details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: avatar + summary card */}
              <div className="medical-card">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="h-32 w-32 overflow-hidden rounded-full shadow-brand">
                      {resolvedAvatarUrl && !avatarImageError ? (
                        <img
                          src={resolvedAvatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarImageError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand text-4xl font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:brightness-110"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-[var(--text-secondary)]">
                    {profileData.userEmail}
                  </p>

                  <span className="mt-3 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                    Ophthalmologist
                  </span>

                  <hr className="my-6 w-full border-[var(--border-color)]" />

                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Employment
                      </span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {profileData.employmentType ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Member Since
                      </span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatMonthYear(profileData.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: editable form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="medical-card lg:col-span-2"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-tertiary)]"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          reset({
                            fullName: profileData.userFullName ?? '',
                            phone: profileData.userPhoneNumber ?? '',
                            address: profileData.userAddress ?? '',
                            bio: profileData.bio ?? '',
                          });
                        }}
                        className="px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? (
                          <Spinner size={14} />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <ProfileField
                    label="Full Name"
                    icon={<User className="h-4 w-4" />}
                    isEditing={isEditing}
                    error={errors.fullName?.message}
                    input={
                      <input
                        {...register('fullName')}
                        className={fieldInputClass}
                        type="text"
                      />
                    }
                    value={profileData.userFullName ?? '—'}
                  />

                  <ProfileField
                    label="Email"
                    icon={<Mail className="h-4 w-4" />}
                    isEditing={false}
                    value={profileData.userEmail ?? '—'}
                  />

                  <ProfileField
                    label="Phone"
                    icon={<Phone className="h-4 w-4" />}
                    isEditing={isEditing}
                    error={errors.phone?.message}
                    input={
                      <input
                        {...register('phone')}
                        className={fieldInputClass}
                        type="tel"
                      />
                    }
                    value={profileData.userPhoneNumber || '—'}
                  />

                  <div className="md:col-span-2">
                    <ProfileField
                      label="Address"
                      icon={<MapPin className="h-4 w-4" />}
                      isEditing={isEditing}
                      error={errors.address?.message}
                      input={
                        <input
                          {...register('address')}
                          className={fieldInputClass}
                          type="text"
                        />
                      }
                      value={profileData.userAddress || '—'}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ProfileField
                      label="Bio"
                      isEditing={isEditing}
                      error={errors.bio?.message}
                      input={
                        <textarea
                          {...register('bio')}
                          className={`${fieldInputClass} min-h-[100px] resize-y`}
                          rows={4}
                        />
                      }
                      value={profileData.bio || '—'}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Update Avatar
              </h3>
              <button
                type="button"
                onClick={closeAvatarModal}
                className="rounded-lg p-2 transition hover:bg-[var(--bg-secondary)]"
              >
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="mb-4 flex justify-center">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-brand/20">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="avatar-preview"
                    className="h-full w-full object-cover"
                  />
                ) : resolvedAvatarUrl && !avatarImageError ? (
                  <img
                    src={resolvedAvatarUrl}
                    alt="current-avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand text-3xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-tertiary)]"
            >
              Choose image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                onAvatarFileChange(event.target.files?.[0] ?? null)
              }
            />

            <p className="mb-6 text-center text-xs text-[var(--text-muted)]">
              Supports JPG, PNG, GIF, WebP. Maximum size 5MB.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAvatarModal}
                className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={!avatarFile || uploadAvatarMutation.isPending}
                className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadAvatarMutation.isPending ? (
                  <Spinner size={14} />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  icon?: React.ReactNode;
  input?: React.ReactNode;
  error?: string;
}

function ProfileField({
  label,
  value,
  isEditing,
  icon,
  input,
  error,
}: ProfileFieldProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {icon}
        {label}
      </label>

      {isEditing ? (
        <div>
          {input}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <p className="font-medium text-[var(--text-primary)]">{value}</p>
      )}
    </div>
  );
}
