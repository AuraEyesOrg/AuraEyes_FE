import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AuraLogo } from '@/components/ui/aura-logo';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const handleGoHome = () => {
    navigate(resolvePathWithLocale('/'));
  };

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-white p-2 shadow-lg border border-gray-100">
            <AuraLogo
              size="md"
              subtitle={t('AuthPages.pendingApproval.brandSubtitle')}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t('AuthPages.pendingApproval.brandDescription')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <svg
                className="h-10 w-10 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              {t('AuthPages.pendingApproval.statusBadge')}
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">
            {t('AuthPages.pendingApproval.title')}
          </h2>

          {/* Message */}
          <p className="mb-6 text-center leading-relaxed text-gray-600">
            {t('AuthPages.pendingApproval.primaryMessage')}{' '}
            {t('AuthPages.pendingApproval.secondaryMessage')}{' '}
            <span className="font-semibold text-gray-800">
              {t('AuthPages.pendingApproval.processingTime')}
            </span>
            . {t('AuthPages.pendingApproval.closing')}
          </p>

          {/* Info Box */}
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p className="text-sm text-blue-700">
                {t('AuthPages.pendingApproval.infoBox')}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoHome}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-105"
            >
              {t('AuthPages.pendingApproval.goHome')}
            </button>
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              {t('AuthPages.pendingApproval.logout')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          {t('AuthPages.pendingApproval.footer')}
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
