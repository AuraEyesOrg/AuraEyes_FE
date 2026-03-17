import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Shield,
  Lock,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { AuraLogo } from '@/components/ui/aura-logo';
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
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userId = searchParams.get('userId') ?? '';
  const token = searchParams.get('token') ?? '';
  const hasRequiredParams = Boolean(userId && token);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!hasRequiredParams) {
      setError(
        'Invalid reset link. Please request a new password reset email.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      await requestResetPassword({
        userId,
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });

      setSuccessMessage(
        'Password has been reset successfully. You can now sign in with your new password.'
      );
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        setError(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.errors?.join(', ') ||
            'Reset password failed. Please request a new reset link.'
        );
      } else {
        setError('Reset password failed. Please request a new reset link.');
      }
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
            Set a New <br />
            <span className="text-[#00d1c0]">Secure Password.</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Your new password should be unique and used only for your AuraEyes
            account.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="text-[#00d1c0] w-5 h-5" />
              <span>Protected Account</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Lock className="text-[#00d1c0] w-5 h-5" />
              <span>Strong Credentials</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Aura Medical Systems.</p>
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
              Back to Login
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
              <div>
                <p className="text-sm text-green-700">{successMessage}</p>
                <Link
                  to="/login"
                  className="inline-block mt-2 text-sm font-semibold text-green-700 hover:text-green-800"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight">
              Reset Password
            </h2>
            <p className="text-gray-500 text-base">
              Create a new password to complete account recovery.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="reset-password"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        'Password must contain uppercase, lowercase, and number',
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
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
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
                Missing reset token information. Please use the reset link from
                your email.
              </p>
            )}

            <button
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={
                isLoading || !hasRequiredParams || Boolean(successMessage)
              }
            >
              {isLoading ? (
                <>
                  <Spinner size={20} className="shrink-0" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Password reset links are time-limited for security. If your link
                has expired, request a new one from the forgot password page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
