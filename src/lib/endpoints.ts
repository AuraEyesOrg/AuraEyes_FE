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
    REGISTER_ORGANISATION: '/auth/register/organisation',
  },

  // System Admin - Dashboard
  SYSTEM_ADMIN: {
    DASHBOARD: {
      STATS: '/system-admin/dashboard/metrics',
      PART_TIME_SLOT_USAGE: '/system-admin/dashboard/part-time-slot-usage',
      DOCTOR_WORKLOAD: '/system-admin/dashboard/doctor-workload',
      DOCTOR_WORKLOADS: '/system-admin/dashboard/doctor-workloads',
      SCREENING_VOLUME: '/system-admin/dashboard/screening-trends',
      RECENT_SCREENINGS: '/system-admin/dashboard/recent-screenings',
      SYSTEM_HEALTH: '/system-admin/dashboard/system-health',
      RISK_DISTRIBUTION: '/system-admin/dashboard/risk-analysis',
    },

    // Organisation & Device Management (formerly Clinic)
    ORGANISATIONS: {
      LIST: '/system-admin/organisations',
      DETAIL: (id: string) => `/system-admin/organisations/${id}`,
      UPDATE_MONTHLY_QUOTA: (id: string) =>
        `/system-admin/organisations/${id}/monthly-quota`,
      ONBOARDING_REQUESTS: '/system-admin/organisations/onboarding-requests',
      APPROVE_ONBOARDING: (id: string) =>
        `/system-admin/organisations/onboarding-requests/${id}/approve`,
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
      STATUS: (id: string) => `/system-admin/users/${id}/status`,
      METRICS: '/system-admin/users/metrics',
      // Backward-compatible alias for older callers.
      STATS: '/system-admin/users/metrics',
    },

    // Ophthalmologist Management
    OPHTHALMOLOGISTS: {
      LIST: '/system-admin/ophthalmologists',
      VERIFY: (id: string) => `/system-admin/ophthalmologists/${id}/verify`,
      UPDATE_PROFILE: (id: string) => `/ophthalmologists/${id}`,
      DELETE: (id: string) => `/system-admin/ophthalmologists/${id}`,
      PAY_SALARY: (id: string) =>
        `/system-admin/ophthalmologists/${id}/salary-payout`,
      WITHDRAWAL_REQUESTS: '/system-admin/ophthalmologists/withdrawal-requests',
      CONFIRM_WITHDRAWAL_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/withdrawal-requests/${requestId}/confirm`,
      REJECT_WITHDRAWAL_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/withdrawal-requests/${requestId}/reject`,
      LEAVE_REQUESTS: '/system-admin/ophthalmologists/leave-requests',
      APPROVE_LEAVE_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/leave-requests/${requestId}/approve`,
      REJECT_LEAVE_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/leave-requests/${requestId}/reject`,
      EMPLOYMENT_TYPE_CHANGE_REQUESTS:
        '/system-admin/ophthalmologists/employment-type-change-requests',
      APPROVE_EMPLOYMENT_TYPE_CHANGE_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/employment-type-change-requests/${requestId}/approve`,
      REJECT_EMPLOYMENT_TYPE_CHANGE_REQUEST: (requestId: string) =>
        `/system-admin/ophthalmologists/employment-type-change-requests/${requestId}/reject`,
    },

    // PayOS Payout Management (automated payout via PayOS API)
    PAYOUTS: {
      PROCESS: (withdrawalRequestId: string) =>
        `/admin/payouts/withdrawal-requests/${withdrawalRequestId}/process`,
      SYNC_STATUS: (withdrawalRequestId: string) =>
        `/admin/payouts/withdrawal-requests/${withdrawalRequestId}/sync-status`,
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

    // Cashflow Ledger
    CASHFLOW: {
      TRANSACTIONS: '/system-admin/cashflow/transactions',
    },
  },

  // Patient features
  PATIENT: {
    SCREENING: '/patient/screening',
    REPORTS: '/patient/reports',
    APPOINTMENTS: '/patient/appointments',
  },

  // Public endpoints used by guest-facing pages
  PUBLIC: {
    HEALTH: {
      ROOT: '/health',
    },
    SYSTEM_SETTINGS: '/system-settings',
    PATIENT_SEARCH: {
      OPHTHALMOLOGISTS: '/patient/search/ophthalmologists',
      ORGANISATIONS: '/patient/search/organisations',
      AVAILABLE_SLOTS: '/patient/search/available-slots',
    },
    RESOURCES: {
      EYE_HEALTH: '/patient/resources/eye-health',
    },
  },

  // Ophthalmologist features
  OPHTHALMOLOGIST: {
    DASHBOARD_METRICS: '/ophthalmologists/dashboard-metrics',
    PATIENTS: '/ophthalmologist/patients',
    SCREENINGS: '/ophthalmologist/screenings',
    REPORTS: '/ophthalmologist/reports',
    LEAVE_REQUESTS: {
      LIST: '/ophthalmologist/leave-requests',
      CREATE: '/ophthalmologist/leave-requests',
      CANCEL: (requestId: string) =>
        `/ophthalmologist/leave-requests/${requestId}/cancel`,
    },
    EMPLOYMENT_TYPE_CHANGE_REQUESTS: {
      LIST: '/ophthalmologist/employment-type-change-requests',
      CREATE: '/ophthalmologist/employment-type-change-requests',
      CANCEL: (requestId: string) =>
        `/ophthalmologist/employment-type-change-requests/${requestId}/cancel`,
    },
    CONTRACT: {
      MY_CONTRACT: '/ophthalmologists/my-contract',
      UPLOAD: '/ophthalmologists/my-contract/upload',
    },
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
    UPLOAD_IMAGES: '/consultation-sessions/upload-images',
    SUBMIT_REPORT: (sessionId: string) =>
      `/consultation-sessions/${sessionId}/verification-report`,
    SEND_MESSAGE: (sessionId: string) =>
      `/consultation-sessions/${sessionId}/messages`,
    CANCEL: (sessionId: string) => `/consultation-sessions/${sessionId}/cancel`,
    END: (sessionId: string) => `/consultation-sessions/${sessionId}/end`,
  },

  CONSENTS: {
    AGREE_SCREENING: (screeningId: string) =>
      `/consents/screenings/${screeningId}/agree`,
  },

  // Appointment Slots - Patient Booking Flow
  APPOINTMENT_SLOTS: {
    LIST: '/appointment-slots',
    BY_DOCTOR: (ophthalId: string) =>
      `/appointment-slots?ophthalId=${ophthalId}`,
    PRICING_RANGE: (ophthalId: string) =>
      `/appointment-slots/ophthalmologists/${ophthalId}/pricing-range`,
    DETAIL: (slotId: string) => `/appointment-slots/${slotId}`,
    UPDATE_STATUS: (slotId: string) => `/appointment-slots/${slotId}/status`,
    GENERATE: '/appointment-slots/generate',
    RESERVE: (slotId: string) => `/appointment-slots/${slotId}/reserve`,
    CONFIRM: (slotId: string) => `/appointment-slots/${slotId}/confirm`,
    RELEASE: (slotId: string) => `/appointment-slots/${slotId}/release`,
    BLOCK: (slotId: string) => `/appointment-slots/${slotId}/block`,
    UNBLOCK: (slotId: string) => `/appointment-slots/${slotId}/unblock`,
  },

  // Clinic booking flow (organisation visits)
  CLINIC_BOOKING: {
    AVAILABLE_SLOTS: (orgId: string) =>
      `/organisations/${orgId}/available-slots`,
    ORGANISATION_APPOINTMENTS: (orgId: string) =>
      `/organisations/${orgId}/appointments`,
    PATIENT_CLINIC_APPOINTMENTS: (patientId: string) =>
      `/patients/${patientId}/clinic-appointments`,
    ORGANISATION_SCHEDULE: (orgId: string) =>
      `/patient/search/organisations/${orgId}/schedule`,
  },

  CLINIC_APPOINTMENTS: {
    LIST: '/clinic-appointments',
    CREATE: '/clinic-appointments',
    CANCEL: (appointmentId: string) => `/clinic-appointments/${appointmentId}`,
    CHECK_IN: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/check-in`,
    START: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/start`,
    COMPLETE: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/complete`,
    NO_SHOW: (appointmentId: string) =>
      `/clinic-appointments/${appointmentId}/no-show`,
  },

  CLINIC_SCREENINGS: {
    CREATE_SESSION: '/clinic-screenings/create-session',
    DETAIL: (screeningId: string) => `/clinic-screenings/${screeningId}`,
    EXPORT_PDF: (screeningId: string) =>
      `/clinic-screenings/${screeningId}/report-pdf`,
    SHARE: (screeningId: string) => `/clinic-screenings/${screeningId}/share`,
    HISTORY: '/clinic-screenings/history',
  },

  CLINIC_QUEUE: {
    GET: '/clinic-queue',
    SEND_TO_DOCTOR: (visitId: string) =>
      `/clinic-queue/${visitId}/send-to-doctor`,
    PAYMENT_CONTEXT: (visitId: string) =>
      `/clinic-queue/${visitId}/payment-context`,
    CREATE_PAYMENT: (visitId: string) => `/clinic-queue/${visitId}/payment`,
  },

  // Healthcare Roadmap (doctor-authored care plan timeline)
  HEALTH_ROADMAP: {
    GET_BY_PATIENT: (patientId: string) => `/roadmap/${patientId}`,
    CREATE_STEP: '/roadmap/steps',
    UPDATE_STEP: (stepId: string) => `/roadmap/steps/${stepId}`,
    COMPLETE_STEP: (stepId: string) => `/roadmap/steps/${stepId}/complete`,
    DELETE_STEP: (stepId: string) => `/roadmap/steps/${stepId}`,
  },

  FEEDBACK: {
    WEBSITE: '/feedback/website',
    CLINIC: (clinicId: string) => `/feedback/clinics/${clinicId}`,
    OPHTHALMOLOGIST: (ophthalmologistId: string) =>
      `/feedback/ophthalmologists/${ophthalmologistId}`,
    CLINIC_ITEMS: (clinicId: string) => `/feedback/clinics/${clinicId}/items`,
    OPHTHALMOLOGIST_ITEMS: (ophthalmologistId: string) =>
      `/feedback/ophthalmologists/${ophthalmologistId}/items`,
    CLINIC_RATING: (clinicId: string) => `/feedback/clinics/${clinicId}/rating`,
    OPHTHALMOLOGIST_RATING: (ophthalmologistId: string) =>
      `/feedback/ophthalmologists/${ophthalmologistId}/rating`,
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
    CONTRACT: {
      MY_CONTRACT: '/organisations/my-contract',
      UPLOAD: '/organisations/my-contract/upload',
    },
    DASHBOARD_METRICS: '/organisations/dashboard-metrics',
    PATIENTS: '/organisations/patients',
    CALENDAR: '/organisation/calendar',
    ANALYTICS: '/organisation/analytics',
    SETTINGS: '/organisations/settings',
    // Organisation Screening
    SCREENING: {
      CREATE_SESSION: '/organisations/screenings/create-session',
      DETAIL: (screeningId: string) =>
        `/organisations/screenings/${screeningId}`,
      EXPORT_PDF: (screeningId: string) =>
        `/organisations/screenings/${screeningId}/report-pdf`,
      SHARE: (screeningId: string) =>
        `/organisations/screenings/${screeningId}/share`,
      HISTORY: '/organisations/screenings/history',
    },
    BILLING_SUMMARY: '/organisations/billing/summary',
    SCREENING_REPORTS: '/organisations/screening-reports',
    WALLET: {
      GET: '/wallets',
      TRANSACTIONS: '/wallets/transactions',
      CREATE_DEPOSIT: '/wallets/deposit',
    },
  },

  // AI Quota Management
  QUOTAS: {
    BALANCE: '/quotas/balance',
    BUY: '/quotas/buy',
    DEDUCT: '/quota/deduct',
  },

  // Notification Management
  NOTIFICATIONS: {
    /** GET - Paginated list of notifications */
    LIST: '/notifications',
    /** GET - Get unread notification count */
    UNREAD_COUNT: '/notifications/unread-count',
    /** POST - Mark a notification as read */
    MARK_READ: (notificationId: string) =>
      `/notifications/${notificationId}/mark-read`,
    /** POST - Mark all notifications as read */
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  // Financial - Order & Payment system (replaces wallet top-up for clinic bookings)
  FINANCIAL: {
    /** GET - Paginated payment order history for the current user */
    MY_ORDERS: '/financial/my-orders',
    /** GET - Single order with payments */
    ORDER: (id: string) => `/financial/orders/${id}`,
    /** POST - Create a new payment order */
    CREATE_ORDER: '/financial/orders',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
