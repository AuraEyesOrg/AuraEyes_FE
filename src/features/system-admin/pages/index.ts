/**
 * System Admin Pages
 * Barrel exports for all System Admin pages
 */

export { default as DashboardPage } from './dashboard';
export { default as OrganisationsPage } from './organisations';
export { default as PatientsPage } from './patients';
export { default as OphthalmologistsPage } from './ophthalmologists';
export { default as AIModelsPage } from './ai-models';
export { default as AuditLogsPage } from './audit-logs';
export { default as SettingsPage } from './settings';

// Legacy export - keeping users.tsx for backward compatibility
export { default as UsersPage } from './users';

export { default as PermissionsPage } from './permissions';

// Legacy default export for backward compatibility
export { default } from './dashboard';
