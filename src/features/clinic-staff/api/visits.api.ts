import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api-response';

export const visitsApi = {
  checkIn: (id: string) =>
    api.post<ApiResponse<any>>(`/api/visits/${id}/check-in`),
};
