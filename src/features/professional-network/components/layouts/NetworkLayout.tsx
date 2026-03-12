/**
 * Network Layout Component
 * Unified layout matching System Admin Dashboard structure
 *
 * Layout: w-64 Sidebar + flex-1 Main Content (same as Dashboard)
 */

import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';

// Import network-specific styles (scoped CSS for this module)
import '../../styles/network.css';

export function NetworkLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <NetworkSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
