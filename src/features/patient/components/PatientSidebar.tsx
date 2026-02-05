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
  Moon,
  Sun,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { useTheme } from '@/contexts/ThemeContext';

interface PatientSidebarProps {
  userName?: string;
  userAvatar?: string;
  userId?: string;
}

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

export default function PatientSidebar({
  userName = 'Alex Morgan',
  userAvatar,
  userId = '#8823-X',
}: PatientSidebarProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

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
              Patient Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-brand/20 text-brand font-bold'
                    : 'text-gray-400 hover:bg-brand/10 hover:text-black'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? 'text-brand'
                        : 'group-hover:text-brand transition-colors'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isActive ? 'font-bold text-brand' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
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
              onClick={toggleTheme}
              className="text-gray-500 hover:text-brand transition-colors p-2 rounded-lg hover:bg-brand/10"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
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
