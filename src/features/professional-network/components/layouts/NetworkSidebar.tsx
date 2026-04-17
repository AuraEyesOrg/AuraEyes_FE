/**
 * Network Sidebar Component
 * Unified with System Admin Sidebar structure
 * Same width (w-64), bg, padding, and user profile at bottom
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import UserAvatar from '@/components/ui/UserAvatar';

const BRAND_NAME = 'AURA';

const roleLabelConfig: Record<
  string,
  { labelKey: string; labelFallback: string }
> = {
  Ophthalmologist: {
    labelKey: 'ProfessionalNetwork.common.roles.ophthalmologist',
    labelFallback: 'Ophthalmologist',
  },
  OrgAdmin: {
    labelKey: 'ProfessionalNetwork.common.roles.orgAdmin',
    labelFallback: 'Organisation Admin',
  },
  SystemAdmin: {
    labelKey: 'ProfessionalNetwork.common.roles.systemAdmin',
    labelFallback: 'System Admin',
  },
  Patient: {
    labelKey: 'ProfessionalNetwork.common.roles.patient',
    labelFallback: 'Patient',
  },
};

export function NetworkSidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useSafeTranslation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const primaryRole = user?.roles?.[0];
  const primaryRoleConfig =
    primaryRole !== undefined ? roleLabelConfig[primaryRole] : undefined;
  const displayRoleLabel = primaryRoleConfig
    ? t(primaryRoleConfig.labelKey, primaryRoleConfig.labelFallback)
    : primaryRole || t('ProfessionalNetwork.common.member', 'Member');

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

  const networkRootPath = toLocalizedPath('/network');
  const networkFeedPath = toLocalizedPath('/network/feed');
  const isManageSearch =
    new URLSearchParams(location.search).get('tab') === 'manage';

  const navItems = [
    {
      to: '/network',
      icon: Home,
      label: t('ProfessionalNetwork.navigation.feed', 'Feed'),
      isActive: () =>
        (location.pathname === networkRootPath ||
          location.pathname === networkFeedPath) &&
        !isManageSearch,
    },
    {
      to: '/network/discover',
      icon: Compass,
      label: t('ProfessionalNetwork.navigation.discover', 'Discover'),
      isActive: () =>
        location.pathname === toLocalizedPath('/network/discover'),
    },
    {
      to: '/network/saved',
      icon: Bookmark,
      label: t('ProfessionalNetwork.navigation.saved', 'Saved'),
      isActive: () => location.pathname === toLocalizedPath('/network/saved'),
    },
    ...(user?.roles?.includes('SystemAdmin')
      ? [
          {
            to: '/network?tab=manage',
            icon: Shield,
            label: t(
              'ProfessionalNetwork.navigation.managePosts',
              'Manage Posts'
            ),
            isActive: () =>
              (location.pathname === networkRootPath ||
                location.pathname === networkFeedPath) &&
              isManageSearch,
          },
        ]
      : []),
    {
      to: `/network/profile/${user?.id || 'me'}`,
      icon: User,
      label: t('ProfessionalNetwork.navigation.profile', 'Profile'),
      isActive: () =>
        location.pathname ===
        toLocalizedPath(`/network/profile/${user?.id || 'me'}`),
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
            alt={BRAND_NAME}
            className="w-10 h-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-(--text-primary) text-lg font-bold leading-none tracking-tight">
              {BRAND_NAME}
            </h1>
            <p className="text-gray-400 text-xs font-medium tracking-wide uppercase">
              {t('ProfessionalNetwork.common.network', 'Network')}
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
              ? t(
                  'ProfessionalNetwork.sidebar.backToOrganisationDashboard',
                  'Back to Organisation Dashboard'
                )
              : t(
                  'ProfessionalNetwork.sidebar.backToDashboard',
                  'Back to Dashboard'
                )}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={toLocalizedPath(item.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.isActive()
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
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
              {theme === 'dark'
                ? t('ProfessionalNetwork.sidebar.theme.lightMode', 'Light Mode')
                : t('ProfessionalNetwork.sidebar.theme.darkMode', 'Dark Mode')}
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
                fallbackName={t('ProfessionalNetwork.common.user', 'User')}
                size="md"
                className="shrink-0 border-2 border-brand/30 shadow-sm"
                fallbackClassName="bg-brand/20 text-brand"
              />
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {user?.fullName ||
                    t('ProfessionalNetwork.common.user', 'User')}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {displayRoleLabel}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title={t('ProfessionalNetwork.sidebar.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
