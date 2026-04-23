import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { walletKeys } from './use-wallet';
import {
  cancelClinicAppointment,
  checkInClinicAppointment,
  completeClinicAppointment,
  createClinicAppointment,
  getOrganisationAppointments,
  getOrganisationAvailableSlots,
  getOrganisationSchedule,
  getOrganisations,
  getPatientClinicAppointments,
  markNoShowClinicAppointment,
  startClinicAppointment,
} from '../api/clinic-booking.api';
import type {
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
  PatientAppointmentTab,
  PatientClinicAppointmentsQuery,
} from '../types/clinic-booking.types';

export const clinicBookingKeys = {
  all: ['clinic-booking'] as const,
  organisations: () => [...clinicBookingKeys.all, 'organisations'] as const,
  availableSlots: (organisationId: string, date?: string) =>
    [
      ...clinicBookingKeys.all,
      'available-slots',
      organisationId,
      date,
    ] as const,
  patientAppointments: (
    patientId: string,
    query: PatientClinicAppointmentsQuery = {}
  ) =>
    [
      ...clinicBookingKeys.all,
      'patient-appointments',
      patientId,
      query.tab ?? 'All',
      query.pageNumber ?? 1,
      query.pageSize ?? 10,
    ] as const,
  organisationAppointments: (organisationId: string, date?: string) =>
    [
      ...clinicBookingKeys.all,
      'organisation-appointments',
      organisationId,
      date,
    ] as const,
  organisationSchedule: (
    organisationId: string,
    params?: { fromDate?: string; toDate?: string }
  ) =>
    [
      ...clinicBookingKeys.all,
      'organisation-schedule',
      organisationId,
      params?.fromDate,
      params?.toDate,
    ] as const,
};

export const useOrganisations = () =>
  useQuery({
    queryKey: clinicBookingKeys.organisations(),
    queryFn: getOrganisations,
    staleTime: 60_000,
  });

export const useOrganisationAvailableSlots = (
  organisationId: string,
  date?: string,
  enabled = true
) =>
  useQuery({
    queryKey: clinicBookingKeys.availableSlots(organisationId, date),
    queryFn: () => getOrganisationAvailableSlots(organisationId, date),
    enabled: enabled && !!organisationId,
    staleTime: 15_000,
  });

export const usePatientClinicAppointments = (
  patientId: string,
  query: PatientClinicAppointmentsQuery = {},
  enabled = true
) =>
  useQuery({
    queryKey: clinicBookingKeys.patientAppointments(patientId, query),
    queryFn: () => getPatientClinicAppointments(patientId, query),
    enabled: enabled && !!patientId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

const CLINIC_TAB_COUNT_TABS: PatientAppointmentTab[] = [
  'All',
  'Upcoming',
  'Completed',
  'Cancelled',
];

export const usePatientClinicAppointmentCounts = (
  patientId: string,
  enabled = true
) => {
  const results = useQueries({
    queries: CLINIC_TAB_COUNT_TABS.map((tab) => ({
      queryKey: clinicBookingKeys.patientAppointments(patientId, {
        tab,
        pageNumber: 1,
        pageSize: 1,
      }),
      queryFn: () =>
        getPatientClinicAppointments(patientId, {
          tab,
          pageNumber: 1,
          pageSize: 1,
        }),
      enabled: enabled && !!patientId,
      staleTime: 15_000,
      placeholderData: keepPreviousData,
    })),
  });

  const counts = CLINIC_TAB_COUNT_TABS.reduce<
    Record<PatientAppointmentTab, number>
  >(
    (acc, tab, index) => {
      acc[tab] = results[index]?.data?.totalCount ?? 0;
      return acc;
    },
    { All: 0, Upcoming: 0, Completed: 0, Cancelled: 0 }
  );

  return {
    counts,
    isLoading: results.some((r) => r.isLoading),
  };
};

export const useOrganisationAppointments = (
  organisationId: string,
  date?: string,
  enabled = true
) =>
  useQuery({
    queryKey: clinicBookingKeys.organisationAppointments(organisationId, date),
    queryFn: () => getOrganisationAppointments(organisationId, date),
    enabled: enabled && !!organisationId,
    staleTime: 10_000,
  });

export const useOrganisationSchedule = (
  organisationId: string,
  params?: { fromDate?: string; toDate?: string },
  enabled = true
) =>
  useQuery({
    queryKey: clinicBookingKeys.organisationSchedule(organisationId, params),
    queryFn: () => getOrganisationSchedule(organisationId, params),
    enabled: enabled && !!organisationId,
    staleTime: 15_000,
  });

export const useCreateClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateClinicAppointmentRequest) =>
      createClinicAppointment(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
      queryClient.invalidateQueries({
        queryKey: clinicBookingKeys.availableSlots(variables.organisationId),
      });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};

export const useCancelClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      cancelClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
    },
  });
};

export const useCheckInClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      checkInClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
    },
  });
};

export const useStartClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      startClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
    },
  });
};

export const useCompleteClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      request,
    }: {
      appointmentId: string;
      request?: CompleteClinicAppointmentRequest;
    }) => completeClinicAppointment(appointmentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
    },
  });
};

export const useMarkNoShowClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      markNoShowClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicBookingKeys.all });
    },
  });
};
