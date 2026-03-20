import { useTranslation } from 'react-i18next';
import i18n, { resources } from '@/i18n/i18n';

const resolveResourceValue = (locale: 'vi' | 'en', key: string) => {
  return key.split('.').reduce<unknown>((accumulator, segment) => {
    if (
      accumulator &&
      typeof accumulator === 'object' &&
      segment in (accumulator as Record<string, unknown>)
    ) {
      return (accumulator as Record<string, unknown>)[segment];
    }

    return undefined;
  }, resources[locale].translation);
};

const resolveLocaleCandidates = (): Array<'vi' | 'en'> => {
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'vi')
    .toLowerCase()
    .trim();

  if (currentLanguage.startsWith('en')) {
    return ['en', 'vi'];
  }

  return ['vi', 'en'];
};

export const useSafeTranslation = () => {
  const { t: baseT } = useTranslation();

  const t = (key: string, fallback = '') => {
    const translated = baseT(key, { defaultValue: '' });

    if (translated && translated !== key) {
      return translated;
    }

    const locales = resolveLocaleCandidates();

    for (const locale of locales) {
      const resourceValue = resolveResourceValue(locale, key);

      if (
        typeof resourceValue === 'string' &&
        resourceValue.trim().length > 0
      ) {
        return resourceValue;
      }
    }

    return fallback || key;
  };

  return { t };
};
