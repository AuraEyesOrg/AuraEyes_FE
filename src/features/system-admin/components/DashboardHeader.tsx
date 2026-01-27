import { Search, Mic, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-transparent py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
          <span>Pages</span>
          <span>/</span>
          <span className="text-white dark:text-white light:text-gray-900">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 light:text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search any keywords"
              className="w-80 bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-gray-100 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm text-white dark:text-white light:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 light:text-gray-500 hover:text-primary">
              <Mic size={18} />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-gray-100 hover:bg-[#2d4a6f] dark:hover:bg-[#2d4a6f] light:hover:bg-gray-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          <button className="relative p-2 rounded-lg bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-gray-100 hover:bg-[#2d4a6f] dark:hover:bg-[#2d4a6f] light:hover:bg-gray-200 transition-colors">
            <Bell
              size={20}
              className="text-gray-400 dark:text-gray-400 light:text-gray-600"
            />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">CR</span>
          </button>
        </div>
      </div>
    </header>
  );
}
