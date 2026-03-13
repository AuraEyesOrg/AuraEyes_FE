import { api } from './api';
import { API_ENDPOINTS } from './endpoints';
import type {
  NotificationsResponse,
  UnreadCountResponse,
} from '@/types/notification';

/**
 * Notification API Service
 * Handles all notification-related API calls
 */
export class NotificationService {
  /**
   * Get paginated notifications for current user
   */
  static async getMyNotifications(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<NotificationsResponse> {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
  }

  /**
   * Mark a specific notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}
