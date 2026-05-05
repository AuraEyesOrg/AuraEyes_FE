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
  totalInflow: DashboardStat;
  totalOutflow: DashboardStat;
  netCashflow: DashboardStat;
  estimatedCommission: DashboardStat;
  refundOutflow: DashboardStat;
  paymentMethodBreakdown: Array<{
    paymentMethod: string;
    amount: number;
    percentage: number;
  }>;
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

export interface SystemAdminUserGrowthMetric {
  total: number;
  currentMonth: number;
  previousMonth: number;
  growthPercentage: number;
}

export interface SystemAdminPaymentMethodPoint {
  name: string;
  value: number;
}

export interface SystemAdminRevenuePoint {
  label: string;
  value: number;
}

export interface SystemAdminDashboardPendingActions {
  pendingOphthalmologistVerifications: number;
  pendingWithdrawalRequests: number;
  pendingOrganisationOnboarding: number;
}

export interface SystemAdminDashboardSystemStatus {
  liveConsultationSessions: number;
  apiHealthy: boolean;
  databaseHealthy: boolean;
}

export interface SystemAdminBetterStackMonitor {
  key: string;
  name: string;
  category: string;
  configured: boolean;
}

export interface SystemAdminBetterStack {
  enabled: boolean;
  embedUrl: string | null;
  monitors: SystemAdminBetterStackMonitor[];
}

export interface SystemAdminTopDoctor {
  ophthalmologistId: string;
  name: string;
  revenue: number;
  /** Average rating from patient feedback (1–5); 0 if none. */
  ratingAverage: number;
  ratingCount: number;
}

export interface SystemAdminTopOrganisation {
  organisationId: string;
  name: string;
  ratingAverage: number;
  ratingCount: number;
}

export interface SystemAdminDashboardMetrics {
  doctors: SystemAdminUserGrowthMetric;
  organisations: SystemAdminUserGrowthMetric;
  patients: SystemAdminUserGrowthMetric;
  paymentMethods: SystemAdminPaymentMethodPoint[];
  monthlyRevenue: SystemAdminRevenuePoint[];
  dailyRevenue: SystemAdminRevenuePoint[];
  /** Sum of completed deposit requests in the current calendar year (VND). */
  totalDepositRevenueYear: number;
  /** Platform share from consultations (System wallet) in the current calendar year (VND). */
  totalPlatformCommissionYear: number;
  monthlyPlatformCommission: SystemAdminRevenuePoint[];
  dailyPlatformCommission: SystemAdminRevenuePoint[];
  monthlyNewDoctorCounts: number[];
  monthlyNewOrganisationCounts: number[];
  monthlyNewPatientCounts: number[];
  pendingActions: SystemAdminDashboardPendingActions;
  systemStatus: SystemAdminDashboardSystemStatus;
  betterStack: SystemAdminBetterStack;
  topDoctorsByConsultationRevenue: SystemAdminTopDoctor[];
  topOrganisationsByRating: SystemAdminTopOrganisation[];
}

export interface SystemAdminTransactionStat {
  Date: string;
  Amount: number;
  Count: number;
}

// ─── Real-Time Clinic Operations Dashboard Types ──────────────────────────────

export interface TodaySummary {
  totalAppointments: number;
  checkedInPatients: number;
  completedVisits: number;
  noShowCount: number;
}

export interface SlotUtilization {
  totalSlots: number;
  bookedSlots: number;
  remainingCapacity: number;
  utilizationRate: number;
}

export interface LiveQueueItem {
  visitId: string;
  patientName: string;
  status: string;
  assignedDoctorName?: string;
  waitingTimeMinutes: number;
  checkedInAt?: string;
}

export interface DoctorStatusItem {
  doctorId: string;
  doctorName: string;
  currentStatus: string;
  patientsHandledToday: number;
  activeLoad: number;
}

export interface SystemAdminPartTimeSlotQuotaUsage {
  date: string;
  usedSlots: number;
  quota: number;
  remainingSlots: number;
}

export type SystemAdminWorkloadPeriodType = 'Week' | 'Month';
export type SystemAdminWorkloadStatus = 'OK' | 'UNDER';
export type SystemAdminWorkloadEmploymentType = 'FullTime' | 'PartTime';

export interface SystemAdminDoctorWorkloadListItem {
  doctorId: string;
  doctorName: string;
  email: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME';
  periodType: 'WEEK' | 'MONTH';
  periodStart: string;
  periodEnd: string;
  requiredHours: number;
  actualHours: number;
  completionRate: number;
  status: SystemAdminWorkloadStatus;
  warningFlag: boolean;
}

export interface SystemAdminDoctorWorkloadPagedResult {
  items: SystemAdminDoctorWorkloadListItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SystemAdminDoctorWorkloadQueryParams {
  periodType: SystemAdminWorkloadPeriodType;
  date: string;
  searchTerm?: string;
  employmentType?: SystemAdminWorkloadEmploymentType;
  status?: SystemAdminWorkloadStatus;
  warningOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// ============ ORGANISATIONS & DEVICES ============
export interface Organisation {
  id: string;
  name: string;
  address?: string;
  licenseNumber?: string;
  taxCode?: string;
  orgType: string;
  deviceCount: number;
  monthlyQuotaLimit?: number;
  monthlyQuotaUsed?: number;
  monthlyQuotaRemaining?: number;
  managedPatientCount?: number;
  registeredPatientCount?: number;
  walkInPatientCount?: number;
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

export interface OrganisationOnboardingRequestDto {
  id: string;
  organisationName: string;
  orgType: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone?: string | null;
  address?: string | null;
  licenseNumber?: string | null;
  taxCode?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
}

export interface ApproveOrganisationOnboardingResult {
  requestId: string;
  organisationId: string;
  orgAdminUserId: string;
  orgAdminEmail: string;
  temporaryPassword: string;
}

// ============ USERS & ROLES ============
export type UserRole =
  | 'Patient'
  | 'Ophthalmologist'
  | 'ClinicStaff'
  | 'SystemAdmin';

export interface User {
  id: string;
  name: string; // Mapped from fullName if needed
  fullName?: string; // Raw field from BE
  email: string;
  role: UserRole; // Mapped from roles[0]
  roles?: string[]; // Raw field from BE
  status: string; // Supports 'Active', 'Online', 'Locked', 'inactive', etc.
  organisationId?: string;
  organisationName?: string;
  lastLogin?: string; // Mapped from lastLoginAt
  lastLoginAt?: string; // Raw field from BE
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

/**
 * DTO matching BE AuditLogDto — real API response shape
 * oldValue/newValue are JSON strings (JSONB in PostgreSQL)
 */
export interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
}

/** @deprecated Use AuditLogDto for real API data */
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

// ============ CONTRACT TEMPLATES ============

export type ContractTypeValue =
  | 'OphthalmologistContract'
  | 'MedicalOrganizationContract';

export type EmploymentTypeValue = 'FullTime' | 'PartTime';

export interface ContractTemplateDto {
  id: string;
  title: string;
  type: ContractTypeValue;
  employmentType?: EmploymentTypeValue | null;
  contractVersion: string;
  isActive: boolean;
  variableCount: number;
  usageCount: number;
  effectiveDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractTemplateDetailDto extends ContractTemplateDto {
  contentTemplate: string;
}

export interface CreateContractTemplatePayload {
  title: string;
  type: number; // ContractType enum: OphthalmologistContract=1, MedicalOrganizationContract=2
  employmentType?: EmploymentTypeValue;
  contractVersion: string;
  effectiveDate?: string;
  templateFile: File;
}

export interface UpdateContractTemplatePayload {
  title: string;
  type: number;
  employmentType?: EmploymentTypeValue;
  contractVersion: string;
  effectiveDate?: string;
  templateFile?: File;
}

// ============ CONTRACTS ============

export type ContractStatusValue =
  | 'Draft'
  | 'PendingSignature'
  | 'Active'
  | 'Expired'
  | 'Terminated'
  | 'Cancelled';

export interface ContractDto {
  id: string;
  contractNumber: string;
  status: ContractStatusValue;
  templateId: string;
  templateTitle: string;
  contractType: ContractTypeValue;
  userId: string;
  userFullName: string;
  userEmail: string;
  aiQuotaLimit: number;
  monthlyQuotaLimit: number;
  platformCommissionRate: number;
  signedDate?: string;
  scannedDocumentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractDetailDto extends ContractDto {
  signedContent?: string;
}

export interface CreateContractPayload {
  userId: string;
  templateId: string;
  contractNumber: string;
  aiQuotaLimit: number;
  platformCommissionRate: number;
}

export interface UpdateContractPayload {
  templateId: string;
  aiQuotaLimit: number;
  monthlyQuotaLimit: number;
  platformCommissionRate: number;
}

export interface SignContractPayload {
  confirmedMonthlyQuotaLimit?: number;
  signedContent?: string;
  scannedDocumentUrl?: string;
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
