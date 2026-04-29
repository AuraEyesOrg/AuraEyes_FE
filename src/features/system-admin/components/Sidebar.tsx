/**
 * System Admin Sidebar Navigation
 * Main navigation for system admin dashboard
 */

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Globe, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import usePermissions from '@/hooks/use-permissions';
import { dashboardNavItem, sidebarNavItems } from './sidebar-data';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { resolvePathWithLocale, persistLocale } from '@/i18n/middleware';
import type { AppLocale } from '@/i18n/locales';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user, logout } = useAuthStore();
  const { hasPermission } = usePermissions();
  const systemAdminLabel = t('SystemAdmin.common.systemAdmin', 'System Admin');

  const activePath = stripLocaleFromPathname(location.pathname);

  const handleNavClick = (
    e: React.MouseEvent,
    item: (typeof sidebarNavItems)[number] | typeof dashboardNavItem
  ) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      e.preventDefault();
      toast.warning(t('Common.noPermission'));
      return;
    }
  };

  const navItems = sidebarNavItems;

  const avatarMeta = getUserAvatarMeta(user?.fullName, systemAdminLabel);
  const displayName = avatarMeta.displayName;
  const displayEmail = user?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { i18n } = useTranslation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;

  const handleToggleLanguage = () => {
    const newLocale: AppLocale = locale === 'en' ? 'vi' : 'en';
    persistLocale(newLocale);
    i18n.changeLanguage(newLocale);
    const newPath = withLocalePathname(newLocale, location.pathname);
    navigate(newPath);
  };

  return (
    <aside className="w-70 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8 px-2">
          <AuraLogo
            size="md"
            subtitle={systemAdminLabel}
            to={resolvePathWithLocale('/system-admin/dashboard')}
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
          <NavLink
            to={resolvePathWithLocale(dashboardNavItem.path)}
            onClick={(e) => handleNavClick(e, dashboardNavItem)}
            className={({ isActive }) => {
              const isLocked =
                dashboardNavItem.requiredPermission &&
                !hasPermission(dashboardNavItem.requiredPermission);
              return `group flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : isLocked
                    ? 'text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`;
            }}
          >
            {({ isActive }) => {
              const isLocked =
                dashboardNavItem.requiredPermission &&
                !hasPermission(dashboardNavItem.requiredPermission);
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        isActive
                          ? 'text-primary'
                          : isLocked
                            ? 'text-slate-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }
                    >
                      <dashboardNavItem.icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium">
                      {t('SystemAdmin.sidebar.dashboard', 'Dashboard')}
                    </span>
                  </div>
                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </>
              );
            }}
          </NavLink>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={resolvePathWithLocale(item.path)}
              onClick={(e) => handleNavClick(e, item)}
              className={({ isActive }) => {
                const isLocked =
                  item.requiredPermission &&
                  !hasPermission(item.requiredPermission);
                return `group flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive || activePath.startsWith(item.path)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : isLocked
                      ? 'text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`;
              }}
            >
              {({ isActive }) => {
                const isLocked =
                  item.requiredPermission &&
                  !hasPermission(item.requiredPermission);
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          isActive || activePath.startsWith(item.path)
                            ? 'text-primary'
                            : isLocked
                              ? 'text-slate-400'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }
                      >
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium truncate">
                        {item.id === 'aura-network'
                          ? t('Common.sidebar.auraNetwork', 'Aura Network')
                          : t(
                              `SystemAdmin.sidebar.items.${item.id}`,
                              item.label
                            )}
                      </span>
                    </div>
                    {isLocked && (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <UserAvatar
                fullName={user?.fullName}
                avatarUrl={user?.avatarUrl}
                fallbackName={systemAdminLabel}
                size="md"
                className="shrink-0 border-2 border-brand/30 shadow-sm"
                fallbackClassName="bg-brand text-white"
              />
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleLanguage}
              className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
              title={t('Common.language', 'Language')}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-500/10"
              title={t('Common.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
