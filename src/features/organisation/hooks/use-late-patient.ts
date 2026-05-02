import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkLateArrival,
  rebookToExistingSlot,
  rebookToAdHocSlot,
  getAvailableDoctorsForSlot,
} from '../api/late-patient.api';
import type {
  RebookExistingPayload,
  RebookAdHocPayload,
} from '../api/late-patient.api';
import { organisationClinicBookingKeys } from './use-organisation-clinic-booking';

export const latePatientKeys = {
  all: ['late-patient'] as const,
  check: (appointmentId: string) =>
    [...latePatientKeys.all, 'check', appointmentId] as const,
  availableDoctors: (date: string, startTime: string, endTime: string) =>
    [...latePatientKeys.all, 'doctors', date, startTime, endTime] as const,
};

export const useCheckLateArrival = (appointmentId: string, enabled = true) =>
  useQuery({
    queryKey: latePatientKeys.check(appointmentId),
    queryFn: () => checkLateArrival(appointmentId),
    enabled: enabled && !!appointmentId,
    staleTime: 0,
  });

export const useAvailableDoctorsForSlot = (
  date: string,
  startTime: string,
  endTime: string,
  enabled = true
) =>
  useQuery({
    queryKey: latePatientKeys.availableDoctors(date, startTime, endTime),
    queryFn: () => getAvailableDoctorsForSlot(date, startTime, endTime),
    enabled: enabled && !!date && !!startTime && !!endTime,
    staleTime: 15_000,
  });

export const useRebookToExistingSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: RebookExistingPayload;
    }) => rebookToExistingSlot(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
    },
  });
};

export const useRebookToAdHocSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: RebookAdHocPayload;
    }) => rebookToAdHocSlot(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationClinicBookingKeys.all,
      });
    },
  });
};
