/**
 * Appointment Slot Booking API
 * Handles patient booking flow: reserve, confirm, release slots
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
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

// ============ APPOINTMENT SLOTS API ============

/** Get available appointment slots with filters */
export const getAppointmentSlots = async (
  params: GetAppointmentSlotsParams = {}
): Promise<PagedResult<AppointmentSlotDto>> => {
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

  const response = await api.get<PagedResult<AppointmentSlotDto>>(url);
  return response.data;
};

/** Get a single appointment slot by ID */
export const getAppointmentSlot = async (
  slotId: string
): Promise<AppointmentSlotDto> => {
  const response = await api.get<AppointmentSlotDto>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.DETAIL(slotId)
  );
  return response.data;
};

/** Reserve a slot (locks it for 5 minutes) */
export const reserveSlot = async (
  slotId: string,
  request: ReserveSlotRequest
): Promise<SlotReservationResult> => {
  const response = await api.post<SlotReservationResult>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.RESERVE(slotId),
    request
  );
  return response.data;
};

/** Confirm reservation (complete booking) */
export const confirmReservation = async (
  slotId: string,
  request: ConfirmReservationRequest
): Promise<BookingConfirmationResult> => {
  const response = await api.post<BookingConfirmationResult>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.CONFIRM(slotId),
    request
  );
  return response.data;
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
  const response = await api.post<number>(
    API_ENDPOINTS.APPOINTMENT_SLOTS.GENERATE,
    request
  );
  return response.data;
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
  const response = await api.get<ScheduleTemplateDto[]>(url);
  return response.data;
};

/** Create a schedule template */
export const createScheduleTemplate = async (
  request: CreateScheduleTemplateRequest
): Promise<ScheduleTemplateDto> => {
  const response = await api.post<ScheduleTemplateDto>(
    API_ENDPOINTS.SCHEDULE_TEMPLATES.CREATE,
    request
  );
  return response.data;
};

/** Delete a schedule template */
export const deleteScheduleTemplate = async (
  templateId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.SCHEDULE_TEMPLATES.DELETE(templateId));
};
