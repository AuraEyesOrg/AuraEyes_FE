/**
 * System Admin Feature Module
 * Central barrel export for the System Admin feature
 *
 * This module contains all functionality for system administration
 * including dashboard, organisations, users, AI models, and audit logs.
 */

// Pages
export {
  DashboardPage,
  OrganisationsPage,
  UsersPage,
  AIModelsPage,
  AuditLogsPage,
} from './pages';

// Components
export {
  Sidebar,
  PageHeader,
  StatsCard,
  StatusBadge,
  RiskBadge,
  DataTable,
} from './components';
export type { TableColumn } from './components';

// Services
export {
  dashboardService,
  organisationService,
  userService,
  aiModelService,
  auditService,
} from './services';

// Types - re-export all types
export type * from './types';
