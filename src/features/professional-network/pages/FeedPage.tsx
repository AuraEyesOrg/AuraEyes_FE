/**
 * Feed Page
 * Main feed page showing posts, post composer, and trending topics
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import { FeedSkeleton } from '../components/post/PostSkeleton';
import { useFeedPosts } from '../hooks/useNetworkPosts';
import { useTrendingTopics } from '../hooks/useTrendingTopics';

function FeedPage() {
  const [page, setPage] = useState(1);
  const { data: feedData, isLoading, isError, error } = useFeedPosts(page);
  const { data: trendingData } = useTrendingTopics();

  const posts = feedData?.items ?? [];
  const trendingTopics = trendingData ?? [];

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

          {/* Loading State */}
          {isLoading && <FeedSkeleton count={3} />}

          {/* Error State */}
          {isError && (
            <div className="rounded-2xl bg-(--bg-secondary) border border-red-200 dark:border-red-800 p-8 text-center">
              <p className="text-red-500 font-medium">
                {error?.message || 'Failed to load posts'}
              </p>
              <button
                onClick={() => setPage(1)}
                className="mt-3 text-sm text-brand-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Posts */}
          {!isLoading &&
            !isError &&
            posts.length > 0 &&
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <PostCard post={post} />
              </div>
            ))}

          {/* Empty State */}
          {!isLoading && !isError && posts.length === 0 && (
            <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No posts yet. Be the first to share!
              </p>
            </div>
          )}

          {/* Pagination */}
          {feedData && feedData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!feedData.hasPrevious}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-main-search-background text-text-main hover:bg-brand-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {feedData.pageNumber} of {feedData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!feedData.hasNext}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-main-search-background text-text-main hover:bg-brand-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
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
                  key={topic.topicName}
                  to={`/network/discover?tag=${encodeURIComponent(topic.topicName)}`}
                  className="flex flex-col gap-0.5 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <p className="text-xs text-slate-400">
                    #{index + 1} · Trending
                  </p>
                  <p className="font-semibold text-sm text-(--text-primary)">
                    {topic.topicName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {topic.postCount} posts
                  </p>
                </Link>
              ))}
              {trendingTopics.length === 0 && !isLoading && (
                <p className="text-sm text-slate-400 px-5 py-4">
                  No trending topics yet
                </p>
              )}
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
