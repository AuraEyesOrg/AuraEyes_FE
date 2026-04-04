/**
 * System Admin Dashboard API
 * Handles API calls for dashboard data
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  SystemAdminDashboardMetrics,
} from '../types/system-admin.types';

interface AdminUserGrowthMetricDto {
  total: number;
  currentMonth: number;
  previousMonth: number;
  growthPercentage: number;
}

interface AdminPaymentMethodRevenueDto {
  paymentMethod: string;
  amount: number;
  percentage: number;
}

interface AdminRevenuePointDto {
  month?: number;
  date?: string;
  label: string;
  revenue: number;
}

interface AdminPendingActionsDto {
  pendingOphthalmologistVerifications: number;
  pendingWithdrawalRequests: number;
  pendingOrganisationOnboarding: number;
}

interface AdminSystemStatusDto {
  liveConsultationSessions: number;
  apiHealthy: boolean;
  databaseHealthy: boolean;
}

interface AdminBetterStackMonitorDto {
  key: string;
  name: string;
  category: string;
  configured: boolean;
}

interface AdminBetterStackDto {
  enabled: boolean;
  embedUrl?: string | null;
  monitors: AdminBetterStackMonitorDto[];
}

interface AdminTopDoctorDto {
  ophthalmologistId: string;
  name: string;
  revenue: number;
  ratingAverage: number;
  ratingCount: number;
}

interface AdminTopOrganisationDto {
  organisationId: string;
  name: string;
  ratingAverage: number;
  ratingCount: number;
}

interface AdminMetricsDto {
  doctors: AdminUserGrowthMetricDto;
  organisations: AdminUserGrowthMetricDto;
  patients: AdminUserGrowthMetricDto;
  paymentMethodBreakdown: AdminPaymentMethodRevenueDto[];
  monthlyRevenue: AdminRevenuePointDto[];
  dailyRevenue: AdminRevenuePointDto[];
  totalDepositRevenueYear: number;
  totalPlatformCommissionYear: number;
  monthlyPlatformCommission: AdminRevenuePointDto[];
  dailyPlatformCommission: AdminRevenuePointDto[];
  monthlyNewDoctorCounts: number[];
  monthlyNewOrganisationCounts: number[];
  monthlyNewPatientCounts: number[];
  pendingActions: AdminPendingActionsDto;
  systemStatus: AdminSystemStatusDto;
  betterStack?: AdminBetterStackDto;
  topDoctorsByConsultationRevenue: AdminTopDoctorDto[];
  topOrganisationsByRating: AdminTopOrganisationDto[];
}

export const dashboardApi = {
  async getMetrics(): Promise<SystemAdminDashboardMetrics> {
    try {
      const response = await api.get<ApiResponse<AdminMetricsDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.STATS
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Dashboard metrics response is empty.');
      }

      return {
        doctors: data.doctors,
        organisations: data.organisations,
        patients: data.patients,
        paymentMethods: data.paymentMethodBreakdown.map((item) => ({
          name: item.paymentMethod,
          value: Number(item.amount ?? 0),
        })),
        monthlyRevenue: data.monthlyRevenue.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        dailyRevenue: data.dailyRevenue.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        totalDepositRevenueYear: Number(data.totalDepositRevenueYear ?? 0),
        totalPlatformCommissionYear: Number(
          data.totalPlatformCommissionYear ?? 0
        ),
        monthlyPlatformCommission: (data.monthlyPlatformCommission ?? []).map(
          (item) => ({
            label: item.label,
            value: Number(item.revenue ?? 0),
          })
        ),
        dailyPlatformCommission: (data.dailyPlatformCommission ?? []).map(
          (item) => ({
            label: item.label,
            value: Number(item.revenue ?? 0),
          })
        ),
        monthlyNewDoctorCounts: data.monthlyNewDoctorCounts ?? [],
        monthlyNewOrganisationCounts: data.monthlyNewOrganisationCounts ?? [],
        monthlyNewPatientCounts: data.monthlyNewPatientCounts ?? [],
        pendingActions: {
          pendingOphthalmologistVerifications:
            data.pendingActions?.pendingOphthalmologistVerifications ?? 0,
          pendingWithdrawalRequests:
            data.pendingActions?.pendingWithdrawalRequests ?? 0,
          pendingOrganisationOnboarding:
            data.pendingActions?.pendingOrganisationOnboarding ?? 0,
        },
        systemStatus: {
          liveConsultationSessions:
            data.systemStatus?.liveConsultationSessions ?? 0,
          apiHealthy: data.systemStatus?.apiHealthy ?? true,
          databaseHealthy: data.systemStatus?.databaseHealthy ?? false,
        },
        betterStack: {
          enabled: data.betterStack?.enabled ?? false,
          embedUrl: data.betterStack?.embedUrl ?? null,
          monitors: (data.betterStack?.monitors ?? []).map((item) => ({
            key: item.key,
            name: item.name,
            category: item.category,
            configured: Boolean(item.configured),
          })),
        },
        topDoctorsByConsultationRevenue: (
          data.topDoctorsByConsultationRevenue ?? []
        ).map((d) => ({
          ophthalmologistId: d.ophthalmologistId,
          name: d.name,
          revenue: Number(d.revenue ?? 0),
          ratingAverage: Number(d.ratingAverage ?? 0),
          ratingCount: d.ratingCount ?? 0,
        })),
        topOrganisationsByRating: (data.topOrganisationsByRating ?? []).map(
          (o) => ({
            organisationId: o.organisationId,
            name: o.name,
            ratingAverage: Number(o.ratingAverage ?? 0),
            ratingCount: o.ratingCount ?? 0,
          })
        ),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  },
};
