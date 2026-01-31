/**
 * Network Layout Component
 * Main 3-column Twitter-style layout for professional network feature
 *
 * EXACT Layout proportions (matching Twitter reference):
 * - Sidebar Header: w-0 → w-[68px] (500px+) → w-[88px] (768px+) → w-[275px] (1280px+)
 * - Main Content: w-full max-w-[600px], border-x on 500px+
 * - Right Panel: w-[350px], hidden below 1024px
 *
 * Total at xl: 275 + 600 + 350 + gaps = ~1280px container
 */

import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';
import { NetworkRightPanel } from './NetworkRightPanel';

// Import network-specific styles (scoped CSS for this module)
import '../../styles/network.css';

export function NetworkLayout() {
  return (
    <div className="network-layout-container">
      {/* Sidebar - Twitter style: fixed position, responsive widths */}
      <NetworkSidebar />

      {/* Main Content - Twitter style: max-w-[600px], border-x, centered */}
      <main className="network-main-content">
        <Outlet />
      </main>

      {/* Right Panel - Aside: w-[350px], search + trends + suggestions */}
      <NetworkRightPanel />
    </div>
  );
}
