import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  Zap,
  Activity,
  Stethoscope,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import '@/styles/auth-animations.css';
import { login, registerPatient, isTwoFactorRequired } from '../api';
import type { TwoFactorRequiredResponse } from '../types';
import useAuthStore from '@/store/auth-store';

type AuthMode = 'login' | 'register';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const LoginPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] =
    useState<TwoFactorRequiredResponse | null>(null);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthStore();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>();

  const onLoginSubmit = async (data: LoginFormData) => {
    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await login({
        email: data.email,
        password: data.password,
        recaptchaToken: recaptchaToken,
      });

      // Check if 2FA is required
      if (isTwoFactorRequired(response)) {
        setTwoFactorData(response);
        // Navigate to 2FA verification page with userId
        navigate('/two-factor-verify', {
          state: {
            userId: response.userId,
            email: data.email,
          },
        });
        return;
      }

      // Login successful
      if (response.succeeded) {
        setIsAuthenticated(true);

        // Navigate based on user role
        const roles = response.user?.roles || [];
        if (roles.includes('SystemAdmin')) {
          navigate('/system-admin/dashboard');
        } else if (roles.includes('Patient')) {
          navigate('/patient/dashboard');
        } else if (roles.includes('Ophthalmologist')) {
          navigate('/ophthalmologist/dashboard');
        } else if (roles.includes('Organization')) {
          navigate('/organisation/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(
          response.errors?.join(', ') || 'Login failed. Please try again.'
        );
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      // Check for axios error response
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        setError(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.errors?.join(', ') ||
            errorMessage
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      await registerPatient({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
      });

      // Registration successful
      setSuccessMessage(
        'Registration successful! Please check your email to confirm your account.'
      );
      resetRegisterForm();

      // Switch to login mode after a delay
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        setError(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.errors?.join(', ') ||
            errorMessage
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    console.log('SSO Login initiated');
    // TODO: Implement SSO logic
  };

  // Clear messages when switching auth mode
  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel: Brand Identity */}
      <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
          <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
        </div>
        <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
          <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
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
            Precision AI for <br />
            <span className="text-[#00d1c0]">Vascular Health.</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Secure access to the next generation of retinal screening tools.
            Automated diagnostics with 99.8% clinical accuracy.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="text-[#00d1c0] w-5 h-5" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Lock className="text-[#00d1c0] w-5 h-5" />
              <span>End-to-End Encryption</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-gray-500 flex justify-between items-end">
          <p>© {new Date().getFullYear()} Aura Medical Systems.</p>
          <a className="hover:text-[#00d1c0] transition-colors" href="#">
            System Status: <span className="text-green-400">● Online</span>
          </a>
        </div>
      </div>

      {/* Right Panel: Interaction Workspace */}
      <div className="lg:w-[60%] w-full bg-white flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        {/* Mobile Brand Header */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-[#1A202C]">
          <Eye className="text-[#00d1c0] w-6 h-6" />
          <span className="font-bold">AURA</span>
        </div>

        <div className="w-full max-w-[480px] flex flex-col gap-8">
          {/* Auth Toggle / Tabs */}
          <div className="w-full">
            <div className="flex border-b border-gray-200 gap-8 relative">
              {/* Animated underline */}
              <div
                className={`absolute bottom-0 h-[3px] bg-[#1A202C] transition-all duration-300 ease-out ${
                  authMode === 'login'
                    ? 'left-0 w-[80px]'
                    : 'left-[120px] w-[140px]'
                }`}
              />
              <button
                onClick={() => handleAuthModeChange('login')}
                className={`flex flex-col items-center justify-center pb-3 pt-2 px-2 transition-all duration-300 relative z-10 ${
                  authMode === 'login'
                    ? 'text-[#1A202C]'
                    : 'text-gray-400 hover:text-[#1F85F5]'
                }`}
              >
                <span className="text-sm font-bold tracking-wide uppercase">
                  Log In
                </span>
              </button>
              <button
                onClick={() => handleAuthModeChange('register')}
                className={`flex flex-col items-center justify-center pb-3 pt-2 px-2 transition-all duration-300 relative z-10 ${
                  authMode === 'register'
                    ? 'text-[#1A202C]'
                    : 'text-gray-400 hover:text-[#1F85F5]'
                }`}
              >
                <span className="text-sm font-bold tracking-wide uppercase">
                  Create Account
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-slide-in-right">
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

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-slide-in-right">
              <Shield className="text-green-500 w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <div>
              {/* Page Heading */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight">
                  Access Portal
                </h2>
                <p className="text-gray-500 text-base">
                  Welcome Back, Doctor. Please enter your credentials.
                </p>
              </div>

              {/* Form */}
              <form
                className="space-y-5"
                onSubmit={handleLoginSubmit(onLoginSubmit)}
              >
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="login-email"
                  >
                    Medical ID / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      {...registerLogin('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="login-email"
                      name="email"
                      placeholder="dr.name@hospital.org"
                      type="email"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-sm font-semibold text-gray-700"
                      htmlFor="login-password"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#1F85F5] hover:text-[#00d1c0] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...registerLogin('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="login-password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                    onErrored={() => setRecaptchaToken(null)}
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-4">
                  <button
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Secure Sign In'
                    )}
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative px-4 bg-white text-xs font-medium text-gray-500 uppercase">
                      Or continue with
                    </span>
                  </div>

                  <button
                    className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-[#1F85F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F85F5] transition-all duration-200"
                    type="button"
                    onClick={handleSSOLogin}
                  >
                    <img
                      alt="Google Logo"
                      className="h-5 w-5"
                      src="https://www.google.com/favicon.ico"
                    />
                    <span>Institutional SSO</span>
                  </button>
                </div>
              </form>

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Access to this portal is restricted to authorized medical
                    personnel only. Unauthorized access is a violation of
                    federal law and HIPAA regulations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {authMode === 'register' && (
            <div className="animate-slide-in-right">
              {/* Page Heading */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-[#1A202C] tracking-tight">
                  Create Account
                </h2>
                <p className="text-gray-500 text-base">
                  Join AURA to access advanced retinal diagnostics.
                </p>
              </div>

              {/* Form */}
              <form
                className="space-y-5"
                onSubmit={handleSignupSubmit(onRegisterSubmit)}
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="register-name"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      {...registerSignup('fullName', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="register-name"
                      placeholder="Dr. John Smith"
                      type="text"
                    />
                  </div>
                  {signupErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {signupErrors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="register-email"
                  >
                    Medical Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      {...registerSignup('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="register-email"
                      placeholder="dr.smith@hospital.org"
                      type="email"
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="register-phone"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      {...registerSignup('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9\s\-\+\(\)]{10,}$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="register-phone"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                    />
                  </div>
                  {signupErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {signupErrors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="register-password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...registerSignup('password', {
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
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="register-password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {signupErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="register-confirm-password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...registerSignup('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === watch('password') ||
                          'Passwords do not match',
                      })}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                      id="register-confirm-password"
                      placeholder="••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {signupErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <input
                    {...registerSignup('agreeTerms', {
                      required: 'You must agree to the terms',
                    })}
                    type="checkbox"
                    id="agree-terms"
                    className="mt-1 w-4 h-4 text-[#00d1c0] border-gray-300 rounded focus:ring-[#00d1c0]"
                  />
                  <label
                    htmlFor="agree-terms"
                    className="text-xs text-gray-600"
                  >
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-[#1F85F5] hover:text-[#00d1c0] font-medium"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-[#1F85F5] hover:text-[#00d1c0] font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {signupErrors.agreeTerms && (
                  <p className="text-xs text-red-500 mt-1">
                    {signupErrors.agreeTerms.message}
                  </p>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Are you a Medical Professional?
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Register as a doctor to join our healthcare network
                    </p>
                    <Link
                      to="/register-doctor"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-200 group"
                    >
                      <Stethoscope className="h-4 w-4" />
                      Register as Doctor
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    By creating an account, you acknowledge that your data will
                    be processed in accordance with HIPAA regulations and our
                    security protocols.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
