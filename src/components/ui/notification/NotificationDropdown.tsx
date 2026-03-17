import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Eye,
  ExternalLink,
  Stethoscope,
  FileText,
  MessageCircle,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useNotificationStore from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth-store';
import { NotificationService } from '@/lib/notificationService';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { getNotificationTypeLabel } from '@/store/useNotificationStore';
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
} from '@/types/notification';
import type { Notification } from '@/types/notification';
import { formatRelativeTime } from '@/lib/date-utils';

interface NotificationDropdownProps {
  className?: string;
}

/**
 * Bell icon with notification dropdown
 * Shows unread count badge and recent notifications
 */
export default function NotificationDropdown({
  className = '',
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { unreadCount, markAsRead, markAllAsRead, connectionStatus } =
    useNotificationStore();

  const { data: notificationsResponse, isLoading } = useNotifications(
    {
      pageNumber: 1,
      pageSize: 5,
    },
    {
      enabled: isOpen,
    }
  );

  // Get recent notifications (max 5)
  const recentNotifications = notificationsResponse?.items ?? [];

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Fetch notifications when opening dropdown for first time
   */
  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Handle notification click - mark as read and navigate
   */
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await NotificationService.markAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to relevant page
    const route = getNotificationRoute(notification, user?.roles ?? []);
    if (route !== '#') {
      navigate(route);
    }

    setIsOpen(false);
  };

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggleDropdown}
        className={`header-action-btn relative ${isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        aria-label="Notifications"
      >
        <Bell size={20} />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-green-400'
              : connectionStatus === 'connecting'
                ? 'bg-yellow-400'
                : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {connectionStatus === 'connected' && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ● Real-time enabled
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  title="Mark all as read"
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
                <ExternalLink size={14} className="inline ml-1" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Maps a notification icon name string (from getNotificationIcon) to a Lucide icon element
 */
function NotificationIcon({
  name,
  size = 16,
}: {
  name: string;
  size?: number;
}) {
  switch (name) {
    case 'eye':
      return <Eye size={size} />;
    case 'stethoscope':
      return <Stethoscope size={size} />;
    case 'file-text':
      return <FileText size={size} />;
    case 'message-circle':
      return <MessageCircle size={size} />;
    case 'calendar':
      return <Calendar size={size} />;
    case 'wallet':
      return <Wallet size={size} />;
    default:
      return <Bell size={size} />;
  }
}

/**
 * Single notification item component
 */
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const iconName = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${colorClass}`}
        >
          <NotificationIcon name={iconName} size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}
            >
              {typeLabel}
            </span>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>

          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
            {notification.title}
          </h4>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}
