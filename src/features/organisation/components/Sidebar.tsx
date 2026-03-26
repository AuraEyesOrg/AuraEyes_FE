import {
  Home,
  Calendar,
  CalendarCog,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Users,
  Network,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';

interface SidebarProps {
  pendingCount?: number;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/organisation/dashboard' },
  { icon: FileText, label: 'Contract', path: '/organisation/contract' },
  {
    icon: Users,
    label: 'Patients',
    path: '/organisation/patients',
    hasBadge: true,
  },
  { icon: BarChart3, label: 'Analytics', path: '/organisation/analytics' },
  { icon: Network, label: 'Aura Network', path: '/network' },
  { icon: Calendar, label: 'Calendar', path: '/organisation/calendar' },
  { icon: CalendarCog, label: 'Slots', path: '/organisation/slots' },
  { icon: Settings, label: 'Settings', path: '/organisation/settings' },
];

export default function Sidebar({ pendingCount = 23 }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const contractApproved = user?.contractStatus === 'Active';
  const visibleNavItems = contractApproved
    ? navItems
    : navItems.filter((item) => item.path === '/organisation/contract');

  const displayName = user?.fullName ?? 'Organisation';
  const displayEmail = user?.email ?? '';
  const initials = displayName
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-(--bg-secondary) flex flex-col justify-between shrink-0 transition-colors duration-300 z-20 h-screen">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-10 px-2">
          <AuraLogo
            size="md"
            subtitle="Organisation"
            to="/organisation/dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
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
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm border-2 border-brand/30 shadow-sm shrink-0">
                {initials || 'OR'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
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
