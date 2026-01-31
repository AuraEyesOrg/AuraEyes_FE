/**
 * Professional Card Mini Component
 * Compact professional card for sidebar and lists
 */

import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import type { Ophthalmologist } from '../../types';

interface Props {
  professional: Ophthalmologist;
}

export function ProfessionalCardMini({ professional }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Link to={`/network/profile/${professional.id}`} className="shrink-0">
        <img
          src={professional.avatarUrl}
          alt={professional.fullName}
          className="w-10 h-10 rounded-full object-cover hover:opacity-90 hover-animation"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/network/profile/${professional.id}`}
          className="font-bold text-[15px] text-text-main hover:underline truncate flex items-center gap-1"
        >
          {professional.fullName}
          {professional.isVerified && (
            <BadgeCheck className="w-[18px] h-[18px] text-brand-primary shrink-0" />
          )}
        </Link>
        <p className="text-[13px] text-text-muted truncate">
          {professional.specialty[0]}
        </p>
      </div>
      <button className="btn-primary text-[13px] py-1.5 px-4 shrink-0">
        Follow
      </button>
    </div>
  );
}
