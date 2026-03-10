/**
 * Feed Page
 * Main feed page showing posts, post composer, and trending topics
 */

import { Link } from 'react-router-dom';
import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import { mockPosts, trendingTopics } from '../data';

function FeedPage() {
  return (
    <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-(--text-primary)">Feed</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Latest posts from your professional network
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Feed Column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Post Composer */}
          <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden">
            <PostComposer />
          </div>

          {/* Posts */}
          {mockPosts.length > 0 ? (
            mockPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No posts yet. Be the first to share!
              </p>
            </div>
          )}
        </div>

        {/* Trending Topics - Right side within main content */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
            <h3 className="font-bold text-lg text-(--text-primary) px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              Trending Topics
            </h3>
            <div>
              {trendingTopics.map((topic, index) => (
                <Link
                  key={topic.tag}
                  to={`/network/discover?tag=${encodeURIComponent(topic.tag)}`}
                  className="flex flex-col gap-0.5 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <p className="text-xs text-slate-400">
                    #{index + 1} · Trending
                  </p>
                  <p className="font-semibold text-sm text-(--text-primary)">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {topic.posts} posts
                  </p>
                </Link>
              ))}
            </div>
            <Link
              to="/network/discover"
              className="block text-center text-primary font-medium text-sm px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-800"
            >
              Show more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;
