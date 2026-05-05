import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { resources } from '@/i18n/i18n';

type InterpolationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function applyInterpolation(
  template: string,
  params?: InterpolationParams
): string {
  if (!params) return template;
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? '' : String(value);
  });
}

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
  const { t: baseT, i18n } = useTranslation();

  const t = useCallback(
    (
      key: string,
      fallbackOrParams: string | InterpolationParams = '',
      params?: InterpolationParams
    ) => {
      const fallback =
        typeof fallbackOrParams === 'string' ? fallbackOrParams : '';
      const interpolationParams =
        typeof fallbackOrParams === 'string' ? params : fallbackOrParams;

      const translated = baseT(key, {
        defaultValue: '',
        ...(interpolationParams ?? {}),
      });

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
          return applyInterpolation(resourceValue, interpolationParams);
        }
      }

      return applyInterpolation(fallback || key, interpolationParams);
    },
    [baseT]
  );

  return { t, i18n };
};
