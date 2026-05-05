import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { persistLocale } from '@/i18n/middleware';
import { DEFAULT_LOCALE, toSupportedLocale } from '@/i18n/locales';

export const LocaleSync = () => {
  const { locale } = useParams();

  useEffect(() => {
    const nextLocale = toSupportedLocale(locale) ?? DEFAULT_LOCALE;
    const currentLocale =
      toSupportedLocale(i18n.resolvedLanguage ?? i18n.language) ??
      DEFAULT_LOCALE;

    if (currentLocale !== nextLocale) {
      void i18n.changeLanguage(nextLocale);
    }

    persistLocale(nextLocale);
  }, [locale]);

  return null;
};
