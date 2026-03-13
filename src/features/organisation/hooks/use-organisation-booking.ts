import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrganisationTemplate,
  deleteOrganisationTemplate,
  generateOrganisationSlots,
  getOrganisationSlots,
  getOrganisationTemplates,
  updateOrganisationSlotStatus,
  updateOrganisationTemplate,
  type CreateOrganisationTemplateRequest,
  type GenerateOrganisationSlotsRequest,
  type GetOrganisationSlotsParams,
  type UpdateOrganisationTemplateRequest,
} from '../api/organisation-booking.api';

export const organisationBookingKeys = {
  all: ['organisation-booking'] as const,
  templates: (orgId: string) =>
    [...organisationBookingKeys.all, 'templates', orgId] as const,
  slots: (params: GetOrganisationSlotsParams) =>
    [...organisationBookingKeys.all, 'slots', params] as const,
};

export const useOrganisationTemplates = (orgId: string, enabled = true) =>
  useQuery({
    queryKey: organisationBookingKeys.templates(orgId),
    queryFn: () => getOrganisationTemplates(orgId),
    enabled: enabled && !!orgId,
    staleTime: 60_000,
  });

export const useOrganisationSlots = (
  params: GetOrganisationSlotsParams,
  enabled = true
) =>
  useQuery({
    queryKey: organisationBookingKeys.slots(params),
    queryFn: () => getOrganisationSlots(params),
    enabled: enabled && !!params.orgId,
    staleTime: 15_000,
  });

export const useCreateOrganisationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orgId,
      request,
    }: {
      orgId: string;
      request: CreateOrganisationTemplateRequest;
    }) => createOrganisationTemplate(orgId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(variables.orgId),
      });
    },
  });
};

export const useUpdateOrganisationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: UpdateOrganisationTemplateRequest;
      orgId: string;
    }) => updateOrganisationTemplate(templateId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(variables.orgId),
      });
    },
  });
};

export const useDeleteOrganisationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      orgId,
    }: {
      templateId: string;
      orgId: string;
    }) => deleteOrganisationTemplate(templateId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(variables.orgId),
      });
      queryClient.invalidateQueries({ queryKey: organisationBookingKeys.all });
    },
  });
};

export const useGenerateOrganisationSlots = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: GenerateOrganisationSlotsRequest) =>
      generateOrganisationSlots(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationBookingKeys.all });
    },
  });
};

export const useUpdateOrganisationSlotStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      newStatus,
    }: {
      slotId: string;
      newStatus: number;
    }) => updateOrganisationSlotStatus(slotId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationBookingKeys.all });
    },
  });
};
