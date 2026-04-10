import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationClinicAppointmentDto {
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
    | 'Completed'
    | 'Cancelled'
    | 'NoShow';
  createdAt?: string;
}

export const getOrganisationAppointments = async (
  organisationId: string,
  date?: string
): Promise<OrganisationClinicAppointmentDto[]> => {
  const response = await api.get<
    ApiResponse<OrganisationClinicAppointmentDto[]>
  >(API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(organisationId), {
    params: { date },
  });

  return (
    unwrapApiData<OrganisationClinicAppointmentDto[] | undefined>(
      response.data
    ) ?? []
  );
};

export const checkInClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.CHECK_IN(appointmentId));
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
