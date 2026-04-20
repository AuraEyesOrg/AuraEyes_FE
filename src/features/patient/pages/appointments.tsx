import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageSquareHeart,
  PlusCircle,
  Stethoscope,
  Video,
  XCircle,
  Building2,
  User,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';
import {
  useCancelSession,
  useConsultationSessions,
  useConsultationSessionCounts,
} from '@/features/consultation/hooks';
import {
  usePatientClinicAppointments,
  usePatientClinicAppointmentCounts,
} from '@/features/patient/hooks/use-clinic-booking';
import { useCreateOrganisationFeedback } from '@/features/patient/hooks/use-feedback';
import {
  FeedbackModal,
  FeedbackSubmittedBadge,
} from '@/features/patient/components';
import ConfirmModal from '@/components/ui/confirm-modal';
import useAuthStore from '@/store/auth-store';
import {
  formatDate,
  formatSlotTime,
  formatShortDate,
  formatShortTime,
} from '@/lib/date-utils';
import { SessionStatus, ConsultationSessionType } from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';
import type {
  ClinicAppointmentDto,
  PatientAppointmentTab,
} from '@/features/patient/types/clinic-booking.types';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

const FILTER_TABS: FilterTab[] = ['all', 'upcoming', 'completed', 'cancelled'];

const PAGE_SIZE = 6;

const CLINIC_TAB_MAP: Record<FilterTab, PatientAppointmentTab> = {
  all: 'All',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const SESSION_TAB_STATUS: Record<FilterTab, SessionStatus | undefined> = {
  all: undefined,
  upcoming: SessionStatus.Confirmed,
  completed: SessionStatus.Completed,
  cancelled: SessionStatus.Cancelled,
};

const CLINIC_STATUS_STYLES: Record<string, string> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Confirmed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  CheckedIn: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  InProgress:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  NoShow: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const CLINIC_STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  CheckedIn: 'checkedIn',
  InProgress: 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'noShow',
};

const AppointmentsPage = () => {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const [filter, setFilter] = useState<FilterTab>('all');
  const [clinicPage, setClinicPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [clinicFeedbackTarget, setClinicFeedbackTarget] =
    useState<ClinicAppointmentDto | null>(null);
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const patientId = user?.roleId;

  const onFilterChange = (next: FilterTab) => {
    setFilter(next);
    setClinicPage(1);
    setSessionPage(1);
  };

  const sessionStatus = SESSION_TAB_STATUS[filter];
  const sessionsQuery = useConsultationSessions(
    {
      patientId: patientId ?? undefined,
      pageNumber: sessionPage,
      pageSize: PAGE_SIZE,
      ...(sessionStatus !== undefined ? { status: sessionStatus } : {}),
    },
    { enabled: !!patientId }
  );

  const clinicAppointmentsQuery = usePatientClinicAppointments(
    patientId ?? '',
    {
      tab: CLINIC_TAB_MAP[filter],
      pageNumber: clinicPage,
      pageSize: PAGE_SIZE,
    },
    !!patientId
  );

  const { counts: sessionCounts } = useConsultationSessionCounts(
    patientId ?? undefined
  );
  const { counts: clinicCounts } = usePatientClinicAppointmentCounts(
    patientId ?? ''
  );

  const cancelMutation = useCancelSession();
  const createOrganisationFeedbackMutation = useCreateOrganisationFeedback();

  const sessions = sessionsQuery.data?.items ?? [];
  const sessionTotalPages = sessionsQuery.data?.totalPages ?? 1;
  const sessionTotalCount = sessionsQuery.data?.totalCount ?? 0;
  const isLoadingSessions = sessionsQuery.isLoading;
  const isFetchingSessions = sessionsQuery.isFetching;

  const clinicAppointments = clinicAppointmentsQuery.data?.items ?? [];
  const clinicTotalPages = clinicAppointmentsQuery.data?.totalPages ?? 1;
  const clinicTotalCount = clinicAppointmentsQuery.data?.totalCount ?? 0;
  const isLoadingClinic = clinicAppointmentsQuery.isLoading;
  const isFetchingClinic = clinicAppointmentsQuery.isFetching;

  const stats = useMemo(
    () => [
      {
        key: 'upcoming' as const,
        label: t('PatientAppointments.stats.upcoming'),
        value: sessionCounts.upcoming + clinicCounts.Upcoming,
        icon: <CalendarDays className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'completed' as const,
        label: t('PatientAppointments.stats.completed'),
        value: sessionCounts.completed + clinicCounts.Completed,
        icon: <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'cancelled' as const,
        label: t('PatientAppointments.stats.cancelled'),
        value: sessionCounts.cancelled + clinicCounts.Cancelled,
        icon: <XCircle className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'total' as const,
        label: t('PatientAppointments.stats.total'),
        value: sessionCounts.all + clinicCounts.All,
        icon: <FileText className="h-4 w-4" strokeWidth={1.6} />,
      },
    ],
    [sessionCounts, clinicCounts, t]
  );

  const getFilterLabel = (status: FilterTab) =>
    t(`PatientAppointments.filters.${status}`);

  const getSessionStatusLabel = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.Pending:
        return t('PatientAppointments.sessionStatus.pending');
      case SessionStatus.Confirmed:
        return t('PatientAppointments.sessionStatus.confirmed');
      case SessionStatus.Completed:
        return t('PatientAppointments.sessionStatus.completed');
      case SessionStatus.Cancelled:
        return t('PatientAppointments.sessionStatus.cancelled');
      default:
        return '';
    }
  };

  const getSessionTypeLabel = (type: ConsultationSessionType) => {
    switch (type) {
      case ConsultationSessionType.Verification:
        return t('PatientAppointments.sessionType.verification');
      case ConsultationSessionType.VideoCall:
        return t('PatientAppointments.sessionType.videoCall');
      case ConsultationSessionType.ClinicBooking:
        return t('PatientAppointments.sessionType.clinicBooking');
      default:
        return '';
    }
  };

  const getClinicStatusLabel = (status: string) => {
    const mappedKey = CLINIC_STATUS_LABEL_KEYS[status];
    if (!mappedKey) return status;
    return t(`PatientAppointments.clinicStatus.${mappedKey}`, {
      defaultValue: status,
    });
  };

  const canCancelSession = (session: ConsultationSessionListDto) => {
    if (session.status !== SessionStatus.Confirmed) return false;
    if (!session.appointmentTime) return true;
    const msUntilStart =
      new Date(session.appointmentTime).getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msUntilStart > threeHoursMs;
  };

  const confirmCancelSession = () => {
    if (!cancelSessionId) return;
    if (!currentUserId) {
      toast.error(t('PatientAppointments.toast.cancelSigninRequired'));
      setCancelSessionId(null);
      return;
    }
    cancelMutation.mutate(
      {
        sessionId: cancelSessionId,
        cancelledByUserId: currentUserId,
        reason: 'Cancelled by patient',
      },
      { onSettled: () => setCancelSessionId(null) }
    );
  };

  const submitClinicFeedback = async (rating: number, comment?: string) => {
    if (!clinicFeedbackTarget) return;
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
      toast.success(t('PatientAppointments.toast.feedbackSubmitted'));
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 409) {
        setClinicFeedbackTarget(null);
        toast.info(t('PatientAppointments.toast.feedbackAlreadyExists'));
        return;
      }
      toast.error(t('PatientAppointments.toast.feedbackSubmitFailed'));
    }
  };

  const bothEmpty =
    !isLoadingClinic &&
    !isLoadingSessions &&
    clinicAppointments.length === 0 &&
    sessions.length === 0;

  return (
    <PatientLayout>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {t('PatientAppointments.page.eyebrow')}
          </p>
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
            {t('PatientAppointments.page.title')}
          </h1>
          <p className="text-(--text-secondary)">
            {t('PatientAppointments.page.subtitle')}
          </p>
        </div>

        <Link
          to="/patient/clinics"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={1.8} />
          {t('PatientAppointments.actions.bookNew')}
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <dl className="contents">
          {stats.map((stat) => (
            <div key={stat.key} className="medical-card p-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center text-brand">
                  {stat.icon}
                </span>
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-bold text-[var(--text-primary)]">
                    {stat.value}
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div
        role="tablist"
        aria-label={t('PatientAppointments.filters.label')}
        className="mb-8 flex items-center gap-2 overflow-x-auto pb-2"
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab;
          const badge =
            sessionCounts[tab === 'all' ? 'all' : tab] +
            clinicCounts[CLINIC_TAB_MAP[tab]];
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(tab)}
              className={[
                'inline-flex min-w-fit items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                active
                  ? 'bg-brand text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
              ].join(' ')}
            >
              <span>{getFilterLabel(tab)}</span>
              <span
                className={[
                  'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
                ].join(' ')}
              >
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="clinic-section-title">
          <SectionHeader
            id="clinic-section-title"
            icon={<Building2 className="h-4 w-4" strokeWidth={1.8} />}
            title={t('PatientAppointments.sections.organisationSlots')}
            totalCount={clinicTotalCount}
            refreshing={!isLoadingClinic && isFetchingClinic}
            action={
              <Link
                to="/patient/clinics"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand/80"
              >
                {t('PatientAppointments.actions.bookMoreSlot')}
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            }
          />

          {isLoadingClinic ? (
            <SkeletonList />
          ) : clinicAppointments.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-6 w-6" strokeWidth={1.5} />}
              title={
                filter === 'all'
                  ? t('PatientAppointments.empty.clinicAll')
                  : t('PatientAppointments.empty.clinicByFilter', {
                      filter: getFilterLabel(filter),
                    })
              }
              ctaLabel={
                filter === 'all'
                  ? t('PatientAppointments.actions.bookMoreSlot')
                  : undefined
              }
              ctaHref="/patient/clinics"
            />
          ) : (
            <div className="space-y-3">
              {clinicAppointments.map((appointment) => (
                <ClinicAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  statusLabel={getClinicStatusLabel(appointment.status)}
                  rateLabel={t('PatientAppointments.actions.rateClinic')}
                  submittedLabel={t(
                    'PatientAppointments.feedback.submittedBadge'
                  )}
                  reasonLabel={t('PatientAppointments.labels.reason', {
                    reason: appointment.visitReason ?? '',
                  })}
                  organisationLabel={t(
                    'PatientAppointments.labels.organisationAppointment'
                  )}
                  clinicLabel={t('PatientAppointments.labels.clinicVisit')}
                  onRate={() => setClinicFeedbackTarget(appointment)}
                />
              ))}
            </div>
          )}

          {clinicTotalPages > 1 && (
            <Pagination
              page={clinicPage}
              totalPages={clinicTotalPages}
              onChange={setClinicPage}
              labels={{
                prev: t('PatientAppointments.pagination.prev'),
                next: t('PatientAppointments.pagination.next'),
                status: t('PatientAppointments.pagination.pageOf', {
                  page: clinicPage,
                  total: clinicTotalPages,
                }),
              }}
            />
          )}
        </section>

        <section aria-labelledby="doctor-section-title">
          <SectionHeader
            id="doctor-section-title"
            icon={<Stethoscope className="h-4 w-4" strokeWidth={1.8} />}
            title={t('PatientAppointments.sections.doctorSlots')}
            totalCount={sessionTotalCount}
            refreshing={!isLoadingSessions && isFetchingSessions}
          />

          {isLoadingSessions ? (
            <SkeletonList />
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="h-6 w-6" strokeWidth={1.5} />}
              title={
                filter === 'all'
                  ? t('PatientAppointments.empty.doctorAll')
                  : t('PatientAppointments.empty.doctorByFilter', {
                      filter: getFilterLabel(filter),
                    })
              }
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  typeLabel={getSessionTypeLabel(session.type)}
                  statusLabel={getSessionStatusLabel(session.status)}
                  labels={{
                    notScheduledYet: t(
                      'PatientAppointments.labels.notScheduledYet'
                    ),
                    doctor: session.ophthalmologistName
                      ? t('PatientAppointments.labels.doctorName', {
                          name: session.ophthalmologistName,
                        })
                      : getSessionStatusLabel(session.status),
                    videoConsultation: t(
                      'PatientAppointments.labels.videoConsultation'
                    ),
                    videoConsultationReady: t(
                      'PatientAppointments.labels.videoConsultationReady'
                    ),
                    viewChat: t('PatientAppointments.actions.viewChat'),
                    joinCall: t('PatientAppointments.actions.joinCall'),
                    cancel: t('PatientAppointments.actions.cancel'),
                    viewDetails: t('PatientAppointments.actions.viewDetails'),
                  }}
                  canCancel={canCancelSession(session)}
                  isCancelling={cancelMutation.isPending}
                  onCancel={() => setCancelSessionId(session.id)}
                />
              ))}
            </div>
          )}

          {sessionTotalPages > 1 && (
            <Pagination
              page={sessionPage}
              totalPages={sessionTotalPages}
              onChange={setSessionPage}
              labels={{
                prev: t('PatientAppointments.pagination.prev'),
                next: t('PatientAppointments.pagination.next'),
                status: t('PatientAppointments.pagination.pageOf', {
                  page: sessionPage,
                  total: sessionTotalPages,
                }),
              }}
            />
          )}
        </section>
      </div>

      {bothEmpty && (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-10 text-center">
          <CalendarDays
            className="mx-auto mb-3 h-8 w-8 text-[var(--text-muted)]"
            strokeWidth={1.5}
          />
          <h3 className="mb-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {t('PatientAppointments.empty.noAppointmentsTitle')}
          </h3>
          <p className="mx-auto mb-5 max-w-[50ch] text-sm text-[var(--text-secondary)]">
            {filter === 'all'
              ? t('PatientAppointments.empty.noAppointmentsAll')
              : t('PatientAppointments.empty.noAppointmentsByFilter', {
                  filter: getFilterLabel(filter),
                })}
          </p>
          <Link
            to="/patient/clinics"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand/90 active:scale-[0.98]"
          >
            {t('PatientAppointments.actions.bookFirstAppointment')}
          </Link>
        </div>
      )}

      <ConfirmModal
        open={!!cancelSessionId}
        title={t('PatientAppointments.cancelModal.title')}
        message={t('PatientAppointments.cancelModal.message')}
        confirmLabel={t('PatientAppointments.cancelModal.confirmLabel')}
        cancelLabel={t('PatientAppointments.cancelModal.cancelLabel')}
        tone="danger"
        isLoading={cancelMutation.isPending}
        onCancel={() => setCancelSessionId(null)}
        onConfirm={confirmCancelSession}
      />

      <FeedbackModal
        open={!!clinicFeedbackTarget}
        title={t('PatientAppointments.feedback.modalTitle')}
        subtitle={t('PatientAppointments.feedback.modalSubtitle')}
        contextLabel={
          clinicFeedbackTarget
            ? `${clinicFeedbackTarget.organisationName ?? t('PatientAppointments.labels.clinicVisit')} - ${clinicFeedbackTarget.date}`
            : undefined
        }
        isSubmitting={createOrganisationFeedbackMutation.isPending}
        submitLabel={t('PatientAppointments.feedback.submitLabel')}
        onClose={() => setClinicFeedbackTarget(null)}
        onSubmit={async (values) => {
          await submitClinicFeedback(values.rating, values.comment);
        }}
      />
    </PatientLayout>
  );
};

interface SectionHeaderProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  totalCount: number;
  refreshing?: boolean;
  action?: React.ReactNode;
}

const SectionHeader = ({
  id,
  icon,
  title,
  totalCount,
  refreshing,
  action,
}: SectionHeaderProps) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center text-brand">
        {icon}
      </span>
      <div>
        <h2 id={id} className="text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {totalCount}
          {refreshing ? ' · …' : ''}
        </p>
      </div>
    </div>
    {action}
  </div>
);

interface ClinicAppointmentCardProps {
  appointment: ClinicAppointmentDto;
  statusLabel: string;
  rateLabel: string;
  submittedLabel: string;
  reasonLabel: string;
  organisationLabel: string;
  clinicLabel: string;
  onRate: () => void;
}

const ClinicAppointmentCard = ({
  appointment,
  statusLabel,
  rateLabel,
  submittedLabel,
  reasonLabel,
  organisationLabel,
  clinicLabel,
  onRate,
}: ClinicAppointmentCardProps) => {
  const dimmed =
    appointment.status === 'Cancelled' || appointment.status === 'NoShow';

  return (
    <article
      className={[
        'medical-card p-6 hover:border-brand/30 transition-colors',
        dimmed ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-(--text-primary)">
              {appointment.organisationName ?? clinicLabel}
            </h3>
            <span
              className={[
                'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                CLINIC_STATUS_STYLES[appointment.status] ??
                  CLINIC_STATUS_STYLES.Pending,
              ].join(' ')}
            >
              {statusLabel}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-1.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span className="font-mono tabular-nums">
                {formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span className="font-mono tabular-nums">
                {formatSlotTime(appointment.startTime)} –{' '}
                {formatSlotTime(appointment.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span className="truncate">{organisationLabel}</span>
            </div>
            {appointment.visitReason ? (
              <div className="flex items-start gap-2 sm:col-span-2">
                <FileText className="mt-0.5 h-3.5 w-3.5" strokeWidth={1.6} />
                <span className="line-clamp-2">{reasonLabel}</span>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {appointment.status === 'Completed' && (
        <div className="mt-4 flex justify-end">
          {appointment.hasFeedback ? (
            <FeedbackSubmittedBadge label={submittedLabel} />
          ) : (
            <button
              type="button"
              onClick={onRate}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <MessageSquareHeart className="h-3.5 w-3.5" strokeWidth={1.8} />
              {rateLabel}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

interface SessionCardProps {
  session: ConsultationSessionListDto;
  typeLabel: string;
  statusLabel: string;
  labels: {
    notScheduledYet: string;
    doctor: string;
    videoConsultation: string;
    videoConsultationReady: string;
    viewChat: string;
    joinCall: string;
    cancel: string;
    viewDetails: string;
  };
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}

const SessionCard = ({
  session,
  typeLabel,
  statusLabel,
  labels,
  canCancel,
  isCancelling,
  onCancel,
}: SessionCardProps) => {
  const statusChip = (() => {
    switch (session.status) {
      case SessionStatus.Pending:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock className="h-3 w-3" strokeWidth={1.8} />
            {statusLabel}
          </span>
        );
      case SessionStatus.Confirmed:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            <Clock className="h-3 w-3" strokeWidth={1.8} />
            {statusLabel}
          </span>
        );
      case SessionStatus.Completed:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />
            {statusLabel}
          </span>
        );
      case SessionStatus.Cancelled:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            <XCircle className="h-3 w-3" strokeWidth={1.8} />
            {statusLabel}
          </span>
        );
      default:
        return null;
    }
  })();

  const icon =
    session.type === ConsultationSessionType.Verification ? (
      <Eye className="h-4 w-4" strokeWidth={1.8} />
    ) : session.type === ConsultationSessionType.VideoCall ? (
      <Video className="h-4 w-4" strokeWidth={1.8} />
    ) : (
      <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
    );

  const dimmed = session.status === SessionStatus.Cancelled;

  return (
    <article
      className={[
        'medical-card p-6 hover:border-brand/30 transition-colors',
        dimmed ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-brand-soft text-brand">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-(--text-primary)">
              {typeLabel}
            </h3>
            {statusChip}
          </div>

          <dl className="grid grid-cols-1 gap-1.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span className="font-mono tabular-nums">
                {session.appointmentTime
                  ? formatShortDate(session.appointmentTime)
                  : labels.notScheduledYet}
              </span>
            </div>
            {session.appointmentTime ? (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
                <span className="font-mono tabular-nums">
                  {formatShortTime(session.appointmentTime)}
                </span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 sm:col-span-2">
              <User className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span className="truncate">{labels.doctor}</span>
            </div>
            {session.type === ConsultationSessionType.VideoCall ? (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Video className="h-3.5 w-3.5 text-brand" strokeWidth={1.8} />
                <span className="truncate text-brand">
                  {session.meetingLink
                    ? labels.videoConsultationReady
                    : labels.videoConsultation}
                </span>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {(session.status === SessionStatus.Confirmed ||
        session.status === SessionStatus.Completed) && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {session.status === SessionStatus.Confirmed && (
            <>
              <Link
                to="/patient/chat"
                className="flex-1 lg:flex-none px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                {labels.viewChat}
              </Link>
              {session.type === ConsultationSessionType.VideoCall && (
                <button
                  type="button"
                  className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {labels.joinCall}
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {labels.cancel}
                </button>
              )}
            </>
          )}
          {session.status === SessionStatus.Completed && (
            <Link
              to="/patient/chat"
              className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
              {labels.viewDetails}
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          )}
        </div>
      )}
    </article>
  );
};

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  labels: { prev: string; next: string; status: string };
}

const Pagination = ({
  page,
  totalPages,
  onChange,
  labels,
}: PaginationProps) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between"
    >
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
        {labels.prev}
      </button>
      <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
        {labels.status}
      </span>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {labels.next}
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </nav>
  );
};

const SkeletonList = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="medical-card p-5 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-[var(--bg-secondary)]" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/2 rounded bg-[var(--bg-secondary)]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-3 rounded bg-[var(--bg-secondary)]/70" />
              <div className="h-3 rounded bg-[var(--bg-secondary)]/70" />
              <div className="h-3 rounded bg-[var(--bg-secondary)]/70 col-span-2" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const EmptyState = ({ icon, title, ctaLabel, ctaHref }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)] text-center">
    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
      {icon}
    </span>
    <p className="max-w-[40ch] mx-auto">{title}</p>
    {ctaLabel && ctaHref && (
      <Link
        to={ctaHref}
        className="inline-flex mt-3 items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand/80"
      >
        {ctaLabel}
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    )}
  </div>
);

export { Pagination as AppointmentPagination };

export const AppointmentsLoadingFallback = () => (
  <PatientLayout>
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size={40} />
    </div>
  </PatientLayout>
);

export default AppointmentsPage;
