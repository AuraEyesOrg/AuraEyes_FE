import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api-response';

export const SYSTEM_SETTINGS_KEYS = {
  all: ['system-settings'] as const,
};

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
