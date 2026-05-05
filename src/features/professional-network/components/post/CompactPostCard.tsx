/**
 * Compact Post Card
 * Minimal post card for the Discover feed — no large images.
 * Shows avatar, author name, category badge, and truncated content.
 * Wrapped in a Link to the full post detail page.
 */

import { Link, useLocation } from 'react-router-dom';
import { FileText, HelpingHand, Newspaper } from 'lucide-react';
import type { ProfessionalPost } from '../../types';
import { InitialsAvatar } from '../professional/InitialsAvatar';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const postTypeConfig = {
  PeerDiscussion: {
    icon: HelpingHand,
    labelKey: 'ProfessionalNetwork.postTypes.peerDiscussion',
    labelFallback: 'Peer Discussion',
    color: 'text-amber-500 bg-amber-50',
  },
  KnowledgeShare: {
    icon: FileText,
    labelKey: 'ProfessionalNetwork.postTypes.knowledgeShare',
    labelFallback: 'Knowledge Share',
    color: 'text-blue-500 bg-blue-50',
  },
  Announcement: {
    icon: Newspaper,
    labelKey: 'ProfessionalNetwork.postTypes.announcement',
    labelFallback: 'Announcement',
    color: 'text-red-500 bg-red-50',
  },
} as const;

interface Props {
  post: ProfessionalPost;
}

export function CompactPostCard({ post }: Props) {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const typeConfig =
    postTypeConfig[post.category as keyof typeof postTypeConfig] ??
    postTypeConfig.KnowledgeShare;
  const TypeIcon = typeConfig.icon;

  const authorName =
    post.author?.fullName ??
    t('ProfessionalNetwork.common.unknownAuthor', 'Unknown');
  const authorAvatar = post.author?.avatarUrl;

  return (
    <Link
      to={toLocalizedPath(`/network/post/${post.id}`)}
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
            {t(typeConfig.labelKey, typeConfig.labelFallback)}
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
