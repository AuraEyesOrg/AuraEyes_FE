/**
 * System Admin Pages
 * Barrel exports for all System Admin pages
 */

export { default as DashboardPage } from './dashboard';
export { default as OrganisationsPage } from './organisations';
export { default as UsersPage } from './users';
export { default as AIModelsPage } from './ai-models';
export { default as AuditLogsPage } from './audit-logs';

// Legacy default export for backward compatibility
export { default } from './dashboard';
