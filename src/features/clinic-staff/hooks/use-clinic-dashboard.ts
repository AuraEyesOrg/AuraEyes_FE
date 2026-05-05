import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface ClinicActivityDto {
  patientName: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'urgent';
}

export interface ClinicDashboardMetricsDto {
  todayAppointments: number;
  checkedInPatients: number;
  pendingTasks: number;
  completedToday: number;
  recentActivity: ClinicActivityDto[];
}

export const getClinicDashboardMetrics =
  async (): Promise<ClinicDashboardMetricsDto> => {
    const response = await api.get<ApiResponse<ClinicDashboardMetricsDto>>(
      API_ENDPOINTS.ORGANISATION.DASHBOARD_METRICS
    );
    return unwrapApiData<ClinicDashboardMetricsDto>(response.data);
  };

export const useClinicDashboardMetrics = () =>
  useQuery({
    queryKey: ['clinic', 'dashboard-metrics'],
    queryFn: getClinicDashboardMetrics,
    staleTime: 30_000,
  });
