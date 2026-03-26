import { type KeyboardEvent, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Globe2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  type AppLocale,
  isSupportedLocale,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

type Locale = 'vi' | 'en';

interface PremiumLanguageSwitcherProps {
  className?: string;
}

const localeOptions: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
];

export const PremiumLanguageSwitcher = ({
  className,
}: PremiumLanguageSwitcherProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useParams();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const currentLocale: Locale =
    locale && isSupportedLocale(locale)
      ? (locale as Locale)
      : (DEFAULT_LOCALE as Locale);

  const selectedIndex = useMemo(
    () => localeOptions.findIndex((item) => item.value === currentLocale),
    [currentLocale]
  );

  const activeOptionId = `language-option-${currentLocale}`;

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) {
      return;
    }

    const currentPath = stripLocaleFromPathname(location.pathname);
    const localizedPath = withLocalePathname(
      nextLocale as AppLocale,
      currentPath
    );
    const search = location.search ?? '';
    const hash = location.hash ?? '';

    navigate(`${localizedPath}${search}${hash}`);
  };

  const handleArrowNavigation = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex =
      (selectedIndex + direction + localeOptions.length) % localeOptions.length;
    const nextLocale = localeOptions[nextIndex]?.value;

    if (!nextLocale) {
      return;
    }

    switchLocale(nextLocale);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={clsx(
        'inline-flex h-11 items-center gap-1 rounded-2xl border border-[#BFD8E3] bg-[linear-gradient(180deg,#F8FCFE_0%,#ECF6FA_100%)] p-1 shadow-[0_8px_20px_-14px_rgba(20,79,103,0.7)]',
        className
      )}
      role="radiogroup"
      aria-label={t('Common.language')}
      aria-activedescendant={activeOptionId}
      onKeyDown={handleArrowNavigation}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-[#2A6173]"
        aria-hidden
      >
        <Globe2 className="h-4 w-4" strokeWidth={2} />
      </span>

      <div className="relative grid h-9 grid-cols-2 items-center rounded-xl bg-white/70 p-0.5">
        <span
          className={clsx(
            'pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[10px] bg-[#0A8B86] shadow-[0_4px_12px_-6px_rgba(7,78,79,0.9)] transition-transform duration-300 ease-out motion-reduce:transition-none',
            selectedIndex === 1 && 'translate-x-full'
          )}
          aria-hidden
        />

        {localeOptions.map((option, index) => {
          const selected = option.value === currentLocale;

          return (
            <button
              key={option.value}
              id={`language-option-${option.value}`}
              type="button"
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              role="radio"
              aria-checked={selected}
              aria-selected={selected}
              aria-label={option.value === 'vi' ? 'Vietnamese' : 'English'}
              tabIndex={selected ? 0 : -1}
              onClick={() => switchLocale(option.value)}
              className={clsx(
                'relative z-10 h-8 min-w-12 rounded-[10px] px-3 text-xs font-semibold tracking-[0.08em] outline-none transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-[#0A8B86] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECF6FA]',
                selected
                  ? 'text-white'
                  : 'text-[#2E5C6E] hover:text-[#18495C] active:text-[#123A49]'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
