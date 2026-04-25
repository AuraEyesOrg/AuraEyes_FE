import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeRoadmapStep,
  createRoadmapStep,
  deleteRoadmapStep,
  getPatientHealthRoadmap,
  updateRoadmapStep,
} from '../api/health-roadmap.api';
import type {
  CreateRoadmapStepRequest,
  UpdateRoadmapStepRequest,
} from '../types/health-roadmap.types';

export const healthRoadmapKeys = {
  all: ['health-roadmap'] as const,
  byPatient: (patientId: string) =>
    [...healthRoadmapKeys.all, 'patient', patientId] as const,
};

export const usePatientHealthRoadmap = (
  patientId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: healthRoadmapKeys.byPatient(patientId),
    queryFn: () => getPatientHealthRoadmap(patientId),
    enabled: !!patientId && (options?.enabled ?? true),
    staleTime: 15_000,
  });

export const useCreateRoadmapStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateRoadmapStepRequest) =>
      createRoadmapStep(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: healthRoadmapKeys.byPatient(variables.patientId),
      });
    },
  });
};

export const useUpdateRoadmapStep = (patientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      stepId,
      request,
    }: {
      stepId: string;
      request: UpdateRoadmapStepRequest;
    }) => updateRoadmapStep(stepId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: healthRoadmapKeys.byPatient(patientId),
      });
    },
  });
};

export const useCompleteRoadmapStep = (patientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => completeRoadmapStep(stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: healthRoadmapKeys.byPatient(patientId),
      });
    },
  });
};

export const useDeleteRoadmapStep = (patientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => deleteRoadmapStep(stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: healthRoadmapKeys.byPatient(patientId),
      });
    },
  });
};
