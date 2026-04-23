import { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Camera,
  Save,
  LogOut,
  MapPin,
  Phone,
  Shield,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import useAuthStore from '@/store/auth-store';
import Spinner from '@/components/ui/spinner';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import { extractApiErrorMessage } from '@/lib/api-error';
import { patientApi } from '@/features/patient/api/patient.api';
import { resolvePathWithLocale } from '@/i18n/middleware';

// Reuse profile schema or define a simple one here
const profileSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  phone: yup.string().optional(),
  dateOfBirth: yup.string().optional(),
  gender: yup.string().optional(),
  address: yup.string().optional(),
  citizenId: yup.string().optional(),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

export default function ForceUpdateProfilePage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  // Avatar upload state
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      citizenId: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName ?? '',
        // Other fields might not be in the initial user object from login
      });
    }
  }, [user, reset]);

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      // Update profile
      await patientApi.updateProfile({
        fullName: data.fullName,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: (data.gender as 'male' | 'female' | 'other') || undefined,
        address: data.address || undefined,
        citizenId: data.citizenId || undefined,
      });

      // If there's an avatar file, upload it
      if (avatarFile) {
        await patientApi.uploadAvatar(avatarFile);
      }

      toast.success(
        t(
          'AuthPages.forceUpdateProfile.success',
          'Profile updated successfully!'
        )
      );

      // Update local user state to clear the flag
      if (user) {
        setUser({
          ...user,
          fullName: data.fullName,
          mustUpdateProfile: false,
        });
      }

      // Navigate to appropriate dashboard
      const roles = user?.roles ?? [];
      if (roles.includes('SystemAdmin')) {
        navigate(resolvePathWithLocale('/system-admin/dashboard'));
      } else if (roles.includes('ClinicStaff')) {
        navigate(resolvePathWithLocale('/clinic-staff/dashboard'));
      } else if (roles.includes('Ophthalmologist')) {
        navigate(resolvePathWithLocale('/ophthalmologist/dashboard'));
      } else {
        navigate(resolvePathWithLocale('/patient/dashboard'));
      }
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          t('AuthPages.forceUpdateProfile.error', 'Failed to update profile')
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar handlers (simplified version of profile.tsx)
  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file.'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      setPreviewUrl(dataUrl);
      setAvatarFile(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      setPreviewUrl(dataUrl);
      setAvatarFile(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="AURA"
            className="mx-auto h-12 w-auto mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            {t('AuthPages.forceUpdateProfile.title', 'Complete Your Profile')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t(
              'AuthPages.forceUpdateProfile.subtitle',
              'Please provide some additional information to get started.'
            )}
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatarUrl && !avatarImageError ? (
                    <img
                      src={resolveAvatarUrl(user.avatarUrl)}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-slate-300 uppercase">
                      {user?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full shadow-lg hover:brightness-110 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="mt-2 text-xs text-slate-400">
                {t(
                  'AuthPages.forceUpdateProfile.avatarHint',
                  'Click to upload profile picture'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {t(
                    'AuthPages.forceUpdateProfile.fields.fullName',
                    'Full Name'
                  )}
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {t(
                    'AuthPages.forceUpdateProfile.fields.phone',
                    'Phone Number'
                  )}
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {t(
                    'AuthPages.forceUpdateProfile.fields.dob',
                    'Date of Birth'
                  )}
                </label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {t('AuthPages.forceUpdateProfile.fields.gender', 'Gender')}
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                >
                  <option value="">
                    {t(
                      'AuthPages.forceUpdateProfile.gender.placeholder',
                      'Select Gender'
                    )}
                  </option>
                  <option value="male">
                    {t('AuthPages.forceUpdateProfile.gender.male', 'Male')}
                  </option>
                  <option value="female">
                    {t('AuthPages.forceUpdateProfile.gender.female', 'Female')}
                  </option>
                  <option value="other">
                    {t('AuthPages.forceUpdateProfile.gender.other', 'Other')}
                  </option>
                </select>
              </div>

              {/* Citizen ID */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  {t(
                    'AuthPages.forceUpdateProfile.fields.citizenId',
                    'Citizen ID (CCCD)'
                  )}
                </label>
                <input
                  {...register('citizenId')}
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {t('AuthPages.forceUpdateProfile.fields.address', 'Address')}
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase tracking-wider text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t('AuthPages.forceUpdateProfile.actions.logout', 'Sign Out')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-brand text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-brand/20 uppercase tracking-wider text-sm"
              >
                {isLoading ? (
                  <>
                    <Spinner size={18} />
                    {t(
                      'AuthPages.forceUpdateProfile.actions.saving',
                      'Saving...'
                    )}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t(
                      'AuthPages.forceUpdateProfile.actions.complete',
                      'Complete Setup'
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
