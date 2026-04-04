import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Shield,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Award,
  Stethoscope,
  Building2,
  MapPin,
  ChevronRight,
  Edit3,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Globe,
  X,
} from 'lucide-react';
import {
  DoctorSidebar,
  DoctorHeader,
  UploadCredentialsModal,
} from '../components';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import useAuthStore from '@/store/auth-store';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Certificate {
  id: string;
  name: string;
  type: 'license' | 'degree' | 'certification';
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'verified' | 'pending' | 'expired';
  fileUrl?: string;
}

interface OphthalmologistProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  yearsOfExperience: number;
  specialty: string;
  hospital: string;
  department: string;
  address: string;
  isVerified: boolean;
  verifiedAt?: string;
  certificates: Certificate[];
  createdAt: string;
}

interface OphthalmologistProfileApi {
  id: string;
  userFullName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  userPhoneNumber?: string | null;
  userAddress?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  isVerified: boolean;
  createdAt: string;
  degrees: Array<{
    id: string;
    name: string;
    issuingAuthority?: string | null;
    issuedDate: string;
    degreeUrl?: string | null;
  }>;
  certificates: Array<{
    id: string;
    type?: string | null;
    name: string;
    issuingAuthority?: string | null;
    issuedDate: string;
    expiryDate?: string | null;
    isExpired: boolean;
  }>;
}

interface UpdateOphthalmologistProfilePayload {
  fullName: string;
  phone?: string;
  address?: string;
  bio?: string;
  yearsOfExperience: number;
}

interface UploadAvatarResponse {
  avatarUrl: string;
}

const DEFAULT_PROFILE: OphthalmologistProfile = {
  id: '',
  fullName: 'Unknown Doctor',
  email: 'N/A',
  phone: 'N/A',
  bio: 'No profile bio available.',
  yearsOfExperience: 0,
  specialty: 'Ophthalmologist',
  hospital: 'N/A',
  department: 'N/A',
  address: 'N/A',
  isVerified: false,
  certificates: [],
  createdAt: new Date().toISOString(),
};

const mapCertificateTypeFromApi = (
  value: string | null | undefined
): 'license' | 'degree' | 'certification' => {
  const normalized = (value ?? '').toLowerCase();

  if (normalized.includes('license')) return 'license';
  if (normalized.includes('degree')) return 'degree';
  return 'certification';
};

export default function SettingsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const toLocalizedPath = (pathname: string): string =>
    withLocalePathname(locale, pathname);
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showUploadCredentialsModal, setShowUploadCredentialsModal] =
    useState(false);
  const [credentialTab, setCredentialTab] = useState<'degree' | 'license'>(
    'degree'
  );
  const [avatarUrlOverride, setAvatarUrlOverride] = useState<string | null>(
    null
  );
  const [profileForm, setProfileForm] =
    useState<UpdateOphthalmologistProfilePayload>({
      fullName: '',
      phone: '',
      address: '',
      bio: '',
      yearsOfExperience: 0,
    });

  const profileQuery = useQuery({
    queryKey: ['ophthalmologist', 'me', 'profile'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OphthalmologistProfileApi>>(
        '/ophthalmologists/me'
      );
      return response.data.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateOphthalmologistProfilePayload) => {
      const response = await api.put<ApiResponse<OphthalmologistProfileApi>>(
        '/ophthalmologist/profile',
        payload
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['ophthalmologist', 'me', 'profile'],
        }),
      ]);
      setShowEditProfileModal(false);
      ophthalToast.success('Profile updated successfully.');
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; errors?: string[] } };
      };
      ophthalToast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.join(', ') ||
          'Unable to update profile right now. Please try again.'
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post<ApiResponse<UploadAvatarResponse>>(
        '/ophthalmologist/profile/avatar',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      return response.data.data;
    },
    onSuccess: async (data) => {
      setAvatarUrlOverride(data.avatarUrl);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      ophthalToast.success('Avatar uploaded successfully.');
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; errors?: string[] } };
      };

      ophthalToast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.join(', ') ||
          'Unable to upload avatar right now. Please try again.'
      );
    },
  });

  const displayAvatarUrl =
    avatarUrlOverride ?? profileQuery.data?.userAvatarUrl ?? user?.avatarUrl;

  const profile = useMemo<OphthalmologistProfile>(() => {
    const profileData = profileQuery.data;

    if (!user && !profileData) return DEFAULT_PROFILE;

    return {
      id: profileData?.id ?? user?.roleId ?? user?.id ?? '',
      fullName:
        profileData?.userFullName ??
        user?.fullName ??
        t('Ophthalmologist.settings.defaults.unknownDoctor', 'Unknown Doctor'),
      email: profileData?.userEmail ?? user?.email ?? 'N/A',
      phone: profileData?.userPhoneNumber ?? 'N/A',
      bio:
        profileData?.bio?.trim() ||
        t(
          'Ophthalmologist.settings.defaults.noBio',
          'No profile bio available.'
        ),
      yearsOfExperience: profileData?.yearsOfExperience ?? 0,
      specialty: t('Ophthalmologist.common.role', 'Ophthalmologist'),
      hospital: user?.organizationId ?? 'N/A',
      department: 'N/A',
      address: profileData?.userAddress ?? 'N/A',
      isVerified: profileData?.isVerified ?? Boolean(user?.isVerified),
      createdAt: profileData?.createdAt ?? new Date().toISOString(),
      certificates: [
        ...(profileData?.degrees ?? []).map((degree) => ({
          id: degree.id,
          name: degree.name,
          type: 'degree' as const,
          issuedBy: degree.issuingAuthority ?? 'N/A',
          issuedDate: degree.issuedDate,
          status: 'verified' as const,
          fileUrl: degree.degreeUrl ?? undefined,
        })),
        ...(profileData?.certificates ?? []).map((cert) => ({
          id: cert.id,
          name: cert.name,
          type: mapCertificateTypeFromApi(cert.type ?? cert.name),
          issuedBy: cert.issuingAuthority ?? 'N/A',
          issuedDate: cert.issuedDate,
          expiryDate: cert.expiryDate ?? undefined,
          status: cert.isExpired ? ('expired' as const) : ('verified' as const),
        })),
      ],
    };
  }, [profileQuery.data, t, user]);

  const handleLanguageChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;

    persistLocale(nextLocale);
    void i18n.changeLanguage(nextLocale);

    const localizedPath = withLocalePathname(nextLocale, location.pathname);
    navigate(`${localizedPath}${location.search}${location.hash}`);
  };

  useEffect(() => {
    if (!showEditProfileModal) return;

    setProfileForm({
      fullName: profile.fullName === 'Unknown Doctor' ? '' : profile.fullName,
      phone: profile.phone === 'N/A' ? '' : profile.phone,
      address: profile.address === 'N/A' ? '' : profile.address,
      bio: profile.bio === 'No profile bio available.' ? '' : profile.bio,
      yearsOfExperience: profile.yearsOfExperience,
    });
  }, [profile, showEditProfileModal]);

  const handleUpdateProfile = () => {
    if (!profileForm.fullName.trim()) {
      ophthalToast.error('Full name is required.');
      return;
    }

    updateProfileMutation.mutate({
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone?.trim() || undefined,
      address: profileForm.address?.trim() || undefined,
      bio: profileForm.bio?.trim() || undefined,
      yearsOfExperience: Number(profileForm.yearsOfExperience) || 0,
    });
  };

  const handleAvatarUploadClick = () => {
    if (uploadAvatarMutation.isPending) return;
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      ophthalToast.error('Invalid file type. Supported: JPG, PNG, GIF, WebP');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      ophthalToast.error('File must be smaller than 5MB');
      event.target.value = '';
      return;
    }

    uploadAvatarMutation.mutate(file, {
      onSettled: () => {
        event.target.value = '';
      },
    });
  };

  const getStatusBadge = (status: 'verified' | 'pending' | 'expired') => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />{' '}
            {t(
              'Ophthalmologist.settings.credentials.status.verified',
              'Verified'
            )}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />{' '}
            {t(
              'Ophthalmologist.settings.credentials.status.pending',
              'Pending'
            )}
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />{' '}
            {t(
              'Ophthalmologist.settings.credentials.status.expired',
              'Expired'
            )}
          </span>
        );
    }
  };

  const getCertificateIcon = (type: 'license' | 'degree' | 'certification') => {
    switch (type) {
      case 'license':
        return Shield;
      case 'degree':
        return Award;
      case 'certification':
        return FileText;
    }
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.settings.pageTitle', 'Settings')}
        />

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Credentials */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.settings.profile.title',
                      'Profile Information'
                    )}
                  </h2>
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('Ophthalmologist.settings.profile.edit', 'Edit Profile')}
                  </button>
                </div>

                <div className="p-6">
                  {/* Avatar & Verification Status */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                        {displayAvatarUrl ? (
                          <img
                            src={displayAvatarUrl}
                            alt={profile.fullName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          profile.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                        )}
                      </div>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />
                      <button
                        type="button"
                        onClick={handleAvatarUploadClick}
                        disabled={uploadAvatarMutation.isPending}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2d4a6f] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                        title={
                          uploadAvatarMutation.isPending
                            ? 'Uploading avatar...'
                            : 'Upload avatar'
                        }
                      >
                        <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.fullName}
                        </h3>
                        {profile.isVerified && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />{' '}
                            {t(
                              'Ophthalmologist.settings.profile.verifiedPractitioner',
                              'Verified Practitioner'
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        {profile.specialty} • {profile.yearsOfExperience}{' '}
                        {t(
                          'Ophthalmologist.settings.profile.experienceSuffix',
                          'years experience'
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {t(
                          'Ophthalmologist.settings.profile.memberSince',
                          'Member since'
                        )}{' '}
                        {new Date(profile.createdAt).toLocaleDateString(
                          dateLocale,
                          { month: 'long', year: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.email',
                            'Email Address'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.phone',
                            'Phone Number'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.experience',
                            'Years of Experience'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.yearsOfExperience}{' '}
                          {t('Ophthalmologist.settings.profile.years', 'years')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.specialty',
                            'Specialty'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.hospital',
                            'Hospital / Clinic'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.hospital}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t(
                            'Ophthalmologist.settings.profile.address',
                            'Address'
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t(
                        'Ophthalmologist.settings.profile.bio',
                        'Bio / Description'
                      )}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Credentials Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.settings.credentials.title',
                      'Medical Credentials'
                    )}
                  </h2>
                  <button
                    onClick={() => setShowUploadCredentialsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {t(
                      'Ophthalmologist.settings.credentials.upload',
                      'Upload Certificate'
                    )}
                  </button>
                </div>

                {/* Credential Tabs */}
                <div className="flex border-b border-gray-200 dark:border-[#1e3a5f]">
                  <button
                    onClick={() => setCredentialTab('degree')}
                    className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                      credentialTab === 'degree'
                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    {t(
                      'Ophthalmologist.settings.credentials.degrees',
                      'Bằng cấp học vị'
                    )}
                  </button>
                  <button
                    onClick={() => setCredentialTab('license')}
                    className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                      credentialTab === 'license'
                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    {t(
                      'Ophthalmologist.settings.credentials.licenses',
                      'Chứng chỉ hành nghề'
                    )}
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {profile.certificates.filter(
                    (cert) => cert.type === credentialTab
                  ).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {credentialTab === 'degree'
                          ? t(
                              'Ophthalmologist.settings.credentials.noDegrees',
                              'No degrees uploaded yet'
                            )
                          : t(
                              'Ophthalmologist.settings.credentials.noLicenses',
                              'No licenses uploaded yet'
                            )}
                      </p>
                      <button
                        onClick={() => setShowUploadCredentialsModal(true)}
                        className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                      >
                        +{' '}
                        {t(
                          'Ophthalmologist.settings.credentials.addNow',
                          'Add now'
                        )}
                      </button>
                    </div>
                  ) : (
                    profile.certificates
                      .filter((cert) => cert.type === credentialTab)
                      .map((cert) => {
                        const CertIcon = getCertificateIcon(cert.type);
                        return (
                          <div
                            key={cert.id}
                            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] transition-colors group"
                          >
                            <div className="w-12 h-12 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f] rounded-lg flex items-center justify-center shrink-0">
                              <CertIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {cert.name}
                                </h4>
                                {getStatusBadge(cert.status)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {t(
                                  'Ophthalmologist.settings.credentials.issuedBy',
                                  'Issued by'
                                )}{' '}
                                {cert.issuedBy}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span>
                                  {t(
                                    'Ophthalmologist.settings.credentials.issued',
                                    'Issued'
                                  )}
                                  :{' '}
                                  {new Date(
                                    cert.issuedDate
                                  ).toLocaleDateString()}
                                </span>
                                {cert.expiryDate && (
                                  <span>
                                    {t(
                                      'Ophthalmologist.settings.credentials.expires',
                                      'Expires'
                                    )}
                                    :{' '}
                                    {new Date(
                                      cert.expiryDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-lg transition-all">
                              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Settings */}
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.settings.accountSettings.title',
                      'Account Settings'
                    )}
                  </h2>
                </div>

                <div className="p-4 space-y-2">
                  <Link
                    to={toLocalizedPath('/forgot-password')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.accountSettings.security',
                            'Security'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.settings.accountSettings.securityHint',
                            'Reset password & 2FA'
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </Link>

                  <div className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.accountSettings.language',
                            'Language'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {locale === 'vi'
                            ? t(
                                'Ophthalmologist.settings.accountSettings.languageVi',
                                'Tiếng Việt (VN)'
                              )
                            : t(
                                'Ophthalmologist.settings.accountSettings.languageEn',
                                'English (US)'
                              )}
                        </p>
                      </div>
                    </div>
                    <select
                      value={locale}
                      onChange={(event) =>
                        handleLanguageChange(event.target.value as AppLocale)
                      }
                      className="min-w-36 px-3 py-2 bg-white dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="vi">
                        {t(
                          'Ophthalmologist.settings.accountSettings.languageVi',
                          'Tiếng Việt (VN)'
                        )}
                      </option>
                      <option value="en">
                        {t(
                          'Ophthalmologist.settings.accountSettings.languageEn',
                          'English (US)'
                        )}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.settings.appearance.title',
                      'Appearance'
                    )}
                  </h2>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.appearance.darkMode',
                            'Dark Mode'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {theme === 'dark'
                            ? t(
                                'Ophthalmologist.settings.appearance.currentlyOn',
                                'Currently on'
                              )
                            : t(
                                'Ophthalmologist.settings.appearance.currentlyOff',
                                'Currently off'
                              )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(
                      'Ophthalmologist.settings.notifications.title',
                      'Notifications'
                    )}
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.notifications.email',
                            'Email'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.settings.notifications.emailHint',
                            'Receive via email'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        emailNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          emailNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.notifications.push',
                            'Push'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.settings.notifications.pushHint',
                            'Browser notifications'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        pushNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          pushNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Appointment Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(
                            'Ophthalmologist.settings.notifications.reminders',
                            'Reminders'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(
                            'Ophthalmologist.settings.notifications.remindersHint',
                            'Appointment alerts'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setAppointmentReminders(!appointmentReminders)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        appointmentReminders ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          appointmentReminders ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
                <div className="p-6 border-b border-red-200 dark:border-red-900/30">
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {t(
                      'Ophthalmologist.settings.dangerZone.title',
                      'Danger Zone'
                    )}
                  </h2>
                </div>

                <div className="p-4">
                  <button className="w-full p-4 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors text-left">
                    <p className="font-medium">
                      {t(
                        'Ophthalmologist.settings.dangerZone.deactivate',
                        'Deactivate Account'
                      )}
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                      {t(
                        'Ophthalmologist.settings.dangerZone.description',
                        'Temporarily disable your account'
                      )}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditProfileModal(false)}
          />
          <div className="relative bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-2xl mx-4 p-6 shadow-2xl border border-gray-200 dark:border-[#1e3a5f]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Profile Information
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone ?? ''}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  value={profileForm.yearsOfExperience}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      yearsOfExperience: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profileForm.address ?? ''}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio / Description
              </label>
              <textarea
                rows={4}
                value={profileForm.bio ?? ''}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-[#1e3a5f] hover:bg-gray-200 dark:hover:bg-[#2d4a6f] text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      <UploadCredentialsModal
        isOpen={showUploadCredentialsModal}
        onClose={() => setShowUploadCredentialsModal(false)}
        ophthalmologistId={profile.id}
      />
    </div>
  );
}
