import { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  Eye,
  Wallet,
  Calendar,
  CalendarClock,
  CalendarX,
  ArrowRightLeft,
  LogOut,
  Settings,
  MessagesSquare,
  FileText,
  Globe,
} from 'lucide-react';
import useAuthStore from '@/store/auth-store';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { AuraLogo } from '@/components/ui/aura-logo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getUserAvatarMeta } from '@/lib/user-avatar';
import {
  DEFAULT_LOCALE,
  type AppLocale,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { persistLocale } from '@/i18n/middleware';

interface DoctorSidebarProps {
  pendingCount?: number;
}

interface AuthMeApiResponse {
  success: boolean;
  data?: {
    employmentType?: string | null;
    contractStatus?: string | null;
    isVerified?: boolean | null;
    verificationStatus?: string | null;
  };
}

const normalizeEmploymentType = (
  value: string | null | undefined
): 'FullTime' | 'PartTime' | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[\s_-]/g, '').toLowerCase();
  if (normalized === 'fulltime') {
    return 'FullTime';
  }

  if (normalized === 'parttime') {
    return 'PartTime';
  }

  return null;
};

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
    labelKey: 'Ophthalmologist.sidebar.leaveRequests',
    icon: CalendarX,
    path: '/ophthalmologist/leave-requests',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.employmentTypeChangeRequests',
    icon: ArrowRightLeft,
    path: '/ophthalmologist/employment-type-change-requests',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.consultations',
    icon: MessagesSquare,
    path: '/ophthalmologist/consultations',
    hasBadge: true,
  },
  {
    labelKey: 'Common.sidebar.auraNetwork',
    icon: Globe,
    path: '/network',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.contract',
    icon: FileText,
    path: '/ophthalmologist/contract',
  },
  {
    labelKey: 'Ophthalmologist.sidebar.wallet',
    icon: Wallet,
    path: '/ophthalmologist/wallet',
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
  const { user, setUser, logout } = useAuthStore();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const avatarMeta = getUserAvatarMeta(user?.fullName, 'Doctor');
  const displayName = avatarMeta.displayName;
  const displayEmail = user?.email ?? '';
  const authEmploymentType = normalizeEmploymentType(user?.employmentType);

  const { data: latestAuthSnapshot } = useQuery({
    queryKey: ['auth', 'me', 'ophthalmologist-sidebar'],
    queryFn: async () => {
      const response = await api.get<AuthMeApiResponse>(API_ENDPOINTS.AUTH.ME);

      return response.data?.data;
    },
    enabled: !!user?.roles?.includes('Ophthalmologist'),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!user || !latestAuthSnapshot) {
      return;
    }

    const latestEmploymentType = normalizeEmploymentType(
      latestAuthSnapshot.employmentType
    );
    const currentEmploymentType = normalizeEmploymentType(user.employmentType);
    const nextEmploymentType = latestEmploymentType ?? currentEmploymentType;
    const nextContractStatus =
      latestAuthSnapshot.contractStatus ?? user.contractStatus ?? null;
    const nextVerificationStatus =
      latestAuthSnapshot.verificationStatus ?? user.verificationStatus ?? null;
    const nextIsVerified =
      latestAuthSnapshot.isVerified ?? user.isVerified ?? null;

    const hasAuthDrift =
      nextEmploymentType !== currentEmploymentType ||
      nextContractStatus !== (user.contractStatus ?? null) ||
      nextVerificationStatus !== (user.verificationStatus ?? null) ||
      nextIsVerified !== (user.isVerified ?? null);

    if (!hasAuthDrift) {
      return;
    }

    setUser({
      ...user,
      employmentType: nextEmploymentType,
      contractStatus: nextContractStatus,
      verificationStatus: nextVerificationStatus,
      isVerified: nextIsVerified,
    });
  }, [latestAuthSnapshot, setUser, user]);

  const latestEmploymentType = normalizeEmploymentType(
    latestAuthSnapshot?.employmentType
  );

  const isFullTimeDoctor =
    (latestEmploymentType ?? authEmploymentType) === 'FullTime';

  // Only show full nav when contract is active; otherwise lock to contract page only
  const contractApproved =
    (latestAuthSnapshot?.contractStatus ?? user?.contractStatus) === 'Active';
  const visibleNavItems = contractApproved
    ? navItems.filter(
        (item) =>
          item.path !== '/ophthalmologist/leave-requests' || isFullTimeDoctor
      )
    : navItems.filter((item) => item.path === '/ophthalmologist/contract');

  const handleLogout = () => {
    logout();
    navigate(toLocalizedPath('/login'));
  };

  const { i18n } = useTranslation();
  const handleToggleLanguage = () => {
    const newLocale: AppLocale = locale === 'en' ? 'vi' : 'en';
    persistLocale(newLocale);
    i18n.changeLanguage(newLocale);
    const newPath = withLocalePathname(newLocale, location.pathname);
    navigate(newPath);
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-50 h-screen">
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
                        item.path === '/network'
                          ? 'Aura Network'
                          : item.path ===
                              '/ophthalmologist/employment-type-change-requests'
                            ? 'Employment Type Changes'
                            : (item.labelKey.split('.').pop() ?? 'Item')
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
              <UserAvatar
                fullName={user?.fullName}
                avatarUrl={user?.avatarUrl}
                fallbackName="Doctor"
                size="md"
                className="shrink-0 border-2 border-brand/30 shadow-sm"
                fallbackClassName="bg-brand text-white"
              />
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {displayEmail ||
                    t('Ophthalmologist.common.role', 'Ophthalmologist')}
                </p>
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
