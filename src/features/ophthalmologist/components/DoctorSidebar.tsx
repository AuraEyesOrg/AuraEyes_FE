import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Eye, BarChart3, LogOut } from 'lucide-react';
import type { Doctor } from '../types/ophthalmologist.types';

interface DoctorSidebarProps {
  doctor: Doctor;
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
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/ophthalmologist/analytics',
  },
];

export default function DoctorSidebar({ doctor }: DoctorSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#1A202C] flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-wide">
              AURA
            </span>
            <p className="text-gray-500 text-xs">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border-l-3 border-cyan-400'
                  : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Doctor Profile */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
            {doctor.name.split(' ').pop()?.charAt(0) || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {doctor.name}
            </p>
            <p className="text-gray-500 text-xs truncate">{doctor.specialty}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
