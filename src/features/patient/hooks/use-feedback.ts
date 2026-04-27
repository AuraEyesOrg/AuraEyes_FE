import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOphthalmologistFeedback,
  createClinicFeedback,
  createWebsiteFeedback,
  getOphthalmologistRatingSummary,
  getClinicRatingSummary,
  listOphthalmologistFeedback,
  listClinicFeedback,
} from '../api/feedback.api';
import type {
  CreateOphthalmologistFeedbackRequest,
  CreateClinicFeedbackRequest,
  CreateWebsiteFeedbackRequest,
} from '../types/feedback.types';

export const feedbackKeys = {
  all: ['feedback'] as const,
  clinicRating: () => [...feedbackKeys.all, 'clinic-rating'] as const,
  ophthalmologistRating: (ophthalmologistId: string) =>
    [...feedbackKeys.all, 'ophthalmologist-rating', ophthalmologistId] as const,
  clinicItems: (page = 1, size = 10) =>
    [...feedbackKeys.all, 'clinic-items', page, size] as const,
  ophthalmologistItems: (ophthalmologistId: string, page = 1, size = 10) =>
    [
      ...feedbackKeys.all,
      'ophthalmologist-items',
      ophthalmologistId,
      page,
      size,
    ] as const,
};

export const useCreateWebsiteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateWebsiteFeedbackRequest) =>
      createWebsiteFeedback(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard'] });
    },
  });
};

export const useCreateClinicFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateClinicFeedbackRequest) =>
      createClinicFeedback(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.clinicRating(),
      });
      queryClient.invalidateQueries({ queryKey: ['clinic-booking'] });
    },
  });
};

export const useCreateOphthalmologistFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ophthalmologistId,
      request,
    }: {
      ophthalmologistId: string;
      request: CreateOphthalmologistFeedbackRequest;
    }) => createOphthalmologistFeedback(ophthalmologistId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.ophthalmologistRating(
          variables.ophthalmologistId
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['consultation-sessions'] });
    },
  });
};

export const useClinicRatingSummary = (enabled = true) =>
  useQuery({
    queryKey: feedbackKeys.clinicRating(),
    queryFn: () => getClinicRatingSummary(),
    enabled: enabled,
    staleTime: 30_000,
  });

export const useOphthalmologistRatingSummary = (
  ophthalmologistId: string,
  enabled = true
) =>
  useQuery({
    queryKey: feedbackKeys.ophthalmologistRating(ophthalmologistId),
    queryFn: () => getOphthalmologistRatingSummary(ophthalmologistId),
    enabled: enabled && !!ophthalmologistId,
    staleTime: 30_000,
  });

export const useClinicFeedbackItems = (page = 1, size = 10, enabled = true) =>
  useQuery({
    queryKey: feedbackKeys.clinicItems(page, size),
    queryFn: () => listClinicFeedback(page, size),
    enabled: enabled,
    staleTime: 30_000,
  });

export const useOphthalmologistFeedbackItems = (
  ophthalmologistId: string,
  page = 1,
  size = 10,
  enabled = true
) =>
  useQuery({
    queryKey: feedbackKeys.ophthalmologistItems(ophthalmologistId, page, size),
    queryFn: () => listOphthalmologistFeedback(ophthalmologistId, page, size),
    enabled: enabled && !!ophthalmologistId,
    staleTime: 30_000,
  });
