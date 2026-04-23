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

  const isOrganisationUser = user?.roles?.some((r) =>
    ['Organization', 'OrgAdmin'].includes(r)
  );
  const isClinicStaff = user?.roles?.includes('ClinicStaff');
  const mustChangePassword =
    (isOrganisationUser || isClinicStaff) && user?.mustChangePassword;

  const organisationContractQuery = useQuery({
    queryKey: ['organisation', 'my-contract', 'gate'],
    queryFn: organisationContractApi.getMyContract,
    enabled: !!isOrganisationUser,
    staleTime: 30_000,
    retry: 1,
  });

  const hasActiveOrganisationContract =
    organisationContractQuery.data?.status === 'Active';
  const isOrgContractGateResolved =
    !isOrganisationUser ||
    organisationContractQuery.isSuccess ||
    organisationContractQuery.isError;

  if (isOrganisationUser && !isOrgContractGateResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (isOrganisationUser && !hasActiveOrganisationContract) {
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

    if (isClinicStaff) {
      // Clinic staff might need a different password change page if organisation/contract is deleted soon
      // For now, if they are forced, we can redirect to a general force-change-password if it exists
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
    : roles.includes('ClinicStaff')
      ? '/clinic-staff/dashboard'
      : roles.includes('Organization') || roles.includes('OrgAdmin')
        ? '/organisation/dashboard'
        : roles.includes('Ophthalmologist')
          ? '/ophthalmologist/dashboard'
          : '/patient/dashboard';

  return <Navigate to={resolvePathWithLocale(dashboardPath)} replace />;
};

export default PublicRoute;
