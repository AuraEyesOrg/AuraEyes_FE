/**
 * Post Detail Page
 * Page for viewing a single post with comments and Facebook-style replies
 */

import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2,
  CornerDownRight,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import {
  usePostDetail,
  usePostComments,
  useCommentReplies,
} from '../hooks/useNetworkPosts';
import { useAddComment } from '../hooks/useAddComment';
import { useToggleReaction } from '../hooks/useToggleReaction';
import useAuthStore from '@/store/auth-store';
import { LoadingButton } from '@/components/ui/loading-button';
import UserAvatar from '@/components/ui/UserAvatar';
import type { ReactionType } from '../types';
import { InitialsAvatar } from '../components/professional/InitialsAvatar';
import type { PagedResult } from '../types';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type CommentDto = {
  id: string;
  postId: string;
  author: {
    id: string;
    authorType: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  parentCommentId?: string;
  replyCount: number;
  likeCount: number;
  createdAt: string;
};

function CommentRepliesList({
  postId,
  parentCommentId,
}: {
  postId: string;
  parentCommentId: string;
}) {
  const { t } = useSafeTranslation();
  const { data: repliesPage, isLoading } = useCommentReplies(
    postId,
    parentCommentId
  );
  const replies =
    (repliesPage as PagedResult<CommentDto> | undefined)?.items ?? [];

  if (isLoading) {
    return (
      <div className="ml-11 py-2 flex items-center gap-2 text-text-muted text-[13px]">
        <Loader2 className="w-3 h-3 animate-spin" />
        {t(
          'ProfessionalNetwork.postDetail.states.loadingReplies',
          'Loading replies...'
        )}
      </div>
    );
  }

  return (
    <div className="ml-11 mt-2 space-y-2">
      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-2">
          <InitialsAvatar
            fullName={reply.author.fullName}
            avatarUrl={reply.author.avatarUrl}
            size="xs"
          />
          <div className="flex-1 bg-main-search-background rounded-2xl px-3 py-2">
            <p className="font-bold text-[13px] text-text-main">
              {reply.author.fullName}
            </p>
            <p className="text-[13px] text-text-main mt-0.5">{reply.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t } = useSafeTranslation();
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const { user } = useAuthStore();
  const toggleReaction = useToggleReaction();

  const { data: post, isLoading: postLoading } = usePostDetail(id ?? '');

  const handleReaction = (postId: string, type: ReactionType) => {
    toggleReaction.mutate({
      postId,
      type,
      currentReaction: post?.currentUserReaction,
    });
  };
  const { data: commentsPage, isLoading: commentsLoading } = usePostComments(
    id ?? ''
  );
  const addComment = useAddComment();

  const comments =
    (commentsPage as PagedResult<CommentDto> | undefined)?.items ?? [];

  const handleSubmitComment = () => {
    if (!commentText.trim() || !id) return;
    addComment.mutate(
      { postId: id, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    );
  };

  const handleSubmitReply = (parentCommentId: string) => {
    if (!replyText.trim() || !id) return;
    addComment.mutate(
      { postId: id, content: replyText.trim(), parentCommentId },
      {
        onSuccess: () => {
          setReplyText('');
          setReplyingToId(null);
          setExpandedReplies((prev) => new Set([...prev, parentCommentId]));
        },
      }
    );
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  if (postLoading) {
    return (
      <>
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to={toLocalizedPath('/network/feed')}
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">
              {t('ProfessionalNetwork.postDetail.title', 'Post')}
            </h2>
          </div>
        </header>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to={toLocalizedPath('/network/feed')}
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">
              {t('ProfessionalNetwork.postDetail.title', 'Post')}
            </h2>
          </div>
        </header>
        <div className="text-center py-12 px-4">
          <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">
            {t(
              'ProfessionalNetwork.postDetail.states.notFound',
              'Post not found'
            )}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center gap-6 px-4 h-[53px]">
          <Link
            to={toLocalizedPath('/network/feed')}
            className="p-2 hover:bg-gray-100 rounded-full hover-animation"
          >
            <ArrowLeft className="w-5 h-5 text-text-main" />
          </Link>
          <h2 className="text-xl font-bold text-text-main">
            {t('ProfessionalNetwork.postDetail.title', 'Post')}
          </h2>
        </div>
      </header>

      {/* Post */}
      <PostCard
        post={post}
        currentUserId={user?.id}
        onReaction={handleReaction}
      />

      {/* Comment Input */}
      <div className="flex gap-3 px-4 py-3 border-b border-light-border">
        <UserAvatar
          fullName={user?.fullName}
          avatarUrl={user?.avatarUrl}
          fallbackName={t('ProfessionalNetwork.common.user', 'User')}
          size="md"
          className="shrink-0"
          fallbackClassName="bg-brand/20 text-brand"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder={t(
              'ProfessionalNetwork.postDetail.inputs.addCommentPlaceholder',
              'Add a comment...'
            )}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            className="flex-1 bg-main-search-background rounded-full px-4 py-2 text-[15px] text-text-main placeholder:text-text-muted hover-animation
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
          />
          <LoadingButton
            onClick={handleSubmitComment}
            isPending={addComment.isPending}
            disabled={!commentText.trim()}
            className="btn-primary py-2 px-4"
          >
            <Send className="w-4 h-4" />
          </LoadingButton>
        </div>
      </div>

      {/* Comments */}
      <div className="divide-y divide-light-border">
        <div className="px-4 py-3">
          <h3 className="font-bold text-[15px] text-text-main">
            {t(
              'ProfessionalNetwork.postDetail.comments.title',
              'Comments ({{count}})',
              { count: post.commentCount }
            )}
          </h3>
        </div>

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-12 px-4 text-text-muted">
            {t(
              'ProfessionalNetwork.postDetail.states.noComments',
              'No comments yet. Be the first to comment!'
            )}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="hover-animation px-4 py-3">
              {/* Comment body */}
              <div className="flex gap-3">
                <InitialsAvatar
                  fullName={comment.author.fullName}
                  avatarUrl={comment.author.avatarUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-bold text-[15px] text-text-main">
                    {comment.author.fullName}
                  </p>
                  <p className="text-[15px] text-text-main mt-0.5">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Reply actions */}
              <div className="ml-[52px] mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => {
                    setReplyingToId(
                      replyingToId === comment.id ? null : comment.id
                    );
                    setReplyText('');
                  }}
                  className="text-[13px] font-semibold text-text-muted hover:text-brand-primary hover-animation"
                >
                  {t('ProfessionalNetwork.postDetail.actions.reply', 'Reply')}
                </button>
                {comment.replyCount > 0 && (
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center gap-1 text-[13px] font-semibold text-brand-primary hover-animation"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    {expandedReplies.has(comment.id)
                      ? t('ProfessionalNetwork.postDetail.actions.hide', 'Hide')
                      : t(
                          'ProfessionalNetwork.postDetail.actions.view',
                          'View'
                        )}{' '}
                    {comment.replyCount === 1
                      ? t(
                          'ProfessionalNetwork.postDetail.replies.one',
                          '1 reply'
                        )
                      : t(
                          'ProfessionalNetwork.postDetail.replies.many',
                          '{{count}} replies',
                          { count: comment.replyCount }
                        )}
                  </button>
                )}
              </div>

              {/* Reply input */}
              {replyingToId === comment.id && (
                <div className="ml-[52px] mt-2 flex gap-2">
                  <UserAvatar
                    fullName={user?.fullName}
                    avatarUrl={user?.avatarUrl}
                    fallbackName={t('ProfessionalNetwork.common.user', 'User')}
                    size="sm"
                    className="shrink-0"
                    fallbackClassName="bg-brand/20 text-brand"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder={t(
                        'ProfessionalNetwork.postDetail.inputs.replyTo',
                        'Reply to {{name}}...',
                        { name: comment.author.fullName }
                      )}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSubmitReply(comment.id)
                      }
                      autoFocus
                      className="flex-1 bg-main-search-background rounded-full px-3 py-1.5 text-[13px] text-text-main placeholder:text-text-muted hover-animation
                                 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim() || addComment.isPending}
                      className="p-2 rounded-full bg-brand-primary text-white disabled:opacity-50 hover-animation"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded replies */}
              {expandedReplies.has(comment.id) && id && (
                <CommentRepliesList postId={id} parentCommentId={comment.id} />
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PostDetailPage;
