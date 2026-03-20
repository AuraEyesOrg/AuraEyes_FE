import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { persistLocale } from '@/i18n/middleware';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/i18n/locales';

export const LocaleSync = () => {
  const { locale } = useParams();

  useEffect(() => {
    const nextLocale =
      locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

    if (i18n.resolvedLanguage !== nextLocale) {
      void i18n.changeLanguage(nextLocale);
    }

    persistLocale(nextLocale);
  }, [locale]);

  return null;
};
