import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';
import { getItem } from '@/lib/local-storage';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ScreeningConsultationContext } from '../types/consultation-context';
import {
  buildN8nChatRequest,
  type N8nChatResponseAction,
  normalizeN8nChatResponse,
} from '../types/n8n-chat.contract';
import { useSystemSettings } from '@/features/system-admin/api/system-settings.api';

export const openN8nChat = () => {
  window.dispatchEvent(new CustomEvent('aura-ai-chat:open'));
};

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
  action?: N8nChatResponseAction;
}

interface N8nChatWidgetProps {
  consultationContext?: ScreeningConsultationContext | null;
}

const CHAT_SESSION_STORAGE_KEY = 'aura-ai-chat-session-v1';
const CHAT_SESSION_IDLE_MS = 24 * 60 * 60 * 1000;

interface PersistedChatSession {
  baseIdentity: string;
  sessionId: string;
  lastActivityAt: number;
}

const splitMessageBlocks = (content: string): string[] =>
  content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

export default function N8nChatWidget({
  consultationContext,
}: N8nChatWidgetProps) {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_END_POINT as string | undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = getItem<string>('token') ?? undefined;
  const { data: systemSettings } = useSystemSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('PatientN8nChat.welcome' as never) as string,
      createdAt: new Date().toISOString(),
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const suppressAutoReleaseRef = useRef(false);
  const [reservedSlotId, setReservedSlotId] = useState<string | null>(null);
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
  const locale =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'vi-VN';
  const sessionBaseIdentity = useMemo(
    () => user?.id ?? consultationContext?.screeningId ?? 'guest',
    [user?.id, consultationContext?.screeningId]
  );
  const [chatSessionId, setChatSessionId] = useState<string>('guest');
  const quickPrompts: string[] = [
    t('PatientN8nChat.quickPrompts.findSpecificTime' as never) as string,
    t('PatientN8nChat.quickPrompts.availableThisWeek' as never) as string,
    t('PatientN8nChat.quickPrompts.bestMatch' as never) as string,
  ];

  const patientMeta = useMemo(() => {
    const advanceBookingSetting = systemSettings?.['MIN_ADVANCE_BOOKING_HOURS'];
    let advanceBookingHours = advanceBookingSetting
      ? parseFloat(advanceBookingSetting)
      : 0.5;
    if (isNaN(advanceBookingHours) || advanceBookingHours < 0.5)
      advanceBookingHours = 0.5;
    const minAdvanceBookingMs = advanceBookingHours * 60 * 60 * 1000;
    const minBookingTime = new Date(
      Date.now() + minAdvanceBookingMs
    ).toISOString();

    return {
      userId: user?.id,
      userEmail: user?.email,
      token,
      screeningId: consultationContext?.screeningId,
      riskLevel: consultationContext?.riskLevel,
      minBookingTime,
    };
  }, [
    consultationContext?.riskLevel,
    consultationContext?.screeningId,
    token,
    user?.email,
    user?.id,
    systemSettings,
  ]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('aura-ai-chat:open', handleOpen);
    return () => window.removeEventListener('aura-ai-chat:open', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    const now = Date.now();
    let nextSessionId = `${sessionBaseIdentity}_${now}`;

    try {
      const raw = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedChatSession;
        const stillActive = now - parsed.lastActivityAt <= CHAT_SESSION_IDLE_MS;
        if (parsed.baseIdentity === sessionBaseIdentity && stillActive) {
          nextSessionId = parsed.sessionId;
        }
      }
    } catch {
      // Ignore corrupted storage and create a new session id.
    }

    setChatSessionId(nextSessionId);

    const persisted: PersistedChatSession = {
      baseIdentity: sessionBaseIdentity,
      sessionId: nextSessionId,
      lastActivityAt: now,
    };
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(persisted));
  }, [sessionBaseIdentity]);

  const touchChatSession = () => {
    if (!chatSessionId) return;
    const persisted: PersistedChatSession = {
      baseIdentity: sessionBaseIdentity,
      sessionId: chatSessionId,
      lastActivityAt: Date.now(),
    };
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(persisted));
  };

  const releaseReservedSlot = async (slotId: string) => {
    if (!token) return;
    try {
      await fetch(`${apiUrl}/appointment-slots/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId }),
        keepalive: true,
      });
    } catch {
      // best-effort release to avoid stale holds
    }
  };

  const closeWidget = async () => {
    setIsOpen(false);
    if (reservedSlotId && !suppressAutoReleaseRef.current) {
      await releaseReservedSlot(reservedSlotId);
      setReservedSlotId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (reservedSlotId && !suppressAutoReleaseRef.current) {
        void releaseReservedSlot(reservedSlotId);
      }
    };
  }, [reservedSlotId, token]);

  const handleAssistantAction = (action?: N8nChatResponseAction) => {
    if (!action || action.type === 'NONE') return;

    if (action.type === 'OPEN_WALLET_TOPUP') {
      navigate('/patient/wallet?topup=1');
      return;
    }

    if (action.type === 'CONFIRM_BOOKING') {
      const slotId = action.payload?.slotId;
      if (typeof slotId === 'string' && slotId.trim().length > 0) {
        suppressAutoReleaseRef.current = true;
        const returnTo = `${location.pathname}${location.search}${location.hash}`;
        sessionStorage.setItem(
          'patient-booking-confirm-context',
          JSON.stringify({ slotId, returnTo })
        );
        navigate('/patient/book/confirm', {
          state: { slotId, returnTo },
        });
      }
    }
  };

  const sendMessage = async (rawInput: string) => {
    const text = rawInput.trim();
    if (!text || isSending) return;
    touchChatSession();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (!webhookUrl) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Chưa cấu hình webhook n8n. Vui lòng kiểm tra biến môi trường VITE_N8N_WEBHOOK_URL.',
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...buildN8nChatRequest({
            message: text,
            sessionId: chatSessionId,
            locale,
            metadata: patientMeta,
            consultationContext,
            timestamp: new Date().toISOString(),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = await response.text();
      }

      const normalizedResponse = normalizeN8nChatResponse(payload);
      touchChatSession();
      if (normalizedResponse.action?.type === 'CONFIRM_BOOKING') {
        const slotId = normalizedResponse.action.payload?.slotId;
        if (typeof slotId === 'string' && slotId.trim().length > 0) {
          setReservedSlotId(slotId);
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: normalizedResponse.reply,
          createdAt: new Date().toISOString(),
          action: normalizedResponse.action,
        },
      ]);
      handleAssistantAction(normalizedResponse.action);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Kết nối tới hệ thống tạm thời bị gián đoạn. Bạn vui lòng thử lại sau ít phút nhé.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={() => void closeWidget()}
        aria-label="Close medical assistant chat"
      />
      <section className="relative w-full max-w-md h-[78vh] min-h-[520px] max-h-[760px] rounded-2xl surface-primary shadow-2xl surface-border overflow-hidden flex flex-col">
        <header className="px-4 py-3 border-b border-(--border-color) bg-gradient-to-r from-primary/15 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <Bot className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-(--text-primary)">
                  {t('PatientN8nChat.title' as never) as string}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t('PatientN8nChat.subtitle' as never) as string}
                </p>
              </div>
            </div>
            <button
              onClick={() => void closeWidget()}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-(--text-secondary)" />
            </button>
          </div>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const messageBlocks = splitMessageBlocks(message.content);
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <span className="mb-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-primary text-white rounded-br-md shadow-sm'
                      : 'surface-secondary text-(--text-primary) rounded-bl-md border border-(--border-color)'
                  }`}
                >
                  {messageBlocks.length > 0
                    ? messageBlocks.map((block, index) => (
                        <p
                          key={`${message.id}-${index}`}
                          className={
                            index > 0
                              ? 'mt-2.5 whitespace-pre-line'
                              : 'whitespace-pre-line'
                          }
                        >
                          {block}
                        </p>
                      ))
                    : message.content}
                  {!isUser && message.action?.type === 'OPEN_WALLET_TOPUP' && (
                    <button
                      type="button"
                      onClick={() => handleAssistantAction(message.action)}
                      className="mt-3 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      {t('PatientN8nChat.actions.topUpNow' as never) as string}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md surface-secondary border border-(--border-color) px-3 py-2 text-sm text-(--text-secondary)">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('PatientN8nChat.status.responding' as never) as string}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                t('PatientN8nChat.inputPlaceholder' as never) as string
              }
              className="min-h-[44px] max-h-28 flex-1 resize-none rounded-xl border border-(--border-color) bg-[var(--bg-primary)] px-3 py-2 text-sm text-(--text-primary) outline-none ring-primary/30 focus:ring"
            />
            <button
              type="submit"
              disabled={isSending || input.trim().length === 0}
              className="h-11 w-11 shrink-0 rounded-xl bg-primary text-white inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
