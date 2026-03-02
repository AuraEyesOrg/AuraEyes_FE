/**
 * Ophthalmologist Schedule API
 * Matches route: api/ophthalmologists/{ophthalmologistId}/schedules
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ScheduleDto,
  ScheduleListDto,
  CreateScheduleRequest,
  UpdateScheduleStatusRequest,
  GetSchedulesParams,
} from '@/types/schedule';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ============ QUERIES ============

/** GET /api/ophthalmologists/:ophId/schedules */
export const getSchedules = async (
  params: GetSchedulesParams
): Promise<PagedResult<ScheduleListDto>> => {
  const { ophthalmologistId, ...queryParams } = params;
  const response = await api.get<ApiResponse<PagedResult<ScheduleListDto>>>(
    API_ENDPOINTS.OPHTHALMOLOGIST.SCHEDULES.LIST(ophthalmologistId),
    { params: queryParams }
  );
  return response.data.data;
};

/** GET /api/ophthalmologists/:ophId/schedules/:scheduleId */
export const getSchedule = async (
  ophthalmologistId: string,
  scheduleId: string
): Promise<ScheduleDto> => {
  const response = await api.get<ApiResponse<ScheduleDto>>(
    API_ENDPOINTS.OPHTHALMOLOGIST.SCHEDULES.DETAIL(
      ophthalmologistId,
      scheduleId
    )
  );
  return response.data.data;
};

// ============ MUTATIONS ============

/** POST /api/ophthalmologists/:ophId/schedules */
export const createSchedule = async (
  ophthalmologistId: string,
  data: CreateScheduleRequest
): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    API_ENDPOINTS.OPHTHALMOLOGIST.SCHEDULES.CREATE(ophthalmologistId),
    data
  );
  return response.data.data;
};

/** PATCH /api/ophthalmologists/:ophId/schedules/:scheduleId/status */
export const updateScheduleStatus = async (
  ophthalmologistId: string,
  scheduleId: string,
  data: UpdateScheduleStatusRequest
): Promise<boolean> => {
  const response = await api.patch<ApiResponse<boolean>>(
    API_ENDPOINTS.OPHTHALMOLOGIST.SCHEDULES.UPDATE_STATUS(
      ophthalmologistId,
      scheduleId
    ),
    data
  );
  return response.data.data;
};
