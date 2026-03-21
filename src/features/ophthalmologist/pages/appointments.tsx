import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Filter,
  Search,
  MessageSquare,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  useConsultationSessions,
  useCancelSession,
} from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import { formatShortDate, formatShortTime, isToday } from '@/lib/date-utils';
import {
  ConsultationSessionType,
  SessionStatus,
  SESSION_STATUS_LABELS,
  SESSION_TYPE_LABELS,
} from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const formatDateTime = (
  value: string | null,
  labels: { notScheduled: string; invalidDate: string }
) => {
  if (!value) return { dateLabel: labels.notScheduled, timeLabel: '--:--' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return { dateLabel: labels.invalidDate, timeLabel: '--:--' };
  return {
    dateLabel: formatShortDate(value),
    timeLabel: formatShortTime(value),
  };
};

const getStatusBadge = (
  status: SessionStatus,
  t: (key: string, fallback: string) => string
) => {
  switch (status) {
    case SessionStatus.Pending:
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />{' '}
          {t('Ophthalmologist.appointments.status.pending', 'Pending')}
        </span>
      );
    case SessionStatus.Confirmed:
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />{' '}
          {t('Ophthalmologist.appointments.status.confirmed', 'Confirmed')}
        </span>
      );
    case SessionStatus.Completed:
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />{' '}
          {t('Ophthalmologist.appointments.status.completed', 'Completed')}
        </span>
      );
    case SessionStatus.Cancelled:
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />{' '}
          {t('Ophthalmologist.appointments.status.cancelled', 'Cancelled')}
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" /> {SESSION_STATUS_LABELS[status]}
        </span>
      );
  }
};

const sessionMatchesFilter = (
  session: ConsultationSessionListDto,
  filter: StatusFilter
) => {
  if (filter === 'all') return true;
  if (filter === 'pending') return session.status === SessionStatus.Pending;
  if (filter === 'confirmed') return session.status === SessionStatus.Confirmed;
  if (filter === 'completed') return session.status === SessionStatus.Completed;
  if (filter === 'cancelled') return session.status === SessionStatus.Cancelled;
  return true;
};

export default function AppointmentsPage() {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  const { user } = useAuthStore();
  const ophthalmologistId = user?.roleId;
  const currentUserId = user?.id;

  const { data: sessionsData, isLoading } = useConsultationSessions(
    {
      ophthalmologistId: ophthalmologistId ?? undefined,
      pageSize: 100,
    },
    {
      enabled: !!ophthalmologistId,
    }
  );

  const cancelMutation = useCancelSession();
  const sessions = sessionsData?.items ?? [];

  const filteredAppointments = useMemo(() => {
    return sessions.filter((session) => {
      if (!sessionMatchesFilter(session, filter)) {
        return false;
      }

      const needle = searchQuery.trim().toLowerCase();
      if (!needle) return true;

      return (
        (session.patientName ?? '').toLowerCase().includes(needle) ||
        (session.id ?? '').toLowerCase().includes(needle) ||
        SESSION_TYPE_LABELS[session.type].toLowerCase().includes(needle)
      );
    });
  }, [sessions, filter, searchQuery]);

  const todayCount = sessions.filter((session) => {
    if (!session.appointmentTime) return false;
    const date = new Date(session.appointmentTime);
    return !Number.isNaN(date.getTime()) && isToday(date);
  }).length;

  const upcomingCount = sessions.filter(
    (session) =>
      session.status === SessionStatus.Pending ||
      session.status === SessionStatus.Confirmed
  ).length;

  const completedCount = sessions.filter(
    (session) => session.status === SessionStatus.Completed
  ).length;

  const cancelledCount = sessions.filter(
    (session) => session.status === SessionStatus.Cancelled
  ).length;

  const handleCancelSession = (sessionId: string) => {
    if (!currentUserId) {
      toast.error(
        t(
          'Ophthalmologist.appointments.toast.missingDoctorIdentity',
          'Cannot determine current doctor identity.'
        )
      );
      return;
    }

    cancelMutation.mutate(
      {
        sessionId,
        cancelledByUserId: currentUserId,
        reason: t(
          'Ophthalmologist.appointments.toast.cancelReason',
          'Cancelled by ophthalmologist'
        ),
      },
      {
        onSuccess: () =>
          toast.success(
            t(
              'Ophthalmologist.appointments.toast.cancelSuccess',
              'Appointment cancelled successfully.'
            )
          ),
        onError: () =>
          toast.error(
            t(
              'Ophthalmologist.appointments.toast.cancelError',
              'Unable to cancel appointment. Please try again.'
            )
          ),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader
            pageName={t('Ophthalmologist.appointments.title', 'Appointments')}
          />
          <main className="p-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <Spinner size={40} className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.appointments.loading',
                    'Loading appointments...'
                  )}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={upcomingCount} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.appointments.title', 'Appointments')}
        />

        <main className="p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {t('Ophthalmologist.appointments.title', 'Appointments')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.appointments.subtitle',
                  'Manage your real-time consultation appointments'
                )}
              </p>
            </div>

            <Link
              to={toLocalizedPath('/ophthalmologist/slot-management')}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors w-fit"
            >
              <Plus size={18} />
              {t('Ophthalmologist.appointments.manageSlots', 'Manage Slots')}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('Ophthalmologist.appointments.stats.today', 'Today')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {upcomingCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.appointments.stats.upcoming',
                      'Upcoming'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.appointments.stats.completed',
                      'Completed'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cancelledCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.appointments.stats.cancelled',
                      'Cancelled'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t(
                  'Ophthalmologist.appointments.searchPlaceholder',
                  'Search patient, session ID, type...'
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                <Filter className="w-4 h-4" />
                {t('Ophthalmologist.appointments.filterLabel', 'Filter')}
              </button>
              {(
                [
                  'all',
                  'pending',
                  'confirmed',
                  'completed',
                  'cancelled',
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white dark:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d4a6f] border border-gray-300 dark:border-[#2d4a6f]'
                  }`}
                >
                  {status === 'all'
                    ? t('Ophthalmologist.appointments.filter.all', 'All')
                    : t(
                        `Ophthalmologist.appointments.filter.${status}`,
                        status.charAt(0).toUpperCase() + status.slice(1)
                      )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((session) => {
              const { dateLabel, timeLabel } = formatDateTime(
                session.appointmentTime,
                {
                  notScheduled: t(
                    'Ophthalmologist.appointments.notScheduled',
                    'Not scheduled'
                  ),
                  invalidDate: t(
                    'Ophthalmologist.appointments.invalidDate',
                    'Invalid date'
                  ),
                }
              );
              const isOnline =
                session.type === ConsultationSessionType.VideoCall ||
                session.type === ConsultationSessionType.Verification;

              return (
                <div
                  key={session.id}
                  className={`bg-white dark:bg-[#0a1f44] rounded-xl p-6 border border-gray-200 dark:border-[#1e3a5f] hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors ${
                    session.status === SessionStatus.Cancelled
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-semibold text-sm shrink-0">
                        {(session.patientName ?? 'PT')
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {session.patientName ??
                              t(
                                'Ophthalmologist.appointments.unknownPatient',
                                'Unknown Patient'
                              )}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {session.id.slice(0, 8)}...
                          </span>
                          {getStatusBadge(session.status, t)}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded text-xs font-medium text-white bg-cyan-500">
                            {SESSION_TYPE_LABELS[session.type]}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{timeLabel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isOnline ? (
                              <>
                                <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-600 dark:text-blue-400">
                                  {t(
                                    'Ophthalmologist.appointments.onlineConsultation',
                                    'Online Consultation'
                                  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t(
                                    'Ophthalmologist.appointments.inPersonConsultation',
                                    'In-person Clinic Booking'
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      {(session.status === SessionStatus.Pending ||
                        session.status === SessionStatus.Confirmed) && (
                        <Link
                          to={toLocalizedPath('/ophthalmologist/consultations')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {t('Ophthalmologist.appointments.open', 'Open')}
                        </Link>
                      )}

                      {session.status === SessionStatus.Pending && (
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          disabled={cancelMutation.isPending}
                          className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                        >
                          {t('Ophthalmologist.common.cancel', 'Cancel')}
                        </button>
                      )}

                      {session.status === SessionStatus.Completed && (
                        <Link
                          to={toLocalizedPath('/ophthalmologist/consultations')}
                          className="px-4 py-2 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d4a6f] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {t('Ophthalmologist.appointments.view', 'View')}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f]">
              <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t(
                  'Ophthalmologist.appointments.emptyTitle',
                  'No Appointments Found'
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'all'
                  ? t(
                      'Ophthalmologist.appointments.emptyAll',
                      'No real appointment data matched your search.'
                    )
                  : `${t('Ophthalmologist.appointments.emptyPrefix', 'No')} ${t(`Ophthalmologist.appointments.filter.${filter}`, filter)} ${t('Ophthalmologist.appointments.emptySuffix', 'appointments found.')}`}
              </p>
              <Link
                to={toLocalizedPath('/ophthalmologist/slot-management')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('Ophthalmologist.appointments.manageSlots', 'Manage Slots')}
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
