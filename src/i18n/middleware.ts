import {
  DEFAULT_LOCALE,
  type AppLocale,
  getLocaleFromPathname,
  toSupportedLocale,
  withLocalePathname,
} from '@/i18n/locales';

const LOCALE_STORAGE_KEY = 'aura.locale';

const getNavigatorLocale = (): AppLocale | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return toSupportedLocale(window.navigator.language);
};

export const getStoredLocale = (): AppLocale | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return toSupportedLocale(storedLocale);
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

export const resolvePathWithLocale = (pathname: string): string => {
  const safePath = pathname?.trim() ? pathname : '/';

  return getLocaleFromPathname(safePath)
    ? safePath
    : withLocalePathname(detectPreferredLocale(), safePath);
};
