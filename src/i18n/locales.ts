export const SUPPORTED_LOCALES = ['vi', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'vi';

const RTL_LOCALES = new Set<AppLocale>([]);

export const isSupportedLocale = (value: string): value is AppLocale =>
  SUPPORTED_LOCALES.includes(value as AppLocale);

export const getDirectionByLocale = (locale: AppLocale): 'ltr' | 'rtl' =>
  RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';

export const getLocaleFromPathname = (pathname: string): AppLocale | null => {
  const [firstSegment] = pathname.split('/').filter(Boolean);

  if (!firstSegment) {
    return null;
  }

  return isSupportedLocale(firstSegment) ? firstSegment : null;
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
