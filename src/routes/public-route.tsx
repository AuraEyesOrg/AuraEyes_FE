import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { stripLocaleFromPathname } from '@/i18n/locales';

interface Props {
  children: ReactElement;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const location = useLocation();
  const normalizedPath = stripLocaleFromPathname(location.pathname);

  if (!isAuthenticated) {
    return children;
  }

  const isOphthalmologist = user?.roles?.includes('Ophthalmologist');
  const isPendingVerification =
    user?.verificationStatus === 'PendingVerification' ||
    (user?.isVerified === false &&
      (!user?.verificationStatus ||
        user?.verificationStatus === 'PendingVerification'));

  if (isOphthalmologist && isPendingVerification) {
    if (normalizedPath === '/ophthalmologist/pending-approval') {
      return children;
    }

    return (
      <Navigate
        to={resolvePathWithLocale('/ophthalmologist/pending-approval')}
        replace
      />
    );
  }

  const roles = user?.roles ?? [];
  const dashboardPath = roles.includes('SystemAdmin')
    ? '/system-admin/dashboard'
    : roles.includes('OrgAdmin') || roles.includes('Organization')
      ? '/organisation/dashboard'
      : roles.includes('Ophthalmologist')
        ? '/ophthalmologist/dashboard'
        : '/patient/dashboard';

  return <Navigate to={resolvePathWithLocale(dashboardPath)} replace />;
};

export default PublicRoute;
