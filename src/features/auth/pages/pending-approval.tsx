import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Clock3,
  ShieldCheck,
  LogOut,
  Home,
  RefreshCw,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DoctorSidebar from '@/features/ophthalmologist/components/DoctorSidebar';
import DoctorHeader from '@/features/ophthalmologist/components/DoctorHeader';
import {
  getCurrentUser,
  resendConfirmation,
} from '@/features/auth/api/auth.api';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { logout, user, setUser } = useAuthStore((state) => ({
    logout: state.logout,
    user: state.user,
    setUser: state.setUser,
  }));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const hasRedirectedRef = useRef(false);

  const isPendingVerification = useCallback(
    (currentUser: typeof user) =>
      currentUser?.verificationStatus === 'PendingVerification' ||
      (currentUser?.isVerified === false &&
        (!currentUser?.verificationStatus ||
          currentUser?.verificationStatus === 'PendingVerification')),
    []
  );

  const syncApprovalStatus = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (!silent) {
          setIsRefreshing(true);
        }

        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!isPendingVerification(currentUser) && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          toast.success(
            t(
              'AuthPages.pendingApproval.approvedMessage',
              'Your account has been approved. Redirecting to contract page...'
            )
          );
          navigate(resolvePathWithLocale('/ophthalmologist/contract'), {
            replace: true,
          });
        }
      } catch (error) {
        if (!silent) {
          const message =
            error instanceof Error
              ? error.message
              : t(
                  'AuthPages.pendingApproval.refreshError',
                  'Unable to refresh approval status. Please try again.'
                );
          toast.error(message);
        }
      } finally {
        if (!silent) {
          setIsRefreshing(false);
        }
      }
    },
    [isPendingVerification, navigate, setUser, t]
  );

  useEffect(() => {
    if (!isPendingVerification(user) && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate(resolvePathWithLocale('/ophthalmologist/contract'), {
        replace: true,
      });
      return;
    }

    void syncApprovalStatus({ silent: true });

    const timer = window.setInterval(() => {
      void syncApprovalStatus({ silent: true });
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPendingVerification, navigate, syncApprovalStatus, user]);

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

  const handleGoHome = () => {
    navigate(resolvePathWithLocale('/'));
  };

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  const handleResendConfirmationEmail = async () => {
    if (!user?.email || isResendingEmail || resendCooldown > 0) {
      return;
    }

    try {
      setIsResendingEmail(true);
      await resendConfirmation({ email: user.email });
      setResendCooldown(30);
      toast.success(
        t(
          'AuthPages.pendingApproval.resendSuccess',
          'A new confirmation email has been sent.'
        )
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t(
              'AuthPages.pendingApproval.resendError',
              'Unable to resend confirmation email. Please try again.'
            );
      toast.error(message);
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('AuthPages.pendingApproval.title', 'Pending Approval')}
        />

        <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  {t('AuthPages.pendingApproval.statusBadge')}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {t('AuthPages.pendingApproval.title')}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {t('AuthPages.pendingApproval.primaryMessage')}{' '}
                  {t('AuthPages.pendingApproval.secondaryMessage')}
                </p>
              </div>
              <button
                onClick={() => void syncApprovalStatus()}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t('AuthPages.pendingApproval.refreshStatus', 'Refresh status')}
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
                <p className="text-sm leading-6 text-cyan-900 dark:text-cyan-100">
                  {t('AuthPages.pendingApproval.infoBox')}{' '}
                  <span className="font-semibold">
                    ({t('AuthPages.pendingApproval.processingTime')})
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  {t(
                    'AuthPages.pendingApproval.autoRefreshHint',
                    'This page auto-checks your approval status every 30 seconds and redirects you once approved.'
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t(
                      'AuthPages.pendingApproval.resendHint',
                      'Did not receive the confirmation email?'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => void handleResendConfirmationEmail()}
                  disabled={
                    !user?.email || isResendingEmail || resendCooldown > 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isResendingEmail ? 'animate-spin' : ''}`}
                  />
                  {resendCooldown > 0
                    ? t(
                        'AuthPages.pendingApproval.resendCountdown',
                        'Resend in {{seconds}}s',
                        { seconds: resendCooldown }
                      )
                    : t(
                        'AuthPages.pendingApproval.resendButton',
                        'Resend confirmation email'
                      )}
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                <Home className="h-4 w-4" />
                {t('AuthPages.pendingApproval.goHome')}
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                {t('AuthPages.pendingApproval.logout')}
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              {t('AuthPages.pendingApproval.footer')}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
