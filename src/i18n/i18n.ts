import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enMessages from '@/i18n/messages/en.json';
import viMessages from '@/i18n/messages/vi.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/locales';

const resources = {
  vi: {
    translation: viMessages,
  },
  en: {
    translation: enMessages,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['path', 'localStorage', 'navigator', 'htmlTag'],
        lookupFromPathIndex: 0,
        caches: ['localStorage'],
      },
      returnNull: false,
      react: {
        useSuspense: false,
      },
    });
}

export { resources };
export default i18n;
