import { useMemo } from 'react';
import RoadmapStepCard from './RoadmapStepCard';
import type { HealthRoadmapStepDto } from '../types/health-roadmap.types';

export interface RoadmapTimelineProps {
  steps: HealthRoadmapStepDto[];
  mode: 'doctor' | 'patient';
  onComplete?: (step: HealthRoadmapStepDto) => void;
  onEdit?: (step: HealthRoadmapStepDto) => void;
  onDelete?: (step: HealthRoadmapStepDto) => void;
  emptyState?: React.ReactNode;
}

/**
 * Vertical timeline: a single column of cards connected by a left rail.
 * Steps are expected pre-sorted by plannedDate (the API already does this).
 */
export default function RoadmapTimeline({
  steps,
  mode,
  onComplete,
  onEdit,
  onDelete,
  emptyState,
}: RoadmapTimelineProps) {
  const nextUpcomingId = useMemo(() => {
    const upcoming = steps.find(
      (s) => s.effectiveStatus === 'Upcoming' || s.effectiveStatus === 'Overdue'
    );
    return upcoming?.id ?? null;
  }, [steps]);

  if (steps.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <ol className="relative pl-8">
      {/* Vertical rail */}
      <span
        aria-hidden
        className="absolute left-3 top-2 bottom-2 w-px bg-(--border-color)"
      />

      {steps.map((step) => {
        const isCompleted = step.effectiveStatus === 'Completed';
        const isOverdue = step.effectiveStatus === 'Overdue';
        const dotClass = isCompleted
          ? 'bg-emerald-500 border-emerald-500'
          : isOverdue
            ? 'bg-red-500 border-red-500'
            : 'bg-(--bg-primary) border-brand';

        return (
          <li key={step.id} className="relative mb-6 last:mb-0">
            <span
              aria-hidden
              className={`absolute -left-8 top-5 inline-block w-3 h-3 rounded-full border-2 ${dotClass} z-10`}
            />
            <RoadmapStepCard
              step={step}
              mode={mode}
              highlightNext={step.id === nextUpcomingId && mode === 'patient'}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        );
      })}
    </ol>
  );
}
