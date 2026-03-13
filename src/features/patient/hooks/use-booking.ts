/**
 * React Query hooks for Appointment Slot Booking.
 * Handles patient booking flow and doctor slot management.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  getAppointmentSlots,
  getAppointmentSlot,
  reserveSlot,
  confirmReservation,
  releaseReservation,
  generateSlots,
  blockSlot,
  unblockSlot,
  getScheduleTemplates,
  createScheduleTemplate,
  deleteScheduleTemplate,
} from '../api/booking.api';
import type {
  GetAppointmentSlotsParams,
  ReserveSlotRequest,
  ConfirmReservationRequest,
  ReleaseReservationRequest,
  GenerateSlotsRequest,
  BlockSlotRequest,
  UnblockSlotRequest,
  CreateScheduleTemplateRequest,
} from '@/types/schedule';

// ============ QUERY KEYS ============

export const bookingKeys = {
  all: ['appointment-slots'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: GetAppointmentSlotsParams) =>
    [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  templates: ['schedule-templates'] as const,
  templatesByDoctor: (ophthalId: string) =>
    [...bookingKeys.templates, ophthalId] as const,
};

// ============ APPOINTMENT SLOT QUERIES ============

/** Fetch available appointment slots with filters */
export const useAppointmentSlots = (
  params: GetAppointmentSlotsParams = {},
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => getAppointmentSlots(params),
    staleTime: 15_000, // 15s - slots change frequently
    placeholderData: keepPreviousData,
    ...options,
  });

/** Fetch a single appointment slot */
export const useAppointmentSlot = (
  slotId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: bookingKeys.detail(slotId),
    queryFn: () => getAppointmentSlot(slotId),
    staleTime: 10_000,
    enabled: !!slotId,
    ...options,
  });

// ============ BOOKING MUTATIONS ============

/** Reserve a slot for a patient */
export const useReserveSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      request,
    }: {
      slotId: string;
      request: ReserveSlotRequest;
    }) => reserveSlot(slotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

/** Confirm a reservation (complete booking) */
export const useConfirmReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      request,
    }: {
      slotId: string;
      request: ConfirmReservationRequest;
    }) => confirmReservation(slotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Also invalidate consultation sessions since a new one is created
      queryClient.invalidateQueries({ queryKey: ['consultation-sessions'] });
    },
  });
};

/** Release a reservation */
export const useReleaseReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      request,
    }: {
      slotId: string;
      request: ReleaseReservationRequest;
    }) => releaseReservation(slotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// ============ DOCTOR SLOT MANAGEMENT MUTATIONS ============

/** Generate slots from a template */
export const useGenerateSlots = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: GenerateSlotsRequest) => generateSlots(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

/** Block a slot */
export const useBlockSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      request,
    }: {
      slotId: string;
      request: BlockSlotRequest;
    }) => blockSlot(slotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

/** Unblock a slot */
export const useUnblockSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      request,
    }: {
      slotId: string;
      request: UnblockSlotRequest;
    }) => unblockSlot(slotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// ============ SCHEDULE TEMPLATE QUERIES & MUTATIONS ============

/** Fetch schedule templates for a doctor */
export const useScheduleTemplates = (
  ophthalId?: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: ophthalId
      ? bookingKeys.templatesByDoctor(ophthalId)
      : bookingKeys.templates,
    queryFn: () => getScheduleTemplates(ophthalId),
    staleTime: 60_000, // 1 minute - templates change rarely
    ...options,
  });

/** Create a schedule template */
export const useCreateScheduleTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateScheduleTemplateRequest) =>
      createScheduleTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.templates });
    },
  });
};

/** Delete a schedule template */
export const useDeleteScheduleTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => deleteScheduleTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.templates });
    },
  });
};
