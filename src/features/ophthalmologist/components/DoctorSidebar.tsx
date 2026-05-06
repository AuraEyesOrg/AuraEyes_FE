import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Eye,
  CalendarX,
  LogOut,
  Settings,
  MessagesSquare,
  Globe,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import {
  DEFAULT_LOCALE,
  type AppLocale,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { persistLocale } from '@/i18n/middleware';
import usePermissions from '@/hooks/use-permissions';
import { Permissions } from '@/constants/permissions';

export default function DoctorSidebar({
  pendingCount = 0,
}: {
  pendingCount?: number;
}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const { hasPermission } = usePermissions();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;

  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const navItems = [
    {
      labelKey: 'Ophthalmologist.sidebar.Dashboard',
      icon: LayoutDashboard,
      path: '/ophthalmologist/dashboard',
      requiredPermission: Permissions.DashboardRead,
    },
    {
      labelKey: 'Ophthalmologist.sidebar.Patients',
      icon: Users,
      path: '/ophthalmologist/patients',
      requiredPermission: Permissions.PatientsRead,
    },
    {
      labelKey: 'Ophthalmologist.sidebar.Screenings',
      icon: Eye,
      path: '/ophthalmologist/screenings',
      hasBadge: true,
      requiredPermission: Permissions.ScreeningRead,
    },
    {
      labelKey: 'Ophthalmologist.sidebar.LeaveRequests',
      icon: CalendarX,
      path: '/ophthalmologist/leave-requests',
      requiredPermission: Permissions.SchedulesManage,
    },
    {
      labelKey: 'Ophthalmologist.sidebar.Consultations',
      icon: MessagesSquare,
      path: '/ophthalmologist/consultations',
      hasBadge: true,
      requiredPermission: Permissions.ConsultationsRead,
    },
    {
      labelKey: 'Ophthalmologist.sidebar.AuraNetwork',
      icon: Globe,
      path: '/network',
    },
    {
      labelKey: 'Ophthalmologist.sidebar.Settings',
      icon: Settings,
      path: '/ophthalmologist/settings',
      requiredPermission: Permissions.SettingsRead,
    },
  ];

  const avatarMeta = getUserAvatarMeta(user?.fullName, 'Doctor');
  const displayName = avatarMeta.displayName;
  const displayEmail = user?.email ?? '';

  const handleNavClick = (
    e: React.MouseEvent,
    item: (typeof navItems)[number]
  ) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      e.preventDefault();
      toast.warning(t('Common.noPermission'));
      return;
    }
  };

  const handleLogout = () => {
    logout();
    navigate(toLocalizedPath('/login'));
  };

  const handleToggleLanguage = () => {
    const newLocale: AppLocale = locale === 'en' ? 'vi' : 'en';
    persistLocale(newLocale);
    i18n.changeLanguage(newLocale);
    const newPath = withLocalePathname(newLocale, location.pathname);
    navigate(newPath);
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-50 h-screen sticky top-0">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle={t('Ophthalmologist.common.role', 'Ophthalmologist')}
            to="/ophthalmologist/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isRestricted =
              item.requiredPermission &&
              !hasPermission(item.requiredPermission);

            return (
              <NavLink
                key={item.path}
                to={toLocalizedPath(item.path)}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : isRestricted
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70 grayscale'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 w-full">
                    <span
                      className={isActive ? 'text-primary' : 'text-slate-400'}
                    >
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-medium">
                      {t(
                        item.labelKey,
                        item.labelKey.split('.').pop() || 'Item'
                      )}
                    </span>
                    {isRestricted && (
                      <Lock className="w-3.5 h-3.5 ml-auto opacity-40" />
                    )}
                    {item.hasBadge && pendingCount > 0 && !isRestricted && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <UserAvatar
                  fullName={displayName}
                  avatarUrl={user?.avatarUrl}
                  fallbackName="Doctor"
                  size="md"
                  className="border-2 border-brand/30 shadow-sm"
                  fallbackClassName="bg-brand text-white"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-(--bg-secondary)" />
              </div>
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
              title={t('Common.language')}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title={t('Ophthalmologist.common.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
