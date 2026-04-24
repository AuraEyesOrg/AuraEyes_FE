import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquareHeart,
  PlusCircle,
  XCircle,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';

import {
  usePatientClinicAppointments,
  usePatientClinicAppointmentCounts,
} from '@/features/patient/hooks/use-clinic-booking';
import { useCreateOrganisationFeedback } from '@/features/patient/hooks/use-feedback';
import {
  FeedbackModal,
  FeedbackSubmittedBadge,
} from '@/features/patient/components';
import useAuthStore from '@/store/auth-store';
import { formatSlotTime } from '@/lib/date-utils';
import { SessionStatus } from '@/types/consultation';
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

  const clinicAppointmentsQuery = usePatientClinicAppointments(
    patientId ?? '',
    {
      tab: CLINIC_TAB_MAP[filter],
      pageNumber: clinicPage,
      pageSize: PAGE_SIZE,
    },
    !!patientId
  );

  const { counts: clinicCounts } = usePatientClinicAppointmentCounts(
    patientId ?? ''
  );

  const createOrganisationFeedbackMutation = useCreateOrganisationFeedback();

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
        value: clinicCounts.Upcoming,
        icon: <CalendarDays className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'completed' as const,
        label: t('PatientAppointments.stats.completed'),
        value: clinicCounts.Completed,
        icon: <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'cancelled' as const,
        label: t('PatientAppointments.stats.cancelled'),
        value: clinicCounts.Cancelled,
        icon: <XCircle className="h-4 w-4" strokeWidth={1.6} />,
      },
      {
        key: 'total' as const,
        label: t('PatientAppointments.stats.total'),
        value: clinicCounts.All,
        icon: <FileText className="h-4 w-4" strokeWidth={1.6} />,
      },
    ],
    [clinicCounts, t]
  );

  const getFilterLabel = (status: FilterTab) =>
    t(`PatientAppointments.filters.${status}`);

  const getClinicStatusLabel = (status: string) => {
    const mappedKey = CLINIC_STATUS_LABEL_KEYS[status];
    if (!mappedKey) return status;
    return t(`PatientAppointments.clinicStatus.${mappedKey}`, {
      defaultValue: status,
    });
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

  const bothEmpty = !isLoadingClinic && clinicAppointments.length === 0;

  return (
    <PatientLayout>
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 md:px-10">
        {/* Abstract Background Element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-brand" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                {t('PatientAppointments.page.eyebrow')}
              </p>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {t('PatientAppointments.page.title')}
            </h1>
            <p className="mt-2 max-w-md text-lg font-medium text-slate-400">
              {t('PatientAppointments.page.subtitle')}
            </p>
          </div>

          <Link
            to="/patient/clinics"
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand/40"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <PlusCircle className="relative z-10 h-5 w-5" strokeWidth={2.5} />
            <span className="relative z-10 uppercase tracking-wider">
              {t('PatientAppointments.actions.bookNew')}
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const colorMap: Record<string, string> = {
            upcoming: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            completed:
              'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            cancelled: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            total: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
          };
          const colorClass = colorMap[stat.key] || colorMap.total;

          return (
            <div
              key={stat.key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${colorClass}`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {stat.label}
                </span>
              </div>
              <div className="relative z-10 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Records
                </span>
              </div>
              {/* Decorative accent */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab;
            const badge = clinicCounts[CLINIC_TAB_MAP[tab]];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFilterChange(tab)}
                className={[
                  'relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap',
                  active
                    ? 'bg-white dark:bg-slate-700 text-brand shadow-md'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                ].join(' ')}
              >
                <span>{getFilterLabel(tab)}</span>
                <span
                  className={[
                    'inline-flex min-w-[1.2rem] items-center justify-center rounded-lg px-1 py-0.5 text-[9px] font-black',
                    active
                      ? 'bg-brand text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                  ].join(' ')}
                >
                  {badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
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
      </div>

      {bothEmpty && (
        <div className="relative mt-12 overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/40 p-12 text-center border border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
              <CalendarDays
                className="h-10 w-10 text-brand"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mb-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('PatientAppointments.empty.noAppointmentsTitle')}
            </h3>

            <p className="mx-auto mb-8 max-w-md text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              {filter === 'all'
                ? t('PatientAppointments.empty.noAppointmentsAll')
                : t('PatientAppointments.empty.noAppointmentsByFilter', {
                    filter: getFilterLabel(filter),
                  })}
            </p>

            <Link
              to="/patient/clinics"
              className="group flex items-center gap-3 rounded-2xl bg-brand px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-brand/30 active:scale-95 shadow-xl shadow-brand/20"
            >
              <PlusCircle className="h-5 w-5" />
              {t('PatientAppointments.actions.bookFirstAppointment')}
            </Link>
          </div>
        </div>
      )}

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
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-brand transition-transform group-hover:scale-110">
          {icon}
        </span>
      </div>
      <div>
        <h2
          id={id}
          className="text-2xl font-black tracking-tight text-slate-900 dark:text-white"
        >
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {totalCount} Total
          </span>
          {refreshing && (
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand"></span>
            </span>
          )}
        </div>
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
  clinicLabel,
  onRate,
}: Omit<ClinicAppointmentCardProps, 'organisationLabel'>) => {
  const dimmed =
    appointment.status === 'Cancelled' || appointment.status === 'NoShow';

  return (
    <article
      className={[
        'group relative overflow-hidden medical-card p-0 hover:border-brand/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand/5',
        dimmed ? 'opacity-70 grayscale-[0.5]' : '',
      ].join(' ')}
    >
      <div className="flex flex-col md:flex-row">
        {/* Date Side Column */}
        <div className="flex flex-row md:flex-col items-center justify-center p-4 md:w-28 bg-slate-50 dark:bg-slate-800/40 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-brand-soft/30">
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter md:mb-1">
            {format(new Date(appointment.date), 'MMM')}
          </span>
          <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-none px-3 md:px-0">
            {format(new Date(appointment.date), 'dd')}
          </span>
          <span className="text-xs font-bold text-brand md:mt-1 opacity-80">
            {format(new Date(appointment.date), 'yyyy')}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-3.5 w-3.5 text-brand opacity-60" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {appointment.organisationName
                    ? 'Clinic Appointment'
                    : 'General Appointment'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
                {appointment.organisationName ?? clinicLabel}
              </h3>
            </div>

            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm',
                CLINIC_STATUS_STYLES[appointment.status] ??
                  CLINIC_STATUS_STYLES.Pending,
              ].join(' ')}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatSlotTime(appointment.startTime)} –{' '}
                  {formatSlotTime(appointment.endTime)}
                </span>
              </div>

              {appointment.visitReason && (
                <div className="flex items-start gap-3 text-slate-500 dark:text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2 italic pt-0.5">
                    "{appointment.visitReason}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 sm:pt-0">
              {appointment.status === 'Completed' && (
                <div>
                  {appointment.hasFeedback ? (
                    <FeedbackSubmittedBadge label={submittedLabel} />
                  ) : (
                    <button
                      type="button"
                      onClick={onRate}
                      className="group/btn relative px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold transition-all hover:bg-brand/90 hover:scale-105 active:scale-95 shadow-lg shadow-brand/20 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <MessageSquareHeart className="h-3.5 w-3.5" />
                        {rateLabel}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Progress/Accent Line */}
      <div
        className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full ${
          appointment.status === 'Completed'
            ? 'bg-emerald-500 w-full'
            : appointment.status === 'Cancelled'
              ? 'bg-rose-500 w-full'
              : 'bg-brand w-1/4'
        }`}
      />
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
      className="mt-8 flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800"
    >
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:grayscale"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {labels.prev}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Page
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-black text-white shadow-lg shadow-brand/20">
          {page}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          of {totalPages}
        </span>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:grayscale"
      >
        {labels.next}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
