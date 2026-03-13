/**
 * React Query hooks for Consultation Sessions.
 * Uses TanStack Query v5 with proper query keys, stale times, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConsultationSessions,
  getConsultationSession,
  createVerificationSession,
  createVideoCallSession,
  submitVerificationReport,
  sendSessionMessage,
  cancelSession,
  endSession,
} from '../api/consultation.api';
import type {
  GetConsultationSessionsParams,
  CreateVerificationSessionRequest,
  CreateVideoCallSessionRequest,
  SubmitVerificationReportRequest,
  SendMessageRequest,
  CancelSessionRequest,
  EndSessionRequest,
} from '@/types/consultation';

// ============ QUERY KEYS ============

export const consultationKeys = {
  all: ['consultation-sessions'] as const,
  lists: () => [...consultationKeys.all, 'list'] as const,
  list: (params: GetConsultationSessionsParams) =>
    [...consultationKeys.lists(), params] as const,
  details: () => [...consultationKeys.all, 'detail'] as const,
  detail: (id: string) => [...consultationKeys.details(), id] as const,
};

// ============ QUERIES ============

/** Fetch paginated consultation sessions with filters */
export const useConsultationSessions = (
  params: GetConsultationSessionsParams = {},
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: consultationKeys.list(params),
    queryFn: () => getConsultationSessions(params),
    staleTime: 30_000, // 30s - sessions update frequently
    ...options,
  });

/** Fetch a single consultation session by ID */
export const useConsultationSession = (
  sessionId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: consultationKeys.detail(sessionId),
    queryFn: () => getConsultationSession(sessionId),
    staleTime: 15_000, // 15s - detail view needs fresh data
    enabled: !!sessionId,
    ...options,
  });

// ============ MUTATIONS ============

/** Create a new Verification session */
export const useCreateVerificationSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVerificationSessionRequest) =>
      createVerificationSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};

/** Create a new VideoCall session */
export const useCreateVideoCallSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVideoCallSessionRequest) =>
      createVideoCallSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};

/** Submit a verification report (doctor) */
export const useSubmitVerificationReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      ...data
    }: SubmitVerificationReportRequest & { sessionId: string }) =>
      submitVerificationReport(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};

/** Send a message in a session */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      ...data
    }: SendMessageRequest & { sessionId: string }) =>
      sendSessionMessage(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};

/** Cancel a session */
export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      ...data
    }: CancelSessionRequest & { sessionId: string }) =>
      cancelSession(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};

/** End a session (doctor only) */
export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      ...data
    }: EndSessionRequest & { sessionId: string }) =>
      endSession(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
};
