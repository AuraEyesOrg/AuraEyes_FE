import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkInClinicAppointment,
  completeClinicAppointment,
  createClinicStaffAppointment,
  getClinicStaffAvailableSlots,
  getClinicSchedule,
  getOrganisationAppointments,
  markNoShowClinicAppointment,
  startClinicAppointment,
} from '../api/organisation-clinic-booking.api';
import type { CreateClinicStaffAppointmentRequest } from '../api/organisation-clinic-booking.api';

export const organisationClinicBookingKeys = {
  all: ['organisation-clinic-booking'] as const,
  appointments: (organisationId: string, date?: string) =>
    [
      ...organisationClinicBookingKeys.all,
      'appointments',
      organisationId,
      date,
    ] as const,
  availableSlots: (date?: string) =>
    [...organisationClinicBookingKeys.all, 'available-slots', date] as const,
  schedule: (fromDate?: string, toDate?: string) =>
    [
      ...organisationClinicBookingKeys.all,
      'schedule',
      fromDate,
      toDate,
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

export const useClinicStaffAvailableSlots = (date?: string, enabled = true) =>
  useQuery({
    queryKey: organisationClinicBookingKeys.availableSlots(date),
    queryFn: () => getClinicStaffAvailableSlots(date),
    enabled,
    staleTime: 15_000,
  });

export const useClinicSchedule = (
  fromDate?: string,
  toDate?: string,
  enabled = true
) =>
  useQuery({
    queryKey: organisationClinicBookingKeys.schedule(fromDate, toDate),
    queryFn: () => getClinicSchedule(fromDate, toDate),
    enabled,
    staleTime: 30_000,
  });

export const useCreateClinicStaffAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateClinicStaffAppointmentRequest) =>
      createClinicStaffAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ['clinic-queue'] });
    },
  });
};

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

export const useCompleteOrderPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      method = 'Cash',
      returnUrl,
      cancelUrl,
    }: {
      orderId: string;
      method?: 'Cash' | 'PayOS';
      returnUrl?: string;
      cancelUrl?: string;
    }) =>
      import('@/features/clinic-staff/api/billing.api').then((m) =>
        m.completeOrder(orderId, method, returnUrl, cancelUrl)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
      // Also invalidate billing/financial queries if they exist
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin', 'orders'] });
    },
  });
};
