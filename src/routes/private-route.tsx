import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';

/**
 * PrivateRoute component that protects routes requiring authentication
 * Uses Outlet pattern recommended by React Router v6
 */
const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore((state) => state);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
