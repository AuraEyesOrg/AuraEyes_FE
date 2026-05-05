/**
 * React Query hooks for Notifications.
 * Uses TanStack Query v5 with proper query keys, stale times, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type GetNotificationsParams,
} from '../api/notification.api';
import useNotificationStore from '@/store/useNotificationStore';

// ============ QUERY KEYS ============

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: GetNotificationsParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// ============ QUERIES ============

/**
 * Fetch paginated notifications with optional filters
 */
export const useNotifications = (
  params: GetNotificationsParams = {},
  options?: { enabled?: boolean }
) => {
  const { setNotifications, setLoading } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await getNotifications(params);
        // Sync with Zustand store for real-time updates
        if (params.pageNumber === 1 || !params.pageNumber) {
          const shouldSyncUnreadCount =
            params.isRead === undefined &&
            (!params.types || params.types.length === 0);

          setNotifications(
            data.items,
            shouldSyncUnreadCount ? data.unreadCount : undefined
          );
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30_000, // 30s - notifications update via SignalR
    ...options,
  });
};

/**
 * Fetch unread notification count
 */
export const useUnreadCount = (options?: { enabled?: boolean }) => {
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const data = await getUnreadCount();
      const count =
        typeof data.count === 'number'
          ? data.count
          : ((data as { unreadCount?: number }).unreadCount ?? 0);

      setUnreadCount(count);
      return { ...data, count };
    },
    staleTime: 60_000, // 1 minute - SignalR handles real-time updates
    refetchInterval: 5 * 60_000, // Poll every 5 minutes as fallback
    ...options,
  });
};

// ============ MUTATIONS ============

/**
 * Mark a single notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: string) => {
      // Optimistic update in Zustand store
      markAsRead(notificationId);
    },
    onSuccess: () => {
      // Invalidate unread count query
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: () => {
      // On error, refetch to get accurate state
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      // Optimistic update in Zustand store
      markAllAsRead();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: () => {
      // On error, refetch to get accurate state
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};
