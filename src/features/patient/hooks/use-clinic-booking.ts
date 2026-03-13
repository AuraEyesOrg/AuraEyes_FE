import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelClinicAppointment,
  checkInClinicAppointment,
  completeClinicAppointment,
  createClinicAppointment,
  getOrganisationAppointments,
  getOrganisationAvailableSlots,
  getOrganisations,
  getPatientClinicAppointments,
  markNoShowClinicAppointment,
  startClinicAppointment,
} from '../api/clinic-booking.api';
import type {
  CompleteClinicAppointmentRequest,
  CreateClinicAppointmentRequest,
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
  patientAppointments: (patientId: string) =>
    [...clinicBookingKeys.all, 'patient-appointments', patientId] as const,
  organisationAppointments: (organisationId: string, date?: string) =>
    [
      ...clinicBookingKeys.all,
      'organisation-appointments',
      organisationId,
      date,
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
  enabled = true
) =>
  useQuery({
    queryKey: clinicBookingKeys.patientAppointments(patientId),
    queryFn: () => getPatientClinicAppointments(patientId),
    enabled: enabled && !!patientId,
    staleTime: 15_000,
  });

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
