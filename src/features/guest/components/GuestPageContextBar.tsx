import clsx from 'clsx';
import { BookOpenText, Gauge } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import GuestBreadcrumb from './GuestBreadcrumb';
import SourceVerificationTag from './SourceVerificationTag';

type ComplexityLevel = 'basic' | 'moderate' | 'advanced';

interface GuestPageContextBarProps {
  currentLabel: string;
  readingTimeMinutes?: number;
  complexity?: ComplexityLevel;
  sourceLabel?: string;
  className?: string;
}

export const GuestPageContextBar = ({
  currentLabel,
  readingTimeMinutes,
  complexity,
  sourceLabel,
  className,
}: GuestPageContextBarProps) => {
  const { t } = useSafeTranslation();

  return (
    <section
      className={clsx(
        'mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-10 lg:pt-5',
        className
      )}
    >
      <div className="guest-context-shell relative overflow-hidden rounded-2xl px-4 py-3.5 sm:px-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-200/35 blur-2xl dark:bg-cyan-400/12"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/85 to-transparent dark:via-cyan-400/55"
        />

        <div className="relative flex flex-col gap-2.5">
          <GuestBreadcrumb
            currentLabel={currentLabel}
            className="border-b border-slate-200/75 pb-2 dark:border-slate-700/70"
          />

          <div className="flex flex-wrap items-center gap-2">
            {typeof readingTimeMinutes === 'number' ? (
              <span className="guest-meta-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.01em] sm:text-xs">
                <BookOpenText
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {t('GuestEnhancements.readingTime', {
                    minutes: readingTimeMinutes,
                  })}
                </span>
              </span>
            ) : null}

            {complexity ? (
              <span className="guest-meta-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.01em] sm:text-xs">
                <Gauge className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {t('GuestEnhancements.complexity.label')}:&nbsp;
                  {t(`GuestEnhancements.complexity.${complexity}`)}
                </span>
              </span>
            ) : null}

            {sourceLabel ? <SourceVerificationTag label={sourceLabel} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestPageContextBar;
