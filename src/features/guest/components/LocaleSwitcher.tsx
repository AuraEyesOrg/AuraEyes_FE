import { type ReactNode } from 'react';
import clsx from 'clsx';
import { Globe } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
  isSupportedLocale,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

interface LocaleSwitcherProps {
  className?: string;
}

interface LocaleOptionProps {
  locale: AppLocale;
  selected: boolean;
  onSelect: (locale: AppLocale) => void;
  children: ReactNode;
}

const LocaleOption = ({
  locale,
  selected,
  onSelect,
  children,
}: LocaleOptionProps) => (
  <button
    type="button"
    onClick={() => onSelect(locale)}
    className={clsx(
      'rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
      selected
        ? 'bg-[#0B8A83] text-white'
        : 'text-[#36506C] hover:bg-[#DCEFF5] hover:text-[#10324D]'
    )}
    aria-pressed={selected}
  >
    {children}
  </button>
);

export const LocaleSwitcher = ({ className }: LocaleSwitcherProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useParams();

  const currentLocale =
    locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  const handleChangeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === currentLocale) {
      return;
    }

    const currentPath = stripLocaleFromPathname(location.pathname);
    const localizedPath = withLocalePathname(nextLocale, currentPath);
    const search = location.search ?? '';
    const hash = location.hash ?? '';

    navigate(`${localizedPath}${search}${hash}`);
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl border border-[#C8DEE8] bg-[#F6FBFD] p-1',
        className
      )}
      role="group"
      aria-label={t('Common.language')}
    >
      <span className="px-1 text-[#36506C]" aria-hidden>
        <Globe className="h-4 w-4" />
      </span>

      {SUPPORTED_LOCALES.map((item) => (
        <LocaleOption
          key={item}
          locale={item}
          selected={item === currentLocale}
          onSelect={handleChangeLocale}
        >
          {item.toUpperCase()}
        </LocaleOption>
      ))}
    </div>
  );
};
