/**
 * Connection Request Card Component
 * Card for displaying connection requests
 */

import { Check, X, Clock } from 'lucide-react';
import type { ProfessionalConnection } from '../../types';
import { formatViDate } from '@/lib/date-utils';

interface Props {
  connection: ProfessionalConnection;
  type: 'pending' | 'received';
}

export function ConnectionRequestCard({ connection, type }: Props) {
  const person =
    type === 'received' ? connection.requester : connection.addressee;

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <img
          src={person.avatarUrl}
          alt={person.fullName}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-[15px] text-text-main truncate">
                {person.fullName}
              </h4>
              <p className="text-[13px] text-text-muted truncate">
                {person.specialty.join(', ')}
              </p>
              {person.organisationName && (
                <p className="text-[13px] text-text-muted truncate">
                  {person.organisationName}
                </p>
              )}
            </div>
            <span className="text-[13px] text-text-muted shrink-0">
              {formatViDate(connection.createdAt)}
            </span>
          </div>

          {connection.message && (
            <p className="mt-2 text-[15px] text-text-main bg-main-search-background p-3 rounded-xl leading-normal">
              "{connection.message}"
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            {type === 'received' ? (
              <>
                <button className="btn-primary text-[13px] py-1.5 px-4 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button className="btn-secondary text-[13px] py-1.5 px-4 flex items-center gap-1.5">
                  <X className="w-4 h-4" />
                  Decline
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                <Clock className="w-4 h-4" />
                Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
