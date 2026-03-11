import { Bell, Search, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';

interface PatientHeaderProps {
  pageName?: string;
}

export default function PatientHeader({
  pageName = 'Dashboard',
}: PatientHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const userName = user?.fullName ?? 'Patient';
  const avatarUrl = user?.avatarUrl;
  const displayInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="role-header">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="breadcrumb-text flex items-center gap-2">
          <span>Pages</span>
          <span>/</span>
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
          <button className="header-action-btn relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 header-action-btn"
            >
              <div
                className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center overflow-hidden"
                style={
                  avatarUrl
                    ? {
                        backgroundImage: `url(${avatarUrl})`,
                        backgroundSize: 'cover',
                      }
                    : undefined
                }
              >
                {!avatarUrl && (
                  <span className="text-white font-semibold text-sm">
                    {displayInitial}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-heading hidden md:block">
                {userName}
              </span>
              <ChevronDown className="w-4 h-4 text-caption" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 dropdown-menu">
                <a href="/patient/profile" className="dropdown-item">
                  My Profile
                </a>
                <a href="/patient/wallet" className="dropdown-item">
                  My Wallet
                </a>
                <a href="/patient/settings" className="dropdown-item">
                  Settings
                </a>
                <hr className="my-2 border-(--border-color) dark:border-[#2d4a6f]" />
                <button className="dropdown-danger">Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
