/**
 * Post Detail Page
 * Page for viewing a single post with comments
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Loader2 } from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { usePostDetail, usePostComments } from '../hooks/useNetworkPosts';
import { useAddComment } from '../hooks/useAddComment';
import useAuthStore from '@/store/auth-store';
import { InitialsAvatar } from '../components/professional/InitialsAvatar';
import type { PagedResult } from '../types';

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

function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  const { user } = useAuthStore();

  const { data: post, isLoading: postLoading } = usePostDetail(id ?? '');
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

  if (postLoading) {
    return (
      <>
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to="/network/feed"
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">Post</h2>
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
              to="/network/feed"
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">Post</h2>
          </div>
        </header>
        <div className="text-center py-12 px-4">
          <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Post not found</p>
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
            to="/network/feed"
            className="p-2 hover:bg-gray-100 rounded-full hover-animation"
          >
            <ArrowLeft className="w-5 h-5 text-text-main" />
          </Link>
          <h2 className="text-xl font-bold text-text-main">Post</h2>
        </div>
      </header>

      {/* Post */}
      <PostCard post={post} currentUserId={user?.id} />

      {/* Comment Input */}
      <div className="flex gap-3 px-4 py-3 border-b border-light-border">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <InitialsAvatar fullName={user?.fullName ?? '?'} size="sm" />
        )}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            className="flex-1 bg-main-search-background rounded-full px-4 py-2 text-[15px] text-text-main placeholder:text-text-muted hover-animation
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || addComment.isPending}
            className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addComment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="divide-y divide-light-border">
        <div className="px-4 py-3">
          <h3 className="font-bold text-[15px] text-text-main">
            Comments ({post.commentCount})
          </h3>
        </div>

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-12 px-4 text-text-muted">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="hover-card hover-animation px-4 py-3"
            >
              <div className="flex gap-3">
                {comment.author.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <InitialsAvatar
                    fullName={comment.author.fullName}
                    size="sm"
                  />
                )}
                <div className="flex-1">
                  <p className="font-bold text-[15px] text-text-main">
                    {comment.author.fullName}
                  </p>
                  <p className="text-[15px] text-text-main mt-0.5">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PostDetailPage;
