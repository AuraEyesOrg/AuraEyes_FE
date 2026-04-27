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
  templates: () => [...organisationBookingKeys.all, 'templates'] as const,
  slots: (params: Omit<GetOrganisationSlotsParams, 'orgId'>) =>
    [...organisationBookingKeys.all, 'slots', params] as const,
};

export const useOrganisationTemplates = (enabled = true) =>
  useQuery({
    queryKey: organisationBookingKeys.templates(),
    queryFn: () => getOrganisationTemplates(),
    enabled: enabled,
    staleTime: 60_000,
  });

export const useOrganisationSlots = (
  params: Omit<GetOrganisationSlotsParams, 'orgId'>,
  enabled = true
) =>
  useQuery({
    queryKey: organisationBookingKeys.slots(params),
    queryFn: () => getOrganisationSlots(params),
    enabled: enabled,
    staleTime: 15_000,
  });

export const useCreateOrganisationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request }: { request: CreateOrganisationTemplateRequest }) =>
      createOrganisationTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(),
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
    }) => updateOrganisationTemplate(templateId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(),
      });
    },
  });
};

export const useDeleteOrganisationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId }: { templateId: string }) =>
      deleteOrganisationTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organisationBookingKeys.templates(),
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
