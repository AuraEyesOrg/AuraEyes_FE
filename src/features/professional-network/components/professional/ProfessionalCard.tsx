/**
 * Professional Card Component
 * Full professional card with details and actions
 */

import { Link, useLocation } from 'react-router-dom';
import { Users, FileText, Star } from 'lucide-react';
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

export function ProfessionalCard({ professional }: Props) {
  const location = useLocation();
  const { t } = useSafeTranslation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const displayPrimarySpecialty = getLocalizedSpecialty(
    t,
    professional.specialty?.[0]
  );
  const displaySecondarySpecialties =
    professional.specialty?.slice(1).map((specialty) => ({
      value: specialty,
      label: getLocalizedSpecialty(t, specialty),
    })) ?? [];

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link
          to={toLocalizedPath(`/network/profile/${professional.id}`)}
          className="shrink-0"
        >
          <InitialsAvatar
            fullName={professional.fullName}
            avatarUrl={professional.avatarUrl}
            size="lg"
            className="hover:opacity-90 hover-animation"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <Link
                  to={toLocalizedPath(`/network/profile/${professional.id}`)}
                  className="font-bold text-[15px] text-text-main hover:underline truncate"
                >
                  {professional.fullName}
                </Link>
              </div>
              <p className="text-[15px] text-text-muted truncate">
                {displayPrimarySpecialty}
                {professional.organisationName &&
                  ` · ${professional.organisationName}`}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {displaySecondarySpecialties.map((specialty) => (
              <span key={specialty.value} className="badge-specialty">
                {specialty.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-[13px] text-text-muted">
            {professional.connectionCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {professional.connectionCount}
              </span>
            )}
            {professional.postCount !== undefined && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {professional.postCount}
              </span>
            )}
            <Star className="w-4 h-4 text-yellow-500" />
            {professional.rating}
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="mt-2 text-[15px] text-text-main line-clamp-2 leading-normal">
              {professional.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
