import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OphthalmologistDashboardMetrics {
  pendingReviews: number;
  urgentCases: number;
  completedToday: number;
  openSlotsToday: number;
  urgentCaseList: OphthalmologistUrgentCase[];
}

export interface OphthalmologistUrgentCase {
  consultationSessionId: string;
  patientId: string;
  patientName: string;
  riskLevel: string;
  confidenceScore: number;
  appointmentTime: string | null;
  createdAt: string;
}

export const getOphthalmologistDashboardMetrics =
  async (): Promise<OphthalmologistDashboardMetrics> => {
    const response = await api.get<
      ApiResponse<OphthalmologistDashboardMetrics>
    >(API_ENDPOINTS.OPHTHALMOLOGIST.DASHBOARD_METRICS);

    return unwrapApiData<OphthalmologistDashboardMetrics>(response.data);
  };
