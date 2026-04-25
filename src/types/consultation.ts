/**
 * Consultation Session types matching backend DTOs exactly.
 * Maps to: Domain/Enums + Application/ConsultationSessions/Common/ConsultationSessionDtos
 */

export enum ConsultationSessionType {
  Verification = 1,
  VideoCall = 2,
  ClinicBooking = 3,
}

export enum SessionStatus {
  Pending = 1,
  Confirmed = 2,
  Completed = 3,
  Cancelled = 4,
}

export enum ChatStatus {
  Locked = 1,
  MemoOnly = 2,
  Open = 3,
  Archived = 4,
}

// ============ DTOs (match BE Application layer) ============

/** Chat message DTO - maps to ChatMessageDto */
export interface ChatMessageDto {
  id: string;
  senderUserId: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

/** Full session detail - maps to ConsultationSessionDto */
export interface ConsultationSessionDto {
  id: string;
  patientId: string;
  ophthalmologistId: string | null;
  organisationId: string | null;
  aiScreeningId: string | null;
  // Optional human-readable names coming from BE
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  ophthalmologistName?: string | null;
  organisationName?: string | null;
  ophthalmologistAvatarUrl?: string | null;
  type: ConsultationSessionType;
  typeName: string;
  status: SessionStatus;
  statusName: string;
  chatStatus: ChatStatus;
  chatStatusName: string;
  price: number;
  appointmentTime: string | null;
  meetingLink: string | null;
  lastActivityAt: string;
  closedAt: string | null;
  closedBy: string | null;
  closingReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  isRetinalImagesShared: boolean;
  isAIResultShared: boolean;
  caseSnapshot: ConsultationCaseSnapshotDto | null;
  messages: ChatMessageDto[];
}

export interface ConsultationCaseSnapshotDto {
  screeningId: string;
  riskLevel: string | null;
  confidenceScore: number | null;
  summary: string | null;
  findings: string | null;
  annotatedImageUrl: string | null;
  rawJsonOutput: string | null;
  originalImageUrls: string[];
  symptoms: string[];
}

/** List item - maps to ConsultationSessionListDto */
export interface ConsultationSessionListDto {
  id: string;
  patientId: string;
  ophthalmologistId: string | null;
  aiScreeningId?: string | null;
  // Optional human-readable names coming from BE
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  ophthalmologistName?: string | null;
  organisationName?: string | null;
  ophthalmologistAvatarUrl?: string | null;
  type: ConsultationSessionType;
  typeName: string;
  status: SessionStatus;
  statusName: string;
  chatStatus: ChatStatus;
  chatStatusName: string;
  price: number;
  appointmentTime: string | null;
  meetingLink?: string | null;
  lastActivityAt: string;
  createdAt: string;
  closedAt: string | null;

  // Consent flags + lightweight AI snapshot (for list displays).
  isRetinalImagesShared?: boolean;
  isAIResultShared?: boolean;
  caseSnapshot?: ConsultationCaseSnapshotDto | null;

  /** Truncated text of the most recent chat message (from BE list endpoint). */
  latestMessagePreview?: string | null;
}

// ============ REQUEST MODELS (match BE Controller request records) ============

export interface CreateVerificationSessionRequest {
  patientId: string;
  aiScreeningId: string;
  price: number;
  ophthalmologistId?: string;
}

export interface CreateVideoCallSessionRequest {
  patientId: string;
  price: number;
  appointmentTime: string; // ISO date string
  ophthalmologistId?: string;
}

export interface SubmitVerificationReportRequest {
  doctorId: string;

  // New payload fields.
  diagnosisCode?: string;
  codingSystem?: string;
  clinicalFindings?: string;
  severityLevel?: string;
  confidenceLevel?: number;
  treatmentPlan?: string;
  recommendations?: string;
  lifestyleAdvice?: string;
  isUrgent?: boolean;
  status?: string;
  followUpDate?: string;
  isReferralNeeded?: boolean;
  finalizedAt?: string;

  // Backward-compatible aliases for legacy clients.
  diagnosesCode?: string;
  diagnosesText?: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface CancelSessionRequest {
  cancelledByUserId: string;
  reason?: string;
}

export interface EndSessionRequest {
  doctorId: string;
}

// ============ QUERY PARAMS ============

export interface GetConsultationSessionsParams {
  patientId?: string;
  ophthalmologistId?: string;
  aiScreeningId?: string;
  type?: ConsultationSessionType;
  status?: SessionStatus;
  chatStatus?: ChatStatus;
  pageNumber?: number;
  pageSize?: number;
}

// ============ HELPER MAPS ============

export const SESSION_TYPE_LABELS: Record<ConsultationSessionType, string> = {
  [ConsultationSessionType.Verification]: 'Verification',
  [ConsultationSessionType.VideoCall]: 'Video Call',
  [ConsultationSessionType.ClinicBooking]: 'Clinic Booking',
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.Pending]: 'Pending',
  [SessionStatus.Confirmed]: 'Confirmed',
  [SessionStatus.Completed]: 'Completed',
  [SessionStatus.Cancelled]: 'Cancelled',
};

export const CHAT_STATUS_LABELS: Record<ChatStatus, string> = {
  [ChatStatus.Locked]: 'Locked',
  [ChatStatus.MemoOnly]: 'Memo Only',
  [ChatStatus.Open]: 'Open',
  [ChatStatus.Archived]: 'Archived',
};
