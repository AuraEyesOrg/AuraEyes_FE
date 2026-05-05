/**
 * Professional Card Mini Component
 * Compact professional card for sidebar and lists
 * Matches Twitter/X "Who to follow" card exactly
 */

import { Link, useLocation } from 'react-router-dom';
import type { Ophthalmologist } from '../../types';
import { InitialsAvatar } from './InitialsAvatar';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getLocalizedSpecialty } from '../../utils/specialtyLocalization';

interface Props {
  professional: Ophthalmologist;
}

export function ProfessionalCardMini({ professional }: Props) {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const displaySpecialty = getLocalizedSpecialty(t, professional.specialty[0]);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Avatar - fixed size, no shrink */}
      <Link
        to={toLocalizedPath(`/network/profile/${professional.id}`)}
        className="flex-shrink-0"
      >
        <InitialsAvatar
          fullName={professional.fullName}
          avatarUrl={professional.avatarUrl}
          size="md"
          className="hover:opacity-90 hover-animation"
        />
      </Link>

      {/* Name & Specialty - flex-1 with min-w-0 for proper truncation */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <Link
          to={toLocalizedPath(`/network/profile/${professional.id}`)}
          className="flex items-center gap-1 hover:underline max-w-full"
        >
          <span className="font-bold text-[15px] text-text-main truncate">
            {professional.fullName}
          </span>
        </Link>
        <p className="text-[13px] text-text-muted truncate">
          {displaySpecialty}
        </p>
      </div>

      {/* Follow button - fixed width, never shrinks */}
      <button className="network-btn-follow flex-shrink-0">
        {t('ProfessionalNetwork.common.actions.follow', 'Follow')}
      </button>
    </div>
  );
}
