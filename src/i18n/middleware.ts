import {
  DEFAULT_LOCALE,
  type AppLocale,
  getLocaleFromPathname,
  toSupportedLocale,
  withLocalePathname,
  useLocalePath,
} from '@/i18n/locales';

export { useLocalePath };

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

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return toSupportedLocale(storedLocale);
  } catch {
    return null;
  }
};

export const persistLocale = (locale: AppLocale): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage write failures (e.g. privacy mode / blocked storage).
  }
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
