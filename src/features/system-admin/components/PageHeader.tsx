/**
 * Page Header Component
 * Common header for all system admin pages
 */

import { Download, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationDropdown } from '@/components/ui/notification';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

import { AuraLogo } from '@/components/ui/aura-logo';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  showNotifications?: boolean;
  showLogo?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  showNotifications = true,
  showLogo = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useSafeTranslation();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          {showLogo && <AuraLogo size="sm" showText={false} />}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge}
          </div>
        </div>
        {description && (
          <p className="text-slate-600 dark:text-slate-400 text-base mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-colors"
          aria-label={t('SystemAdmin.header.toggleTheme', 'Toggle theme')}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {showNotifications && <NotificationDropdown />}

        {actions ? (
          actions
        ) : (
          <button className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary hover:bg-primary-dark text-slate-900 font-bold text-sm transition-all shadow-md shadow-primary/20">
            <Download className="w-4 h-4" />
            <span>{t('SystemAdmin.actions.export', 'Export')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
