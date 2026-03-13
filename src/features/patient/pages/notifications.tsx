import { useState } from 'react';
import { Bell, Search, Filter, CheckCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import useNotificationStore from '@/store/useNotificationStore';
import { NotificationService } from '@/lib/notificationService';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import {
  formatNotificationTime,
  getNotificationTypeLabel,
} from '@/store/useNotificationStore';
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
  NotificationType,
} from '@/types/notification';
import type { Notification } from '@/types/notification';
import { NotificationIcon } from '@/components/ui/notification';

type NotificationFilter = 'all' | 'unread' | NotificationType;

const isNotificationTypeValue = (value: number): value is NotificationType => {
  return Object.values(NotificationType).includes(value as NotificationType);
};

/**
 * Notifications Page - Complete notification history with filtering & pagination
 */
export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] =
    useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );
  const [pageSize] = useState(10);

  const { unreadCount, markAsRead, markAllAsRead, connectionStatus } =
    useNotificationStore();

  const { data: notificationsResponse, isLoading } = useNotifications({
    pageNumber: currentPage,
    pageSize,
  });

  const notifications = notificationsResponse?.items ?? [];
  const totalCount = notificationsResponse?.totalCount ?? 0;

  /**
   * Filter notifications by type/status
   */
  const filteredNotifications = notifications.filter((notification) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(query) &&
        !notification.message.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Status/Type filter
    if (selectedFilter === 'unread') {
      return !notification.isRead;
    } else if (selectedFilter !== 'all') {
      return notification.type === selectedFilter;
    }

    return true;
  });

  /**
   * Handle notification click and navigation
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

    const route = getNotificationRoute(notification);
    if (route !== '/notifications') {
      navigate(route);
    }
  };

  /**
   * Mark all visible notifications as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', page.toString());
      return params;
    });
  };

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      return params;
    });
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all' || value === 'unread') {
      setSelectedFilter(value);
      return;
    }

    const parsedValue = Number(value);
    if (isNotificationTypeValue(parsedValue)) {
      setSelectedFilter(parsedValue);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your notifications
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-400'
                  : connectionStatus === 'connecting'
                    ? 'bg-yellow-400'
                    : 'bg-gray-400'
              }`}
            />
            <span className="text-gray-600 dark:text-gray-400">
              Real-time notifications:{' '}
              {connectionStatus === 'connected' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread ({unreadCount})</option>
                <option value={NotificationType.AiScreeningCompleted}>
                  AI Screenings
                </option>
                <option value={NotificationType.NewConsultationRequest}>
                  Consultations
                </option>
                <option value={NotificationType.NewAppointmentBooked}>
                  Appointments
                </option>
                <option value={NotificationType.WalletDepositSuccess}>
                  Wallet
                </option>
              </select>
            </div>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 
                         hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <CheckCheck size={20} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : "We'll notify you when something happens"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
              notifications
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

/**
 * Individual notification list item component
 */
interface NotificationListItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationListItem({
  notification,
  onClick,
}: NotificationListItemProps) {
  const iconName = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 
                        border-2 ${!notification.isRead ? 'border-blue-200' : 'border-gray-200'} 
                        flex items-center justify-center ${colorClass}`}
        >
          <NotificationIcon name={iconName} size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full 
                            bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}
            >
              {typeLabel}
            </span>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          <h3
            className={`text-lg font-semibold mb-2 ${
              !notification.isRead
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {notification.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {notification.message}
          </p>

          {/* Action hint */}
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Click to view details →
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          {notification.isRead ? (
            <Eye size={16} className="text-gray-400" />
          ) : (
            <EyeOff size={16} className="text-blue-500" />
          )}
        </div>
      </div>
    </button>
  );
}
