/**
 * Ophthalmologist Schedule API
 * Backend currently exposes appointment slots at /api/appointment-slots.
 * This adapter keeps the existing schedule page contract stable.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';
import type {
  ScheduleDto,
  ScheduleListDto,
  CreateScheduleRequest,
  UpdateScheduleStatusRequest,
  GetSchedulesParams,
} from '@/types/schedule';

interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface AppointmentSlotListDto {
  id: string;
  scheduleTemplateId: string;
  ophthalId: string | null;
  orgId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  cost: number | null;
  createdAt: string;
}

interface AppointmentSlotDto extends AppointmentSlotListDto {
  updatedAt: string | null;
}

interface ScheduleTemplateListDto {
  id: string;
}

interface CreateScheduleTemplateResponse {
  id: string;
}

const toDayOfWeek = (date: string): number => {
  // JS: 0=Sun..6=Sat, backend also accepts this DayOfWeek numeric mapping.
  const day = new Date(`${date}T00:00:00`).getDay();
  return Number.isNaN(day) ? 1 : day;
};

const calcSlotDurationMinutes = (
  startTime: string,
  endTime: string
): number => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  if (
    Number.isNaN(sh) ||
    Number.isNaN(sm) ||
    Number.isNaN(eh) ||
    Number.isNaN(em)
  ) {
    return 30;
  }

  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const duration = end - start;
  return duration > 0 ? duration : 30;
};

const mapStatusToValue = (status: string): number => {
  switch (status.toLowerCase()) {
    case 'available':
      return 1;
    case 'booked':
      return 2;
    case 'cancelled':
      return 3;
    case 'completed':
      return 4;
    case 'noshow':
      return 5;
    case 'reserved':
      return 6;
    case 'blocked':
      return 7;
    default:
      return 1;
  }
};

const mapSlotToScheduleList = (
  slot: AppointmentSlotListDto
): ScheduleListDto => ({
  id: slot.id,
  ophthalmologistId: slot.ophthalId ?? '',
  organisationId: slot.orgId,
  date: slot.date,
  startTime: slot.startTime,
  endTime: slot.endTime,
  status: mapStatusToValue(slot.status),
  statusName: slot.status,
  slotType: 1,
  slotTypeName: 'Consultation',
  cost: slot.cost,
  createdAt: slot.createdAt,
});

const mapSlotToScheduleDetail = (slot: AppointmentSlotDto): ScheduleDto => ({
  id: slot.id,
  ophthalmologistId: slot.ophthalId ?? '',
  ophthalmologistName: null,
  organisationId: slot.orgId,
  organisationName: null,
  date: slot.date,
  startTime: slot.startTime,
  endTime: slot.endTime,
  status: mapStatusToValue(slot.status),
  statusName: slot.status,
  slotType: 1,
  slotTypeName: 'Consultation',
  cost: slot.cost,
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
});

// ============ QUERIES ============

/** GET /api/appointment-slots?ophthalId=:ophId */
export const getSchedules = async (
  params: GetSchedulesParams
): Promise<PagedResult<ScheduleListDto>> => {
  const { ophthalmologistId, ...queryParams } = params;
  const response = await api.get<
    ApiResponse<PagedResult<AppointmentSlotListDto>>
  >(API_ENDPOINTS.APPOINTMENT_SLOTS.LIST, {
    params: {
      ...queryParams,
      ophthalId: ophthalmologistId,
    },
  });

  const data = unwrapApiData<PagedResult<AppointmentSlotListDto>>(
    response.data
  );
  return {
    ...data,
    items: data.items.map(mapSlotToScheduleList),
  };
};

/** GET /api/appointment-slots/:slotId */
export const getSchedule = async (
  _ophthalmologistId: string,
  scheduleId: string
): Promise<ScheduleDto> => {
  const response = await api.get<ApiResponse<AppointmentSlotDto>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.DETAIL(scheduleId)
  );

  return mapSlotToScheduleDetail(
    unwrapApiData<AppointmentSlotDto>(response.data)
  );
};

// ============ MUTATIONS ============

/** POST /api/appointment-slots */
export const createSchedule = async (
  ophthalmologistId: string,
  data: CreateScheduleRequest
): Promise<string> => {
  // Creating a slot requires an existing template on BE.
  const templateResponse = await api.get<
    ApiResponse<PagedResult<ScheduleTemplateListDto>>
  >(API_ENDPOINTS.SCHEDULE_TEMPLATES.LIST, {
    params: {
      ophthalId: ophthalmologistId,
      pageNumber: 1,
      pageSize: 1,
    },
  });

  const templateData = unwrapApiData<PagedResult<ScheduleTemplateListDto>>(
    templateResponse.data
  );
  let template = templateData.items[0];

  // If no template exists, create a minimal one from the requested slot info.
  if (!template) {
    const createTemplateResponse = await api.post<
      ApiResponse<CreateScheduleTemplateResponse | string>
    >(API_ENDPOINTS.SCHEDULE_TEMPLATES.CREATE, {
      ophthalId: ophthalmologistId,
      dayOfWeek: toDayOfWeek(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: calcSlotDurationMinutes(data.startTime, data.endTime),
      maxCapacity: 1,
    });

    const createTemplateData = unwrapApiData<
      CreateScheduleTemplateResponse | string
    >(createTemplateResponse.data);
    const templateId =
      typeof createTemplateData === 'string'
        ? createTemplateData
        : createTemplateData.id;

    if (!templateId) {
      throw new Error('Failed to create schedule template automatically.');
    }

    template = { id: templateId };
  }

  const response = await api.post<ApiResponse<string>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.LIST,
    {
      scheduleTemplateId: template.id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      cost: data.cost,
    }
  );
  return unwrapApiData<string>(response.data);
};

/** PATCH /api/appointment-slots/:slotId/status */
export const updateScheduleStatus = async (
  _ophthalmologistId: string,
  scheduleId: string,
  data: UpdateScheduleStatusRequest
): Promise<boolean> => {
  const response = await api.patch<ApiResponse<boolean>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.UPDATE_STATUS(scheduleId),
    data
  );
  return unwrapApiData<boolean>(response.data);
};
