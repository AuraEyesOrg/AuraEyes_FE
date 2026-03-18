import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '@/store/auth-store';

interface Props {
  children: ReactElement;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Redirect unverified ophthalmologists to pending approval page
  const isOphthalmologist = user?.roles?.includes('Ophthalmologist');
  const isPendingApproval = isOphthalmologist && user?.isVerified === false;

  if (isPendingApproval && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
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

  if (needsContract && location.pathname !== '/ophthalmologist/contract') {
    return <Navigate to="/ophthalmologist/contract" replace />;
  }

  if (
    needsOrganisationContract &&
    location.pathname !== '/organisation/contract'
  ) {
    return <Navigate to="/organisation/contract" replace />;
  }

  return children;
};

export default PrivateRoute;
