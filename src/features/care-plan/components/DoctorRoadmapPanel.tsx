import { useState } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  useCompleteRoadmapStep,
  useCreateRoadmapStep,
  useDeleteRoadmapStep,
  usePatientHealthRoadmap,
  useUpdateRoadmapStep,
} from '../hooks/use-health-roadmap';
import RoadmapTimeline from './RoadmapTimeline';
import RoadmapStepForm, { type RoadmapStepFormMode } from './RoadmapStepForm';
import type { HealthRoadmapStepDto } from '../types/health-roadmap.types';

export interface DoctorRoadmapPanelProps {
  patientId: string;
  /**
   * If supplied, new steps will be linked to this PatientVisit (ties the step to a visit).
   */
  visitId?: string;
  /**
   * Optional href to the standalone full roadmap page for "Manage all" link.
   */
  fullRoadmapHref?: string;
  /**
   * If true, only show the next few upcoming steps (compact mode).
   * Defaults to true (panel use case).
   */
  compact?: boolean;
}

/**
 * Compact, embeddable doctor panel for managing a patient's healthcare roadmap.
 * Designed to slot into a PatientVisit / consultation detail page.
 */
export default function DoctorRoadmapPanel({
  patientId,
  visitId,
  fullRoadmapHref,
  compact = true,
}: DoctorRoadmapPanelProps) {
  const [formMode, setFormMode] = useState<RoadmapStepFormMode | null>(null);

  const roadmapQuery = usePatientHealthRoadmap(patientId);
  const createMutation = useCreateRoadmapStep();
  const updateMutation = useUpdateRoadmapStep(patientId);
  const completeMutation = useCompleteRoadmapStep(patientId);
  const deleteMutation = useDeleteRoadmapStep(patientId);

  const allSteps = roadmapQuery.data?.steps ?? [];
  const visibleSteps = compact
    ? allSteps
        .filter(
          (s) =>
            s.effectiveStatus === 'Upcoming' || s.effectiveStatus === 'Overdue'
        )
        .slice(0, 4)
    : allSteps;

  const openCreate = () =>
    setFormMode({ kind: 'create', patientId, createdFromVisitId: visitId });
  const openEdit = (step: HealthRoadmapStepDto) =>
    setFormMode({ kind: 'edit', step });

  const handleComplete = async (step: HealthRoadmapStepDto) => {
    try {
      await completeMutation.mutateAsync(step.id);
      toast.success('Step marked as completed.');
    } catch {
      toast.error('Failed to complete step.');
    }
  };

  const handleDelete = async (step: HealthRoadmapStepDto) => {
    if (!window.confirm(`Delete step "${step.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(step.id);
      toast.success('Step deleted.');
    } catch {
      toast.error('Failed to delete step.');
    }
  };

  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-primary) p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-(--text-primary)">
            <Stethoscope className="w-5 h-5 text-brand" strokeWidth={1.8} />
            Care plan
          </h3>
          <p className="text-xs text-(--text-secondary) mt-0.5">
            Doctor-authored next steps for this patient.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fullRoadmapHref && (
            <Link
              to={fullRoadmapHref}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Manage all
            </Link>
          )}
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add step
          </button>
        </div>
      </header>

      {roadmapQuery.isLoading ? (
        <p className="text-sm text-(--text-secondary)">Loading...</p>
      ) : (
        <RoadmapTimeline
          steps={visibleSteps}
          mode="doctor"
          onComplete={handleComplete}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyState={
            <p className="text-sm text-(--text-secondary)">
              No upcoming steps. Click <strong>Add step</strong> to start the
              patient's care plan.
            </p>
          }
        />
      )}

      <RoadmapStepForm
        open={formMode !== null}
        mode={
          formMode ?? {
            kind: 'create',
            patientId,
            createdFromVisitId: visitId,
          }
        }
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onCreate={async (request) => {
          try {
            await createMutation.mutateAsync(request);
            toast.success('Roadmap step added.');
            setFormMode(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : 'Failed to add roadmap step.'
            );
          }
        }}
        onUpdate={async (stepId, request) => {
          try {
            await updateMutation.mutateAsync({ stepId, request });
            toast.success('Roadmap step updated.');
            setFormMode(null);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : 'Failed to update roadmap step.'
            );
          }
        }}
      />
    </section>
  );
}
