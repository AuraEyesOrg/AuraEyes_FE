export const SUPPORTED_LOCALES = ['vi', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'vi';

const RTL_LANGUAGE_CODES = new Set(['ar', 'fa', 'he', 'ur']);

const normalizeLocaleValue = (
  value: string | null | undefined
): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.split('-')[0]?.toLowerCase();
  return normalized || null;
};

export const isSupportedLocale = (value: string): value is AppLocale =>
  SUPPORTED_LOCALES.includes(value as AppLocale);

export const toSupportedLocale = (
  value: string | null | undefined
): AppLocale | null => {
  const normalized = normalizeLocaleValue(value);

  if (!normalized) {
    return null;
  }

  return isSupportedLocale(normalized) ? normalized : null;
};

export const getDirectionByLocale = (
  locale: string | AppLocale
): 'ltr' | 'rtl' => {
  const normalized = normalizeLocaleValue(locale);

  if (!normalized) {
    return 'ltr';
  }

  return RTL_LANGUAGE_CODES.has(normalized) ? 'rtl' : 'ltr';
};

export const getLocaleFromPathname = (pathname: string): AppLocale | null => {
  const [firstSegment] = pathname.split('/').filter(Boolean);

  return toSupportedLocale(firstSegment);
};

export const stripLocaleFromPathname = (pathname: string): string => {
  const locale = getLocaleFromPathname(pathname);

  if (!locale) {
    return pathname;
  }

  const stripped = pathname.replace(new RegExp(`^/${locale}`), '');
  return stripped.length > 0 ? stripped : '/';
};

export const withLocalePathname = (
  locale: AppLocale,
  pathname: string = '/'
): string => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const cleanPath = stripLocaleFromPathname(normalizedPath);

  if (cleanPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${cleanPath}`;
};
