/**
 * System Admin Dashboard API
 * Handles API calls for dashboard data
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse, DashboardData } from '../types/system-admin.types';

interface AdminMetricsDto {
  totalInflow: number;
  totalOutflow: number;
  refundOutflow: number;
  netCashflow: number;
  estimatedCommission: number;
  paymentMethodBreakdown: Array<{
    paymentMethod: string;
    amount: number;
    percentage: number;
  }>;
}

interface AdminTrendPointDto {
  label: string;
  count: number;
}

interface AdminTrendDto {
  dataPoints: AdminTrendPointDto[];
}

interface AdminRecentScreeningDto {
  screeningCode: string;
  clinicName: string | null;
  riskLevel: string | null;
  isCritical: boolean;
  status: string;
  createdAt: string;
}

interface AdminRiskCategoryDto {
  riskLevel: string;
  count: number;
  percentage: number;
}

interface AdminRiskDto {
  riskCategories: AdminRiskCategoryDto[];
}

interface AdminSystemHealthComponentDto {
  componentName: string;
  status: string;
  isHealthy: boolean;
  latencyMs?: number;
  uptimePercentage?: number;
}

interface AdminSystemHealthDto {
  allSystemsOperational: boolean;
  components: AdminSystemHealthComponentDto[];
}

interface PagedResult<T> {
  items: T[];
}

export const dashboardApi = {
  /**
   * Fetch dashboard statistics
   */
  async getStats() {
    try {
      const response = await api.get<ApiResponse<AdminMetricsDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.STATS
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Dashboard metrics response is empty.');
      }

      return {
        totalInflow: {
          value: data.totalInflow,
          description: 'Completed wallet top-up inflow',
        },
        totalOutflow: {
          value: data.totalOutflow,
          description: 'Refund + withdrawal outflow',
        },
        netCashflow: {
          value: data.netCashflow,
          description: 'Net inflow after outflow',
        },
        estimatedCommission: {
          value: data.estimatedCommission,
          description: 'Estimated from completed sessions and active contracts',
        },
        refundOutflow: {
          value: data.refundOutflow,
          description: 'Outflow from refunds only',
        },
        paymentMethodBreakdown: data.paymentMethodBreakdown,
      } satisfies DashboardData['stats'];
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Fetch screening volume trends
   */
  async getScreeningVolume() {
    try {
      const response = await api.get<ApiResponse<AdminTrendDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.SCREENING_VOLUME,
        {
          params: { timeRange: 'monthly', periods: 6 },
        }
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Dashboard trends response is empty.');
      }

      return data.dataPoints.map((item) => ({
        week: item.label,
        screenings: item.count,
      })) satisfies DashboardData['volumeTrends'];
    } catch (error) {
      console.error('Failed to fetch screening volume:', error);
      throw error;
    }
  },

  /**
   * Fetch recent screenings
   */
  async getRecentScreenings(limit = 10) {
    try {
      const response = await api.get<
        ApiResponse<PagedResult<AdminRecentScreeningDto>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.RECENT_SCREENINGS, {
        params: { pageNumber: 1, pageSize: limit },
      });
      const data = response.data.data;
      if (!data) {
        throw new Error('Recent screenings response is empty.');
      }

      return data.items.map((item) => ({
        id: item.screeningCode,
        clinic: item.clinicName || 'N/A',
        date: new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        time: new Date(item.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        aiResult:
          item.status.toLowerCase() === 'analyzing'
            ? 'processing'
            : item.riskLevel?.toLowerCase() === 'moderate'
              ? 'medium_risk'
              : item.riskLevel?.toLowerCase() === 'high' || item.isCritical
                ? 'high_risk'
                : 'low_risk',
        status:
          item.status.toLowerCase() === 'completed'
            ? item.isCritical
              ? 'flagged'
              : 'completed'
            : 'analyzing',
      })) satisfies DashboardData['recentScreenings'];
    } catch (error) {
      console.error('Failed to fetch recent screenings:', error);
      throw error;
    }
  },

  /**
   * Fetch system health metrics
   */
  async getSystemHealth() {
    try {
      const response = await api.get<ApiResponse<AdminSystemHealthDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.SYSTEM_HEALTH
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('System health response is empty.');
      }

      const database = data.components.find(
        (component) => component.componentName === 'Database'
      );
      const aiService = data.components.find(
        (component) => component.componentName === 'AI Service'
      );

      return {
        uptime: data.allSystemsOperational
          ? 100
          : (database?.uptimePercentage ?? 0),
        responseTime: aiService?.latencyMs ?? 0,
        cpuUsage: 0,
        memoryUsage: 0,
        storageUsage: 0,
      } satisfies DashboardData['systemHealth'];
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  },

  /**
   * Fetch risk distribution
   */
  async getRiskDistribution() {
    try {
      const response = await api.get<ApiResponse<AdminRiskDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.RISK_DISTRIBUTION
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Risk distribution response is empty.');
      }

      return data.riskCategories.map((item) => ({
        riskLevel: item.riskLevel.toLowerCase() as
          | 'low'
          | 'medium'
          | 'high'
          | 'critical',
        count: item.count,
        percentage: item.percentage,
      })) satisfies DashboardData['riskDistribution'];
    } catch (error) {
      console.error('Failed to fetch risk distribution:', error);
      throw error;
    }
  },
};
