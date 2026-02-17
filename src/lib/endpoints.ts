/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for the AURA .NET backend
 */

export const API_ENDPOINTS = {
  // Authentication (already implemented - do not modify)
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // System Admin - Dashboard
  SYSTEM_ADMIN: {
    DASHBOARD: {
      STATS: '/system-admin/dashboard/stats',
      SCREENING_VOLUME: '/system-admin/dashboard/screening-volume',
      RECENT_SCREENINGS: '/system-admin/dashboard/recent-screenings',
      SYSTEM_HEALTH: '/system-admin/dashboard/system-health',
      RISK_DISTRIBUTION: '/system-admin/dashboard/risk-distribution',
    },

    // Organisation & Device Management (formerly Clinic)
    ORGANISATIONS: {
      LIST: '/system-admin/organisations',
      DETAIL: (id: string) => `/system-admin/organisations/${id}`,
      CREATE: '/system-admin/organisations',
      UPDATE: (id: string) => `/system-admin/organisations/${id}`,
      DELETE: (id: string) => `/system-admin/organisations/${id}`,
      TOGGLE_STATUS: (id: string) => `/system-admin/organisations/${id}/status`,
    },

    // Device Management
    DEVICES: {
      LIST: '/system-admin/devices',
      DETAIL: (id: string) => `/system-admin/devices/${id}`,
      BY_ORGANISATION: (orgId: string) =>
        `/system-admin/organisations/${orgId}/devices`,
      TOGGLE_STATUS: (id: string) => `/system-admin/devices/${id}/status`,
      CALIBRATION_LOGS: (id: string) =>
        `/system-admin/devices/${id}/calibration-logs`,
      ALERTS: '/system-admin/devices/alerts',
    },

    // User & Role Management
    USERS: {
      LIST: '/system-admin/users',
      DETAIL: (id: string) => `/system-admin/users/${id}`,
      UPDATE_ROLE: (id: string) => `/system-admin/users/${id}/role`,
      LOCK: (id: string) => `/system-admin/users/${id}/lock`,
      UNLOCK: (id: string) => `/system-admin/users/${id}/unlock`,
      STATS: '/system-admin/users/stats',
    },

    // Ophthalmologist Management
    OPHTHALMOLOGISTS: {
      LIST: '/system-admin/ophthalmologists',
      VERIFY: (id: string) => `/system-admin/ophthalmologists/${id}/verify`,
    },

    // Patient Management
    PATIENTS: {
      LIST: '/system-admin/patients',
      UPDATE_STATUS: (userId: string) =>
        `/system-admin/patients/${userId}/status`,
    },

    // AI Model Monitoring
    AI_MODELS: {
      CURRENT: '/system-admin/ai-models/current',
      KPIS: '/system-admin/ai-models/kpis',
      PERFORMANCE_TREND: '/system-admin/ai-models/performance-trend',
      DEMOGRAPHIC_PARITY: '/system-admin/ai-models/demographic-parity',
      VERSION_HISTORY: '/system-admin/ai-models/versions',
      ALERTS: '/system-admin/ai-models/alerts',
    },

    // Audit Logs & Compliance
    AUDIT_LOGS: {
      LIST: '/system-admin/audit-logs',
      DETAIL: (id: string) => `/system-admin/audit-logs/${id}`,
      STATS: '/system-admin/audit-logs/stats',
      EXPORT: '/system-admin/audit-logs/export',
    },

    COMPLIANCE: {
      OVERVIEW: '/system-admin/compliance/overview',
      REPORTS: '/system-admin/compliance/reports',
      GENERATE_REPORT: '/system-admin/compliance/reports/generate',
    },
  },

  // Patient features
  PATIENT: {
    SCREENING: '/patient/screening',
    REPORTS: '/patient/reports',
    APPOINTMENTS: '/patient/appointments',
  },

  // Ophthalmologist features
  OPHTHALMOLOGIST: {
    PATIENTS: '/ophthalmologist/patients',
    SCREENINGS: '/ophthalmologist/screenings',
    REPORTS: '/ophthalmologist/reports',
    SCHEDULES: {
      LIST: (ophthalmologistId: string) =>
        `/ophthalmologists/${ophthalmologistId}/schedules`,
      DETAIL: (ophthalmologistId: string, scheduleId: string) =>
        `/ophthalmologists/${ophthalmologistId}/schedules/${scheduleId}`,
      CREATE: (ophthalmologistId: string) =>
        `/ophthalmologists/${ophthalmologistId}/schedules`,
      UPDATE_STATUS: (ophthalmologistId: string, scheduleId: string) =>
        `/ophthalmologists/${ophthalmologistId}/schedules/${scheduleId}/status`,
    },
  },

  // Organisation features (from existing setup)
  ORGANISATION: {
    DASHBOARD: '/organisation/dashboard',
    PATIENTS: '/organisation/patients',
    CALENDAR: '/organisation/calendar',
    ANALYTICS: '/organisation/analytics',
    SETTINGS: '/organisation/settings',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
