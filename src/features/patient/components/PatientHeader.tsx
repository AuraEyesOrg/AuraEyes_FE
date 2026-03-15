import { Search, Moon, Sun, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';
import { NotificationDropdown } from '@/components/ui/notification';

export default function PatientHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const location = useLocation();

  const displayInitial = user?.fullName?.split(' ').pop()?.charAt(0) || 'P';

  const pageName = (() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'dashboard';

    const pageNameMap: Record<string, string> = {
      dashboard: 'Dashboard',
      screening: 'My Scans',
      reports: 'Reports',
      appointments: 'Appointments',
      doctors: 'Find Doctors',
      clinics: 'Find Clinics',
      roadmap: 'Health Roadmap',
      chat: 'Chat',
      wallet: 'Wallet',
      profile: 'My Profile',
      settings: 'Settings',
      security: 'Security',
      notifications: 'Notifications',
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
          <span>Home</span>
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
              placeholder="Search reports, appointments..."
              className="header-search-input w-64"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            aria-label="Toggle theme"
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
