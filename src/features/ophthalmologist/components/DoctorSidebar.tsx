import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Eye,
  BarChart3,
  Calendar,
  CalendarClock,
  LogOut,
  Settings,
  MessagesSquare,
  FileText,
} from 'lucide-react';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

interface DoctorSidebarProps {
  pendingCount?: number;
}

const navItems = [
  {
    labelKey: 'Ophthalmologist.sidebar.dashboard',
    icon: LayoutDashboard,
    path: '/ophthalmologist/dashboard',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.patients',
    icon: Users,
    path: '/ophthalmologist/patients',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.screenings',
    icon: Eye,
    path: '/ophthalmologist/screenings',
    hasBadge: true,
  },
  {
    labelKey: 'Ophthalmologist.sidebar.appointments',
    icon: Calendar,
    path: '/ophthalmologist/appointments',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.schedules',
    icon: CalendarClock,
    path: '/ophthalmologist/schedules',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.consultations',
    icon: MessagesSquare,
    path: '/ophthalmologist/consultations',
    hasBadge: true,
  },
  {
    labelKey: 'Ophthalmologist.sidebar.analytics',
    icon: BarChart3,
    path: '/ophthalmologist/analytics',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.contract',
    icon: FileText,
    path: '/ophthalmologist/contract',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.settings',
    icon: Settings,
    path: '/ophthalmologist/settings',
  },
];

export default function DoctorSidebar({
  pendingCount = 0,
}: DoctorSidebarProps) {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const displayName = user?.fullName ?? 'Doctor';
  const userAvatar = user?.avatarUrl;

  // Only show full nav when contract is active; otherwise lock to contract page only
  const contractApproved = user?.contractStatus === 'Active';
  const visibleNavItems = contractApproved
    ? navItems
    : navItems.filter((item) => item.path === '/ophthalmologist/contract');

  const handleLogout = () => {
    logout();
    navigate(toLocalizedPath('/login'));
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle={t('Ophthalmologist.common.role', 'Ophthalmologist')}
            to={toLocalizedPath('/ophthalmologist/dashboard')}
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={toLocalizedPath(item.path)}
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
                      {t(
                        item.labelKey,
                        item.labelKey.split('.').pop() ?? 'Item'
                      )}
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

        {/* Doctor Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full bg-brand bg-cover bg-center border-2 border-brand/30 shadow-sm flex items-center justify-center"
                  style={{
                    backgroundImage: userAvatar
                      ? `url("${userAvatar}")`
                      : undefined,
                  }}
                >
                  {!userAvatar && (
                    <span className="text-white font-bold text-sm">
                      {displayName.split(' ').pop()?.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {displayName.split(' ').pop()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {t('Ophthalmologist.common.role', 'Ophthalmologist')}
                </p>
              </div>
            </div>
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
