/**
 * Appointment Slot Booking API
 * Handles patient booking flow: reserve, confirm, release slots
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
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
} from '@/types/schedule';
import type { PagedResult } from '@/features/patient/types';

interface ApiResponseEnvelope<T> {
  success?: boolean;
  succeeded?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

const unwrapApiData = <T>(payload: T | ApiResponseEnvelope<T>): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as ApiResponseEnvelope<T>).data as T;
  }

  return payload as T;
};

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
  if (params.pageNumber)
    searchParams.set('pageNumber', params.pageNumber.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_ENDPOINTS.APPOINTMENT_SLOTS.LIST}?${queryString}`
    : API_ENDPOINTS.APPOINTMENT_SLOTS.LIST;

  const response =
    await api.get<ApiResponseEnvelope<PagedResult<AppointmentSlotListDto>>>(
      url
    );
  return unwrapApiData<PagedResult<AppointmentSlotListDto>>(response.data);
};

/** Get a single appointment slot by ID */
export const getAppointmentSlot = async (
  slotId: string
): Promise<AppointmentSlotDto> => {
  const response = await api.get<ApiResponseEnvelope<AppointmentSlotDto>>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.DETAIL(slotId)
  );
  return unwrapApiData<AppointmentSlotDto>(response.data);
};

/** Reserve a slot (locks it for 5 minutes) */
export const reserveSlot = async (
  slotId: string,
  request: ReserveSlotRequest
): Promise<SlotReservationResult> => {
  const response = await api.post<ApiResponseEnvelope<SlotReservationResult>>(
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
  const response = await api.post<
    ApiResponseEnvelope<BookingConfirmationResult>
  >(API_ENDPOINTS.APPOINTMENT_SLOTS.CONFIRM(slotId), request);
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
  const response = await api.post<ApiResponseEnvelope<number>>(
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

// ============ SCHEDULE TEMPLATES API ============

/** Get schedule templates for a doctor */
export const getScheduleTemplates = async (
  ophthalId?: string
): Promise<ScheduleTemplateDto[]> => {
  const url = ophthalId
    ? API_ENDPOINTS.SCHEDULE_TEMPLATES.BY_DOCTOR(ophthalId)
    : API_ENDPOINTS.SCHEDULE_TEMPLATES.LIST;
  const response =
    await api.get<ApiResponseEnvelope<ScheduleTemplateDto[]>>(url);
  return unwrapApiData<ScheduleTemplateDto[]>(response.data);
};

/** Create a schedule template */
export const createScheduleTemplate = async (
  request: CreateScheduleTemplateRequest
): Promise<ScheduleTemplateDto> => {
  const response = await api.post<ApiResponseEnvelope<ScheduleTemplateDto>>(
    API_ENDPOINTS.SCHEDULE_TEMPLATES.CREATE,
    request
  );
  return unwrapApiData<ScheduleTemplateDto>(response.data);
};

/** Delete a schedule template */
export const deleteScheduleTemplate = async (
  templateId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.SCHEDULE_TEMPLATES.DELETE(templateId));
};
