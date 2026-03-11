import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircle,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Search,
  CheckCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  Calendar,
  Eye,
  Loader2,
  Lock,
  Archive,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  useConsultationSessions,
  useConsultationSession,
  useSendMessage,
  useEndSession,
} from '@/features/consultation/hooks';
import {
  SessionStatus,
  ChatStatus,
  ConsultationSessionType,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
  CHAT_STATUS_LABELS,
} from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';

// TODO: Replace with actual doctor ID / user ID from auth store once auth is fully integrated
const CURRENT_DOCTOR_ID = 'a2f30076-6cb8-432a-b920-687c90dd0af0';

// ============ STATUS / CHAT CONFIG ============

const statusConfig: Record<
  SessionStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  [SessionStatus.Pending]: {
    label: 'Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  [SessionStatus.Confirmed]: {
    label: 'Confirmed',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: CheckCircle2,
  },
  [SessionStatus.Completed]: {
    label: 'Completed',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle2,
  },
  [SessionStatus.Cancelled]: {
    label: 'Cancelled',
    color: 'text-gray-500 dark:text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: XCircle,
  },
};

const chatStatusConfig: Record<
  ChatStatus,
  { label: string; icon: typeof Lock; color: string; description: string }
> = {
  [ChatStatus.Locked]: {
    label: 'Locked',
    icon: Lock,
    color: 'text-red-500',
    description: 'Chat is locked. Session is pending confirmation.',
  },
  [ChatStatus.MemoOnly]: {
    label: 'Memo Only',
    icon: MessageCircle,
    color: 'text-amber-500',
    description: 'You can add notes. Chat opens after confirmation.',
  },
  [ChatStatus.Open]: {
    label: 'Open',
    icon: MessageCircle,
    color: 'text-green-500',
    description: 'Chat is open. You can exchange messages with the patient.',
  },
  [ChatStatus.Archived]: {
    label: 'Archived',
    icon: Archive,
    color: 'text-gray-500',
    description: 'Session ended. Chat is archived.',
  },
};

type FilterTab = 'all' | 'pending' | 'active' | 'completed';

// ============ HELPERS ============

const getSessionTypeColor = (type: ConsultationSessionType) => {
  switch (type) {
    case ConsultationSessionType.Verification:
      return 'from-blue-500 to-cyan-500';
    case ConsultationSessionType.VideoCall:
      return 'from-purple-500 to-pink-500';
    case ConsultationSessionType.ClinicBooking:
      return 'from-green-500 to-teal-500';
    default:
      return 'from-cyan-400 to-teal-500';
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
      return 'bg-gray-100 text-gray-700';
  }
};

const formatRequestDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffHours < 48) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ============ COMPONENT ============

export default function ConsultationsPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---- Data fetching ----

  const { data: sessionsData, isLoading: sessionsLoading } =
    useConsultationSessions({
      ophthalmologistId: CURRENT_DOCTOR_ID,
      pageSize: 50,
    });

  const { data: selectedSession, isLoading: sessionLoading } =
    useConsultationSession(selectedSessionId ?? '', {
      enabled: !!selectedSessionId,
    });

  const sendMessageMutation = useSendMessage();
  const endSessionMutation = useEndSession();

  const sessions = sessionsData?.items ?? [];

  // ---- Filtering ----

  const filteredSessions = useMemo(() => {
    return sessions.filter((s: ConsultationSessionListDto) => {
      const matchesSearch = searchQuery
        ? s.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.statusName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          SESSION_TYPE_LABELS[s.type]
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = s.status === SessionStatus.Pending;
      } else if (activeTab === 'active') {
        matchesTab = s.status === SessionStatus.Confirmed;
      } else if (activeTab === 'completed') {
        matchesTab =
          s.status === SessionStatus.Completed ||
          s.status === SessionStatus.Cancelled;
      }

      return matchesSearch && matchesTab;
    });
  }, [sessions, searchQuery, activeTab]);

  const pendingCount = sessions.filter(
    (s: ConsultationSessionListDto) => s.status === SessionStatus.Pending
  ).length;

  const currentSession = filteredSessions.find(
    (s: ConsultationSessionListDto) => s.id === selectedSessionId
  );

  // Can the doctor send messages in the current session?
  const canSendMessage =
    currentSession?.chatStatus === ChatStatus.Open ||
    currentSession?.chatStatus === ChatStatus.MemoOnly;

  // ---- Scroll ----

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession, scrollToBottom]);

  // Auto-select first session
  useEffect(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      setSelectedSessionId(filteredSessions[0].id);
    }
  }, [filteredSessions, selectedSessionId]);

  // ---- Handlers ----

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSessionId) return;

    sendMessageMutation.mutate(
      {
        sessionId: selectedSessionId,
        senderUserId: CURRENT_DOCTOR_ID,
        message: newMessage,
      },
      {
        onSuccess: () => {
          setNewMessage('');
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = (sessionId: string) => {
    endSessionMutation.mutate({
      sessionId,
      doctorId: CURRENT_DOCTOR_ID,
    });
  };

  // ---- Loading state ----

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
        <DoctorSidebar pendingCount={0} />
        <div className="ml-52">
          <DoctorHeader />
          <main className="p-6">
            <div className="flex items-center justify-center h-[calc(100vh-220px)]">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading consultations...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      {/* Sidebar */}
      <DoctorSidebar pendingCount={pendingCount} />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        {/* Header */}
        <DoctorHeader />

        {/* Page Content */}
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Consultations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage consultation requests and chat with patients
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden h-[calc(100vh-220px)]">
            <div className="flex h-full">
              {/* Consultations List */}
              <div className="w-96 border-r border-gray-200 dark:border-[#1e3a5f] flex flex-col">
                {/* Filter Tabs */}
                <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <div className="flex gap-1 bg-gray-100 dark:bg-[#1e3a5f]/50 rounded-lg p-1">
                    {(
                      [
                        { key: 'all', label: 'All' },
                        {
                          key: 'pending',
                          label: 'Pending',
                          count: pendingCount,
                        },
                        { key: 'active', label: 'Active' },
                        { key: 'completed', label: 'Completed' },
                      ] as { key: FilterTab; label: string; count?: number }[]
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                          activeTab === tab.key
                            ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-4.5">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Consultation List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e3a5f] rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No consultations found
                      </p>
                    </div>
                  ) : (
                    filteredSessions.map(
                      (session: ConsultationSessionListDto) => {
                        const statusInfo = statusConfig[session.status];
                        const StatusIcon = statusInfo.icon;

                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-[#1e3a5f]/50 ${
                              selectedSessionId === session.id
                                ? 'bg-cyan-50 dark:bg-cyan-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-[#1e3a5f]/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Type Avatar */}
                              <div className="relative shrink-0">
                                <div
                                  className={`w-12 h-12 bg-gradient-to-br ${getSessionTypeColor(session.type)} rounded-full flex items-center justify-center`}
                                >
                                  {session.type ===
                                  ConsultationSessionType.Verification ? (
                                    <Eye className="w-5 h-5 text-white" />
                                  ) : session.type ===
                                    ConsultationSessionType.VideoCall ? (
                                    <Video className="w-5 h-5 text-white" />
                                  ) : (
                                    <MessageCircle className="w-5 h-5 text-white" />
                                  )}
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-gray-900 dark:text-white font-medium truncate">
                                    {SESSION_TYPE_LABELS[session.type]}
                                  </p>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                                    {formatRequestDate(session.lastActivityAt)}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {statusInfo.label}
                                  </span>
                                  <span
                                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(session.status)}`}
                                  >
                                    {CHAT_STATUS_LABELS[session.chatStatus]}
                                  </span>
                                </div>

                                {/* Preview — Patient ID (in a real app, resolve patient name) */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  Patient: {session.patientId.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </div>

              {/* Chat/Details Area */}
              {selectedSessionId && currentSession ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${getSessionTypeColor(currentSession.type)} rounded-full flex items-center justify-center`}
                        >
                          {currentSession.type ===
                          ConsultationSessionType.Verification ? (
                            <Eye className="w-5 h-5 text-white" />
                          ) : currentSession.type ===
                            ConsultationSessionType.VideoCall ? (
                            <Video className="w-5 h-5 text-white" />
                          ) : (
                            <MessageCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {SESSION_TYPE_LABELS[currentSession.type]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {SESSION_STATUS_LABELS[currentSession.status]}{' '}
                          &middot;{' '}
                          {CHAT_STATUS_LABELS[currentSession.chatStatus]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* End Session button for Confirmed sessions */}
                      {currentSession.status === SessionStatus.Confirmed && (
                        <button
                          onClick={() => handleEndSession(currentSession.id)}
                          disabled={endSessionMutation.isPending}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {endSessionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          End Session
                        </button>
                      )}
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Status Banner (when not Open) */}
                  {currentSession.chatStatus !== ChatStatus.Open && (
                    <div
                      className={`px-4 py-2 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-[#1e3a5f] ${
                        currentSession.chatStatus === ChatStatus.Locked
                          ? 'bg-red-50 dark:bg-red-950/20'
                          : currentSession.chatStatus === ChatStatus.MemoOnly
                            ? 'bg-amber-50 dark:bg-amber-950/20'
                            : 'bg-gray-50 dark:bg-gray-900/20'
                      }`}
                    >
                      {(() => {
                        const cfg = chatStatusConfig[currentSession.chatStatus];
                        const Icon = cfg.icon;
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                            <span className="text-gray-600 dark:text-gray-400">
                              {cfg.description}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Content based on status */}
                  {currentSession.status === SessionStatus.Pending ? (
                    // Pending — Session Details View
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0a1929]/50">
                      <div className="max-w-2xl mx-auto space-y-6">
                        {/* Request Info Card */}
                        <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Pending Consultation Session
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Created{' '}
                                {formatRequestDate(currentSession.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <User className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Patient ID
                                </p>
                                <p className="text-gray-900 dark:text-white font-mono text-sm">
                                  {currentSession.patientId}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Session Type
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {SESSION_TYPE_LABELS[currentSession.type]}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Created At
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {new Date(
                                    currentSession.createdAt
                                  ).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            {currentSession.appointmentTime && (
                              <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Appointment Time
                                  </p>
                                  <p className="text-gray-900 dark:text-white">
                                    {new Date(
                                      currentSession.appointmentTime
                                    ).toLocaleString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info Prompt */}
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 text-center">
                          <p className="text-cyan-800 dark:text-cyan-200">
                            This session is pending confirmation. The chat will
                            become available once the session is confirmed.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : currentSession.status === SessionStatus.Confirmed ||
                    currentSession.status === SessionStatus.Completed ? (
                    // Chat View — Confirmed / Completed sessions
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0a1929]/50">
                        {sessionLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                          </div>
                        ) : selectedSession?.messages &&
                          selectedSession.messages.length > 0 ? (
                          selectedSession.messages.map((message) => {
                            const isDoctor =
                              message.senderUserId === CURRENT_DOCTOR_ID;
                            return (
                              <div
                                key={message.id}
                                className={`flex ${
                                  isDoctor ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[70%] p-3 rounded-2xl ${
                                    isDoctor
                                      ? 'bg-cyan-600 text-white rounded-br-sm'
                                      : 'bg-white dark:bg-[#1e3a5f] text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-[#2d4a6f] shadow-sm'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.message}
                                  </p>
                                  <div
                                    className={`flex items-center gap-1 mt-1 ${
                                      isDoctor ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    <span
                                      className={`text-xs ${
                                        isDoctor
                                          ? 'opacity-70'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}
                                    >
                                      {new Date(
                                        message.sentAt
                                      ).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                      })}
                                    </span>
                                    {isDoctor && (
                                      <CheckCheck
                                        className={`w-3 h-3 ${
                                          message.isRead
                                            ? 'text-blue-300'
                                            : 'opacity-70'
                                        }`}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                No messages yet. Start the conversation!
                              </p>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      {canSendMessage ? (
                        <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
                          <div className="flex items-end gap-3">
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                              <Paperclip className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                              <ImageIcon className="w-5 h-5" />
                            </button>
                            <div className="flex-1">
                              <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                rows={1}
                              />
                            </div>
                            <button
                              onClick={handleSendMessage}
                              disabled={
                                !newMessage.trim() ||
                                sendMessageMutation.isPending
                              }
                              className="p-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                            >
                              {sendMessageMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {sendMessageMutation.isError && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                Failed to send message. Please try again.
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Chat locked / archived banner
                        <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f] bg-gray-100 dark:bg-[#1e3a5f]/30">
                          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                            {currentSession.chatStatus ===
                            ChatStatus.Archived ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                  This consultation has been completed
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                  Chat is locked for this session
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Cancelled View
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a1929]/50">
                      <div className="text-center p-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Session Cancelled
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                          This consultation session has been cancelled.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Select a consultation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a consultation request to view details or start
                      chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
