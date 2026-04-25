/**
 * Types for the Healthcare Roadmap (doctor-authored care plan timeline).
 * Mirrors `Application.CarePlan.HealthRoadmaps.Common` DTOs from the backend.
 */

export type RoadmapStepType = 'FollowUp' | 'Test' | 'Medication' | 'Custom';

/** Persisted status (Overdue is derived – see {@link EffectiveRoadmapStepStatus}). */
export type RoadmapStepStatus = 'Upcoming' | 'Completed' | 'Cancelled';

/** Effective status as returned by the API (includes derived `Overdue`). */
export type EffectiveRoadmapStepStatus = RoadmapStepStatus | 'Overdue';

export interface HealthRoadmapStepDto {
  id: string;
  roadmapId: string;
  title: string;
  description?: string | null;
  stepType: RoadmapStepType;
  /** ISO date string (yyyy-MM-dd). */
  plannedDate: string;
  status: RoadmapStepStatus;
  effectiveStatus: EffectiveRoadmapStepStatus;
  createdByDoctorId: string;
  createdFromVisitId?: string | null;
  completedAt?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface HealthRoadmapDto {
  id: string | null;
  patientId: string;
  createdAt: string | null;
  updatedAt: string | null;
  steps: HealthRoadmapStepDto[];
}

export interface CreateRoadmapStepRequest {
  patientId: string;
  title: string;
  description?: string;
  stepType: RoadmapStepType;
  /** ISO date string (yyyy-MM-dd). */
  plannedDate: string;
  createdFromVisitId?: string;
  orderIndex?: number;
}

export interface UpdateRoadmapStepRequest {
  title?: string;
  description?: string;
  stepType?: RoadmapStepType;
  plannedDate?: string;
  orderIndex?: number;
}
