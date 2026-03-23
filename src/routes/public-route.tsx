import { type ReactElement } from 'react';
import { Navigate } from 'react-router';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';

interface Props {
  children: ReactElement;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore((state) => state);

  if (!isAuthenticated) {
    return children;
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
