import { Bell, Search, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface PatientHeaderProps {
  userName?: string;
  avatarUrl?: string;
}

export default function PatientHeader({
  userName = 'Patient',
  avatarUrl,
}: PatientHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-[var(--border-color)] px-6 py-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search reports, appointments, clinics..."
            className="w-full pl-12 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* System Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-brand-soft rounded-lg border border-brand/20">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
          <span className="text-xs font-medium text-brand">
            AI System Active
          </span>
        </div>

        {/* Help Button */}
        <button className="p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-brand transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-brand transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <div
              className="w-9 h-9 rounded-full bg-brand flex items-center justify-center overflow-hidden shadow-brand"
              style={
                avatarUrl
                  ? {
                      backgroundImage: `url(${avatarUrl})`,
                      backgroundSize: 'cover',
                    }
                  : undefined
              }
            >
              {!avatarUrl && (
                <span className="text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {userName}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Patient</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-color)] rounded-xl shadow-xl py-2 z-50">
              <a
                href="/patient/profile"
                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-brand"
              >
                My Profile
              </a>
              <a
                href="/patient/wallet"
                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-brand"
              >
                My Wallet
              </a>
              <a
                href="/patient/settings"
                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-brand"
              >
                Settings
              </a>
              <hr className="my-2 border-[var(--border-color)]" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
