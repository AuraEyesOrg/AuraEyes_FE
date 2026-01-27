/**
 * System Admin Dashboard Service
 * Handles API calls for dashboard data
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse, DashboardData } from '../types/system-admin.types';

export const dashboardService = {
  /**
   * Fetch dashboard statistics
   */
  async getStats() {
    try {
      const response = await api.get<ApiResponse<DashboardData['stats']>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.STATS
      );
      return response.data.data;
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
      const response = await api.get<
        ApiResponse<DashboardData['volumeTrends']>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.SCREENING_VOLUME);
      return response.data.data;
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
        ApiResponse<DashboardData['recentScreenings']>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.RECENT_SCREENINGS, {
        params: { limit },
      });
      return response.data.data;
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
      const response = await api.get<
        ApiResponse<DashboardData['systemHealth']>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.SYSTEM_HEALTH);
      return response.data.data;
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
      const response = await api.get<
        ApiResponse<DashboardData['riskDistribution']>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.RISK_DISTRIBUTION);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch risk distribution:', error);
      throw error;
    }
  },
};
