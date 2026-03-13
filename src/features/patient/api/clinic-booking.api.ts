import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ClinicAppointmentDto,
  ClinicAppointmentStatus,
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
  CreateClinicAppointmentResult,
  OrganisationAvailableSlotDto,
  OrganisationSummaryDto,
} from '../types/clinic-booking.types';

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

interface AppointmentSlotListDto {
  id: string;
  orgId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const mapSlotStatusToClinicStatus = (
  status: string
): ClinicAppointmentStatus => {
  switch (status) {
    case 'Booked':
      return 'Confirmed';
    case 'Completed':
      return 'Completed';
    case 'Cancelled':
      return 'Cancelled';
    case 'NoShow':
      return 'NoShow';
    default:
      return 'Confirmed';
  }
};

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
  const params: Record<string, string | number> = {
    orgId: organisationId,
    pageNumber: 1,
    pageSize: 200,
  };

  if (date) {
    params.fromDate = date;
    params.toDate = date;
  }

  const response = await api.get<
    ApiResponse<PagedResult<AppointmentSlotListDto>>
  >(API_ENDPOINTS.APPOINTMENT_SLOTS.LIST, { params });

  return response.data.data.items.map((slot) => ({
    id: slot.id,
    patientId: 'N/A',
    organisationId: slot.orgId ?? organisationId,
    slotId: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    visitReason: null,
    status: mapSlotStatusToClinicStatus(slot.status),
  }));
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
