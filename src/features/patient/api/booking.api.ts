/**
 * Appointment Slot Booking API
 * Handles patient booking flow: reserve, confirm, release slots
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';
import type {
  AppointmentSlotListDto,
  AppointmentSlotDto,
  SlotReservationResult,
  BookingConfirmationResult,
  ReserveSlotRequest,
  ConfirmReservationRequest,
  ReleaseReservationRequest,
  GetAppointmentSlotsParams,
  ScheduleTemplateDto,
  CreateScheduleTemplateRequest,
  GenerateSlotsRequest,
  BlockSlotRequest,
  UnblockSlotRequest,
  AllowedPriceRangeDto,
} from '@/types/schedule';
import type { PagedResult } from '@/features/patient/types';

type BackendScheduleTemplateDto = {
  id: string;
  orgId?: string | null;
  ophthalId?: string | null;
  dayOfWeek?: string | number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxCapacity: number;
  cost?: number | null;
  createdAt: string;
};

const dayOfWeekToNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value) return 1;

  const normalized = value.toString().trim().toLowerCase();
  const map: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  if (normalized in map) return map[normalized];

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 1;
};

const normalizeScheduleTemplate = (
  template: BackendScheduleTemplateDto
): ScheduleTemplateDto => ({
  id: template.id,
  ophthalmologistId: template.ophthalId ?? '',
  organisationId: template.ophthalId ? null : (template.orgId ?? null),
  dayOfWeek: dayOfWeekToNumber(template.dayOfWeek),
  startTime: template.startTime,
  endTime: template.endTime,
  slotDuration: template.slotDuration,
  slotType: 1,
  slotTypeName: 'Consultation',
  cost: template.cost ?? 0,
  maxCapacity: template.maxCapacity,
  isActive: true,
  createdAt: template.createdAt,
});

// ============ APPOINTMENT SLOTS API ============

/** Get available appointment slots with filters */
export const getAppointmentSlots = async (
  params: GetAppointmentSlotsParams = {}
): Promise<PagedResult<AppointmentSlotListDto>> => {
  const searchParams = new URLSearchParams();

  if (params.ophthalId) searchParams.set('ophthalId', params.ophthalId);
  if (params.status !== undefined)
    searchParams.set('status', params.status.toString());
  if (params.slotType !== undefined)
    searchParams.set('slotType', params.slotType.toString());
  if (params.fromDate) searchParams.set('fromDate', params.fromDate);
  if (params.toDate) searchParams.set('toDate', params.toDate);
  if (params.excludePastSlots !== undefined)
    searchParams.set('excludePastSlots', String(params.excludePastSlots));
  if (params.pageNumber)
    searchParams.set('pageNumber', params.pageNumber.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_ENDPOINTS.APPOINTMENT_SLOTS.LIST}?${queryString}`
    : API_ENDPOINTS.APPOINTMENT_SLOTS.LIST;

  const response =
    await api.get<ApiResponse<PagedResult<AppointmentSlotListDto>>>(url);
  return unwrapApiData<PagedResult<AppointmentSlotListDto>>(response.data);
};

/** Get a single appointment slot by ID */
export const getAppointmentSlot = async (
  slotId: string
): Promise<AppointmentSlotDto> => {
  const response = await api.get<ApiResponse<AppointmentSlotDto>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.DETAIL(slotId)
  );
  return unwrapApiData<AppointmentSlotDto>(response.data);
};

/** Reserve a slot (locks it for 5 minutes) */
export const reserveSlot = async (
  slotId: string,
  request: ReserveSlotRequest
): Promise<SlotReservationResult> => {
  const response = await api.post<ApiResponse<SlotReservationResult>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.RESERVE(slotId),
    request
  );
  return unwrapApiData<SlotReservationResult>(response.data);
};

/** Confirm reservation (complete booking) */
export const confirmReservation = async (
  slotId: string,
  request: ConfirmReservationRequest
): Promise<BookingConfirmationResult> => {
  const response = await api.post<ApiResponse<BookingConfirmationResult>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.CONFIRM(slotId),
    request
  );
  return unwrapApiData<BookingConfirmationResult>(response.data);
};

/** Release a reservation (cancel reservation) */
export const releaseReservation = async (
  slotId: string,
  request: ReleaseReservationRequest
): Promise<void> => {
  await api.post(API_ENDPOINTS.APPOINTMENT_SLOTS.RELEASE(slotId), request);
};

// ============ DOCTOR SLOT MANAGEMENT API ============

/** Generate slots from a schedule template */
export const generateSlots = async (
  request: GenerateSlotsRequest
): Promise<number> => {
  const response = await api.post<ApiResponse<number>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.GENERATE,
    request
  );
  return unwrapApiData<number>(response.data);
};

/** Block a slot */
export const blockSlot = async (
  slotId: string,
  request: BlockSlotRequest
): Promise<void> => {
  await api.post(API_ENDPOINTS.APPOINTMENT_SLOTS.BLOCK(slotId), request);
};

/** Unblock a slot */
export const unblockSlot = async (
  slotId: string,
  request: UnblockSlotRequest
): Promise<void> => {
  await api.post(API_ENDPOINTS.APPOINTMENT_SLOTS.UNBLOCK(slotId), request);
};

/** Get allowed pricing range for a doctor based on years of experience */
export const getAllowedPriceRange = async (
  ophthalId: string
): Promise<AllowedPriceRangeDto> => {
  const response = await api.get<ApiResponse<AllowedPriceRangeDto>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.PRICING_RANGE(ophthalId)
  );

  return unwrapApiData<AllowedPriceRangeDto>(response.data);
};

// ============ SCHEDULE TEMPLATES API ============

/** Get schedule templates for a doctor */
export const getScheduleTemplates = async (
  ophthalId?: string
): Promise<ScheduleTemplateDto[]> => {
  const url = ophthalId
    ? API_ENDPOINTS.SCHEDULE_TEMPLATES.BY_DOCTOR(ophthalId)
    : API_ENDPOINTS.SCHEDULE_TEMPLATES.LIST;
  const response =
    await api.get<
      ApiResponse<
        | BackendScheduleTemplateDto[]
        | { items?: BackendScheduleTemplateDto[] | null }
        | null
        | undefined
      >
    >(url);

  const data = unwrapApiData<
    | BackendScheduleTemplateDto[]
    | { items?: BackendScheduleTemplateDto[] | null }
    | null
    | undefined
  >(response.data);

  if (Array.isArray(data)) {
    return data.map(normalizeScheduleTemplate);
  }

  if (data && typeof data === 'object' && 'items' in data) {
    return (data.items ?? []).map(normalizeScheduleTemplate);
  }

  return [];
};

/** Create a schedule template */
export const createScheduleTemplate = async (
  request: CreateScheduleTemplateRequest
): Promise<ScheduleTemplateDto> => {
  const payload = {
    orgId: request.ophthalId ? null : (request.organisationId ?? null),
    ophthalId: request.ophthalId,
    dayOfWeek: request.dayOfWeek,
    startTime: request.startTime,
    endTime: request.endTime,
    slotDuration: request.slotDuration,
    maxCapacity: request.maxCapacity,
    cost: request.cost,
  };

  const response = await api.post<ApiResponse<ScheduleTemplateDto>>(
    API_ENDPOINTS.SCHEDULE_TEMPLATES.CREATE,
    payload
  );
  return unwrapApiData<ScheduleTemplateDto>(response.data);
};

/** Delete a schedule template */
export const deleteScheduleTemplate = async (
  templateId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.SCHEDULE_TEMPLATES.DELETE(templateId));
};
