import {
  Home,
  Calendar,
  CalendarCog,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Users,
  Globe,
  Wallet,
  FileBarChart,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import { resolvePathWithLocale } from '@/i18n/middleware';

interface SidebarProps {
  pendingCount?: number;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/organisation/dashboard' },
  { icon: FileText, label: 'Contract', path: '/organisation/contract' },
  {
    icon: Users,
    label: 'Patients',
    path: '/organisation/patients',
    hasBadge: true,
  },
  { icon: BarChart3, label: 'Analytics', path: '/organisation/analytics' },
  { icon: Wallet, label: 'Wallet', path: '/organisation/wallet' },
  { icon: FileBarChart, label: 'Reports', path: '/organisation/reports' },
  { icon: Globe, label: 'Aura Network', path: '/network' },
  { icon: Calendar, label: 'Calendar', path: '/organisation/calendar' },
  { icon: CalendarCog, label: 'Slots', path: '/organisation/slots' },
  { icon: Settings, label: 'Settings', path: '/organisation/settings' },
];

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user, logout } = useAuthStore();
  const visibleNavItems = navItems;

  const avatarMeta = getUserAvatarMeta(user?.fullName, 'Organisation');
  const displayName = avatarMeta.displayName;
  const displayEmail = user?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  return (
    <aside className="sticky top-0 z-20 flex h-[100dvh] w-64 shrink-0 flex-col bg-(--bg-secondary) transition-colors duration-300">
      <div className="px-6 pb-4 pt-6">
        <div className="px-2">
          <AuraLogo
            size="md"
            subtitle="Organisation"
            to="/organisation/dashboard"
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col space-y-1 overflow-y-auto px-6 pb-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={resolvePathWithLocale(item.path)}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-primary' : ''}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-medium">
                    {item.path === '/network'
                      ? t('Common.sidebar.auraNetwork', 'Aura Network')
                      : item.label}
                  </span>
                </div>
                {item.hasBadge && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 px-6 py-4 dark:border-slate-700">
        <div className="flex items-center gap-3 px-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar
              fullName={user?.fullName}
              avatarUrl={user?.avatarUrl}
              fallbackName="Organisation"
              size="md"
              className="shrink-0 border-2 border-brand/30 shadow-sm"
              fallbackClassName="bg-brand text-white"
            />
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
    </aside>
  );
}
