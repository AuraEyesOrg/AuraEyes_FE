import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from 'react';
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
  X,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { CaseSnapshotAiThumbnail, ScreeningReviewLink } from '../components';
import AvatarBadge from '../components/AvatarBadge';
import {
  useCancelSession,
  useConsultationSession,
  useEndSession,
  useSendMessage,
  consultationKeys,
} from '@/features/consultation/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import {
  ChatStatus,
  ConsultationSessionType,
  SessionStatus,
  SESSION_STATUS_LABELS,
  SESSION_TYPE_LABELS,
} from '@/types/consultation';
import {
  SIGNALR_CHAT_MESSAGE_EVENT,
  SIGNALR_ROOM_STATE_CHANGED_EVENT,
  type SignalRChatMessageEvent,
  type SignalRRoomStateChangedEvent,
} from '@/types/chat-realtime';
import {
  formatAppointmentSlot,
  formatCountdown,
  formatFullDate,
  formatMessageTime,
  formatRelativeTime,
} from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { toast } from 'react-toastify';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { postsApi } from '@/features/professional-network/api/network.api';

type ConsultationPhase = 'PRE_VISIT' | 'IN_PROGRESS' | 'COMPLETED';

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

const getPhaseUIConfig = (
  t: (key: string, fallback: string) => string
): Record<ConsultationPhase, PhaseUIEntry> => ({
  PRE_VISIT: {
    label: t('Ophthalmologist.consultations.chat.phase.preVisit', 'Pre-visit'),
    icon: FileText,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 ring-amber-200',
    bannerBg: 'bg-amber-50 dark:bg-amber-950/55',
    description: t(
      'Ophthalmologist.consultations.chat.phase.preVisitDescription',
      'Patient can leave notes before the consultation starts. Chat opens at appointment time.'
    ),
  },
  IN_PROGRESS: {
    label: t(
      'Ophthalmologist.consultations.chat.phase.inProgress',
      'In Progress'
    ),
    icon: Activity,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    bannerBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    description: t(
      'Ophthalmologist.consultations.chat.phase.inProgressDescription',
      'Consultation is active. You can chat and join the video call.'
    ),
  },
  COMPLETED: {
    label: t('Ophthalmologist.consultations.chat.phase.completed', 'Completed'),
    icon: Archive,
    color: 'text-slate-500',
    badgeBg: 'bg-slate-100 text-slate-600 ring-slate-200',
    bannerBg: 'bg-slate-100 dark:bg-slate-900/90',
    description: t(
      'Ophthalmologist.consultations.chat.phase.completedDescription',
      'Consultation has been completed. Chat is now read-only.'
    ),
  },
});

const PREJOIN_OPEN_MINUTES = 15;
const MEETING_ACTIVE_MINUTES = 60;
const COUNTDOWN_VISIBILITY_MINUTES = 60;

const getMeetingAccessState = (
  appointmentTime: string | null,
  nowMs: number,
  t: (key: string, fallback: string) => string
): MeetingAccessState => {
  if (!appointmentTime) {
    return {
      canJoin: true,
      buttonLabel: t(
        'Ophthalmologist.consultations.chat.joinMeeting',
        'Join Meeting'
      ),
      helperText: t(
        'Ophthalmologist.consultations.chat.meetingLinkReady',
        'Meeting link is ready.'
      ),
    };
  }

  const appointmentMs = new Date(appointmentTime).getTime();
  const minutesUntilStart = Math.ceil((appointmentMs - nowMs) / 60000);
  const unlockMs = appointmentMs - PREJOIN_OPEN_MINUTES * 60000;
  const secondsUntilUnlock = Math.ceil((unlockMs - nowMs) / 1000);

  if (minutesUntilStart > PREJOIN_OPEN_MINUTES) {
    return {
      canJoin: false,
      buttonLabel: t(
        'Ophthalmologist.consultations.chat.joinLocked',
        'Join Locked'
      ),
      helperText: `${t(
        'Ophthalmologist.consultations.chat.joinAvailableAfter',
        'Join available after'
      )} ${formatCountdown(secondsUntilUnlock)}`,
    };
  }

  if (minutesUntilStart >= -MEETING_ACTIVE_MINUTES) {
    return {
      canJoin: true,
      buttonLabel: t(
        'Ophthalmologist.consultations.chat.joinMeeting',
        'Join Meeting'
      ),
      helperText: `${t(
        'Ophthalmologist.consultations.chat.canJoinBeforePrefix',
        'Can join before'
      )} ${PREJOIN_OPEN_MINUTES} ${t(
        'Ophthalmologist.consultations.chat.minutes',
        'minutes'
      )}`,
    };
  }

  return {
    canJoin: false,
    buttonLabel: t(
      'Ophthalmologist.consultations.chat.meetingEnded',
      'Meeting Ended'
    ),
    helperText: t(
      'Ophthalmologist.consultations.chat.meetingWindowClosed',
      'Appointment has passed the meeting window'
    ),
  };
};

const extractScanAttachment = (message: string) => {
  const match = message.match(/\n\n\[Scan Attached: (.+?) - (.+?)\]$/);
  if (!match) return null;
  return { title: match[1], riskLabel: match[2] };
};

const stripScanAttachment = (message: string) =>
  message.replace(/\n\n\[Scan Attached: .+? - .+?\]$/, '').trim();

const formatAppointmentSlotOrPending = (
  value: string | null,
  t: (key: string, fallback: string) => string
) =>
  value
    ? formatAppointmentSlot(value)
    : t(
        'Ophthalmologist.consultations.chat.schedulePending',
        'Schedule pending'
      );

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

const getListItemPhaseLabel = (
  session: {
    chatStatus: ChatStatus;
    appointmentTime: string | null;
  },
  t: (key: string, fallback: string) => string
) => {
  if (session.chatStatus === ChatStatus.MemoOnly)
    return t('Ophthalmologist.consultations.chat.phase.preVisit', 'Pre-visit');
  if (session.chatStatus === ChatStatus.Archived)
    return t('Ophthalmologist.consultations.chat.phase.completed', 'Completed');
  if (session.chatStatus === ChatStatus.Locked)
    return t('Ophthalmologist.consultations.chat.phase.locked', 'Locked');
  if (!session.appointmentTime)
    return t(
      'Ophthalmologist.consultations.chat.phase.inProgress',
      'In Progress'
    );
  const slotEnd = new Date(session.appointmentTime).getTime() + 60 * 60 * 1000;
  return Date.now() >= slotEnd
    ? t('Ophthalmologist.consultations.chat.phase.postVisit', 'Post-visit')
    : t('Ophthalmologist.consultations.chat.phase.inProgress', 'In Progress');
};

const getPhase = (session: {
  chatStatus: ChatStatus;
  status: SessionStatus;
  appointmentTime: string | null;
}): ConsultationPhase => {
  if (
    session.status === SessionStatus.Completed ||
    session.status === SessionStatus.Cancelled ||
    session.chatStatus === ChatStatus.Archived
  ) {
    return 'COMPLETED';
  }

  if (session.chatStatus === ChatStatus.Open) {
    return 'IN_PROGRESS';
  }

  // Locked + MemoOnly behave like pre-visit from doctor perspective.
  return 'PRE_VISIT';
};

interface ConsultationsChatViewProps {
  sessions: {
    id: string;
    patientName?: string | null;
    patientAvatarUrl?: string | null;
    organisationName?: string | null;
    appointmentTime: string | null;
    lastActivityAt: string;
    price: number;
    status: SessionStatus;
    chatStatus: ChatStatus;
    type: ConsultationSessionType;
    typeName: string;
    statusName: string;
    chatStatusName: string;
    meetingLink?: string | null;
  }[];
  sessionsLoading: boolean;
}

export default function ConsultationsChatView({
  sessions,
  sessionsLoading,
}: ConsultationsChatViewProps) {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentDoctorId = user?.roleId ?? '';

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isSessionOverviewOpen, setIsSessionOverviewOpen] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [shareDoctorNote, setShareDoctorNote] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedChatEventIdRef = useRef<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const chatSessions = sessions.filter(
    (s) => s.status !== SessionStatus.Cancelled
  );

  const filteredSessions = useMemo(() => {
    if (!deferredSearchQuery) return chatSessions;
    const query = deferredSearchQuery.toLowerCase();
    return chatSessions.filter((session) => {
      return (
        (session.patientName ?? '').toLowerCase().includes(query) ||
        (session.organisationName ?? '').toLowerCase().includes(query) ||
        session.typeName.toLowerCase().includes(query) ||
        session.statusName.toLowerCase().includes(query) ||
        session.chatStatusName.toLowerCase().includes(query)
      );
    });
  }, [chatSessions, deferredSearchQuery]);

  const currentSession =
    chatSessions.find((s) => s.id === selectedSessionId) ?? null;

  const { data: selectedSession, isLoading: sessionLoading } =
    useConsultationSession(selectedSessionId ?? '', {
      enabled: !!selectedSessionId,
    });

  const sendMessageMutation = useSendMessage();
  const cancelSessionMutation = useCancelSession();
  const endSessionMutation = useEndSession();

  const buildInternalCasePostContent = (
    aiSummary: string,
    finalDiagnosis: string,
    doctorName: string,
    doctorNote: string
  ) => {
    return [
      '[CASE_RESULT]',
      `AI Summary: ${aiSummary || 'N/A'}`,
      `Final Diagnosis: ${finalDiagnosis || 'N/A'}`,
      '[/CASE_RESULT]',
      '',
      '[DOCTOR_NOTE]',
      `${doctorName}: "${doctorNote}"`,
      '[/DOCTOR_NOTE]',
    ].join('\n');
  };

  const shareConsultationMutation = useMutation({
    mutationFn: async ({
      consultationSessionId,
      aiSummary,
      finalDiagnosis,
      doctorName,
      doctorNote,
    }: {
      consultationSessionId: string;
      aiSummary: string;
      finalDiagnosis: string;
      doctorName: string;
      doctorNote: string;
    }) => {
      const formData = new FormData();
      formData.append('authorType', 'Ophthalmologist');
      formData.append('category', 'CasePresentation');
      formData.append('visibility', 'Public');
      formData.append('allowComments', 'true');
      formData.append('isInternalCase', 'true');
      formData.append('consultationSessionId', consultationSessionId);
      formData.append('isAnonymizationConfirmed', 'true');
      formData.append(
        'content',
        buildInternalCasePostContent(
          aiSummary,
          finalDiagnosis,
          doctorName,
          doctorNote
        )
      );
      return postsApi.createPost(formData);
    },
    onSuccess: () => {
      toast.success('Case shared to professional network');
      queryClient.invalidateQueries({ queryKey: ['network'] });
      setShareDoctorNote('');
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(error, 'Failed to share consultation case')
      );
    },
  });

  const phase = currentSession ? getPhase(currentSession) : 'PRE_VISIT';
  const phaseUIConfig = getPhaseUIConfig(t);
  const phaseUI = phaseUIConfig[phase];

  const messageList = selectedSession?.messages ?? [];
  const canSendMessage = currentSession?.chatStatus === ChatStatus.Open;

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
    if (!selectedSessionId) return;
    const timerId = window.setInterval(
      () => setCurrentTimeMs(Date.now()),
      1000
    );
    return () => window.clearInterval(timerId);
  }, [selectedSessionId]);

  useEffect(() => {
    const handleChatRealtime = (event: Event) => {
      const customEvent = event as CustomEvent<SignalRChatMessageEvent>;
      const chatEvent = customEvent.detail;
      if (!chatEvent?.sessionId) return;

      // guard against duplicate delivery (reconnect) while still allowing bursts
      if (processedChatEventIdRef.current === chatEvent.messageId) return;
      processedChatEventIdRef.current = chatEvent.messageId;

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

    window.addEventListener(SIGNALR_CHAT_MESSAGE_EVENT, handleChatRealtime);
    window.addEventListener(
      SIGNALR_ROOM_STATE_CHANGED_EVENT,
      handleRoomStateChanged
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
    };
  }, [queryClient]);

  const canCancelCurrentSession = useMemo(() => {
    if (!currentSession || currentSession.status !== SessionStatus.Confirmed)
      return false;
    if (!currentSession.appointmentTime) return true;
    const msUntilStart =
      new Date(currentSession.appointmentTime).getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msUntilStart > threeHoursMs;
  }, [currentSession]);

  const handleCancelSession = (sessionId: string) => {
    if (!currentDoctorId) return;
    if (
      !confirm(
        t(
          'Ophthalmologist.consultations.chat.confirmCancelSession',
          'Cancel this session? The slot will be burned and the patient will be refunded.'
        )
      )
    ) {
      return;
    }
    cancelSessionMutation.mutate({
      sessionId,
      cancelledByUserId: currentDoctorId,
      reason: t(
        'Ophthalmologist.consultations.chat.cancelReason',
        'Cancelled by doctor'
      ),
    });
  };

  const handleEndSession = (sessionId: string) => {
    if (!currentDoctorId) return;
    if (
      !confirm(
        t(
          'Ophthalmologist.consultations.chat.confirmCompleteSession',
          'Complete this consultation? The patient will be charged and the chat will be locked.'
        )
      )
    ) {
      return;
    }
    endSessionMutation.mutate({
      sessionId,
      doctorId: currentDoctorId,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSessionId) return;

    const draftText = newMessage;
    // Optimistic clear: prevent accidental "abc + xyz" when sending rapidly.
    setNewMessage('');

    sendMessageMutation.mutate(
      { sessionId: selectedSessionId, message: draftText },
      {
        onError: (error) => {
          const raw = extractApiErrorMessage(
            error,
            t(
              'Ophthalmologist.consultations.chat.sendError',
              'Failed to send message. Please try again.'
            )
          );
          if (/(archived|locked|memo\s*only|memoonly)/i.test(raw)) {
            toast.warning(raw);
            sendMessageMutation.reset();
          }
          // Restore the draft so the user doesn't lose content on failure.
          setNewMessage(draftText);
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

  const patientName =
    currentSession?.patientName?.trim() ||
    t('Ophthalmologist.consultations.chat.patient', 'Patient');
  const doctorName =
    user?.fullName?.trim() ||
    t('Ophthalmologist.consultations.chat.doctor', 'Doctor');
  const patientAvatarUrl =
    selectedSession?.patientAvatarUrl ?? currentSession?.patientAvatarUrl;
  const meetingAccessState = getMeetingAccessState(
    currentSession?.appointmentTime ?? null,
    currentTimeMs,
    t
  );

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="text-center">
          <Spinner size={40} className="mx-auto mb-4" />
          <p className="text-(--text-secondary)">
            {t(
              'Ophthalmologist.consultations.chat.loading',
              'Loading conversations...'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[640px] flex-col md:flex-row">
      <aside
        className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-b border-slate-200/80 bg-slate-50/80 md:w-[360px] md:border-b-0 md:border-r dark:bg-[#0a1929]/50 dark:border-[#1e3a5f]`}
      >
        <div className="border-b border-slate-200/80 px-5 pb-4 pt-5 dark:border-[#1e3a5f]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t(
                'Ophthalmologist.consultations.chat.searchPlaceholder',
                'Search by patient, status, or session type'
              )}
              value={searchQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                startSearchTransition(() => setSearchQuery(nextValue));
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

        <div className="grid grid-cols-3 gap-2 border-b border-slate-200/80 px-5 py-4 text-center text-xs font-medium text-slate-500 dark:border-[#1e3a5f]">
          <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
            <p className="text-slate-900 dark:text-white">
              {chatSessions.length}
            </p>
            <p className="mt-1 uppercase tracking-[0.16em]">
              {t('Ophthalmologist.consultations.chat.stats.all', 'All')}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800/50">
            <p className="text-emerald-900 dark:text-emerald-200">
              {totalOpenSessions}
            </p>
            <p className="mt-1 uppercase tracking-[0.16em]">
              {t('Ophthalmologist.consultations.chat.stats.open', 'Open')}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:ring-amber-800/50">
            <p className="text-amber-900 dark:text-amber-200">
              {upcomingSessions}
            </p>
            <p className="mt-1 uppercase tracking-[0.16em]">
              {t(
                'Ophthalmologist.consultations.chat.stats.upcoming',
                'Upcoming'
              )}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [content-visibility:auto]">
          {filteredSessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {t(
                  'Ophthalmologist.consultations.chat.emptySearchTitle',
                  'No sessions match your search'
                )}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.consultations.chat.emptySearchSubtitle',
                  'Try a patient name, chat status, or consultation type.'
                )}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const itemPhaseLabel = getListItemPhaseLabel(session, t);
              const displayPatientName =
                session.patientName ??
                t('Ophthalmologist.consultations.chat.patient', 'Patient');
              const displayType = SESSION_TYPE_LABELS[session.type];
              const appointmentTime = formatAppointmentSlotOrPending(
                session.appointmentTime,
                t
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
                        name={displayPatientName}
                        avatarUrl={session.patientAvatarUrl}
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
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {displayPatientName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                            {displayType}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-slate-400 dark:text-gray-500">
                          <p className="mt-1">
                            {formatRelativeTime(session.lastActivityAt)}
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
                          {itemPhaseLabel}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-[#0a1929]/40 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          <span>{appointmentTime}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 dark:text-gray-600" />
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
          <div className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm md:hidden dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-gray-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative shrink-0">
                  <AvatarBadge
                    name={patientName}
                    avatarUrl={patientAvatarUrl}
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
                    <h2 className="truncate text-xl font-semibold text-slate-900 dark:text-white">
                      {patientName}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${phaseUI.badgeBg}`}
                    >
                      <phaseUI.icon
                        className={`h-3.5 w-3.5 ${phaseUI.color}`}
                      />
                      {phaseUI.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-gray-300">
                    <span>{SESSION_TYPE_LABELS[currentSession.type]}</span>
                    <span className="text-slate-300 dark:text-gray-600">/</span>
                    <span>{SESSION_STATUS_LABELS[currentSession.status]}</span>
                    <span className="text-slate-300 dark:text-gray-600">/</span>
                    <span>
                      {formatAppointmentSlotOrPending(
                        currentSession.appointmentTime,
                        t
                      )}
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-gray-400">
                    {phaseUI.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {canCancelCurrentSession && (
                      <button
                        onClick={() => handleCancelSession(currentSession.id)}
                        disabled={cancelSessionMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-200"
                      >
                        {cancelSessionMutation.isPending ? (
                          <Spinner size={16} />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {t('Ophthalmologist.common.cancel', 'Cancel')}
                      </button>
                    )}

                    {currentSession.status === SessionStatus.Confirmed && (
                      <button
                        onClick={() => handleEndSession(currentSession.id)}
                        disabled={endSessionMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        {endSessionMutation.isPending ? (
                          <Spinner size={16} />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {t(
                          'Ophthalmologist.consultations.chat.complete',
                          'Complete'
                        )}
                      </button>
                    )}

                    {currentSession.meetingLink ? (
                      meetingAccessState.canJoin ? (
                        <a
                          href={currentSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                        >
                          <Video className="h-4 w-4" />
                          {t(
                            'Ophthalmologist.consultations.chat.joinMeeting',
                            'Join Meeting'
                          )}
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40"
                        >
                          <Video className="h-4 w-4" />
                          {phase === 'COMPLETED'
                            ? t(
                                'Ophthalmologist.consultations.chat.meetingEnded',
                                'Meeting Ended'
                              )
                            : meetingAccessState.buttonLabel}
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40"
                      >
                        <Video className="h-4 w-4" />
                        {t(
                          'Ophthalmologist.consultations.chat.linkPending',
                          'Link Pending'
                        )}
                      </button>
                    )}
                  </div>

                  {currentSession.meetingLink && (
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                      {meetingAccessState.helperText}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    setIsSessionOverviewOpen((previous) => !previous)
                  }
                  aria-label={
                    isSessionOverviewOpen
                      ? t(
                          'Ophthalmologist.consultations.chat.hideSessionOverview',
                          'Hide session overview'
                        )
                      : t(
                          'Ophthalmologist.consultations.chat.showSessionOverview',
                          'Show session overview'
                        )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600 dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-gray-300"
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

          {phase !== 'IN_PROGRESS' && (
            <div
              className={`border-b border-slate-200/80 px-4 py-3 text-sm md:px-6 ${phaseUI.bannerBg} dark:border-[#1e3a5f]`}
            >
              <div className="flex items-start gap-2.5">
                <phaseUI.icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${phaseUI.color} ${phase === 'PRE_VISIT' ? 'dark:text-amber-300' : ''} ${phase === 'COMPLETED' ? 'dark:text-slate-300' : ''}`}
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {phaseUI.label}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-gray-300">
                    {phaseUI.description}
                  </p>
                  {phase === 'PRE_VISIT' &&
                    currentSession.appointmentTime &&
                    (() => {
                      const appointmentMs = new Date(
                        currentSession.appointmentTime
                      ).getTime();
                      const msUntilStart = appointmentMs - currentTimeMs;
                      if (msUntilStart <= 0) return null;
                      if (
                        msUntilStart >
                        COUNTDOWN_VISIBILITY_MINUTES * 60 * 1000
                      ) {
                        return (
                          <p className="mt-2 font-medium text-amber-700 dark:text-amber-200">
                            {t(
                              'Ophthalmologist.consultations.chat.autoOpenAtSchedule',
                              'Chat will automatically open at the scheduled appointment time'
                            )}
                          </p>
                        );
                      }
                      return (
                        <p className="mt-2 font-medium text-amber-700 dark:text-amber-200">
                          {t(
                            'Ophthalmologist.consultations.chat.opensIn',
                            'Chat opens in'
                          )}{' '}
                          {formatCountdown(Math.ceil(msUntilStart / 1000))}
                        </p>
                      );
                    })()}
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
                  const isDoctorMessage =
                    message.senderUserId === currentDoctorId;
                  const attachmentMeta = extractScanAttachment(message.message);
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
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-[#0a1f44] dark:text-gray-300 dark:ring-[#1e3a5f]">
                            {formatFullDate(message.sentAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-3 ${
                          isDoctorMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isDoctorMessage && (
                          <AvatarBadge
                            name={patientName}
                            avatarUrl={patientAvatarUrl}
                            size="sm"
                          />
                        )}

                        <div
                          className={`max-w-[78%] ${
                            isDoctorMessage ? 'items-end' : 'items-start'
                          } flex flex-col gap-2`}
                        >
                          <div
                            className={`rounded-[24px] px-4 py-3 shadow-sm ${
                              isDoctorMessage
                                ? 'rounded-br-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-white'
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium">
                              <span
                                className={
                                  isDoctorMessage
                                    ? 'text-white/80'
                                    : 'text-slate-500 dark:text-gray-300'
                                }
                              >
                                {isDoctorMessage
                                  ? t(
                                      'Ophthalmologist.consultations.chat.you',
                                      'You'
                                    )
                                  : patientName}
                              </span>
                              <span
                                className={
                                  isDoctorMessage
                                    ? 'text-white/50'
                                    : 'text-slate-300 dark:text-gray-600'
                                }
                              >
                                /
                              </span>
                              <span
                                className={
                                  isDoctorMessage
                                    ? 'text-white/80'
                                    : 'text-slate-500 dark:text-gray-300'
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
                                  isDoctorMessage
                                    ? 'border-white/20 bg-white/10'
                                    : 'border-cyan-100 bg-cyan-50 dark:border-cyan-800/40 dark:bg-cyan-950/20'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                      isDoctorMessage
                                        ? 'bg-white/15 text-white'
                                        : 'bg-white text-cyan-600 dark:bg-[#0a1f44] dark:text-cyan-300'
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
                                        isDoctorMessage
                                          ? 'text-white/80'
                                          : 'text-cyan-700 dark:text-cyan-200'
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
                              isDoctorMessage
                                ? 'text-slate-400'
                                : 'text-slate-500 dark:text-gray-400'
                            }`}
                          >
                            {isDoctorMessage && phase !== 'PRE_VISIT' && (
                              <CheckCheck className="h-3.5 w-3.5 text-cyan-500" />
                            )}
                            <span>
                              {isDoctorMessage
                                ? phase === 'PRE_VISIT'
                                  ? t(
                                      'Ophthalmologist.consultations.chat.savedAsDoctorNote',
                                      'Saved as doctor note'
                                    )
                                  : t(
                                      'Ophthalmologist.consultations.chat.deliveredToPatient',
                                      'Delivered to patient'
                                    )
                                : phase === 'PRE_VISIT'
                                  ? t(
                                      'Ophthalmologist.consultations.chat.patientPreVisitNote',
                                      'Patient pre-visit note'
                                    )
                                  : t(
                                      'Ophthalmologist.consultations.chat.patientMessage',
                                      'Patient message'
                                    )}
                            </span>
                          </div>
                        </div>

                        {isDoctorMessage && (
                          <AvatarBadge
                            name={doctorName}
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
                <div className="max-w-md rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-10 text-center shadow-sm dark:bg-[#0a1f44]/60 dark:border-[#1e3a5f]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-200">
                    <phaseUI.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {phase === 'PRE_VISIT'
                      ? t(
                          'Ophthalmologist.consultations.chat.reviewPatientNotes',
                          'Review patient notes'
                        )
                      : phase === 'COMPLETED'
                        ? t(
                            'Ophthalmologist.consultations.chat.noMessagesInSession',
                            'No messages in this session'
                          )
                        : t(
                            'Ophthalmologist.consultations.chat.noMessagesYet',
                            'No messages yet'
                          )}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                    {phase === 'PRE_VISIT'
                      ? t(
                          'Ophthalmologist.consultations.chat.preVisitEmptyDescription',
                          'Patient can leave notes before the consultation begins. Chat opens at appointment time.'
                        )
                      : phase === 'IN_PROGRESS'
                        ? t(
                            'Ophthalmologist.consultations.chat.inProgressEmptyDescription',
                            'The consultation is active. Start the conversation when you are ready.'
                          )
                        : t(
                            'Ophthalmologist.consultations.chat.completedEmptyDescription',
                            'This consultation has been completed.'
                          )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur md:px-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]/70">
            {canSendMessage ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-3 shadow-sm dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
                <div className="flex items-end gap-3">
                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600 dark:bg-[#0a1f44] dark:text-gray-300 dark:ring-[#1e3a5f]">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-cyan-600 dark:bg-[#0a1f44] dark:text-gray-300 dark:ring-[#1e3a5f]">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-inner shadow-slate-100/70 dark:bg-[#0a1f44] dark:border-[#1e3a5f]">
                    <textarea
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={t(
                        'Ophthalmologist.consultations.chat.typeMessage',
                        'Type a message...'
                      )}
                      className="min-h-[52px] w-full resize-none bg-transparent text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
                      rows={2}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t(
                          'Ophthalmologist.consultations.chat.encryptionNotice',
                          'Messages are encrypted and visible only to your care team.'
                        )}
                      </div>
                      <div>
                        {newMessage.trim().length}{' '}
                        {t(
                          'Ophthalmologist.consultations.chat.characters',
                          'characters'
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() || sendMessageMutation.isPending
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
              <div className="flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 dark:border-[#1e3a5f] dark:bg-[#0a1929]/30 dark:text-gray-300">
                <phaseUI.icon className="h-4 w-4" />
                <span>
                  {phase === 'COMPLETED'
                    ? t(
                        'Ophthalmologist.consultations.chat.completedReadOnly',
                        'Consultation has been completed. Chat is now read-only.'
                      )
                    : t(
                        'Ophthalmologist.consultations.chat.preVisitReadOnly',
                        'Pre-visit mode — patient notes only. Chat opens at appointment time.'
                      )}
                </span>
              </div>
            )}

            {sendMessageMutation.isError && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/20 dark:text-rose-200 dark:ring-rose-900/20">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {t(
                    'Ophthalmologist.consultations.chat.sendError',
                    'Failed to send message. Please try again.'
                  )}
                </span>
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
              {t(
                'Ophthalmologist.consultations.chat.selectSession',
                'Select a session'
              )}
            </h3>
            <p className="mt-2 text-slate-500 dark:text-gray-400">
              {t(
                'Ophthalmologist.consultations.chat.selectSessionDescription',
                'Choose a consultation from the left panel to review the full conversation.'
              )}
            </p>
          </div>
        </div>
      )}

      {currentSession && isSessionOverviewOpen && (
        <aside className="hidden w-[320px] shrink-0 border-l border-slate-200/80 bg-slate-50/70 xl:flex xl:flex-col dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
          <div className="border-b border-slate-200/80 px-6 py-6 dark:border-[#1e3a5f]">
            <div className="flex items-center gap-4">
              <AvatarBadge
                name={patientName}
                avatarUrl={patientAvatarUrl}
                size="lg"
              />
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {patientName}
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
                {t(
                  'Ophthalmologist.consultations.chat.sessionOverview',
                  'Session Overview'
                )}
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.consultations.chat.appointment',
                        'Appointment'
                      )}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatAppointmentSlotOrPending(
                        currentSession.appointmentTime,
                        t
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.consultations.chat.lastActivity',
                        'Last activity'
                      )}
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
                      {t(
                        'Ophthalmologist.consultations.chat.consultationFee',
                        'Consultation fee'
                      )}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(currentSession.price, {
                        locale: 'vi-VN',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.consultations.chat.phaseLabel',
                        'Phase'
                      )}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {phaseUI.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                  Share Internal Case
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                  Share retinal images uploaded by patient and final doctor
                  diagnosis to Aura Network in anonymized mode.
                </p>
                <textarea
                  value={shareDoctorNote}
                  onChange={(event) => setShareDoctorNote(event.target.value)}
                  placeholder="Doctor note for peers (example: Cac ban nhin vao case nay can chu y... )"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-[#1e3a5f] dark:bg-[#0b1f3a] dark:text-slate-100"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() =>
                    currentSession &&
                    selectedSession?.caseSnapshot &&
                    shareConsultationMutation.mutate({
                      consultationSessionId: currentSession.id,
                      aiSummary: selectedSession.caseSnapshot.summary ?? '',
                      finalDiagnosis:
                        selectedSession.caseSnapshot.findings ??
                        selectedSession.caseSnapshot.summary ??
                        '',
                      doctorName: user?.fullName ?? 'Doctor',
                      doctorNote: shareDoctorNote.trim(),
                    })
                  }
                  disabled={
                    !currentSession?.id ||
                    !selectedSession?.caseSnapshot ||
                    !shareDoctorNote.trim() ||
                    shareConsultationMutation.isPending
                  }
                  className="mt-3 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shareConsultationMutation.isPending
                    ? 'Sharing case...'
                    : 'Share Internal Case To Network'}
                </button>
                {!selectedSession?.caseSnapshot && (
                  <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-300">
                    This consultation has no retinal snapshot / final diagnosis
                    data yet, so it cannot be shared.
                  </p>
                )}
              </div>
            </div>

            {selectedSession?.caseSnapshot && (
              <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                  AI Case Snapshot
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                  Screening #
                  {selectedSession.caseSnapshot.screeningId.slice(0, 8)}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0a1929]/40">
                    {selectedSession.caseSnapshot.originalImageUrls[0] ? (
                      <img
                        src={selectedSession.caseSnapshot.originalImageUrls[0]}
                        alt="Original retinal image"
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-full flex items-center justify-center text-[11px] text-slate-500">
                        No original image
                      </div>
                    )}
                    <p className="px-2 py-1 text-[10px] text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-[#1e3a5f]">
                      Original
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0a1929]/40">
                    <CaseSnapshotAiThumbnail
                      snapshot={selectedSession.caseSnapshot}
                    />
                    <p className="px-2 py-1 text-[10px] text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-[#1e3a5f]">
                      AI Annotated
                    </p>
                  </div>
                </div>

                <ScreeningReviewLink
                  screeningId={selectedSession.caseSnapshot.screeningId}
                />

                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Risk: {selectedSession.caseSnapshot.riskLevel ?? 'Unknown'}{' '}
                    | Confidence:{' '}
                    {selectedSession.caseSnapshot.confidenceScore ?? '--'}%
                  </p>
                  {selectedSession.caseSnapshot.summary && (
                    <p className="text-sm text-slate-700 dark:text-gray-300">
                      {selectedSession.caseSnapshot.summary}
                    </p>
                  )}
                  {selectedSession.caseSnapshot.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSession.caseSnapshot.symptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200 px-2 py-1 text-[11px] font-medium border border-cyan-200 dark:border-cyan-800"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-sm dark:bg-[#030712]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <Stethoscope className="h-4 w-4" />
                {t(
                  'Ophthalmologist.consultations.chat.conversationGuidance',
                  'Conversation Guidance'
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-200">
                {t(
                  'Ophthalmologist.consultations.chat.guidanceDescription',
                  'Be specific about symptom timing, changes in vision, pain, and recent scan results. Short, structured notes make it easier to triage quickly.'
                )}
              </p>
              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-cyan-300" />
                  <span>{doctorName}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
