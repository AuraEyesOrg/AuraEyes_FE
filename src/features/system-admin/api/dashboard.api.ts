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

interface AdminMetricsDto {
  doctors: AdminUserGrowthMetricDto;
  organisations: AdminUserGrowthMetricDto;
  patients: AdminUserGrowthMetricDto;
  paymentMethodBreakdown: AdminPaymentMethodRevenueDto[];
  monthlyRevenue: AdminRevenuePointDto[];
  dailyRevenue: AdminRevenuePointDto[];
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
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  },
};
