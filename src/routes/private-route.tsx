import { type ReactElement } from 'react';
import { Navigate } from 'react-router';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
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

  return (
    <>
      {/* Prevent all private/authenticated pages from being indexed */}
      <NoIndexMeta />
      {children}
    </>
  );
};

export default PrivateRoute;
