/**
 * Group Card Component
 * Card for displaying professional group information
 */

import { Link } from 'react-router-dom';
import { Users, Lock, Globe, FileText } from 'lucide-react';
import type { ProfessionalGroup } from '../../types';

interface Props {
  group: ProfessionalGroup;
}

const groupTypeLabels = {
  specialty: 'Specialty',
  research: 'Research',
  regional: 'Regional',
  case_discussion: 'Case Discussion',
};

export function GroupCard({ group }: Props) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={group.avatarUrl}
          alt={group.name}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/network/groups/${group.id}`}
                className="font-bold text-[15px] text-text-main hover:underline truncate block"
              >
                {group.name}
              </Link>
              <div className="flex items-center gap-2 text-[13px] text-text-muted">
                <span className="flex items-center gap-1">
                  {group.privacy === 'public' ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {group.privacy === 'public' ? 'Public' : 'Private'}
                </span>
                <span>·</span>
                <span>{groupTypeLabels[group.type]}</span>
              </div>
            </div>

            <button
              className={`text-[13px] font-bold py-1.5 px-4 rounded-full shrink-0 ${
                group.isMember
                  ? 'bg-transparent border border-light-border text-text-main hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                  : 'btn-primary'
              }`}
            >
              {group.isMember ? 'Joined' : 'Join'}
            </button>
          </div>

          <p className="mt-1 text-[15px] text-text-main line-clamp-2 leading-normal">
            {group.description}
          </p>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {group.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="badge-specialty">
                {topic}
              </span>
            ))}
            {group.topics.length > 3 && (
              <span className="text-[13px] text-text-muted">
                +{group.topics.length - 3}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-[13px] text-text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {group.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {group.postCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
