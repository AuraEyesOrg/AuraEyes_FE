import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { stripLocaleFromPathname } from '@/i18n/locales';
import { NoIndexMeta } from '@/hooks/useSeoMeta';
import { organisationContractApi } from '@/features/organisation/api/contract.api';

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

  // Role check
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => user?.roles?.includes(role))
  ) {
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

  const isOrganisationAdmin =
    user?.roles?.includes('OrgAdmin') || user?.roles?.includes('Organization');
  const mustChangePassword = isOrganisationAdmin && user?.mustChangePassword;
  const isOrganisationContractPath =
    normalizedPath === '/organisation/contract';

  const organisationContractQuery = useQuery({
    queryKey: ['organisation', 'my-contract', 'gate'],
    queryFn: organisationContractApi.getMyContract,
    enabled: isOrganisationAdmin,
    staleTime: 30_000,
    retry: 1,
  });

  const hasActiveOrganisationContract =
    organisationContractQuery.data?.status === 'Active';
  const isOrgContractGateResolved =
    !isOrganisationAdmin ||
    organisationContractQuery.isSuccess ||
    organisationContractQuery.isError;

  if (
    isOrganisationAdmin &&
    !isOrganisationContractPath &&
    !isOrgContractGateResolved
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const isOnChangePasswordTab =
    isOrganisationContractPath &&
    new URLSearchParams(location.search).get('tab') === 'change-password';

  if (
    isOrganisationAdmin &&
    !hasActiveOrganisationContract &&
    !isOrganisationContractPath
  ) {
    return (
      <Navigate to={resolvePathWithLocale('/organisation/contract')} replace />
    );
  }

  if (
    mustChangePassword &&
    hasActiveOrganisationContract &&
    !isOnChangePasswordTab
  ) {
    return (
      <Navigate
        to={resolvePathWithLocale('/organisation/contract?tab=change-password')}
        replace
      />
    );
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
