/**
 * Professional Card Component
 * Full professional card with details and actions
 */

import { Link } from 'react-router-dom';
import { BadgeCheck, Users, FileText, Star } from 'lucide-react';
import type { Ophthalmologist } from '../../types';
import { InitialsAvatar } from './InitialsAvatar';

interface Props {
  professional: Ophthalmologist;
}

export function ProfessionalCard({ professional }: Props) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/network/profile/${professional.id}`} className="shrink-0">
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
                  to={`/network/profile/${professional.id}`}
                  className="font-bold text-[15px] text-text-main hover:underline truncate"
                >
                  {professional.fullName}
                </Link>
                {professional.isVerified && (
                  <BadgeCheck className="w-[18px] h-[18px] text-brand-primary shrink-0" />
                )}
              </div>
              <p className="text-[15px] text-text-muted truncate">
                {professional.specialty?.[0]}
                {professional.organisationName &&
                  ` · ${professional.organisationName}`}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {professional.specialty?.slice(1).map((spec) => (
              <span key={spec} className="badge-specialty">
                {spec}
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
            {professional.rating !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {professional.rating}
              </span>
            )}
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
