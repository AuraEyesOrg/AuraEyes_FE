import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

// ─── Types ───────────────────────────────────────────────────────────

export interface OrgBillingSummary {
  totalScreeningsThisMonth: number;
  totalScreeningsAllTime: number;
  remainingQuota: number;
  usedQuotaToday: number;
  purchasedQuota: number;
}

export interface OrgScreeningReport {
  totalScreenings: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  averageConfidence: number;
  monthlyBreakdown: Array<{
    month: string;
    count: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
  }>;
}

// ─── API calls ───────────────────────────────────────────────────────

export const orgBillingApi = {
  async getSummary(): Promise<OrgBillingSummary> {
    const response = await api.get<ApiResponse<OrgBillingSummary>>(
      API_ENDPOINTS.ORGANISATION.BILLING_SUMMARY
    );
    return unwrapApiData<OrgBillingSummary>(response.data);
  },
};

export const orgReportsApi = {
  async getScreeningReports(): Promise<OrgScreeningReport> {
    const response = await api.get<ApiResponse<OrgScreeningReport>>(
      API_ENDPOINTS.ORGANISATION.SCREENING_REPORTS
    );
    return unwrapApiData<OrgScreeningReport>(response.data);
  },
};
