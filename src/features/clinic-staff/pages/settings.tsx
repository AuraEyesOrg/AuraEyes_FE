import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  Moon,
  Settings2,
  Shield,
  Sun,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { persistLocale, resolvePathWithLocale } from '@/i18n/middleware';
import {
  getLocaleFromPathname,
  toSupportedLocale,
  withLocalePathname,
} from '@/i18n/locales';
import {
  LANGUAGE_OPTIONS,
  type Language,
  useLanguageStore,
} from '@/store/useLanguageStore';
import { useTheme } from '@/contexts/ThemeContext';
import ClinicStaffLayout from '../components/ClinicStaffLayout';

type SettingsTab = 'account' | 'preferences' | 'billing';

interface SettingItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
}

export default function ClinicStaffSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const { t: i18nT } = useTranslation();
  const t = (key: string, fallback: string) =>
    (i18nT(
      key as never,
      { defaultValue: fallback } as never
    ) as unknown as string) ?? fallback;

  const currentLocale =
    toSupportedLocale(locale) ??
    toSupportedLocale(i18n.resolvedLanguage ?? i18n.language) ??
    language;

  useEffect(() => {
    if (language !== currentLocale) {
      setLanguage(currentLocale);
    }
  }, [currentLocale, language, setLanguage]);

  const handleLanguageChange = (nextLocale: Language) => {
    setLanguage(nextLocale);
    persistLocale(nextLocale);
    void i18n.changeLanguage(nextLocale);

    const localizedPath = withLocalePathname(nextLocale, location.pathname);
    const targetUrl = `${localizedPath}${location.search}${location.hash}`;
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    const pathHasLocale = Boolean(getLocaleFromPathname(location.pathname));

    if (!pathHasLocale || targetUrl !== currentUrl) {
      navigate(targetUrl, { replace: true });
    }
  };

  const accountItems: SettingItem[] = useMemo(
    () => [
      {
        icon: User,
        title: t('ClinicStaffSettings.tabs.profile', 'Profile'),
        description: t(
          'ClinicStaffSettings.items.profileDescription',
          'Manage personal information and upload avatar'
        ),
        path: '/clinic-staff/profile',
      },
      {
        icon: Shield,
        title: t('ClinicStaffSettings.tabs.security', 'Security'),
        description: t(
          'ClinicStaffSettings.items.securityDescription',
          'Two-factor authentication and account protection'
        ),
        path: '/clinic-staff/security',
      },
      {
        icon: Bell,
        title: t('ClinicStaffSettings.tabs.notifications', 'Notifications'),
        description: t(
          'ClinicStaffSettings.items.notificationsDescription',
          'Review all notifications and reminders'
        ),
        path: '/clinic-staff/notifications',
      },
    ],
    [t]
  );

  const billingItems: SettingItem[] = useMemo(
    () => [
      {
        icon: CreditCard,
        title: t('ClinicStaffSettings.tabs.wallet', 'Wallet'),
        description: t(
          'ClinicStaffSettings.items.walletDescription',
          'View wallet balance and transaction history'
        ),
        path: '/clinic-staff/wallet',
      },
    ],
    [t]
  );

  return (
    <ClinicStaffLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
            {t('ClinicStaffSettings.title', 'Settings')}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t(
              'ClinicStaffSettings.subtitle',
              'Configure account, security, and staff portal preferences'
            )}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2">
          <TabButton
            isActive={activeTab === 'account'}
            onClick={() => setActiveTab('account')}
            icon={<User className="h-4 w-4" />}
            label={t('ClinicStaffSettings.groups.account', 'Account')}
          />
          <TabButton
            isActive={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            icon={<Settings2 className="h-4 w-4" />}
            label={t('ClinicStaffSettings.groups.preferences', 'Preferences')}
          />
          <TabButton
            isActive={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={<CreditCard className="h-4 w-4" />}
            label={t('ClinicStaffSettings.groups.billing', 'Billing')}
          />
        </div>

        <div className="space-y-6">
          {activeTab === 'account' && (
            <div className="medical-card">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                {t('ClinicStaffSettings.groups.account', 'Account')}
              </h2>
              <div className="space-y-3">
                {accountItems.map((item) => (
                  <Link
                    key={item.path}
                    to={resolvePathWithLocale(item.path)}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <>
              <div className="medical-card">
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                  {t('ClinicStaffSettings.appearance.title', 'Appearance')}
                </h2>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      {theme === 'dark' ? (
                        <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {t(
                          'ClinicStaffSettings.appearance.darkMode',
                          'Dark Mode'
                        )}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {theme === 'dark'
                          ? t(
                              'ClinicStaffSettings.appearance.currentDark',
                              'Current theme: Dark'
                            )
                          : t(
                              'ClinicStaffSettings.appearance.currentLight',
                              'Current theme: Light'
                            )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`relative h-6 w-12 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-brand'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={t(
                      'ClinicStaffSettings.appearance.toggle',
                      'Toggle theme'
                    )}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        theme === 'dark' ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="medical-card">
                <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                  {t('ClinicStaffSettings.language.title', 'Language')}
                </h2>
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  {t(
                    'ClinicStaffSettings.language.subtitle',
                    'Choose your preferred language for the portal'
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                    <Globe className="h-5 w-5 text-brand" />
                  </div>
                  <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
                    {LANGUAGE_OPTIONS.map((opt) => {
                      const isSelected = currentLocale === opt.code;
                      return (
                        <button
                          type="button"
                          key={opt.code}
                          onClick={() => handleLanguageChange(opt.code)}
                          className={`min-w-[140px] flex-1 rounded-xl border-2 px-4 py-3 text-left transition ${
                            isSelected
                              ? 'border-brand bg-brand-soft'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-brand/40 hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{opt.flag}</span>
                              <div>
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
                              <Check className="h-4 w-4 text-brand" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <div className="medical-card">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                {t('ClinicStaffSettings.groups.billing', 'Billing')}
              </h2>
              {billingItems.map((item) => (
                <Link
                  key={item.path}
                  to={resolvePathWithLocale(item.path)}
                  className="group flex items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {item.title}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicStaffLayout>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ isActive, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? 'bg-[var(--bg-primary)] text-brand shadow-sm'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
