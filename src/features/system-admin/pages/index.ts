/**
 * System Admin Pages
 * Barrel exports for all System Admin pages
 */

export { default as DashboardPage } from './dashboard';
export { default as StatusPage } from './status';
export { default as OrganisationsPage } from './organisations';
export { default as PatientsPage } from './patients';
export { default as OphthalmologistsPage } from './ophthalmologists';
export { default as VerificationRequestsPage } from './verification-requests';
export { default as AuditLogsPage } from './audit-logs';
export { default as SettingsPage } from './settings';

// Legacy export - keeping users.tsx for backward compatibility
export { default as UsersPage } from './users';

export { default as PermissionsPage } from './permissions';
export { default as ContractTemplatesPage } from './contract-templates';
export { default as ContractTemplateEditorPage } from './contract-template-editor';
export { default as CashflowPage } from './cashflow';
export { default as LeaveRequestsPage } from './leave-requests';
export { default as SchedulingPage } from './scheduling';

// Legacy default export for backward compatibility
export { default } from './dashboard';
