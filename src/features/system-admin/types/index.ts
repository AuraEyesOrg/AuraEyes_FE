/**
 * System Admin Types
 * Barrel exports for all System Admin type definitions
 */

export type {
  // Dashboard
  DashboardStat,
  DashboardStats,
  ScreeningVolumeTrend,
  RecentScreening,
  RiskDistribution,
  SystemHealth,
  DashboardData,
  SystemAdminDashboardMetrics,
  SystemAdminPartTimeSlotQuotaUsage,
  SystemAdminWorkloadPeriodType,
  SystemAdminWorkloadStatus,
  SystemAdminWorkloadEmploymentType,
  SystemAdminDoctorWorkloadListItem,
  SystemAdminDoctorWorkloadPagedResult,
  SystemAdminDoctorWorkloadQueryParams,
  // Organisations & Devices
  Organisation,
  Device,
  CalibrationLog,
  OrganisationDetail,
  // Users & Roles
  UserRole,
  User,
  UserStats,
  RolePermission,
  // AI Model Monitoring
  AIModel,
  AIModelMetrics,
  DemographicParity,
  ModelVersion,
  PerformanceTrend,
  AIAlert,
  AIModelMonitoringData,
  // Audit Logs & Compliance
  AuditLogDto,
  AuditLogEntry,
  ComplianceReport,
  AuditStats,
  AuditLogsData,
  // Pagination & API
  PaginationParams,
  FilterOptions,
  PaginatedResponse,
  ApiError,
  ApiResponse,
} from './system-admin.types';
