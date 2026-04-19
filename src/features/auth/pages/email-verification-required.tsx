import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthLayout } from '@/components/layouts';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { resendConfirmation } from '../api';

const TOAST_IDS = {
  resendSuccess: 'email-verification-required-resend-success',
  resendError: 'email-verification-required-resend-error',
} as const;

const EmailVerificationRequiredPage = () => {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const emailFromQuery = searchParams.get('email')?.trim() ?? '';
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedAuthPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resolveApiErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            errors?: string[] | Record<string, string[]>;
          };
        };
      };

      const responseErrors = axiosError.response?.data?.errors;
      const flattenedErrors = Array.isArray(responseErrors)
        ? responseErrors
        : responseErrors
          ? Object.values(responseErrors).flat()
          : [];

      return (
        axiosError.response?.data?.message ||
        flattenedErrors.find(Boolean) ||
        fallback
      );
    }

    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  };

  useEffect(() => {
    if (!resendEmail && emailFromQuery) {
      setResendEmail(emailFromQuery);
    }
  }, [emailFromQuery, resendEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleResend = async () => {
    const normalizedEmail = resendEmail.trim();

    if (!normalizedEmail || resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmation({ email: normalizedEmail });
      setResendCooldown(30);
      toast.success(
        t(
          'AuthPages.emailVerificationRequired.resendSuccess',
          'Verification email sent successfully.'
        ),
        { toastId: TOAST_IDS.resendSuccess }
      );
    } catch (err) {
      const msg = resolveApiErrorMessage(
        err,
        t('AuthPages.confirmEmail.error.defaultMessage')
      );
      toast.error(msg, { toastId: TOAST_IDS.resendError });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle className="h-9 w-9" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          {t(
            'AuthPages.emailVerificationRequired.title',
            'Email Verification Required'
          )}
        </h2>

        <p className="text-gray-600 mb-2">
          {t(
            'AuthPages.emailVerificationRequired.subtitle',
            'Your account is not verified yet.'
          )}
        </p>

        <p className="text-gray-600 mb-6">
          {t(
            'AuthPages.emailVerificationRequired.description',
            'Please verify your email to continue using your account.'
          )}
        </p>

        <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            {t(
              'AuthPages.emailVerificationRequired.emailLabel',
              'Verification email address'
            )}
          </label>
          <input
            type="email"
            value={resendEmail}
            onChange={(event) => setResendEmail(event.target.value)}
            placeholder={t(
              'AuthPages.emailVerificationRequired.emailPlaceholder',
              'name@example.com'
            )}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={!resendEmail || resendCooldown > 0 || isResending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-background-dark transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {resendCooldown > 0
              ? t(
                  'AuthPages.emailVerificationRequired.resendCooldown',
                  'Resend in {{seconds}}s',
                  { seconds: resendCooldown }
                )
              : t(
                  'AuthPages.emailVerificationRequired.resendButton',
                  'Resend verification email'
                )}
          </button>
        </div>

        <p className="mt-5 text-sm text-blue-800">
          {t(
            'AuthPages.emailVerificationRequired.hint',
            'Please check your email'
          )}{' '}
          <strong>{resendEmail || emailFromQuery || '-'}</strong>{' '}
          {t(
            'AuthPages.emailVerificationRequired.hintSuffix',
            'to verify your account.'
          )}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={toLocalizedAuthPath('/login')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00d1c0] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#00b8a9]"
          >
            {t('AuthPages.shared.backToLogin', 'Back to Login')}
          </Link>

          <Link
            to={toLocalizedAuthPath('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            {t(
              'AuthPages.emailVerificationRequired.backToHome',
              'Back to Home'
            )}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationRequiredPage;
