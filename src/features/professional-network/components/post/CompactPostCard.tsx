/**
 * Compact Post Card
 * Minimal post card for the Discover feed — no large images.
 * Shows avatar, author name, category badge, and truncated content.
 * Wrapped in a Link to the full post detail page.
 */

import { Link } from 'react-router-dom';
import { FileText, FlaskConical, HelpingHand, Newspaper } from 'lucide-react';
import type { ProfessionalPost } from '../../types';
import { InitialsAvatar } from '../professional/InitialsAvatar';

const postTypeConfig = {
  CasePresentation: {
    icon: FlaskConical,
    label: 'Case Presentation',
    color: 'text-purple-500 bg-purple-50',
  },
  PeerDiscussion: {
    icon: HelpingHand,
    label: 'Peer Discussion',
    color: 'text-amber-500 bg-amber-50',
  },
  KnowledgeShare: {
    icon: FileText,
    label: 'Knowledge Share',
    color: 'text-blue-500 bg-blue-50',
  },
  Announcement: {
    icon: Newspaper,
    label: 'Announcement',
    color: 'text-red-500 bg-red-50',
  },
} as const;

interface Props {
  post: ProfessionalPost;
}

export function CompactPostCard({ post }: Props) {
  const typeConfig =
    postTypeConfig[post.category as keyof typeof postTypeConfig] ??
    postTypeConfig.KnowledgeShare;
  const TypeIcon = typeConfig.icon;

  const authorName = post.author?.fullName ?? 'Unknown';
  const authorAvatar = post.author?.avatarUrl;

  return (
    <Link
      to={`/network/post/${post.id}`}
      className="flex items-start gap-3 px-4 py-3 hover:bg-black/[0.03] hover-animation"
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar fullName={authorName} size="sm" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Author + Category row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <span className="text-[14px] font-semibold text-text-main leading-tight truncate">
            {authorName}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${typeConfig.color}`}
          >
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>
        </div>

        {/* Content — max 2 lines */}
        <p className="text-[13px] text-text-secondary leading-snug line-clamp-2">
          {post.content}
        </p>
      </div>
    </Link>
  );
}
