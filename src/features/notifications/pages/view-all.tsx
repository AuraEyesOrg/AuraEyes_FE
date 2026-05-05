import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, CheckCheck, Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import { formatNotificationDateTime } from '@/lib/date-utils';
import PatientLayout from '@/features/patient/components/PatientLayout';
import {
  DoctorHeader,
  DoctorSidebar,
} from '@/features/ophthalmologist/components';
import OrganisationHeader from '@/features/organisation/components/OrganisationHeader';
import OrganisationSidebar from '@/features/organisation/components/Sidebar';
import SystemAdminSidebar from '@/features/system-admin/components/Sidebar';
import PageHeader from '@/features/system-admin/components/PageHeader';
import ClinicStaffHeader from '@/features/clinic-staff/components/ClinicStaffHeader';
import ClinicStaffSidebar from '@/features/clinic-staff/components/ClinicStaffSidebar';

type AppRoleLayout =
  | 'patient'
  | 'clinic-staff'
  | 'ophthalmologist'
  | 'organisation'
  | 'system-admin';

type NotificationTypeFilter =
  | 'all'
  | 'screening'
  | 'consultation'
  | 'message'
  | 'appointment'
  | 'wallet'
  | 'system';

const TYPE_GROUPS: Record<
  Exclude<NotificationTypeFilter, 'all'>,
  NotificationType[]
> = {
  screening: [NotificationType.AiScreeningCompleted],
  consultation: [
    NotificationType.ConsultationAccepted,
    NotificationType.ConsultationResultProvided,
    NotificationType.NewConsultationRequest,
  ],
  message: [NotificationType.NewPatientMessage],
  appointment: [
    NotificationType.NewAppointmentBooked,
    NotificationType.ScheduleChanged,
  ],
  wallet: [
    NotificationType.WalletDepositSuccess,
    NotificationType.WalletPaymentProcessed,
  ],
  system: [NotificationType.SystemAlert],
};

export default function ViewAllNotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const rawTypeFilter = (searchParams.get('type') || 'all').toLowerCase();
  const initialFilter: NotificationTypeFilter =
    rawTypeFilter in TYPE_GROUPS || rawTypeFilter === 'all'
      ? (rawTypeFilter as NotificationTypeFilter)
      : 'all';

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [selectedFilter, setSelectedFilter] =
    useState<NotificationTypeFilter>(initialFilter);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );
  const [pageSize] = useState(20);

  const { unreadCount, markAsRead, markAllAsRead, connectionStatus } =
    useNotificationStore();

  const { data: notificationsResponse, isLoading } = useNotifications({
    pageNumber: currentPage,
    pageSize,
    types: selectedFilter === 'all' ? undefined : TYPE_GROUPS[selectedFilter],
  });

  const notifications = notificationsResponse?.items ?? [];
  const totalCount = notificationsResponse?.totalCount ?? 0;
  const normalizedRoles = (user?.roles ?? []).map((role) => role.toLowerCase());

  const filteredNotifications = notifications.filter((notification) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(query) &&
        !notification.message.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  const resolveLayout = (): AppRoleLayout => {
    if (
      normalizedRoles.some((role) => ['systemadmin', 'admin'].includes(role))
    ) {
      return 'system-admin';
    }

    if (
      normalizedRoles.some((role) =>
        ['orgadmin', 'organization'].includes(role)
      )
    ) {
      return 'organisation';
    }

    if (
      normalizedRoles.some((role) =>
        ['ophthalmologist', 'doctor'].includes(role)
      )
    ) {
      return 'ophthalmologist';
    }

    if (normalizedRoles.some((role) => role === 'clinicstaff')) {
      return 'clinic-staff';
    }

    return 'patient';
  };

  const activeLayout = resolveLayout();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await NotificationService.markAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    const targetRoute = getNotificationRoute(
      notification,
      user?.roles ?? []
    ).trim();

    if (!targetRoute || targetRoute === '#') {
      return;
    }

    const [targetPathname] = targetRoute.split('?');
    if (targetPathname === location.pathname) {
      return;
    }

    navigate(targetRoute);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', page.toString());
      return params;
    });
  };

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

  const totalPages = Math.ceil(totalCount / pageSize);

  const content = (
    <div className="min-h-screen bg-(--bg-primary)">
      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                View All Notifications
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full notification history across your account
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Real-time: {connectionStatus === 'connected' ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(event) => handleSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={selectedFilter}
              onChange={(event) => {
                const nextFilter = event.target.value as NotificationTypeFilter;

                setSelectedFilter(nextFilter);
                setCurrentPage(1);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  if (nextFilter === 'all') {
                    params.delete('type');
                  } else {
                    params.set('type', nextFilter);
                  }
                  params.set('page', '1');
                  return params;
                });
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All types</option>
              <option value="screening">Screening</option>
              <option value="consultation">Consultation</option>
              <option value="message">Message</option>
              <option value="appointment">Appointment</option>
              <option value="wallet">Wallet</option>
              <option value="system">System</option>
            </select>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <CheckCheck size={18} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-3 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try changing the search keyword.'
                  : 'No notification available yet.'}
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
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (activeLayout === 'patient') {
    return <PatientLayout>{content}</PatientLayout>;
  }

  if (activeLayout === 'ophthalmologist') {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader pageName="Notifications" />
          <main className="p-6">{content}</main>
        </div>
      </div>
    );
  }

  if (activeLayout === 'clinic-staff') {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <ClinicStaffSidebar />
        <div className="flex-1 h-full overflow-y-auto">
          <ClinicStaffHeader />
          <main className="p-6">{content}</main>
        </div>
      </div>
    );
  }

  if (activeLayout === 'organisation') {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <OrganisationSidebar />
        <div className="flex-1 h-full overflow-y-auto">
          <OrganisationHeader pageName="Notifications" />
          <main className="p-6">{content}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <SystemAdminSidebar />
      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title="Notifications"
          showNotifications={false}
          actions={<></>}
        />
        <main className="p-6">{content}</main>
      </div>
    </div>
  );
}

interface NotificationListItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationListItem({
  notification,
  onClick,
}: NotificationListItemProps) {
  const { t } = useTranslation();
  const iconName = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type, t);

  return (
    <button
      onClick={onClick}
      className={`w-full p-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/35' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
            !notification.isRead ? 'border-blue-200' : 'border-gray-200'
          } bg-white dark:bg-gray-700 ${colorClass}`}
        >
          <NotificationIcon name={iconName} size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {typeLabel}
            </span>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {formatNotificationDateTime(notification.createdAt)}
            </span>
          </div>

          <h3
            className={`mb-2 text-base font-semibold ${
              !notification.isRead
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {notification.title}
          </h3>

          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            {notification.message}
          </p>
        </div>

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
