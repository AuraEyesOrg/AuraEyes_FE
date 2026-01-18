import { Home, FileText, Target, Bell, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  reminderCount?: number;
}

export default function Sidebar({ reminderCount = 6 }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Target, label: 'Goals', path: '/admin/goals' },
    {
      icon: Bell,
      label: 'Reminders',
      path: '/admin/reminders',
      badge: reminderCount,
    },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-white border-r border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200 flex flex-col">
      <div className="p-6 border-b border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-white dark:text-white light:text-gray-900 font-semibold text-lg">
            Healthish
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
              <span className="absolute right-2 top-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e3a5f] dark:border-[#1e3a5f] light:border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-[#1e3a5f] dark:hover:bg-[#1e3a5f] light:hover:bg-gray-100 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
