import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { confirmEmail, getCurrentUser, resendConfirmation } from '../api';
import useAuthStore from '@/store/auth-store';
import { shouldRedirectToContract } from '../utils/contract-status';

type PageState = 'verifying' | 'success' | 'error' | 'resend';

const TOAST_IDS = {
  confirmSuccess: 'confirm-email-success',
  confirmError: 'confirm-email-error',
  resendSuccess: 'confirm-email-resend-success',
  resendError: 'confirm-email-resend-error',
} as const;

const ConfirmEmailPage = () => {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token')?.replace(/ /g, '+') ?? null;
  const emailFromQuery = searchParams.get('email')?.trim() ?? '';

  const [state, setState] = useState<PageState>(
    userId && token ? 'verifying' : 'resend'
  );
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedAuthPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const didVerify = useRef(false);

  const isPendingVerification = useCallback(
    (currentUser: typeof user) =>
      currentUser?.verificationStatus === 'PendingVerification' ||
      (currentUser?.isVerified === false &&
        (!currentUser?.verificationStatus ||
          currentUser?.verificationStatus === 'PendingVerification')),
    []
  );

  const resolveNextPath = useCallback(
    (currentUser: NonNullable<typeof user>) => {
      const roles = currentUser.roles ?? [];

      if (roles.includes('SystemAdmin')) {
        return '/system-admin/dashboard';
      }

      if (roles.includes('OrgAdmin')) {
        return '/organisation/dashboard';
      }

      if (roles.includes('Ophthalmologist')) {
        if (isPendingVerification(currentUser)) {
          return '/ophthalmologist/pending-approval';
        }

        return shouldRedirectToContract(currentUser.contractStatus)
          ? '/ophthalmologist/contract'
          : '/ophthalmologist/dashboard';
      }

      if (roles.includes('Patient')) {
        return '/patient/dashboard';
      }

      return '/';
    },
    [isPendingVerification]
  );

  const resolvePostConfirmPath = useCallback(async () => {
    try {
      setIsRefreshingSession(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      return withLocalePathname(locale, resolveNextPath(currentUser));
    } catch {
      return toLocalizedAuthPath('/login');
    } finally {
      setIsRefreshingSession(false);
    }
  }, [locale, resolveNextPath, setUser, toLocalizedAuthPath]);

  const refreshSessionAndContinue = useCallback(async () => {
    const nextPath = await resolvePostConfirmPath();
    navigate(nextPath, { replace: true });
  }, [navigate, resolvePostConfirmPath]);

  const resolveApiErrorMessage = useCallback(
    (err: unknown, fallback: string) => {
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
    },
    []
  );

  useEffect(() => {
    if (!resendEmail && user?.email) {
      setResendEmail(user.email);
    }
  }, [resendEmail, user?.email]);

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

  useEffect(() => {
    if (!redirectTarget || redirectCountdown == null) {
      return;
    }

    if (redirectCountdown <= 0) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    const timer = window.setInterval(() => {
      setRedirectCountdown((prev) =>
        prev == null ? null : Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [navigate, redirectCountdown, redirectTarget]);

  useEffect(() => {
    if (!userId || !token || didVerify.current) return;
    didVerify.current = true;

    confirmEmail({ userId, token })
      .then(async () => {
        toast.success(t('AuthPages.confirmEmail.success.description'), {
          toastId: TOAST_IDS.confirmSuccess,
        });
        setState('success');
        const nextPath = await resolvePostConfirmPath();
        setRedirectTarget(nextPath);
        setRedirectCountdown(5);
      })
      .catch((err) => {
        const msg = resolveApiErrorMessage(
          err,
          t('AuthPages.confirmEmail.error.defaultMessage')
        );
        toast.error(msg, { toastId: TOAST_IDS.confirmError });
        setState('error');
      });
  }, [resolveApiErrorMessage, resolvePostConfirmPath, t, token, userId]);

  const handleResend = async () => {
    if (!resendEmail || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await resendConfirmation({ email: resendEmail });
      setResendCooldown(30);
      toast.success(t('AuthPages.confirmEmail.resend.successDescription'), {
        toastId: TOAST_IDS.resendSuccess,
      });
    } catch (err) {
      const msg = resolveApiErrorMessage(
        err,
        t('AuthPages.confirmEmail.error.defaultMessage')
      );
      toast.error(msg, { toastId: TOAST_IDS.resendError });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      {state === 'verifying' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('AuthPages.confirmEmail.verifying.title')}
          </h2>
          <p className="text-gray-500 text-sm">
            {t('AuthPages.confirmEmail.verifying.description')}
          </p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t('AuthPages.confirmEmail.success.title')}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {t('AuthPages.confirmEmail.success.description')}
          </p>
          <p className="mb-4 text-sm font-medium text-slate-600">
            {t(
              'AuthPages.confirmEmail.success.redirectCountdown',
              'Automatically continuing in {{seconds}}s...',
              { seconds: redirectCountdown ?? 5 }
            )}
          </p>
          <button
            type="button"
            onClick={() => void refreshSessionAndContinue()}
            disabled={isRefreshingSession}
            className="mb-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshingSession ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t(
              'AuthPages.confirmEmail.success.refreshAndContinue',
              'Refresh and continue'
            )}
          </button>
          <Link
            to={toLocalizedAuthPath('/login')}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
          >
            {t('AuthPages.confirmEmail.success.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-6">
            <XCircle className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t('AuthPages.confirmEmail.error.title')}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {t('AuthPages.confirmEmail.error.defaultMessage')}
          </p>
          <button
            type="button"
            onClick={() => setState('resend')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            {t('AuthPages.confirmEmail.error.resend')}
          </button>
          <div className="mt-6 border-t border-gray-100 pt-6 w-full">
            <Link
              to={toLocalizedAuthPath('/login')}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← {t('AuthPages.shared.backToLogin')}
            </Link>
          </div>
        </div>
      )}

      {state === 'resend' && (
        <>
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('AuthPages.confirmEmail.resend.title')}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('AuthPages.confirmEmail.resend.description')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                {t('AuthPages.confirmEmail.resend.emailLabel')}
              </label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder={t(
                  'AuthPages.confirmEmail.resend.emailPlaceholder'
                )}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail || resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-background-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
            >
              {resendLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {resendCooldown > 0
                    ? t(
                        'AuthPages.confirmEmail.resend.cooldown',
                        'Resend in {{seconds}}s',
                        { seconds: resendCooldown }
                      )
                    : t('AuthPages.confirmEmail.resend.button')}
                  <RefreshCw className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center border-t border-gray-100 pt-6 mt-6">
            <Link
              to={toLocalizedAuthPath('/login')}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              ← {t('AuthPages.shared.backToLogin')}
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ConfirmEmailPage;
