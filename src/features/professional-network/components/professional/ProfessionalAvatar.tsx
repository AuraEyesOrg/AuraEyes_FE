/**
 * Professional Avatar Component
 * Avatar with author info and timestamp
 */

import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import type { Ophthalmologist } from '../../types';
import { formatRequestDate } from '@/lib/date-utils';

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
  return (
    <div className="flex items-center gap-3">
      <Link to={`/network/profile/${author.id}`}>
        <img
          src={author.avatarUrl}
          alt={author.fullName}
          className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-brand-primary transition-all"
        />
      </Link>
      <div>
        <div className="flex items-center gap-1.5">
          <Link
            to={`/network/profile/${author.id}`}
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
