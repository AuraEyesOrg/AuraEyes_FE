import {
  Home,
  Eye,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Calendar,
  MapPin,
  MessageCircle,
  Milestone,
  MessageSquareHeart,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import { useTranslation } from 'react-i18next';

export default function PatientSidebar() {
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
  const navItems = [
    {
      icon: Home,
      label: t('PatientSidebar.nav.dashboard', 'Dashboard'),
      path: '/patient/dashboard',
    },
    {
      icon: Eye,
      label: t('PatientSidebar.nav.myScans', 'My Scans'),
      path: '/patient/screening',
    },
    {
      icon: FileText,
      label: t('PatientSidebar.nav.reports', 'Reports'),
      path: '/patient/reports',
    },
    {
      icon: Calendar,
      label: t('PatientSidebar.nav.appointments', 'Appointments'),
      path: '/patient/appointments',
    },
    {
      icon: MapPin,
      label: t('PatientSidebar.nav.findClinics', 'Find Clinics'),
      path: '/patient/clinics',
    },
    {
      icon: Milestone,
      label: t('PatientSidebar.nav.healthRoadmap', 'Health Roadmap'),
      path: '/patient/roadmap',
    },
    {
      icon: MessageCircle,
      label: t('PatientSidebar.nav.chat', 'Chat'),
      path: '/patient/chat',
      badge: true,
    },
    {
      icon: Wallet,
      label: t('PatientSidebar.nav.wallet', 'Wallet'),
      path: '/patient/wallet',
    },
    {
      icon: MessageSquareHeart,
      label: t('PatientSidebar.nav.helpFeedback', 'Help & Feedback'),
      path: '/patient/help-feedback',
    },
    {
      icon: Settings,
      label: t('PatientSidebar.nav.settings', 'Settings'),
      path: '/patient/settings',
    },
  ];

  const avatarMeta = getUserAvatarMeta(user?.fullName, 'Patient');
  const userName = avatarMeta.displayName;
  const userEmail = user?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-50 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle={t('PatientSidebar.portalSubtitle', 'Patient Portal')}
            to="/patient/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
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
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <NavLink
              to="/patient/profile"
              className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer"
            >
              <div className="relative shrink-0">
                <UserAvatar
                  fullName={user?.fullName}
                  avatarUrl={user?.avatarUrl}
                  fallbackName="Patient"
                  size="md"
                  className="border-2 border-brand/30 shadow-sm group-hover:border-brand transition-colors"
                  fallbackClassName="bg-brand text-white"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-(--bg-secondary)"></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate group-hover:text-brand transition-colors">
                  {userName}
                </p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title={t('PatientSidebar.actions.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
