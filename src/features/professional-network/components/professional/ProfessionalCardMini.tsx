/**
 * Professional Card Mini Component
 * Compact professional card for sidebar and lists
 * Matches Twitter/X "Who to follow" card exactly
 */

import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import type { Ophthalmologist } from '../../types';

interface Props {
  professional: Ophthalmologist;
}

export function ProfessionalCardMini({ professional }: Props) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Avatar - fixed size, no shrink */}
      <Link
        to={`/network/profile/${professional.id}`}
        className="flex-shrink-0"
      >
        <img
          src={professional.avatarUrl}
          alt={professional.fullName}
          className="w-10 h-10 rounded-full object-cover hover:opacity-90 hover-animation"
        />
      </Link>

      {/* Name & Specialty - flex-1 with min-w-0 for proper truncation */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <Link
          to={`/network/profile/${professional.id}`}
          className="flex items-center gap-1 hover:underline max-w-full"
        >
          <span className="font-bold text-[15px] text-text-main truncate">
            {professional.fullName}
          </span>
          {professional.isVerified && (
            <BadgeCheck className="w-[18px] h-[18px] text-brand-primary flex-shrink-0 fill-brand-primary/20" />
          )}
        </Link>
        <p className="text-[13px] text-text-muted truncate">
          {professional.specialty[0]}
        </p>
      </div>

      {/* Follow button - fixed width, never shrinks */}
      <button className="network-btn-follow flex-shrink-0">Follow</button>
    </div>
  );
}
