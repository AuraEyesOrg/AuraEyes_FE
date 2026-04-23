import { Search, Moon, Sun, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';
import { NotificationDropdown } from '@/components/ui/notification';
import { useTranslation } from 'react-i18next';

/**
 * Top header bar for ClinicStaff portal.
 * Mirrors PatientHeader — breadcrumb, search, theme toggle, notifications.
 */
export default function ClinicStaffHeader() {
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

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const location = useLocation();

  const _displayInitial = user?.fullName?.split(' ').pop()?.charAt(0) || 'S';

  const pageName = (() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'dashboard';

    const pageNameMap: Record<string, string> = {
      dashboard: t('ClinicStaffHeader.pages.dashboard', 'Dashboard'),
      appointments: t('ClinicStaffHeader.pages.appointments', 'Appointments'),
      patients: t('ClinicStaffHeader.pages.patients', 'Patients'),
      screenings: t('ClinicStaffHeader.pages.screenings', 'Screenings'),
      schedules: t('ClinicStaffHeader.pages.schedules', 'Schedules'),
      billing: t('ClinicStaffHeader.pages.billing', 'Billing'),
      wallet: t('ClinicStaffHeader.pages.wallet', 'Wallet'),
      settings: t('ClinicStaffHeader.pages.settings', 'Settings'),
    };

    return (
      pageNameMap[last] ||
      last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
    );
  })();

  return (
    <header className="role-header">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="breadcrumb-text flex items-center gap-2">
          <Home size={14} />
          <span>{t('ClinicStaffHeader.breadcrumb.home', 'Home')}</span>
          <span className="text-[var(--border-color)]">/</span>
          <span className="breadcrumb-active">{pageName}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t(
                'ClinicStaffHeader.search.placeholder',
                'Search patients, appointments...'
              )}
              className="header-search-input w-64"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            aria-label={t(
              'ClinicStaffHeader.actions.toggleTheme',
              'Toggle theme'
            )}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
