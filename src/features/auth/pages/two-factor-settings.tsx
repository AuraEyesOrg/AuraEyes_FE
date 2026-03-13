import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

const TwoFactorSettingsPage = () => {
  const navigate = useNavigate();
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
    const content = `AURA Medical - 2FA Recovery Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes securely. Each code can only be used once.

${recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, use one of these codes to sign in.
After using a recovery code, we recommend generating new codes.`;

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

  // Loading state
  if (isLoading && step === 'status' && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size={32} className="mx-auto" />
          <p className="mt-4 text-gray-600">Loading 2FA settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="text-[#00d1c0] w-10 h-10" />
            <h1 className="text-3xl font-bold text-[#1A202C]">
              Two-Factor Authentication
            </h1>
          </div>
          <p className="text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
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

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status View */}
          {step === 'status' && status && (
            <div className="p-8">
              {/* Status Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    status.isEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  {status.isEnabled ? (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  ) : (
                    <XCircle className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-[#1A202C] mb-2">
                {status.isEnabled
                  ? 'Two-Factor Authentication is Enabled'
                  : 'Two-Factor Authentication is Disabled'}
              </h2>

              <p className="text-gray-600 text-center mb-8">
                {status.isEnabled
                  ? 'Your account is protected with an additional layer of security.'
                  : 'Enable 2FA to add extra security to your account.'}
              </p>

              {status.isEnabled && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="text-[#1F85F5] w-5 h-5" />
                      <span className="text-sm text-gray-700">
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

              {/* Action Buttons */}
              <div className="space-y-3">
                {!status.isEnabled ? (
                  <button
                    onClick={handleSetup}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Smartphone className="w-5 h-5" />
                    Enable Two-Factor Authentication
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setStep('disable')}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      <XCircle className="w-5 h-5" />
                      Disable Two-Factor Authentication
                    </button>
                    {status.recoveryCodesRemaining <= 3 && (
                      <button
                        onClick={() => {
                          const password = prompt(
                            'Enter your password to generate new recovery codes:'
                          );
                          if (password) handleGenerateRecoveryCodes(password);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-[#1F85F5] border border-[#1F85F5] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F85F5] transition-all duration-200"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Generate New Recovery Codes
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 mt-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-xl font-semibold text-[#1A202C] mb-2">
                Set Up Authenticator App
              </h2>
              <p className="text-gray-600 mb-6">
                Scan the QR code below with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      setupData.authenticatorUri
                    )}`}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Manual Entry Key */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                  Or enter this key manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 text-[var(--color-text-main)] bg-white rounded border border-gray-200 font-mono text-sm break-all">
                    {setupData.formattedKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.sharedKey, 'key')}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {copiedKey ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifySubmit(onVerifySubmit)}>
                <div className="mb-4">
                  <label
                    htmlFor="code"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
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
                    className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] bg-gray-50/30 transition-all"
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-[#1A202C] mb-2">
                Save Your Recovery Codes
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Store these codes in a safe place. You can use them to access
                your account if you lose your authenticator device.
              </p>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700">
                  Each code can only be used once. After using a code, it will
                  be invalidated.
                </p>
              </div>

              {/* Recovery Codes Grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {recoveryCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg font-mono text-sm text-center text-[var(--color-text-muted)] border border-gray-200"
                  >
                    {code}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() =>
                    copyToClipboard(recoveryCodes.join('\n'), 'codes')
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm text-[var(--color-text-main)] font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm text-[var(--color-text-main)] font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <button
                onClick={fetchStatus}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200"
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
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-[#1A202C] mb-2">
                Disable Two-Factor Authentication?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                This will make your account less secure. You'll need to enter
                your password to confirm.
              </p>

              <form onSubmit={handleDisableSubmit(onDisableSubmit)}>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...registerDisable('password', {
                        required: 'Password is required',
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-gray-50/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Two-factor authentication adds an extra layer of security to your
              account by requiring a verification code in addition to your
              password. We recommend using an authenticator app like Google
              Authenticator or Authy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSettingsPage;
