import { useNavigate } from 'react-router';
import { AuraLogo } from '@/components/ui/aura-logo';
import { Clock3, ShieldCheck, LogOut, Home } from 'lucide-react';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const logout = useAuthStore((state) => state.logout);

  const handleGoHome = () => {
    navigate(resolvePathWithLocale('/'));
  };

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <AuraLogo
              size="md"
              subtitle={t('AuthPages.pendingApproval.brandSubtitle')}
            />
          </div>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-100/50 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />

          <div className="relative border-b border-slate-100 px-6 py-6 sm:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
              <Clock3 className="h-4 w-4" />
              {t('AuthPages.pendingApproval.statusBadge')}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t('AuthPages.pendingApproval.title')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              {t('AuthPages.pendingApproval.primaryMessage')}{' '}
              {t('AuthPages.pendingApproval.secondaryMessage')}
            </p>
          </div>

          <div className="relative space-y-5 px-6 py-6 sm:px-8">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
                <p className="text-sm leading-6 text-cyan-900">
                  {t('AuthPages.pendingApproval.infoBox')}{' '}
                  <span className="font-semibold">
                    ({t('AuthPages.pendingApproval.processingTime')})
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleGoHome}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg"
              >
                <Home className="h-4 w-4" />
                {t('AuthPages.pendingApproval.goHome')}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                {t('AuthPages.pendingApproval.logout')}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              {t('AuthPages.pendingApproval.footer')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
