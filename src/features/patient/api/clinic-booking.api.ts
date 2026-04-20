import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { PATIENT_ENDPOINTS } from './patient.api';
import type {
  ApiResponse as PatientApiResponse,
  PagedResult as PatientPagedResult,
} from '../types';
import type {
  ClinicAppointmentDto,
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
  CreateClinicAppointmentResult,
  OrganisationAvailableSlotDto,
  OrganisationSummaryDto,
  PatientClinicAppointmentsQuery,
} from '../types/clinic-booking.types';

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

export const getOrganisations = async (): Promise<OrganisationSummaryDto[]> => {
  const response = await api.get<
    PatientApiResponse<PatientPagedResult<PatientSearchOrganisationItem>>
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
    PatientApiResponse<OrganisationAvailableSlotDto[]>
  >(API_ENDPOINTS.CLINIC_BOOKING.AVAILABLE_SLOTS(organisationId), {
    params: {
      date,
    },
  });

  return response.data.data ?? [];
};

export const createClinicAppointment = async (
  request: CreateClinicAppointmentRequest
): Promise<CreateClinicAppointmentResult> => {
  const response = await api.post<
    PatientApiResponse<CreateClinicAppointmentResult>
  >(API_ENDPOINTS.CLINIC_APPOINTMENTS.CREATE, request);

  if (!response.data.data) {
    throw new Error('Create clinic appointment returned empty payload.');
  }

  return response.data.data;
};

export const cancelClinicAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.CLINIC_APPOINTMENTS.CANCEL(appointmentId));
};

const DEFAULT_PATIENT_CLINIC_PAGE_SIZE = 10;

const EMPTY_PATIENT_CLINIC_PAGE: PatientPagedResult<ClinicAppointmentDto> = {
  items: [],
  pageNumber: 1,
  pageSize: DEFAULT_PATIENT_CLINIC_PAGE_SIZE,
  totalPages: 0,
  totalCount: 0,
  hasPrevious: false,
  hasNext: false,
};

export const getPatientClinicAppointments = async (
  patientId: string,
  query: PatientClinicAppointmentsQuery = {}
): Promise<PatientPagedResult<ClinicAppointmentDto>> => {
  const response = await api.get<
    PatientApiResponse<PatientPagedResult<ClinicAppointmentDto>>
  >(API_ENDPOINTS.CLINIC_BOOKING.PATIENT_CLINIC_APPOINTMENTS(patientId), {
    params: {
      tab: query.tab ?? 'All',
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? DEFAULT_PATIENT_CLINIC_PAGE_SIZE,
    },
  });

  return response.data.data ?? EMPTY_PATIENT_CLINIC_PAGE;
};

export const getOrganisationAppointments = async (
  organisationId: string,
  date?: string
): Promise<ClinicAppointmentDto[]> => {
  const response = await api.get<PatientApiResponse<ClinicAppointmentDto[]>>(
    API_ENDPOINTS.CLINIC_BOOKING.ORGANISATION_APPOINTMENTS(organisationId),
    {
      params: {
        date,
      },
    }
  );

  return response.data.data ?? [];
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
