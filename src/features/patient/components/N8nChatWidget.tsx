import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import useAuthStore from '@/store/auth-store';
import { getItem } from '@/lib/local-storage';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import type { ScreeningConsultationContext } from '../types/consultation-context';
import {
  buildN8nChatRequest,
  normalizeN8nChatResponse,
} from './n8n-chat.contract';

export const openN8nChat = () => {
  window.dispatchEvent(new CustomEvent('aura-ai-chat:open'));
};

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
}

interface N8nChatWidgetProps {
  consultationContext?: ScreeningConsultationContext | null;
}

const QUICK_PROMPTS = [
  'Tìm cho tôi lịch khám thứ 5 lúc 16h',
  'Bác sĩ nào còn trống tuần này?',
  'Đặt lịch sớm nhất có thể giúp tôi',
];

export default function N8nChatWidget({
  consultationContext,
}: N8nChatWidgetProps) {
  const user = useAuthStore((state) => state.user);
  const token = getItem<string>('token') ?? undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chao! Mình là AURA Medical Assistant. Bạn có thể nói nhu cầu như "Tìm cho tôi 1 lịch thứ 5 lúc 16h", mình sẽ hỗ trợ kiểm tra và đặt lịch nhanh.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

  const patientMeta = useMemo(
    () => ({
      userId: user?.id,
      userEmail: user?.email,
      token,
      screeningId: consultationContext?.screeningId,
      riskLevel: consultationContext?.riskLevel,
    }),
    [
      consultationContext?.riskLevel,
      consultationContext?.screeningId,
      token,
      user?.email,
      user?.id,
    ]
  );

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('aura-ai-chat:open', handleOpen);
    return () => window.removeEventListener('aura-ai-chat:open', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, messages, isSending]);

  const sendMessage = async (rawInput: string) => {
    const text = rawInput.trim();
    if (!text || isSending) return;

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
            'Chua cau hinh webhook n8n. Vui long kiem tra bien moi truong VITE_N8N_WEBHOOK_URL.',
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
            sessionId: user?.id ?? consultationContext?.screeningId ?? 'guest',
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

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: normalizeN8nChatResponse(payload).reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Ket noi toi he thong dat lich tam thoi bi gian doan. Ban thu lai sau it phut hoac chon "Find a Specialist".',
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
        onClick={() => setIsOpen(false)}
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
                  AURA Medical Assistant
                </p>
                <p className="text-xs text-(--text-muted)">
                  Smart scheduling support via n8n workflow
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
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
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary text-white rounded-br-md'
                      : 'surface-secondary text-(--text-primary) rounded-bl-md border border-(--border-color)'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md surface-secondary border border-(--border-color) px-3 py-2 text-sm text-(--text-secondary)">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Dang tim lich phu hop...
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
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
              placeholder="Nhap nhu cau dat lich cua ban..."
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
