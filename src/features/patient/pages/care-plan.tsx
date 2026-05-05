import { useMemo } from 'react';
import {
  CalendarClock,
  ClipboardList,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import useAuthStore from '@/store/auth-store';
import { RoadmapTimeline, usePatientHealthRoadmap } from '@/features/care-plan';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';

/**
 * Patient-facing read-only Healthcare Roadmap (doctor-authored care plan timeline).
 * Distinct from the AI-generated roadmap at /patient/roadmap.
 */
export default function PatientCarePlanPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, defaultValue?: string, options?: any) =>
    i18nT(key as any, { defaultValue, ...options } as any) as string;

  const { user } = useAuthStore();
  const patientId = user?.roleId ?? '';

  const roadmapQuery = usePatientHealthRoadmap(patientId);
  const steps = useMemo(
    () => roadmapQuery.data?.steps ?? [],
    [roadmapQuery.data]
  );

  const PageHeader = () => (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('PatientCarePlan.page.title', 'Lộ trình Sức khỏe')}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          {t(
            'PatientCarePlan.page.description',
            'Theo dõi kế hoạch chăm sóc và các bước điều trị tiếp theo của bạn.'
          )}
        </p>
      </div>

      <Link
        to={resolvePathWithLocale('/patient/schedule')}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 shadow-sm"
      >
        <PlusCircle className="h-5 w-5" strokeWidth={2} />
        <span>{t('PatientAppointments.actions.bookNew')}</span>
      </Link>
    </div>
  );

  const counts = useMemo(() => {
    const upcoming = steps.filter(
      (s) => s.effectiveStatus === 'Upcoming'
    ).length;
    const overdue = steps.filter((s) => s.effectiveStatus === 'Overdue').length;
    const completed = steps.filter(
      (s) => s.effectiveStatus === 'Completed'
    ).length;
    return { upcoming, overdue, completed };
  }, [steps]);

  return (
    <PatientLayout>
      <PageHeader />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <PatientStat
          icon={<CalendarClock className="w-4 h-4" />}
          label={t('PatientCarePlan.stats.upcoming', 'Upcoming')}
          value={counts.upcoming}
          tone="sky"
        />
        <PatientStat
          icon={<AlertTriangle className="w-4 h-4" />}
          label={t('PatientCarePlan.stats.overdue', 'Overdue')}
          value={counts.overdue}
          tone="red"
        />
        <PatientStat
          icon={<ClipboardList className="w-4 h-4" />}
          label={t('PatientCarePlan.stats.completed', 'Completed')}
          value={counts.completed}
          tone="emerald"
        />
      </div>

      {/* Timeline */}
      {roadmapQuery.isLoading ? (
        <div className="flex items-center gap-3 py-12 text-(--text-secondary)">
          <Spinner />{' '}
          {t('PatientCarePlan.loading', 'Loading your care plan...')}
        </div>
      ) : roadmapQuery.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
          {t(
            'PatientCarePlan.error',
            'Unable to load your healthcare roadmap. Please refresh and try again.'
          )}
        </div>
      ) : (
        <RoadmapTimeline
          steps={steps}
          mode="patient"
          emptyState={
            <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-10 text-center">
              <p className="text-(--text-primary) font-semibold">
                {t('PatientCarePlan.empty.title', 'No care plan steps yet.')}
              </p>
              <p className="mt-1 text-sm text-(--text-secondary)">
                {t(
                  'PatientCarePlan.empty.message',
                  'Your doctor will add steps here after your next visit.'
                )}
              </p>
            </div>
          }
        />
      )}
    </PatientLayout>
  );
}

interface PatientStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'sky' | 'red' | 'emerald';
}

const TONE: Record<PatientStatProps['tone'], string> = {
  sky: 'border-sky-200 text-sky-700 dark:border-sky-700/50 dark:text-sky-300 bg-sky-50/40 dark:bg-sky-900/10',
  red: 'border-red-200 text-red-700 dark:border-red-700/50 dark:text-red-300 bg-red-50/40 dark:bg-red-900/10',
  emerald:
    'border-emerald-200 text-emerald-700 dark:border-emerald-700/50 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-900/10',
};

function PatientStat({ icon, label, value, tone }: PatientStatProps) {
  return (
    <div className={`rounded-2xl border p-4 ${TONE[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="opacity-80">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          {label}
        </span>
      </div>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
