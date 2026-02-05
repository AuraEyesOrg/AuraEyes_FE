import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Activity,
  BarChart3,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  pendingCount?: number;
}

export default function Sidebar({ pendingCount = 23 }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/organisation/dashboard' },
    {
      icon: Users,
      label: 'Patients',
      path: '/organisation/patients',
      badge: pendingCount,
    },
    { icon: BarChart3, label: 'Analytics', path: '/organisation/analytics' },
    { icon: Calendar, label: 'Calendar', path: '/organisation/calendar' },
    { icon: Settings, label: 'Settings', path: '/organisation/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-white dark:bg-[#0a1f44] border-r border-gray-200 dark:border-[#1e3a5f] flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-semibold text-lg">
            AURA
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-[#1e3a8a] text-blue-600 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f]'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors w-full">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
