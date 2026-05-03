import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Briefcase,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Stethoscope,
  IdCard,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { useLocalePath } from '@/i18n/locales';
import { forceUpdateProfile } from '../api';
import type { ForceUpdateProfileRequest } from '../types';
import useAuthStore from '@/store/auth-store';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isOphthalmologist = user?.roles?.includes('Ophthalmologist');
  const filteredSteps = isOphthalmologist ? STEPS : STEPS.slice(0, 2);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ForceUpdateProfileRequest & { confirmPassword?: string }>({
    defaultValues: {
      fullName: user?.fullName || '',
    },
    mode: 'onBlur',
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['newPassword', 'confirmPassword'];
    } else if (currentStep === 1) {
      fieldsToValidate = [
        'fullName',
        'phone',
        'dateOfBirth',
        'gender',
        'citizenId',
        'address',
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (
    data: ForceUpdateProfileRequest & { confirmPassword?: string }
  ) => {
    try {
      setIsLoading(true);

      const payload: ForceUpdateProfileRequest = {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        newPassword: data.newPassword,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender ? Number(data.gender) : undefined,
        citizenId: data.citizenId,
      };

      if (isOphthalmologist) {
        payload.medicalLicenseNumber = data.medicalLicenseNumber;
        // In a real app, you'd upload the image first and get a URL
        // For this demo, we'll assume the API handles it or it's mocked
        payload.licenseImageUrl = previewUrl || undefined;
      }

      await forceUpdateProfile(payload);

      toast.success(
        t(
          'AuthPages.onboarding.success',
          'Onboarding completed! Welcome to AURA.'
        )
      );

      // Update local state
      if (user) {
        setUser({
          ...user,
          mustUpdateProfile: false,
        });
      }

      // Redirect to dashboard
      const dashboardPath = isOphthalmologist
        ? '/ophthalmologist/dashboard'
        : '/clinic-staff/dashboard';
      navigate(toLocalizedPath(dashboardPath));
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
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 flex">
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

        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <AuraLogo size="lg" className="mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t(
                'AuthPages.onboarding.title',
                'Welcome to AURA Digital Clinic'
              )}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {t(
                'AuthPages.onboarding.subtitle',
                'Complete your professional profile to start working in our digital ecosystem.'
              )}
            </p>
          </div>

          {/* Stepper Icons */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {filteredSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : idx < currentStep
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  <step.icon size={22} />
                </div>
                {idx < filteredSteps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
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
                  className="space-y-6"
                >
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl flex gap-4 items-start border border-emerald-100 dark:border-emerald-900/30">
                    <div className="bg-emerald-500 p-2 rounded-xl text-white">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400">
                        {t(
                          'AuthPages.onboarding.security.tipTitle',
                          'Security Check'
                        )}
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-500/80">
                        {t(
                          'AuthPages.onboarding.security.tipDesc',
                          'For your protection, please change your temporary password provided by the administrator.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Lock size={16} />{' '}
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
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: t(
                                'AuthPages.onboarding.validation.passwordPattern',
                                'Requires uppercase, lowercase, and number'
                              ),
                            },
                          })}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-xs text-red-500 ml-1">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircle size={16} />{' '}
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
                          className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500 ml-1">
                          {errors.confirmPassword.message}
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
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User size={16} />{' '}
                        {t('AuthPages.onboarding.form.fullName', 'Full Name')}
                      </label>
                      <input
                        {...register('fullName', { required: true })}
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="Dr. John Doe"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone size={16} />{' '}
                        {t('AuthPages.onboarding.form.phone', 'Phone Number')}
                      </label>
                      <input
                        {...register('phone', { required: true })}
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="+84 123 456 789"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <IdCard size={16} />{' '}
                        {t(
                          'AuthPages.onboarding.form.citizenId',
                          'Citizen ID (CCCD)'
                        )}
                      </label>
                      <input
                        {...register('citizenId', { required: true })}
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="012345678901"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar size={16} />{' '}
                        {t('AuthPages.onboarding.form.dob', 'Date of Birth')}
                      </label>
                      <input
                        {...register('dateOfBirth', { required: true })}
                        type="date"
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Sparkles size={16} />{' '}
                        {t('AuthPages.onboarding.form.gender', 'Gender')}
                      </label>
                      <select
                        {...register('gender', { required: true })}
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      >
                        <option value="1">
                          {t('Shared.gender.male', 'Male')}
                        </option>
                        <option value="2">
                          {t('Shared.gender.female', 'Female')}
                        </option>
                        <option value="3">
                          {t('Shared.gender.other', 'Other')}
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <MapPin size={16} />{' '}
                        {t(
                          'AuthPages.onboarding.form.address',
                          'Primary Address'
                        )}
                      </label>
                      <input
                        {...register('address', { required: true })}
                        className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="123 Street, District 1, HCMC"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && isOphthalmologist && (
                <motion.div
                  key="step-professional"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Stethoscope size={16} />{' '}
                      {t(
                        'AuthPages.onboarding.form.licenseNumber',
                        'Medical License Number'
                      )}
                    </label>
                    <input
                      {...register('medicalLicenseNumber', { required: true })}
                      className="w-full bg-gray-50 dark:bg-[#161e2b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="MED-12345678"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Upload size={16} />{' '}
                      {t(
                        'AuthPages.onboarding.form.licenseImage',
                        'Certificate Image'
                      )}
                    </label>

                    <div
                      className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 ${
                        previewUrl
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      {previewUrl ? (
                        <>
                          <img
                            src={previewUrl}
                            alt="License"
                            className="w-full h-full object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrl(null);
                              setLicenseImage(null);
                            }}
                            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-4">
                            <Upload size={32} />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t(
                              'AuthPages.onboarding.form.uploadText',
                              'Click to upload or drag and drop'
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, PDF (Max 5MB)
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-12 flex gap-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft size={18} /> {t('Shared.buttons.back', 'Back')}
                </button>
              )}

              {currentStep < filteredSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                >
                  {t('Shared.buttons.next', 'Continue')}{' '}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Spinner size={20} />
                  ) : (
                    <>
                      {t('AuthPages.onboarding.submit', 'Complete Setup')}{' '}
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
            <Shield size={14} className="text-emerald-500" />
            End-to-End Encrypted
          </div>
          <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
            <Heart size={14} className="text-rose-500" />
            Human-Centric Design
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboardingPage;
