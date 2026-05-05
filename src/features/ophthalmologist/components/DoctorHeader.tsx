import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';
import { NotificationDropdown } from '@/components/ui/notification';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface DoctorHeaderProps {
  pageName?: string;
}

export default function DoctorHeader({
  pageName = 'Dashboard',
}: DoctorHeaderProps) {
  const { t } = useSafeTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const displayInitial = user?.fullName?.split(' ').pop()?.charAt(0) || 'D';

  return (
    <header className="role-header">
      <div className="flex items-center justify-between">
        <div className="breadcrumb-text flex items-center gap-2">
          <span>{t('Ophthalmologist.header.pages', 'Pages')}</span>
          <span>/</span>
          <span className="breadcrumb-active">{pageName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t(
                'Ophthalmologist.header.searchPlaceholder',
                'Search patients, ID...'
              )}
              className="header-search-input w-64"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            aria-label={t('Ophthalmologist.header.toggleTheme', 'Toggle theme')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
