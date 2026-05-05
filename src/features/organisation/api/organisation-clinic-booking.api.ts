import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationClinicAppointmentDto {
  id: string;
  patientId: string;
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  isWalkIn?: boolean;
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
  /** PatientVisit status when a visit exists */
  visitStatus?: string | null;
  /** Unified clinic pipeline step (matches queue flowState) */
  flowState?:
    | 'CheckedIn'
    | 'ScreeningPending'
    | 'AICompleted'
    | 'SentToDoctor'
    | 'ConsultationInProgress'
    | 'Finalized'
    | string;
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
  // New fields for doctor info
  ophthalId?: string;
  ophthalFullName?: string | null;
  ophthalAvatarUrl?: string | null;
}

export interface DoctorSlotDetailDto {
  slotId: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string | null;
  isBooked: boolean;
  price: number;
  bio?: string | null;
  ratingAverage: number;
  ratingCount: number;
}

export interface AggregatedSlotDto {
  date: string;
  startTime: string;
  endTime: string;
  doctors: DoctorSlotDetailDto[];
  totalMaxCapacity: number;
  totalBookedCount: number;
  isAvailable: boolean;
}

export interface ClinicScheduleDto {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  ratingAverage: number;
  ratingCount: number;
  aggregatedSlots: AggregatedSlotDto[];
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

  const data = unwrapApiData<any>(response.data);
  const items = Array.isArray(data) ? data : (data.items ?? []);

  return items.map((item: any) => ({
    id: item.slotId ?? item.id,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status ?? 'Available',
    maxCapacity: item.maxCapacity,
    bookedCount: item.bookedCount ?? item.maxCapacity - (item.remaining ?? 0),
    availableCapacity: item.remaining ?? item.availableCapacity ?? 0,
    cost: item.cost,
    ophthalId: item.ophthalId,
    ophthalFullName: item.ophthalFullName,
    ophthalAvatarUrl: item.ophthalAvatarUrl,
  }));
};

export const getClinicSchedule = async (
  fromDate?: string,
  toDate?: string
): Promise<ClinicScheduleDto> => {
  const response = await api.get<ApiResponse<ClinicScheduleDto>>(
    API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_SCHEDULE(),
    {
      params: { fromDate, toDate },
    }
  );

  return unwrapApiData<ClinicScheduleDto>(response.data);
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
