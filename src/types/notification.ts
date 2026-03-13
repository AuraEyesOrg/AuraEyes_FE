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
  payload: NotificationPayload;
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
  payload: NotificationPayload;
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
    default:
      return 'text-gray-500';
  }
}

/**
 * Helper to get notification route based on type and payload
 */
export function getNotificationRoute(notification: Notification): string {
  const { type, payload } = notification;

  switch (type) {
    case NotificationType.AiScreeningCompleted:
      return `/screenings/${(payload as ScreeningNotificationPayload).screeningId}`;

    case NotificationType.ConsultationAccepted:
    case NotificationType.ConsultationResultProvided:
    case NotificationType.NewConsultationRequest:
    case NotificationType.NewPatientMessage:
      return `/consultations/${(payload as ConsultationNotificationPayload).sessionId}`;

    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged:
      return `/appointments/${(payload as AppointmentNotificationPayload).appointmentId}`;

    case NotificationType.WalletDepositSuccess:
    case NotificationType.WalletPaymentProcessed:
      return `/wallet/transactions/${(payload as WalletNotificationPayload).transactionId}`;

    default:
      return '/notifications';
  }
}
