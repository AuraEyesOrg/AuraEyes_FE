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

  return children;
};

export default PrivateRoute;
