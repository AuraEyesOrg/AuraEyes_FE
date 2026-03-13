import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOphthalmologistFeedback,
  createOrganisationFeedback,
  createWebsiteFeedback,
  getOphthalmologistRatingSummary,
  getOrganisationRatingSummary,
  listOphthalmologistFeedback,
  listOrganisationFeedback,
} from '../api/feedback.api';
import type {
  CreateOphthalmologistFeedbackRequest,
  CreateOrganisationFeedbackRequest,
  CreateWebsiteFeedbackRequest,
} from '../types/feedback.types';

export const feedbackKeys = {
  all: ['feedback'] as const,
  organisationRating: (organisationId: string) =>
    [...feedbackKeys.all, 'organisation-rating', organisationId] as const,
  ophthalmologistRating: (ophthalmologistId: string) =>
    [...feedbackKeys.all, 'ophthalmologist-rating', ophthalmologistId] as const,
  organisationItems: (organisationId: string, page = 1, size = 10) =>
    [
      ...feedbackKeys.all,
      'organisation-items',
      organisationId,
      page,
      size,
    ] as const,
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

export const useCreateOrganisationFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organisationId,
      request,
    }: {
      organisationId: string;
      request: CreateOrganisationFeedbackRequest;
    }) => createOrganisationFeedback(organisationId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.organisationRating(variables.organisationId),
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

export const useOrganisationRatingSummary = (
  organisationId: string,
  enabled = true
) =>
  useQuery({
    queryKey: feedbackKeys.organisationRating(organisationId),
    queryFn: () => getOrganisationRatingSummary(organisationId),
    enabled: enabled && !!organisationId,
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

export const useOrganisationFeedbackItems = (
  organisationId: string,
  page = 1,
  size = 10,
  enabled = true
) =>
  useQuery({
    queryKey: feedbackKeys.organisationItems(organisationId, page, size),
    queryFn: () => listOrganisationFeedback(organisationId, page, size),
    enabled: enabled && !!organisationId,
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
