import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  MessageSquare,
  Timer,
  Zap,
  CalendarCheck,
  CalendarX,
  ArrowRight,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';

type TabKey = 'today' | 'upcoming' | 'past' | 'cancelled';
const APPOINTMENTS_PAGE_SIZE = 8;

/* ────────────────────── helpers ────────────────────── */

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

function getCountdownText(appointmentTime: string | null): string | null {
  if (!appointmentTime) return null;
  const diff = new Date(appointmentTime).getTime() - Date.now();
  if (diff <= 0 || Number.isNaN(diff)) return null;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return `Starts in ${hrs}h ${remMins}m`;
  const days = Math.floor(hrs / 24);
  return `In ${days}d ${hrs % 24}h`;
}

function getTypeMeta(type: ConsultationSessionType) {
  switch (type) {
    case ConsultationSessionType.VideoCall:
      return {
        icon: <Video className="w-4 h-4" />,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        ring: 'ring-blue-200 dark:ring-blue-800',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
      };
    case ConsultationSessionType.ClinicBooking:
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        ring: 'ring-emerald-200 dark:ring-emerald-800',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      };
    default:
      return {
        icon: <Eye className="w-4 h-4" />,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        ring: 'ring-violet-200 dark:ring-violet-800',
        badgeBg: 'bg-violet-100 dark:bg-violet-900/30',
      };
  }
}

function getStatusConfig(
  status: SessionStatus,
  t: (key: string, fallback: string) => string
) {
  switch (status) {
    case SessionStatus.Pending:
      return {
        label: t('Ophthalmologist.appointments.status.pending', 'Pending'),
        icon: <Clock className="w-3 h-3" />,
        cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      };
    case SessionStatus.Confirmed:
      return {
        label: t('Ophthalmologist.appointments.status.confirmed', 'Confirmed'),
        icon: <CheckCircle className="w-3 h-3" />,
        cls: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
      };
    case SessionStatus.Completed:
      return {
        label: t('Ophthalmologist.appointments.status.completed', 'Completed'),
        icon: <CheckCircle className="w-3 h-3" />,
        cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      };
    case SessionStatus.Cancelled:
      return {
        label: t('Ophthalmologist.appointments.status.cancelled', 'Cancelled'),
        icon: <XCircle className="w-3 h-3" />,
        cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      };
    default:
      return {
        label: SESSION_STATUS_LABELS[status],
        icon: <AlertCircle className="w-3 h-3" />,
        cls: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      };
  }
}

function isFutureSession(s: ConsultationSessionListDto) {
  if (
    s.status === SessionStatus.Cancelled ||
    s.status === SessionStatus.Completed
  )
    return false;
  if (!s.appointmentTime) return true;
  const d = new Date(s.appointmentTime);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now() && !isToday(d);
}

function isPastSession(s: ConsultationSessionListDto) {
  return s.status === SessionStatus.Completed;
}

/* ────────────────────── component ────────────────────── */

export default function AppointmentsPage() {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const toConsultationByPatientPath = (patientId: string) =>
    `${toLocalizedPath('/ophthalmologist/consultations')}?patientId=${encodeURIComponent(patientId)}`;

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

  /* ── categorize ── */
  const { todaySessions, upcomingSessions, pastSessions, cancelledSessions } =
    useMemo(() => {
      const today: ConsultationSessionListDto[] = [];
      const upcoming: ConsultationSessionListDto[] = [];
      const past: ConsultationSessionListDto[] = [];
      const cancelled: ConsultationSessionListDto[] = [];

      for (const s of sessions) {
        if (s.status === SessionStatus.Cancelled) {
          cancelled.push(s);
        } else if (
          s.appointmentTime &&
          !Number.isNaN(new Date(s.appointmentTime).getTime()) &&
          isToday(new Date(s.appointmentTime))
        ) {
          today.push(s);
        } else if (isFutureSession(s)) {
          upcoming.push(s);
        } else if (isPastSession(s)) {
          past.push(s);
        } else {
          // pending with no date or past date but not completed
          upcoming.push(s);
        }
      }

      // Sort today by time ascending
      today.sort(
        (a, b) =>
          new Date(a.appointmentTime ?? 0).getTime() -
          new Date(b.appointmentTime ?? 0).getTime()
      );
      // Sort upcoming by soonest first
      upcoming.sort(
        (a, b) =>
          new Date(a.appointmentTime ?? '9999').getTime() -
          new Date(b.appointmentTime ?? '9999').getTime()
      );
      // Sort past by most recent first
      past.sort(
        (a, b) =>
          new Date(b.appointmentTime ?? b.createdAt).getTime() -
          new Date(a.appointmentTime ?? a.createdAt).getTime()
      );

      return {
        todaySessions: today,
        upcomingSessions: upcoming,
        pastSessions: past,
        cancelledSessions: cancelled,
      };
    }, [sessions]);

  /* ── filter by search ── */
  const filterBySearch = (list: ConsultationSessionListDto[]) => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (s) =>
        (s.patientName ?? '').toLowerCase().includes(needle) ||
        s.id.toLowerCase().includes(needle) ||
        SESSION_TYPE_LABELS[s.type].toLowerCase().includes(needle)
    );
  };

  const activeList = filterBySearch(
    activeTab === 'today'
      ? todaySessions
      : activeTab === 'upcoming'
        ? upcomingSessions
        : activeTab === 'past'
          ? pastSessions
          : cancelledSessions
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(activeList.length / APPOINTMENTS_PAGE_SIZE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedActiveList = useMemo(() => {
    const start = (safeCurrentPage - 1) * APPOINTMENTS_PAGE_SIZE;
    return activeList.slice(start, start + APPOINTMENTS_PAGE_SIZE);
  }, [activeList, safeCurrentPage]);

  const tabs: {
    key: TabKey;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'today',
      label: t('Ophthalmologist.appointments.tab.today', 'Today'),
      count: todaySessions.length,
      icon: <Zap className="w-4 h-4" />,
    },
    {
      key: 'upcoming',
      label: t('Ophthalmologist.appointments.tab.upcoming', 'Upcoming'),
      count: upcomingSessions.length,
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      key: 'past',
      label: t('Ophthalmologist.appointments.tab.past', 'Past'),
      count: pastSessions.length,
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      key: 'cancelled',
      label: t('Ophthalmologist.appointments.tab.cancelled', 'Cancelled'),
      count: cancelledSessions.length,
      icon: <CalendarX className="w-4 h-4" />,
    },
  ];

  const handleCancelSession = (sessionId: string) => {
    if (!currentUserId) {
      ophthalToast.error(
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
          ophthalToast.success(
            t(
              'Ophthalmologist.appointments.toast.cancelSuccess',
              'Appointment cancelled successfully.'
            )
          ),
        onError: () =>
          ophthalToast.error(
            t(
              'Ophthalmologist.appointments.toast.cancelError',
              'Unable to cancel appointment. Please try again.'
            )
          ),
      }
    );
  };

  /* ── Loading ── */
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
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.appointments.title', 'Appointments')}
        />

        <main className="p-6 max-w-[1400px] mx-auto">
          {/* ── Header ── */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {t('Ophthalmologist.appointments.title', 'Appointments')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t(
                  'Ophthalmologist.appointments.subtitle',
                  'Manage your real-time consultation appointments'
                )}
              </p>
            </div>

            <Link
              to={toLocalizedPath('/ophthalmologist/slot-management')}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25 w-fit"
            >
              <Plus size={18} />
              {t('Ophthalmologist.appointments.manageSlots', 'Manage Slots')}
            </Link>
          </div>

          {/* ── Quick Stats Pills ── */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {todaySessions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.appointments.stats.today', 'Today')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {upcomingSessions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.appointments.stats.upcoming', 'Upcoming')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {pastSessions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.appointments.stats.completed', 'Completed')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {cancelledSessions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.appointments.stats.cancelled', 'Cancelled')}
              </span>
            </div>
          </div>

          {/* ── Search + Tabs ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
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
                className="w-full bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-[#0a1929] rounded-xl p-1 gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                      activeTab === tab.key
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Today's Timeline (only on today tab) ── */}
          {activeTab === 'today' && todaySessions.length > 0 && (
            <div className="mb-6 bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t(
                    'Ophthalmologist.appointments.todayTimeline',
                    "Today's Timeline"
                  )}
                </h2>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-1">
                  {todaySessions.map((session, idx) => {
                    const time = session.appointmentTime
                      ? formatShortTime(session.appointmentTime)
                      : '--:--';
                    const isPast =
                      session.appointmentTime &&
                      new Date(session.appointmentTime).getTime() < Date.now();
                    const isNext =
                      !isPast &&
                      (idx === 0 ||
                        (todaySessions[idx - 1].appointmentTime &&
                          new Date(
                            todaySessions[idx - 1].appointmentTime!
                          ).getTime() < Date.now()));
                    const typeMeta = getTypeMeta(session.type);

                    return (
                      <div
                        key={session.id}
                        className={`flex items-center gap-3 py-2 px-1 rounded-lg transition-colors ${
                          isNext ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : ''
                        }`}
                      >
                        {/* Dot */}
                        <div
                          className={`relative z-10 w-[9px] h-[9px] rounded-full ring-2 shrink-0 ${
                            session.status === SessionStatus.Completed
                              ? 'bg-green-500 ring-green-200 dark:ring-green-800'
                              : session.status === SessionStatus.Cancelled
                                ? 'bg-red-400 ring-red-200 dark:ring-red-800'
                                : isNext
                                  ? 'bg-cyan-500 ring-cyan-200 dark:ring-cyan-700 animate-pulse'
                                  : isPast
                                    ? 'bg-gray-400 ring-gray-200 dark:ring-gray-600'
                                    : 'bg-blue-400 ring-blue-200 dark:ring-blue-700'
                          }`}
                        />
                        {/* Time */}
                        <span
                          className={`text-sm font-mono w-14 shrink-0 ${
                            isPast
                              ? 'text-gray-400 dark:text-gray-500'
                              : 'text-gray-700 dark:text-gray-300 font-medium'
                          }`}
                        >
                          {time}
                        </span>
                        {/* Info */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${typeMeta.badgeBg} ${typeMeta.color}`}
                          >
                            {typeMeta.icon}
                          </span>
                          <span
                            className={`text-sm truncate ${
                              isPast
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-800 dark:text-white font-medium'
                            }`}
                          >
                            {session.patientName ??
                              t(
                                'Ophthalmologist.appointments.unknownPatient',
                                'Unknown Patient'
                              )}
                          </span>
                        </div>
                        {isNext && (
                          <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                            {getCountdownText(session.appointmentTime) ?? 'Now'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Appointment Cards ── */}
          <div className="space-y-3">
            {pagedActiveList.map((session) => {
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
              const typeMeta = getTypeMeta(session.type);
              const statusCfg = getStatusConfig(session.status, t);
              const countdown = getCountdownText(session.appointmentTime);
              const isActive =
                session.status === SessionStatus.Pending ||
                session.status === SessionStatus.Confirmed;

              return (
                <div
                  key={session.id}
                  className={`group bg-white dark:bg-[#0a1f44] rounded-2xl border transition-all duration-200 ${
                    session.status === SessionStatus.Cancelled
                      ? 'opacity-50 border-gray-200 dark:border-[#1e3a5f]'
                      : 'border-gray-100 dark:border-[#1e3a5f] hover:border-cyan-200 dark:hover:border-cyan-800 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50'
                  }`}
                >
                  <div className="flex items-stretch">
                    <div className="flex-1 p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left content */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeMeta.bg}`}
                          >
                            <span className={typeMeta.color}>
                              {typeMeta.icon}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Row 1: Name + Status */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {session.patientName ??
                                  t(
                                    'Ophthalmologist.appointments.unknownPatient',
                                    'Unknown Patient'
                                  )}
                              </h3>
                              <span
                                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}
                              >
                                {statusCfg.icon} {statusCfg.label}
                              </span>
                              {countdown && isActive && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400">
                                  <Timer className="w-3 h-3" />
                                  {countdown}
                                </span>
                              )}
                            </div>

                            {/* Row 2: Meta info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                              <span
                                className={`inline-flex items-center gap-1 ${typeMeta.color}`}
                              >
                                {typeMeta.icon}
                                {SESSION_TYPE_LABELS[session.type]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {dateLabel}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {timeLabel}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {session.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {activeTab === 'today' && session.patientId && (
                            <Link
                              to={toConsultationByPatientPath(
                                session.patientId
                              )}
                              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700 rounded-xl text-sm font-medium transition-all hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {t(
                                'Ophthalmologist.appointments.openPatientConversation',
                                'Patient Chat'
                              )}
                            </Link>
                          )}

                          {isActive && (
                            <Link
                              to={toLocalizedPath(
                                '/ophthalmologist/consultations'
                              )}
                              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-all hover:shadow-md hover:shadow-cyan-500/25"
                            >
                              {session.type ===
                              ConsultationSessionType.VideoCall ? (
                                <>
                                  <Video className="w-4 h-4" />
                                  {t(
                                    'Ophthalmologist.appointments.joinCall',
                                    'Join Call'
                                  )}
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  {t(
                                    'Ophthalmologist.appointments.open',
                                    'Open'
                                  )}
                                </>
                              )}
                            </Link>
                          )}

                          {session.status === SessionStatus.Pending && (
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              disabled={cancelMutation.isPending}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                            >
                              {t('Ophthalmologist.common.cancel', 'Cancel')}
                            </button>
                          )}

                          {session.status === SessionStatus.Completed && (
                            <Link
                              to={toLocalizedPath(
                                '/ophthalmologist/consultations'
                              )}
                              className="flex items-center gap-1.5 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e3a5f] rounded-xl text-sm font-medium transition-colors"
                            >
                              {t('Ophthalmologist.appointments.view', 'View')}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeList.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#1e3a5f] dark:bg-[#0a1f44] md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {(safeCurrentPage - 1) * APPOINTMENTS_PAGE_SIZE + 1}-
                {Math.min(
                  safeCurrentPage * APPOINTMENTS_PAGE_SIZE,
                  activeList.length
                )}{' '}
                of {activeList.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={safeCurrentPage <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:text-gray-300 dark:hover:bg-[#1e3a5f]"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  {safeCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:text-gray-300 dark:hover:bg-[#1e3a5f]"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {activeList.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t(
                  'Ophthalmologist.appointments.emptyTitle',
                  'No Appointments Found'
                )}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-md mx-auto">
                {searchQuery
                  ? t(
                      'Ophthalmologist.appointments.emptySearch',
                      'No results match your search. Try different keywords.'
                    )
                  : t(
                      'Ophthalmologist.appointments.emptyTab',
                      'No appointments in this category yet.'
                    )}
              </p>
              <Link
                to={toLocalizedPath('/ophthalmologist/slot-management')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <Plus className="w-4 h-4" />
                {t('Ophthalmologist.appointments.manageSlots', 'Manage Slots')}
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
