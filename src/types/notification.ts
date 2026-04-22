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

export type NotificationTypeValue = NotificationType | string | number;

const NOTIFICATION_TYPE_NAME_MAP: Record<string, NotificationType> = {
  aiscreeningcompleted: NotificationType.AiScreeningCompleted,
  consultationaccepted: NotificationType.ConsultationAccepted,
  consultationresultprovided: NotificationType.ConsultationResultProvided,
  newconsultationrequest: NotificationType.NewConsultationRequest,
  newpatientmessage: NotificationType.NewPatientMessage,
  newappointmentbooked: NotificationType.NewAppointmentBooked,
  schedulechanged: NotificationType.ScheduleChanged,
  walletdepositsuccess: NotificationType.WalletDepositSuccess,
  walletpaymentprocessed: NotificationType.WalletPaymentProcessed,
  systemalert: NotificationType.SystemAlert,
};

function isKnownNotificationType(value: number): value is NotificationType {
  return NotificationType[value] !== undefined;
}

function normalizeNotificationTypeKey(value: string): string {
  return value
    .trim()
    .replace(/[\s_-]/g, '')
    .toLowerCase();
}

export function parseNotificationType(
  type: NotificationTypeValue | null | undefined
): NotificationType | null {
  if (typeof type === 'number' && Number.isFinite(type)) {
    return isKnownNotificationType(type) ? type : null;
  }

  if (typeof type === 'string') {
    const trimmedType = type.trim();
    if (!trimmedType) {
      return null;
    }

    if (/^-?\d+$/.test(trimmedType)) {
      const parsedType = Number.parseInt(trimmedType, 10);
      return isKnownNotificationType(parsedType) ? parsedType : null;
    }

    const mappedType =
      NOTIFICATION_TYPE_NAME_MAP[normalizeNotificationTypeKey(trimmedType)];
    return mappedType ?? null;
  }

  return null;
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
  type: NotificationTypeValue;
  referenceId?: string | null;
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
  type: NotificationTypeValue;
  referenceId?: string | null;
  payload: NotificationPayloadRaw;
  createdAt: string;
}

/**
 * Paginated notifications response from API
 */
export interface NotificationsResponse {
  items: Notification[];
  unreadCount?: number;
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
  count?: number;
  unreadCount?: number;
}

/**
 * Helper to get notification icon based on type
 */
export function getNotificationIcon(type: NotificationTypeValue): string {
  const normalizedType = parseNotificationType(type);

  switch (normalizedType) {
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
export function getNotificationColor(type: NotificationTypeValue): string {
  const normalizedType = parseNotificationType(type);

  switch (normalizedType) {
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
  const normalize = (value: string) => value.replace(/[_-]/g, '').toLowerCase();

  const normalizedPayload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    normalizedPayload[normalize(key)] = value;
  }

  for (const key of keys) {
    const value = normalizedPayload[normalize(key)];
    if (typeof value === 'string' && value.length > 0) return value;
  }

  return '';
}

function appendIdQuery(path: string, key: string, value: string): string {
  if (!value) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function normalizeRouteHint(routeHintRaw: string): string {
  if (!routeHintRaw) return '';

  if (routeHintRaw.startsWith('/')) {
    return routeHintRaw;
  }

  return routeHintRaw.includes('/')
    ? `/${routeHintRaw.replace(/^\/+/, '')}`
    : '';
}

function hasRole(roles: string[], roleCandidates: string[]): boolean {
  return roleCandidates.some((candidate) => roles.includes(candidate));
}

function readBoolean(
  payload: Record<string, unknown>,
  ...keys: string[]
): boolean {
  const normalize = (value: string) => value.replace(/[_-]/g, '').toLowerCase();

  const normalizedPayload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    normalizedPayload[normalize(key)] = value;
  }

  for (const key of keys) {
    const value = normalizedPayload[normalize(key)];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();
      if (normalizedValue === 'true' || normalizedValue === '1') return true;
      if (normalizedValue === 'false' || normalizedValue === '0') return false;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
  }

  return false;
}

function getRoleHome(roles: string[]): string {
  if (hasRole(roles, ['systemadmin', 'admin']))
    return '/system-admin/dashboard';
  if (hasRole(roles, ['orgadmin', 'organization']))
    return '/organisation/dashboard';
  if (hasRole(roles, ['ophthalmologist', 'doctor']))
    return '/ophthalmologist/dashboard';
  if (hasRole(roles, ['patient'])) return '/patient/notifications';

  return '/notifications/view-all';
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
  const normalizedType = parseNotificationType(notification.type);
  const payload = parsePayload(notification.payload);
  const normalizedRouteHint = normalizeRouteHint(
    readString(payload, 'routeHint')
  );

  if (normalizedRouteHint) {
    return normalizedRouteHint;
  }

  const fallbackReferenceId =
    typeof notification.referenceId === 'string'
      ? notification.referenceId
      : '';

  const screeningId =
    readString(payload, 'aiScreeningId', 'screeningId') || fallbackReferenceId;
  const consultationId =
    readString(
      payload,
      'consultationSessionId',
      'sessionId',
      'consultationId'
    ) || fallbackReferenceId;
  const appointmentId =
    readString(payload, 'appointmentId', 'appointmentSlotId', 'slotId') ||
    fallbackReferenceId;
  const transactionId =
    readString(payload, 'transactionId') || fallbackReferenceId;

  const isSystemAdmin = hasRole(normalizedRoles, ['systemadmin', 'admin']);
  const isOrgAdmin = hasRole(normalizedRoles, ['orgadmin', 'organization']);
  const isDoctor = hasRole(normalizedRoles, ['ophthalmologist', 'doctor']);
  const isPatient = hasRole(normalizedRoles, ['patient']);

  const fallbackHome = getRoleHome(normalizedRoles);

  switch (normalizedType) {
    case NotificationType.AiScreeningCompleted: {
      if (isOrgAdmin && screeningId) {
        return appendIdQuery(
          '/organisation/screening/result',
          'id',
          screeningId
        );
      }

      const base = isPatient
        ? '/patient/screening'
        : isDoctor
          ? '/ophthalmologist/screenings'
          : isSystemAdmin
            ? '/system-admin/dashboard'
            : fallbackHome;
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
            : isSystemAdmin
              ? '/system-admin/verifications'
              : fallbackHome;
      return appendIdQuery(base, 'sessionId', consultationId);
    }

    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged: {
      const aiScreeningId = readString(payload, 'aiScreeningId', 'screeningId');
      const sharedMedicalData = readBoolean(payload, 'sharedMedicalData');

      if (isDoctor && aiScreeningId && sharedMedicalData) {
        return `/ophthalmologist/screenings/${encodeURIComponent(aiScreeningId)}/review`;
      }

      const consultationSessionId = readString(
        payload,
        'consultationSessionId',
        'consultationId',
        'sessionId'
      );
      const appointmentSlotId = readString(
        payload,
        'appointmentSlotId',
        'slotId',
        'appointmentId'
      );
      const base = isDoctor
        ? '/ophthalmologist/appointments'
        : isOrgAdmin
          ? '/organisation/calendar'
          : isPatient
            ? '/patient/appointments'
            : isSystemAdmin
              ? '/system-admin/dashboard'
              : fallbackHome;

      const preferredId =
        consultationSessionId || appointmentSlotId || appointmentId;

      return appendIdQuery(
        base,
        normalizedType === NotificationType.NewAppointmentBooked
          ? isPatient
            ? 'appointmentId'
            : 'sessionId'
          : 'appointmentId',
        preferredId
      );
    }

    case NotificationType.WalletDepositSuccess:
    case NotificationType.WalletPaymentProcessed: {
      const base = isPatient
        ? '/patient/wallet'
        : isOrgAdmin
          ? '/organisation/wallet'
          : isDoctor
            ? '/ophthalmologist/wallet'
            : isSystemAdmin
              ? '/system-admin/dashboard'
              : fallbackHome;
      return appendIdQuery(base, 'transactionId', transactionId);
    }

    case NotificationType.SystemAlert: {
      const action = readString(payload, 'action', 'notificationAction')
        .toLowerCase()
        .trim();
      const flowType = readString(
        payload,
        'verificationFlowType',
        'reviewFlowType',
        'flowType',
        'verificationFlow'
      )
        .toLowerCase()
        .trim();
      const isOrganisationVerificationFlow =
        flowType.includes('organisation') || flowType.includes('organization');
      const isVerificationFlow =
        flowType.includes('verification') ||
        flowType.includes('onboarding') ||
        flowType.includes('credential') ||
        isOrganisationVerificationFlow;

      const isVerificationSubmittedAction =
        action === 'verification_request_submitted' ||
        (action.includes('verification') &&
          (action.includes('request') || action.includes('submitted')));

      const isVerificationReviewAction =
        action === 'verification_review_completed' ||
        action === 'ophthalmologist_verification_approved' ||
        action === 'verification_review_rejected' ||
        action === 'ophthalmologist_verification_rejected' ||
        (action.includes('verification') &&
          (action.includes('review') ||
            action.includes('approved') ||
            action.includes('rejected')));

      const isContractActivatedAction =
        action === 'contract_activated' ||
        (action.includes('contract') && action.includes('activat'));

      if (action === 'ophthalmologist_email_confirmed') {
        return isSystemAdmin ? '/system-admin/verifications' : fallbackHome;
      }

      if (isVerificationSubmittedAction) {
        return isSystemAdmin
          ? '/system-admin/verifications'
          : isDoctor
            ? '/ophthalmologist/settings'
            : isOrgAdmin
              ? '/organisation/contract'
              : fallbackHome;
      }

      if (isVerificationReviewAction) {
        return isDoctor
          ? '/ophthalmologist/settings'
          : isOrgAdmin
            ? '/organisation/contract'
            : isSystemAdmin
              ? '/system-admin/verifications'
              : fallbackHome;
      }

      if (isContractActivatedAction) {
        return isDoctor
          ? '/ophthalmologist/contract'
          : isOrgAdmin
            ? '/organisation/contract'
            : fallbackHome;
      }

      if (isVerificationFlow) {
        return isSystemAdmin
          ? '/system-admin/verifications'
          : isDoctor
            ? '/ophthalmologist/settings'
            : isOrgAdmin
              ? '/organisation/contract'
              : fallbackHome;
      }

      if (isPatient) {
        return '/patient/notifications';
      }

      return fallbackHome;
    }

    default:
      return getRoleHome(normalizedRoles);
  }
}
