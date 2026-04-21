import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';

export default function ForceChangePasswordPage() {
  const { user } = useAuthStore();

  const isOrgAdmin =
    user?.roles?.includes('OrgAdmin') || user?.roles?.includes('Organization');

  if (!isOrgAdmin) {
    return <Navigate to={resolvePathWithLocale('/')} replace />;
  }

  const nextPath =
    user?.contractStatus === 'Active'
      ? '/organisation/contract?tab=change-password'
      : '/organisation/contract';

  return <Navigate to={resolvePathWithLocale(nextPath)} replace />;
}
