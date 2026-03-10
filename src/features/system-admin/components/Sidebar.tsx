/**
 * System Admin Sidebar Navigation
 * Main navigation for system admin dashboard
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Settings,
  Users,
  Shield,
  Building2,
  FileText,
  Eye,
  LogOut,
  Network,
  Stethoscope,
  KeyRound,
  ScrollText,
} from 'lucide-react';
import useAuthStore from '@/store/auth-store';

const navItems = [
  { label: 'Dashboard', icon: BarChart3, path: '/system-admin/dashboard' },
  {
    label: 'Organisations',
    icon: Building2,
    path: '/system-admin/organisations',
  },
  {
    label: 'Ophthalmologists',
    icon: Stethoscope,
    path: '/system-admin/ophthalmologists',
  },
  { label: 'Patients', icon: Users, path: '/system-admin/patients' },
  { label: 'AI Performance', icon: Shield, path: '/system-admin/ai-models' },
  { label: 'Permissions', icon: KeyRound, path: '/system-admin/permissions' },
  {
    label: 'Contracts',
    icon: ScrollText,
    path: '/system-admin/contract-templates',
  },
  { label: 'Audit Logs', icon: FileText, path: '/system-admin/audit-logs' },
  { label: 'Aura Network', icon: Network, path: '/network' },
  { label: 'Settings', icon: Settings, path: '/system-admin/settings' },
];

export default function Sidebar() {
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
              System Admin
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
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-primary' : ''}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm border-2 border-brand/30 shadow-sm">
                SA
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  System Admin
                </p>
                <p className="text-xs text-gray-400 truncate">admin@aura.med</p>
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
