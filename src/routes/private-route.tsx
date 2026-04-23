import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { stripLocaleFromPathname } from '@/i18n/locales';
import { NoIndexMeta } from '@/hooks/useSeoMeta';

interface Props {
  children: ReactElement;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

const PrivateRoute: React.FC<Props> = ({
  children,
  allowedRoles,
  requiredPermissions,
}) => {
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

  // Role check helper
  const hasAnyRole = (roles: string[]) => {
    if (!user?.roles) return false;
    const normalizedUserRoles = user.roles.map((r) =>
      r.toLowerCase().replace(/[\s_-]/g, '')
    );
    return roles.some((role) => {
      const normalizedAllowedRole = role.toLowerCase().replace(/[\s_-]/g, '');
      return normalizedUserRoles.includes(normalizedAllowedRole);
    });
  };

  if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={resolvePathWithLocale('/')} replace />;
  }

  // Permission check
  if (
    requiredPermissions &&
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((permission) =>
      user?.permissions?.includes(permission)
    )
  ) {
    return <Navigate to={resolvePathWithLocale('/')} replace />;
  }

  const isClinicStaff = hasAnyRole(['ClinicStaff']);
  const mustChangePassword = user?.mustChangePassword === true;
  const isForceChangePasswordPath = normalizedPath === '/force-change-password';

  if (mustChangePassword && !isForceChangePasswordPath) {
    return (
      <Navigate to={resolvePathWithLocale('/force-change-password')} replace />
    );
  }

  const mustUpdateProfile = user?.mustUpdateProfile === true;
  const isForceUpdateProfilePath = normalizedPath === '/force-update-profile';

  if (mustUpdateProfile && !isForceUpdateProfilePath) {
    return (
      <Navigate to={resolvePathWithLocale('/force-update-profile')} replace />
    );
  }

  // Redirect unverified ophthalmologists to pending approval page
  const isOphthalmologist = hasAnyRole(['Ophthalmologist']);
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

  if (needsContract && normalizedPath !== '/ophthalmologist/contract') {
    return (
      <Navigate
        to={resolvePathWithLocale('/ophthalmologist/contract')}
        replace
      />
    );
  }

  return (
    <>
      {/* Prevent all private/authenticated pages from being indexed */}
      <NoIndexMeta />
      {children}
    </>
  );
};

export default PrivateRoute;
