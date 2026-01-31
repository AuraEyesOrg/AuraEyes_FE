/**
 * Feed Page
 * Main feed page showing posts and post composer
 */

import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import type { ProfessionalPost } from '../types';

// TODO: Replace with actual API call
const mockPosts: ProfessionalPost[] = [];

function FeedPage() {
  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex h-[53px] items-center gap-6 px-4">
          <h2 className="text-xl font-bold text-text-main">Feed</h2>
        </div>
      </header>

      {/* Post Composer */}
      <PostComposer />

      {/* Feed */}
      <section className="mt-0.5 xs:mt-0">
        {mockPosts.length > 0 ? (
          mockPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-text-muted">
              No posts yet. Be the first to share!
            </p>
          </div>
        )}
      </section>

      {/* Load More */}
      {mockPosts.length > 0 && (
        <div className="text-center py-8 border-b border-light-border">
          <button className="text-brand-primary font-semibold hover:underline">
            Show more
          </button>
        </div>
      )}
    </>
  );
}

export default FeedPage;
