/**
 * Network Sidebar Component
 * Left navigation sidebar for professional network
 *
 * Responsive widths (matching Twitter):
 * - Mobile: w-0 (hidden) → fixed bottom bar
 * - xs (500px+): w-20 → icons only
 * - md (768px+): w-24
 * - xl (1280px+): w-full max-w-xs (288px) → icons + labels
 */

import { NavLink } from 'react-router-dom';
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
    <header
      id="sidebar"
      className="flex w-0 shrink-0 transition-opacity duration-200 xs:w-20 md:w-24
                 lg:max-w-none xl:-mr-4 xl:w-full xl:max-w-xs xl:justify-end"
    >
      <div
        className="fixed bottom-0 z-10 flex w-full flex-col justify-between border-t border-light-border 
                   bg-main-background py-0 xs:top-0 xs:h-full xs:w-auto xs:border-0 
                   xs:bg-transparent xs:px-2 xs:py-3 xs:pt-2 md:px-4 xl:w-72"
      >
        {/* Logo - Aura Eye icon */}
        <section className="flex flex-col justify-center gap-2 xs:items-center xl:items-stretch">
          <h1 className="hidden xs:flex">
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

          {/* Navigation */}
          <nav className="flex items-center justify-around xs:flex-col xs:justify-center xl:block">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-4 px-3 py-3 rounded-full hover-animation
                   hover:bg-gray-100 xl:pr-6 ${
                     isActive ? 'font-bold text-text-main' : 'text-text-main'
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="w-[26px] h-[26px] shrink-0"
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span className="hidden xl:block text-xl">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Profile Link */}
            <NavLink
              to={`/network/profile/${currentUser.id}`}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-3 py-3 rounded-full hover-animation
                 hover:bg-gray-100 xl:pr-6 ${
                   isActive ? 'font-bold text-text-main' : 'text-text-main'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <User
                    className="w-[26px] h-[26px] shrink-0"
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  <span className="hidden xl:block text-xl">Profile</span>
                </>
              )}
            </NavLink>

            {/* More */}
            <button
              className="group flex items-center gap-4 px-3 py-3 rounded-full hover-animation
                         hover:bg-gray-100 xl:pr-6 text-text-main"
            >
              <MoreHorizontal
                className="w-[26px] h-[26px] shrink-0"
                strokeWidth={1.75}
              />
              <span className="hidden xl:block text-xl">More</span>
            </button>
          </nav>

          {/* New Post Button */}
          <button
            className="accent-tab absolute right-4 -translate-y-[72px] bg-brand-primary text-lg font-bold text-white
                       outline-none transition hover:brightness-90 active:brightness-75 xs:static xs:translate-y-0
                       xs:hover:bg-brand-primary/90 xs:active:bg-brand-primary/75 xl:w-11/12 mt-4 py-3 rounded-full"
          >
            <PenSquare className="block h-6 w-6 xl:hidden mx-auto" />
            <span className="hidden xl:block text-[17px]">Post</span>
          </button>
        </section>

        {/* User Profile at bottom - using currentUser from mock data */}
        <button className="hidden xs:flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 hover-animation w-full">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="hidden xl:block flex-1 min-w-0 text-left">
            <p className="font-bold text-[15px] text-text-main truncate leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[13px] text-text-muted truncate">
              {currentUser.specialty[0]}
            </p>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-text-main shrink-0" />
        </button>
      </div>
    </header>
  );
}
