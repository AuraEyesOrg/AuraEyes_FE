/**
 * Post Card Component
 * Main card for displaying professional network posts (including reposts/quote posts)
 */

import { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreHorizontal,
  MessageCircle,
  Lightbulb,
  ThumbsUp,
  HelpCircle,
  Heart,
  PartyPopper,
  FileText,
  HelpingHand,
  Newspaper,
  Copy,
  Flag,
  Bookmark,
  BookmarkCheck,
  Repeat2,
  X,
  ShieldAlert,
} from 'lucide-react';
import type { ProfessionalPost, ReactionType } from '../../types';
import { InitialsAvatar } from '../professional/InitialsAvatar';
import { useRepostMutation } from '../../hooks/useRepostMutation';
import { LoadingButton } from '@/components/ui/loading-button';
import { formatViCompactDate } from '@/lib/date-utils';
import useAuthStore from '@/store/auth-store';
import { resolveAuthorType } from '../../utils/authorType';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface Props {
  post: ProfessionalPost;
  currentUserId?: string;
  onReaction?: (postId: string, type: ReactionType) => void;
  onSave?: (postId: string) => void;
  onHidePost?: (postId: string, hideReason?: string) => void;
  canModerate?: boolean;
  isHidingPost?: boolean;
}

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
};

const reactionConfig: Record<
  ReactionType,
  {
    icon: React.ElementType;
    labelKey: string;
    labelFallback: string;
    color: string;
  }
> = {
  Insightful: {
    icon: Lightbulb,
    labelKey: 'ProfessionalNetwork.reactions.insightful',
    labelFallback: 'Insightful',
    color: 'text-reaction-insightful',
  },
  Agree: {
    icon: ThumbsUp,
    labelKey: 'ProfessionalNetwork.reactions.agree',
    labelFallback: 'Agree',
    color: 'text-reaction-agree',
  },
  Helpful: {
    icon: Heart,
    labelKey: 'ProfessionalNetwork.reactions.helpful',
    labelFallback: 'Helpful',
    color: 'text-reaction-helpful',
  },
  Question: {
    icon: HelpCircle,
    labelKey: 'ProfessionalNetwork.reactions.question',
    labelFallback: 'Question',
    color: 'text-reaction-question',
  },
  Celebrate: {
    icon: PartyPopper,
    labelKey: 'ProfessionalNetwork.reactions.celebrate',
    labelFallback: 'Celebrate',
    color: 'text-reaction-celebrate',
  },
};

export function PostCard({
  post,
  currentUserId,
  onReaction,
  onSave,
  onHidePost,
  canModerate = false,
  isHidingPost = false,
}: Props) {
  const { user } = useAuthStore();
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const isSystemAdmin = user?.roles?.includes('SystemAdmin') ?? false;

  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [repostComment, setRepostComment] = useState('');
  const [hideReason, setHideReason] = useState('');
  // Refs for timeout handling
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moreMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const repostMutation = useRepostMutation();

  // Read directly from post prop (optimistic updates modify query cache)
  const userReaction = post.currentUserReaction;
  const reactionCount = post.reactionCount;
  const isSaved = post.isBookmarked;

  // Safe fallback: if category is unknown/undefined, default to KnowledgeShare
  const TypeConfig =
    postTypeConfig[post.category] ?? postTypeConfig['KnowledgeShare'];
  const TypeIcon = TypeConfig.icon;

  // Reaction hover handlers with delay
  const handleReactionMouseEnter = useCallback(() => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = null;
    }
    setShowReactions(true);
  }, []);

  const handleReactionMouseLeave = useCallback(() => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 200);
  }, []);

  const handleReaction = (type: ReactionType) => {
    setShowReactions(false);
    onReaction?.(post.id, type);
  };

  // More menu handlers
  const handleMoreMouseEnter = useCallback(() => {
    if (moreMenuTimeoutRef.current) {
      clearTimeout(moreMenuTimeoutRef.current);
      moreMenuTimeoutRef.current = null;
    }
    setShowMoreMenu(true);
  }, []);

  const handleMoreMouseLeave = useCallback(() => {
    moreMenuTimeoutRef.current = setTimeout(() => {
      setShowMoreMenu(false);
    }, 150);
  }, []);

  // Safe fallback: if userReaction value is unknown, treat as null
  const CurrentReaction =
    userReaction && reactionConfig[userReaction]
      ? reactionConfig[userReaction]
      : null;

  const isOwnPost = !!currentUserId && post.author.id === currentUserId;
  const canReportPost = !canModerate && !isOwnPost && !post.isHidden;

  const handleSave = () => {
    if (isOwnPost) return;
    onSave?.(post.id);
  };

  const handleOpenShareDialog = () => {
    setRepostComment('');
    setShowShareDialog(true);
  };

  const handleCloseShareDialog = () => {
    setShowShareDialog(false);
    setRepostComment('');
  };

  const handleSubmitRepost = () => {
    repostMutation.mutate(
      {
        postId: post.id,
        authorType: resolveAuthorType(user?.roles, 'Ophthalmologist'),
        repostComment: repostComment.trim() || undefined,
      },
      { onSuccess: handleCloseShareDialog }
    );
  };

  const handleOpenHideDialog = () => {
    setShowMoreMenu(false);
    setHideReason('');
    setShowHideDialog(true);
  };

  const handleSubmitHidePost = () => {
    onHidePost?.(post.id, hideReason.trim() || undefined);
    setShowHideDialog(false);
    setHideReason('');
  };

  return (
    <>
      <article className="relative flex flex-col gap-y-4 px-4 py-3 outline-none border-b border-slate-200 dark:border-slate-700">
        {post.isHidden && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">
                {t(
                  'ProfessionalNetwork.postCard.states.hiddenByModeration',
                  'Hidden by moderation'
                )}
              </p>
              {post.hideReason && (
                <p className="text-xs opacity-90 mt-0.5">{post.hideReason}</p>
              )}
            </div>
          </div>
        )}
        {/* ── Phase 3: Repost header banner ── */}
        {post.isRepost && (
          <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 -mb-2">
            <Repeat2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <span className="font-semibold text-(--text-primary)">
                {post.author.fullName}
              </span>{' '}
              {t('ProfessionalNetwork.postCard.repost.shared', 'shared')}
            </span>
          </div>
        )}

        {/* Main content wrapper - flex row with avatar on left */}
        <div className="flex gap-x-3">
          {/* Avatar - fixed, never shrinks, aligned to top */}
          <div className="flex-shrink-0">
            <InitialsAvatar
              fullName={post.author.fullName}
              avatarUrl={post.author.avatarUrl}
              size="md"
            />
          </div>

          {/* Content column - takes remaining space, min-w-0 for truncation */}
          <div className="flex-1 min-w-0">
            {/* Header row - author info + more menu */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0 text-[15px]">
                <Link
                  to={toLocalizedPath(`/network/profile/${post.author.id}`)}
                  className="font-bold text-(--text-primary) hover:underline truncate"
                >
                  {post.author.fullName}
                </Link>
                {post.author.organisationName && (
                  <span className="text-slate-500 dark:text-slate-400 truncate">
                    · {post.author.organisationName}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap">
                  · {formatViCompactDate(post.createdAt)}
                </span>
              </div>

              {/* More Menu */}
              <div
                className="relative -mr-2 flex-shrink-0"
                onMouseEnter={handleMoreMouseEnter}
                onMouseLeave={handleMoreMouseLeave}
              >
                <button
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>

                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20"
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Copy className="w-4 h-4" />
                        {t(
                          'ProfessionalNetwork.postCard.menu.copyLink',
                          'Copy link'
                        )}
                      </button>
                      {!isOwnPost && !isSystemAdmin && (
                        <button
                          onClick={handleSave}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-brand-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                          {isSaved
                            ? t(
                                'ProfessionalNetwork.postCard.menu.saved',
                                'Saved'
                              )
                            : t(
                                'ProfessionalNetwork.postCard.menu.savePost',
                                'Save post'
                              )}
                        </button>
                      )}
                      {canModerate && !post.isHidden && (
                        <button
                          onClick={handleOpenHideDialog}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-amber-700 hover:bg-amber-50 transition-all"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          {t(
                            'ProfessionalNetwork.postCard.menu.hidePost',
                            'Hide post'
                          )}
                        </button>
                      )}
                      {canReportPost && (
                        <>
                          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-500 hover:bg-red-50 transition-all">
                            <Flag className="w-4 h-4" />
                            {t(
                              'ProfessionalNetwork.postCard.menu.reportPost',
                              'Report post'
                            )}
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Post Type Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium ${TypeConfig.color} mt-1 w-fit`}
            >
              <TypeIcon className="w-3 h-3" />
              {t(TypeConfig.labelKey, TypeConfig.labelFallback)}
            </span>

            {/* ── Phase 3: Repost comment (quote text) ── */}
            {post.isRepost && post.repostComment && (
              <div className="mt-2 text-[15px] text-(--text-primary) whitespace-pre-wrap leading-normal">
                {post.repostComment}
              </div>
            )}

            {/* ── Phase 3: Quoted original post card ── */}
            {post.isRepost && post.originalPost && (
              <div className="mt-3 border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                <div className="px-3 pt-3 pb-2">
                  {/* Original author */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <InitialsAvatar
                      fullName={post.originalPost.author.fullName}
                      avatarUrl={post.originalPost.author.avatarUrl}
                      size="xs"
                    />
                    <div className="flex items-center gap-1 min-w-0 text-[13px]">
                      <Link
                        to={toLocalizedPath(
                          `/network/profile/${post.originalPost.author.id}`
                        )}
                        className="font-semibold text-(--text-primary) hover:underline truncate"
                      >
                        {post.originalPost.author.fullName}
                      </Link>
                      <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                        · {formatViCompactDate(post.originalPost.createdAt)}
                      </span>
                    </div>
                  </div>

                  {post.originalPost.isHidden ? (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-xs">
                      <p className="font-semibold">
                        {t(
                          'ProfessionalNetwork.postCard.states.originalPostHidden',
                          'Original post hidden'
                        )}
                      </p>
                      {post.originalPost.hideReason && (
                        <p className="mt-0.5 opacity-90">
                          {post.originalPost.hideReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={toLocalizedPath(
                        `/network/post/${post.originalPost.id}`
                      )}
                    >
                      <p className="text-[14px] text-(--text-primary) leading-snug line-clamp-3">
                        {post.originalPost.content}
                      </p>
                    </Link>
                  )}
                </div>

                {/* Original post images (if any) */}
                {!post.originalPost.isHidden &&
                  post.originalPost.attachments.filter(
                    (a) => a.type === 'Image'
                  ).length > 0 && (
                    <div
                      className={`grid gap-0.5 ${post.originalPost.attachments.filter((a) => a.type === 'Image').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
                    >
                      {post.originalPost.attachments
                        .filter((a) => a.type === 'Image')
                        .slice(0, 2)
                        .map((attachment) => (
                          <img
                            key={attachment.id}
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full h-40 object-cover"
                          />
                        ))}
                    </div>
                  )}
              </div>
            )}

            {/* ── Normal post content (only for non-reposts) ── */}
            {!post.isRepost && (
              <>
                {/* Content */}
                <Link
                  to={toLocalizedPath(`/network/post/${post.id}`)}
                  className="block mt-2"
                >
                  <div className="text-[15px] text-(--text-primary) whitespace-pre-wrap leading-normal">
                    {post.content.split('\n').map((line, i) => {
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      const parts = line.split(boldRegex);

                      return (
                        <p
                          key={i}
                          className={
                            line.startsWith('#') ? 'text-brand-primary' : ''
                          }
                        >
                          {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      );
                    })}
                  </div>
                </Link>

                {/* Media - images from attachments */}
                {post.attachments.filter((a) => a.type === 'Image').length >
                  0 && (
                  <div
                    className={`mt-3 grid gap-0.5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 ${post.attachments.filter((a) => a.type === 'Image').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
                  >
                    {post.attachments
                      .filter((a) => a.type === 'Image')
                      .map((attachment) => (
                        <img
                          key={attachment.id}
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="w-full h-64 object-cover"
                        />
                      ))}
                  </div>
                )}

                {/* Document Attachments */}
                {post.attachments.filter((a) => a.type !== 'Image').length >
                  0 && (
                  <div className="mt-3 space-y-2">
                    {post.attachments
                      .filter((a) => a.type !== 'Image')
                      .map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[14px] text-(--text-primary)">
                              {attachment.fileName}
                            </p>
                          </div>
                        </a>
                      ))}
                  </div>
                )}
              </>
            )}

            {/* Reaction Summary Row — Facebook-style */}
            {reactionCount > 0 && (
              <div className="flex items-center gap-1 mt-3 text-[13px] text-slate-500 dark:text-slate-400">
                {Object.entries(reactionConfig)
                  .map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <span
                        key={type}
                        className={`flex items-center gap-0.5 ${config.color}`}
                        title={t(config.labelKey, config.labelFallback)}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                    );
                  })
                  .slice(0, 3)}
                <span className="ml-1 text-slate-500 dark:text-slate-400">
                  {reactionCount}
                </span>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-evenly mt-1">
              {/* Reaction Button with Popup */}
              <div
                className="relative"
                onMouseEnter={handleReactionMouseEnter}
                onMouseLeave={handleReactionMouseLeave}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReaction('Insightful')}
                  className={`group flex items-center gap-1 p-2 rounded-full transition-all ${
                    CurrentReaction
                      ? `${CurrentReaction.color}`
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {CurrentReaction ? (
                    <motion.div
                      key={userReaction}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 15,
                      }}
                    >
                      <CurrentReaction.icon className="w-[18px] h-[18px]" />
                    </motion.div>
                  ) : (
                    <Lightbulb className="w-[18px] h-[18px]" />
                  )}
                  <span className="text-[13px]">
                    {reactionCount > 0 ? reactionCount : ''}
                  </span>
                </motion.button>

                {/* Reaction Popup */}
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="absolute bottom-full left-0 pb-2 z-30"
                    >
                      <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-slate-200 dark:border-slate-700">
                        {Object.entries(reactionConfig).map(
                          ([type, config]) => {
                            const Icon = config.icon;
                            const isSelected = userReaction === type;
                            return (
                              <motion.button
                                key={type}
                                whileHover={{ scale: 1.3, y: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReaction(type as ReactionType);
                                }}
                                className={`p-2 rounded-full transition-colors ${
                                  isSelected
                                    ? `${config.color} bg-slate-100 dark:bg-slate-800`
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={t(config.labelKey, config.labelFallback)}
                              >
                                <Icon
                                  className={`w-5 h-5 ${isSelected ? config.color : ''}`}
                                />
                              </motion.button>
                            );
                          }
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment */}
              <Link
                to={toLocalizedPath(`/network/post/${post.id}`)}
                className="group flex items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                <span className="text-[13px]">
                  {post.commentCount > 0 ? post.commentCount : ''}
                </span>
              </Link>

              {/* ── Phase 2: Repost / Share button — hidden for own posts ── */}
              {!post.isRepost && !isOwnPost && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpenShareDialog}
                  className={`flex items-center gap-1 p-2 rounded-full transition-all ${
                    post.repostCount > 0
                      ? 'text-emerald-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={t(
                    'ProfessionalNetwork.postCard.actions.sharePost',
                    'Share post'
                  )}
                >
                  <Repeat2 className="w-[18px] h-[18px]" />
                  <span className="text-[13px]">
                    {post.repostCount > 0 ? post.repostCount : ''}
                  </span>
                </motion.button>
              )}

              {/* Save — hidden for own posts and system admins */}
              {!isOwnPost && !isSystemAdmin && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className={`group flex items-center p-2 rounded-full transition-all ${
                    isSaved
                      ? 'text-brand-primary'
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-[18px] h-[18px]" />
                  ) : (
                    <Bookmark className="w-[18px] h-[18px]" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </article>

      <AnimatePresence>
        {showHideDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHideDialog(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-[17px] font-bold text-(--text-primary)">
                    {t(
                      'ProfessionalNetwork.postCard.hideDialog.title',
                      'Hide this post'
                    )}
                  </h2>
                  <button
                    onClick={() => setShowHideDialog(false)}
                    className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t(
                      'ProfessionalNetwork.postCard.hideDialog.description',
                      'Hidden posts are visible only to their author and System Admin.'
                    )}
                  </p>
                  <textarea
                    value={hideReason}
                    onChange={(e) => setHideReason(e.target.value)}
                    placeholder={t(
                      'ProfessionalNetwork.postCard.hideDialog.reasonPlaceholder',
                      'Reason for hiding (optional)'
                    )}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-[15px] text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowHideDialog(false)}
                    className="px-4 py-2 rounded-full text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    {t('ProfessionalNetwork.common.actions.cancel', 'Cancel')}
                  </button>
                  <LoadingButton
                    onClick={handleSubmitHidePost}
                    isPending={isHidingPost}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-600 text-white text-[14px] font-semibold hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {t(
                      'ProfessionalNetwork.postCard.menu.hidePost',
                      'Hide post'
                    )}
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Phase 2: Share / Repost Dialog ── */}
      <AnimatePresence>
        {showShareDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseShareDialog}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dialog header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-[17px] font-bold text-(--text-primary)">
                    {t(
                      'ProfessionalNetwork.postCard.shareDialog.title',
                      'Share this post'
                    )}
                  </h2>
                  <button
                    onClick={handleCloseShareDialog}
                    className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Dialog body */}
                <div className="p-5 space-y-4">
                  {/* Textarea for repost comment */}
                  <textarea
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value)}
                    placeholder={t(
                      'ProfessionalNetwork.postCard.shareDialog.commentPlaceholder',
                      'Add your comment... (optional)'
                    )}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-[15px] text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />

                  {/* Original post preview */}
                  <div className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <InitialsAvatar
                          fullName={post.author.fullName}
                          avatarUrl={post.author.avatarUrl}
                          size="xs"
                        />
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-semibold text-[13px] text-(--text-primary) truncate">
                            {post.author.fullName}
                          </span>
                          {post.author.organisationName && (
                            <span className="text-slate-500 dark:text-slate-400 text-[12px] truncate">
                              · {post.author.organisationName}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[14px] text-(--text-primary) line-clamp-3 leading-snug">
                        {post.content}
                      </p>
                    </div>

                    {/* Preview images if any */}
                    {post.attachments.filter((a) => a.type === 'Image').length >
                      0 && (
                      <img
                        src={
                          post.attachments.filter((a) => a.type === 'Image')[0]
                            .fileUrl
                        }
                        alt={t(
                          'ProfessionalNetwork.postCard.shareDialog.previewAlt',
                          'preview'
                        )}
                        className="w-full h-36 object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Dialog footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleCloseShareDialog}
                    className="px-4 py-2 rounded-full text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    {t('ProfessionalNetwork.common.actions.cancel', 'Cancel')}
                  </button>
                  <LoadingButton
                    onClick={handleSubmitRepost}
                    isPending={repostMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <Repeat2 className="w-4 h-4" />
                    {t(
                      'ProfessionalNetwork.postCard.shareDialog.share',
                      'Share'
                    )}
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
