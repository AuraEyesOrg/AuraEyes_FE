import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';

interface OrganisationHeaderProps {
  pageName?: string;
}

export default function OrganisationHeader({
  pageName = 'Dashboard',
}: OrganisationHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const displayInitial = user?.fullName?.split(' ').pop()?.charAt(0) || 'O';

  return (
    <header className="role-header">
      <div className="flex items-center justify-between">
        <div className="breadcrumb-text flex items-center gap-2">
          <span>Pages</span>
          <span>/</span>
          <span className="breadcrumb-active">{pageName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search patients, ID..."
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
          <button className="header-action-btn relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 header-action-btn">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-heading hidden md:block">
              {displayInitial}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
