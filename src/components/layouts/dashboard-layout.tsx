import { Outlet } from 'react-router-dom';

/**
 * DashboardLayout - Common layout for dashboard pages
 * Contains header, sidebar, and main content area
 * TODO: Add actual header and sidebar components
 */
const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 px-6 py-4">
        <h1 className="text-xl font-bold text-white">AURA Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
