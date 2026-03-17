import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrganisationDashboardMetrics {
  totalAppointments: number;
  pendingAppointments: number;
  availableSlotsToday: number;
  activeDoctors: number;
}

export const getOrganisationDashboardMetrics =
  async (): Promise<OrganisationDashboardMetrics> => {
    const response = await api.get<ApiResponse<OrganisationDashboardMetrics>>(
      API_ENDPOINTS.ORGANISATION.DASHBOARD_METRICS
    );

    return response.data.data;
  };
