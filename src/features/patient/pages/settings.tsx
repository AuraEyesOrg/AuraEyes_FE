import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Check,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useLanguageStore,
  LANGUAGE_OPTIONS,
  type Language,
} from '@/store/useLanguageStore';

interface SettingItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();

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
          description: 'Two-factor authentication and account security',
          path: '/patient/security',
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
          path: '/patient/notifications',
        },
      ],
    },
    {
      title: 'Billing',
      items: [
        {
          icon: CreditCard,
          title: 'Payment Methods',
          description: 'Manage wallet and payment options',
          path: '/patient/wallet',
        },
      ],
    },
  ];

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
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
                {section.items.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors group border border-transparent hover:border-[var(--border-color)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                        <item.icon className="w-5 h-5 text-brand" />
                      </div>
                      <div className="text-left">
                        <p className="text-[var(--text-primary)] font-medium">
                          {item.title}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Appearance */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Dark Mode
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {theme === 'dark'
                      ? 'Currently using dark theme'
                      : 'Currently using light theme'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform ${
                    theme === 'dark' ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language & Region */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Language & Region
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Choose your preferred display language
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <div className="flex gap-3 flex-1">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => setLanguage(opt.code as Language)}
                      className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-brand bg-brand-soft'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-brand/40 hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl leading-none">{opt.flag}</span>
                        <div className="text-left">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected
                                ? 'text-brand'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {opt.nativeLabel}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {opt.label}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
