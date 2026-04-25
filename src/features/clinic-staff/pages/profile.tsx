import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AlertCircle,
  Building2,
  Calendar,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { formatDate, formatMonthYear } from '@/lib/date-utils';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import {
  useClinicStaffProfile,
  useUpdateClinicStaffProfile,
  useUploadClinicStaffAvatar,
} from '../hooks/useClinicStaffProfile';
import {
  clinicStaffProfileSchema,
  type ClinicStaffProfileFormData,
} from '../schemas/profile.schema';

const fieldInputClass =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/30';

export default function ClinicStaffProfilePage() {
  const { data: profile, isLoading, error } = useClinicStaffProfile();
  const updateMutation = useUpdateClinicStaffProfile();
  const uploadAvatarMutation = useUploadClinicStaffAvatar();

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
  } = useForm<ClinicStaffProfileFormData>({
    resolver: yupResolver(clinicStaffProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      citizenId: '',
      department: '',
      employeeCode: '',
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      gender: profile.gender ?? '',
      address: profile.address ?? '',
      citizenId: profile.citizenId ?? '',
      department: profile.department ?? '',
      employeeCode: profile.employeeCode ?? '',
    });
  }, [profile, reset]);

  useEffect(() => {
    setAvatarImageError(false);
  }, [profile?.avatarUrl]);

  const resolvedAvatarUrl = resolveAvatarUrl(profile?.avatarUrl);

  const onSubmit = (formData: ClinicStaffProfileFormData) => {
    updateMutation.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender:
          (formData.gender as
            | 'male'
            | 'female'
            | 'other'
            | 'prefernottotsay'
            | undefined) || undefined,
        address: formData.address || undefined,
        citizenId: formData.citizenId || undefined,
        department: formData.department || undefined,
        employeeCode: formData.employeeCode || undefined,
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
      <ClinicStaffLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size={36} />
        </div>
      </ClinicStaffLayout>
    );
  }

  if (error || !profile) {
    return (
      <ClinicStaffLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-medium text-[var(--text-primary)]">
            Could not load clinic staff profile
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {error?.message ?? 'Please try again later.'}
          </p>
        </div>
      </ClinicStaffLayout>
    );
  }

  return (
    <ClinicStaffLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
            Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your personal and clinic staff profile information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="medical-card">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-32 w-32 overflow-hidden rounded-full shadow-brand">
                  {resolvedAvatarUrl && !avatarImageError ? (
                    <img
                      src={resolvedAvatarUrl}
                      alt={profile.fullName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand text-4xl font-bold text-white">
                      {profile.fullName.charAt(0).toUpperCase()}
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
                {profile.fullName}
              </h2>
              <p className="mt-1 text-[var(--text-secondary)]">
                {profile.email}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {profile.subRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <hr className="my-6 w-full border-[var(--border-color)]" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Staff Code
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {profile.employeeCode || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Department
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {profile.department || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Member Since
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {formatMonthYear(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

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
                        fullName: profile.fullName ?? '',
                        phone: profile.phone ?? '',
                        dateOfBirth: profile.dateOfBirth
                          ? profile.dateOfBirth.split('T')[0]
                          : '',
                        gender: profile.gender ?? '',
                        address: profile.address ?? '',
                        citizenId: profile.citizenId ?? '',
                        department: profile.department ?? '',
                        employeeCode: profile.employeeCode ?? '',
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
                value={profile.fullName}
              />

              <ProfileField
                label="Email"
                icon={<Mail className="h-4 w-4" />}
                isEditing={false}
                value={profile.email}
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
                value={profile.phone || '—'}
              />

              <ProfileField
                label="Date of Birth"
                icon={<Calendar className="h-4 w-4" />}
                isEditing={isEditing}
                input={
                  <input
                    {...register('dateOfBirth')}
                    className={fieldInputClass}
                    type="date"
                  />
                }
                value={
                  profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'
                }
              />

              <ProfileField
                label="Gender"
                isEditing={isEditing}
                input={
                  <select {...register('gender')} className={fieldInputClass}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                }
                value={profile.gender || '—'}
              />

              <ProfileField
                label="Citizen ID"
                icon={<Shield className="h-4 w-4" />}
                isEditing={isEditing}
                error={errors.citizenId?.message}
                input={
                  <input
                    {...register('citizenId')}
                    className={fieldInputClass}
                    type="text"
                  />
                }
                value={profile.citizenId || '—'}
              />

              <ProfileField
                label="Department"
                icon={<Building2 className="h-4 w-4" />}
                isEditing={isEditing}
                error={errors.department?.message}
                input={
                  <input
                    {...register('department')}
                    className={fieldInputClass}
                    type="text"
                  />
                }
                value={profile.department || '—'}
              />

              <ProfileField
                label="Staff Code"
                isEditing={isEditing}
                error={errors.employeeCode?.message}
                input={
                  <input
                    {...register('employeeCode')}
                    className={fieldInputClass}
                    type="text"
                  />
                }
                value={profile.employeeCode || '—'}
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
                  value={profile.address || '—'}
                />
              </div>
            </div>
          </form>
        </div>
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
                    {profile.fullName.charAt(0).toUpperCase()}
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
    </ClinicStaffLayout>
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
