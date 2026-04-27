import useAuthStore from '@/store/auth-store';
import { useMemo } from 'react';

/**
 * Hook to check if the current user has specific permissions
 * Supports single permission check, multiple (all required), and multiple (any required)
 */
const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = useMemo(
    () => user?.permissions || [],
    [user?.permissions]
  );

  const hasPermission = (permission: string): boolean => {
    // SystemAdmin has all permissions by default
    if (user?.roles?.includes('SystemAdmin')) return true;
    return permissions.includes(permission);
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (user?.roles?.includes('SystemAdmin')) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  const hasAnyPermission = (anyPermissions: string[]): boolean => {
    if (user?.roles?.includes('SystemAdmin')) return true;
    return anyPermissions.some((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isSystemAdmin: user?.roles?.includes('SystemAdmin') || false,
    subRoles: user?.subRoles || [],
    hasSubRole: (role: string): boolean => {
      if (user?.roles?.includes('SystemAdmin')) return true;
      return (user?.subRoles || []).includes(role);
    },
  };
};

export default usePermissions;
