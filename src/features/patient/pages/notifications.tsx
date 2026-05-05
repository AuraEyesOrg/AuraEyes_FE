import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Eye,
  EyeOff,
  PlusCircle,
} from 'lucide-react';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import useNotificationStore from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth-store';
import { NotificationService } from '@/lib/notificationService';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { getNotificationTypeLabel } from '@/store/useNotificationStore';
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
  NotificationType,
} from '@/types/notification';
import type { Notification } from '@/types/notification';
import { NotificationIcon } from '@/components/ui/notification';
import { formatRelativeTime } from '@/lib/date-utils';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

type NotificationFilter = 'all' | 'unread' | NotificationType;

const isNotificationTypeValue = (value: number): value is NotificationType => {
  return Object.values(NotificationType).includes(value as NotificationType);
};

/**
 * Notifications Page - Complete notification history with filtering & pagination
 */
export default function NotificationsPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

    const route = getNotificationRoute(notification, user?.roles ?? []);
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('PatientNotifications.page.title')}
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400'
                    : connectionStatus === 'connecting'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                }`}
              />
              <span>
                {t('PatientNotifications.connection.label')}{' '}
                {connectionStatus === 'connected'
                  ? t('PatientNotifications.connection.active')
                  : t('PatientNotifications.connection.inactive')}
              </span>
            </div>
          </div>

          <Link
            to={resolvePathWithLocale('/patient/schedule')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 shadow-sm"
          >
            <PlusCircle className="h-5 w-5" strokeWidth={2} />
            <span>{t('PatientDashboard.quickActions.bookAppointment')}</span>
          </Link>
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
                placeholder={t('PatientNotifications.search.placeholder')}
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
                <option value="all">
                  {t('PatientNotifications.filters.all')}
                </option>
                <option value="unread">
                  {t('PatientNotifications.filters.unread', {
                    count: unreadCount,
                  })}
                </option>
                <option value={NotificationType.AiScreeningCompleted}>
                  {t('PatientNotifications.filters.aiScreenings')}
                </option>
                <option value={NotificationType.NewConsultationRequest}>
                  {t('PatientNotifications.filters.consultations')}
                </option>
                <option value={NotificationType.NewAppointmentBooked}>
                  {t('PatientNotifications.filters.appointments')}
                </option>
                <option value={NotificationType.WalletDepositSuccess}>
                  {t('PatientNotifications.filters.wallet')}
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
                {t('PatientNotifications.actions.markAllRead')}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">
                {t('PatientNotifications.loading.notifications')}
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('PatientNotifications.empty.title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedFilter !== 'all'
                  ? t('PatientNotifications.empty.adjustSearchOrFilters')
                  : t('PatientNotifications.empty.waiting')}
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
              {t('PatientNotifications.pagination.showingRange', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, totalCount),
                total: totalCount,
              })}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('PatientNotifications.pagination.previous')}
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('PatientNotifications.pagination.pageOf', {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('PatientNotifications.pagination.next')}
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
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const iconName = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/35' : ''
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
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {formatRelativeTime(notification.createdAt)}
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

          <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
            {notification.message}
          </p>

          {/* Action hint */}
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {t('PatientNotifications.actions.clickToViewDetails')}
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
