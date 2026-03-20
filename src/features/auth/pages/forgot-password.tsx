import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Shield,
  Lock,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { forgotPassword } from '../api';

interface ForgotPasswordFormData {
  email: string;
}

const MOCK_DELAY_MS = 800;

const requestForgotPassword = async (email: string): Promise<void> => {
  const useMockApi = import.meta.env.VITE_USE_MOCK_AUTH_API === 'true';

  if (useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return;
  }

  try {
    await forgotPassword({ email });
  } catch {
    // Keep the same generic behavior as backend to prevent user enumeration.
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  }
};

const ForgotPasswordPage = () => {
  const { t } = useSafeTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      await requestForgotPassword(data.email);

      setSuccessMessage(t('AuthPages.forgotPassword.messages.success'));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t('AuthPages.forgotPassword.messages.fallbackError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
          <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
        </div>
        <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
          <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
        </div>

        <div className="relative z-10 [&_span]:!text-white">
          <AuraLogo size="lg" to="/" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div className="w-16 h-1 bg-[#00d1c0] mb-2 rounded-full"></div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            {t('AuthPages.forgotPassword.leftPanel.titleLine1')} <br />
            <span className="text-[#00d1c0]">
              {t('AuthPages.forgotPassword.leftPanel.titleHighlight')}
            </span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            {t('AuthPages.forgotPassword.leftPanel.description')}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="text-[#00d1c0] w-5 h-5" />
              <span>
                {t('AuthPages.forgotPassword.leftPanel.securityFirst')}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Lock className="text-[#00d1c0] w-5 h-5" />
              <span>
                {t('AuthPages.forgotPassword.leftPanel.protectedRecovery')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          <p>
            {t('AuthPages.shared.copyright').replace(
              '{{year}}',
              String(new Date().getFullYear())
            )}
          </p>
        </div>
      </div>

      <div className="lg:w-[60%] w-full bg-white flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-[480px] flex flex-col gap-8">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1F85F5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('AuthPages.shared.backToLogin')}
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-slide-in-right">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-slide-in-right">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight">
              {t('AuthPages.forgotPassword.form.heading')}
            </h2>
            <p className="text-gray-500 text-base">
              {t('AuthPages.forgotPassword.form.description')}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="forgot-email"
              >
                {t('AuthPages.forgotPassword.form.emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email', {
                    required: t(
                      'AuthPages.forgotPassword.validation.emailRequired'
                    ),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t(
                        'AuthPages.forgotPassword.validation.invalidEmail'
                      ),
                    },
                  })}
                  id="forgot-email"
                  type="email"
                  placeholder={t(
                    'AuthPages.forgotPassword.form.emailPlaceholder'
                  )}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size={20} className="shrink-0" />
                  {t('AuthPages.forgotPassword.form.submitting')}
                </>
              ) : (
                t('AuthPages.forgotPassword.form.submit')
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('AuthPages.forgotPassword.messages.securityNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
