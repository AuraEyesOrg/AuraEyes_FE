import {
  Home,
  Upload,
  FileText,
  Calendar,
  MapPin,
  Shield,
  Route,
  MessageCircle,
  Wallet,
  User,
  LogOut,
  Activity,
  Bell,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';

interface PatientSidebarProps {
  notificationCount?: number;
  unreadMessages?: number;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/patient/dashboard' },
  { icon: Upload, label: 'Screening', path: '/patient/screening' },
  { icon: FileText, label: 'Reports', path: '/patient/reports' },
  { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
  { icon: MapPin, label: 'Find Clinics', path: '/patient/clinics' },
  { icon: Shield, label: 'Verification', path: '/patient/verification' },
  { icon: Route, label: 'Health Roadmap', path: '/patient/roadmap' },
  { icon: MessageCircle, label: 'Chat', path: '/patient/chat', badge: true },
  { icon: Wallet, label: 'Wallet', path: '/patient/wallet' },
  { icon: User, label: 'Profile', path: '/patient/profile' },
];

export default function PatientSidebar({
  notificationCount = 0,
  unreadMessages = 0,
}: PatientSidebarProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthStore();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0a1929] border-r border-[#1e3a5f] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e3a5f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg">AURA</span>
            <p className="text-xs text-gray-400">Patient Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border border-primary/30'
                    : 'text-gray-400 hover:bg-[#1e3a5f] hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && unreadMessages > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadMessages}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Notifications & Logout */}
      <div className="p-4 border-t border-[#1e3a5f] space-y-2">
        <NavLink
          to="/patient/notifications"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#1e3a5f] hover:text-white rounded-xl transition-all duration-200"
        >
          <Bell size={20} />
          <span className="text-sm font-medium">Notifications</span>
          {notificationCount > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {notificationCount}
            </span>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
