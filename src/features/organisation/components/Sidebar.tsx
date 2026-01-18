import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  pendingCount?: number;
}

export default function Sidebar({ pendingCount = 23 }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/organisation' },
    {
      icon: Users,
      label: 'Patients',
      path: '/organisation/patients',
      badge: pendingCount,
    },
    { icon: Calendar, label: 'Calendar', path: '/organisation/calendar' },
    { icon: Settings, label: 'Settings', path: '/organisation/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-white border-r border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200 flex flex-col">
      <div className="p-6 border-b border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white dark:text-white light:text-gray-900 font-semibold text-lg">
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
                  ? 'bg-[#1e3a8a] dark:bg-[#1e3a8a] light:bg-blue-50 text-white dark:text-white light:text-blue-600'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-[#1e3a5f] dark:hover:bg-[#1e3a5f] light:hover:bg-gray-100'
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

      <div className="p-4 border-t border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-[#1e3a5f] dark:hover:bg-[#1e3a5f] light:hover:bg-gray-100 rounded-lg transition-colors w-full">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
