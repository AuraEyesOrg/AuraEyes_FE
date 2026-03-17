import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OphthalmologistDashboardMetrics {
  pendingReviews: number;
  urgentCases: number;
  completedToday: number;
  openSlotsToday: number;
}

export const getOphthalmologistDashboardMetrics =
  async (): Promise<OphthalmologistDashboardMetrics> => {
    const response = await api.get<
      ApiResponse<OphthalmologistDashboardMetrics>
    >(API_ENDPOINTS.OPHTHALMOLOGIST.DASHBOARD_METRICS);

    return response.data.data;
  };
