import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { stripLocaleFromPathname } from '@/i18n/locales';

interface Props {
  children: ReactElement;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const location = useLocation();
  const normalizedPath = stripLocaleFromPathname(location.pathname);

  const isPendingVerification =
    user?.verificationStatus === 'PendingVerification' ||
    (user?.isVerified === false &&
      (!user?.verificationStatus ||
        user?.verificationStatus === 'PendingVerification'));

  if (!isAuthenticated) {
    return <Navigate to={resolvePathWithLocale('/')} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => user?.roles?.includes(role))
  ) {
    return <Navigate to={resolvePathWithLocale('/')} replace />;
  }

  // Redirect unverified ophthalmologists to pending approval page
  const isOphthalmologist = user?.roles?.includes('Ophthalmologist');
  const isPendingApproval = isOphthalmologist && isPendingVerification;

  if (
    isPendingApproval &&
    normalizedPath !== '/ophthalmologist/pending-approval'
  ) {
    return (
      <Navigate
        to={resolvePathWithLocale('/ophthalmologist/pending-approval')}
        replace
      />
    );
  }

  // Redirect ophthalmologists with unsigned contract to the contract page.
  // Use !== false (not strict true) so that null/undefined isVerified also triggers
  // the contract gate — prevents edge-case bypass when the ophthalmologist row
  // doesn't exist yet.
  const needsContract =
    isOphthalmologist &&
    user?.isVerified !== false &&
    user?.contractStatus !== 'Active';

  const isOrgAdmin =
    user?.roles?.includes('OrgAdmin') || user?.roles?.includes('Organization');
  const needsOrganisationContract =
    isOrgAdmin && user?.contractStatus !== 'Active';

  if (needsContract && normalizedPath !== '/ophthalmologist/contract') {
    return (
      <Navigate
        to={resolvePathWithLocale('/ophthalmologist/contract')}
        replace
      />
    );
  }

  if (
    needsOrganisationContract &&
    normalizedPath !== '/organisation/contract'
  ) {
    return (
      <Navigate to={resolvePathWithLocale('/organisation/contract')} replace />
    );
  }

  return children;
};

export default PrivateRoute;
