import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  AssignDoctorRequest,
  ClinicAppointmentDto,
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
  CreateClinicAppointmentResult,
  OrganisationAvailableSlotDto,
  OrganisationSummaryDto,
} from '../types/clinic-booking.types';

export const getOrganisations = async (): Promise<OrganisationSummaryDto[]> => {
  const response = await api.get<OrganisationSummaryDto[]>(
    API_ENDPOINTS.CLINIC_BOOKING.ORGANISATIONS
  );
  return response.data;
};

export const getOrganisationAvailableSlots = async (
  organisationId: string,
  date?: string
): Promise<OrganisationAvailableSlotDto[]> => {
  const url = date
    ? `${API_ENDPOINTS.CLINIC_BOOKING.AVAILABLE_SLOTS(organisationId)}?date=${date}`
    : API_ENDPOINTS.CLINIC_BOOKING.AVAILABLE_SLOTS(organisationId);

  const response = await api.get<OrganisationAvailableSlotDto[]>(url);
  return response.data;
};

export const createClinicAppointment = async (
  request: CreateClinicAppointmentRequest
): Promise<CreateClinicAppointmentResult> => {
  const response = await api.post<CreateClinicAppointmentResult>(
    API_ENDPOINTS.CLINIC_APPOINTMENTS.CREATE,
    request
  );
  return response.data;
};

export const cancelClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.CLINIC_APPOINTMENTS.CANCEL(appointmentId));
};

export const getPatientClinicAppointments = async (
  patientId: string
): Promise<ClinicAppointmentDto[]> => {
  const response = await api.get<ClinicAppointmentDto[]>(
    API_ENDPOINTS.CLINIC_BOOKING.PATIENT_CLINIC_APPOINTMENTS(patientId)
  );
  return response.data;
};

export const getOrganisationAppointments = async (
  organisationId: string,
  date?: string
): Promise<ClinicAppointmentDto[]> => {
  const url = date
    ? `${API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(organisationId)}?date=${date}`
    : API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(organisationId);

  const response = await api.get<ClinicAppointmentDto[]>(url);
  return response.data;
};

export const checkInClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.CHECK_IN(appointmentId));
};

export const assignDoctorClinicAppointment = async (
  appointmentId: string,
  request: AssignDoctorRequest
): Promise<void> => {
  await api.put(
    API_ENDPOINTS.CLINIC_APPOINTMENTS.ASSIGN_DOCTOR(appointmentId),
    request
  );
};

export const startClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.put(API_ENDPOINTS.CLINIC_APPOINTMENTS.START(appointmentId));
};

export const completeClinicAppointment = async (
  appointmentId: string,
  request?: CompleteClinicAppointmentRequest
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
