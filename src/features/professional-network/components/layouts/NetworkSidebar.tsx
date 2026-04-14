/**
 * Network Sidebar Component
 * Unified with System Admin Sidebar structure
 * Same width (w-64), bg, padding, and user profile at bottom
 */

import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bookmark,
  User,
  Shield,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import UserAvatar from '@/components/ui/UserAvatar';

export function NetworkSidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const stateDashboardRoute = (location.state as { dashboardRoute?: string })
    ?.dashboardRoute;

  const dashboardRoute = stateDashboardRoute
    ? stateDashboardRoute
    : user?.roles?.includes('OrgAdmin')
      ? '/organisation/dashboard'
      : user?.roles?.includes('Ophthalmologist')
        ? '/ophthalmologist/dashboard'
        : user?.roles?.includes('SystemAdmin')
          ? '/system-admin/dashboard'
          : '/';
  const localizedDashboardRoute = toLocalizedPath(dashboardRoute);

  const navItems = [
    { to: '/network', icon: Home, label: 'Feed', end: true },
    { to: '/network/discover', icon: Compass, label: 'Discover' },
    { to: '/network/saved', icon: Bookmark, label: 'Saved' },
    ...(user?.roles?.includes('SystemAdmin')
      ? [{ to: '/network?tab=manage', icon: Shield, label: 'Manage Posts' }]
      : []),
    {
      to: `/network/profile/${user?.id || 'me'}`,
      icon: User,
      label: 'Profile',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate(toLocalizedPath('/login'));
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo - AURA Network */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <img
            src="/logo.png"
            alt="AURA"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-(--text-primary) text-lg font-bold leading-none tracking-tight">
              AURA
            </h1>
            <p className="text-gray-400 text-xs font-medium tracking-wide uppercase">
              Network
            </p>
          </div>
        </div>

        {/* Back to Dashboard */}
        <Link
          to={localizedDashboardRoute}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">
            {user?.roles?.includes('OrgAdmin')
              ? 'Back to Organisation Dashboard'
              : 'Back to Dashboard'}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={toLocalizedPath(item.to)}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mt-1"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </nav>

        {/* User Profile Footer - pinned to bottom */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1">
              <UserAvatar
                fullName={user?.fullName}
                avatarUrl={user?.avatarUrl}
                fallbackName="User"
                size="md"
                className="shrink-0 border-2 border-brand/30 shadow-sm"
                fallbackClassName="bg-brand/20 text-brand"
              />
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.roles?.[0] || 'Member'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
