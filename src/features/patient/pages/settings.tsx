import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { persistLocale } from '@/i18n/middleware';
import {
  getLocaleFromPathname,
  toSupportedLocale,
  withLocalePathname,
} from '@/i18n/locales';

interface SettingItem {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  path: string;
}

interface SettingSection {
  titleKey: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

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

  const settingSections: SettingSection[] = [
    {
      titleKey: 'PatientSettings.sections.account',
      items: [
        {
          icon: User,
          titleKey: 'PatientSettings.items.profile.title',
          descriptionKey: 'PatientSettings.items.profile.description',
          path: '/patient/profile',
        },
        {
          icon: Shield,
          titleKey: 'PatientSettings.items.security.title',
          descriptionKey: 'PatientSettings.items.security.description',
          path: '/forgot-password',
        },
      ],
    },
    {
      titleKey: 'PatientSettings.sections.preferences',
      items: [
        {
          icon: Bell,
          titleKey: 'PatientSettings.items.notifications.title',
          descriptionKey: 'PatientSettings.items.notifications.description',
          path: '/patient/notifications',
        },
      ],
    },
    {
      titleKey: 'PatientSettings.sections.billing',
      items: [
        {
          icon: CreditCard,
          titleKey: 'PatientSettings.items.paymentMethods.title',
          descriptionKey: 'PatientSettings.items.paymentMethods.description',
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
            {t('PatientSettings.page.title')}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t('PatientSettings.page.subtitle')}
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section) => (
            <div key={section.titleKey} className="medical-card">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {t(section.titleKey)}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.titleKey}
                    to={item.path}
                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors group border border-transparent hover:border-[var(--border-color)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                        <item.icon className="w-5 h-5 text-brand" />
                      </div>
                      <div className="text-left">
                        <p className="text-[var(--text-primary)] font-medium">
                          {t(item.titleKey)}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t(item.descriptionKey)}
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
              {t('PatientSettings.appearance.title')}
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
                    {t('PatientSettings.appearance.darkMode')}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {theme === 'dark'
                      ? t('PatientSettings.appearance.currentDark')
                      : t('PatientSettings.appearance.currentLight')}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                aria-label={t('PatientSettings.appearance.toggleAriaLabel')}
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
              {t('PatientSettings.language.title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {t('PatientSettings.language.subtitle')}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <div className="flex gap-3 flex-1">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = currentLocale === opt.code;
                  return (
                    <button
                      type="button"
                      key={opt.code}
                      onClick={() => handleLanguageChange(opt.code)}
                      aria-pressed={isSelected}
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
