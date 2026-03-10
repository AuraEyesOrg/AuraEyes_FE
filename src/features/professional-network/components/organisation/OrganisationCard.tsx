/**
 * Organisation Card Component
 * Card for displaying organisation information
 */

import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Building2, Users } from 'lucide-react';
import type { Organisation } from '../../types';

interface Props {
  organisation: Organisation;
}

const orgTypeLabels = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  research_center: 'Research Center',
};

export function OrganisationCard({ organisation }: Props) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Logo */}
        <img
          src={organisation.logoUrl}
          alt={organisation.name}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <Link
                  to={`/network/organisation/${organisation.id}`}
                  className="font-bold text-[15px] text-text-main hover:underline truncate"
                >
                  {organisation.name}
                </Link>
                {organisation.isVerified && (
                  <BadgeCheck className="w-[18px] h-[18px] text-brand-primary shrink-0" />
                )}
              </div>
              <p className="text-[13px] text-text-muted flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {orgTypeLabels[organisation.type]}
              </p>
            </div>
          </div>

          <p className="flex items-center gap-1 text-[13px] text-text-muted mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{organisation.address}</span>
          </p>

          <p className="mt-1 text-[15px] text-text-main line-clamp-2 leading-normal">
            {organisation.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-[13px] text-text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {organisation.followerCount.toLocaleString()}
            </span>
            <span>{organisation.memberCount} members</span>
          </div>

          {/* Accreditations */}
          {organisation.accreditations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {organisation.accreditations.map((acc) => (
                <span
                  key={acc}
                  className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full"
                >
                  {acc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
