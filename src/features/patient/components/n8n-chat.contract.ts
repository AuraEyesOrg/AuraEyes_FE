import type { ScreeningConsultationContext } from '../types/consultation-context';

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
    consultationContext?: ScreeningConsultationContext | null;
  };
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
  type: 'CONFIRM_BOOKING' | 'PICK_SLOT' | 'OPEN_DOCTOR_LIST' | 'NONE';
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
    consultationContext: args.consultationContext ?? null,
  },
});

export const normalizeN8nChatResponse = (payload: unknown): N8nChatResponse => {
  if (typeof payload === 'string') {
    return {
      reply: payload.trim() || FALLBACK_ASSISTANT_REPLY,
      intent: 'UNKNOWN',
      action: { type: 'NONE' },
    };
  }

  if (payload == null || typeof payload !== 'object') {
    return {
      reply: FALLBACK_ASSISTANT_REPLY,
      intent: 'UNKNOWN',
      action: { type: 'NONE' },
    };
  }

  const data = payload as Record<string, unknown>;
  const candidate =
    data.reply ??
    data.message ??
    data.text ??
    data.output ??
    (typeof data.data === 'object' && data.data != null
      ? (data.data as Record<string, unknown>).output
      : null);

  const reply =
    typeof candidate === 'string' && candidate.trim().length > 0
      ? candidate.trim()
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
