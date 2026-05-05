/**
 * Feed Page
 * Main feed page showing posts, post composer, and trending topics
 */

import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import { FeedSkeleton } from '../components/post/PostSkeleton';
import { useFeedPosts } from '../hooks/useNetworkPosts';
import { useTrendingTopics } from '../hooks/useTrendingTopics';
import { useToggleReaction } from '../hooks/useToggleReaction';
import { useToggleSavePost } from '../hooks/useToggleSavePost';
import { useHidePost } from '../hooks/useHidePost';
import useAuthStore from '@/store/auth-store';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import type { PostCategory, ReactionType } from '../types';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const postCategoryLabelConfig: Record<
  PostCategory,
  { labelKey: string; labelFallback: string }
> = {
  PeerDiscussion: {
    labelKey: 'ProfessionalNetwork.postTypes.peerDiscussion',
    labelFallback: 'Peer Discussion',
  },
  KnowledgeShare: {
    labelKey: 'ProfessionalNetwork.postTypes.knowledgeShare',
    labelFallback: 'Knowledge Share',
  },
  Announcement: {
    labelKey: 'ProfessionalNetwork.postTypes.announcement',
    labelFallback: 'Announcement',
  },
};

function FeedPage() {
  const [page, setPage] = useState(1);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const isSystemAdmin = user?.roles?.includes('SystemAdmin') ?? false;
  const isManageQuery = searchParams.get('tab') === 'manage';
  const isManageMode = isSystemAdmin && isManageQuery;

  const feedQuery = useFeedPosts(page, 10, { enabled: !isManageMode });
  const hiddenPostsQuery = useFeedPosts(page, 10, {
    hiddenOnly: true,
    enabled: isManageMode,
  });
  const reportedPostsQuery = useFeedPosts(page, 10, {
    reportedOnly: true,
    enabled: isManageMode,
  });

  const { data: trendingData } = useTrendingTopics();
  const toggleReaction = useToggleReaction();
  const toggleSave = useToggleSavePost();
  const hidePost = useHidePost();

  const feedData = feedQuery.data;
  const feedPosts = feedData?.items ?? [];
  const hiddenPosts = hiddenPostsQuery.data?.items ?? [];
  const reportedPosts = (reportedPostsQuery.data?.items ?? []).filter(
    (post) =>
      !post.isHidden &&
      ((post.reportCount ?? 0) > 0 || !!post.latestReportReason)
  );
  const posts = isManageMode ? [...reportedPosts, ...hiddenPosts] : feedPosts;

  const isLoading = isManageMode
    ? hiddenPostsQuery.isLoading || reportedPostsQuery.isLoading
    : feedQuery.isLoading;

  const isError = isManageMode
    ? hiddenPostsQuery.isError || reportedPostsQuery.isError
    : feedQuery.isError;

  const error = isManageMode
    ? hiddenPostsQuery.error || reportedPostsQuery.error
    : feedQuery.error;
  const trendingTopicsFromApi = trendingData ?? [];

  const fallbackTrending = Object.entries(
    posts.reduce<Record<string, number>>((acc, post) => {
      acc[post.category] = (acc[post.category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, postCount]) => ({
      category: category as PostCategory,
      topicName: category,
      postCount,
    }));

  const trendingTopics =
    trendingTopicsFromApi.length > 0 ? trendingTopicsFromApi : fallbackTrending;

  const getTopicDisplayName = (topicName: string, category?: PostCategory) => {
    if (!category) {
      return topicName;
    }

    const config = postCategoryLabelConfig[category];
    return config ? t(config.labelKey, config.labelFallback) : topicName;
  };

  const handleReaction = (postId: string, type: ReactionType) => {
    const post = posts.find((p) => p.id === postId);
    toggleReaction.mutate({
      postId,
      type,
      currentReaction: post?.currentUserReaction,
    });
  };

  const handleSave = (postId: string) => {
    toggleSave.mutate(postId);
  };

  const handleHidePost = (postId: string, hideReason?: string) => {
    hidePost.mutate({ postId, hideReason });
  };

  return (
    <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-(--text-primary)">
          {t('ProfessionalNetwork.feed.title', 'Feed')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isManageMode
            ? t(
                'ProfessionalNetwork.feed.description.manageMode',
                'Moderation view for hidden and flagged content'
              )
            : t(
                'ProfessionalNetwork.feed.description.default',
                'Latest posts from your professional network'
              )}
        </p>
      </div>

      {isSystemAdmin && (
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-(--bg-secondary)">
          <button
            onClick={() => {
              setPage(1);
              setSearchParams({});
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              !isManageMode
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('ProfessionalNetwork.feed.tabs.feed', 'Feed')}
          </button>
          <button
            onClick={() => {
              setPage(1);
              setSearchParams({ tab: 'manage' });
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isManageMode
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('ProfessionalNetwork.feed.tabs.managePosts', 'Manage Posts')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Feed Column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Post Composer */}
          {!isManageMode && (
            <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden">
              <PostComposer />
            </div>
          )}

          {/* Loading State */}
          {isLoading && <FeedSkeleton count={3} />}

          {/* Error State */}
          {isError && (
            <div className="rounded-2xl bg-(--bg-secondary) border border-red-200 dark:border-red-800 p-8 text-center">
              <p className="text-red-500 font-medium">
                {error?.message ||
                  t(
                    'ProfessionalNetwork.feed.states.loadError',
                    'Failed to load posts'
                  )}
              </p>
              <button
                onClick={() => setPage(1)}
                className="mt-3 text-sm text-brand-primary hover:underline"
              >
                {t('ProfessionalNetwork.common.tryAgain', 'Try again')}
              </button>
            </div>
          )}

          {/* Posts */}
          {!isLoading &&
            !isError &&
            !isManageMode &&
            posts.length > 0 &&
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <PostCard
                  post={post}
                  onReaction={handleReaction}
                  onSave={handleSave}
                  onHidePost={handleHidePost}
                  canModerate={isSystemAdmin}
                  isHidingPost={hidePost.isPending}
                  currentUserId={user?.id}
                />
              </div>
            ))}

          {!isLoading && !isError && isManageMode && (
            <>
              <section className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-(--text-primary)">
                    {t(
                      'ProfessionalNetwork.feed.manage.reportedPostsHeading',
                      'Reported Posts ({{count}})',
                      { count: reportedPosts.length }
                    )}
                  </h3>
                </div>

                {reportedPosts.length > 0 ? (
                  reportedPosts.map((post) => (
                    <PostCard
                      key={`reported-${post.id}`}
                      post={post}
                      onReaction={handleReaction}
                      onSave={handleSave}
                      onHidePost={handleHidePost}
                      canModerate={true}
                      isHidingPost={hidePost.isPending}
                      currentUserId={user?.id}
                    />
                  ))
                ) : (
                  <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                    {t(
                      'ProfessionalNetwork.feed.manage.noReportedPosts',
                      'No reported posts at this time.'
                    )}
                  </p>
                )}
              </section>

              <section className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-(--text-primary)">
                    {t(
                      'ProfessionalNetwork.feed.manage.hiddenPostsHeading',
                      'Hidden Posts ({{count}})',
                      { count: hiddenPosts.length }
                    )}
                  </h3>
                </div>

                {hiddenPosts.length > 0 ? (
                  hiddenPosts.map((post) => (
                    <PostCard
                      key={`hidden-${post.id}`}
                      post={post}
                      onReaction={handleReaction}
                      onSave={handleSave}
                      onHidePost={handleHidePost}
                      canModerate={true}
                      isHidingPost={hidePost.isPending}
                      currentUserId={user?.id}
                    />
                  ))
                ) : (
                  <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                    {t(
                      'ProfessionalNetwork.feed.manage.noHiddenPosts',
                      'No hidden posts yet.'
                    )}
                  </p>
                )}
              </section>
            </>
          )}

          {/* Empty State */}
          {!isLoading && !isError && !isManageMode && posts.length === 0 && (
            <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                {t(
                  'ProfessionalNetwork.feed.states.empty',
                  'No posts yet. Be the first to share!'
                )}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isManageMode && feedData && feedData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!feedData.hasPrevious}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-(--text-primary) hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t(
                  'ProfessionalNetwork.common.pagination.previous',
                  'Previous'
                )}
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t(
                  'ProfessionalNetwork.common.pagination.pageOf',
                  'Page {{page}} of {{total}}',
                  { page: feedData.pageNumber, total: feedData.totalPages }
                )}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!feedData.hasNext}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-(--text-primary) hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t('ProfessionalNetwork.common.pagination.next', 'Next')}
              </button>
            </div>
          )}
        </div>

        {/* Trending Topics - Right side within main content */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
            <h3 className="font-bold text-lg text-(--text-primary) px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              {t('ProfessionalNetwork.feed.trending.title', 'Trending Topics')}
            </h3>
            <div>
              {trendingTopics.map((topic, index) => {
                const displayTopicName = getTopicDisplayName(
                  topic.topicName,
                  topic.category
                );

                return (
                  <Link
                    key={topic.topicName}
                    to={toLocalizedPath(
                      `/network/discover?tag=${encodeURIComponent(topic.topicName)}`
                    )}
                    className="flex flex-col gap-0.5 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="text-xs text-slate-400">
                      {t(
                        'ProfessionalNetwork.feed.trending.rankLabel',
                        '#{{rank}} - Trending',
                        { rank: index + 1 }
                      )}
                    </p>
                    <p className="font-semibold text-sm text-(--text-primary)">
                      {displayTopicName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        'ProfessionalNetwork.feed.trending.postsCount',
                        '{{count}} posts',
                        { count: topic.postCount }
                      )}
                    </p>
                  </Link>
                );
              })}
              {trendingTopics.length === 0 && !isLoading && (
                <p className="text-sm text-slate-400 px-5 py-4">
                  {t(
                    'ProfessionalNetwork.feed.trending.empty',
                    'No trending topics yet'
                  )}
                </p>
              )}
            </div>
            <Link
              to={toLocalizedPath('/network/discover')}
              className="block text-center text-primary font-medium text-sm px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-800"
            >
              {t('ProfessionalNetwork.common.showMore', 'Show more')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;
