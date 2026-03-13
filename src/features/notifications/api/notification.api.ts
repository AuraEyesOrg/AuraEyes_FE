/**
 * Notifications API
 * All functions follow the existing pattern: use `api` from '@/lib/api',
 * return unwrapped `response.data.data!` typed with `ApiResponse<T>`.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  NotificationsResponse,
  UnreadCountResponse,
} from '@/types/notification';

// Re-use the ApiResponse wrapper that the BE sends
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

// ============ REQUEST PARAMS ============

export interface GetNotificationsParams {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
}

// ============ QUERIES ============

/**
 * GET /api/notifications
 * Fetch paginated notifications for the current user
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificationsResponse> => {
  const response = await api.get<ApiResponse<NotificationsResponse>>(
    API_ENDPOINTS.NOTIFICATIONS.LIST,
    { params }
  );
  return response.data.data;
};

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<ApiResponse<UnreadCountResponse>>(
    API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );
  return response.data.data;
};

// ============ MUTATIONS ============

/**
 * POST /api/notifications/:id/mark-read
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
};

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
};
