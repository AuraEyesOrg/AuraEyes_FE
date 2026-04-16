/**
 * System Admin Sidebar Navigation
 * Main navigation for system admin dashboard
 */

import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import { dashboardNavItem, sidebarNavGroups } from './sidebar-data';
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

  const activePath = stripLocaleFromPathname(location.pathname);
  const activeGroupIds = useMemo(
    () =>
      sidebarNavGroups
        .filter((group) =>
          group.items.some((item) => activePath.startsWith(item.path))
        )
        .map((group) => group.id),
    [activePath]
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        sidebarNavGroups.map((group) => [
          group.id,
          activeGroupIds.includes(group.id),
        ])
      )
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = { ...prev };
      let hasChanged = false;

      for (const groupId of activeGroupIds) {
        if (!next[groupId]) {
          next[groupId] = true;
          hasChanged = true;
        }
      }

      return hasChanged ? next : prev;
    });
  }, [activeGroupIds]);

  const avatarMeta = getUserAvatarMeta(user?.fullName, 'System Admin');
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

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside className="w-[280px] bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8 px-2">
          <AuraLogo
            size="md"
            subtitle="System Admin"
            to="/system-admin/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
          <NavLink
            to={resolvePathWithLocale(dashboardNavItem.path)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    isActive
                      ? 'text-primary'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }
                >
                  <dashboardNavItem.icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium">
                  {t('SystemAdmin.sidebar.dashboard', 'Dashboard')}
                </span>
              </>
            )}
          </NavLink>

          {sidebarNavGroups.map((group) => {
            const isOpen = expandedGroups[group.id] ?? false;
            const isGroupActive = group.items.some((item) =>
              activePath.startsWith(item.path)
            );
            const menuMaxHeight = isOpen
              ? `${group.items.length * 40 + 8}px`
              : '0px';

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full group flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                    isGroupActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <group.icon
                      className={`w-4 h-4 shrink-0 ${
                        isGroupActive
                          ? 'text-primary'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold leading-5 truncate">
                        {t(
                          `SystemAdmin.sidebar.groups.${group.id}.label`,
                          group.label
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        {t(
                          `SystemAdmin.sidebar.groups.${group.id}.description`,
                          group.description
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>

                <div
                  style={{ maxHeight: menuMaxHeight }}
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="pb-1.5 pl-8">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={resolvePathWithLocale(item.path)}
                        className={({ isActive }) =>
                          `group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-200 ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-primary'
                                  : 'bg-slate-400 dark:bg-slate-500 group-hover:bg-slate-600 dark:group-hover:bg-slate-300'
                              }`}
                            />
                            <span className="text-sm truncate">
                              {item.id === 'aura-network'
                                ? t(
                                    'Common.sidebar.auraNetwork',
                                    'Aura Network'
                                  )
                                : t(
                                    `SystemAdmin.sidebar.items.${item.id}`,
                                    item.label
                                  )}
                            </span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <UserAvatar
                fullName={user?.fullName}
                avatarUrl={user?.avatarUrl}
                fallbackName="System Admin"
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
