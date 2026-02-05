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
  Menu,
  X,
  Network,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/store/auth-store';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/system-admin/dashboard',
  },
  {
    label: 'Organisations',
    icon: <Building2 className="w-5 h-5" />,
    href: '/system-admin/organisations',
  },
  {
    label: 'Ophthalmologists',
    icon: <Stethoscope className="w-5 h-5" />,
    href: '/system-admin/ophthalmologists',
  },
  {
    label: 'Patients',
    icon: <Users className="w-5 h-5" />,
    href: '/system-admin/patients',
  },
  {
    label: 'AI Performance',
    icon: <Shield className="w-5 h-5" />,
    href: '/system-admin/ai-models',
  },
  {
    label: 'Audit Logs',
    icon: <FileText className="w-5 h-5" />,
    href: '/system-admin/audit-logs',
  },
  {
    label: 'Aura Network',
    icon: <Network className="w-5 h-5" />,
    href: '/network',
  },
  {
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    href: '/system-admin/settings',
  },
];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthStore();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 w-72 h-screen flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 text-slate-900 shadow-lg shadow-primary/20">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-lg font-bold">
                AURA Admin
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                System Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + '/');
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-primary' : ''}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">
                System Admin
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                admin@aura.med
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
