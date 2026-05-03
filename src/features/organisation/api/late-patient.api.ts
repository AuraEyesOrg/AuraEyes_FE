import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface LateArrivalCheckResult {
  isLate: boolean;
  lateMinutes: number;
  thresholdMinutes: number;
  currentSlotId: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  slotDurationMinutes: number;
  availableSlots: AvailableSlotOption[];
  adHocDefaults: {
    suggestedStartTime: string;
    durationMinutes: number;
    defaultCapacity: number;
    defaultCost: number | null;
  };
}

export interface AvailableSlotOption {
  slotId: string;
  startTime: string;
  endTime: string;
  remainingCapacity: number;
  cost: number | null;
}

export interface RebookExistingPayload {
  slotId: string;
}

export interface RebookExistingResult {
  newAppointmentId: string;
  newSlotId: string;
}

export interface RebookAdHocPayload {
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  cost?: number | null;
  doctorId?: string | null;
}

export interface RebookAdHocResult {
  newAppointmentId: string;
  newSlotId: string;
}

export interface CancelLateDiscountResult {
  cancelledAppointmentId: string;
  discountRate: number;
  discountExpiryDate: string;
}

export interface AvailableDoctorDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export async function checkLateArrival(
  appointmentId: string
): Promise<LateArrivalCheckResult> {
  const response = await api.get<ApiResponse<LateArrivalCheckResult>>(
    `/clinic-appointments/${appointmentId}/late-arrival-check`
  );
  return unwrapApiData(response.data);
}

export async function rebookToExistingSlot(
  appointmentId: string,
  payload: RebookExistingPayload
): Promise<RebookExistingResult> {
  const response = await api.post<ApiResponse<RebookExistingResult>>(
    `/clinic-appointments/${appointmentId}/rebook-existing`,
    payload
  );
  return unwrapApiData(response.data);
}

export async function rebookToAdHocSlot(
  appointmentId: string,
  payload: RebookAdHocPayload
): Promise<RebookAdHocResult> {
  const response = await api.post<ApiResponse<RebookAdHocResult>>(
    `/clinic-appointments/${appointmentId}/rebook-adhoc`,
    payload
  );
  return unwrapApiData(response.data);
}

export async function cancelLateAndGrantDiscount(
  appointmentId: string
): Promise<CancelLateDiscountResult> {
  const response = await api.post<ApiResponse<CancelLateDiscountResult>>(
    `/clinic-appointments/${appointmentId}/cancel-late-discount`
  );
  return unwrapApiData(response.data);
}

export async function getAvailableDoctorsForSlot(
  date: string,
  startTime: string,
  endTime: string
): Promise<AvailableDoctorDto[]> {
  const response = await api.get<ApiResponse<AvailableDoctorDto[]>>(
    '/ophthalmologists/available-for-slot',
    { params: { date, startTime, endTime } }
  );
  return unwrapApiData(response.data);
}
