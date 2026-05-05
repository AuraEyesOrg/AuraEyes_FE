/**
 * TanStack Query hook for Audit Logs
 * Server-side pagination, filtering, and caching
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditApi, type GetAuditLogsParams } from '../api/audit.api';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (params: GetAuditLogsParams) =>
    [...auditLogKeys.all, 'list', params] as const,
};

export const useAuditLogs = (params: GetAuditLogsParams = {}) => {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditApi.getAuditLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
