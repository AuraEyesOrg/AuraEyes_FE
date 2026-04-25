import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/features/patient/types';
import type {
  CreateRoadmapStepRequest,
  HealthRoadmapDto,
  HealthRoadmapStepDto,
  UpdateRoadmapStepRequest,
} from '../types/health-roadmap.types';

export const getPatientHealthRoadmap = async (
  patientId: string
): Promise<HealthRoadmapDto> => {
  const response = await api.get<ApiResponse<HealthRoadmapDto>>(
    API_ENDPOINTS.HEALTH_ROADMAP.GET_BY_PATIENT(patientId)
  );

  if (!response.data.data) {
    throw new Error('Healthcare roadmap response was empty.');
  }
  return response.data.data;
};

export const createRoadmapStep = async (
  request: CreateRoadmapStepRequest
): Promise<HealthRoadmapStepDto> => {
  const response = await api.post<ApiResponse<HealthRoadmapStepDto>>(
    API_ENDPOINTS.HEALTH_ROADMAP.CREATE_STEP,
    request
  );

  if (!response.data.data) {
    throw new Error('Create roadmap step returned empty payload.');
  }
  return response.data.data;
};

export const updateRoadmapStep = async (
  stepId: string,
  request: UpdateRoadmapStepRequest
): Promise<HealthRoadmapStepDto> => {
  const response = await api.patch<ApiResponse<HealthRoadmapStepDto>>(
    API_ENDPOINTS.HEALTH_ROADMAP.UPDATE_STEP(stepId),
    request
  );

  if (!response.data.data) {
    throw new Error('Update roadmap step returned empty payload.');
  }
  return response.data.data;
};

export const completeRoadmapStep = async (
  stepId: string
): Promise<HealthRoadmapStepDto> => {
  const response = await api.post<ApiResponse<HealthRoadmapStepDto>>(
    API_ENDPOINTS.HEALTH_ROADMAP.COMPLETE_STEP(stepId)
  );

  if (!response.data.data) {
    throw new Error('Complete roadmap step returned empty payload.');
  }
  return response.data.data;
};

export const deleteRoadmapStep = async (stepId: string): Promise<void> => {
  await api.delete(API_ENDPOINTS.HEALTH_ROADMAP.DELETE_STEP(stepId));
};
