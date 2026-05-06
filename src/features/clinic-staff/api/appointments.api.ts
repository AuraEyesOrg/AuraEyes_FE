import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface ClinicStaffAppointmentDto {
  id: string;
  patientId: string;
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  organisationId: string;
  organisationName?: string | null;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  visitReason?: string | null;
  status:
    | 'Pending'
    | 'Confirmed'
    | 'CheckedIn'
    | 'InProgress'
    | 'WaitingForPayment'
    | 'Completed'
    | 'Cancelled'
    | 'NoShow';
  createdAt?: string;
}

export const getClinicStaffAppointments = async (
  date?: string
): Promise<ClinicStaffAppointmentDto[]> => {
  const response = await api.get<ApiResponse<ClinicStaffAppointmentDto[]>>(
    API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(),
    { params: { date } }
  );

  return (
    unwrapApiData<ClinicStaffAppointmentDto[] | undefined>(response.data) ?? []
  );
};

export const checkInClinicAppointment = async (
  appointmentId: string,
  patientName?: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.CHECK_IN(appointmentId), {
    patientName,
  });
};

export const startClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.START(appointmentId));
};

export const completeClinicAppointment = async (
  appointmentId: string,
  request?: { notes?: string }
): Promise<void> => {
  await api.put(
    API_ENDPOINTS.CLINIC_APPOINTMENTS.COMPLETE(appointmentId),
    request
  );
};

export const markNoShowClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.NO_SHOW(appointmentId));
};
