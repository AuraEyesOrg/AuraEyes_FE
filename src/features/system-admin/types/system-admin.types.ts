/**
 * System Admin Dashboard Types
 * Core data structures for system administration UI
 */

// ============ DASHBOARD ============
export interface DashboardStat {
  value: number | string;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export interface DashboardStats {
  totalScreeningsToday: DashboardStat;
  aiAccuracyRate: DashboardStat;
  pendingReviews: DashboardStat;
  criticalRisks: DashboardStat;
}

export interface ScreeningVolumeTrend {
  week: string;
  screenings: number;
}

export interface RecentScreening {
  id: string;
  clinic: string;
  date: string;
  time: string;
  aiResult: 'low_risk' | 'medium_risk' | 'high_risk' | 'processing';
  status: 'completed' | 'flagged' | 'analyzing';
  statusIndicator?: 'success' | 'warning' | 'info' | 'error';
}

export interface RiskDistribution {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  percentage: number;
}

export interface SystemHealth {
  uptime: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  volumeTrends: ScreeningVolumeTrend[];
  recentScreenings: RecentScreening[];
  riskDistribution: RiskDistribution[];
  systemHealth: SystemHealth;
}

// ============ ORGANISATIONS & DEVICES ============
export interface Organisation {
  id: string;
  name: string;
  address?: string;
  licenseNumber?: string;
  orgType: string;
  deviceCount: number;
  isActive: boolean;
  createdAt: string;
  // UI-only fields (not from API)
  type?: 'clinic' | 'hospital' | 'imaging_center' | 'research';
  location?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'suspended';
  devicesCount?: number;
  usersCount?: number;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  organisationId: string;
  organisationName: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  screeningsPerformed: number;
  lastCalibrated: string;
  lastMaintenance?: string;
  firmwareVersion: string;
  locationDescription?: string;
}

export interface CalibrationLog {
  id: string;
  deviceId: string;
  date: string;
  calibrationStatus: 'passed' | 'failed' | 'needs_attention';
  technician: string;
  notes?: string;
}

export interface OrganisationDetail extends Organisation {
  devices: Device[];
  adminName: string;
  adminEmail: string;
  subscriptionLevel: 'free' | 'professional' | 'enterprise';
  monthlyScreenings: number;
  monthlyScreeningLimit?: number;
}

// ============ USERS & ROLES ============
export type UserRole =
  | 'system_admin'
  | 'organisation_admin'
  | 'doctor'
  | 'operator'
  | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'locked';
  organisationId?: string;
  organisationName?: string;
  lastLogin?: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  usersByRole: {
    [key in UserRole]: number;
  };
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  module: 'dashboard' | 'users' | 'organisations' | 'ai_models' | 'audit_logs';
  actions: Array<'read' | 'create' | 'update' | 'delete' | 'export'>;
}

// ============ AI MODEL MONITORING ============
export interface AIModel {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated' | 'testing' | 'staging';
  createdAt?: string;
  lastUpdated: string;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  sensitivity?: number;
  specificity?: number;
  deploymentDate?: string;
  author?: string;
}

export interface AIModelMetrics {
  // Core metrics
  accuracy?: number;
  sensitivity?: number;
  specificity?: number;
  precision?: number;
  f1Score?: number;
  falsePosRate?: number;
  falseNegRate?: number;
  // KPI dashboard metrics
  globalAccuracy?: number;
  accuracyChange?: number;
  precisionChange?: number;
  falsePositiveRate?: number;
  fprChange?: number;
  avgInferenceTime?: number;
  inferenceTimeChange?: number;
}

export interface DemographicParity {
  group: string;
  ageGroup?: string;
  accuracy: number;
  sampleSize?: number;
  hasWarning?: boolean;
  warning?: string;
}

export interface ModelVersion {
  version: string;
  status: 'active' | 'staging' | 'deprecated';
  releaseDate: string;
  accuracy: number;
  author: string;
}

export interface PerformanceTrend {
  date: string;
  accuracy: number;
  sensitivity: number;
  specificity: number;
}

export interface AIAlert {
  id: string;
  type:
    | 'performance_drop'
    | 'anomaly_detected'
    | 'drift_warning'
    | 'calibration_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AIModelMonitoringData {
  currentModel: AIModel;
  metrics: AIModelMetrics;
  performanceTrends: PerformanceTrend[];
  demographicParity: DemographicParity[];
  modelVersions: AIModel[];
  alerts: AIAlert[];
}

// ============ AUDIT LOGS & COMPLIANCE ============
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  details: string;
  status?: 'success' | 'failed' | 'partial';
  severity: 'info' | 'warning' | 'error' | 'critical';
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress: string;
  userAgent?: string;
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'gdpr' | 'hipaa' | 'audit' | 'security';
  generatedAt: string;
  generatedBy: string;
  period: {
    startDate: string;
    endDate: string;
  };
  status: 'pending' | 'completed' | 'failed';
  filePath?: string;
}

export interface AuditStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export interface AuditLogsData {
  entries: AuditLogEntry[];
  stats: AuditStats;
  compliance: ComplianceReport[];
}

// ============ PAGINATION & FILTERING ============
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: string | string[] | boolean | number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  // Legacy fields for backward compatibility
  data?: T[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

// ============ API RESPONSE TYPES ============
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// ============ PERMISSIONS ============

export interface PermissionDto {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionAssignment {
  rolePermissionId: string;
  roleId: string;
  roleName: string;
  permissionId: string;
  permissionName: string;
  permissionDisplayName: string;
  category?: string;
  assignedAt: string;
}

export interface UserPermissionOverride {
  userPermissionId: string;
  userId: string;
  permissionId: string;
  permissionName: string;
  permissionDisplayName: string;
  category?: string;
  isGranted: boolean;
  isActive: boolean;
  isExpired: boolean;
  grantedAt: string;
  expiresAt?: string;
  grantedBy?: string;
}

export interface UserEffectivePermissionsDto {
  userId: string;
  userEmail: string;
  roles: string[];
  rolePermissions: PermissionDto[];
  userOverrides: UserPermissionOverride[];
  effectivePermissionNames: string[];
}

export interface ApplicationRoleDto {
  id: string;
  name: string;
}

export interface CreatePermissionPayload {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionPayload {
  displayName: string;
  description?: string;
  category?: string;
}

export interface AssignPermissionToRolePayload {
  roleId: string;
  permissionId: string;
}

export interface GrantPermissionToUserPayload {
  userId: string;
  permissionId: string;
  isGranted: boolean;
  expiresAt?: string;
}
