import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface OrganisationScheduleTemplateDto {
  id: string;
  orgId: string | null;
  ophthalId: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxCapacity: number;
  cost?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface OrganisationAppointmentSlotDto {
  id: string;
  scheduleTemplateId: string;
  ophthalId: string | null;
  orgId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  cost?: number | null;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  createdAt: string;
}

export interface CreateOrganisationTemplateRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxCapacity: number;
  cost?: number | null;
}

export interface UpdateOrganisationTemplateRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxCapacity: number;
  cost?: number | null;
}

export interface GenerateOrganisationSlotsRequest {
  scheduleTemplateId: string;
  fromDate: string;
  toDate: string;
  skipExistingDates?: boolean;
}

export interface GetOrganisationSlotsParams {
  orgId?: string;
  fromDate?: string;
  toDate?: string;
  status?: number;
  pageNumber?: number;
  pageSize?: number;
}

export const getOrganisationTemplates = async (): Promise<
  OrganisationScheduleTemplateDto[]
> => {
  const response = await api.get<
    ApiResponse<PagedResult<OrganisationScheduleTemplateDto>>
  >(API_ENDPOINTS.SCHEDULE_TEMPLATES.LIST, {
    params: {
      pageNumber: 1,
      pageSize: 200,
    },
  });

  return unwrapApiData<PagedResult<OrganisationScheduleTemplateDto>>(
    response.data
  ).items;
};

export const createOrganisationTemplate = async (
  request: CreateOrganisationTemplateRequest
): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    API_ENDPOINTS.SCHEDULE_TEMPLATES.CREATE,
    {
      dayOfWeek: request.dayOfWeek,
      startTime: request.startTime,
      endTime: request.endTime,
      slotDuration: request.slotDuration,
      maxCapacity: request.maxCapacity,
      cost: request.cost ?? null,
    }
  );

  return unwrapApiData<string>(response.data);
};

export const updateOrganisationTemplate = async (
  templateId: string,
  request: UpdateOrganisationTemplateRequest
): Promise<void> => {
  await api.put(API_ENDPOINTS.SCHEDULE_TEMPLATES.UPDATE(templateId), {
    dayOfWeek: request.dayOfWeek,
    startTime: request.startTime,
    endTime: request.endTime,
    slotDuration: request.slotDuration,
    maxCapacity: request.maxCapacity,
    cost: request.cost ?? null,
  });
};

export const deleteOrganisationTemplate = async (
  templateId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.SCHEDULE_TEMPLATES.DELETE(templateId));
};

export const getOrganisationSlots = async (
  params: GetOrganisationSlotsParams
): Promise<PagedResult<OrganisationAppointmentSlotDto>> => {
  const response = await api.get<
    ApiResponse<PagedResult<OrganisationAppointmentSlotDto>>
  >(API_ENDPOINTS.APPOINTMENT_SLOTS.LIST, {
    params: {
      fromDate: params.fromDate,
      toDate: params.toDate,
      status: params.status,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 200,
    },
  });

  return unwrapApiData<PagedResult<OrganisationAppointmentSlotDto>>(
    response.data
  );
};

export const generateOrganisationSlots = async (
  request: GenerateOrganisationSlotsRequest
): Promise<number> => {
  const response = await api.post<ApiResponse<number>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.GENERATE,
    {
      scheduleTemplateId: request.scheduleTemplateId,
      fromDate: request.fromDate,
      toDate: request.toDate,
      skipExistingDates: request.skipExistingDates ?? true,
    }
  );

  return unwrapApiData<number>(response.data);
};

export const updateOrganisationSlotStatus = async (
  slotId: string,
  newStatus: number
): Promise<void> => {
  await api.patch(API_ENDPOINTS.APPOINTMENT_SLOTS.UPDATE_STATUS(slotId), {
    newStatus,
  });
};
