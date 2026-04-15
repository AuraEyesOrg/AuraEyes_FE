import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggleButton = ({
  className,
  showLabel = false,
}: ThemeToggleButtonProps) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useSafeTranslation();

  const isDark = theme === 'dark';
  const buttonLabel = isDark
    ? t('Common.switchToLight')
    : t('Common.switchToDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={buttonLabel}
      title={buttonLabel}
      className={clsx(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#BFD8E3] bg-white px-3 text-[#2E5C6E] transition-colors hover:bg-[#F3F8FA] hover:text-[#18495C]',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={2} />
      )}
      {showLabel ? (
        <span className="text-xs font-semibold tracking-wide">
          {buttonLabel}
        </span>
      ) : null}
    </button>
  );
};
