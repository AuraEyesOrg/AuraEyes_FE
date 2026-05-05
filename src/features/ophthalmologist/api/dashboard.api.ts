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

interface OphthalmologistDashboardMetricsRaw {
  pendingReviews?: number;
  urgentCases?: number;
  completedToday?: number;
  openSlotsToday?: number;
  urgentCaseList?: unknown;
}

const normalizeUrgentCaseList = (
  value: unknown
): OphthalmologistUrgentCase[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is OphthalmologistUrgentCase =>
      Boolean(item) && typeof item === 'object'
  );
};

const normalizeDashboardMetrics = (
  payload: OphthalmologistDashboardMetricsRaw
): OphthalmologistDashboardMetrics => ({
  pendingReviews:
    typeof payload.pendingReviews === 'number' ? payload.pendingReviews : 0,
  urgentCases:
    typeof payload.urgentCases === 'number' ? payload.urgentCases : 0,
  completedToday:
    typeof payload.completedToday === 'number' ? payload.completedToday : 0,
  openSlotsToday:
    typeof payload.openSlotsToday === 'number' ? payload.openSlotsToday : 0,
  urgentCaseList: normalizeUrgentCaseList(payload.urgentCaseList),
});

export const getOphthalmologistDashboardMetrics =
  async (): Promise<OphthalmologistDashboardMetrics> => {
    const response = await api.get<
      ApiResponse<OphthalmologistDashboardMetricsRaw>
    >(API_ENDPOINTS.OPHTHALMOLOGIST.DASHBOARD_METRICS);

    const data = unwrapApiData<OphthalmologistDashboardMetricsRaw>(
      response.data
    );
    return normalizeDashboardMetrics(data ?? {});
  };

export interface ReviewQueueItem {
  screeningId: string;
  consultationSessionId: string;
  patientId: string;
  patientName: string;
  riskLevel: string;
  confidenceScore: number;
  aiSummary: string | null;
  thumbnailUrl: string | null;
  reviewStatus: 'READY_FOR_REVIEW' | 'IN_PROGRESS';
  waitingMinutes: number;
  appointmentTime: string | null;
  createdAt: string;
}

export const getReviewQueue = async (): Promise<ReviewQueueItem[]> => {
  const response = await api.get<ApiResponse<ReviewQueueItem[]>>(
    API_ENDPOINTS.OPHTHALMOLOGIST.REVIEW_QUEUE
  );
  const data = unwrapApiData<ReviewQueueItem[]>(response.data);
  return Array.isArray(data) ? data : [];
};
