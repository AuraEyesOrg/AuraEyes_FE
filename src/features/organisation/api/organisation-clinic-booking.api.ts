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
    | 'WaitingForPayment'
    | 'Completed'
    | 'Cancelled'
    | 'NoShow';
  createdAt?: string;
  ophthalId?: string;
  ophthalFullName?: string | null;
  ophthalAvatarUrl?: string | null;

  // Billing info
  orderId?: string;
  totalAmount?: number;
  depositAmount?: number;
  isPaidDeposit: boolean;
  paidAmount: number;
  remainingAmount: number | null;
  orderStatus: string | null;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface ClinicStaffAvailableSlotDto {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  cost?: number | null;
}

export interface CreateClinicStaffAppointmentRequest {
  patientId: string;
  slotId: string;
  visitReason?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateClinicStaffAppointmentResult {
  appointmentId: string;
  visitId?: string | null;
  status: string;
  paymentUrl?: string | null;
  orderId?: string | null;
  depositAmount?: number | null;
}

export const getOrganisationAppointments = async (
  _organisationId: string,
  date?: string
): Promise<OrganisationClinicAppointmentDto[]> => {
  const response = await api.get<
    ApiResponse<OrganisationClinicAppointmentDto[]>
  >(API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(), {
    params: { date },
  });

  return (
    unwrapApiData<OrganisationClinicAppointmentDto[] | undefined>(
      response.data
    ) ?? []
  );
};

export const getCurrentClinicAppointments = async (
  date?: string
): Promise<OrganisationClinicAppointmentDto[]> => {
  const response = await api.get<
    ApiResponse<OrganisationClinicAppointmentDto[]>
  >(API_ENDPOINTS.CLINIC_APPOINTMENTS.LIST, { params: { date } });

  return (
    unwrapApiData<OrganisationClinicAppointmentDto[] | undefined>(
      response.data
    ) ?? []
  );
};

export const getClinicStaffAvailableSlots = async (
  date?: string
): Promise<ClinicStaffAvailableSlotDto[]> => {
  const response = await api.get<
    ApiResponse<PagedResult<ClinicStaffAvailableSlotDto>>
  >(API_ENDPOINTS.CLINIC_BOOKING.AVAILABLE_SLOTS(), {
    params: {
      fromDate: date,
      toDate: date,
      pageNumber: 1,
      pageSize: 100,
    },
  });

  return unwrapApiData<PagedResult<ClinicStaffAvailableSlotDto>>(response.data)
    .items;
};

export const createClinicStaffAppointment = async (
  request: CreateClinicStaffAppointmentRequest
): Promise<CreateClinicStaffAppointmentResult> => {
  const response = await api.post<
    ApiResponse<CreateClinicStaffAppointmentResult>
  >(API_ENDPOINTS.CLINIC_APPOINTMENTS.CREATE, request);

  return unwrapApiData<CreateClinicStaffAppointmentResult>(response.data);
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
