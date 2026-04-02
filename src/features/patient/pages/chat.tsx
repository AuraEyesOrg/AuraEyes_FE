import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  Clock3,
  MessageCircle,
  Minus,
  Send,
  Smile,
  Image as ImageIcon,
  MoreHorizontal,
  Video,
  Search,
  X,
  Eye,
  AlertCircle,
  Lock,
  Archive,
  FileText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useConsultationSessions,
  useConsultationSession,
  useSendMessage,
  useUploadChatImages,
  consultationKeys,
  useConsultationPhase,
} from '@/features/consultation/hooks';
import type { ConsultationPhase } from '@/features/consultation/hooks/use-consultation-phase';
import { useQueryClient } from '@tanstack/react-query';
import {
  SessionStatus,
  ChatStatus,
  ConsultationSessionType,
  type ConsultationSessionListDto,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from '@/types/consultation';
import {
  SIGNALR_CHAT_MESSAGE_EVENT,
  SIGNALR_ROOM_STATE_CHANGED_EVENT,
  type SignalRChatMessageEvent,
  type SignalRRoomStateChangedEvent,
  SIGNALR_TYPING_INDICATOR_EVENT,
  type SignalRTypingIndicatorEvent,
} from '@/types/chat-realtime';
import { sendChatTypingIndicator } from '@/hooks/useSignalRChat';
import useAuthStore from '@/store/auth-store';
import {
  formatFullDate,
  formatMessageTime,
  formatAppointmentSlot,
  formatRelativeTime,
  formatCountdown,
} from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { toast } from 'react-toastify';
import { extractApiErrorMessage } from '@/lib/api-error';

interface SharedScanData {
  imageUrl?: string;
  eyeLabel?: string;
  riskLevel?: string;
  riskLabel?: string;
  anomalies?: string[];
  summary?: string;
  scanId?: string;
}
interface ScanAttachmentMeta {
  title: string;
  riskLabel: string;
}

interface ImageAttachmentMeta {
  url: string;
  fileName?: string;
}

const QUICK_EMOJIS = [
  '😀',
  '😄',
  '😊',
  '😍',
  '😢',
  '😮',
  '👍',
  '🙏',
  '❤️',
  '🎉',
  '👀',
  '✅',
];

type PhaseUIEntry = {
  label: string;
  icon: typeof Lock;
  color: string;
  badgeBg: string;
  bannerBg: string;
  description: string;
};

type MeetingAccessState = {
  canJoin: boolean;
  buttonLabel: string;
  helperText: string;
};

const phaseUIConfig: Record<ConsultationPhase, PhaseUIEntry> = {
  PRE_VISIT: {
    label: 'Pre-visit',
    icon: FileText,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 ring-amber-200',
    bannerBg: 'bg-amber-50 dark:bg-amber-950/55',
    description:
      'Share symptoms, scan notes, or questions before the consultation starts. The doctor will review them at appointment time.',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Activity,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    bannerBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    description:
      'Consultation is active. You can chat and join the video call.',
  },
  COMPLETED: {
    label: 'Completed',
    icon: Archive,
    color: 'text-slate-500',
    badgeBg: 'bg-slate-100 text-slate-600 ring-slate-200',
    bannerBg: 'bg-slate-100 dark:bg-slate-900/90',
    description: 'Consultation has been completed. Chat is now read-only.',
  },
};

const formatAppointmentSlotOrPending = (value: string | null) =>
  value ? formatAppointmentSlot(value) : 'Schedule pending';

const PREJOIN_OPEN_MINUTES = 15;
const MEETING_ACTIVE_MINUTES = 30;
const COUNTDOWN_VISIBILITY_MINUTES = 60;
const MESSAGE_CHARACTER_LIMIT = 1000;
const SPARKLINE_WINDOW_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const CHARACTER_RING_RADIUS = 13;
const CHARACTER_RING_CIRCUMFERENCE = 2 * Math.PI * CHARACTER_RING_RADIUS;
const TYPING_EMIT_DEBOUNCE_MS = 280;
const TYPING_AUTO_HIDE_MS = 2200;

type TrendDirection = 'up' | 'down' | 'flat';

type SessionOptionalMetadata = ConsultationSessionListDto & {
  unreadCount?: number | null;
};

const startOfDayMs = (value: number) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const buildRecentSeries = <T,>(
  items: T[],
  dateSelector: (item: T) => string | null | undefined,
  days = SPARKLINE_WINDOW_DAYS
) => {
  const todayStartMs = startOfDayMs(Date.now());
  const buckets = Array.from({ length: days }, () => 0);

  items.forEach((item) => {
    const dateValue = dateSelector(item);
    if (!dateValue) return;

    const itemTimeMs = new Date(dateValue).getTime();
    if (Number.isNaN(itemTimeMs)) return;

    const diffDays = Math.floor(
      (todayStartMs - startOfDayMs(itemTimeMs)) / DAY_IN_MS
    );
    const index = days - diffDays - 1;

    if (index >= 0 && index < days) {
      buckets[index] += 1;
    }
  });

  return buckets;
};

const buildUpcomingSeries = <T,>(
  items: T[],
  dateSelector: (item: T) => string | null | undefined,
  days = SPARKLINE_WINDOW_DAYS
) => {
  const todayStartMs = startOfDayMs(Date.now());
  const buckets = Array.from({ length: days }, () => 0);

  items.forEach((item) => {
    const dateValue = dateSelector(item);
    if (!dateValue) return;

    const itemTimeMs = new Date(dateValue).getTime();
    if (Number.isNaN(itemTimeMs)) return;

    const diffDays = Math.floor(
      (startOfDayMs(itemTimeMs) - todayStartMs) / DAY_IN_MS
    );

    if (diffDays >= 0 && diffDays < days) {
      buckets[diffDays] += 1;
    }
  });

  return buckets;
};

const getTrendDirection = (series: number[]): TrendDirection => {
  if (series.length <= 1) return 'flat';

  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
};

const getTrendClassName = (trend: TrendDirection) => {
  if (trend === 'up') {
    return 'text-emerald-600 dark:text-emerald-300';
  }
  if (trend === 'down') {
    return 'text-rose-600 dark:text-rose-300';
  }
  return 'text-slate-400 dark:text-slate-500';
};

const getChatStatusDotClass = (chatStatus: ChatStatus) => {
  switch (chatStatus) {
    case ChatStatus.Open:
      return 'bg-emerald-500';
    case ChatStatus.MemoOnly:
      return 'bg-amber-500';
    case ChatStatus.Archived:
      return 'bg-slate-400';
    default:
      return 'bg-rose-500';
  }
};

const getSessionUnreadCount = (session: ConsultationSessionListDto) => {
  const metadata = session as SessionOptionalMetadata;
  return typeof metadata.unreadCount === 'number' ? metadata.unreadCount : 0;
};

const getSessionPreviewFromPayload = (session: ConsultationSessionListDto) => {
  const preview = session.latestMessagePreview;
  if (typeof preview !== 'string') return null;
  const normalized = preview.trim();
  return normalized.length > 0 ? normalized : null;
};

const getSessionPreviewText = (session: ConsultationSessionListDto) => {
  const payloadPreview = getSessionPreviewFromPayload(session);
  if (payloadPreview) {
    return payloadPreview;
  }

  const caseSummary = session.caseSnapshot?.summary?.trim();
  if (caseSummary) {
    return caseSummary;
  }

  const findings = session.caseSnapshot?.findings?.trim();
  if (findings) {
    return findings;
  }

  if (session.chatStatus === ChatStatus.MemoOnly) {
    return 'Leave a note for your doctor…';
  }

  if (session.chatStatus === ChatStatus.Archived) {
    return 'Session completed — no messages';
  }

  if (session.chatStatus === ChatStatus.Locked) {
    return 'Chat opens at appointment time';
  }

  return 'No messages yet';
};

const CharacterProgressArc = ({
  value,
  limit,
}: {
  value: number;
  limit: number;
}) => {
  const safeValue = Math.min(value, limit);
  const ratio = safeValue / limit;
  const strokeDashoffset = CHARACTER_RING_CIRCUMFERENCE * (1 - ratio);
  const remaining = Math.max(limit - value, 0);

  const progressStroke =
    ratio >= 1 ? '#ef4444' : ratio >= 0.85 ? '#f59e0b' : '#06b6d4';

  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 32 32" aria-hidden>
        <circle
          cx="16"
          cy="16"
          r={CHARACTER_RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx="16"
          cy="16"
          r={CHARACTER_RING_RADIUS}
          fill="none"
          stroke={progressStroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CHARACTER_RING_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-300">
        {remaining}
      </span>
    </div>
  );
};

const MiniSparkline = ({
  series,
  stroke,
}: {
  series: number[];
  stroke: string;
}) => {
  const maxValue = Math.max(1, ...series);
  const denominator = Math.max(1, series.length - 1);

  const points = series
    .map((value, index) => {
      const x = (index / denominator) * 32;
      const y = 14 - (value / maxValue) * 10;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 32 16" className="h-4 w-14" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const TrendIndicator = ({ trend }: { trend: TrendDirection }) => {
  return (
    <span className={`inline-flex items-center ${getTrendClassName(trend)}`}>
      {trend === 'up' ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : trend === 'down' ? (
        <ArrowDownRight className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
    </span>
  );
};

const getMeetingAccessState = (
  appointmentTime: string | null,
  nowMs: number
): MeetingAccessState => {
  if (!appointmentTime) {
    return {
      canJoin: false,
      buttonLabel: 'Join Locked',
      helperText: 'Schedule pending',
    };
  }

  const appointmentMs = new Date(appointmentTime).getTime();
  if (Number.isNaN(appointmentMs)) {
    return {
      canJoin: false,
      buttonLabel: 'Join Locked',
      helperText: 'Schedule is unavailable.',
    };
  }

  const minutesUntilStart = Math.ceil((appointmentMs - nowMs) / 60000);
  const unlockMs = appointmentMs - PREJOIN_OPEN_MINUTES * 60000;
  const secondsUntilUnlock = Math.ceil((unlockMs - nowMs) / 1000);

  if (minutesUntilStart > PREJOIN_OPEN_MINUTES) {
    if (minutesUntilStart > COUNTDOWN_VISIBILITY_MINUTES) {
      return {
        canJoin: false,
        buttonLabel: 'Join Locked',
        helperText: `Vào phòng trước ${PREJOIN_OPEN_MINUTES} phút`,
      };
    }
    return {
      canJoin: false,
      buttonLabel: 'Join Locked',
      helperText: `mở sau ${formatCountdown(secondsUntilUnlock)}`,
    };
  }

  if (minutesUntilStart >= -MEETING_ACTIVE_MINUTES) {
    return {
      canJoin: true,
      buttonLabel: 'Join Meeting',
      helperText: `Có thể vào trước ${PREJOIN_OPEN_MINUTES} phút`,
    };
  }

  return {
    canJoin: false,
    buttonLabel: 'Meeting Ended',
    helperText: 'Cuộc hẹn đã qua thời gian tham gia',
  };
};

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'AU';

const extractScanAttachment = (message: string): ScanAttachmentMeta | null => {
  const match = message.match(/\[Scan Attached: (.+?) - (.+?)\]/);

  if (!match) {
    return null;
  }

  return {
    title: match[1],
    riskLabel: match[2],
  };
};

const extractImageAttachment = (
  message: string
): ImageAttachmentMeta | null => {
  const withNameMatch = message.match(
    /\[Image Attached: (https?:\/\/[^\]\s]+) \| Name: ([^\]]+)\]/
  );

  if (withNameMatch) {
    return {
      url: withNameMatch[1],
      fileName: withNameMatch[2],
    };
  }

  const match = message.match(/\[Image Attached: (https?:\/\/[^\]\s]+)\]/);

  if (!match) {
    return null;
  }

  return {
    url: match[1],
  };
};

const stripChatAttachments = (message: string) =>
  message
    .replace(/\n?\n?\[Scan Attached: .+? - .+?\]/g, '')
    .replace(
      /\n?\n?\[Image Attached: https?:\/\/[^\]\s]+(?: \| Name: [^\]]+)?\]/g,
      ''
    )
    .trim();

const AvatarBadge = ({
  name,
  avatarUrl,
  size = 'md',
}: {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 text-xs'
      : size === 'lg'
        ? 'h-16 w-16 text-lg'
        : 'h-11 w-11 text-sm';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shadow-sm ring-1 ring-slate-200/70 dark:ring-[#1e3a5f]`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-500 font-semibold text-white shadow-sm`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default function ChatPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const sharedScan =
    (location.state as { sharedScan?: SharedScanData } | null)?.sharedScan ??
    null;

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [newMessage, setNewMessage] = useState(
    sharedScan
      ? `Hi Doctor, I'd like to share my recent screening results for your review.`
      : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchPending, startSearchTransition] = useTransition();
  const [pendingScan, setPendingScan] = useState<SharedScanData | null>(
    sharedScan
  );
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSessionOverviewOpen, setIsSessionOverviewOpen] = useState(false);
  const [sessionUnreadMap, setSessionUnreadMap] = useState<
    Record<string, boolean>
  >({});
  const [sessionPreviewMap, setSessionPreviewMap] = useState<
    Record<string, string>
  >({});
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const processedChatEventIdRef = useRef<string | null>(null);
  const typingEmitTimerRef = useRef<number | null>(null);
  const typingHideTimerRef = useRef<number | null>(null);
  const activeTypingSessionIdRef = useRef<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { user } = useAuthStore();
  const patientId = user?.roleId;

  const { data: sessionsData, isLoading: sessionsLoading } =
    useConsultationSessions(
      {
        patientId: patientId ?? undefined,
        pageSize: 50,
      },
      {
        enabled: !!patientId,
      }
    );

  const { data: selectedSession, isLoading: sessionLoading } =
    useConsultationSession(selectedSessionId ?? '', {
      enabled: !!selectedSessionId,
    });

  const sendMessageMutation = useSendMessage();
  const uploadChatImagesMutation = useUploadChatImages();

  const chatSessions = useMemo(
    () =>
      (sessionsData?.items ?? []).filter(
        (s) => s.status !== SessionStatus.Cancelled
      ),
    [sessionsData]
  );

  const filteredSessions = useMemo(() => {
    return chatSessions.filter((session) => {
      if (!deferredSearchQuery) return true;
      const query = deferredSearchQuery.toLowerCase();
      return (
        (session.ophthalmologistName ?? '').toLowerCase().includes(query) ||
        (session.patientName ?? '').toLowerCase().includes(query) ||
        session.typeName.toLowerCase().includes(query) ||
        session.statusName.toLowerCase().includes(query) ||
        session.chatStatusName.toLowerCase().includes(query)
      );
    });
  }, [chatSessions, deferredSearchQuery]);

  const currentSession = chatSessions.find(
    (session) => session.id === selectedSessionId
  );

  const phaseInfo = useConsultationPhase(
    currentSession?.chatStatus,
    currentSession?.appointmentTime ?? null,
    currentTimeMs
  );
  const currentPhaseUI = phaseUIConfig[phaseInfo.phase];

  const messageList = selectedSession?.messages ?? [];
  const parsedMessages = useMemo(
    () =>
      messageList.map((message) => ({
        ...message,
        scanMeta: extractScanAttachment(message.message),
        imageMeta: extractImageAttachment(message.message),
        body: stripChatAttachments(message.message),
      })),
    [messageList]
  );
  const canSendMessage = phaseInfo.patientCanSend;
  const totalOpenSessions = chatSessions.filter(
    (session) => session.chatStatus === ChatStatus.Open
  ).length;
  const upcomingSessions = chatSessions.filter(
    (session) =>
      session.appointmentTime && new Date(session.appointmentTime) > new Date()
  ).length;

  const allSessionsSeries = useMemo(
    () => buildRecentSeries(chatSessions, (session) => session.lastActivityAt),
    [chatSessions]
  );
  const openSessionsSeries = useMemo(
    () =>
      buildRecentSeries(
        chatSessions.filter(
          (session) => session.chatStatus === ChatStatus.Open
        ),
        (session) => session.lastActivityAt
      ),
    [chatSessions]
  );
  const upcomingSessionsSeries = useMemo(
    () =>
      buildUpcomingSeries(chatSessions, (session) => session.appointmentTime),
    [chatSessions]
  );

  const allSessionsTrend = useMemo(
    () => getTrendDirection(allSessionsSeries),
    [allSessionsSeries]
  );
  const openSessionsTrend = useMemo(
    () => getTrendDirection(openSessionsSeries),
    [openSessionsSeries]
  );
  const upcomingSessionsTrend = useMemo(
    () => getTrendDirection(upcomingSessionsSeries),
    [upcomingSessionsSeries]
  );

  const messageCharacterCount = newMessage.length;
  const hasComposerPayload =
    !!newMessage.trim() || !!pendingScan || !!pendingImageUrl;
  const isSendReady =
    canSendMessage &&
    hasComposerPayload &&
    !sendMessageMutation.isPending &&
    !uploadChatImagesMutation.isPending;

  useEffect(() => {
    if (
      selectedSessionId &&
      chatSessions.some((session) => session.id === selectedSessionId)
    ) {
      return;
    }

    if (chatSessions.length > 0) {
      setSelectedSessionId(chatSessions[0].id);
    }
  }, [chatSessions, selectedSessionId]);

  useEffect(() => {
    setSessionUnreadMap((previous) => {
      const next: Record<string, boolean> = {};

      chatSessions.forEach((session) => {
        next[session.id] =
          previous[session.id] ?? getSessionUnreadCount(session) > 0;
      });

      if (selectedSessionId) {
        next[selectedSessionId] = false;
      }

      return next;
    });
  }, [chatSessions, selectedSessionId]);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const clearTypingEmitTimer = useCallback(() => {
    if (typingEmitTimerRef.current) {
      window.clearTimeout(typingEmitTimerRef.current);
      typingEmitTimerRef.current = null;
    }
  }, []);

  const clearTypingHideTimer = useCallback(() => {
    if (typingHideTimerRef.current) {
      window.clearTimeout(typingHideTimerRef.current);
      typingHideTimerRef.current = null;
    }
  }, []);

  const stopOwnTyping = useCallback(() => {
    clearTypingEmitTimer();

    const activeSessionId = activeTypingSessionIdRef.current;
    if (!activeSessionId) {
      return;
    }

    activeTypingSessionIdRef.current = null;
    void sendChatTypingIndicator({
      sessionId: activeSessionId,
      isTyping: false,
    });
  }, [clearTypingEmitTimer]);

  const scheduleOwnTyping = useCallback(() => {
    if (!selectedSessionId || !canSendMessage) {
      return;
    }

    clearTypingEmitTimer();
    typingEmitTimerRef.current = window.setTimeout(() => {
      activeTypingSessionIdRef.current = selectedSessionId;
      void sendChatTypingIndicator({
        sessionId: selectedSessionId,
        isTyping: true,
      });
    }, TYPING_EMIT_DEBOUNCE_MS);
  }, [canSendMessage, clearTypingEmitTimer, selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession, scrollToBottom]);

  useEffect(() => {
    if (!canSendMessage) {
      stopOwnTyping();
    }
  }, [canSendMessage, stopOwnTyping]);

  useEffect(() => {
    stopOwnTyping();
    clearTypingHideTimer();
    setIsPeerTyping(false);
  }, [clearTypingHideTimer, selectedSessionId, stopOwnTyping]);

  useEffect(() => {
    return () => {
      stopOwnTyping();
      clearTypingHideTimer();
    };
  }, [clearTypingHideTimer, stopOwnTyping]);

  useEffect(() => {
    if (pendingScan || pendingImageUrl) scrollToBottom();
  }, [pendingScan, pendingImageUrl, scrollToBottom]);

  useEffect(() => {
    if (!selectedSession?.id || !selectedSession.messages.length) {
      return;
    }

    const latestMessage =
      selectedSession.messages[selectedSession.messages.length - 1];
    const stripped = stripChatAttachments(latestMessage.message);

    const attachmentFallback = extractImageAttachment(latestMessage.message)
      ? 'Image attachment shared'
      : extractScanAttachment(latestMessage.message)
        ? 'Retinal scan shared'
        : 'New message';

    setSessionPreviewMap((previous) => ({
      ...previous,
      [selectedSession.id]: stripped || attachmentFallback,
    }));
  }, [selectedSession]);

  useEffect(() => {
    setIsSessionOverviewOpen(false);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSession) return;
    let timerId: number;
    const start = () => {
      timerId = window.setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    };
    const stop = () => window.clearInterval(timerId);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selectedSession?.id]);

  useEffect(() => {
    const handleChatRealtime = (event: Event) => {
      const customEvent = event as CustomEvent<SignalRChatMessageEvent>;
      const chatEvent = customEvent.detail;
      if (!chatEvent?.sessionId) {
        return;
      }

      if (processedChatEventIdRef.current === chatEvent.messageId) {
        return;
      }
      processedChatEventIdRef.current = chatEvent.messageId;

      if (chatEvent.sessionId === selectedSessionId) {
        setSessionUnreadMap((previous) => ({
          ...previous,
          [chatEvent.sessionId]: false,
        }));

        if (chatEvent.senderProfileId !== patientId) {
          clearTypingHideTimer();
          setIsPeerTyping(false);
        }
      } else if (chatEvent.senderProfileId !== patientId) {
        setSessionUnreadMap((previous) => ({
          ...previous,
          [chatEvent.sessionId]: true,
        }));
      }

      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(chatEvent.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: consultationKeys.lists(),
      });
    };

    const handleRoomStateChanged = (event: Event) => {
      const { detail } = event as CustomEvent<SignalRRoomStateChangedEvent>;
      if (!detail?.sessionId) return;

      queryClient.invalidateQueries({
        queryKey: consultationKeys.detail(detail.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: consultationKeys.lists(),
      });
    };

    const handleTypingIndicatorChanged = (event: Event) => {
      const { detail } = event as CustomEvent<SignalRTypingIndicatorEvent>;
      if (!detail?.sessionId || detail.sessionId !== selectedSessionId) {
        return;
      }

      if (detail.senderProfileId === patientId) {
        return;
      }

      if (detail.isTyping) {
        setIsPeerTyping(true);
        clearTypingHideTimer();
        typingHideTimerRef.current = window.setTimeout(() => {
          setIsPeerTyping(false);
          typingHideTimerRef.current = null;
        }, TYPING_AUTO_HIDE_MS);
        return;
      }

      clearTypingHideTimer();
      setIsPeerTyping(false);
    };

    window.addEventListener(SIGNALR_CHAT_MESSAGE_EVENT, handleChatRealtime);
    window.addEventListener(
      SIGNALR_ROOM_STATE_CHANGED_EVENT,
      handleRoomStateChanged
    );
    window.addEventListener(
      SIGNALR_TYPING_INDICATOR_EVENT,
      handleTypingIndicatorChanged
    );
    return () => {
      window.removeEventListener(
        SIGNALR_CHAT_MESSAGE_EVENT,
        handleChatRealtime
      );
      window.removeEventListener(
        SIGNALR_ROOM_STATE_CHANGED_EVENT,
        handleRoomStateChanged
      );
      window.removeEventListener(
        SIGNALR_TYPING_INDICATOR_EVENT,
        handleTypingIndicatorChanged
      );
    };
  }, [clearTypingHideTimer, patientId, queryClient, selectedSessionId]);

  const appendEmoji = (emoji: string) => {
    setNewMessage((previous) => `${previous}${emoji}`);
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    const boundedValue =
      nextValue.length <= MESSAGE_CHARACTER_LIMIT
        ? nextValue
        : nextValue.slice(0, MESSAGE_CHARACTER_LIMIT);

    setNewMessage(boundedValue);

    if (boundedValue.trim() && canSendMessage && selectedSessionId) {
      scheduleOwnTyping();
      return;
    }

    stopOwnTyping();
  };

  const handleImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be 10MB or less.');
      return;
    }

    try {
      const result = await uploadChatImagesMutation.mutateAsync([file]);
      const uploadedUrl = result.uploadedUrls[0];

      if (!uploadedUrl) {
        toast.error('Upload failed. Please try again.');
        return;
      }

      setPendingImageUrl(uploadedUrl);
      setPendingImageName(file.name);
      toast.success('Image attached.');
    } catch (error) {
      const raw = extractApiErrorMessage(
        error,
        'Unable to upload image. Please try again.'
      );
      toast.error(raw);
    }
  };

  const handleSendMessage = () => {
    if (
      (!newMessage.trim() && !pendingScan && !pendingImageUrl) ||
      !selectedSessionId
    )
      return;

    stopOwnTyping();

    const messageParts: string[] = [];
    const trimmedMessage = newMessage.trim();

    if (trimmedMessage) {
      messageParts.push(trimmedMessage);
    }

    if (pendingScan) {
      messageParts.push(
        `[Scan Attached: ${pendingScan.eyeLabel ?? 'Retinal Scan'} - ${pendingScan.riskLabel ?? 'N/A'}]`
      );
    }

    if (pendingImageUrl) {
      messageParts.push(
        pendingImageName
          ? `[Image Attached: ${pendingImageUrl} | Name: ${pendingImageName}]`
          : `[Image Attached: ${pendingImageUrl}]`
      );
    }

    const messageContent = messageParts.join('\n\n');
    const draftText = newMessage;
    const draftScan = pendingScan;
    const draftImageUrl = pendingImageUrl;
    const draftImageName = pendingImageName;
    setNewMessage('');
    setPendingScan(null);
    setPendingImageUrl(null);
    setPendingImageName(null);
    setIsEmojiPickerOpen(false);

    sendMessageMutation.mutate(
      {
        sessionId: selectedSessionId,
        message: messageContent,
      },
      {
        onError: (error) => {
          const raw = extractApiErrorMessage(
            error,
            'Failed to send message. Please try again.'
          );
          if (/(archived|locked|memo\s*only|memoonly)/i.test(raw)) {
            toast.warning(raw);
            sendMessageMutation.reset();
          }
          setNewMessage(draftText);
          setPendingScan(draftScan);
          setPendingImageUrl(draftImageUrl);
          setPendingImageName(draftImageName);
        },
      }
    );
  };

  const handleComposerBlur = () => {
    stopOwnTyping();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSessionTypeColor = (type: ConsultationSessionType) => {
    switch (type) {
      case ConsultationSessionType.Verification:
        return 'from-sky-500 to-cyan-400';
      case ConsultationSessionType.VideoCall:
        return 'from-emerald-500 to-teal-400';
      case ConsultationSessionType.ClinicBooking:
        return 'from-amber-500 to-orange-400';
      default:
        return 'from-brand to-accent';
    }
  };

  const getComposerPlaceholder = () => {
    if (pendingScan) {
      return 'Add context for the scan before sending it to your ophthalmologist...';
    }

    if (phaseInfo.phase === 'PRE_VISIT') {
      return 'Share symptoms, scan notes, or questions before the consultation starts...';
    }

    if (phaseInfo.phase === 'IN_PROGRESS') {
      return 'Type a message...';
    }

    return 'Type your message here...';
  };

  const doctorName =
    currentSession?.ophthalmologistName ?? 'Assigned ophthalmologist';
  const patientName =
    user?.fullName ?? currentSession?.patientName ?? 'Patient';
  const meetingAccessState = getMeetingAccessState(
    currentSession?.appointmentTime ?? null,
    currentTimeMs
  );
  const isMeetingClosedBySessionState =
    currentSession?.status === SessionStatus.Completed ||
    currentSession?.status === SessionStatus.Cancelled ||
    currentSession?.chatStatus === ChatStatus.Archived;
  const canJoinMeeting =
    meetingAccessState.canJoin && !isMeetingClosedBySessionState;

  if (sessionsLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <Spinner size={40} className="mx-auto mb-4" />
            <p className="text-(--text-secondary)">Loading conversations...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="flex h-[calc(100vh-210px)] min-h-[640px] flex-col md:flex-row">
        <aside
          className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-b border-slate-200/80 bg-slate-50/80 md:w-[360px] md:border-b-0 md:border-r dark:bg-[#0a1929]/50 dark:border-[#1e3a5f]`}
        >
          <div className="border-b border-slate-200/80 px-5 pb-4 pt-5 dark:border-[#1e3a5f]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by doctor, status, or session type"
                value={searchQuery}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startSearchTransition(() => {
                    setSearchQuery(nextValue);
                  });
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100 dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-white dark:placeholder-gray-500 dark:focus:ring-cyan-500/20"
              />
              {isSearchPending && (
                <Spinner
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-b border-slate-200/80 px-5 py-4 text-xs font-medium text-slate-500 dark:border-[#1e3a5f]">
            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {chatSessions.length}
                </p>
                <TrendIndicator trend={allSessionsTrend} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <p className="uppercase tracking-[0.14em]">All</p>
                <MiniSparkline series={allSessionsSeries} stroke="#06b6d4" />
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  {totalOpenSessions}
                </p>
                <TrendIndicator trend={openSessionsTrend} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <p className="uppercase tracking-[0.14em]">Open</p>
                <MiniSparkline series={openSessionsSeries} stroke="#10b981" />
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:ring-amber-800/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {upcomingSessions}
                </p>
                <TrendIndicator trend={upcomingSessionsTrend} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <p className="uppercase tracking-[0.14em]">Upcoming</p>
                <MiniSparkline
                  series={upcomingSessionsSeries}
                  stroke="#f59e0b"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [content-visibility:auto]">
            {filteredSessions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  No sessions match your search
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                  Try a doctor name, chat status, or consultation type.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const displayDoctorName =
                  session.ophthalmologistName ?? 'Assigned ophthalmologist';
                const appointmentTime = formatAppointmentSlotOrPending(
                  session.appointmentTime
                );
                const previewText =
                  sessionPreviewMap[session.id] ??
                  getSessionPreviewText(session);
                const isUnread =
                  (sessionUnreadMap[session.id] ?? false) ||
                  getSessionUnreadCount(session) > 0;
                const statusDotClass = getChatStatusDotClass(
                  session.chatStatus
                );

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                      selectedSessionId === session.id
                        ? 'border-cyan-300 bg-white shadow-lg shadow-cyan-100/60 dark:bg-[#0a1f44] dark:shadow-cyan-900/10'
                        : 'border-transparent bg-white/80 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-[#0a1f44]/70 dark:hover:bg-[#0a1f44] dark:hover:border-[#1e3a5f]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <AvatarBadge
                          name={displayDoctorName}
                          avatarUrl={session.ophthalmologistAvatarUrl}
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-[#0a1f44] ${statusDotClass}`}
                          title={`Chat status: ${session.chatStatusName}`}
                        >
                          <span className="sr-only">
                            {session.chatStatusName}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {displayDoctorName}
                          </p>
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <span
                                className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.2)]"
                                title="Unread activity"
                              />
                            )}
                            <p className="text-[11px] text-slate-400 dark:text-gray-500">
                              {formatRelativeTime(session.lastActivityAt)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-1 overflow-hidden text-sm leading-5 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-gray-300">
                          {previewText}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-gray-400">
                          <span>{SESSION_STATUS_LABELS[session.status]}</span>
                          <span className="text-slate-300 dark:text-gray-600">
                            •
                          </span>
                          <span className="truncate" title={appointmentTime}>
                            {appointmentTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {selectedSessionId && currentSession ? (
          <main
            className={`${selectedSessionId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_55%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#0a1f44_0%,_#0a1929_55%,_#0a1f44_100%)]`}
          >
            <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur md:px-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]/85">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    onClick={() => setSelectedSessionId(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm md:hidden dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-gray-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="relative shrink-0">
                    <AvatarBadge
                      name={doctorName}
                      avatarUrl={currentSession.ophthalmologistAvatarUrl}
                      size="md"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br ${getSessionTypeColor(currentSession.type)} p-1 text-white shadow-sm`}
                    >
                      {currentSession.type ===
                      ConsultationSessionType.Verification ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <Video className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-slate-900 md:text-lg dark:text-white">
                        {doctorName}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${currentPhaseUI.badgeBg}`}
                      >
                        <currentPhaseUI.icon
                          className={`h-3.5 w-3.5 ${currentPhaseUI.color}`}
                        />
                        {currentPhaseUI.label}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-300">
                      <span>{SESSION_TYPE_LABELS[currentSession.type]}</span>
                      <span className="text-slate-300 dark:text-gray-600">
                        •
                      </span>
                      <span>
                        {SESSION_STATUS_LABELS[currentSession.status]}
                      </span>
                      <span className="text-slate-300 dark:text-gray-600">
                        •
                      </span>
                      <span className="truncate">
                        {formatAppointmentSlotOrPending(
                          currentSession.appointmentTime
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    {currentSession.meetingLink ? (
                      canJoinMeeting ? (
                        <a
                          href={currentSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
                        >
                          <Video className="h-4 w-4" />
                          <span className="hidden sm:inline">Join Meeting</span>
                          <span className="sm:hidden">Join</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
                        >
                          <Video className="h-4 w-4" />
                          {isMeetingClosedBySessionState
                            ? 'Ended'
                            : meetingAccessState.buttonLabel}
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
                      >
                        <Video className="h-4 w-4" />
                        Link Pending
                      </button>
                    )}
                    {currentSession.meetingLink && (
                      <p className="hidden text-xs font-medium text-slate-500 md:block dark:text-gray-400">
                        {isMeetingClosedBySessionState
                          ? 'Consultation completed'
                          : meetingAccessState.helperText}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setIsSessionOverviewOpen((previous) => !previous)
                    }
                    aria-label={
                      isSessionOverviewOpen
                        ? 'Hide session overview'
                        : 'Show session overview'
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600 dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-gray-300"
                  >
                    {isSessionOverviewOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {phaseInfo.phase !== 'IN_PROGRESS' && (
              <div
                className={`border-b border-slate-200/80 px-4 py-3 text-sm md:px-6 dark:border-[#1e3a5f] ${currentPhaseUI.bannerBg}`}
              >
                <div className="flex items-start gap-2.5">
                  <currentPhaseUI.icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${currentPhaseUI.color} ${phaseInfo.phase === 'PRE_VISIT' ? 'dark:text-amber-300' : ''} ${phaseInfo.phase === 'COMPLETED' ? 'dark:text-slate-300' : ''}`}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {currentPhaseUI.label}
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-gray-300">
                      {currentPhaseUI.description}
                    </p>
                    {phaseInfo.phase === 'PRE_VISIT' &&
                      phaseInfo.msUntilNextTransition !== null &&
                      phaseInfo.msUntilNextTransition > 0 && (
                        <p className="mt-2 font-medium text-amber-700 dark:text-amber-200">
                          {phaseInfo.msUntilNextTransition <=
                          COUNTDOWN_VISIBILITY_MINUTES * 60 * 1000 ? (
                            <span className="inline-flex animate-pulse items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs ring-1 ring-amber-200 dark:bg-amber-900/30 dark:ring-amber-700/40">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              Chat opens in{' '}
                              {formatCountdown(
                                Math.ceil(
                                  phaseInfo.msUntilNextTransition / 1000
                                )
                              )}
                            </span>
                          ) : (
                            'Chat will automatically open at the scheduled appointment time'
                          )}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-6 md:px-6"
            >
              {sessionLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner size={32} />
                </div>
              ) : parsedMessages.length > 0 ? (
                <div className="space-y-4">
                  {parsedMessages.map((message, index) => {
                    const isPatientMessage = message.senderUserId === patientId;
                    const scanAttachmentMeta = message.scanMeta;
                    const imageAttachmentMeta = message.imageMeta;
                    const messageBody = message.body;
                    const previousMessage = parsedMessages[index - 1];
                    const nextMessage = parsedMessages[index + 1];
                    const isPreviousSameSender =
                      previousMessage?.senderUserId === message.senderUserId;
                    const isNextSameSender =
                      nextMessage?.senderUserId === message.senderUserId;
                    const showAvatar =
                      !isPreviousSameSender || !isNextSameSender;
                    const showDateDivider =
                      !previousMessage ||
                      formatFullDate(previousMessage.sentAt) !==
                        formatFullDate(message.sentAt);

                    const bubbleMetaTitle = isPatientMessage
                      ? phaseInfo.phase === 'PRE_VISIT'
                        ? 'Saved as pre-visit note'
                        : 'Delivered to your doctor'
                      : 'Doctor note';
                    const BubbleMetaIcon = isPatientMessage
                      ? phaseInfo.phase === 'PRE_VISIT'
                        ? FileText
                        : CheckCheck
                      : Stethoscope;

                    return (
                      <Fragment key={message.id}>
                        {showDateDivider && (
                          <div className="flex justify-center py-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:text-gray-300 dark:ring-[#1e3a5f]">
                              {formatFullDate(message.sentAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-3 ${isPatientMessage ? 'justify-end' : 'justify-start'} ${isPreviousSameSender ? 'mt-1' : ''}`}
                        >
                          {!isPatientMessage &&
                            (showAvatar ? (
                              <AvatarBadge
                                name={doctorName}
                                avatarUrl={
                                  currentSession.ophthalmologistAvatarUrl
                                }
                                size="sm"
                              />
                            ) : (
                              <div className="h-9 w-9 shrink-0" aria-hidden />
                            ))}

                          <div
                            className={`max-w-[78%] ${isPatientMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}
                          >
                            <div
                              className={`rounded-[24px] px-4 py-3 shadow-sm ${
                                isPatientMessage
                                  ? 'rounded-br-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-white'
                              }`}
                            >
                              {!isPreviousSameSender && (
                                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium">
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/80'
                                        : 'text-slate-500 dark:text-gray-300'
                                    }
                                  >
                                    {isPatientMessage ? 'You' : doctorName}
                                  </span>
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/50'
                                        : 'text-slate-300 dark:text-gray-600'
                                    }
                                  >
                                    /
                                  </span>
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/80'
                                        : 'text-slate-500 dark:text-gray-300'
                                    }
                                  >
                                    {formatMessageTime(message.sentAt)}
                                  </span>
                                </div>
                              )}

                              {messageBody && (
                                <p className="whitespace-pre-wrap text-sm leading-6">
                                  {messageBody}
                                </p>
                              )}

                              {imageAttachmentMeta && (
                                <div
                                  className={`mt-3 rounded-2xl border p-2 ${
                                    isPatientMessage
                                      ? 'border-white/20 bg-white/10'
                                      : 'border-cyan-100 bg-cyan-50 dark:border-cyan-800/40 dark:bg-cyan-950/20'
                                  }`}
                                >
                                  <a
                                    href={imageAttachmentMeta.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={imageAttachmentMeta.url}
                                      alt={
                                        imageAttachmentMeta.fileName ??
                                        'Shared image'
                                      }
                                      className="max-h-64 w-full rounded-xl object-cover"
                                      loading="lazy"
                                    />
                                  </a>
                                  {imageAttachmentMeta.fileName && (
                                    <p
                                      className={`mt-2 truncate text-xs ${
                                        isPatientMessage
                                          ? 'text-white/80'
                                          : 'text-cyan-700 dark:text-cyan-200'
                                      }`}
                                    >
                                      {imageAttachmentMeta.fileName}
                                    </p>
                                  )}
                                </div>
                              )}

                              {scanAttachmentMeta && (
                                <div
                                  className={`mt-3 rounded-2xl border px-3 py-3 ${
                                    isPatientMessage
                                      ? 'border-white/20 bg-white/10'
                                      : 'border-cyan-100 bg-cyan-50 dark:border-cyan-800/40 dark:bg-cyan-950/20'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                        isPatientMessage
                                          ? 'bg-white/15 text-white'
                                          : 'bg-white text-cyan-600 dark:bg-[#0a1f44] dark:text-cyan-300'
                                      }`}
                                    >
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {scanAttachmentMeta.title}
                                      </p>
                                      <p
                                        className={`mt-1 text-xs ${
                                          isPatientMessage
                                            ? 'text-white/80'
                                            : 'text-cyan-700 dark:text-cyan-200'
                                        }`}
                                      >
                                        {scanAttachmentMeta.riskLabel}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-1 px-1 text-[11px] ${
                                isPatientMessage
                                  ? 'text-slate-400 dark:text-gray-500'
                                  : 'text-slate-500 dark:text-gray-400'
                              }`}
                            >
                              <span
                                className="group relative inline-flex items-center"
                                title={bubbleMetaTitle}
                                aria-label={bubbleMetaTitle}
                                tabIndex={0}
                              >
                                <BubbleMetaIcon
                                  className={`h-3.5 w-3.5 ${
                                    isPatientMessage
                                      ? 'text-cyan-500'
                                      : 'text-slate-400 dark:text-gray-500'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                                  {bubbleMetaTitle}
                                </span>
                              </span>
                            </div>
                          </div>

                          {isPatientMessage &&
                            (showAvatar ? (
                              <AvatarBadge
                                name={patientName}
                                avatarUrl={user?.avatarUrl}
                                size="sm"
                              />
                            ) : (
                              <div className="h-9 w-9 shrink-0" aria-hidden />
                            ))}
                        </div>
                      </Fragment>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-10 text-center shadow-sm dark:bg-[#0a1f44]/60 dark:border-[#1e3a5f]">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-dashed border-cyan-300 bg-cyan-50 text-cyan-600 dark:border-cyan-700/60 dark:bg-cyan-900/20 dark:text-cyan-200">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {phaseInfo.phase === 'PRE_VISIT'
                        ? 'Leave a note for your doctor'
                        : phaseInfo.phase === 'COMPLETED'
                          ? 'No messages in this session'
                          : 'No messages yet'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                      {phaseInfo.phase === 'PRE_VISIT'
                        ? 'Start by sharing symptoms, concerns, or a brief note before your consultation begins.'
                        : phaseInfo.phase === 'IN_PROGRESS'
                          ? 'The consultation is active. Start the conversation when you are ready.'
                          : 'This consultation has been completed.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur md:px-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]/70">
              {isPeerTyping && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/90 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:border-cyan-800/40 dark:bg-cyan-950/30 dark:text-cyan-200">
                  <div className="flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
                  </div>
                  <span>Doctor is typing...</span>
                </div>
              )}

              {pendingScan && (
                <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800/40 dark:bg-cyan-950/25">
                  {pendingScan.imageUrl ? (
                    <img
                      src={pendingScan.imageUrl}
                      alt="Scan preview"
                      className="h-14 w-14 rounded-2xl object-cover ring-1 ring-cyan-200 dark:ring-cyan-800/50"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-cyan-600 ring-1 ring-cyan-200 dark:bg-[#0a1f44] dark:text-cyan-300 dark:ring-cyan-800/50">
                      <Eye className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                      Ready to share: {pendingScan.eyeLabel ?? 'Retinal Scan'}
                    </p>
                    <p className="mt-1 truncate text-xs text-cyan-700 dark:text-cyan-200">
                      {pendingScan.riskLabel ?? 'Risk label unavailable'}
                      {pendingScan.anomalies?.length
                        ? ` / ${pendingScan.anomalies.length} finding(s)`
                        : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setPendingScan(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-cyan-600 ring-1 ring-cyan-200 transition hover:bg-cyan-100 dark:bg-[#0a1f44] dark:text-cyan-300 dark:ring-cyan-800/50 dark:hover:bg-cyan-950/40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {pendingImageUrl && (
                <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                  <img
                    src={pendingImageUrl}
                    alt={pendingImageName ?? 'Pending image'}
                    className="h-14 w-14 rounded-2xl object-cover ring-1 ring-emerald-200 dark:ring-emerald-800/50"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      Ready to share image
                    </p>
                    <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-200">
                      {pendingImageName ?? pendingImageUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPendingImageUrl(null);
                      setPendingImageName(null);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-emerald-600 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-[#0a1f44] dark:text-emerald-300 dark:ring-emerald-800/50 dark:hover:bg-emerald-950/40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {canSendMessage ? (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-3 shadow-sm dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
                  <div className="rounded-[24px] border border-slate-200 bg-white shadow-inner shadow-slate-100/70 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
                    <textarea
                      value={newMessage}
                      onChange={handleMessageChange}
                      onBlur={handleComposerBlur}
                      onKeyDown={handleKeyPress}
                      placeholder={getComposerPlaceholder()}
                      className="min-h-[72px] w-full resize-none bg-transparent px-4 pt-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
                      rows={2}
                    />

                    <div className="border-t border-slate-200 px-3 py-2 dark:border-[#1e3a5f]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setIsEmojiPickerOpen((previous) => !previous)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600 dark:text-gray-300 dark:ring-[#1e3a5f]"
                          >
                            <Smile className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleImageButtonClick}
                            disabled={uploadChatImagesMutation.isPending}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-gray-300 dark:ring-[#1e3a5f]"
                          >
                            {uploadChatImagesMutation.isPending ? (
                              <Spinner size={14} className="text-cyan-500" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </button>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelected}
                          />

                          <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex dark:text-gray-500">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Encrypted
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {pendingImageUrl && (
                            <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 sm:inline-block dark:bg-emerald-900/25 dark:text-emerald-200 dark:ring-emerald-800/50">
                              Image attached
                            </span>
                          )}

                          <CharacterProgressArc
                            value={messageCharacterCount}
                            limit={MESSAGE_CHARACTER_LIMIT}
                          />

                          <button
                            onClick={handleSendMessage}
                            disabled={!isSendReady}
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 ${
                              isSendReady
                                ? 'scale-105 animate-pulse shadow-[0_0_0_4px_rgba(6,182,212,0.16)] hover:scale-110 hover:from-emerald-600 hover:to-cyan-600'
                                : ''
                            }`}
                          >
                            {sendMessageMutation.isPending ? (
                              <Spinner size={18} className="text-white" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isEmojiPickerOpen && (
                        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-[#1e3a5f] dark:bg-[#0a1929]/50">
                          {QUICK_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => appendEmoji(emoji)}
                              className="rounded-xl bg-white px-2.5 py-1.5 text-base shadow-sm ring-1 ring-slate-200 transition hover:scale-105 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {messageCharacterCount >= MESSAGE_CHARACTER_LIMIT && (
                        <p className="mt-2 text-xs font-medium text-rose-500">
                          Character limit reached.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 dark:border-[#1e3a5f] dark:bg-[#0a1929]/30 dark:text-gray-300">
                  <currentPhaseUI.icon className="h-4 w-4" />
                  <span>
                    {phaseInfo.phase === 'COMPLETED'
                      ? 'Consultation has been completed. Chat is now read-only.'
                      : 'Chat will unlock after your doctor verifies the session.'}
                  </span>
                </div>
              )}

              {sendMessageMutation.isError && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/20 dark:text-rose-200 dark:ring-rose-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to send message. Please try again.</span>
                </div>
              )}
            </div>
          </main>
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400 dark:bg-[#0a1929]/40 dark:text-gray-400">
                <MessageCircle className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Select a session
              </h3>
              <p className="mt-2 text-slate-500 dark:text-gray-400">
                Choose a consultation from the left panel to review the full
                conversation.
              </p>
            </div>
          </div>
        )}

        {currentSession && isSessionOverviewOpen && (
          <>
            <button
              type="button"
              aria-label="Close session overview"
              onClick={() => setIsSessionOverviewOpen(false)}
              className="fixed inset-0 z-30 bg-slate-900/35 backdrop-blur-[1px] xl:hidden"
            />

            <section className="fixed inset-x-0 bottom-0 z-40 max-h-[78vh] overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl xl:hidden dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarBadge
                    name={doctorName}
                    avatarUrl={currentSession.ophthalmologistAvatarUrl}
                    size="md"
                  />
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {doctorName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {SESSION_TYPE_LABELS[currentSession.type]}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSessionOverviewOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 dark:border-[#1e3a5f] dark:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-[#0a1929]/50 dark:ring-[#1e3a5f]">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Appointment
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatAppointmentSlotOrPending(
                          currentSession.appointmentTime
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Last activity
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatRelativeTime(currentSession.lastActivityAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <BadgeDollarSign className="mt-0.5 h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Consultation fee
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatCurrency(currentSession.price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <Activity className="mt-0.5 h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Phase
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {currentPhaseUI.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-[#030712]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                    <Stethoscope className="h-4 w-4" />
                    Conversation Guidance
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Be specific about symptom timing, changes in vision, pain,
                    and recent scan results. Short, structured notes help your
                    ophthalmologist triage faster.
                  </p>
                </div>
              </div>
            </section>

            <aside className="hidden w-[320px] shrink-0 border-l border-slate-200/80 bg-slate-50/70 xl:flex xl:flex-col dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
              <div className="border-b border-slate-200/80 px-6 py-6 dark:border-[#1e3a5f]">
                <div className="flex items-center gap-4">
                  <AvatarBadge
                    name={doctorName}
                    avatarUrl={currentSession.ophthalmologistAvatarUrl}
                    size="lg"
                  />
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {doctorName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                      {SESSION_TYPE_LABELS[currentSession.type]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                    Session Overview
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Appointment
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatAppointmentSlotOrPending(
                            currentSession.appointmentTime
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Last activity
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatRelativeTime(currentSession.lastActivityAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeDollarSign className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Consultation fee
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(currentSession.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Phase
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {currentPhaseUI.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {pendingScan && (
                  <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                      <Sparkles className="h-4 w-4" />
                      Pending Scan Share
                    </div>
                    <div className="mt-4 space-y-4">
                      {pendingScan.imageUrl ? (
                        <img
                          src={pendingScan.imageUrl}
                          alt="Pending scan"
                          className="h-40 w-full rounded-[24px] object-cover ring-1 ring-slate-200 dark:ring-[#1e3a5f]"
                        />
                      ) : null}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {pendingScan.eyeLabel ?? 'Retinal Scan'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                          {pendingScan.summary ??
                            pendingScan.riskLabel ??
                            'No summary available'}
                        </p>
                      </div>
                      {pendingScan.anomalies?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {pendingScan.anomalies.map((anomaly) => (
                            <span
                              key={anomaly}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
                            >
                              {anomaly}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-sm dark:bg-[#030712]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    <Stethoscope className="h-4 w-4" />
                    Conversation Guidance
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-200">
                    Be specific about symptom timing, changes in vision, pain,
                    and recent scan results. Short, structured notes make it
                    easier for your ophthalmologist to triage quickly.
                  </p>
                  <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-cyan-300" />
                      <span>{patientName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </PatientLayout>
  );
}
