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

    // Permission Management
    PERMISSIONS: {
      LIST: '/system-admin/permissions',
      DETAIL: (id: string) => `/system-admin/permissions/${id}`,
      CREATE: '/system-admin/permissions',
      UPDATE: (id: string) => `/system-admin/permissions/${id}`,
      DELETE: (id: string) => `/system-admin/permissions/${id}`,
      ROLES: {
        ALL: '/system-admin/permissions/roles',
        BY_ROLE: (roleId: string) =>
          `/system-admin/permissions/roles/${roleId}`,
        ASSIGN: '/system-admin/permissions/roles',
        REMOVE: (rolePermId: string) =>
          `/system-admin/permissions/roles/${rolePermId}`,
      },
      USERS: {
        BY_USER: (userId: string) =>
          `/system-admin/permissions/users/${userId}`,
        GRANT: '/system-admin/permissions/users',
        REVOKE: (userPermId: string) =>
          `/system-admin/permissions/users/${userPermId}/revoke`,
      },
    },

    // Contract Templates
    CONTRACT_TEMPLATES: {
      LIST: '/system-admin/contract-templates',
      DETAIL: (id: string) => `/system-admin/contract-templates/${id}`,
      CREATE: '/system-admin/contract-templates',
      UPDATE: (id: string) => `/system-admin/contract-templates/${id}`,
      DELETE: (id: string) => `/system-admin/contract-templates/${id}`,
      DUPLICATE: (id: string) =>
        `/system-admin/contract-templates/${id}/duplicate`,
      SET_STATUS: (id: string) =>
        `/system-admin/contract-templates/${id}/status`,
    },

    // Contracts
    CONTRACTS: {
      LIST: '/system-admin/contracts',
      DETAIL: (id: string) => `/system-admin/contracts/${id}`,
      CREATE: '/system-admin/contracts',
      UPDATE: (id: string) => `/system-admin/contracts/${id}`,
      SEND_FOR_SIGNATURE: (id: string) =>
        `/system-admin/contracts/${id}/send-for-signature`,
      SIGN: (id: string) => `/system-admin/contracts/${id}/sign`,
      TERMINATE: (id: string) => `/system-admin/contracts/${id}/terminate`,
      CANCEL: (id: string) => `/system-admin/contracts/${id}/cancel`,
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

  // Consultation Sessions
  CONSULTATION_SESSIONS: {
    LIST: '/consultation-sessions',
    DETAIL: (sessionId: string) => `/consultation-sessions/${sessionId}`,
    CREATE_VERIFICATION: '/consultation-sessions/verification',
    CREATE_VIDEO_CALL: '/consultation-sessions/video-call',
    SUBMIT_REPORT: (sessionId: string) =>
      `/consultation-sessions/${sessionId}/verification-report`,
    SEND_MESSAGE: (sessionId: string) =>
      `/consultation-sessions/${sessionId}/messages`,
    CANCEL: (sessionId: string) => `/consultation-sessions/${sessionId}/cancel`,
    END: (sessionId: string) => `/consultation-sessions/${sessionId}/end`,
  },

  // Appointment Slots - Patient Booking Flow
  APPOINTMENT_SLOTS: {
    LIST: '/appointment-slots',
    BY_DOCTOR: (ophthalId: string) =>
      `/appointment-slots?ophthalId=${ophthalId}`,
    DETAIL: (slotId: string) => `/appointment-slots/${slotId}`,
    GENERATE: '/appointment-slots/generate',
    RESERVE: (slotId: string) => `/appointment-slots/${slotId}/reserve`,
    CONFIRM: (slotId: string) => `/appointment-slots/${slotId}/confirm`,
    RELEASE: (slotId: string) => `/appointment-slots/${slotId}/release`,
    BLOCK: (slotId: string) => `/appointment-slots/${slotId}/block`,
    UNBLOCK: (slotId: string) => `/appointment-slots/${slotId}/unblock`,
  },

  // Clinic booking flow (organisation visits)
  CLINIC_BOOKING: {
    ORGANISATIONS: '/organisations',
    AVAILABLE_SLOTS: (orgId: string) =>
      `/organisations/${orgId}/available-slots`,
    ORGANISATION_APPOINTMENTS: (orgId: string) =>
      `/organisations/${orgId}/appointments`,
    PATIENT_CLINIC_APPOINTMENTS: (patientId: string) =>
      `/patients/${patientId}/clinic-appointments`,
  },

  CLINIC_APPOINTMENTS: {
    CREATE: '/clinic-appointments',
    CANCEL: (appointmentId: string) => `/clinic-appointments/${appointmentId}`,
    CHECK_IN: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/check-in`,
    ASSIGN_DOCTOR: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/assign-doctor`,
    START: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/start`,
    COMPLETE: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/complete`,
    NO_SHOW: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/no-show`,
  },

  // Schedule Templates - Doctor's recurring schedules
  SCHEDULE_TEMPLATES: {
    LIST: '/schedule-templates',
    BY_DOCTOR: (ophthalId: string) =>
      `/schedule-templates?ophthalId=${ophthalId}`,
    DETAIL: (templateId: string) => `/schedule-templates/${templateId}`,
    CREATE: '/schedule-templates',
    UPDATE: (templateId: string) => `/schedule-templates/${templateId}`,
    DELETE: (templateId: string) => `/schedule-templates/${templateId}`,
  },

  // Organisation features (from existing setup)
  ORGANISATION: {
    DASHBOARD: '/organisation/dashboard',
    PATIENTS: '/organisation/patients',
    CALENDAR: '/organisation/calendar',
    ANALYTICS: '/organisation/analytics',
    SETTINGS: '/organisation/settings',
  },

  // AI Quota Management
  QUOTAS: {
    BALANCE: '/quotas/balance',
    BUY: '/quotas/buy',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
