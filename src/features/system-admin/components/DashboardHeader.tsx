import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';
import { NotificationDropdown } from '@/components/ui/notification';
import UserAvatar from '@/components/ui/UserAvatar';

export default function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const displayInitial = user?.fullName?.split(' ').pop()?.charAt(0) || 'SA';

  return (
    <header className="role-header">
      <div className="flex items-center justify-between">
        <div className="breadcrumb-text flex items-center gap-2">
          <span>Pages</span>
          <span>/</span>
          <span className="breadcrumb-active">Dashboard</span>
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
              placeholder="Search any keywords"
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

          {/* User Profile */}
          <button className="flex items-center gap-2 header-action-btn">
            <UserAvatar
              fullName={user?.fullName}
              avatarUrl={user?.avatarUrl}
              fallbackName="System Admin"
              size="sm"
              fallbackClassName="bg-brand/20 text-brand"
            />
            <span className="text-sm font-medium text-heading hidden md:block">
              {displayInitial}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
