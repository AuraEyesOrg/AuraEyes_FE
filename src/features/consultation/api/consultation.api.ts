/**
 * Consultation Sessions API
 * All functions follow the existing pattern: use `api` from '@/lib/api',
 * return unwrapped `response.data.data!` typed with `ApiResponse<T>`.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ConsultationSessionDto,
  ConsultationSessionListDto,
  CreateVerificationSessionRequest,
  CreateVideoCallSessionRequest,
  SubmitVerificationReportRequest,
  SendMessageRequest,
  CancelSessionRequest,
  EndSessionRequest,
  GetConsultationSessionsParams,
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

// ============ QUERIES ============

/** GET /api/consultation-sessions */
export const getConsultationSessions = async (
  params: GetConsultationSessionsParams = {}
): Promise<PagedResult<ConsultationSessionListDto>> => {
  const response = await api.get<
    ApiResponse<PagedResult<ConsultationSessionListDto>>
  >(API_ENDPOINTS.CONSULTATION_SESSIONS.LIST, { params });
  return response.data.data;
};

/** GET /api/consultation-sessions/:sessionId */
export const getConsultationSession = async (
  sessionId: string
): Promise<ConsultationSessionDto> => {
  const response = await api.get<ApiResponse<ConsultationSessionDto>>(
    API_ENDPOINTS.CONSULTATION_SESSIONS.DETAIL(sessionId)
  );
  return response.data.data;
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
