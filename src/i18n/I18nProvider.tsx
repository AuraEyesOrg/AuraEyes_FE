import { type ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { getDirectionByLocale, isSupportedLocale } from '@/i18n/locales';

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  useEffect(() => {
    const applyDocumentLanguage = (language: string) => {
      const locale = isSupportedLocale(language) ? language : 'vi';
      const direction = getDirectionByLocale(locale);

      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    };

    applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
    i18n.on('languageChanged', applyDocumentLanguage);

    return () => {
      i18n.off('languageChanged', applyDocumentLanguage);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
