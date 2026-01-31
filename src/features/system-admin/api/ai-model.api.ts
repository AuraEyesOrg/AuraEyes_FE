/**
 * System Admin AI Model Monitoring API
 * Handles API calls for AI model monitoring and metrics
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  AIModel,
  AIModelMetrics,
  AIAlert,
  AIModelMonitoringData,
  PerformanceTrend,
  DemographicParity,
} from '../types/system-admin.types';

export const aiModelApi = {
  /**
   * Fetch current active AI model
   */
  async getCurrentModel() {
    try {
      const response = await api.get<ApiResponse<AIModel>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.CURRENT
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch current AI model:', error);
      throw error;
    }
  },

  /**
   * Fetch AI model performance KPIs
   */
  async getModelKPIs() {
    try {
      const response = await api.get<ApiResponse<AIModelMetrics>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.KPIS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch AI model KPIs:', error);
      throw error;
    }
  },

  /**
   * Fetch performance trend over time
   */
  async getPerformanceTrend(timeRange = '30d') {
    try {
      const response = await api.get<ApiResponse<PerformanceTrend[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.PERFORMANCE_TREND,
        { params: { timeRange } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch performance trend:', error);
      throw error;
    }
  },

  /**
   * Fetch demographic parity metrics
   */
  async getDemographicParity() {
    try {
      const response = await api.get<ApiResponse<DemographicParity[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.DEMOGRAPHIC_PARITY
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch demographic parity:', error);
      throw error;
    }
  },

  /**
   * Fetch model version history
   */
  async getModelVersionHistory() {
    try {
      const response = await api.get<ApiResponse<AIModel[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.VERSION_HISTORY
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch model version history:', error);
      throw error;
    }
  },

  /**
   * Fetch AI model alerts
   */
  async getModelAlerts() {
    try {
      const response = await api.get<ApiResponse<AIAlert[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AI_MODELS.ALERTS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch AI model alerts:', error);
      throw error;
    }
  },

  /**
   * Fetch complete AI model monitoring data
   */
  async getMonitoringData() {
    try {
      const [currentModel, metrics, trends, demographics, versions, alerts] =
        await Promise.all([
          this.getCurrentModel(),
          this.getModelKPIs(),
          this.getPerformanceTrend(),
          this.getDemographicParity(),
          this.getModelVersionHistory(),
          this.getModelAlerts(),
        ]);

      return {
        currentModel,
        metrics,
        performanceTrends: trends,
        demographicParity: demographics,
        modelVersions: versions,
        alerts,
      } as AIModelMonitoringData;
    } catch (error) {
      console.error('Failed to fetch AI model monitoring data:', error);
      throw error;
    }
  },
};
