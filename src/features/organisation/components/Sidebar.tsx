import {
  Home,
  Calendar,
  CalendarCog,
  Settings,
  LogOut,
  FileText,
  Users,
  Globe,
  Wallet,
  FileBarChart,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import { resolvePathWithLocale } from '@/i18n/middleware';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { persistLocale } from '@/i18n/middleware';
import type { AppLocale } from '@/i18n/locales';
import { getOrganisationDashboardMetrics } from '../api/dashboard.api';
import usePermissions from '@/hooks/use-permissions';
import { Permissions } from '@/constants/permissions';

interface SidebarProps {
  pendingCount?: number;
}

const navItems = [
  {
    icon: Home,
    labelKey: 'dashboard',
    path: '/organisation/dashboard',
    requiredPermission: Permissions.DashboardRead,
  },
  {
    icon: FileText,
    labelKey: 'contract',
    path: '/organisation/contract',
    requiredPermission: Permissions.ContractsRead,
  },
  {
    icon: Users,
    labelKey: 'patients',
    path: '/organisation/patients',
    hasBadge: true,
    requiredPermission: Permissions.PatientsRead,
  },
  {
    icon: Wallet,
    labelKey: 'wallet',
    path: '/organisation/wallet',
    requiredPermission: Permissions.WalletsRead,
  },
  {
    icon: FileBarChart,
    labelKey: 'reports',
    path: '/organisation/reports',
    requiredPermission: Permissions.ScreeningRead,
  },
  {
    icon: Calendar,
    labelKey: 'calendar',
    path: '/organisation/calendar',
    requiredPermission: Permissions.AppointmentsRead,
  },
  {
    icon: CalendarCog,
    labelKey: 'slotManagement',
    path: '/organisation/slots',
    requiredPermission: Permissions.ApptSlotsManage,
  },
  {
    icon: Globe,
    labelKey: 'auraNetwork',
    path: '/network',
  },
  {
    icon: Settings,
    labelKey: 'settings',
    path: '/organisation/settings',
    requiredPermission: Permissions.SettingsRead,
  },
];

export default function Sidebar({
  pendingCount: propPendingCount,
}: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user, logout } = useAuthStore();
  const { hasPermission } = usePermissions();

  const metricsQuery = useQuery({
    queryKey: ['organisation-dashboard', 'metrics'],
    queryFn: getOrganisationDashboardMetrics,
    staleTime: 30_000,
  });

  const sidebarPendingCount = metricsQuery.data
    ? metricsQuery.data.totalPatients
    : 0;

  const pendingCount = propPendingCount ?? sidebarPendingCount;

  const contractApproved = user?.contractStatus === 'Active';

  const visibleNavItems = (
    contractApproved
      ? navItems
      : navItems.filter((item) => item.path === '/organisation/contract')
  ).filter((item) =>
    item.requiredPermission ? hasPermission(item.requiredPermission) : true
  );

  const organisationLabel = t(
    'Organisation.sidebar.organisation',
    'Organisation'
  );
  const avatarMeta = getUserAvatarMeta(user?.fullName, organisationLabel);
  const displayName = avatarMeta.displayName;
  const displayEmail = user?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate(resolvePathWithLocale('/login'));
  };

  const { i18n } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;

  const handleToggleLanguage = () => {
    const newLocale: AppLocale = locale === 'en' ? 'vi' : 'en';
    persistLocale(newLocale);
    i18n.changeLanguage(newLocale);
    const newPath = withLocalePathname(newLocale, location.pathname);
    navigate(newPath);
  };

  return (
    <aside className="sticky top-0 z-20 flex h-[100dvh] w-64 shrink-0 flex-col bg-(--bg-secondary) transition-colors duration-300">
      <div className="px-6 pb-4 pt-6">
        <div className="px-2">
          <AuraLogo
            size="md"
            subtitle={organisationLabel}
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
                    {item.labelKey === 'auraNetwork'
                      ? t('Common.sidebar.auraNetwork', 'Aura Network')
                      : t(`Organisation.sidebar.${item.labelKey}`)}
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
        <div className="flex items-center gap-2 px-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <UserAvatar
              fullName={user?.fullName}
              avatarUrl={user?.avatarUrl}
              fallbackName={organisationLabel}
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
            onClick={handleToggleLanguage}
            className="text-gray-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
            title={t('Common.language', 'Language')}
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
            title={t('Common.logout', 'Logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
