import { Outlet } from 'react-router-dom';

/**
 * MainLayout - Main layout wrapper for public pages
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};

export default MainLayout;
