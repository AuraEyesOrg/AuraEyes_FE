import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Stethoscope } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import Spinner from '@/components/ui/spinner';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  RoadmapStepForm,
  RoadmapTimeline,
  type RoadmapStepFormMode,
  useCompleteRoadmapStep,
  useCreateRoadmapStep,
  useDeleteRoadmapStep,
  usePatientHealthRoadmap,
  useUpdateRoadmapStep,
} from '@/features/care-plan';
import type { HealthRoadmapStepDto } from '@/features/care-plan/types/health-roadmap.types';

/**
 * Doctor-facing standalone page: full management of a patient's healthcare roadmap.
 * Route: /ophthalmologist/patients/:patientId/care-plan
 */
export default function PatientCarePlanPage() {
  const { t } = useSafeTranslation();
  const { patientId = '' } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [formMode, setFormMode] = useState<RoadmapStepFormMode | null>(null);

  const roadmapQuery = usePatientHealthRoadmap(patientId);
  const createMutation = useCreateRoadmapStep();
  const updateMutation = useUpdateRoadmapStep(patientId);
  const completeMutation = useCompleteRoadmapStep(patientId);
  const deleteMutation = useDeleteRoadmapStep(patientId);

  const steps = useMemo(
    () => roadmapQuery.data?.steps ?? [],
    [roadmapQuery.data]
  );

  const stats = useMemo(() => {
    const total = steps.length;
    const upcoming = steps.filter(
      (s) => s.effectiveStatus === 'Upcoming'
    ).length;
    const overdue = steps.filter((s) => s.effectiveStatus === 'Overdue').length;
    const completed = steps.filter(
      (s) => s.effectiveStatus === 'Completed'
    ).length;
    return { total, upcoming, overdue, completed };
  }, [steps]);

  const handleAdd = () => {
    setFormMode({ kind: 'create', patientId });
  };

  const handleEdit = (step: HealthRoadmapStepDto) => {
    setFormMode({ kind: 'edit', step });
  };

  const handleComplete = async (step: HealthRoadmapStepDto) => {
    try {
      await completeMutation.mutateAsync(step.id);
      toast.success(
        t(
          'Ophthalmologist.carePlan.toast.stepCompleted',
          'Step marked as completed.'
        )
      );
    } catch {
      toast.error(
        t(
          'Ophthalmologist.carePlan.toast.stepCompleteFailed',
          'Failed to complete step.'
        )
      );
    }
  };

  const handleDelete = async (step: HealthRoadmapStepDto) => {
    if (
      !window.confirm(
        t(
          'Ophthalmologist.carePlan.confirm.delete',
          'Delete step "{{title}}"? This cannot be undone.',
          { title: step.title }
        )
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(step.id);
      toast.success(
        t('Ophthalmologist.carePlan.toast.stepDeleted', 'Step deleted.')
      );
    } catch {
      toast.error(
        t(
          'Ophthalmologist.carePlan.toast.stepDeleteFailed',
          'Failed to delete step.'
        )
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto relative">
        <DoctorHeader />

        <main className="p-6 lg:p-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-(--text-secondary) hover:text-brand transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Ophthalmologist.carePlan.back', 'Back')}
              </button>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-(--text-primary)">
                <Stethoscope className="w-7 h-7 text-brand" strokeWidth={1.8} />
                {t('Ophthalmologist.carePlan.title', 'Healthcare Roadmap')}
              </h1>
              <p className="mt-1 text-sm text-(--text-secondary)">
                {t(
                  'Ophthalmologist.carePlan.subtitle',
                  'Doctor-authored care plan timeline for patient'
                )}{' '}
                <code className="px-1.5 py-0.5 rounded bg-(--bg-secondary) text-xs">
                  {patientId.slice(0, 8)}
                </code>
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold transition-colors shadow-lg shadow-brand/20"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              {t('Ophthalmologist.carePlan.addStep', 'Add step')}
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile
              label={t('Ophthalmologist.carePlan.stats.total', 'Total')}
              value={stats.total}
              tone="slate"
            />
            <StatTile
              label={t('Ophthalmologist.carePlan.stats.upcoming', 'Upcoming')}
              value={stats.upcoming}
              tone="sky"
            />
            <StatTile
              label={t('Ophthalmologist.carePlan.stats.overdue', 'Overdue')}
              value={stats.overdue}
              tone="red"
            />
            <StatTile
              label={t('Ophthalmologist.carePlan.stats.completed', 'Completed')}
              value={stats.completed}
              tone="emerald"
            />
          </div>

          {/* Timeline */}
          {roadmapQuery.isLoading ? (
            <div className="flex items-center gap-3 py-12 text-(--text-secondary)">
              <Spinner />{' '}
              {t('Ophthalmologist.carePlan.loading', 'Loading roadmap...')}
            </div>
          ) : roadmapQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
              {t(
                'Ophthalmologist.carePlan.loadError',
                'Failed to load the healthcare roadmap.'
              )}
            </div>
          ) : (
            <RoadmapTimeline
              steps={steps}
              mode="doctor"
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyState={
                <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-10 text-center">
                  <p className="text-(--text-secondary) mb-4">
                    {t(
                      'Ophthalmologist.carePlan.empty',
                      'No roadmap steps yet. Start by adding the first care plan item for this patient.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    {t(
                      'Ophthalmologist.carePlan.addFirstStep',
                      'Add first step'
                    )}
                  </button>
                </div>
              }
            />
          )}
        </main>
      </div>

      <RoadmapStepForm
        open={formMode !== null}
        mode={formMode ?? { kind: 'create', patientId }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onCreate={async (request) => {
          try {
            await createMutation.mutateAsync(request);
            toast.success(
              t(
                'Ophthalmologist.carePlan.toast.stepAdded',
                'Roadmap step added.'
              )
            );
            setFormMode(null);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : t(
                    'Ophthalmologist.carePlan.toast.stepAddFailed',
                    'Failed to add roadmap step.'
                  )
            );
          }
        }}
        onUpdate={async (stepId, request) => {
          try {
            await updateMutation.mutateAsync({ stepId, request });
            toast.success(
              t(
                'Ophthalmologist.carePlan.toast.stepUpdated',
                'Roadmap step updated.'
              )
            );
            setFormMode(null);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : t(
                    'Ophthalmologist.carePlan.toast.stepUpdateFailed',
                    'Failed to update roadmap step.'
                  )
            );
          }
        }}
      />
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: number;
  tone: 'slate' | 'sky' | 'red' | 'emerald';
}

const TONE_CLASS: Record<StatTileProps['tone'], string> = {
  slate:
    'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  sky: 'border-sky-200 dark:border-sky-700/50 text-sky-700 dark:text-sky-300',
  red: 'border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300',
  emerald:
    'border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300',
};

function StatTile({ label, value, tone }: StatTileProps) {
  return (
    <div
      className={`rounded-2xl border bg-(--bg-primary) p-4 ${TONE_CLASS[tone]}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}
