import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  User,
  Phone,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Heart,
  IdCard,
  Building2,
  CircleUser,
  Trash2,
  Plus,
  FileText,
  Award,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { useLocalePath } from '@/i18n/locales';
import {
  onboardOphthalmologist,
  onboardClinicStaff,
  changePassword,
} from '../api';
import type { ForceUpdateProfileRequest } from '../types';
import useAuthStore from '@/store/auth-store';

type DegreeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const DEGREE_LEVEL_OPTIONS: Array<{ value: DegreeLevel; label: string }> = [
  { value: 3, label: 'Cử nhân (Bachelor)' },
  { value: 4, label: 'Thạc sĩ (Master)' },
  { value: 5, label: 'Tiến sĩ (Doctor/PhD)' },
  { value: 6, label: 'Phó Giáo sư (Assoc. Prof)' },
  { value: 7, label: 'Giáo sư (Professor)' },
  { value: 1, label: 'BSCKI' },
  { value: 2, label: 'BSCKII' },
  { value: 8, label: 'Bác sĩ nội trú (Resident)' },
];

interface DegreeItem {
  name: string;
  degreeLevel: DegreeLevel;
  issuingInstitution: string;
  issuedDate: string;
  file?: FileList;
}

interface CertificateItem {
  name: string;
  licenseNumber: string;
  issuingAuthority: string;
  scopeOfPractice: string;
  issuedDate: string;
  expiryDate: string;
  file?: FileList;
}

interface OnboardingFormData extends ForceUpdateProfileRequest {
  confirmPassword?: string;
  degrees: DegreeItem[];
  certificates: CertificateItem[];
}

const STEPS = [
  { id: 'security', icon: Lock },
  { id: 'personal', icon: User },
  { id: 'professional', icon: Briefcase },
];

const WelcomeOnboardingPage = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const toLocalizedPath = useLocalePath();
  const { user, setUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isOphthalmologist = user?.roles?.includes('Ophthalmologist');
  const isStaff = user?.roles?.includes('ClinicStaff');
  const filteredSteps = isStaff
    ? STEPS.filter((s) => s.id !== 'professional')
    : STEPS;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    defaultValues: {
      fullName: user?.fullName || '',
      gender: 1,
      degrees: [
        { name: '', degreeLevel: 3, issuingInstitution: '', issuedDate: '' },
      ],
      certificates: [
        {
          name: '',
          licenseNumber: '',
          issuingAuthority: '',
          scopeOfPractice: '',
          issuedDate: '',
          expiryDate: '',
        },
      ],
    },
    mode: 'onBlur',
  });

  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree,
  } = useFieldArray({
    control,
    name: 'degrees',
  });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control,
    name: 'certificates',
  });

  const selectedGender = watch('gender');

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['currentPassword', 'newPassword', 'confirmPassword'];
    } else if (currentStep === 1) {
      fieldsToValidate = [
        'fullName',
        'phone',
        'dateOfBirth',
        'gender',
        'citizenId',
        'address',
      ];
    } else if (currentStep === 2) {
      if (isOphthalmologist) {
        fieldsToValidate = ['bio'];
        // Also validate that if degrees are added, they have names
        degreeFields.forEach((_, idx) => {
          fieldsToValidate.push(
            `degrees.${idx}.name`,
            `degrees.${idx}.degreeLevel`,
            `degrees.${idx}.issuedDate`
          );
        });
        certificateFields.forEach((_, idx) => {
          fieldsToValidate.push(
            `certificates.${idx}.name`,
            `certificates.${idx}.issuedDate`
          );
        });
      } else {
        fieldsToValidate = ['department', 'employeeCode'];
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    if (currentStep === 0 && !isPasswordChanged) {
      setIsLoading(true);
      try {
        const passwordData = watch(['currentPassword', 'newPassword']);
        await changePassword({
          currentPassword: passwordData[0]!,
          newPassword: passwordData[1]!,
        });
        setIsPasswordChanged(true);
        toast.success(
          t(
            'AuthPages.onboarding.security.success',
            'Password changed successfully!'
          )
        );
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            t(
              'AuthPages.onboarding.security.error',
              'Invalid current password.'
            )
        );
        return;
      } finally {
        setIsLoading(false);
      }
    }

    setCurrentStep((prev: number) =>
      Math.min(prev + 1, filteredSteps.length - 1)
    );
  };

  const prevStep = () => {
    setCurrentStep((prev: number) => prev - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsLoading(true);

      if (isOphthalmologist) {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('phone', data.phone || '');
        formData.append('address', data.address || '');
        formData.append(
          'dateOfBirth',
          data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : ''
        );
        formData.append('gender', String(data.gender || 1));
        formData.append('citizenId', data.citizenId || '');
        formData.append('bio', data.bio || '');

        data.degrees.forEach((item, index) => {
          formData.append(`Degrees[${index}].Name`, item.name);
          formData.append(
            `Degrees[${index}].DegreeLevel`,
            String(item.degreeLevel)
          );
          formData.append(
            `Degrees[${index}].IssuingInstitution`,
            item.issuingInstitution || ''
          );
          formData.append(
            `Degrees[${index}].IssuedDate`,
            item.issuedDate ? new Date(item.issuedDate).toISOString() : ''
          );
          if (item.file && item.file[0]) {
            formData.append(`Degrees[${index}].File`, item.file[0]);
          }
        });

        data.certificates.forEach((item, index) => {
          formData.append(`Licenses[${index}].Name`, item.name);
          formData.append(
            `Licenses[${index}].LicenseNumber`,
            item.licenseNumber || ''
          );
          formData.append(
            `Licenses[${index}].IssuingAuthority`,
            item.issuingAuthority || ''
          );
          formData.append(
            `Licenses[${index}].ScopeOfPractice`,
            item.scopeOfPractice || ''
          );
          formData.append(
            `Licenses[${index}].IssuedDate`,
            item.issuedDate ? new Date(item.issuedDate).toISOString() : ''
          );
          if (item.expiryDate) {
            formData.append(
              `Licenses[${index}].ExpirationDate`,
              new Date(item.expiryDate).toISOString()
            );
          }
          if (item.file && item.file[0]) {
            formData.append(`Licenses[${index}].File`, item.file[0]);
          }
        });

        await onboardOphthalmologist(formData);
      } else if (isStaff) {
        const staffPayload = {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString()
            : undefined,
          gender: Number(data.gender || 1),
          citizenId: data.citizenId,
        };
        await onboardClinicStaff(staffPayload);
      }

      toast.success(
        t(
          'AuthPages.onboarding.submit.success',
          'Profile completed successfully!'
        )
      );

      if (user) {
        setUser({ ...user, mustUpdateProfile: false });
        const dashboardPath = isOphthalmologist
          ? '/ophthalmologist/dashboard'
          : '/clinic-staff/dashboard';
        navigate(toLocalizedPath(dashboardPath));
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          t('AuthPages.onboarding.error', 'Failed to complete setup.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
        input::-webkit-contacts-auto-fill-button,
        input::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
          position: absolute;
          right: 0;
        }
      `}</style>

      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden relative z-10">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 flex">
          {filteredSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-full transition-all duration-500 ease-out ${
                idx <= currentStep ? 'bg-emerald-500' : 'bg-transparent'
              }`}
              style={{ width: `${100 / filteredSteps.length}%` }}
            />
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl mb-3 ring-1 ring-emerald-500/20 scale-75">
              <AuraLogo size="sm" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
              {t(
                'AuthPages.onboarding.title',
                'Welcome to AURA Digital Clinic'
              )}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              {t(
                'AuthPages.onboarding.subtitle_unified',
                'Để bảo mật tài khoản, vui lòng đổi mật khẩu và hoàn thiện hồ sơ chuyên môn của bạn.'
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            {filteredSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center group">
                <div
                  className={`w-8 h-8 rounded-[0.75rem] flex items-center justify-center transition-all duration-500 ${
                    idx === currentStep
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-500/20'
                      : idx < currentStep
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  <step.icon size={14} />
                </div>
                {idx < filteredSteps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 rounded-full transition-all duration-500 ${idx < currentStep ? 'bg-emerald-500 shadow-sm' : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step-security"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Lock size={12} />{' '}
                        {t(
                          'AuthPages.onboarding.form.currentPassword',
                          'Current Password'
                        )}
                      </label>
                      <div className="relative group">
                        <input
                          {...register('currentPassword', {
                            required: t(
                              'AuthPages.onboarding.validation.currentPasswordRequired',
                              'Current password is required'
                            ),
                          })}
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.currentPassword?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Lock size={12} />{' '}
                        {t(
                          'AuthPages.onboarding.form.newPassword',
                          'New Password'
                        )}
                      </label>
                      <div className="relative group">
                        <input
                          {...register('newPassword', {
                            required: t(
                              'AuthPages.onboarding.validation.passwordRequired',
                              'Password is required'
                            ),
                            minLength: {
                              value: 8,
                              message: t(
                                'AuthPages.onboarding.validation.passwordMin',
                                'Minimum 8 characters'
                              ),
                            },
                          })}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.newPassword?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircle size={12} />{' '}
                        {t(
                          'AuthPages.onboarding.form.confirmPassword',
                          'Confirm New Password'
                        )}
                      </label>
                      <div className="relative group">
                        <input
                          {...register('confirmPassword', {
                            required: t(
                              'AuthPages.onboarding.validation.confirmPasswordRequired',
                              'Please confirm your password'
                            ),
                            validate: (val) =>
                              val === watch('newPassword') ||
                              t(
                                'AuthPages.onboarding.validation.passwordMismatch',
                                'Passwords do not match'
                              ),
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[10px] text-red-500 ml-1">
                          {errors.confirmPassword?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step-personal"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User size={12} />{' '}
                        {t('AuthPages.onboarding.form.fullName', 'Full Name')}
                      </label>
                      <input
                        {...register('fullName', { required: true })}
                        className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                        placeholder="Dr. John Doe"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone size={12} />{' '}
                        {t('AuthPages.onboarding.form.phone', 'Phone Number')}
                      </label>
                      <input
                        {...register('phone', { required: true })}
                        className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                        placeholder="+84 123 456 789"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <IdCard size={12} />{' '}
                        {t(
                          'AuthPages.onboarding.form.citizenId',
                          'Citizen ID (CCCD)'
                        )}
                      </label>
                      <input
                        {...register('citizenId', { required: true })}
                        className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                        placeholder="012345678901"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar size={12} />{' '}
                        {t('AuthPages.onboarding.form.dob', 'Date of Birth')}
                      </label>
                      <input
                        {...register('dateOfBirth', { required: true })}
                        type="date"
                        className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CircleUser size={12} />{' '}
                        {t('AuthPages.onboarding.form.gender', 'Gender')}
                      </label>
                      <div className="flex gap-1">
                        {[
                          { value: 1, label: t('Shared.gender.male', 'Male') },
                          {
                            value: 2,
                            label: t('Shared.gender.female', 'Female'),
                          },
                          {
                            value: 3,
                            label: t('Shared.gender.other', 'Other'),
                          },
                        ].map((g) => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setValue('gender', g.value as any)}
                            className={`flex-1 py-1 px-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                              Number(selectedGender) === g.value
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                : 'bg-gray-50 dark:bg-[#161e2b] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500/50'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Building2 size={12} />{' '}
                        {t(
                          'AuthPages.onboarding.form.address',
                          'Primary Address'
                        )}
                      </label>
                      <input
                        {...register('address', { required: true })}
                        className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                        placeholder="123 Street, District 1, HCMC"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-professional"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {isOphthalmologist ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Heart size={14} className="text-pink-500" />{' '}
                          {t(
                            'AuthPages.onboarding.form.bio',
                            'Professional Bio'
                          )}
                        </label>
                        <textarea
                          {...register('bio', { required: true })}
                          className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none text-sm text-gray-900 dark:text-white"
                          placeholder="Experienced ophthalmologist specializing in..."
                          rows={2}
                        />
                      </div>

                      {/* Degrees */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                          <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award size={14} className="text-emerald-500" />{' '}
                            {t(
                              'AuthPages.onboarding.form.degrees',
                              'Medical Degrees'
                            )}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              appendDegree({
                                name: '',
                                degreeLevel: 3,
                                issuingInstitution: '',
                                issuedDate: '',
                              })
                            }
                            className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>

                        {degreeFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="relative bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeDegree(index)}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Name
                                </label>
                                <input
                                  {...register(
                                    `degrees.${index}.name` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                                  placeholder="MBBS, MD..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Level
                                </label>
                                <select
                                  {...register(
                                    `degrees.${index}.degreeLevel` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                >
                                  {DEGREE_LEVEL_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Institution
                                </label>
                                <input
                                  {...register(
                                    `degrees.${index}.issuingInstitution` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                  placeholder="Medical University..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Issued Date
                                </label>
                                <input
                                  type="date"
                                  {...register(
                                    `degrees.${index}.issuedDate` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Document
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  {...register(
                                    `degrees.${index}.file` as const
                                  )}
                                  className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-cyan-50 file:text-cyan-700"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Certificates */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                          <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />{' '}
                            {t(
                              'AuthPages.onboarding.form.certificates',
                              'Licenses & Certificates'
                            )}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              appendCertificate({
                                name: '',
                                licenseNumber: '',
                                issuingAuthority: '',
                                scopeOfPractice: '',
                                issuedDate: '',
                                expiryDate: '',
                              })
                            }
                            className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        {certificateFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="relative bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeCertificate(index)}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Name
                                </label>
                                <input
                                  {...register(
                                    `certificates.${index}.name` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Medical License..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  License Number
                                </label>
                                <input
                                  {...register(
                                    `certificates.${index}.licenseNumber` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                  placeholder="GPHN-..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Authority
                                </label>
                                <input
                                  {...register(
                                    `certificates.${index}.issuingAuthority` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                  placeholder="MOH, Health Dept..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Scope of Practice
                                </label>
                                <input
                                  {...register(
                                    `certificates.${index}.scopeOfPractice` as const
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                  placeholder="Ophthalmology..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Issued Date
                                </label>
                                <input
                                  type="date"
                                  {...register(
                                    `certificates.${index}.issuedDate` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Expiration Date
                                </label>
                                <input
                                  type="date"
                                  {...register(
                                    `certificates.${index}.expiryDate` as const,
                                    { required: true }
                                  )}
                                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Document
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  {...register(
                                    `certificates.${index}.file` as const
                                  )}
                                  className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building2 size={14} />{' '}
                            {t(
                              'AuthPages.onboarding.form.department',
                              'Department'
                            )}
                          </label>
                          <input
                            {...register('department', { required: true })}
                            className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                            placeholder="Reception / Pharmacy"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <IdCard size={14} />{' '}
                            {t(
                              'AuthPages.onboarding.form.employeeCode',
                              'Employee Code'
                            )}
                          </label>
                          <input
                            {...register('employeeCode', { required: true })}
                            className="w-full bg-gray-50/50 dark:bg-[#161e2b]/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm text-gray-900 dark:text-white"
                            placeholder="CS-12345"
                          />
                        </div>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex gap-3">
                          <div className="bg-emerald-500 text-white p-1.5 rounded-lg h-fit">
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">
                              {t(
                                'AuthPages.onboarding.staff.welcome',
                                'Ready to Start!'
                              )}
                            </h4>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/70 mt-0.5 leading-relaxed">
                              {t(
                                'AuthPages.onboarding.staff.desc',
                                'Your profile is almost ready. Once submitted, you can start managing clinic operations.'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                >
                  <ArrowLeft size={16} /> {t('Shared.buttons.back', 'Back')}
                </button>
              )}

              {currentStep < filteredSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
                >
                  {t('Shared.buttons.next', 'Continue')}{' '}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <Spinner size={18} />
                  ) : (
                    <>
                      {t('AuthPages.onboarding.submit', 'Complete Setup')}{' '}
                      <CheckCircle size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            AURAEYES 2026 ❤️
          </div>
        </div>
      </div>
    </div>
  );
};
export default WelcomeOnboardingPage;
