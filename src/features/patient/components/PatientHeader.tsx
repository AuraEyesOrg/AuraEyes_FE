import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

export default function PatientHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pageName = (() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'dashboard';
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
  })();

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
        </div>
      </div>
    </header>
  );
}
