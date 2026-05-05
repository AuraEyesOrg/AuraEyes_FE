import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Lock,
  Download,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  generateRecoveryCodes,
} from '../api/two-factor.api';
import type {
  TwoFactorStep,
  TwoFactorStatusResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyFormData,
  TwoFactorDisableFormData,
} from '../types';
import '@/styles/auth-animations.css';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '@/features/patient/components/PatientLayout';
import ClinicStaffLayout from '@/features/clinic-staff/components/ClinicStaffLayout';
import { useChangePassword } from '@/features/patient/hooks/useProfile';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/features/patient/schemas/profile.schema';
import { toast } from 'react-toastify';

const TwoFactorSettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPatientContext = location.pathname.startsWith('/patient/');
  const isClinicStaffContext = location.pathname.startsWith('/clinic-staff/');

  const [step, setStep] = useState<TwoFactorStep>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TwoFactorStatusResponse | null>(null);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(
    null
  );
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryModalPassword, setRecoveryModalPassword] = useState('');
  const [showRecoveryModalPw, setShowRecoveryModalPw] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: resetVerify,
  } = useForm<TwoFactorVerifyFormData>();

  const {
    register: registerDisable,
    handleSubmit: handleDisableSubmit,
    formState: { errors: disableErrors },
    reset: resetDisable,
  } = useForm<TwoFactorDisableFormData>();

  const {
    register: registerChangePassword,
    handleSubmit: handleChangePasswordSubmit,
    reset: resetChangePassword,
    formState: { errors: changePasswordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });

  // Fetch 2FA status on mount
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statusData = await getTwoFactorStatus();
      setStatus(statusData);
      setStep('status');
    } catch (err) {
      setError('Failed to fetch 2FA status. Please try again.');
      console.error('Error fetching 2FA status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle setup 2FA
  const handleSetup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await setupTwoFactor();
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError('Failed to setup 2FA. Please try again.');
      console.error('Error setting up 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify and enable 2FA
  const onVerifySubmit = async (data: TwoFactorVerifyFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await enableTwoFactor({ verificationCode: data.code });
      if (response.succeeded) {
        setRecoveryCodes(response.recoveryCodes);
        setStep('recovery-codes');
        resetVerify();
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Error enabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disable 2FA
  const onDisableSubmit = async (data: TwoFactorDisableFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await disableTwoFactor({ password: data.password });
      resetDisable();
      await fetchStatus();
    } catch (err) {
      setError('Invalid password. Please try again.');
      console.error('Error disabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generate new recovery codes
  const handleGenerateRecoveryCodes = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await generateRecoveryCodes({ password });
      if (response.succeeded) {
        setRecoveryCodes(response.recoveryCodes);
        setStep('recovery-codes');
      }
    } catch (err) {
      setError('Failed to generate recovery codes. Please try again.');
      console.error('Error generating recovery codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard helpers
  const copyToClipboard = async (text: string, type: 'key' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download recovery codes
  const downloadRecoveryCodes = () => {
    const lines = [
      'AURA Medical - 2FA Recovery Codes',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'IMPORTANT: Store these codes securely. Each code can only be used once.',
      '',
      ...recoveryCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      'If you lose access to your authenticator app, use one of these codes to sign in.',
      'After using a recovery code, we recommend generating new codes.',
    ];
    const content = lines.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aura-2fa-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRecoveryModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryModalPassword) return;
    setShowRecoveryModal(false);
    await handleGenerateRecoveryCodes(recoveryModalPassword);
    setRecoveryModalPassword('');
    setShowRecoveryModalPw(false);
  };

  const handleBack = () => {
    if (isPatientContext) {
      navigate('/patient/settings');
    } else if (isClinicStaffContext) {
      navigate('/clinic-staff/settings');
    } else {
      navigate(-1);
    }
  };

  const onChangePasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setShowChangePassword(false);
        resetChangePassword();
      },
      onError: () => {
        toast.error('Failed to change password');
      },
    });
  };

  // Loading state
  if (isLoading && step === 'status' && !status) {
    const loader = (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size={32} className="mx-auto" />
          <p className="mt-4 text-[var(--text-secondary)]">
            Loading security settings...
          </p>
        </div>
      </div>
    );
    if (isPatientContext) return <PatientLayout>{loader}</PatientLayout>;
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        {loader}
      </div>
    );
  }

  // Shared page content (used in both contexts)
  const mainContent = (
    <>
      {isPatientContext && (
        <div className="mb-6 space-y-4">
          <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    Password
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Update your account password regularly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    Notifications
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Manage notification and reminder preferences.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/patient/notifications')}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-[var(--bg-primary)] rounded-2xl shadow-sm overflow-hidden border border-[var(--border-color)]">
        {/* Status View */}
        {step === 'status' && status && (
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  status.isEnabled
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-[var(--bg-secondary)]'
                }`}
              >
                {status.isEnabled ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-[var(--text-muted)]" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-[var(--text-primary)] mb-2">
              {status.isEnabled
                ? 'Two-Factor Authentication is Enabled'
                : 'Two-Factor Authentication is Disabled'}
            </h2>

            <p className="text-[var(--text-secondary)] text-center mb-8">
              {status.isEnabled
                ? 'Your account is protected with an additional layer of security.'
                : 'Enable 2FA to add extra security to your account.'}
            </p>

            {status.isEnabled && (
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 border border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="text-brand w-5 h-5" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      Recovery Codes Remaining
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      status.recoveryCodesRemaining <= 2
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}
                  >
                    {status.recoveryCodesRemaining}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!status.isEnabled ? (
                <button
                  onClick={handleSetup}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone className="w-5 h-5" />
                  Enable Two-Factor Authentication
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setStep('disable')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                  >
                    <XCircle className="w-5 h-5" />
                    Disable Two-Factor Authentication
                  </button>
                  {status.recoveryCodesRemaining <= 3 && (
                    <button
                      onClick={() => setShowRecoveryModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-brand border border-brand hover:bg-brand-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Generate New Recovery Codes
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </button>
          </div>
        )}

        {/* Setup View */}
        {step === 'setup' && setupData && (
          <div className="p-8">
            <button
              onClick={() => setStep('status')}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Set Up Authenticator App
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Scan the QR code below with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-xl border-2 border-[var(--border-color)]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    setupData.authenticatorUri
                  )}`}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] mb-2 uppercase font-semibold tracking-wide">
                Or enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 text-[var(--text-primary)] bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] font-mono text-sm break-all">
                  {setupData.formattedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(setupData.sharedKey, 'key')}
                  className="p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {copiedKey ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit(onVerifySubmit)}>
              <div className="mb-4">
                <label
                  htmlFor="code"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Enter the 6-digit code from your app
                </label>
                <input
                  {...registerVerify('code', {
                    required: 'Verification code is required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'Code must be 6 digits',
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-[var(--bg-secondary)] transition-all"
                />
                {verifyErrors.code && (
                  <p className="text-xs text-red-500 mt-1">
                    {verifyErrors.code.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Spinner size={20} className="shrink-0" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Verify and Enable
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Recovery Codes View */}
        {step === 'recovery-codes' && recoveryCodes.length > 0 && (
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-[var(--text-primary)] mb-2">
              Save Your Recovery Codes
            </h2>
            <p className="text-[var(--text-secondary)] text-center mb-6">
              Store these codes in a safe place. You can use them to access your
              account if you lose your authenticator device.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Each code can only be used once. After using a code, it will be
                invalidated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {recoveryCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-3 bg-[var(--bg-secondary)] rounded-xl font-mono text-sm text-center text-[var(--text-secondary)] border border-[var(--border-color)]"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() =>
                  copyToClipboard(recoveryCodes.join('\n'), 'codes')
                }
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm text-[var(--text-primary)] font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                {copiedCodes ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Codes
                  </>
                )}
              </button>
              <button
                onClick={downloadRecoveryCodes}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm text-[var(--text-primary)] font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            <button
              onClick={fetchStatus}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200"
            >
              Done
            </button>
          </div>
        )}

        {/* Disable 2FA View */}
        {step === 'disable' && (
          <div className="p-8">
            <button
              onClick={() => setStep('status')}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-[var(--text-primary)] mb-2">
              Disable Two-Factor Authentication?
            </h2>
            <p className="text-[var(--text-secondary)] text-center mb-6">
              This will make your account less secure. You&apos;ll need to enter
              your password to confirm.
            </p>

            <form onSubmit={handleDisableSubmit(onDisableSubmit)}>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...registerDisable('password', {
                      required: 'Password is required',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-3 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-[var(--bg-secondary)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {disableErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {disableErrors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Spinner size={20} className="shrink-0" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Disable 2FA
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
        <div className="flex items-start gap-3">
          <Shield className="text-brand w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Two-factor authentication adds an extra layer of security to your
            account by requiring a verification code in addition to your
            password. We recommend using an authenticator app like Google
            Authenticator or Authy.
          </p>
        </div>
      </div>

      {/* Recovery Code Password Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Generate Recovery Codes
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Enter your password to continue
                </p>
              </div>
            </div>
            <form onSubmit={handleRecoveryModalSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type={showRecoveryModalPw ? 'text' : 'password'}
                    value={recoveryModalPassword}
                    onChange={(e) => setRecoveryModalPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-9 pr-10 py-2.5 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-[var(--bg-secondary)] transition-all text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModalPw(!showRecoveryModalPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)]"
                  >
                    {showRecoveryModalPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoveryModalPassword('');
                    setShowRecoveryModalPw(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!recoveryModalPassword || isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Spinner size={16} className="mx-auto" />
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  resetChangePassword();
                  changePasswordMutation.reset();
                }}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {changePasswordMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {changePasswordMutation.error?.message ||
                  'Failed to change password'}
              </div>
            )}

            <form
              onSubmit={handleChangePasswordSubmit(onChangePasswordSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Current Password
                </label>
                <input
                  {...registerChangePassword('currentPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {changePasswordErrors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {changePasswordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  New Password
                </label>
                <input
                  {...registerChangePassword('newPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {changePasswordErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {changePasswordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Confirm New Password
                </label>
                <input
                  {...registerChangePassword('confirmNewPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {changePasswordErrors.confirmNewPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {changePasswordErrors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    resetChangePassword();
                    changePasswordMutation.reset();
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors border border-[var(--border-color)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // Patient context: wrap with PatientLayout + breadcrumb
  if (isPatientContext) {
    return (
      <PatientLayout>
        <div className="max-w-lg mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-brand" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                Security
              </h1>
            </div>
            <p className="text-[var(--text-secondary)]">
              Manage two-factor authentication and account security settings
            </p>
          </div>

          {mainContent}
        </div>
      </PatientLayout>
    );
  }

  if (isClinicStaffContext) {
    return (
      <ClinicStaffLayout>
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-brand" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                Security
              </h1>
            </div>
            <p className="text-[var(--text-secondary)]">
              Manage two-factor authentication for your clinic staff account
            </p>
          </div>
          {mainContent}
        </div>
      </ClinicStaffLayout>
    );
  }

  // Standalone context (e.g. /two-factor-auth during auth flow)
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="text-brand w-10 h-10" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Two-Factor Authentication
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Add an extra layer of security to your account
          </p>
        </div>
        {mainContent}
      </div>
    </div>
  );
};

export default TwoFactorSettingsPage;
