/**
 * Network Layout Component
 * Main 3-column Twitter-style layout for professional network feature
 *
 * Layout proportions (matching original):
 * - Sidebar: w-0 → xs:w-20 → md:w-24 → xl:w-full xl:max-w-xs (288px)
 * - Main Content: max-w-[600px], border-x on xs+
 * - Right Panel: w-96 (384px), hidden on lg-
 */

import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';
import { NetworkRightPanel } from './NetworkRightPanel';

// Import network-specific styles (scoped CSS for this module)
import '../../styles/network.css';

export function NetworkLayout() {
  return (
    <div className="flex w-full min-h-screen bg-main-background justify-center gap-0 lg:gap-4">
      {/* Sidebar - Twitter style: fixed position, responsive widths */}
      <NetworkSidebar />

      {/* Main Content - Twitter style: max-w-[600px], border-x, centered */}
      <main className="hover-animation flex min-h-screen w-full max-w-[600px] flex-col border-x-0 border-light-border pb-96 xs:border-x">
        <Outlet />
      </main>

      {/* Right Panel - Aside: w-96, search + trends + suggestions */}
      <NetworkRightPanel />
    </div>
  );
}
