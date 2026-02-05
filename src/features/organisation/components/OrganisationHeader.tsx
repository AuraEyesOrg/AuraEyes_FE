import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function OrganisationHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-transparent py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Pages</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Dashboard</span>
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
              className="bg-gray-100 dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary w-64"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] hover:border-primary transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              CR
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
