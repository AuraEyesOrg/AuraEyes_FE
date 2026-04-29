/**
 * Centralized Permission Constants
 *
 * This file mirrors the backend Permissions.cs constants.
 * Use these constants throughout the frontend to ensure consistency
 * and avoid hardcoded permission strings.
 *
 * Format: Permissions.ResourceAction = 'resource:action'
 */

export const Permissions = {
  // Users
  UsersRead: 'users:read',
  UsersCreate: 'users:create',
  UsersUpdate: 'users:update',
  UsersDelete: 'users:delete',
  UsersManageRoles: 'users:manage-roles',

  // Permissions
  PermissionsRead: 'permissions:read',
  PermissionsManage: 'permissions:manage',

  // Patients
  PatientsRead: 'patients:read',
  PatientsCreate: 'patients:create',
  PatientsUpdate: 'patients:update',
  PatientsDelete: 'patients:delete',

  // Ophthalmologists
  OphthalmologistsRead: 'ophthalmologists:read',
  OphthalmologistsCreate: 'ophthalmologists:create',
  OphthalmologistsUpdate: 'ophthalmologists:update',
  OphthalmologistsVerify: 'ophthalmologists:verify',
  OphthalmologistsDelete: 'ophthalmologists:delete',

  // Organisations
  OrganisationsRead: 'organisations:read',
  OrganisationsCreate: 'organisations:create',
  OrganisationsUpdate: 'organisations:update',
  OrganisationsDelete: 'organisations:delete',

  // Screening
  ScreeningRead: 'screening:read',
  ScreeningCreate: 'screening:create',
  ScreeningApprove: 'screening:approve',

  // Consultations
  ConsultationsRead: 'consultations:read',
  ConsultationsCreate: 'consultations:create',
  ConsultationsUpdate: 'consultations:update',

  // Appointments & Scheduling
  AppointmentsRead: 'appointments:read',
  AppointmentsCreate: 'appointments:create',
  AppointmentsManage: 'appointments:manage',
  ApptSlotsManage: 'appt-slots:manage',
  SchedulesManage: 'schedules:manage',

  // Visit Records
  VisitsRead: 'visits:read',
  VisitsManage: 'visits:manage',

  // Orders & Billing
  OrdersRead: 'orders:read',
  OrdersManage: 'orders:manage',

  // Payments
  PaymentsRead: 'payments:read',
  PaymentsManage: 'payments:manage',

  // Clinic Staff
  ClinicStaffRead: 'clinic-staff:read',
  ClinicStaffCreate: 'clinic-staff:create',
  ClinicStaffUpdate: 'clinic-staff:update',
  ClinicStaffDelete: 'clinic-staff:delete',

  // Quotas
  QuotasRead: 'quotas:read',
  QuotasBuy: 'quotas:buy',

  // Wallets
  WalletsRead: 'wallets:read',
  WalletsDeposit: 'wallets:deposit',
  WalletsWithdraw: 'wallets:withdraw',
  WalletsHistory: 'wallets:history',
  WalletsManage: 'wallets:manage',

  // Financial Admin
  PayoutsRead: 'payouts:read',
  PayoutsManage: 'payouts:manage',
  CashflowRead: 'cashflow:read',

  // Legal & Contracts
  ContractsRead: 'contracts:read',
  ContractsManage: 'contracts:manage',
  ContractTemplatesManage: 'contracts:templates-manage',

  // Platform & Models
  AiModelsRead: 'aimodels:read',
  AiModelsManage: 'aimodels:manage',
  NetworkManage: 'network:manage',
  FeedbackRead: 'feedback:read',
  RoadmapsManage: 'roadmaps:manage',

  // Settings
  SettingsRead: 'settings:read',
  SettingsManage: 'settings:manage',

  // Notifications
  NotificationsManage: 'notifications:manage',

  // Audit
  AuditLogsRead: 'audit-logs:read',

  // Dashboard
  DashboardRead: 'dashboard:read',

  // Medical Records
  MedicalRecordsRead: 'medical-records:read',
  MedicalRecordsCreate: 'medical-records:create',
  MedicalRecordsUpdate: 'medical-records:update',
  MedicalRecordsFinalize: 'medical-records:finalize',
} as const;

export type PermissionValue = (typeof Permissions)[keyof typeof Permissions];
