/**
 * Post Detail Page
 * Page for viewing a single post with comments
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { CommentCard } from '../components/post/CommentCard';
import type { ProfessionalPost, PostComment } from '../types';

// TODO: Replace with actual API calls and auth context
const currentUser = {
  id: 'current-user',
  fullName: 'Dr. Current User',
  avatarUrl:
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
};

function PostDetailPage() {
  const { id } = useParams();
  const [commentText, setCommentText] = useState('');
  const [post, setPost] = useState<ProfessionalPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);

  // TODO: Fetch post and comments from API

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      console.log('Submit comment:', commentText);
      setCommentText('');
    }
  };

  if (!post) {
    return (
      <>
        {/* Header */}
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
      <PostCard post={post} />

      {/* Comment Input */}
      <div className="flex gap-3 px-4 py-3 border-b border-light-border">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.fullName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
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
            disabled={!commentText.trim()}
            className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="divide-y divide-light-border">
        <div className="px-4 py-3">
          <h3 className="font-bold text-[15px] text-text-main">
            Comments ({comments.length})
          </h3>
        </div>

        {comments.length === 0 ? (
          <p className="text-center py-12 px-4 text-text-muted">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="hover-card hover-animation">
              <CommentCard comment={comment} />
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PostDetailPage;
