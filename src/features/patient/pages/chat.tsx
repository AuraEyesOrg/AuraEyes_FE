import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Clock3,
  MessageCircle,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreHorizontal,
  Phone,
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
} from '@/features/consultation/hooks';
import {
  SessionStatus,
  ChatStatus,
  ConsultationSessionType,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from '@/types/consultation';

interface SharedScanData {
  imageUrl?: string;
  eyeLabel?: string;
  riskLevel?: string;
  riskLabel?: string;
  anomalies?: string[];
  summary?: string;
  scanId?: string;
}

import useAuthStore from '@/store/auth-store';

interface ScanAttachmentMeta {
  title: string;
  riskLabel: string;
}

type ChatStatusEntry = {
  label: string;
  icon: typeof Lock;
  color: string;
  description: string;
};

type MeetingAccessState = {
  canJoin: boolean;
  buttonLabel: string;
  helperText: string;
};

const chatStatusConfig: Record<number, ChatStatusEntry> = {
  [ChatStatus.Locked]: {
    label: 'Locked',
    icon: Lock,
    color: 'text-red-500',
    description: 'Chat is locked. Waiting for doctor verification.',
  },
  [ChatStatus.MemoOnly]: {
    label: 'Memo Only',
    icon: MessageCircle,
    color: 'text-amber-500',
    description: 'Doctor can add notes. Chat opens after consultation.',
  },
  [ChatStatus.Open]: {
    label: 'Open',
    icon: MessageCircle,
    color: 'text-green-500',
    description: 'Chat is open. You can send messages.',
  },
  [ChatStatus.Archived]: {
    label: 'Archived',
    icon: Archive,
    color: 'text-gray-500',
    description: 'Session ended. Chat is archived.',
  },
};

const defaultChatStatus: ChatStatusEntry = {
  label: 'Unknown',
  icon: AlertCircle,
  color: 'text-gray-400',
  description: 'Chat status unknown.',
};

const formatFullDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatCompactDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const formatAppointmentSlot = (value: string | null) => {
  if (!value) {
    return 'Schedule pending';
  }

  const appointmentDate = new Date(value);
  return appointmentDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatRelativeActivity = (value: string) => {
  const activityDate = new Date(value).getTime();
  const diffMs = Date.now() - activityDate;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const PREJOIN_OPEN_MINUTES = 15;
const MEETING_ACTIVE_MINUTES = 60;

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const getMeetingAccessState = (
  appointmentTime: string | null,
  nowMs: number
): MeetingAccessState => {
  if (!appointmentTime) {
    return {
      canJoin: true,
      buttonLabel: 'Join Meeting',
      helperText: 'Meeting link is ready.',
    };
  }

  const appointmentMs = new Date(appointmentTime).getTime();
  const minutesUntilStart = Math.ceil((appointmentMs - nowMs) / 60000);
  const unlockMs = appointmentMs - PREJOIN_OPEN_MINUTES * 60000;
  const secondsUntilUnlock = Math.ceil((unlockMs - nowMs) / 1000);

  if (minutesUntilStart > PREJOIN_OPEN_MINUTES) {
    return {
      canJoin: false,
      buttonLabel: 'Join Locked',
      helperText: `Join mở sau ${formatCountdown(secondsUntilUnlock)}`,
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
  const match = message.match(/\n\n\[Scan Attached: (.+?) - (.+?)\]$/);

  if (!match) {
    return null;
  }

  return {
    title: match[1],
    riskLabel: match[2],
  };
};

const stripScanAttachment = (message: string) =>
  message.replace(/\n\n\[Scan Attached: .+? - .+?\]$/, '').trim();

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
        className={`${sizeClass} rounded-full object-cover shadow-sm ring-1 ring-slate-200/70`}
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
  const [isSessionOverviewOpen, setIsSessionOverviewOpen] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const sessions = sessionsData?.items ?? [];
  const chatSessions = sessions.filter(
    (s) => s.status !== SessionStatus.Cancelled
  );

  const filteredSessions = chatSessions.filter((session) => {
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

  const currentSession = chatSessions.find(
    (session) => session.id === selectedSessionId
  );
  const currentSessionStatus = currentSession
    ? (chatStatusConfig[currentSession.chatStatus] ?? defaultChatStatus)
    : defaultChatStatus;
  const messageList = selectedSession?.messages ?? [];
  const canSendMessage =
    currentSession?.chatStatus === ChatStatus.Open ||
    currentSession?.chatStatus === ChatStatus.MemoOnly;
  const totalOpenSessions = chatSessions.filter(
    (session) => session.chatStatus === ChatStatus.Open
  ).length;
  const upcomingSessions = chatSessions.filter(
    (session) =>
      session.appointmentTime && new Date(session.appointmentTime) > new Date()
  ).length;

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession, scrollToBottom]);

  useEffect(() => {
    if (pendingScan) scrollToBottom();
  }, [pendingScan, scrollToBottom]);

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const timerId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [selectedSession?.id]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingScan) || !selectedSessionId) return;

    const messageContent = pendingScan
      ? `${newMessage}\n\n[Scan Attached: ${pendingScan.eyeLabel ?? 'Retinal Scan'} - ${pendingScan.riskLabel ?? 'N/A'}]`
      : newMessage;

    sendMessageMutation.mutate(
      {
        sessionId: selectedSessionId,
        message: messageContent,
      },
      {
        onSuccess: () => {
          setNewMessage('');
          setPendingScan(null);
        },
      }
    );
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

  const getStatusBadgeClass = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.Pending:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case SessionStatus.Confirmed:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case SessionStatus.Completed:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case SessionStatus.Cancelled:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusAccentClass = (chatStatus: ChatStatus) => {
    switch (chatStatus) {
      case ChatStatus.Open:
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case ChatStatus.MemoOnly:
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case ChatStatus.Archived:
        return 'bg-slate-100 text-slate-600 ring-slate-200';
      default:
        return 'bg-rose-50 text-rose-700 ring-rose-200';
    }
  };

  const getComposerPlaceholder = () => {
    if (pendingScan) {
      return 'Add context for the scan before sending it to your ophthalmologist...';
    }

    if (currentSession?.chatStatus === ChatStatus.MemoOnly) {
      return 'Share symptoms, scan notes, or questions before the consultation starts...';
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
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex h-[calc(100vh-210px)] min-h-[640px] flex-col md:flex-row">
          <aside
            className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-b border-slate-200/80 bg-slate-50/80 md:w-[360px] md:border-b-0 md:border-r`}
          >
            <div className="border-b border-slate-200/80 px-5 pb-4 pt-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Consultations
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    Your Inbox
                  </h2>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  {chatSessions.length} sessions
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                />
                {isSearchPending && (
                  <Spinner
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-200/80 px-5 py-4 text-center text-xs font-medium text-slate-500">
              <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                <p className="text-slate-900">{chatSessions.length}</p>
                <p className="mt-1 uppercase tracking-[0.16em]">All</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                <p className="text-emerald-900">{totalOpenSessions}</p>
                <p className="mt-1 uppercase tracking-[0.16em]">Open</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
                <p className="text-amber-900">{upcomingSessions}</p>
                <p className="mt-1 uppercase tracking-[0.16em]">Upcoming</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [content-visibility:auto]">
              {filteredSessions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    No sessions match your search
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try a doctor name, chat status, or consultation type.
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const statusConfig =
                    chatStatusConfig[session.chatStatus] ?? defaultChatStatus;
                  const StatusIcon = statusConfig.icon;
                  const displayDoctorName =
                    session.ophthalmologistName ?? 'Assigned ophthalmologist';
                  const displayType = SESSION_TYPE_LABELS[session.type];
                  const appointmentTime = formatAppointmentSlot(
                    session.appointmentTime
                  );

                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                        selectedSessionId === session.id
                          ? 'border-cyan-300 bg-white shadow-lg shadow-cyan-100/60'
                          : 'border-transparent bg-white/80 hover:border-slate-200 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <AvatarBadge
                            name={displayDoctorName}
                            avatarUrl={session.ophthalmologistAvatarUrl}
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br ${getSessionTypeColor(session.type)} p-1 text-white shadow-sm`}
                          >
                            {session.type ===
                            ConsultationSessionType.Verification ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <Video className="h-3 w-3" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {displayDoctorName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {displayType}
                              </p>
                            </div>
                            <div className="text-right text-[11px] text-slate-400">
                              <p>{formatCompactDate(session.createdAt)}</p>
                              <p className="mt-1">
                                {formatRelativeActivity(session.lastActivityAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(session.status)}`}
                            >
                              {SESSION_STATUS_LABELS[session.status]}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${getStatusAccentClass(session.chatStatus)}`}
                            >
                              <StatusIcon
                                className={`h-3.5 w-3.5 ${statusConfig.color}`}
                              />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                              <span>{appointmentTime}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {selectedSessionId && currentSession ? (
            <main
              className={`${selectedSessionId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_55%,_#ffffff_100%)]`}
            >
              <div className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="relative shrink-0">
                      <AvatarBadge
                        name={doctorName}
                        avatarUrl={currentSession.ophthalmologistAvatarUrl}
                        size="lg"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br ${getSessionTypeColor(currentSession.type)} p-1.5 text-white shadow-sm`}
                      >
                        {currentSession.type ===
                        ConsultationSessionType.Verification ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-xl font-semibold text-slate-900">
                          {doctorName}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${getStatusAccentClass(currentSession.chatStatus)}`}
                        >
                          <currentSessionStatus.icon
                            className={`h-3.5 w-3.5 ${currentSessionStatus.color}`}
                          />
                          {currentSessionStatus.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{SESSION_TYPE_LABELS[currentSession.type]}</span>
                        <span className="text-slate-300">/</span>
                        <span>
                          {SESSION_STATUS_LABELS[currentSession.status]}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span>
                          {formatAppointmentSlot(
                            currentSession.appointmentTime
                          )}
                        </span>
                      </div>

                      <p className="mt-3 max-w-2xl text-sm text-slate-500">
                        {currentSession.chatStatus === ChatStatus.MemoOnly
                          ? 'Pre-consultation notes are enabled. Share symptoms, scan context, and questions so the doctor can review them before the session.'
                          : currentSessionStatus.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      {currentSession.meetingLink ? (
                        meetingAccessState.canJoin ? (
                          <a
                            href={currentSession.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                          >
                            <Video className="h-4 w-4" />
                            {meetingAccessState.buttonLabel}
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                          >
                            <Video className="h-4 w-4" />
                            {meetingAccessState.buttonLabel}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                        >
                          <Video className="h-4 w-4" />
                          Link Pending
                        </button>
                      )}
                      {currentSession.meetingLink && (
                        <p className="text-xs font-medium text-slate-500">
                          {meetingAccessState.helperText}
                        </p>
                      )}
                    </div>
                    <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setIsSessionOverviewOpen((previous) => !previous)
                      }
                      aria-label={
                        isSessionOverviewOpen
                          ? 'Hide session overview'
                          : 'Show session overview'
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600"
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

              {currentSession.chatStatus !== ChatStatus.Open && (
                <div
                  className={`border-b border-slate-200/80 px-4 py-3 text-sm md:px-6 ${
                    currentSession.chatStatus === ChatStatus.Locked
                      ? 'bg-rose-50'
                      : currentSession.chatStatus === ChatStatus.MemoOnly
                        ? 'bg-amber-50'
                        : 'bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <currentSessionStatus.icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${currentSessionStatus.color}`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {currentSessionStatus.label}
                      </p>
                      <p className="mt-1 text-slate-600">
                        {currentSessionStatus.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                {sessionLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner size={32} />
                  </div>
                ) : messageList.length > 0 ? (
                  <div className="space-y-4">
                    {messageList.map((message, index) => {
                      const isPatientMessage =
                        message.senderUserId === user?.id;
                      const attachmentMeta = extractScanAttachment(
                        message.message
                      );
                      const messageBody = stripScanAttachment(message.message);
                      const previousMessage = messageList[index - 1];
                      const showDateDivider =
                        !previousMessage ||
                        formatFullDate(previousMessage.sentAt) !==
                          formatFullDate(message.sentAt);

                      return (
                        <Fragment key={message.id}>
                          {showDateDivider && (
                            <div className="flex justify-center py-2">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
                                {formatFullDate(message.sentAt)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex items-end gap-3 ${isPatientMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isPatientMessage && (
                              <AvatarBadge
                                name={doctorName}
                                avatarUrl={
                                  currentSession.ophthalmologistAvatarUrl
                                }
                                size="sm"
                              />
                            )}

                            <div
                              className={`max-w-[78%] ${isPatientMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}
                            >
                              <div
                                className={`rounded-[24px] px-4 py-3 shadow-sm ${
                                  isPatientMessage
                                    ? 'rounded-br-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
                                }`}
                              >
                                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium">
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/80'
                                        : 'text-slate-500'
                                    }
                                  >
                                    {isPatientMessage ? 'You' : doctorName}
                                  </span>
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/50'
                                        : 'text-slate-300'
                                    }
                                  >
                                    /
                                  </span>
                                  <span
                                    className={
                                      isPatientMessage
                                        ? 'text-white/80'
                                        : 'text-slate-500'
                                    }
                                  >
                                    {formatMessageTime(message.sentAt)}
                                  </span>
                                </div>

                                {messageBody && (
                                  <p className="whitespace-pre-wrap text-sm leading-6">
                                    {messageBody}
                                  </p>
                                )}

                                {attachmentMeta && (
                                  <div
                                    className={`mt-3 rounded-2xl border px-3 py-3 ${
                                      isPatientMessage
                                        ? 'border-white/20 bg-white/10'
                                        : 'border-cyan-100 bg-cyan-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                          isPatientMessage
                                            ? 'bg-white/15 text-white'
                                            : 'bg-white text-cyan-600'
                                        }`}
                                      >
                                        <FileText className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold">
                                          {attachmentMeta.title}
                                        </p>
                                        <p
                                          className={`mt-1 text-xs ${
                                            isPatientMessage
                                              ? 'text-white/80'
                                              : 'text-cyan-700'
                                          }`}
                                        >
                                          {attachmentMeta.riskLabel}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`flex items-center gap-1 px-1 text-[11px] ${
                                  isPatientMessage
                                    ? 'text-slate-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {isPatientMessage && (
                                  <CheckCheck className="h-3.5 w-3.5 text-cyan-500" />
                                )}
                                <span>
                                  {isPatientMessage
                                    ? 'Delivered to your doctor'
                                    : 'Doctor note'}
                                </span>
                              </div>
                            </div>

                            {isPatientMessage && (
                              <AvatarBadge
                                name={patientName}
                                avatarUrl={user?.avatarUrl}
                                size="sm"
                              />
                            )}
                          </div>
                        </Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="max-w-md rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-10 text-center shadow-sm">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-cyan-600">
                        <MessageCircle className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        No messages yet
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {currentSession.chatStatus === ChatStatus.MemoOnly
                          ? 'Start by sharing symptoms, concerns, or a brief note before your consultation begins.'
                          : currentSession.chatStatus === ChatStatus.Locked
                            ? 'This conversation opens after your doctor reviews the session.'
                            : 'Start the conversation when you are ready.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
                {pendingScan && (
                  <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-3">
                    {pendingScan.imageUrl ? (
                      <img
                        src={pendingScan.imageUrl}
                        alt="Scan preview"
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-cyan-200"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-cyan-600 ring-1 ring-cyan-200">
                        <Eye className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-cyan-900">
                        Ready to share: {pendingScan.eyeLabel ?? 'Retinal Scan'}
                      </p>
                      <p className="mt-1 truncate text-xs text-cyan-700">
                        {pendingScan.riskLabel ?? 'Risk label unavailable'}
                        {pendingScan.anomalies?.length
                          ? ` / ${pendingScan.anomalies.length} finding(s)`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setPendingScan(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-cyan-600 ring-1 ring-cyan-200 transition hover:bg-cyan-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {canSendMessage ? (
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-3 shadow-sm">
                    <div className="flex items-end gap-3">
                      <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600">
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-inner shadow-slate-100/70">
                        <textarea
                          value={newMessage}
                          onChange={(event) =>
                            setNewMessage(event.target.value)
                          }
                          onKeyDown={handleKeyPress}
                          placeholder={getComposerPlaceholder()}
                          className="min-h-[52px] w-full resize-none bg-transparent text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          rows={2}
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Messages are encrypted and visible only to your care
                            team.
                          </div>
                          <div>{newMessage.trim().length} characters</div>
                        </div>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={
                          (!newMessage.trim() && !pendingScan) ||
                          sendMessageMutation.isPending
                        }
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm transition hover:from-emerald-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
                      >
                        {sendMessageMutation.isPending ? (
                          <Spinner size={18} className="text-white" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    {currentSession.chatStatus === ChatStatus.Archived ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span>
                      {currentSession.chatStatus === ChatStatus.Locked
                        ? 'Chat will unlock after your doctor verifies the session.'
                        : 'This session is archived. New messages are disabled.'}
                    </span>
                  </div>
                )}

                {sendMessageMutation.isError && (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to send message. Please try again.</span>
                  </div>
                )}
              </div>
            </main>
          ) : (
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400">
                  <MessageCircle className="h-9 w-9" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Select a session
                </h3>
                <p className="mt-2 text-slate-500">
                  Choose a consultation from the left panel to review the full
                  conversation.
                </p>
              </div>
            </div>
          )}

          {currentSession && isSessionOverviewOpen && (
            <aside className="hidden w-[320px] shrink-0 border-l border-slate-200/80 bg-slate-50/70 xl:flex xl:flex-col">
              <div className="border-b border-slate-200/80 px-6 py-6">
                <div className="flex items-center gap-4">
                  <AvatarBadge
                    name={doctorName}
                    avatarUrl={currentSession.ophthalmologistAvatarUrl}
                    size="lg"
                  />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {doctorName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {SESSION_TYPE_LABELS[currentSession.type]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Session Overview
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500">Appointment</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatAppointmentSlot(
                            currentSession.appointmentTime
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500">Last activity</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatRelativeActivity(
                            currentSession.lastActivityAt
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeDollarSign className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Consultation fee
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatCurrency(currentSession.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500">Chat mode</p>
                        <p className="text-sm font-medium text-slate-900">
                          {currentSessionStatus.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {pendingScan && (
                  <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      <Sparkles className="h-4 w-4" />
                      Pending Scan Share
                    </div>
                    <div className="mt-4 space-y-4">
                      {pendingScan.imageUrl ? (
                        <img
                          src={pendingScan.imageUrl}
                          alt="Pending scan"
                          className="h-40 w-full rounded-[24px] object-cover ring-1 ring-slate-200"
                        />
                      ) : null}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {pendingScan.eyeLabel ?? 'Retinal Scan'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
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
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {anomaly}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-sm">
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
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
