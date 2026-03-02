import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
  X,
  Eye,
  Loader2,
  AlertCircle,
  Lock,
  Archive,
} from 'lucide-react';
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
  CHAT_STATUS_LABELS,
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

// TODO: Replace with actual user ID from auth store once auth is fully integrated
const CURRENT_USER_ID = '4c9ed208-3697-4c9f-b2a0-a12f045bebbf';
const CURRENT_PATIENT_ID = '9648d5eb-7a29-4699-9a37-d0fb991d656c';

const chatStatusConfig: Record<
  ChatStatus,
  { label: string; icon: typeof Lock; color: string; description: string }
> = {
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
  const [pendingScan, setPendingScan] = useState<SharedScanData | null>(
    sharedScan
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all sessions for this patient
  const { data: sessionsData, isLoading: sessionsLoading } =
    useConsultationSessions({
      patientId: CURRENT_PATIENT_ID,
      pageSize: 50,
    });

  // Fetch selected session detail
  const { data: selectedSession, isLoading: sessionLoading } =
    useConsultationSession(selectedSessionId ?? '', {
      enabled: !!selectedSessionId,
    });

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  const sessions = sessionsData?.items ?? [];

  // Filter sessions that have chat capability
  const chatSessions = sessions.filter(
    (s) => s.status !== SessionStatus.Cancelled
  );

  const filteredSessions = chatSessions.filter((session) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.typeName.toLowerCase().includes(query) ||
      session.statusName.toLowerCase().includes(query)
    );
  });

  // Auto-select first session
  useEffect(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      setSelectedSessionId(filteredSessions[0].id);
    }
  }, [filteredSessions, selectedSessionId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession, scrollToBottom]);

  useEffect(() => {
    if (pendingScan) scrollToBottom();
  }, [pendingScan, scrollToBottom]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingScan) || !selectedSessionId) return;

    const messageContent = pendingScan
      ? `${newMessage}\n\n[Scan Attached: ${pendingScan.eyeLabel ?? 'Retinal Scan'} - ${pendingScan.riskLabel ?? 'N/A'}]`
      : newMessage;

    sendMessageMutation.mutate(
      {
        sessionId: selectedSessionId,
        senderUserId: CURRENT_USER_ID,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentSession = filteredSessions.find(
    (s) => s.id === selectedSessionId
  );
  const canSendMessage =
    currentSession?.chatStatus === ChatStatus.Open ||
    currentSession?.chatStatus === ChatStatus.MemoOnly;

  const getSessionTypeColor = (type: ConsultationSessionType) => {
    switch (type) {
      case ConsultationSessionType.Verification:
        return 'from-blue-500 to-cyan-500';
      case ConsultationSessionType.VideoCall:
        return 'from-purple-500 to-pink-500';
      case ConsultationSessionType.ClinicBooking:
        return 'from-green-500 to-teal-500';
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
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Loading state
  if (sessionsLoading) {
    return (
      <PatientLayout userName="John Doe">
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-4" />
            <p className="text-(--text-secondary)">Loading conversations...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-1">
          Messages
        </h1>
        <p className="text-(--text-secondary)">
          Chat with your assigned ophthalmologists
        </p>
      </div>

      <div className="medical-card overflow-hidden h-[calc(100vh-180px)]">
        <div className="flex h-full">
          {/* Sessions Sidebar */}
          <div className="w-96 border-r border-(--border-color) flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-(--border-color)">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-lg text-(--text-primary) text-sm placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-10 h-10 text-(--text-muted) mx-auto mb-3" />
                  <p className="text-sm text-(--text-secondary)">
                    No consultation sessions yet
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const statusConfig = chatStatusConfig[session.chatStatus];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-4 cursor-pointer transition-colors border-b border-(--border-color) ${
                        selectedSessionId === session.id
                          ? 'bg-brand-soft'
                          : 'hover:bg-(--bg-tertiary)'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type avatar */}
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${getSessionTypeColor(session.type)} rounded-full flex items-center justify-center flex-shrink-0`}
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

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-(--text-primary) font-medium truncate text-sm">
                              {SESSION_TYPE_LABELS[session.type]}
                            </p>
                            <span className="text-xs text-(--text-muted)">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(session.status)}`}
                            >
                              {SESSION_STATUS_LABELS[session.status]}
                            </span>
                            <StatusIcon
                              className={`w-3 h-3 ${statusConfig.color}`}
                            />
                          </div>
                          <p className="text-xs text-(--text-secondary) truncate">
                            {'No notes'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedSessionId && currentSession ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-(--border-color) flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${getSessionTypeColor(currentSession.type)} rounded-full flex items-center justify-center`}
                  >
                    {currentSession.type ===
                    ConsultationSessionType.Verification ? (
                      <Eye className="w-5 h-5 text-white" />
                    ) : (
                      <Video className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">
                      {SESSION_TYPE_LABELS[currentSession.type]}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {SESSION_STATUS_LABELS[currentSession.status]} &middot;{' '}
                      {CHAT_STATUS_LABELS[currentSession.chatStatus]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Status Banner */}
              {currentSession.chatStatus !== ChatStatus.Open && (
                <div
                  className={`px-4 py-2 flex items-center gap-2 text-sm border-b border-(--border-color) ${
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
                        <span className="text-(--text-secondary)">
                          {cfg.description}
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-(--bg-secondary)">
                {sessionLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                  </div>
                ) : selectedSession?.messages &&
                  selectedSession.messages.length > 0 ? (
                  selectedSession.messages.map((message) => {
                    const isPatient = message.senderUserId === CURRENT_USER_ID;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[65%] rounded-2xl ${
                            isPatient
                              ? 'bg-brand text-white rounded-br-sm'
                              : 'bg-white dark:bg-[#1e3a5f] text-(--text-primary) rounded-bl-sm border border-(--border-color) shadow-sm'
                          }`}
                        >
                          <div className="p-3">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.message}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isPatient ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span
                                className={`text-xs ${isPatient ? 'opacity-70' : 'text-(--text-muted)'}`}
                              >
                                {new Date(message.sentAt).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  }
                                )}
                              </span>
                              {isPatient && (
                                <CheckCheck className="w-3 h-3 text-blue-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-10 h-10 text-(--text-muted) mx-auto mb-3" />
                      <p className="text-sm text-(--text-secondary)">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-(--border-color) space-y-3">
                {/* Pending scan attachment preview */}
                {pendingScan && (
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                    {pendingScan.imageUrl && (
                      <img
                        src={pendingScan.imageUrl}
                        alt="Scan preview"
                        className="w-14 h-14 rounded-lg object-cover bg-slate-900"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200 truncate">
                        Screening Results — {pendingScan.eyeLabel}
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">
                        {pendingScan.riskLabel}
                        {pendingScan.anomalies &&
                        pendingScan.anomalies.length > 0
                          ? ` · ${pendingScan.anomalies.length} finding(s)`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setPendingScan(null)}
                      className="p-1.5 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-lg transition-colors text-cyan-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {canSendMessage ? (
                  <div className="flex items-end gap-3">
                    <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        (!newMessage.trim() && !pendingScan) ||
                        sendMessageMutation.isPending
                      }
                      className="p-3 bg-brand hover:bg-brand/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-(--text-muted)">
                    <Lock className="w-4 h-4" />
                    <span>
                      {currentSession.chatStatus === ChatStatus.Locked
                        ? 'Chat is locked until the doctor reviews your session.'
                        : 'This session is archived. You cannot send new messages.'}
                    </span>
                  </div>
                )}

                {sendMessageMutation.isError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed to send message. Please try again.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-(--bg-secondary) rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-(--text-muted)" />
                </div>
                <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
                  Select a session
                </h3>
                <p className="text-(--text-secondary)">
                  Choose a consultation session to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
