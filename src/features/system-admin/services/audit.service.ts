/**
 * System Admin Audit Logs & Compliance Service
 * Handles API calls for audit logs and compliance reporting
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  AuditLogEntry,
  AuditStats,
  ComplianceReport,
  PaginatedResponse,
} from '../types/system-admin.types';

export const auditService = {
  /**
   * Fetch audit logs with pagination and filtering
   */
  async getAuditLogs(
    page = 1,
    pageSize = 50,
    filters?: Record<string, unknown>
  ) {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<AuditLogEntry>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.LIST, {
        params: { page, pageSize, ...filters },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  },

  /**
   * Fetch specific audit log entry
   */
  async getAuditLogDetail(id: string) {
    try {
      const response = await api.get<ApiResponse<AuditLogEntry>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.DETAIL(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch audit log detail:', error);
      throw error;
    }
  },

  /**
   * Fetch audit statistics
   */
  async getAuditStats() {
    try {
      const response = await api.get<ApiResponse<AuditStats>>(
        API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.STATS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
      throw error;
    }
  },

  /**
   * Export audit logs (triggers download)
   */
  async exportAuditLogs(
    format: 'csv' | 'json' | 'pdf' = 'csv',
    filters?: Record<string, unknown>
  ) {
    try {
      const response = await api.get(
        API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.EXPORT,
        {
          params: { format, ...filters },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  },
};

export const complianceService = {
  /**
   * Fetch compliance overview
   */
  async getComplianceOverview() {
    try {
      const response = await api.get<ApiResponse<unknown>>(
        API_ENDPOINTS.SYSTEM_ADMIN.COMPLIANCE.OVERVIEW
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch compliance overview:', error);
      throw error;
    }
  },

  /**
   * Fetch compliance reports
   */
  async getComplianceReports() {
    try {
      const response = await api.get<ApiResponse<ComplianceReport[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.COMPLIANCE.REPORTS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      throw error;
    }
  },

  /**
   * Generate new compliance report
   */
  async generateComplianceReport(
    type: 'gdpr' | 'hipaa' | 'audit' | 'security',
    options?: Record<string, unknown>
  ) {
    try {
      const response = await api.post<ApiResponse<ComplianceReport>>(
        API_ENDPOINTS.SYSTEM_ADMIN.COMPLIANCE.GENERATE_REPORT,
        { type, ...options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  },
};
