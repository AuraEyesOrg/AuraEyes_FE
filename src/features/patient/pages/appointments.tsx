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
import { RefreshCw } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { Link, useParams } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';
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
import { useSyncOrder } from '../hooks/use-financial';
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
    'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
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
  const { locale } = useParams();
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

  const { mutate: syncOrder, isPending: isSyncing } = useSyncOrder();

  const handleSync = (orderId: string) => {
    syncOrder(orderId, {
      onSuccess: () => {
        toast.success('Đã cập nhật trạng thái mới nhất.');
      },
    });
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
        key: 'pending' as const,
        label: 'Chờ thanh toán',
        value:
          clinicCounts.All -
          (clinicCounts.Upcoming +
            clinicCounts.Completed +
            clinicCounts.Cancelled),
        icon: <Clock className="h-4 w-4" strokeWidth={1.6} />,
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

  const bothEmpty = !isLoadingClinic && clinicCounts.All === 0;

  const PageHeader = () => (
    <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 md:px-12 shadow-2xl">
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand/30 blur-[100px]" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-10 rounded-full bg-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)]" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand/90">
              {t('PatientAppointments.page.eyebrow')}
            </p>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-white md:text-5xl">
            {t('PatientAppointments.page.title')}
          </h1>
        </div>

        <Link
          to={resolvePathWithLocale('/patient/schedule')}
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brand px-10 py-5 text-sm font-black text-white transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_50px_rgba(var(--brand-rgb),0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <PlusCircle className="h-5 w-5" strokeWidth={2.5} />
          <span className="uppercase tracking-widest">
            {t('PatientAppointments.actions.bookNew')}
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <PatientLayout>
      <PageHeader />

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
              className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-brand/5 hover:-translate-y-1.5"
            >
              <div className="relative z-10 flex items-center justify-between mb-5">
                <div
                  className={`p-3 rounded-2xl border ${colorClass} shadow-inner`}
                >
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Slots
                </span>
              </div>
              {/* Decorative accent */}
              <div
                className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700 ease-out ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mb-12 flex items-center justify-center">
        <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/40 backdrop-blur-md rounded-[2rem] border border-slate-200/60 dark:border-slate-700/40 shadow-inner">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab;
            const badge = clinicCounts[CLINIC_TAB_MAP[tab]];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFilterChange(tab)}
                className={[
                  'relative flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all duration-500 whitespace-nowrap',
                  active
                    ? 'bg-white dark:bg-slate-700 text-brand shadow-[0_10px_20px_rgba(0,0,0,0.05)] scale-105 z-10'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/30',
                ].join(' ')}
              >
                <span className="uppercase tracking-widest">
                  {getFilterLabel(tab)}
                </span>
                <span
                  className={[
                    'inline-flex min-w-[1.5rem] h-6 items-center justify-center rounded-full px-2 text-[10px] font-black transition-colors duration-500',
                    active
                      ? 'bg-brand text-white shadow-[0_0_10px_rgba(var(--brand-rgb),0.4)]'
                      : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500',
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
                to={resolvePathWithLocale('/patient/schedule')}
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
              icon={<Building2 className="h-10 w-10" strokeWidth={1.5} />}
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
              ctaHref={resolvePathWithLocale('/patient/schedule')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5">
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
                  clinicLabel={t('PatientAppointments.labels.clinicVisit')}
                  onRate={() => setClinicFeedbackTarget(appointment)}
                  onSync={handleSync}
                  isSyncing={isSyncing}
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
        <div className="relative mt-16 overflow-hidden rounded-[3rem] bg-slate-50 dark:bg-slate-900/40 p-16 text-center border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-none">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-transform hover:scale-110">
              <CalendarDays
                className="h-12 w-12 text-brand"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mb-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('PatientAppointments.empty.noAppointmentsTitle')}
            </h3>

            <p className="mx-auto mb-10 max-w-md text-lg font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              {filter === 'all'
                ? t('PatientAppointments.empty.noAppointmentsAll')
                : t('PatientAppointments.empty.noAppointmentsByFilter', {
                    filter: getFilterLabel(filter),
                  })}
            </p>

            <Link
              to="/patient/schedule"
              className="group flex items-center gap-3 rounded-2xl bg-brand px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-brand/30 active:scale-95 shadow-xl shadow-brand/20"
            >
              <PlusCircle className="h-6 w-6" />
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
  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <span className="relative z-10 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-brand transition-all group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </span>
      </div>
      <div className="space-y-1">
        <h2
          id={id}
          className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
        >
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            {totalCount} Total
          </span>
          {refreshing && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand/10 border border-brand/20">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand"></span>
              </span>
              <span className="text-[9px] font-black text-brand uppercase tracking-tighter animate-pulse">
                Syncing
              </span>
            </div>
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
  clinicLabel: string;
  onRate: () => void;
  onSync: (orderId: string) => void;
  isSyncing?: boolean;
}

const ClinicAppointmentCard = ({
  appointment,
  statusLabel,
  rateLabel,
  submittedLabel,
  clinicLabel,
  onRate,
  onSync,
  isSyncing,
}: ClinicAppointmentCardProps) => {
  const dimmed =
    appointment.status === 'Cancelled' || appointment.status === 'NoShow';

  return (
    <article
      className={[
        'group relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-0 hover:border-brand/40 transition-all duration-500 hover:shadow-2xl hover:shadow-brand/5 hover:-translate-y-1',
        dimmed ? 'opacity-60 grayscale-[0.3]' : '',
      ].join(' ')}
    >
      <div className="flex flex-col md:flex-row">
        {/* Date Side Column */}
        <div className="flex flex-row md:flex-col items-center justify-center p-6 md:w-32 bg-slate-50/50 dark:bg-slate-800/30 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 transition-all group-hover:bg-brand-soft/20">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:mb-1">
            {format(new Date(appointment.date), 'MMM')}
          </span>
          <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none px-4 md:px-0 tracking-tighter">
            {format(new Date(appointment.date), 'dd')}
          </span>
          <div className="hidden md:block w-8 h-1 bg-brand/20 rounded-full my-2" />
          <span className="text-xs font-black text-brand tracking-widest opacity-60">
            {format(new Date(appointment.date), 'yyyy')}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                  {appointment.organisationName
                    ? 'Clinic Appointment'
                    : 'General Appointment'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                {appointment.organisationName ?? clinicLabel}
              </h3>
            </div>

            <span
              className={[
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm border border-transparent transition-all',
                CLINIC_STATUS_STYLES[appointment.status] ??
                  CLINIC_STATUS_STYLES.Pending,
              ].join(' ')}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`${appointment.status === 'Cancelled' ? '' : 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-current opacity-75`}
                ></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              {statusLabel}
            </span>
          </div>

          {appointment.status === 'Pending' && !appointment.isPaidDeposit && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <Clock className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Vui lòng hoàn tất thanh toán đặt cọc để xác nhận lịch hẹn này.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {appointment.orderId && (
                  <button
                    onClick={() => onSync(appointment.orderId!)}
                    disabled={isSyncing}
                    className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all disabled:opacity-50 group/sync"
                    title="Cập nhật trạng thái"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'group-hover/sync:rotate-180 transition-transform duration-500'}`}
                    />
                  </button>
                )}
                <Link
                  to={resolvePathWithLocale('/patient/wallet')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
                >
                  Thanh toán ngay
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatSlotTime(appointment.startTime)} –{' '}
                    {formatSlotTime(appointment.endTime)}
                  </span>
                </div>

                {/* Doctor Info Section */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 w-fit min-w-[240px]">
                  <div className="relative">
                    {appointment.ophthalAvatarUrl ? (
                      <img
                        src={appointment.ophthalAvatarUrl}
                        alt={appointment.ophthalFullName ?? ''}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                        {appointment.ophthalFullName?.charAt(0) ?? 'D'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Consulting Doctor
                    </p>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                      {appointment.ophthalFullName ?? 'Clinic Doctor'}
                    </h4>
                  </div>
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
            </div>

            <div className="flex justify-end pt-4 lg:pt-0">
              {appointment.status === 'Completed' && (
                <div className="w-full sm:w-auto">
                  {appointment.hasFeedback ? (
                    <FeedbackSubmittedBadge label={submittedLabel} />
                  ) : (
                    <button
                      type="button"
                      onClick={onRate}
                      className="group/btn relative w-full sm:w-auto px-8 py-3.5 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand/30 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <MessageSquareHeart className="h-4 w-4" />
                        {rateLabel}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
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
        className={`absolute bottom-0 left-0 h-1.5 transition-all duration-700 ease-in-out group-hover:w-full ${
          appointment.status === 'Completed'
            ? 'bg-emerald-500 w-full'
            : appointment.status === 'Cancelled' ||
                appointment.status === 'NoShow'
              ? 'bg-rose-500 w-full'
              : 'bg-brand w-1/6'
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
