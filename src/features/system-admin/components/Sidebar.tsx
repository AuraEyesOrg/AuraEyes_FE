/**
 * System Admin Sidebar Navigation
 * Main navigation for system admin dashboard
 */

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { dashboardNavItem, sidebarNavGroups } from './sidebar-data';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user, logout } = useAuthStore();

  const activePath = location.pathname;
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

  const displayName = user?.fullName ?? 'System Admin';
  const displayEmail = user?.email ?? '';
  const initials = displayName
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle="System Admin"
            to="/system-admin/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
          <NavLink
            to={dashboardNavItem.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-primary' : ''}>
                  <dashboardNavItem.icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium">
                  {dashboardNavItem.label}
                </span>
              </>
            )}
          </NavLink>

          {sidebarNavGroups.map((group) => {
            const isOpen = expandedGroups[group.id] ?? false;
            const isGroupActive = group.items.some((item) =>
              activePath.startsWith(item.path)
            );

            return (
              <div
                key={group.id}
                className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isGroupActive
                      ? 'text-primary bg-primary/5'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <group.icon className="w-4 h-4 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold leading-5 truncate">
                        {group.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key={`${group.id}-content`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-2 px-2 space-y-1">
                        {group.items.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                              `flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={isActive ? 'text-primary' : ''}
                                >
                                  <item.icon className="w-4 h-4" />
                                </span>
                                <span className="text-sm font-medium truncate">
                                  {item.path === '/network'
                                    ? t(
                                        'Common.sidebar.auraNetwork',
                                        'Aura Network'
                                      )
                                    : item.label}
                                </span>
                              </div>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm border-2 border-brand/30 shadow-sm shrink-0">
                {initials || 'SA'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
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
