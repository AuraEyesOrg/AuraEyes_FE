import {
  Calendar,
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useClinicDashboardMetrics } from '../hooks/use-clinic-dashboard';
import ClinicStaffLayout from '../components/ClinicStaffLayout';

// ─── Stat Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-(--bg-secondary) p-5 flex items-center gap-4 shadow-sm border border-(--border-color)/30">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className="text-2xl font-bold text-(--text-primary)">
          {value}
        </span>
        {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Activity Item ──────────────────────────────────────────────────────────

import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface ActivityItemProps {
  patientName: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'urgent';
}

function ActivityItem({
  patientName,
  action,
  time,
  status,
}: ActivityItemProps) {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'vi' ? vi : enUS;

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    pending: {
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    urgent: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  };

  // Normalize API action string to a camelCase key for translation lookup
  const normalizeActionKey = (raw: string): string => {
    const map: Record<string, string> = {
      'checked in': 'checkedIn',
      'checked-in': 'checkedIn',
      'patient checked in at counter': 'checkedInAtCounter',
      'appointment created': 'appointmentCreated',
      'appointment cancelled': 'appointmentCancelled',
      'appointment canceled': 'appointmentCancelled',
      'new appointment booked': 'newAppointmentBooked',
      'screening completed': 'screeningCompleted',
      'sent to doctor': 'sentToDoctor',
      'consultation started': 'consultationStarted',
      'consultation in progress': 'consultationInProgress',
      'payment completed': 'paymentCompleted',
      'patient registered': 'patientRegistered',
      'erm filled': 'ermFilled',
      'erm record filled': 'ermFilled',
    };
    return map[raw.toLowerCase().trim()] ?? '';
  };

  const actionKey = normalizeActionKey(action);
  const translatedAction = actionKey
    ? t(
        `ClinicStaffDashboard.activityActions.${actionKey}` as never,
        { defaultValue: action } as never
      )
    : action;

  const { icon: StatusIcon, color, bg } = statusConfig[status];
  const date = new Date(time);

  return (
    <div className="flex items-center gap-4 py-4 border-b border-(--border-color)/10 last:border-none group/activity hover:bg-(--bg-primary)/40 transition-all px-2 -mx-2 rounded-xl">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/activity:scale-110 ${bg}`}
      >
        <StatusIcon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-(--text-primary) group-hover/activity:text-brand transition-colors truncate">
          {patientName}
        </p>
        <p className="text-xs text-(--text-secondary) font-medium">
          {translatedAction}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-(--text-primary) tabular-nums">
          {date.toLocaleTimeString(i18n.language, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </p>
        <p className="text-[10px] text-(--text-muted) font-semibold uppercase tracking-tighter">
          {formatDistanceToNow(date, {
            addSuffix: true,
            locale: currentLocale,
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick?: () => void;
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl bg-(--bg-secondary) hover:bg-primary/5 border border-(--border-color)/30 hover:border-primary/30 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-(--text-primary)">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </button>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

/**
 * Dashboard for ClinicStaff role.
 * Shows key operational metrics: appointments, patients, tasks, and activity feed.
 */
export default function ClinicStaffDashboardPage() {
  const navigate = useNavigate();
  const { t: i18nT } = useTranslation();
  const t = (key: string, defaultValue?: string) =>
    i18nT(key as never, { defaultValue } as never) as unknown as string;

  const { user } = useAuthStore();
  const { data: metrics, isLoading } = useClinicDashboardMetrics();

  const firstName = user?.fullName?.split(' ').at(-1) ?? 'Staff';
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t('ClinicStaffDashboard.greetings.morning', 'Good morning')
      : currentHour < 18
        ? t('ClinicStaffDashboard.greetings.afternoon', 'Good afternoon')
        : t('ClinicStaffDashboard.greetings.evening', 'Good evening');

  const stats = [
    {
      icon: Calendar,
      label: t(
        'ClinicStaffDashboard.stats.todayAppointments',
        "Today's Appointments"
      ),
      value: metrics?.todayAppointments ?? 0,
      sub: t('ClinicStaffDashboard.stats.scheduled', 'Scheduled'),
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Users,
      label: t('ClinicStaffDashboard.stats.patientsCheckedIn', 'Checked In'),
      value: metrics?.checkedInPatients ?? 0,
      sub: t('ClinicStaffDashboard.stats.today', 'Today'),
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      icon: ClipboardList,
      label: t('ClinicStaffDashboard.stats.pendingTasks', 'Pending Tasks'),
      value: metrics?.pendingTasks ?? 0,
      sub: t('ClinicStaffDashboard.stats.requiresAction', 'Require action'),
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      icon: UserCheck,
      label: t('ClinicStaffDashboard.stats.completedToday', 'Completed'),
      value: metrics?.completedToday ?? 0,
      sub: t('ClinicStaffDashboard.stats.today', 'Today'),
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-500',
    },
  ];

  const recentActivity = metrics?.recentActivity ?? [];

  const quickActions: QuickActionProps[] = [
    {
      icon: Calendar,
      label: t(
        'ClinicStaffDashboard.quickActions.newAppointment',
        'New Appointment'
      ),
      description: t(
        'ClinicStaffDashboard.quickActions.newAppointmentDesc',
        'Schedule a new patient appointment'
      ),
      onClick: () =>
        navigate(resolvePathWithLocale('/clinic-staff/appointments')),
    },
    {
      icon: Users,
      label: t(
        'ClinicStaffDashboard.quickActions.registerPatient',
        'Register Patient'
      ),
      description: t(
        'ClinicStaffDashboard.quickActions.registerPatientDesc',
        'Add a new patient to the system'
      ),
      onClick: () => navigate(resolvePathWithLocale('/clinic-staff/patients')),
    },
    {
      icon: ClipboardList,
      label: t(
        'ClinicStaffDashboard.quickActions.viewSchedule',
        'View Schedule'
      ),
      description: t(
        'ClinicStaffDashboard.quickActions.viewScheduleDesc',
        "See today's full schedule"
      ),
      onClick: () => navigate(resolvePathWithLocale('/clinic-staff/schedules')),
    },
    {
      icon: TrendingUp,
      label: t('ClinicStaffDashboard.quickActions.cashierDesk', 'Cashier desk'),
      description: t(
        'ClinicStaffDashboard.quickActions.cashierDeskDesc',
        'Review finalized visits and collect payment'
      ),
      onClick: () => navigate(resolvePathWithLocale('/clinic-staff/cashier')),
    },
  ];

  return (
    <ClinicStaffLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--text-primary)">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {t(
            'ClinicStaffDashboard.subtitle',
            'AURA Clinic • Real-time operational overview'
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Content: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-(--bg-secondary) p-6 border border-(--border-color)/30 shadow-sm">
          <h2 className="text-base font-bold text-(--text-primary) mb-1">
            {t('ClinicStaffDashboard.activity.title', 'Recent Activity')}
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {t(
              'ClinicStaffDashboard.activity.subtitle',
              'Live patient check-ins and appointment updates'
            )}
          </p>

          {recentActivity.length > 0 ? (
            recentActivity.map((item, idx) => (
              <ActivityItem key={idx} {...item} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">
                {t(
                  'ClinicStaffDashboard.activity.empty',
                  'No recent activity. A fresh day begins!'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-(--bg-secondary) p-6 border border-(--border-color)/30 shadow-sm">
          <h2 className="text-base font-bold text-(--text-primary) mb-1">
            {t('ClinicStaffDashboard.quickActions.title', 'Quick Actions')}
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {t(
              'ClinicStaffDashboard.quickActions.subtitle',
              'Common tasks for today'
            )}
          </p>
          <div className="flex flex-col gap-3">
            {quickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </div>
        </div>
      </div>
    </ClinicStaffLayout>
  );
}
