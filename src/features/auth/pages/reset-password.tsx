import { useState, useEffect } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Shield,
  Lock,
  Activity,
  Zap,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { resetPassword } from '../api';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const MOCK_DELAY_MS = 900;

const requestResetPassword = async (payload: {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> => {
  const useMockApi = import.meta.env.VITE_USE_MOCK_AUTH_API === 'true';

  if (useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return;
  }

  await resetPassword(payload);
};

const ResetPasswordPage = () => {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const userId = searchParams.get('userId') ?? '';
  const token = searchParams.get('token') ?? '';
  const hasRequiredParams = Boolean(userId && token);
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedAuthPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!hasRequiredParams) {
      toast.error(t('AuthPages.resetPassword.messages.invalidLink'));
      return;
    }

    try {
      setIsLoading(true);

      await requestResetPassword({
        userId,
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });

      toast.success(t('AuthPages.resetPassword.messages.success'));
      setResetDone(true);
      setRedirectCountdown(5);
    } catch (err: unknown) {
      toast.error(
        extractApiErrorMessage(
          err,
          t('AuthPages.resetPassword.messages.failed')
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect countdown after successful password reset
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate(toLocalizedAuthPath('/login'), { replace: true });
      return;
    }
    const timer = window.setTimeout(
      () => setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [redirectCountdown, navigate, toLocalizedAuthPath]);

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
          <AuraLogo size="lg" to={toLocalizedAuthPath('/')} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div className="w-16 h-1 bg-[#00d1c0] mb-2 rounded-full"></div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            {t('AuthPages.resetPassword.leftPanel.titleLine')} <br />
            <span className="text-[#00d1c0]">
              {t('AuthPages.resetPassword.leftPanel.titleHighlight')}
            </span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            {t('AuthPages.resetPassword.leftPanel.description')}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="text-[#00d1c0] w-5 h-5" />
              <span>
                {t('AuthPages.resetPassword.leftPanel.protectedAccount')}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Lock className="text-[#00d1c0] w-5 h-5" />
              <span>
                {t('AuthPages.resetPassword.leftPanel.strongCredentials')}
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
              to={toLocalizedAuthPath('/login')}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1F85F5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('AuthPages.shared.backToLogin')}
            </Link>
          </div>

          {resetDone && redirectCountdown !== null && (
            <div className="flex flex-col items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle className="text-green-600 w-8 h-8" />
              <p className="text-sm text-green-700 font-medium">
                {t('AuthPages.resetPassword.messages.success')}
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t(
                  'AuthPages.resetPassword.messages.redirectingIn',
                  'Chuyển đến trang đăng nhập sau {{s}}s...',
                  { s: redirectCountdown }
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight">
              {t('AuthPages.resetPassword.form.heading')}
            </h2>
            <p className="text-gray-500 text-base">
              {t('AuthPages.resetPassword.form.description')}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="reset-password"
              >
                {t('AuthPages.resetPassword.form.newPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password', {
                    required: t(
                      'AuthPages.resetPassword.validation.passwordRequired'
                    ),
                    minLength: {
                      value: 8,
                      message: t(
                        'AuthPages.resetPassword.validation.passwordMin'
                      ),
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: t(
                        'AuthPages.resetPassword.validation.passwordPattern'
                      ),
                    },
                  })}
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="reset-confirm-password"
              >
                {t('AuthPages.resetPassword.form.confirmNewPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: t(
                      'AuthPages.resetPassword.validation.confirmPasswordRequired'
                    ),
                    validate: (value) =>
                      value === watch('password') ||
                      t('AuthPages.resetPassword.validation.passwordMismatch'),
                  })}
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {!hasRequiredParams && (
              <p className="text-xs text-red-500">
                {t('AuthPages.resetPassword.messages.missingToken')}
              </p>
            )}

            <button
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || !hasRequiredParams || resetDone}
            >
              {isLoading ? (
                <>
                  <Spinner size={20} className="shrink-0" />
                  {t('AuthPages.resetPassword.form.submitting')}
                </>
              ) : (
                t('AuthPages.resetPassword.form.submit')
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('AuthPages.resetPassword.messages.securityNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
