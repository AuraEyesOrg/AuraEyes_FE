import type { ScreeningConsultationContext } from './consultation-context';

export type N8nChatIntent =
  | 'BOOK_APPOINTMENT'
  | 'CHECK_AVAILABILITY'
  | 'CONFIRM_BOOKING'
  | 'ASK_CLARIFICATION'
  | 'SMALL_TALK'
  | 'UNKNOWN';

export interface N8nChatMetadata {
  userId?: string;
  userEmail?: string;
  token?: string;
  screeningId?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
  minBookingTime?: string;
}

export interface N8nChatRequest {
  version: '1.0';
  message: string;
  chatInput: string;
  text: string;
  sessionId: string;
  locale: 'vi-VN';
  source: 'patient-review-page';
  timestamp: string;
  metadata: N8nChatMetadata;
  context: {
    consultationContext?: N8nConsultationContextPayload | null;
  };
}

export interface N8nConsultationContextPayload {
  screeningId?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
  riskScore?: number;
  createdAt?: string;
  imageCount?: number;
  anomalyCount?: number;
}

export interface N8nChatSuggestedSlot {
  doctorId: string;
  doctorName: string;
  startAt: string;
  endAt?: string;
  price?: number;
  location?: string;
}

export interface N8nChatResponseAction {
  type:
    | 'CONFIRM_BOOKING'
    | 'PICK_SLOT'
    | 'OPEN_DOCTOR_LIST'
    | 'OPEN_WALLET_TOPUP'
    | 'NONE';
  payload?: Record<string, unknown>;
}

export interface N8nChatResponse {
  reply: string;
  intent?: N8nChatIntent;
  requiresConfirmation?: boolean;
  suggestedSlots?: N8nChatSuggestedSlot[];
  action?: N8nChatResponseAction;
  traceId?: string;
}

const FALLBACK_ASSISTANT_REPLY =
  'Mình đã nhận yêu cầu. Bạn cho phép mình tìm lịch phù hợp và gợi ý phương án đặt lịch nhé?';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const tryParseJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const mergeNestedResponse = (
  payload: Record<string, unknown>
): Record<string, unknown> => {
  if (isRecord(payload.data)) {
    return {
      ...payload.data,
      ...payload,
    };
  }

  return payload;
};

const extractReplyCandidate = (
  payload: Record<string, unknown>
): string | null => {
  const normalizedPayload = mergeNestedResponse(payload);
  const candidate =
    normalizedPayload.reply ??
    normalizedPayload.message ??
    normalizedPayload.text ??
    normalizedPayload.output;

  if (typeof candidate === 'string') {
    const parsedCandidate = tryParseJson(candidate);
    if (isRecord(parsedCandidate)) {
      const nestedReply = extractReplyCandidate(parsedCandidate);
      if (nestedReply) {
        return nestedReply;
      }
    }

    return candidate;
  }

  if (isRecord(candidate)) {
    return extractReplyCandidate(candidate);
  }

  return null;
};

const sanitizeAssistantReply = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/```(?:json|markdown|md|text)?\n?/gi, '')
    .replace(/```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const buildN8nChatRequest = (args: {
  message: string;
  sessionId: string;
  timestamp: string;
  metadata: N8nChatMetadata;
  consultationContext?: ScreeningConsultationContext | null;
}): N8nChatRequest => ({
  version: '1.0',
  message: args.message,
  chatInput: args.message,
  text: args.message,
  sessionId: args.sessionId,
  locale: 'vi-VN',
  source: 'patient-review-page',
  timestamp: args.timestamp,
  metadata: args.metadata,
  context: {
    consultationContext: args.consultationContext
      ? {
          screeningId: args.consultationContext.screeningId,
          riskLevel: args.consultationContext.riskLevel,
          riskScore: args.consultationContext.riskScore,
          createdAt: args.consultationContext.createdAt,
          imageCount: args.consultationContext.images?.length ?? 0,
          anomalyCount: args.consultationContext.anomalies?.length ?? 0,
        }
      : null,
  },
});

export const normalizeN8nChatResponse = (payload: unknown): N8nChatResponse => {
  if (typeof payload === 'string') {
    const parsedPayload = tryParseJson(payload.trim());
    if (isRecord(parsedPayload)) {
      return normalizeN8nChatResponse(parsedPayload);
    }

    return {
      reply: sanitizeAssistantReply(payload) || FALLBACK_ASSISTANT_REPLY,
      intent: 'UNKNOWN',
      action: { type: 'NONE' },
    };
  }

  if (!isRecord(payload)) {
    return {
      reply: FALLBACK_ASSISTANT_REPLY,
      intent: 'UNKNOWN',
      action: { type: 'NONE' },
    };
  }

  const normalizedPayload = mergeNestedResponse(payload);
  const parsedOutput =
    typeof normalizedPayload.output === 'string'
      ? tryParseJson(normalizedPayload.output)
      : normalizedPayload.output;

  const normalizedOutput = isRecord(parsedOutput)
    ? mergeNestedResponse(parsedOutput)
    : undefined;

  const data = normalizedOutput
    ? {
        ...normalizedOutput,
        ...normalizedPayload,
      }
    : normalizedPayload;

  const replyCandidate = extractReplyCandidate(data);
  const reply =
    typeof replyCandidate === 'string' && replyCandidate.trim().length > 0
      ? sanitizeAssistantReply(replyCandidate)
      : FALLBACK_ASSISTANT_REPLY;

  const suggestedSlots = Array.isArray(data.suggestedSlots)
    ? (data.suggestedSlots as N8nChatSuggestedSlot[])
    : undefined;

  const intent =
    typeof data.intent === 'string'
      ? (data.intent as N8nChatIntent)
      : ('UNKNOWN' as N8nChatIntent);

  const action =
    data.action && typeof data.action === 'object'
      ? (data.action as N8nChatResponseAction)
      : { type: 'NONE' as const };

  return {
    reply,
    intent,
    requiresConfirmation:
      typeof data.requiresConfirmation === 'boolean'
        ? data.requiresConfirmation
        : false,
    suggestedSlots,
    action,
    traceId: typeof data.traceId === 'string' ? data.traceId : undefined,
  };
};
