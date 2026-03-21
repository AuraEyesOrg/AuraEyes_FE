import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronRight,
  Filter,
  Building2,
  MessageSquareHeart,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';
import {
  useConsultationSessions,
  useCancelSession,
} from '@/features/consultation/hooks';
import { usePatientClinicAppointments } from '@/features/patient/hooks/use-clinic-booking';
import {
  feedbackKeys,
  useCreateOphthalmologistFeedback,
  useCreateOrganisationFeedback,
} from '@/features/patient/hooks/use-feedback';
import {
  listOrganisationFeedback,
  listOphthalmologistFeedback,
} from '@/features/patient/api/feedback.api';
import {
  FeedbackModal,
  FeedbackSubmittedBadge,
} from '@/features/patient/components';
import useAuthStore from '@/store/auth-store';
import {
  formatDate,
  formatSlotTime,
  formatShortDate,
  formatShortTime,
} from '@/lib/date-utils';
import {
  SessionStatus,
  ConsultationSessionType,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';
import type { ClinicAppointmentDto } from '@/features/patient/types/clinic-booking.types';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

const CLINIC_STATUS_STYLES: Record<string, string> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CheckedIn: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  InProgress:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  NoShow: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const UPCOMING_CLINIC_STATUSES = [
  'Pending',
  'Confirmed',
  'CheckedIn',
  'InProgress',
];
const CANCELLED_CLINIC_STATUSES = ['Cancelled', 'NoShow'];

const AppointmentsPage = () => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sessionFeedbackTarget, setSessionFeedbackTarget] =
    useState<ConsultationSessionListDto | null>(null);
  const [clinicFeedbackTarget, setClinicFeedbackTarget] =
    useState<ClinicAppointmentDto | null>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const patientId = user?.roleId;

  const { data: sessionsData, isLoading } = useConsultationSessions(
    {
      patientId: patientId ?? undefined,
      pageSize: 50,
    },
    {
      enabled: !!patientId,
    }
  );

  const {
    data: clinicAppointmentsData,
    isLoading: isLoadingClinicAppointments,
  } = usePatientClinicAppointments(patientId ?? '');

  const cancelMutation = useCancelSession();
  const createOrganisationFeedbackMutation = useCreateOrganisationFeedback();
  const createOphthalmologistFeedbackMutation =
    useCreateOphthalmologistFeedback();

  const sessions = sessionsData?.items ?? [];
  const clinicAppointments = clinicAppointmentsData ?? [];

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') return s.status === SessionStatus.Confirmed;
      if (filter === 'completed') return s.status === SessionStatus.Completed;
      if (filter === 'cancelled') return s.status === SessionStatus.Cancelled;
      return true;
    });
  }, [sessions, filter]);

  const filteredClinicAppointments = useMemo(() => {
    return clinicAppointments.filter((appointment) => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') {
        return UPCOMING_CLINIC_STATUSES.includes(appointment.status);
      }
      if (filter === 'completed') return appointment.status === 'Completed';
      if (filter === 'cancelled') {
        return CANCELLED_CLINIC_STATUSES.includes(appointment.status);
      }
      return true;
    });
  }, [clinicAppointments, filter]);

  const upcomingCount = sessions.filter(
    (s) => s.status === SessionStatus.Confirmed
  ).length;
  const completedCount = sessions.filter(
    (s) => s.status === SessionStatus.Completed
  ).length;
  const completedClinicAppointments = useMemo(
    () =>
      clinicAppointments.filter(
        (appointment) => appointment.status === 'Completed'
      ),
    [clinicAppointments]
  );

  const uniqueOrganisationIds = useMemo(
    () =>
      Array.from(
        new Set(
          completedClinicAppointments
            .map((appointment) => appointment.organisationId)
            .filter(Boolean)
        )
      ),
    [completedClinicAppointments]
  );

  const uniqueOphthalmologistIds = useMemo(
    () =>
      Array.from(
        new Set(
          sessions
            .filter(
              (session) =>
                session.status === SessionStatus.Completed &&
                !!session.ophthalmologistId
            )
            .map((session) => session.ophthalmologistId as string)
        )
      ),
    [sessions]
  );

  const organisationFeedbackQueries = useQueries({
    queries: uniqueOrganisationIds.map((organisationId) => ({
      queryKey: feedbackKeys.organisationItems(organisationId, 1, 100),
      queryFn: () => listOrganisationFeedback(organisationId, 1, 100),
      enabled: !!organisationId,
      staleTime: 30_000,
    })),
  });

  const ophthalmologistFeedbackQueries = useQueries({
    queries: uniqueOphthalmologistIds.map((ophthalmologistId) => ({
      queryKey: feedbackKeys.ophthalmologistItems(ophthalmologistId, 1, 100),
      queryFn: () => listOphthalmologistFeedback(ophthalmologistId, 1, 100),
      enabled: !!ophthalmologistId,
      staleTime: 30_000,
    })),
  });

  const submittedClinicFeedbackIds = useMemo(() => {
    const synced: Record<string, boolean> = {};

    organisationFeedbackQueries.forEach((query) => {
      query.data?.items.forEach((item) => {
        synced[item.appointmentId] = true;
      });
    });

    return synced;
  }, [organisationFeedbackQueries]);

  const submittedSessionFeedbackIds = useMemo(() => {
    const synced: Record<string, boolean> = {};

    ophthalmologistFeedbackQueries.forEach((query) => {
      query.data?.items.forEach((item) => {
        synced[item.consultationSessionId] = true;
      });
    });

    return synced;
  }, [ophthalmologistFeedbackQueries]);

  useEffect(() => {
    const firstPendingCompletedSession = sessions.find((session) => {
      if (
        session.status !== SessionStatus.Completed ||
        !session.ophthalmologistId
      ) {
        return false;
      }

      if (submittedSessionFeedbackIds[session.id]) {
        return false;
      }

      return !window.sessionStorage.getItem(`feedback-dismissed-${session.id}`);
    });

    if (firstPendingCompletedSession && !sessionFeedbackTarget) {
      setSessionFeedbackTarget(firstPendingCompletedSession);
    }
  }, [sessions, sessionFeedbackTarget, submittedSessionFeedbackIds]);

  const handleCancel = (sessionId: string) => {
    if (
      !confirm(
        'Are you sure you want to cancel this appointment? The consultation fee will be refunded to your wallet.'
      )
    )
      return;
    cancelMutation.mutate({
      sessionId,
      cancelledByUserId: currentUserId!,
      reason: 'Cancelled by patient',
    });
  };

  const canCancelSession = (session: ConsultationSessionListDto): boolean => {
    if (session.status !== SessionStatus.Confirmed) return false;
    if (!session.appointmentTime) return true;
    const msUntilStart =
      new Date(session.appointmentTime).getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msUntilStart > threeHoursMs;
  };

  const dismissSessionFeedbackModal = () => {
    if (sessionFeedbackTarget) {
      window.sessionStorage.setItem(
        `feedback-dismissed-${sessionFeedbackTarget.id}`,
        '1'
      );
    }
    setSessionFeedbackTarget(null);
  };

  const submitSessionFeedback = async (rating: number, comment?: string) => {
    if (!sessionFeedbackTarget?.ophthalmologistId) {
      return;
    }

    try {
      await createOphthalmologistFeedbackMutation.mutateAsync({
        ophthalmologistId: sessionFeedbackTarget.ophthalmologistId,
        request: {
          consultationSessionId: sessionFeedbackTarget.id,
          rating,
          comment,
        },
      });

      window.sessionStorage.setItem(
        `feedback-dismissed-${sessionFeedbackTarget.id}`,
        '1'
      );
      setSessionFeedbackTarget(null);
      toast.success('Feedback submitted');
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 409) {
        window.sessionStorage.setItem(
          `feedback-dismissed-${sessionFeedbackTarget.id}`,
          '1'
        );
        setSessionFeedbackTarget(null);
        toast.info('Feedback already exists for this consultation.');
        return;
      }

      toast.error('Unable to submit feedback right now. Please try again.');
    }
  };

  const submitClinicFeedback = async (rating: number, comment?: string) => {
    if (!clinicFeedbackTarget) {
      return;
    }

    try {
      await createOrganisationFeedbackMutation.mutateAsync({
        organisationId: clinicFeedbackTarget.organisationId,
        request: {
          appointmentId: clinicFeedbackTarget.id,
          rating,
          comment,
        },
      });

      setClinicFeedbackTarget(null);
      toast.success('Feedback submitted');
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 409) {
        setClinicFeedbackTarget(null);
        toast.info('Feedback already exists for this appointment.');
        return;
      }

      toast.error('Unable to submit feedback right now. Please try again.');
    }
  };

  const getStatusBadge = (session: ConsultationSessionListDto) => {
    switch (session.status) {
      case SessionStatus.Pending:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case SessionStatus.Confirmed:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      case SessionStatus.Completed:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case SessionStatus.Cancelled:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getSessionIcon = (type: ConsultationSessionType) => {
    switch (type) {
      case ConsultationSessionType.Verification:
        return <Eye className="w-7 h-7 text-blue-600" />;
      case ConsultationSessionType.VideoCall:
        return <Video className="w-7 h-7 text-purple-600" />;
      default:
        return <Calendar className="w-7 h-7 text-brand" />;
    }
  };

  const getSessionIconBg = (session: ConsultationSessionListDto) => {
    if (session.status === SessionStatus.Confirmed) {
      return 'bg-brand-soft';
    }
    if (session.status === SessionStatus.Completed) {
      return 'bg-green-100 dark:bg-green-900/30';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Spinner size={40} className="mx-auto mb-4" />
            <p className="text-(--text-secondary)">Loading appointments...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
            Appointments
          </h1>
          <p className="text-(--text-secondary)">
            Manage your doctor and organisation appointments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-blue rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {upcomingCount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-green rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {completedCount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-purple rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {sessions.length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-orange rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {
                  sessions.filter((s) => s.status === SessionStatus.Cancelled)
                    .length
                }
              </p>
              <p className="text-xs text-[var(--text-muted)]">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        {(['all', 'upcoming', 'completed', 'cancelled'] as FilterTab[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-brand text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <section className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Organisation Slots
            </h2>
            <Link
              to="/patient/clinics"
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              Book More Slot
            </Link>
          </div>

          {isLoadingClinicAppointments ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)]">
              Loading clinic appointments...
            </div>
          ) : filteredClinicAppointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)]">
              {filter === 'all'
                ? 'No clinic appointments yet.'
                : `No ${filter} clinic appointments.`}
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {filteredClinicAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`medical-card p-6 hover:border-brand/30 transition-colors ${
                    appointment.status === 'Cancelled' ||
                    appointment.status === 'NoShow'
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-brand-soft">
                        <Building2 className="w-7 h-7 text-brand" />
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-(--text-primary)">
                            {appointment.organisationName ?? 'Clinic Visit'}
                          </h3>
                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${CLINIC_STATUS_STYLES[appointment.status] ?? CLINIC_STATUS_STYLES.Pending}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatSlotTime(appointment.startTime)} -{' '}
                              {formatSlotTime(appointment.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--text-secondary)] md:col-span-2">
                            <Building2 className="w-4 h-4" />
                            <span>Organisation appointment</span>
                          </div>
                          {appointment.visitReason && (
                            <div className="flex items-start gap-2 text-[var(--text-secondary)] md:col-span-2">
                              <FileText className="mt-0.5 h-4 w-4" />
                              <span>Reason: {appointment.visitReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:justify-end lg:self-stretch">
                      {appointment.status === 'Completed' &&
                        (submittedClinicFeedbackIds[appointment.id] ? (
                          <FeedbackSubmittedBadge label="Feedback submitted" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setClinicFeedbackTarget(appointment)}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                          >
                            <MessageSquareHeart className="w-4 h-4" />
                            Rate Clinic
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Doctor Slots
            </h2>
            <Link
              to="/patient/doctors"
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              Book More Slot
            </Link>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)]">
              {filter === 'all'
                ? 'No doctor appointments yet.'
                : `No ${filter} doctor appointments.`}
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`medical-card p-6 hover:border-brand/30 transition-colors ${
                    session.status === SessionStatus.Cancelled
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${getSessionIconBg(session)}`}
                      >
                        {getSessionIcon(session.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-(--text-primary)">
                            {SESSION_TYPE_LABELS[session.type]}
                          </h3>
                          {getStatusBadge(session)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Calendar className="w-4 h-4" />
                            <span>{formatShortDate(session.createdAt)}</span>
                          </div>
                          {session.appointmentTime && (
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatShortTime(session.appointmentTime)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <User className="w-4 h-4" />
                            <span>
                              {session.ophthalmologistName
                                ? `Doctor: ${session.ophthalmologistName}`
                                : SESSION_STATUS_LABELS[session.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.type ===
                            ConsultationSessionType.VideoCall ? (
                              <>
                                <Video className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600">
                                  {session.meetingLink
                                    ? 'Video consultation (link ready)'
                                    : 'Video consultation'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">
                                  {SESSION_TYPE_LABELS[session.type]}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:justify-end lg:self-stretch">
                      {session.status === SessionStatus.Confirmed && (
                        <>
                          <Link
                            to="/patient/chat"
                            className="flex-1 lg:flex-none px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Chat
                          </Link>
                          {session.type ===
                            ConsultationSessionType.VideoCall && (
                            <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                              <Video className="w-4 h-4" />
                              Join Call
                            </button>
                          )}
                          {canCancelSession(session) && (
                            <button
                              onClick={() => handleCancel(session.id)}
                              disabled={cancelMutation.isPending}
                              className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                      {session.status === SessionStatus.Completed && (
                        <>
                          {session.ophthalmologistId &&
                            (submittedSessionFeedbackIds[session.id] ? (
                              <FeedbackSubmittedBadge label="Feedback submitted" />
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setSessionFeedbackTarget(session)
                                }
                                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                              >
                                <MessageSquareHeart className="w-4 h-4" />
                                Rate Consultation
                              </button>
                            ))}
                          <Link
                            to="/patient/chat"
                            className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {filteredSessions.length === 0 &&
        filteredClinicAppointments.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              No Appointments Found
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {filter === 'all'
                ? "You haven't created any appointments yet."
                : `No ${filter} appointments.`}
            </p>
            <Link
              to="/patient/clinics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-colors"
            >
              Book Your First Appointment
            </Link>
          </div>
        )}

      <FeedbackModal
        open={!!sessionFeedbackTarget}
        title="Consultation feedback"
        subtitle="Your review helps improve consultation quality."
        contextLabel={
          sessionFeedbackTarget
            ? `${SESSION_TYPE_LABELS[sessionFeedbackTarget.type]} session`
            : undefined
        }
        isSubmitting={createOphthalmologistFeedbackMutation.isPending}
        submitLabel="Submit consultation feedback"
        onClose={dismissSessionFeedbackModal}
        onSubmit={async (values) => {
          await submitSessionFeedback(values.rating, values.comment);
        }}
      />

      <FeedbackModal
        open={!!clinicFeedbackTarget}
        title="Clinic feedback"
        subtitle="Share your clinic visit experience."
        contextLabel={
          clinicFeedbackTarget
            ? `${clinicFeedbackTarget.organisationName ?? 'Clinic visit'} - ${clinicFeedbackTarget.date}`
            : undefined
        }
        isSubmitting={createOrganisationFeedbackMutation.isPending}
        submitLabel="Submit clinic feedback"
        onClose={() => setClinicFeedbackTarget(null)}
        onSubmit={async (values) => {
          await submitClinicFeedback(values.rating, values.comment);
        }}
      />
    </PatientLayout>
  );
};

export default AppointmentsPage;
