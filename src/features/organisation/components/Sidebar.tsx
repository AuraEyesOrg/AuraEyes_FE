import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Eye,
  BarChart3,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';

interface SidebarProps {
  pendingCount?: number;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/organisation/dashboard' },
  {
    icon: Users,
    label: 'Patients',
    path: '/organisation/patients',
    hasBadge: true,
  },
  { icon: BarChart3, label: 'Analytics', path: '/organisation/analytics' },
  { icon: Calendar, label: 'Calendar', path: '/organisation/calendar' },
  { icon: Settings, label: 'Settings', path: '/organisation/settings' },
];

export default function Sidebar({ pendingCount = 23 }: SidebarProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthStore();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-brand">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-(--text-primary) text-lg font-bold leading-none tracking-tight">
              AURA
            </h1>
            <p className="text-gray-400 text-xs font-medium tracking-wide uppercase">
              Organisation
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-primary' : ''}>
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.hasBadge && pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm border-2 border-brand/30 shadow-sm">
                OR
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  Organisation
                </p>
                <p className="text-xs text-gray-400 truncate">org@aura.med</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
