/**
 * Professional Avatar Component
 * Avatar with author info and timestamp
 */

import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import type { Ophthalmologist } from '../../types';

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
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('vi-VN');
  };

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
          <span>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
