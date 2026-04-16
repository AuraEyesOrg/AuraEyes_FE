import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationDashboardMetrics {
  utilizationRatePercent: number;
  remainingAiQuota: number;
  totalPatients: number;
  totalAppointments: number;
  appointmentStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

export const getOrganisationDashboardMetrics =
  async (): Promise<OrganisationDashboardMetrics> => {
    const response = await api.get<ApiResponse<OrganisationDashboardMetrics>>(
      API_ENDPOINTS.ORGANISATION.DASHBOARD_METRICS
    );

    return unwrapApiData<OrganisationDashboardMetrics>(response.data);
  };
