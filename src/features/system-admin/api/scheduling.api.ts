import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api-response';
import { PagedResult } from '@/features/patient/types';
import {
  ScheduleTemplateDto,
  CreateScheduleTemplateRequest,
  UpdateScheduleTemplateRequest,
  AppointmentSlotListDto,
} from '@/types/schedule';

const schedulingApi = {
  // --- Schedule Templates ---
  getTemplates: async (params?: {
    dayOfWeek?: number;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const response = await api.get<
      ApiResponse<PagedResult<ScheduleTemplateDto>>
    >('/schedule-templates', { params });
    return response.data;
  },

  createTemplate: async (request: CreateScheduleTemplateRequest) => {
    const response = await api.post<ApiResponse<string>>(
      '/schedule-templates',
      request
    );
    return response.data;
  },

  updateTemplate: async (
    templateId: string,
    request: UpdateScheduleTemplateRequest
  ) => {
    const response = await api.put<ApiResponse<void>>(
      `/schedule-templates/${templateId}`,
      request
    );
    return response.data;
  },

  deleteTemplate: async (templateId: string) => {
    const response = await api.delete<ApiResponse<void>>(
      `/schedule-templates/${templateId}`
    );
    return response.data;
  },

  // --- Background Jobs ---
  triggerGeneration: async () => {
    const response = await api.post<ApiResponse<void>>(
      '/system-admin/scheduling/trigger-generation'
    );
    return response.data;
  },

  getSlots: async (params?: {
    ophthalId?: string;
    status?: number; // using ScheduleStatus enum
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const response = await api.get<
      ApiResponse<PagedResult<AppointmentSlotListDto>>
    >('/appointment-slots', { params });
    return response.data;
  },
};

export default schedulingApi;
