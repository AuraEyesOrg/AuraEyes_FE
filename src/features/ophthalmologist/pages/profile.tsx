import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  AlertCircle,
  Award,
  Calendar,
  Camera,
  Edit2,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import Spinner from '@/components/ui/spinner';
import { formatMonthYear, formatShortDate } from '@/lib/date-utils';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import useAuthStore from '@/store/auth-store';
import {
  DoctorSidebar,
  DoctorHeader,
  UploadCredentialsModal,
} from '../components';
import {
  useOphthalmologistProfile,
  useUpdateOphthalmologistProfile,
  useUploadOphthalmologistAvatar,
  useDeleteCertificate,
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
    .nullable()
    .default('')
    .max(1000, 'Validation.MaxLength.Bio'),
  citizenId: yup
    .string()
    .optional()
    .nullable()
    .default('')
    .max(20, 'Validation.MaxLength.CitizenId'),
  gender: yup.number().optional().nullable().default(1),
  dateOfBirth: yup.string().optional().nullable().default(''),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

const fieldInputClass =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/30';

export default function OphthalmologistProfilePage() {
  const { t } = useSafeTranslation();
  const { data: profileData, isLoading, error } = useOphthalmologistProfile();
  const updateMutation = useUpdateOphthalmologistProfile();
  const uploadAvatarMutation = useUploadOphthalmologistAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteCertMutation = useDeleteCertificate();

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      bio: '',
      citizenId: '',
      gender: 1,
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (!profileData) return;

    reset({
      fullName: profileData.userFullName ?? '',
      phone: profileData.userPhoneNumber ?? '',
      address: profileData.userAddress ?? '',
      bio: profileData.bio ?? '',
      citizenId: profileData.userCitizenId ?? '',
      gender: profileData.userGender ?? 1,
      dateOfBirth: profileData.userDateOfBirth
        ? profileData.userDateOfBirth.split('T')[0]
        : '',
    });
  }, [profileData, reset]);

  useEffect(() => {
    setAvatarImageError(false);
  }, [profileData?.userAvatarUrl]);

  const { user } = useAuthStore();
  const resolvedAvatarUrl = resolveAvatarUrl(
    profileData?.userAvatarUrl,
    user?.avatarUrl
  );
  const displayName = profileData?.userFullName ?? user?.fullName ?? '';

  const [showAllDegrees, setShowAllDegrees] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getDocumentThumbnail = (url: string | null | undefined) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    // Cloudinary PDF to JPG thumbnail trick
    if (lowerUrl.endsWith('.pdf')) {
      return url.replace(/\.pdf$/i, '.jpg');
    }
    return url;
  };

  const onSubmit = (formData: ProfileFormData) => {
    updateMutation.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        citizenId: formData.citizenId,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      },
      {
        onSuccess: (data) => {
          if (data) {
            toast.success(t('Ophthalmologist.profile.toast.profileUpdated', 'Profile updated successfully'));
            setIsEditing(false);
          }
        },
        onError: (err) => {
          toast.error(extractApiErrorMessage(err, t('Ophthalmologist.profile.toast.profileUpdateFailed', 'Failed to update profile')));
        },
      }
    );
  };

  const onAvatarFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('Ophthalmologist.profile.toast.chooseImage', 'Please choose an image file'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('Ophthalmologist.profile.toast.imageSize', 'Image must be smaller than 5MB'));
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveAvatar = () => {
    if (!avatarFile) return;

    uploadAvatarMutation.mutate(avatarFile, {
      onSuccess: () => {
        toast.success(t('Ophthalmologist.profile.toast.avatarUpdated', 'Avatar updated successfully'));
        setShowAvatarModal(false);
        setAvatarFile(null);
        setPreviewUrl(null);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err, t('Ophthalmologist.profile.toast.avatarUploadFailed', 'Failed to upload avatar')));
      },
    });
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setAvatarFile(null);
    setPreviewUrl(null);
  };

  const handleDeleteCertificate = (certId: string, certName: string) => {
    if (window.confirm(t('Ophthalmologist.profile.confirm.deleteCertificate', `Are you sure you want to delete "${certName}"?`))) {
      deleteCertMutation.mutate(certId, {
        onSuccess: () => {
          toast.success(t('Ophthalmologist.profile.toast.certificateDeleted', 'Certificate deleted successfully'));
        },
        onError: (err) => {
          toast.error(t('Ophthalmologist.profile.toast.certificateDeleteFailed', 'Failed to delete certificate'));
        },
      });
    }
  };

  const handleCloseCredentialsModal = () => {
    setShowCredentialsModal(false);
    setEditingCredential(null);
  };

  const handleEditCredential = (cert: any, type: 'Degree' | 'License') => {
    setEditingCredential({ ...cert, type });
    setShowCredentialsModal(true);
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
                      className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-tertiary)]"
                    >
                      <Edit2 className="h-4 w-4" />
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
                            citizenId: profileData.userCitizenId ?? '',
                            gender: profileData.userGender ?? 1,
                            dateOfBirth: profileData.userDateOfBirth
                              ? profileData.userDateOfBirth.split('T')[0]
                              : '',
                          });
                        }}
                        className="px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending || !isDirty}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
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

                  <ProfileField
                    label="Citizen ID"
                    icon={<FileText className="h-4 w-4" />}
                    isEditing={isEditing}
                    error={errors.citizenId?.message}
                    input={
                      <input
                        {...register('citizenId')}
                        className={fieldInputClass}
                        type="text"
                      />
                    }
                    value={profileData.userCitizenId || '—'}
                  />

                  <ProfileField
                    label="Gender"
                    icon={<User className="h-4 w-4" />}
                    isEditing={isEditing}
                    error={errors.gender?.message}
                    input={
                      <select
                        {...register('gender')}
                        className={fieldInputClass}
                      >
                        <option value={1}>Male</option>
                        <option value={2}>Female</option>
                        <option value={3}>Other</option>
                      </select>
                    }
                    value={
                      profileData.userGender === 1
                        ? 'Male'
                        : profileData.userGender === 2
                          ? 'Female'
                          : 'Other'
                    }
                  />

                  <ProfileField
                    label="Date of Birth"
                    icon={<Calendar className="h-4 w-4" />}
                    isEditing={isEditing}
                    error={errors.dateOfBirth?.message}
                    input={
                      <input
                        {...register('dateOfBirth')}
                        className={fieldInputClass}
                        type="date"
                      />
                    }
                    value={
                      profileData.userDateOfBirth
                        ? formatShortDate(profileData.userDateOfBirth)
                        : '—'
                    }
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

              {/* Professional Credentials Section */}
              <div className="lg:col-span-3">
                <div className="mb-4 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-brand" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      Professional Credentials
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCredentialsModal(true)}
                    className="flex items-center gap-1 text-sm font-medium text-brand transition hover:text-brand/80"
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Degrees */}
                  <div className="medical-card">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                        <Award className="h-4 w-4 text-brand" />
                        Medical Degrees
                      </h3>
                      {profileData.degrees &&
                        profileData.degrees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowAllDegrees(!showAllDegrees)}
                            className="text-xs font-medium text-brand transition hover:underline"
                          >
                            {showAllDegrees ? 'Show Less' : 'See All'}
                          </button>
                        )}
                    </div>

                    <div className="space-y-4">
                      {profileData.degrees && profileData.degrees.length > 0 ? (
                        (showAllDegrees
                          ? profileData.degrees
                          : profileData.degrees.slice(0, 1)
                        ).map((degree) => (
                          <div
                            key={degree.id}
                            className="group relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition hover:border-brand/30"
                          >
                            <div className="flex flex-col sm:flex-row">
                              {degree.degreeUrl && (
                                <a
                                  href={degree.degreeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-32 w-full shrink-0 sm:h-auto sm:w-24 group/img relative overflow-hidden"
                                  onClick={(e) => {
                                    if (
                                      !degree.degreeUrl
                                        ?.toLowerCase()
                                        .endsWith('.pdf')
                                    ) {
                                      e.preventDefault();
                                      setSelectedImage(
                                        degree.degreeUrl ?? null
                                      );
                                    }
                                  }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                    <FileText className="h-8 w-8 text-gray-400 opacity-20" />
                                  </div>
                                  <img
                                    src={
                                      getDocumentThumbnail(degree.degreeUrl) ??
                                      ''
                                    }
                                    alt={degree.name}
                                    className="relative z-10 h-full w-full object-cover opacity-90 transition group-hover/img:opacity-100 group-hover/img:scale-105"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 opacity-0 transition group-hover/img:opacity-100">
                                    <Eye className="h-5 w-5 text-white" />
                                  </div>
                                </a>
                              )}
                              <div className="flex flex-1 items-start justify-between p-4">
                                <div className="flex-1">
                                  <p className="font-bold text-[var(--text-primary)]">
                                    {degree.name}
                                  </p>
                                  <p className="text-sm text-brand">
                                    {degree.issuingAuthority}
                                  </p>
                                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Issued:{' '}
                                      {formatShortDate(degree.issuedDate)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    title="Edit"
                                    onClick={() =>
                                      handleEditCredential(degree, 'Degree')
                                    }
                                    className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-brand/10 hover:text-brand"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() =>
                                      handleDeleteCertificate(
                                        degree.id,
                                        degree.name
                                      )
                                    }
                                    disabled={deleteCertMutation.isPending}
                                    className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-secondary)]">
                          <GraduationCap className="mb-2 h-8 w-8 opacity-20" />
                          <p className="text-sm italic">No degrees listed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Licenses & Certificates */}
                  <div className="medical-card">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                        <FileText className="h-4 w-4 text-brand" />
                        Professional Licenses
                      </h3>
                      {profileData.certificates &&
                        profileData.certificates.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowAllCertificates(!showAllCertificates)
                            }
                            className="text-xs font-medium text-brand transition hover:underline"
                          >
                            {showAllCertificates ? 'Show Less' : 'See All'}
                          </button>
                        )}
                    </div>

                    <div className="space-y-4">
                      {profileData.certificates &&
                      profileData.certificates.length > 0 ? (
                        (showAllCertificates
                          ? profileData.certificates
                          : profileData.certificates.slice(0, 1)
                        ).map((cert) => (
                          <div
                            key={cert.id}
                            className="group relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition hover:border-brand/30"
                          >
                            <div className="flex flex-col sm:flex-row">
                              {cert.certificateUrl && (
                                <a
                                  href={cert.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-32 w-full shrink-0 sm:h-auto sm:w-24 group/img relative overflow-hidden"
                                  onClick={(e) => {
                                    if (
                                      !cert.certificateUrl
                                        ?.toLowerCase()
                                        .endsWith('.pdf')
                                    ) {
                                      e.preventDefault();
                                      setSelectedImage(
                                        cert.certificateUrl ?? null
                                      );
                                    }
                                  }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                    <FileText className="h-8 w-8 text-gray-400 opacity-20" />
                                  </div>
                                  <img
                                    src={
                                      getDocumentThumbnail(
                                        cert.certificateUrl
                                      ) ?? ''
                                    }
                                    alt={cert.name}
                                    className="relative z-10 h-full w-full object-cover opacity-90 transition group-hover/img:opacity-100 group-hover/img:scale-105"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 opacity-0 transition group-hover/img:opacity-100">
                                    <Eye className="h-5 w-5 text-white" />
                                  </div>
                                </a>
                              )}
                              <div className="flex flex-1 items-start justify-between p-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-[var(--text-primary)]">
                                      {cert.name}
                                    </p>
                                    {cert.isExpired && (
                                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                                        EXPIRED
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-brand">
                                    {cert.issuingAuthority}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Issued: {formatShortDate(cert.issuedDate)}
                                    </span>
                                    {cert.expiryDate && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Expires:{' '}
                                        {formatShortDate(cert.expiryDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    title="Edit"
                                    onClick={() =>
                                      handleEditCredential(cert, 'License')
                                    }
                                    className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-brand/10 hover:text-brand"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() =>
                                      handleDeleteCertificate(
                                        cert.id,
                                        cert.name
                                      )
                                    }
                                    disabled={deleteCertMutation.isPending}
                                    className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-secondary)]">
                          <Award className="mb-2 h-8 w-8 opacity-20" />
                          <p className="text-sm italic">No licenses listed</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                    src={previewUrl ?? undefined}
                    alt="avatar-preview"
                    className="h-full w-full object-cover"
                  />
                ) : resolvedAvatarUrl && !avatarImageError ? (
                  <img
                    src={resolvedAvatarUrl ?? undefined}
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

      <UploadCredentialsModal
        isOpen={showCredentialsModal}
        onClose={handleCloseCredentialsModal}
        ophthalmologistId={profileData.id}
        editingCredential={editingCredential}
      />

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-6 top-6 text-white/70 hover:text-white"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Credential"
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
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
