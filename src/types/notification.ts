/**
 * Notification Types for AURA System
 * Mirrors backend NotificationType enum exactly
 */

/**
 * NotificationType enum matching backend Domain/Enums/NotificationType.cs
 */
export enum NotificationType {
  /** FR-45: When AI screening is completed */
  AiScreeningCompleted = 0,

  /** FR-46: When ophthalmologist accepts consultation request */
  ConsultationAccepted = 1,

  /** FR-47: When ophthalmologist provides verification result */
  ConsultationResultProvided = 2,

  /** FR-46: When patient requests consultation (for doctor) */
  NewConsultationRequest = 3,

  /** FR-47: When patient sends message in consultation chat */
  NewPatientMessage = 4,

  /** FR-48: When a new appointment is booked */
  NewAppointmentBooked = 5,

  /** FR-48: When appointment schedule changes */
  ScheduleChanged = 6,

  /** FR-49: When wallet deposit is successful */
  WalletDepositSuccess = 7,

  /** FR-49: When payment is processed from wallet */
  WalletPaymentProcessed = 8,

  /** Internal platform alert for operational/admin actions */
  SystemAlert = 9,
}

/**
 * Base notification payload interface - all payloads extend this
 */
export interface BaseNotificationPayload {
  timestamp: string;
}

/**
 * Screening-related notification payload
 */
export interface ScreeningNotificationPayload extends BaseNotificationPayload {
  screeningId: string;
  riskLevel: string;
  deviceName?: string;
}

/**
 * Consultation-related notification payload
 */
export interface ConsultationNotificationPayload extends BaseNotificationPayload {
  sessionId: string;
  doctorName?: string;
  patientName?: string;
  diagnosis?: string;
}

/**
 * Chat message notification payload
 */
export interface ChatMessageNotificationPayload extends BaseNotificationPayload {
  sessionId: string;
  messageId: string;
  senderName: string;
  preview: string;
}

/**
 * Appointment notification payload
 */
export interface AppointmentNotificationPayload extends BaseNotificationPayload {
  appointmentId: string;
  doctorName: string;
  appointmentTime: string;
  previousTime?: string;
  reason?: string;
}

/**
 * Wallet transaction notification payload
 */
export interface WalletNotificationPayload extends BaseNotificationPayload {
  transactionId: string;
  amount: number;
  newBalance: number;
  description?: string;
}

/**
 * Union type for all notification payloads
 */
export type NotificationPayload =
  | ScreeningNotificationPayload
  | ConsultationNotificationPayload
  | ChatMessageNotificationPayload
  | AppointmentNotificationPayload
  | WalletNotificationPayload
  | Record<string, unknown>;

export type NotificationPayloadRaw =
  | NotificationPayload
  | string
  | null
  | undefined;

/**
 * Core notification interface matching backend Notification entity
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  payload: NotificationPayloadRaw;
  createdAt: string;
}

/**
 * Real-time notification received from SignalR
 */
export interface SignalRNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  payload: NotificationPayloadRaw;
  createdAt: string;
}

/**
 * Paginated notifications response from API
 */
export interface NotificationsResponse {
  items: Notification[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Helper to get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.AiScreeningCompleted:
      return 'eye';
    case NotificationType.ConsultationAccepted:
    case NotificationType.NewConsultationRequest:
      return 'stethoscope';
    case NotificationType.ConsultationResultProvided:
      return 'file-text';
    case NotificationType.NewPatientMessage:
      return 'message-circle';
    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged:
      return 'calendar';
    case NotificationType.WalletDepositSuccess:
    case NotificationType.WalletPaymentProcessed:
      return 'wallet';
    case NotificationType.SystemAlert:
      return 'bell';
    default:
      return 'bell';
  }
}

/**
 * Helper to get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.AiScreeningCompleted:
      return 'text-blue-500';
    case NotificationType.ConsultationAccepted:
    case NotificationType.ConsultationResultProvided:
      return 'text-green-500';
    case NotificationType.NewConsultationRequest:
    case NotificationType.NewPatientMessage:
      return 'text-purple-500';
    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged:
      return 'text-orange-500';
    case NotificationType.WalletDepositSuccess:
      return 'text-emerald-500';
    case NotificationType.WalletPaymentProcessed:
      return 'text-amber-500';
    case NotificationType.SystemAlert:
      return 'text-sky-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Helper to get notification route based on type and payload
 */
function parsePayload(
  payload: NotificationPayloadRaw
): Record<string, unknown> {
  if (!payload) return {};

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  return payload as Record<string, unknown>;
}

function readString(
  payload: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

function appendIdQuery(path: string, key: string, value: string): string {
  if (!value) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function hasRole(roles: string[], roleCandidates: string[]): boolean {
  return roleCandidates.some((candidate) => roles.includes(candidate));
}

function getRoleHome(roles: string[]): string {
  if (hasRole(roles, ['systemadmin'])) return '/system-admin/dashboard';
  if (hasRole(roles, ['orgadmin', 'organization', 'clinic']))
    return '/organisation/dashboard';
  if (hasRole(roles, ['ophthalmologist', 'doctor']))
    return '/ophthalmologist/dashboard';
  if (hasRole(roles, ['patient'])) return '/patient/notifications';

  return '/notifications';
}

/**
 * Resolve route from notification type + payload with role-aware destination.
 * Roles are optional and are compared case-insensitively.
 */
export function getNotificationRoute(
  notification: Notification,
  roles: string[] = []
): string {
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  const payload = parsePayload(notification.payload);

  const screeningId = readString(payload, 'screeningId', 'aiScreeningId');
  const consultationId = readString(payload, 'sessionId', 'consultationId');
  const appointmentId = readString(payload, 'appointmentId', 'slotId');
  const transactionId = readString(payload, 'transactionId');

  const _isSystemAdmin = hasRole(normalizedRoles, ['systemadmin']);
  const isOrgAdmin = hasRole(normalizedRoles, [
    'orgadmin',
    'organization',
    'clinic',
  ]);
  const isDoctor = hasRole(normalizedRoles, ['ophthalmologist', 'doctor']);
  const isPatient =
    hasRole(normalizedRoles, ['patient']) || normalizedRoles.length === 0;

  switch (notification.type) {
    case NotificationType.AiScreeningCompleted: {
      const base = isPatient
        ? '/patient/reports'
        : isDoctor
          ? '/ophthalmologist/screenings'
          : isOrgAdmin
            ? '/organisation/patients'
            : '/system-admin/dashboard';
      return appendIdQuery(base, 'screeningId', screeningId);
    }

    case NotificationType.ConsultationAccepted:
    case NotificationType.ConsultationResultProvided:
    case NotificationType.NewConsultationRequest:
    case NotificationType.NewPatientMessage: {
      const base = isDoctor
        ? '/ophthalmologist/consultations'
        : isPatient
          ? '/patient/chat'
          : isOrgAdmin
            ? '/organisation/calendar'
            : '/system-admin/verifications';
      return appendIdQuery(base, 'sessionId', consultationId);
    }

    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged: {
      const aiScreeningId = readString(
        payload,
        'aiScreeningId',
        'AiScreeningId'
      );
      const sharedMedicalData =
        payload['sharedMedicalData'] === true ||
        payload['SharedMedicalData'] === true;

      if (isDoctor && aiScreeningId && sharedMedicalData) {
        return `/ophthalmologist/screenings/${aiScreeningId}/review`;
      }

      const sessionOrSlotId = readString(
        payload,
        'consultationSessionId',
        'ConsultationSessionId',
        'appointmentId',
        'AppointmentSlotId',
        'slotId'
      );
      const base = isDoctor
        ? '/ophthalmologist/appointments'
        : isOrgAdmin
          ? '/organisation/calendar'
          : isPatient
            ? '/patient/appointments'
            : '/system-admin/dashboard';
      return appendIdQuery(
        base,
        notification.type === NotificationType.NewAppointmentBooked
          ? 'sessionId'
          : 'appointmentId',
        sessionOrSlotId || appointmentId
      );
    }

    case NotificationType.WalletDepositSuccess:
    case NotificationType.WalletPaymentProcessed: {
      const base = isPatient
        ? '/patient/wallet'
        : isOrgAdmin
          ? '/organisation/dashboard'
          : isDoctor
            ? '/ophthalmologist/dashboard'
            : '/system-admin/dashboard';
      return appendIdQuery(base, 'transactionId', transactionId);
    }

    default:
      return getRoleHome(normalizedRoles);
  }
}
