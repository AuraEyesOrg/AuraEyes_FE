/**
 * Consultation Sessions API
 * All functions follow the existing pattern: use `api` from '@/lib/api',
 * return unwrapped `response.data.data!` typed with `ApiResponse<T>`.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ConsultationCaseSnapshotDto,
  ChatMessageDto,
  ChatStatus,
  ConsultationSessionDto,
  ConsultationSessionListDto,
  ConsultationSessionType,
  CreateVerificationSessionRequest,
  CreateVideoCallSessionRequest,
  SubmitVerificationReportRequest,
  SendMessageRequest,
  CancelSessionRequest,
  EndSessionRequest,
  GetConsultationSessionsParams,
  SessionStatus,
} from '@/types/consultation';
import {
  CHAT_STATUS_LABELS,
  ChatStatus as ChatStatusEnum,
  SESSION_STATUS_LABELS,
  ConsultationSessionType as ConsultationSessionTypeEnum,
  SessionStatus as SessionStatusEnum,
} from '@/types/consultation';

// Re-use the ApiResponse wrapper that the BE sends
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

type RawEnumValue = string | number | null | undefined;

interface RawChatMessageDto {
  id: string;
  senderUserId: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

interface RawConsultationSessionDto {
  id: string;
  patientId: string;
  ophthalmologistId: string | null;
  organisationId: string | null;
  aiScreeningId: string | null;
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  ophthalmologistName?: string | null;
  organisationName?: string | null;
  ophthalmologistAvatarUrl?: string | null;
  type: RawEnumValue;
  typeName?: string;
  status: RawEnumValue;
  statusName?: string;
  chatStatus: RawEnumValue;
  chatStatusName?: string;
  price: number;
  appointmentTime: string | null;
  meetingLink: string | null;
  lastActivityAt: string;
  closedAt: string | null;
  closedBy: string | null;
  closingReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  isRetinalImagesShared?: boolean;
  isAIResultShared?: boolean;
  caseSnapshot?: RawConsultationCaseSnapshotDto | null;
  messages?: RawChatMessageDto[];
}

interface RawConsultationCaseSnapshotDto {
  screeningId: string;
  riskLevel?: string | null;
  confidenceScore?: number | null;
  summary?: string | null;
  findings?: string | null;
  annotatedImageUrl?: string | null;
  rawJsonOutput?: string | null;
  originalImageUrls?: string[] | null;
  symptoms?: string[] | null;
}

interface RawConsultationSessionListDto {
  id: string;
  patientId: string;
  ophthalmologistId: string | null;
  patientName?: string | null;
  patientAvatarUrl?: string | null;
  ophthalmologistName?: string | null;
  organisationName?: string | null;
  ophthalmologistAvatarUrl?: string | null;
  type: RawEnumValue;
  typeName?: string;
  status: RawEnumValue;
  statusName?: string;
  chatStatus: RawEnumValue;
  chatStatusName?: string;
  price: number;
  appointmentTime: string | null;
  meetingLink?: string | null;
  lastActivityAt: string;
  createdAt: string;
}

const consultationTypeMap: Record<string, ConsultationSessionType> = {
  Verification: ConsultationSessionTypeEnum.Verification,
  VideoCall: ConsultationSessionTypeEnum.VideoCall,
  ClinicBooking: ConsultationSessionTypeEnum.ClinicBooking,
};

const sessionStatusMap: Record<string, SessionStatus> = {
  Pending: SessionStatusEnum.Pending,
  Confirmed: SessionStatusEnum.Confirmed,
  Completed: SessionStatusEnum.Completed,
  Cancelled: SessionStatusEnum.Cancelled,
};

const chatStatusMap: Record<string, ChatStatus> = {
  Locked: ChatStatusEnum.Locked,
  MemoOnly: ChatStatusEnum.MemoOnly,
  Open: ChatStatusEnum.Open,
  Archived: ChatStatusEnum.Archived,
};

const normalizeEnumValue = <T extends number>(
  value: RawEnumValue,
  map: Record<string, T>,
  fallback: T
): T => {
  if (typeof value === 'number') {
    return value as T;
  }

  if (typeof value === 'string') {
    if (value in map) {
      return map[value];
    }

    const parsedValue = Number(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue as T;
    }
  }

  return fallback;
};

const mapMessage = (message: RawChatMessageDto): ChatMessageDto => ({
  id: message.id,
  senderUserId: message.senderUserId,
  message: message.message,
  isRead: message.isRead,
  sentAt: message.sentAt,
});

const mapCaseSnapshot = (
  snapshot?: RawConsultationCaseSnapshotDto | null
): ConsultationCaseSnapshotDto | null => {
  if (!snapshot) return null;
  return {
    screeningId: snapshot.screeningId,
    riskLevel: snapshot.riskLevel ?? null,
    confidenceScore: snapshot.confidenceScore ?? null,
    summary: snapshot.summary ?? null,
    findings: snapshot.findings ?? null,
    annotatedImageUrl: snapshot.annotatedImageUrl ?? null,
    rawJsonOutput: snapshot.rawJsonOutput ?? null,
    originalImageUrls: snapshot.originalImageUrls ?? [],
    symptoms: snapshot.symptoms ?? [],
  };
};

const mapConsultationSession = (
  session: RawConsultationSessionDto
): ConsultationSessionDto => {
  const type = normalizeEnumValue(
    session.type,
    consultationTypeMap,
    ConsultationSessionTypeEnum.Verification
  );
  const status = normalizeEnumValue(
    session.status,
    sessionStatusMap,
    SessionStatusEnum.Pending
  );
  const chatStatus = normalizeEnumValue(
    session.chatStatus,
    chatStatusMap,
    ChatStatusEnum.Locked
  );

  return {
    id: session.id,
    patientId: session.patientId,
    ophthalmologistId: session.ophthalmologistId,
    organisationId: session.organisationId,
    aiScreeningId: session.aiScreeningId,
    patientName: session.patientName ?? null,
    patientAvatarUrl: session.patientAvatarUrl ?? null,
    ophthalmologistName: session.ophthalmologistName ?? null,
    organisationName: session.organisationName ?? null,
    ophthalmologistAvatarUrl: session.ophthalmologistAvatarUrl ?? null,
    type,
    typeName: session.typeName ?? ConsultationSessionTypeEnum[type],
    status,
    statusName: session.statusName ?? SESSION_STATUS_LABELS[status],
    chatStatus,
    chatStatusName: session.chatStatusName ?? CHAT_STATUS_LABELS[chatStatus],
    price: session.price,
    appointmentTime: session.appointmentTime,
    meetingLink: session.meetingLink,
    lastActivityAt: session.lastActivityAt,
    closedAt: session.closedAt,
    closedBy: session.closedBy,
    closingReason: session.closingReason,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    isRetinalImagesShared: Boolean(session.isRetinalImagesShared),
    isAIResultShared: Boolean(session.isAIResultShared),
    caseSnapshot: mapCaseSnapshot(session.caseSnapshot),
    messages: (session.messages ?? []).map(mapMessage),
  };
};

const mapConsultationSessionListItem = (
  session: RawConsultationSessionListDto
): ConsultationSessionListDto => {
  const type = normalizeEnumValue(
    session.type,
    consultationTypeMap,
    ConsultationSessionTypeEnum.Verification
  );
  const status = normalizeEnumValue(
    session.status,
    sessionStatusMap,
    SessionStatusEnum.Pending
  );
  const chatStatus = normalizeEnumValue(
    session.chatStatus,
    chatStatusMap,
    ChatStatusEnum.Locked
  );

  return {
    id: session.id,
    patientId: session.patientId,
    ophthalmologistId: session.ophthalmologistId,
    patientName: session.patientName ?? null,
    patientAvatarUrl: session.patientAvatarUrl ?? null,
    ophthalmologistName: session.ophthalmologistName ?? null,
    organisationName: session.organisationName ?? null,
    ophthalmologistAvatarUrl: session.ophthalmologistAvatarUrl ?? null,
    type,
    typeName: session.typeName ?? ConsultationSessionTypeEnum[type],
    status,
    statusName: session.statusName ?? SESSION_STATUS_LABELS[status],
    chatStatus,
    chatStatusName: session.chatStatusName ?? CHAT_STATUS_LABELS[chatStatus],
    price: session.price,
    appointmentTime: session.appointmentTime,
    meetingLink: session.meetingLink ?? null,
    lastActivityAt: session.lastActivityAt,
    createdAt: session.createdAt,
  };
};

const mapPagedSessions = (
  result: PagedResult<RawConsultationSessionListDto>
): PagedResult<ConsultationSessionListDto> => ({
  ...result,
  items: result.items.map(mapConsultationSessionListItem),
});

// ============ QUERIES ============

/** GET /api/consultation-sessions */
export const getConsultationSessions = async (
  params: GetConsultationSessionsParams = {}
): Promise<PagedResult<ConsultationSessionListDto>> => {
  const response = await api.get<
    ApiResponse<PagedResult<RawConsultationSessionListDto>>
  >(API_ENDPOINTS.CONSULTATION_SESSIONS.LIST, { params });
  return mapPagedSessions(response.data.data);
};

/** GET /api/consultation-sessions/:sessionId */
export const getConsultationSession = async (
  sessionId: string
): Promise<ConsultationSessionDto> => {
  const response = await api.get<ApiResponse<RawConsultationSessionDto>>(
    API_ENDPOINTS.CONSULTATION_SESSIONS.DETAIL(sessionId)
  );
  return mapConsultationSession(response.data.data);
};

// ============ MUTATIONS ============

/** POST /api/consultation-sessions/verification */
export const createVerificationSession = async (
  data: CreateVerificationSessionRequest
): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    API_ENDPOINTS.CONSULTATION_SESSIONS.CREATE_VERIFICATION,
    data
  );
  return response.data.data;
};

/** POST /api/consultation-sessions/video-call */
export const createVideoCallSession = async (
  data: CreateVideoCallSessionRequest
): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    API_ENDPOINTS.CONSULTATION_SESSIONS.CREATE_VIDEO_CALL,
    data
  );
  return response.data.data;
};

/** POST /api/consultation-sessions/:sessionId/verification-report */
export const submitVerificationReport = async (
  sessionId: string,
  data: SubmitVerificationReportRequest
): Promise<void> => {
  await api.post(
    API_ENDPOINTS.CONSULTATION_SESSIONS.SUBMIT_REPORT(sessionId),
    data
  );
};

/** POST /api/consultation-sessions/:sessionId/messages */
export const sendSessionMessage = async (
  sessionId: string,
  data: SendMessageRequest
): Promise<void> => {
  await api.post(
    API_ENDPOINTS.CONSULTATION_SESSIONS.SEND_MESSAGE(sessionId),
    data
  );
};

/** POST /api/consultation-sessions/:sessionId/cancel */
export const cancelSession = async (
  sessionId: string,
  data: CancelSessionRequest
): Promise<void> => {
  await api.post(API_ENDPOINTS.CONSULTATION_SESSIONS.CANCEL(sessionId), data);
};

/** POST /api/consultation-sessions/:sessionId/end */
export const endSession = async (
  sessionId: string,
  data: EndSessionRequest
): Promise<void> => {
  await api.post(API_ENDPOINTS.CONSULTATION_SESSIONS.END(sessionId), data);
};
