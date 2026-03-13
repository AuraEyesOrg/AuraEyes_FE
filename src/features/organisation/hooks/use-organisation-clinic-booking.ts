import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkInClinicAppointment,
  completeClinicAppointment,
  getOrganisationAppointments,
  markNoShowClinicAppointment,
  startClinicAppointment,
} from '../api/organisation-clinic-booking.api';

export const organisationClinicBookingKeys = {
  all: ['organisation-clinic-booking'] as const,
  appointments: (organisationId: string, date?: string) =>
    [
      ...organisationClinicBookingKeys.all,
      'appointments',
      organisationId,
      date,
    ] as const,
};

export const useOrganisationAppointments = (
  organisationId: string,
  date?: string,
  enabled = true
) =>
  useQuery({
    queryKey: organisationClinicBookingKeys.appointments(organisationId, date),
    queryFn: () => getOrganisationAppointments(organisationId, date),
    enabled: enabled && !!organisationId,
    staleTime: 10_000,
  });

export const useCheckInClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      checkInClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
    },
  });
};

export const useStartClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      startClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
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
      request?: { notes?: string };
    }) => completeClinicAppointment(appointmentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
    },
  });
};

export const useMarkNoShowClinicAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      markNoShowClinicAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
    },
  });
};
