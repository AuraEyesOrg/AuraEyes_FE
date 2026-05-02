import {
  Home,
  Calendar,
  Users,
  Wallet,
  Settings,
  LogOut,
  Globe,
  Stethoscope,
  CreditCard,
  ListOrdered,
  FileText,
  Lock,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { resolvePathWithLocale, persistLocale } from '@/i18n/middleware';
import type { AppLocale } from '@/i18n/locales';
import usePermissions from '@/hooks/use-permissions';

/**
 * Sidebar navigation for ClinicStaff role (Receptionist, Coordinator, Cashier).
 * Follows the same pattern as PatientSidebar — permission-gated nav items,
 * language toggle, and logout at the bottom.
 */
export default function ClinicStaffSidebar() {
  const { t: i18nT } = useTranslation();
  const t = (
    key: string,
    defaultValueOrOptions?: string | Record<string, unknown>
  ) => {
    const options =
      typeof defaultValueOrOptions === 'string'
        ? ({ defaultValue: defaultValueOrOptions } as Record<string, unknown>)
        : defaultValueOrOptions;

    return i18nT(key as never, options as never) as unknown as string;
  };

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { hasPermission } = usePermissions();

  const navItems = [
    {
      icon: Home,
      label: t('ClinicStaffSidebar.nav.dashboard', 'Dashboard'),
      path: '/clinic-staff/dashboard',
    },
    {
      icon: ListOrdered,
      label: t('ClinicStaffSidebar.nav.queue', 'Queue'),
      path: '/clinic-staff/queue',
      requiredSubRole: 'Coordinator',
    },
    {
      icon: Calendar,
      label: t('ClinicStaffSidebar.nav.appointments', 'Appointments'),
      path: '/clinic-staff/appointments',
      requiredAnySubRole: ['Receptionist', 'Cashier'],
    },
    {
      icon: Users,
      label: t('ClinicStaffSidebar.nav.patients', 'Patients'),
      path: '/clinic-staff/patients',
      requiredSubRole: 'Receptionist',
    },
    {
      icon: FileText,
      label: t('ClinicStaffSidebar.nav.medicalRecords', 'Medical Records'),
      path: '/clinic-staff/medical-records',
      requiredSubRole: 'Coordinator',
    },
    {
      icon: Stethoscope,
      label: t('ClinicStaffSidebar.nav.screenings', 'Screenings'),
      path: '/clinic-staff/screenings',
      requiredSubRole: 'Coordinator',
    },
    {
      icon: CreditCard,
      label: t('ClinicStaffSidebar.nav.cashier', 'Cashier'),
      path: '/clinic-staff/cashier',
      requiredSubRole: 'Cashier',
    },
    {
      icon: FileText,
      label: t('ClinicStaffSidebar.nav.transactions', 'Transaction History'),
      path: '/clinic-staff/billing',
      requiredAnySubRole: ['Receptionist', 'Cashier'],
    },
    {
      icon: Wallet,
      label: t('ClinicStaffSidebar.nav.wallet', 'Wallet'),
      path: '/clinic-staff/wallet',
      requiredSubRole: 'Cashier',
    },
    {
      icon: Settings,
      label: t('ClinicStaffSidebar.nav.settings', 'Settings'),
      path: '/clinic-staff/settings',
    },
  ];

  const handleNavClick = (e: React.MouseEvent, item: any) => {
    if (item.requiredSubRole && !hasSubRole(item.requiredSubRole)) {
      e.preventDefault();
      toast.warning(t('Common.noPermission'));
      return;
    }
    if (
      item.requiredAnySubRole &&
      !item.requiredAnySubRole.some((role: string) => hasSubRole(role))
    ) {
      e.preventDefault();
      toast.warning(t('Common.noPermission'));
      return;
    }
  };

  const { hasSubRole } = usePermissions();

  const visibleNavItems = navItems;

  const displayName = user?.fullName;
  const displayEmail = user?.email;
  const displayAvatarUrl = user?.avatarUrl;

  const avatarMeta = getUserAvatarMeta(displayName, 'ClinicStaff');
  const userName = avatarMeta.displayName;
  const userEmail = displayEmail ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { i18n } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;

  const handleToggleLanguage = () => {
    const newLocale: AppLocale = locale === 'en' ? 'vi' : 'en';
    persistLocale(newLocale);
    i18n.changeLanguage(newLocale);
    // Keep search params like ?patientId=...
    const newPath = withLocalePathname(
      newLocale,
      location.pathname + location.search
    );
    navigate(newPath);
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-50 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle={t('ClinicStaffSidebar.portalSubtitle', 'Clinic Staff')}
            to="/clinic-staff/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isRestricted =
              (item.requiredSubRole && !hasSubRole(item.requiredSubRole)) ||
              (item.requiredAnySubRole &&
                !item.requiredAnySubRole.some((role: string) =>
                  hasSubRole(role)
                ));

            return (
              <NavLink
                key={item.path}
                to={resolvePathWithLocale(item.path)}
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
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-primary' : ''}>
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isRestricted && (
                      <Lock className="w-3.5 h-3.5 ml-auto opacity-40" />
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
                  avatarUrl={displayAvatarUrl}
                  fallbackName="Staff"
                  size="md"
                  className="border-2 border-brand/30 shadow-sm"
                  fallbackClassName="bg-brand text-white"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-(--bg-secondary)" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
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
              title={t('ClinicStaffSidebar.actions.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
