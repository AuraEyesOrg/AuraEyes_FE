import {
  Home,
  Eye,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Calendar,
  MapPin,
  Shield,
  MessageCircle,
  Milestone,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { AuraLogo } from '@/components/ui/aura-logo';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/patient/dashboard' },
  { icon: Eye, label: 'My Scans', path: '/patient/screening' },
  { icon: FileText, label: 'Reports', path: '/patient/reports' },
  { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
  { icon: MapPin, label: 'Find Clinics', path: '/patient/clinics' },
  { icon: Shield, label: 'Verification', path: '/patient/verification' },
  { icon: Milestone, label: 'Health Roadmap', path: '/patient/roadmap' },
  { icon: MessageCircle, label: 'Chat', path: '/patient/chat', badge: true },
  { icon: Wallet, label: 'Wallet', path: '/patient/wallet' },
  { icon: Settings, label: 'Settings', path: '/patient/settings' },
];

export default function PatientSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const userName = user?.fullName ?? 'Patient';
  const userAvatar = user?.avatarUrl;
  const userId = user?.email ?? '';

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
            subtitle="Patient Portal"
            to="/patient/dashboard"
          />
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
            <NavLink
              to="/patient/profile"
              className="flex items-center gap-3 flex-1 group cursor-pointer"
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full bg-brand bg-cover bg-center border-2 border-brand/30 shadow-sm flex items-center justify-center group-hover:border-brand transition-colors"
                  style={{
                    backgroundImage: userAvatar
                      ? `url("${userAvatar}")`
                      : undefined,
                  }}
                >
                  {!userAvatar && (
                    <span className="text-white font-bold text-sm">
                      {userName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A202C]"></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-(--text-primary) truncate group-hover:text-brand transition-colors">
                  {userName}
                </p>
                <p className="text-xs text-gray-400 truncate">ID: {userId}</p>
              </div>
            </NavLink>
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
