import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { stripLocaleFromPathname } from '@/i18n/locales';
import { organisationContractApi } from '@/features/organisation/api/contract.api';

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

  const isOrganisationAdmin =
    user?.roles?.includes('OrgAdmin') || user?.roles?.includes('Organization');
  const mustChangePassword = isOrganisationAdmin && user?.mustChangePassword;

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

  if (isOrganisationAdmin && !isOrgContractGateResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (isOrganisationAdmin && !hasActiveOrganisationContract) {
    return (
      <Navigate to={resolvePathWithLocale('/organisation/contract')} replace />
    );
  }

  if (mustChangePassword) {
    if (
      normalizedPath === '/organisation/contract' &&
      new URLSearchParams(location.search).get('tab') === 'change-password'
    ) {
      return children;
    }

    return (
      <Navigate
        to={resolvePathWithLocale('/organisation/contract?tab=change-password')}
        replace
      />
    );
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
