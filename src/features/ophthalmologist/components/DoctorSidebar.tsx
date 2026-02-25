import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Eye,
  BarChart3,
  Calendar,
  LogOut,
  Settings,
  MessagesSquare,
} from 'lucide-react';
import useAuthStore from '@/store/auth-store';
import type { Doctor } from '../types/ophthalmologist.types';

interface DoctorSidebarProps {
  doctor: Doctor;
  pendingCount?: number;
}

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/ophthalmologist/dashboard',
  },
  { label: 'Patients', icon: Users, path: '/ophthalmologist/patients' },
  {
    label: 'Screenings',
    icon: Eye,
    path: '/ophthalmologist/screenings',
    hasBadge: true,
  },
  {
    label: 'Appointments',
    icon: Calendar,
    path: '/ophthalmologist/appointments',
  },
  {
    label: 'Consultations',
    icon: MessagesSquare,
    path: '/ophthalmologist/consultations',
    hasBadge: true,
  },
  { label: 'Analytics', icon: BarChart3, path: '/ophthalmologist/analytics' },
  { label: 'Settings', icon: Settings, path: '/ophthalmologist/settings' },
];

export default function DoctorSidebar({
  doctor,
  pendingCount = 0,
}: DoctorSidebarProps) {
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
              Ophthalmologist
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

        {/* Doctor Profile Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm border-2 border-brand/30 shadow-sm">
                {doctor.name.split(' ').pop()?.charAt(0) || 'D'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {doctor.name.split(' ').pop()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {doctor.specialty}
                </p>
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
