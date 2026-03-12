import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Palette,
  ChevronRight,
  Home,
  Moon,
  Sun,
  Smartphone,
  Mail,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path?: string;
  action?: () => void;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info';
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const _navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Profile',
          description: 'Manage your personal information and avatar',
          path: '/patient/profile',
        },
        {
          icon: Shield,
          title: 'Security',
          description: 'Password, two-factor authentication, login history',
          path: '/patient/security',
          badge: '2FA Enabled',
          badgeType: 'success',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          description: 'Email alerts, push notifications, reminders',
          path: '/patient/settings/notifications',
        },
        {
          icon: Palette,
          title: 'Appearance',
          description: 'Theme, display settings, accessibility',
          action: toggleTheme,
        },
        {
          icon: Globe,
          title: 'Language & Region',
          description: 'Language, timezone, date format',
          path: '/patient/settings/language',
        },
      ],
    },
    {
      title: 'Billing',
      items: [
        {
          icon: CreditCard,
          title: 'Payment Methods',
          description: 'Manage cards and payment options',
          path: '/patient/wallet',
        },
      ],
    },
  ];

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-xs text-[var(--text-secondary)] mb-4">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                to="/patient/dashboard"
                className="hover:text-brand transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </li>
            <li>
              <span className="text-[var(--border-color)]">/</span>
            </li>
            <li className="font-semibold text-[var(--text-primary)]">
              Settings
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section) => (
            <div key={section.title} className="medical-card">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const commonClassName =
                    'w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors group border border-transparent hover:border-[var(--border-color)]';

                  const content = (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                          <item.icon className="w-5 h-5 text-brand" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-[var(--text-primary)] font-medium">
                              {item.title}
                            </p>
                            {item.badge && (
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  item.badgeType === 'success'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : item.badgeType === 'warning'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand transition-colors" />
                    </>
                  );

                  if (item.path) {
                    return (
                      <Link
                        key={item.title}
                        to={item.path}
                        className={commonClassName}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.title}
                      onClick={item.action}
                      type="button"
                      className={commonClassName}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Settings */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Quick Settings
            </h2>
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">
                      Dark Mode
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                      {theme === 'dark'
                        ? 'Currently using dark theme'
                        : 'Currently using light theme'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'bg-brand'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform ${
                      theme === 'dark' ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Email Notifications
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailNotifications
                      ? 'bg-brand'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform ${
                      emailNotifications ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Push Notifications
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Receive push notifications on your device
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pushNotifications
                      ? 'bg-brand'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform ${
                      pushNotifications ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
