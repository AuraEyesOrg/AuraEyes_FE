/**
 * Organisation Card Component
 * Card for displaying organisation information
 */

import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, MapPin, Building2, Users } from 'lucide-react';
import type { Organisation } from '../../types';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getLocalizedAccreditation } from '../../utils/accreditationLocalization';

interface Props {
  organisation: Organisation;
}

export function OrganisationCard({ organisation }: Props) {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  // API may return {id, fullName, email} shape — normalise defensively
  const displayName =
    organisation.name ??
    (organisation as unknown as { fullName?: string }).fullName ??
    t('ProfessionalNetwork.common.unknownAuthor', 'Unknown');

  const orgTypeLabels = {
    hospital: t('ProfessionalNetwork.organisation.types.hospital', 'Hospital'),
    clinic: t('ProfessionalNetwork.organisation.types.clinic', 'Clinic'),
    research_center: t(
      'ProfessionalNetwork.organisation.types.researchCenter',
      'Research Center'
    ),
  };

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Logo */}
        {organisation.logoUrl ? (
          <img
            src={organisation.logoUrl}
            alt={displayName}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-brand-primary" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <Link
                  to={toLocalizedPath(
                    `/network/organisation/${organisation.id}`
                  )}
                  className="font-bold text-[15px] text-text-main hover:underline truncate"
                >
                  {displayName}
                </Link>
                {organisation.isVerified && (
                  <BadgeCheck className="w-[18px] h-[18px] text-brand-primary shrink-0" />
                )}
              </div>
              {organisation.type && (
                <p className="text-[13px] text-text-muted flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {orgTypeLabels[organisation.type] ?? organisation.type}
                </p>
              )}
            </div>
          </div>

          {organisation.address && (
            <p className="flex items-center gap-1 text-[13px] text-text-muted mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{organisation.address}</span>
            </p>
          )}

          {organisation.description && (
            <p className="mt-1 text-[15px] text-text-main line-clamp-2 leading-normal">
              {organisation.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-[13px] text-text-muted">
            {organisation.followerCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {organisation.followerCount.toLocaleString()}
              </span>
            )}
            {organisation.memberCount !== undefined && (
              <span>
                {t(
                  'ProfessionalNetwork.organisation.stats.members',
                  '{{count}} members',
                  { count: organisation.memberCount }
                )}
              </span>
            )}
          </div>

          {/* Accreditations */}
          {organisation.accreditations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {organisation.accreditations.map((accreditation) => {
                const displayAccreditation = getLocalizedAccreditation(
                  t,
                  accreditation
                );

                return (
                  <span
                    key={accreditation}
                    className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full"
                  >
                    {displayAccreditation}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
