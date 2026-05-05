import { formatRelativeTime } from '@/lib/date-utils';

/**
 * Verbose relative time: "X minutes ago", "X hours ago", etc.
 * @deprecated Use `formatRelativeTime(dateString, true)` from `@/lib/date-utils`.
 */
export function formatTimeAgo(dateString: string): string {
  return formatRelativeTime(dateString, true);
}
