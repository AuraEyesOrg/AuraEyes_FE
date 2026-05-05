import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api-response';

export const SYSTEM_SETTINGS_KEYS = {
  all: ['system-settings'] as const,
  pricingRules: ['system-settings', 'experience-pricing-rules'] as const,
};

export interface ExperiencePricingRule {
  id: string;
  minYearsExperience: number;
  maxYearsExperience: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
}

export interface UpdateExperiencePricingRulePriceItem {
  id: string;
  minPrice: number;
  maxPrice: number;
}

// Fetch system settings
export const useSystemSettings = () => {
  return useQuery({
    queryKey: SYSTEM_SETTINGS_KEYS.all,
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<Record<string, string>>>('/system-settings');
      return response.data.data ?? {};
    },
  });
};

// Update system settings (restricted to SA)
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const response = await api.put<ApiResponse<Record<string, string>>>(
        '/system-settings',
        settings
      );
      return response.data.data ?? {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_SETTINGS_KEYS.all });
    },
  });
};

export const useExperiencePricingRules = () =>
  useQuery({
    queryKey: SYSTEM_SETTINGS_KEYS.pricingRules,
    queryFn: async () => {
      const response = await api.get<ApiResponse<ExperiencePricingRule[]>>(
        '/system-settings/experience-pricing-rules'
      );

      return response.data.data ?? [];
    },
  });

export const useUpdateExperiencePricingRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rules: UpdateExperiencePricingRulePriceItem[]) => {
      const response = await api.put<ApiResponse<ExperiencePricingRule[]>>(
        '/system-settings/experience-pricing-rules',
        rules
      );

      return response.data.data ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SYSTEM_SETTINGS_KEYS.pricingRules,
      });
    },
  });
};
