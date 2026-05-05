/**
 * System Admin Audit Logs & Compliance API
 * Handles API calls for audit logs and compliance reporting
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  AuditLogDto,
  AuditStats,
  PaginatedResponse,
} from '../types/system-admin.types';

/** Query params matching BE GetAuditLogsQuery */
export interface GetAuditLogsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  action?: string;
  entityName?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

export const auditApi = {
  /**
   * Fetch audit logs with server-side pagination and filtering
   * Maps to BE: GET /api/system-admin/audit-logs
   */
  async getAuditLogs(
    params: GetAuditLogsParams = {}
  ): Promise<PaginatedResponse<AuditLogDto>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLogDto>>>(
      API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.LIST,
      {
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.searchTerm && { searchTerm: params.searchTerm }),
          ...(params.action && { action: params.action }),
          ...(params.entityName && { entityName: params.entityName }),
          ...(params.userId && { userId: params.userId }),
          ...(params.fromDate && { fromDate: params.fromDate }),
          ...(params.toDate && { toDate: params.toDate }),
        },
      }
    );
    return response.data.data!;
  },

  /**
   * Fetch audit statistics
   */
  async getAuditStats(): Promise<AuditStats | undefined> {
    const response = await api.get<ApiResponse<AuditStats>>(
      API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.STATS
    );
    return response.data.data;
  },
};
