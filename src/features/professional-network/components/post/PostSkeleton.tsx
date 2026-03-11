/**
 * Post Skeleton Component
 * Loading skeleton for post cards using design system colors
 */

export function PostSkeleton() {
  return (
    <article className="flex flex-col gap-y-4 px-4 py-3 border-b border-light-border animate-pulse">
      <div className="flex gap-x-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-main-search-background flex-shrink-0" />

        <div className="flex-1 min-w-0 space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 rounded bg-main-search-background" />
            <div className="h-4 w-20 rounded bg-main-search-background" />
            <div className="h-4 w-16 rounded bg-main-search-background" />
          </div>

          {/* Category badge skeleton */}
          <div className="h-5 w-24 rounded-full bg-main-search-background" />

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-main-search-background" />
            <div className="h-4 w-full rounded bg-main-search-background" />
            <div className="h-4 w-3/4 rounded bg-main-search-background" />
            <div className="h-4 w-5/6 rounded bg-main-search-background" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-6 pt-1">
            <div className="h-8 w-16 rounded-full bg-main-search-background" />
            <div className="h-8 w-12 rounded-full bg-main-search-background" />
            <div className="h-8 w-8 rounded-full bg-main-search-background" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-(--bg-secondary) border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <PostSkeleton />
        </div>
      ))}
    </>
  );
}

/**
 * CompactPostSkeleton
 * Loading skeleton for <CompactPostCard /> used in DiscoverPage.
 * Matches layout: avatar + name/badge row + 2 lines of content. No image, no actions.
 */
export function CompactPostSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-main-search-background flex-shrink-0 mt-0.5" />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Author + badge row */}
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-28 rounded bg-main-search-background" />
          <div className="h-5 w-24 rounded-full bg-main-search-background" />
        </div>
        {/* Content lines */}
        <div className="h-3 w-full rounded bg-main-search-background" />
        <div className="h-3 w-3/4 rounded bg-main-search-background" />
      </div>
    </div>
  );
}

/**
 * DiscoverSkeleton
 * Renders N <CompactPostSkeleton /> rows separated by dividers for the Discover feed.
 */
export function DiscoverSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-light-border">
      {Array.from({ length: count }).map((_, i) => (
        <CompactPostSkeleton key={i} />
      ))}
    </div>
  );
}
