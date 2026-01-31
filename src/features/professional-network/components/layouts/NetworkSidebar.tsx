/**
 * Network Sidebar Component
 * Left navigation sidebar for professional network
 *
 * EXACT Responsive widths (matching Twitter):
 * - Mobile (<500px): w-0 (hidden) → fixed bottom bar
 * - 500px+: w-[68px] → icons only, centered
 * - 768px+: w-[88px]
 * - 1280px+: w-[275px] → icons + labels, right-aligned content
 */

import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  UsersRound,
  Bookmark,
  User,
  MoreHorizontal,
  PenSquare,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { currentUser } from '../../data';

const navItems = [
  { to: '/network', icon: Home, label: 'Feed', end: true },
  { to: '/network/discover', icon: Compass, label: 'Discover' },
  { to: '/network/connections', icon: Users, label: 'Connections' },
  { to: '/network/groups', icon: UsersRound, label: 'Groups' },
  { to: '/network/saved', icon: Bookmark, label: 'Saved' },
];

export function NetworkSidebar() {
  return (
    <header id="network-sidebar" className="network-sidebar-header">
      <div className="network-sidebar-inner">
        {/* Logo - Aura Eye icon with back to dashboard */}
        <section className="network-sidebar-section">
          <h1 className="network-sidebar-logo">
            <NavLink
              to="/network"
              className="custom-button main-tab text-brand-primary transition hover:bg-brand-primary/10 
                         focus-visible:bg-brand-primary/10 focus-visible:!ring-brand-primary/80 p-3"
            >
              <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </NavLink>
          </h1>

          {/* Back to Dashboard Link */}
          <Link
            to="/system-admin/dashboard"
            className="network-nav-link hover-animation text-text-muted hover:text-brand-primary"
            title="Back to Dashboard"
          >
            <ArrowLeft
              className="w-[22px] h-[22px] flex-shrink-0"
              strokeWidth={1.75}
            />
            <span className="network-nav-label text-base">Dashboard</span>
          </Link>

          {/* Navigation */}
          <nav className="network-sidebar-nav">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `network-nav-link hover-animation ${
                    isActive ? 'font-bold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="w-[26px] h-[26px] shrink-0"
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span className="network-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Profile Link */}
            <NavLink
              to={`/network/profile/${currentUser.id}`}
              className={({ isActive }) =>
                `network-nav-link hover-animation ${
                  isActive ? 'font-bold' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <User
                    className="w-[26px] h-[26px] shrink-0"
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  <span className="network-nav-label">Profile</span>
                </>
              )}
            </NavLink>

            {/* More */}
            <button className="network-nav-link hover-animation">
              <MoreHorizontal
                className="w-[26px] h-[26px] shrink-0"
                strokeWidth={1.75}
              />
              <span className="network-nav-label">More</span>
            </button>
          </nav>

          {/* New Post Button */}
          <button className="network-post-button">
            <PenSquare className="network-post-icon" />
            <span className="network-post-text">Post</span>
          </button>
        </section>

        {/* User Profile at bottom - using currentUser from mock data */}
        <button className="network-profile-button">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="network-profile-info">
            <p className="font-bold text-[15px] text-text-main truncate leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[13px] text-text-muted truncate">
              {currentUser.specialty[0]}
            </p>
          </div>
          <MoreHorizontal className="network-profile-more" />
        </button>
      </div>
    </header>
  );
}
