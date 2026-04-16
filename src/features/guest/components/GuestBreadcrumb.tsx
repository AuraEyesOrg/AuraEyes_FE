import clsx from 'clsx';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

interface GuestBreadcrumbProps {
  currentLabel: string;
  className?: string;
}

export const GuestBreadcrumb = ({
  currentLabel,
  className,
}: GuestBreadcrumbProps) => {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const homeLabel = t('Navigation.home');
  const isHomeView =
    currentLabel.trim().toLowerCase() === homeLabel.trim().toLowerCase();

  return (
    <nav
      aria-label={t('GuestEnhancements.breadcrumb.ariaLabel')}
      className={clsx('text-[13px]', className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <li>
          <Link
            to={withLocalePathname(locale)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-cyan-200/85 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-200 dark:focus-visible:ring-offset-slate-900"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{homeLabel}</span>
          </Link>
        </li>

        {!isHomeView ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </li>
            <li>
              <span className="font-semibold text-slate-700 dark:text-slate-100">
                {currentLabel}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
};

export default GuestBreadcrumb;
