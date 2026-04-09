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
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { confirmEmail, getCurrentUser, resendConfirmation } from '../api';
import useAuthStore from '@/store/auth-store';

type PageState = 'verifying' | 'success' | 'error' | 'resend';

const ConfirmEmailPage = () => {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>(
    userId && token ? 'verifying' : 'resend'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const { user, setUser } = useAuthStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }));
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
        return currentUser.contractStatus !== 'Active'
          ? '/organisation/contract'
          : '/organisation/dashboard';
      }

      if (roles.includes('Ophthalmologist')) {
        if (isPendingVerification(currentUser)) {
          return '/ophthalmologist/pending-approval';
        }

        return currentUser.contractStatus !== 'Active'
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

  const refreshSessionAndContinue = useCallback(async () => {
    try {
      setIsRefreshingSession(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      navigate(withLocalePathname(locale, resolveNextPath(currentUser)), {
        replace: true,
      });

      return true;
    } catch {
      return false;
    } finally {
      setIsRefreshingSession(false);
    }
  }, [locale, navigate, resolveNextPath, setUser]);

  useEffect(() => {
    if (!resendEmail && user?.email) {
      setResendEmail(user.email);
    }
  }, [resendEmail, user?.email]);

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
    if (!userId || !token || didVerify.current) return;
    didVerify.current = true;

    confirmEmail({ userId, token })
      .then(async () => {
        setState('success');
        await refreshSessionAndContinue();
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          t('AuthPages.confirmEmail.error.defaultMessage');
        setErrorMessage(msg);
        setState('error');
      });
  }, [refreshSessionAndContinue, t, token, userId]);

  const handleResend = async () => {
    if (!resendEmail || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await resendConfirmation({ email: resendEmail });
      setResendSent(true);
      setResendCooldown(30);
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
          <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
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

          {resendSent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-gray-700 font-medium">
                {t('AuthPages.confirmEmail.resend.successTitle')}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {t('AuthPages.confirmEmail.resend.successDescription')}
              </p>
            </div>
          ) : (
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
          )}

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
