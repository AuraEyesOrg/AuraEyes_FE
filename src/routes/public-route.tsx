import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';

/**
 * PublicRoute component for routes that redirect authenticated users
 * Uses Outlet pattern recommended by React Router v6
 */
const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore((state) => state);

  return isAuthenticated ? (
    <Navigate to="/patient/dashboard" replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
