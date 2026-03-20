import {
  DEFAULT_LOCALE,
  type AppLocale,
  getLocaleFromPathname,
  isSupportedLocale,
  withLocalePathname,
} from '@/i18n/locales';

const LOCALE_STORAGE_KEY = 'aura.locale';

const getNavigatorLocale = (): AppLocale | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const browserLocale = window.navigator.language.split('-')[0]?.toLowerCase();

  if (!browserLocale) {
    return null;
  }

  return isSupportedLocale(browserLocale) ? browserLocale : null;
};

export const getStoredLocale = (): AppLocale | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return storedLocale && isSupportedLocale(storedLocale) ? storedLocale : null;
};

export const persistLocale = (locale: AppLocale): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

export const detectPreferredLocale = (): AppLocale =>
  getStoredLocale() ?? getNavigatorLocale() ?? DEFAULT_LOCALE;

export const resolveLocaleFromPathname = (pathname: string): AppLocale =>
  getLocaleFromPathname(pathname) ?? detectPreferredLocale();

export const resolvePathWithLocale = (pathname: string): string =>
  getLocaleFromPathname(pathname)
    ? pathname
    : withLocalePathname(detectPreferredLocale(), pathname);
