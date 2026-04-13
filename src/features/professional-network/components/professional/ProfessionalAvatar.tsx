/**
 * Professional Avatar Component
 * Avatar with author info and timestamp
 */

import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import type { Ophthalmologist } from '../../types';
import { InitialsAvatar } from './InitialsAvatar';
import { formatRequestDate } from '@/lib/date-utils';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

interface Props {
  author: Ophthalmologist;
  timestamp: string;
  showOrganisation?: boolean;
}

export function ProfessionalAvatar({
  author,
  timestamp,
  showOrganisation = true,
}: Props) {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  return (
    <div className="flex items-center gap-3">
      <Link to={toLocalizedPath(`/network/profile/${author.id}`)}>
        <InitialsAvatar
          fullName={author.fullName}
          avatarUrl={author.avatarUrl}
          size="lg"
          className="hover:ring-2 hover:ring-brand-primary transition-all"
        />
      </Link>
      <div>
        <div className="flex items-center gap-1.5">
          <Link
            to={toLocalizedPath(`/network/profile/${author.id}`)}
            className="font-semibold text-text-main hover:text-brand-primary hover:underline"
          >
            {author.fullName}
          </Link>
          {author.isVerified && (
            <BadgeCheck className="w-4 h-4 text-brand-primary" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>{author.specialty?.[0]}</span>
          {showOrganisation && author.organisationName && (
            <>
              <span>·</span>
              <span>{author.organisationName}</span>
            </>
          )}
          <span>·</span>
          <span>{formatRequestDate(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
