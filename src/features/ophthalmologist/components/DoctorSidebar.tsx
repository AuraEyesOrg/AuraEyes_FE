import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Eye,
  BarChart3,
  Calendar,
  LogOut,
  Activity,
  Settings,
} from 'lucide-react';
import type { Doctor } from '../types/ophthalmologist.types';

interface DoctorSidebarProps {
  doctor: Doctor;
  pendingCount?: number;
}

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/ophthalmologist/dashboard',
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: Users,
    path: '/ophthalmologist/patients',
  },
  {
    id: 'screenings',
    label: 'Screenings',
    icon: Eye,
    path: '/ophthalmologist/screenings',
    hasBadge: true,
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    path: '/ophthalmologist/appointments',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/ophthalmologist/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/ophthalmologist/settings',
  },
];

export default function DoctorSidebar({
  doctor,
  pendingCount = 0,
}: DoctorSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white dark:bg-[#0a1f44] border-r border-gray-200 dark:border-[#1e3a5f] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
            <Activity size={20} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-semibold text-lg">
            AURA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors relative ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-[#1e3a8a] text-cyan-600 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className={
                      isActive
                        ? 'text-cyan-600 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.hasBadge && pendingCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Doctor Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
            {doctor.name.split(' ').pop()?.charAt(0) || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
              {doctor.name.split(' ').pop()}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
              {doctor.specialty}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors w-full">
          <LogOut size={20} strokeWidth={2} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
