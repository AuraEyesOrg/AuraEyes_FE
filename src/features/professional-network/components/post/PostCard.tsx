/**
 * Post Card Component
 * Main card for displaying professional network posts
 */

import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  FlaskConical,
  HelpingHand,
  Newspaper,
  Copy,
  Flag,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import type { ProfessionalPost, ReactionType } from '../../types';

interface Props {
  post: ProfessionalPost;
  onReaction?: (postId: string, type: ReactionType) => void;
  onSave?: (postId: string) => void;
}

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
};

const reactionConfig: Record<
  ReactionType,
  { icon: React.ElementType; label: string; color: string }
> = {
  Insightful: {
    icon: Lightbulb,
    label: 'Insightful',
    color: 'text-reaction-insightful',
  },
  Agree: { icon: ThumbsUp, label: 'Agree', color: 'text-reaction-agree' },
  Helpful: { icon: Heart, label: 'Helpful', color: 'text-reaction-helpful' },
  Question: {
    icon: HelpCircle,
    label: 'Question',
    color: 'text-reaction-question',
  },
  Celebrate: {
    icon: PartyPopper,
    label: 'Celebrate',
    color: 'text-reaction-celebrate',
  },
};

export function PostCard({ post, onReaction, onSave }: Props) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  // Refs for timeout handling
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moreMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Read directly from post prop (optimistic updates modify query cache)
  const userReaction = post.currentUserReaction;
  const reactionCount = post.reactionCount;
  const isSaved = post.isBookmarked;

  const TypeConfig = postTypeConfig[post.category];
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

  const CurrentReaction = userReaction ? reactionConfig[userReaction] : null;

  const handleSave = () => {
    onSave?.(post.id);
  };

  return (
    <article className="accent-tab hover-card relative flex flex-col gap-y-4 px-4 py-3 outline-none hover-animation border-b border-light-border">
      {/* Main content wrapper - flex row with avatar on left */}
      <div className="flex gap-x-3">
        {/* Avatar - fixed, never shrinks, aligned to top */}
        <div className="flex-shrink-0">
          <img
            src={post.author.avatarUrl || '/default-avatar.png'}
            alt={post.author.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>

        {/* Content column - takes remaining space, min-w-0 for truncation */}
        <div className="flex-1 min-w-0">
          {/* Header row - author info + more menu */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0 text-[15px]">
              <Link
                to={`/network/profile/${post.author.id}`}
                className="font-bold text-text-main hover:underline truncate"
              >
                {post.author.fullName}
              </Link>
              {post.author.organisationName && (
                <span className="text-text-muted truncate">
                  · {post.author.organisationName}
                </span>
              )}
              <span className="text-text-muted flex-shrink-0 whitespace-nowrap">
                ·{' '}
                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>

            {/* More Menu */}
            <div
              className="relative -mr-2 flex-shrink-0"
              onMouseEnter={handleMoreMouseEnter}
              onMouseLeave={handleMoreMouseLeave}
            >
              <button
                className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-soft/50 rounded-full transition-all"
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
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-light-border py-2 z-20"
                  >
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-main hover:bg-main-search-background transition-all">
                      <Copy className="w-4 h-4" />
                      Copy link
                    </button>
                    <button
                      onClick={handleSave}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-main hover:bg-main-search-background transition-all"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      {isSaved ? 'Saved' : 'Save post'}
                    </button>
                    <div className="my-1 border-t border-light-border" />
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-500 hover:bg-red-50 transition-all">
                      <Flag className="w-4 h-4" />
                      Report post
                    </button>
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
            {TypeConfig.label}
          </span>

          {/* Content */}
          <Link to={`/network/post/${post.id}`} className="block mt-2">
            <div className="text-[15px] text-text-main whitespace-pre-wrap leading-normal">
              {post.content.split('\n').map((line, i) => {
                const boldRegex = /\*\*(.*?)\*\*/g;
                const parts = line.split(boldRegex);

                return (
                  <p
                    key={i}
                    className={line.startsWith('#') ? 'text-brand-primary' : ''}
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
          {post.attachments.filter((a) => a.type === 'Image').length > 0 && (
            <div
              className={`mt-3 grid gap-0.5 rounded-2xl overflow-hidden border border-light-border ${post.attachments.filter((a) => a.type === 'Image').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
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
          {post.attachments.filter((a) => a.type !== 'Image').length > 0 && (
            <div className="mt-3 space-y-2">
              {post.attachments
                .filter((a) => a.type !== 'Image')
                .map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    className="flex items-center gap-3 p-3 bg-main-search-background border border-light-border rounded-xl hover:bg-brand-soft transition-all"
                  >
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[14px] text-text-main">
                        {attachment.fileName}
                      </p>
                    </div>
                  </a>
                ))}
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between mt-3 -ml-2 max-w-[425px]">
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
                    : 'text-text-muted hover:text-brand-primary hover:bg-brand-soft/50'
                }`}
              >
                {CurrentReaction ? (
                  <motion.div
                    key={userReaction}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
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
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute bottom-full left-0 pb-2 z-30"
                  >
                    <div className="flex items-center gap-1 p-1.5 bg-white rounded-full shadow-xl border border-light-border">
                      {Object.entries(reactionConfig).map(([type, config]) => {
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
                                ? `${config.color} bg-main-search-background`
                                : 'text-text-muted hover:bg-main-search-background'
                            }`}
                            title={config.label}
                          >
                            <Icon
                              className={`w-5 h-5 ${isSelected ? config.color : ''}`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Comment */}
            <Link
              to={`/network/post/${post.id}`}
              className="group flex items-center gap-1 p-2 text-text-muted hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="text-[13px]">
                {post.commentCount > 0 ? post.commentCount : ''}
              </span>
            </Link>

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={`group flex items-center p-2 rounded-full transition-all ${
                isSaved
                  ? 'text-brand-primary'
                  : 'text-text-muted hover:text-brand-primary hover:bg-brand-soft/50'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-[18px] h-[18px]" />
              ) : (
                <Bookmark className="w-[18px] h-[18px]" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </article>
  );
}
