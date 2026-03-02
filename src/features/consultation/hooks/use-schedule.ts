/**
 * React Query hooks for Ophthalmologist Schedules.
 * Uses TanStack Query v5 with proper query keys and cache invalidation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateScheduleStatus,
} from '../api/schedule.api';
import type {
  GetSchedulesParams,
  CreateScheduleRequest,
  UpdateScheduleStatusRequest,
} from '@/types/schedule';

// ============ QUERY KEYS ============

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: GetSchedulesParams) =>
    [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (ophId: string, scheduleId: string) =>
    [...scheduleKeys.details(), ophId, scheduleId] as const,
};

// ============ QUERIES ============

/** Fetch paginated schedules for an ophthalmologist */
export const useSchedules = (
  params: GetSchedulesParams,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => getSchedules(params),
    staleTime: 60_000, // 1 min - schedules change less frequently
    enabled: !!params.ophthalmologistId,
    ...options,
  });

/** Fetch a single schedule by ID */
export const useSchedule = (
  ophthalmologistId: string,
  scheduleId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: scheduleKeys.detail(ophthalmologistId, scheduleId),
    queryFn: () => getSchedule(ophthalmologistId, scheduleId),
    staleTime: 30_000,
    enabled: !!ophthalmologistId && !!scheduleId,
    ...options,
  });

// ============ MUTATIONS ============

/** Create a new schedule slot */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ophthalmologistId,
      ...data
    }: CreateScheduleRequest & { ophthalmologistId: string }) =>
      createSchedule(ophthalmologistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
};

/** Update schedule status (book, cancel, complete, no-show) */
export const useUpdateScheduleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ophthalmologistId,
      scheduleId,
      ...data
    }: UpdateScheduleStatusRequest & {
      ophthalmologistId: string;
      scheduleId: string;
    }) => updateScheduleStatus(ophthalmologistId, scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.details() });
    },
  });
};
