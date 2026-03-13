import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { PATIENT_ENDPOINTS } from './patient.api';
import type { ApiResponse, PagedResult } from '../types';
import type {
  ClinicAppointmentDto,
  ClinicAppointmentStatus,
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
  CreateClinicAppointmentResult,
  OrganisationAvailableSlotDto,
  OrganisationSummaryDto,
} from '../types/clinic-booking.types';
import type { AxiosError } from 'axios';

interface PatientSearchOrganisationItem {
  id: string;
  name: string;
  address?: string | null;
  orgType?: string | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  ownerAvatarUrl?: string | null;
}

const ORGANISATION_AVATAR_FALLBACK = import.meta.env.VITE_AVATAR_FALLBACK_URL;

const getOrganisationAvatarUrl = (name: string): string =>
  `${ORGANISATION_AVATAR_FALLBACK}${encodeURIComponent(name || 'ORG')}`;

interface PatientSearchSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  cost?: number | null;
}

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
  const response = await api.get<
    ApiResponse<PagedResult<PatientSearchOrganisationItem>>
  >(PATIENT_ENDPOINTS.SEARCH.ORGANISATIONS, {
    params: {
      pageNumber: 1,
      pageSize: 100,
    },
  });

  const organisations = response.data.data?.items ?? [];

  return organisations.map((item) => {
    return {
      id: item.id,
      name: item.name,
      address: item.address ?? null,
      city: null,
      phone: null,
      orgType: item.orgType ?? null,
      ratingAverage: item.ratingAverage ?? null,
      ratingCount: item.ratingCount ?? null,
      avatarUrl: item.ownerAvatarUrl ?? getOrganisationAvatarUrl(item.name),
    };
  });
};

export const getOrganisationAvailableSlots = async (
  organisationId: string,
  date?: string
): Promise<OrganisationAvailableSlotDto[]> => {
  const response = await api.get<
    ApiResponse<PagedResult<PatientSearchSlotItem>>
  >(PATIENT_ENDPOINTS.SEARCH.AVAILABLE_SLOTS, {
    params: {
      organisationId,
      fromDate: date,
      toDate: date,
      pageNumber: 1,
      pageSize: 100,
    },
  });

  return (response.data.data?.items ?? []).map((slot) => ({
    slotId: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    maxCapacity: slot.maxCapacity,
    bookedCount: slot.bookedCount,
    remaining: slot.availableCapacity,
    cost: slot.cost ?? null,
  }));
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
  try {
    const response = await api.get<ClinicAppointmentDto[]>(
      API_ENDPOINTS.CLINIC_BOOKING.PATIENT_CLINIC_APPOINTMENTS(patientId)
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError | undefined;
    const status = axiosError?.response?.status;
    if (status === 404 || status === 503) {
      console.warn(
        'getPatientClinicAppointments: falling back to empty list due to API unavailability',
        { patientId, status }
      );
      return [];
    }
    console.error(
      'getPatientClinicAppointments: unexpected error while fetching appointments',
      error
    );
    throw error;
  }
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
