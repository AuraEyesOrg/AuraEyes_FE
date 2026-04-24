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

  // Email verification routes must remain accessible even when user is logged in.
  if (
    normalizedPath === '/confirm-email' ||
    normalizedPath === '/email-verification-required'
  ) {
    return children;
  }

  const roles = user?.roles ?? [];
  const dashboardPath = roles.includes('SystemAdmin')
    ? '/system-admin/dashboard'
    : roles.includes('OrgAdmin') || roles.includes('Organization')
      ? '/organisation/dashboard'
      : roles.includes('ClinicStaff')
        ? '/clinic-staff/dashboard'
        : roles.includes('Ophthalmologist')
          ? '/ophthalmologist/dashboard'
          : '/patient/dashboard';

  return <Navigate to={resolvePathWithLocale(dashboardPath)} replace />;
};

export default PublicRoute;
