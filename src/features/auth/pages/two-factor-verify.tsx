import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  AlertCircle,
  Key,
  Smartphone,
  Eye,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { verifyTwoFactorLogin } from '../api/auth.api';
import useAuthStore from '@/store/auth-store';
import '@/styles/auth-animations.css';

interface TwoFactorVerifyForm {
  code: string;
}

interface LocationState {
  userId: string;
  email?: string;
}

const TwoFactorVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { login: authLogin, setIsAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TwoFactorVerifyForm>();

  // Redirect if no userId in state
  if (!state?.userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Session Expired
          </h2>
          <p className="text-gray-600 mb-6">
            Your login session has expired. Please try logging in again.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d1c0] text-white font-semibold rounded-lg hover:bg-[#00b8a9] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: TwoFactorVerifyForm) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await verifyTwoFactorLogin({
        userId: state.userId,
        code: data.code.replace(/\s/g, ''), // Remove spaces
        useRecoveryCode,
      });

      if (response.succeeded) {
        if (response.user) {
          authLogin(response.user);
        } else {
          setIsAuthenticated(true);
        }

        // Navigate based on user role
        const roles = response.user?.roles || [];
        if (roles.includes('SystemAdmin')) {
          navigate('/system-admin/dashboard');
        } else if (roles.includes('Patient')) {
          navigate('/patient/dashboard');
        } else if (roles.includes('Ophthalmologist')) {
          if (response.user?.isVerified === false) {
            navigate('/pending-approval');
          } else if (response.user?.contractStatus !== 'Active') {
            navigate('/ophthalmologist/contract');
          } else {
            navigate('/ophthalmologist/dashboard');
          }
        } else if (
          roles.includes('OrgAdmin') ||
          roles.includes('Organization')
        ) {
          navigate('/organisation/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(response.errors?.join(', ') || 'Verification failed');
      }
    } catch (err: unknown) {
      console.error('2FA verification error:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        setError(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.errors?.join(', ') ||
            'Invalid verification code'
        );
      } else {
        setError('An error occurred during verification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCodeType = () => {
    setUseRecoveryCode(!useRecoveryCode);
    setError(null);
    reset();
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel: Brand Identity */}
      <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
          <Shield className="w-[400px] h-[400px]" strokeWidth={0.5} />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="text-[#00d1c0] w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight">AURA</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div className="w-16 h-1 bg-[#00d1c0] mb-2 rounded-full"></div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Secure <br />
            <span className="text-[#00d1c0]">Verification.</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Two-factor authentication adds an extra layer of security to protect
            your medical data and patient information.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Aura Medical Systems.</p>
        </div>
      </div>

      {/* Right Panel: Verification Form */}
      <div className="lg:w-[60%] w-full bg-white flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        {/* Mobile Brand Header */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-[#1A202C]">
          <Eye className="text-[#00d1c0] w-6 h-6" />
          <span className="font-bold">AURA</span>
        </div>

        <div className="w-full max-w-[480px] flex flex-col gap-8">
          {/* Back Link */}
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#00d1c0]/10 flex items-center justify-center">
                {useRecoveryCode ? (
                  <Key className="w-8 h-8 text-[#00d1c0]" />
                ) : (
                  <Smartphone className="w-8 h-8 text-[#00d1c0]" />
                )}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight mb-2">
              {useRecoveryCode
                ? 'Enter Recovery Code'
                : 'Two-Factor Authentication'}
            </h2>
            <p className="text-gray-500">
              {useRecoveryCode
                ? 'Enter one of your recovery codes to verify your identity.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </p>
            {state.email && (
              <p className="text-sm text-gray-400 mt-2">
                Logging in as: <strong>{state.email}</strong>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="block text-sm font-semibold text-gray-700"
              >
                {useRecoveryCode ? 'Recovery Code' : 'Verification Code'}
              </label>
              <input
                {...register('code', {
                  required: 'Code is required',
                  pattern: useRecoveryCode
                    ? {
                        value: /^[a-zA-Z0-9-]+$/,
                        message: 'Invalid recovery code format',
                      }
                    : {
                        value: /^[0-9]{6}$/,
                        message: 'Code must be 6 digits',
                      },
                })}
                type="text"
                inputMode={useRecoveryCode ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                maxLength={useRecoveryCode ? 20 : 6}
                placeholder={useRecoveryCode ? 'XXXX-XXXX-XXXX' : '000000'}
                className={`block w-full px-4 py-4 text-center font-mono tracking-[0.3em] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] bg-gray-50/30 transition-all ${
                  useRecoveryCode ? 'text-lg' : 'text-2xl'
                }`}
                autoFocus
              />
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner size={20} className="shrink-0" />
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </button>
          </form>

          {/* Toggle Recovery Code */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleCodeType}
              className="text-sm text-[#1F85F5] hover:text-[#00d1c0] font-medium transition-colors"
            >
              {useRecoveryCode
                ? 'Use authenticator app instead'
                : "Can't access your authenticator? Use a recovery code"}
            </button>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {useRecoveryCode
                  ? 'Each recovery code can only be used once. After using a code, we recommend generating new ones from your security settings.'
                  : "If you've lost access to your authenticator app and recovery codes, please contact your system administrator for account recovery."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerifyPage;
