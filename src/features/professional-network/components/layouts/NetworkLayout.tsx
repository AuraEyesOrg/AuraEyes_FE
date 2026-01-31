/**
 * Network Layout Component
 * Main 3-column layout for professional network feature
 */

import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';
import { NetworkRightPanel } from './NetworkRightPanel';

export function NetworkLayout() {
  return (
    <div className="flex w-full justify-center gap-0 lg:gap-4">
      {/* Sidebar - Twitter style */}
      <NetworkSidebar />

      {/* Main Content - Twitter style: max-w-xl (600px), border-x, hover-animation */}
      <main className="hover-animation flex min-h-screen w-full max-w-[600px] flex-col border-x-0 border-light-border pb-96 xs:border-x">
        <Outlet />
      </main>

      {/* Right Panel - Aside */}
      <NetworkRightPanel />
    </div>
  );
}
