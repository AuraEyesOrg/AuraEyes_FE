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
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  Minus,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Stethoscope,
  UserRound,
  Video,
  X,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import ConfirmModal from '@/components/ui/confirm-modal';
import { CaseSnapshotAiThumbnail, ScreeningReviewLink } from '../components';
import AvatarBadge from '../components/AvatarBadge';
import {
  useCancelSession,
  useConsultationSession,
  useEndSession,
  useSendMessage,
  useUploadChatImages,
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
  ConsultationSessionDto,
} from '@/types/consultation';
import {
  SIGNALR_CHAT_MESSAGE_EVENT,
  SIGNALR_ROOM_STATE_CHANGED_EVENT,
  SIGNALR_TYPING_INDICATOR_EVENT,
  type SignalRChatMessageEvent,
  type SignalRRoomStateChangedEvent,
  type SignalRTypingIndicatorEvent,
} from '@/types/chat-realtime';
import { sendChatTypingIndicator } from '@/hooks/useSignalRChat';
import {
  formatAppointmentSlot,
  formatCountdown,
  formatFullDate,
  formatMessageTime,
  formatRelativeTime,
} from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import { postsApi } from '@/features/professional-network/api/network.api';
import { resolveAuthorType } from '@/features/professional-network/utils/authorType';

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

type TranslateFn = (key: string, fallback: string) => string;

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

const PREJOIN_OPEN_MINUTES = 10;
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

type SessionOptionalMetadata = {
  latestMessagePreview?: string | null;
  unreadCount?: number | null;
  caseSnapshot?: {
    summary?: string | null;
    findings?: string | null;
  } | null;
  chatStatus: ChatStatus;
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

const getSessionUnreadCount = (session: SessionOptionalMetadata) => {
  return typeof session.unreadCount === 'number' ? session.unreadCount : 0;
};

const getSessionPreviewFromPayload = (session: SessionOptionalMetadata) => {
  const preview = session.latestMessagePreview;
  if (typeof preview !== 'string') return null;
  const normalized = preview.trim();
  return normalized.length > 0 ? normalized : null;
};

const getSessionPreviewText = (
  session: SessionOptionalMetadata,
  t: (key: string, fallback: string) => string
) => {
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
    return t(
      'Ophthalmologist.consultations.chat.previewPreVisitEmpty',
      'Awaiting patient pre-visit notes…'
    );
  }

  if (session.chatStatus === ChatStatus.Archived) {
    return t(
      'Ophthalmologist.consultations.chat.previewCompletedEmpty',
      'Session completed — no messages'
    );
  }

  if (session.chatStatus === ChatStatus.Locked) {
    return t(
      'Ophthalmologist.consultations.chat.previewLocked',
      'Chat opens at appointment time'
    );
  }

  return t(
    'Ophthalmologist.consultations.chat.previewUnavailable',
    'No messages yet'
  );
};

const getMeetingAccessState = (
  appointmentTime: string | null,
  nowMs: number,
  t: (key: string, fallback: string) => string
): MeetingAccessState => {
  if (!appointmentTime) {
    return {
      canJoin: false,
      buttonLabel: t(
        'Ophthalmologist.consultations.chat.joinLocked',
        'Join Locked'
      ),
      helperText: t(
        'Ophthalmologist.consultations.chat.schedulePending',
        'Schedule pending'
      ),
    };
  }

  const appointmentMs = new Date(appointmentTime).getTime();
  if (Number.isNaN(appointmentMs)) {
    return {
      canJoin: false,
      buttonLabel: t(
        'Ophthalmologist.consultations.chat.joinLocked',
        'Join Locked'
      ),
      helperText: t(
        'Ophthalmologist.consultations.chat.invalidSchedule',
        'Schedule is unavailable'
      ),
    };
  }

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

const hasGeneratedCaseReport = (
  caseSnapshot: ConsultationSessionDto['caseSnapshot'] | undefined | null
) => {
  if (!caseSnapshot) return false;
  const summary = caseSnapshot.summary?.trim();
  const findings = caseSnapshot.findings?.trim();
  return Boolean(summary || findings);
};

type ScanAttachmentMeta = {
  title: string;
  riskLabel: string;
};

const extractScanAttachment = (message: string): ScanAttachmentMeta | null => {
  const match = message.match(/\[Scan Attached: (.+?) - (.+?)\]/);
  if (!match) return null;
  return { title: match[1], riskLabel: match[2] };
};

type ImageAttachmentMeta = {
  url: string;
  fileName?: string;
};

const QUICK_EMOJIS = ['👍', '🙏', '😊', '👀', '💬', '✅', '📌', '❤️'];

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

  const simpleMatch = message.match(
    /\[Image Attached: (https?:\/\/[^\]\s]+)\]/
  );
  if (!simpleMatch) return null;
  return { url: simpleMatch[1] };
};

const stripChatAttachments = (message: string) =>
  message
    .replace(/\n?\n?\[Scan Attached: .+? - .+?\]/g, '')
    .replace(
      /\n?\n?\[Image Attached: https?:\/\/[^\]\s]+(?: \| Name: [^\]]+)?\]/g,
      ''
    )
    .trim();

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

interface ShareCaseModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  patientName: string;
  content: string;
  onChangeContent: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  caseSnapshot: {
    summary: string | null;
    findings: string | null;
    riskLevel: string | null;
    confidenceScore: number | null;
    originalImageUrls: string[];
  };
  t: TranslateFn;
}

function ShareCaseModal({
  isOpen,
  isSubmitting,
  patientName,
  content,
  onChangeContent,
  onClose,
  onSubmit,
  caseSnapshot,
  t,
}: ShareCaseModalProps) {
  if (!isOpen) return null;

  const livePreview = [
    t(
      'Ophthalmologist.consultations.chat.shareCase.previewTitle',
      'Anonymized clinical case post'
    ),
    `${t('Ophthalmologist.consultations.chat.shareCase.patient', 'Patient')}: ${patientName}`,
    `${t('Ophthalmologist.consultations.chat.shareCase.riskLevel', 'Risk level')}: ${caseSnapshot.riskLevel ?? 'N/A'}`,
    `${t('Ophthalmologist.consultations.chat.shareCase.aiConfidence', 'AI confidence')}: ${caseSnapshot.confidenceScore ?? '--'}%`,
    '',
    `${t('Ophthalmologist.consultations.chat.shareCase.summary', 'Summary')}: ${caseSnapshot.summary ?? 'N/A'}`,
    `${t('Ophthalmologist.consultations.chat.shareCase.finalDiagnosis', 'Final diagnosis')}: ${caseSnapshot.findings ?? 'N/A'}`,
    '',
    `${t('Ophthalmologist.consultations.chat.shareCase.doctorSays', 'Doctor says')}: ${content.trim() || '...'}`,
  ].join('\n');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#1e3a5f]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t(
              'Ophthalmologist.consultations.chat.shareCase.title',
              'Share Case To Network'
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-[#0a1929]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-slate-200 p-5 dark:border-[#1e3a5f] md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
              {t(
                'Ophthalmologist.consultations.chat.shareCase.doctorContent',
                'Doctor Content'
              )}
            </p>
            <textarea
              value={content}
              onChange={(event) => onChangeContent(event.target.value)}
              placeholder={t(
                'Ophthalmologist.consultations.chat.shareCase.contentPlaceholder',
                'Enter clinical notes to share with the doctor network...'
              )}
              rows={7}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 dark:text-slate-100"
            />

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.consultations.chat.shareCase.retinalImages',
                  'Retinal Images'
                )}{' '}
                ({caseSnapshot.originalImageUrls.length})
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {caseSnapshot.originalImageUrls
                  .slice(0, 6)
                  .map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`retinal-${index + 1}`}
                      className="h-20 w-full rounded-xl border border-slate-200 object-cover dark:border-[#1e3a5f]"
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
              {t(
                'Ophthalmologist.consultations.chat.shareCase.preview',
                'Post Preview'
              )}
            </p>
            <div className="mt-3 h-[260px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 dark:text-slate-200">
              <pre className="whitespace-pre-wrap font-sans">{livePreview}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-[#1e3a5f]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-[#1e3a5f] dark:text-slate-200 dark:hover:bg-[#0a1929]"
          >
            {t('Ophthalmologist.common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? t(
                  'Ophthalmologist.consultations.chat.shareCase.sharing',
                  'Sharing case...'
                )
              : t(
                  'Ophthalmologist.consultations.chat.shareCase.title',
                  'Share Case To Network'
                )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationsChatView({
  sessions,
  sessionsLoading,
}: ConsultationsChatViewProps) {
  const { t } = useSafeTranslation();
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentDoctorId = user?.roleId ?? '';

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [newMessage, setNewMessage] = useState('');
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isSessionOverviewOpen, setIsSessionOverviewOpen] = useState(false);
  const [sessionUnreadMap, setSessionUnreadMap] = useState<
    Record<string, boolean>
  >({});
  const [sessionPreviewMap, setSessionPreviewMap] = useState<
    Record<string, string>
  >({});
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isShareCaseModalOpen, setIsShareCaseModalOpen] = useState(false);
  const [shareCaseContent, setShareCaseContent] = useState('');
  const [sessionActionTarget, setSessionActionTarget] = useState<{
    type: 'cancel' | 'complete';
    sessionId: string;
  } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const processedChatEventIdRef = useRef<string | null>(null);
  const typingEmitTimerRef = useRef<number | null>(null);
  const typingHideTimerRef = useRef<number | null>(null);
  const activeTypingSessionIdRef = useRef<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const chatSessions = useMemo(
    () => sessions.filter((s) => s.status !== SessionStatus.Cancelled),
    [sessions]
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
  const uploadChatImagesMutation = useUploadChatImages();
  const cancelSessionMutation = useCancelSession();
  const endSessionMutation = useEndSession();

  const buildInternalCasePostContent = (
    aiSummary: string,
    finalDiagnosis: string,
    doctorNote: string
  ) => {
    return [
      '[CASE_RESULT]',
      `${t('Ophthalmologist.consultations.chat.saveResult.aiSummary', 'Tóm tắt AI')}: ${aiSummary || t('Ophthalmologist.consultations.chat.na', 'N/A')}`,
      `${t('Ophthalmologist.consultations.chat.saveResult.finalDiagnosis', 'Chẩn đoán cuối')}: ${finalDiagnosis || t('Ophthalmologist.consultations.chat.na', 'N/A')}`,
      '[/CASE_RESULT]',
      '',
      '[DOCTOR_NOTE]',
      `${t('Ophthalmologist.consultations.chat.saveResult.doctorSays', 'Bác sĩ nói rằng')}: ${doctorNote}`,
      '[/DOCTOR_NOTE]',
    ].join('\n');
  };

  const shareConsultationMutation = useMutation({
    mutationFn: async ({
      consultationSessionId,
      aiSummary,
      finalDiagnosis,
      doctorNote,
    }: {
      consultationSessionId: string;
      aiSummary: string;
      finalDiagnosis: string;
      doctorNote: string;
    }) => {
      const formData = new FormData();
      formData.append(
        'authorType',
        resolveAuthorType(user?.roles, 'Ophthalmologist')
      );
      formData.append('category', 'CasePresentation');
      formData.append('visibility', 'Public');
      formData.append('allowComments', 'true');
      formData.append('isInternalCase', 'true');
      formData.append('consultationSessionId', consultationSessionId);
      formData.append('isAnonymizationConfirmed', 'true');
      formData.append(
        'content',
        buildInternalCasePostContent(aiSummary, finalDiagnosis, doctorNote)
      );
      return postsApi.createPost(formData);
    },
    onSuccess: () => {
      ophthalToast.success(
        t(
          'Ophthalmologist.consultations.chat.shareCase.success',
          'Đã chia sẻ ca lên mạng lưới chuyên môn.'
        )
      );
      queryClient.invalidateQueries({ queryKey: ['network'] });
      setShareCaseContent('');
      setIsShareCaseModalOpen(false);
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(error, 'Failed to share consultation case')
      );
    },
  });

  const phase = currentSession ? getPhase(currentSession) : 'PRE_VISIT';
  const phaseUIConfig = getPhaseUIConfig(t);
  const phaseUI = phaseUIConfig[phase];

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
  const canSendMessage = currentSession?.chatStatus === ChatStatus.Open;

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
  const hasComposerPayload = !!newMessage.trim() || !!pendingImageUrl;
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

    if (
      urlSessionId &&
      chatSessions.some((session) => session.id === urlSessionId)
    ) {
      setSelectedSessionId(urlSessionId);
      return;
    }

    if (chatSessions.length > 0) {
      setSelectedSessionId(chatSessions[0].id);
    }
  }, [chatSessions, selectedSessionId, urlSessionId]);

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
    if (pendingImageUrl) {
      scrollToBottom();
    }
  }, [pendingImageUrl, scrollToBottom]);

  useEffect(() => {
    if (!selectedSession?.id || selectedSession.messages.length === 0) {
      return;
    }

    const latestMessage =
      selectedSession.messages[selectedSession.messages.length - 1];
    const stripped = stripChatAttachments(latestMessage.message);

    const attachmentFallback = extractImageAttachment(latestMessage.message)
      ? t(
          'Ophthalmologist.consultations.chat.previewImageAttachment',
          'Image attachment shared'
        )
      : extractScanAttachment(latestMessage.message)
        ? t(
            'Ophthalmologist.consultations.chat.previewScanAttachment',
            'Retinal scan shared'
          )
        : t(
            'Ophthalmologist.consultations.chat.previewNewMessage',
            'New message'
          );

    setSessionPreviewMap((previous) => ({
      ...previous,
      [selectedSession.id]: stripped || attachmentFallback,
    }));
  }, [selectedSession, t]);

  useEffect(() => {
    setIsSessionOverviewOpen(false);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;

    let timerId: number;
    const start = () => {
      timerId = window.setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    };
    const stop = () => window.clearInterval(timerId);
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selectedSessionId]);

  useEffect(() => {
    const handleChatRealtime = (event: Event) => {
      const customEvent = event as CustomEvent<SignalRChatMessageEvent>;
      const chatEvent = customEvent.detail;
      if (!chatEvent?.sessionId) return;

      // guard against duplicate delivery (reconnect) while still allowing bursts
      if (processedChatEventIdRef.current === chatEvent.messageId) return;
      processedChatEventIdRef.current = chatEvent.messageId;

      if (chatEvent.sessionId === selectedSessionId) {
        setSessionUnreadMap((previous) => ({
          ...previous,
          [chatEvent.sessionId]: false,
        }));

        if (chatEvent.senderProfileId !== currentDoctorId) {
          clearTypingHideTimer();
          setIsPeerTyping(false);
        }
      } else if (chatEvent.senderProfileId !== currentDoctorId) {
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

      if (detail.senderProfileId === currentDoctorId) {
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
  }, [clearTypingHideTimer, currentDoctorId, queryClient, selectedSessionId]);

  const canCancelCurrentSession = useMemo(() => {
    if (!currentSession || currentSession.status !== SessionStatus.Confirmed)
      return false;
    if (!currentSession.appointmentTime) return true;
    const msUntilStart =
      new Date(currentSession.appointmentTime).getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msUntilStart > threeHoursMs;
  }, [currentSession]);

  const canCompleteCurrentSession = useMemo(() => {
    if (!currentSession || currentSession.status !== SessionStatus.Confirmed) {
      return { allowed: false, reason: null as string | null };
    }

    if (currentSession.appointmentTime) {
      const appointmentMs = new Date(currentSession.appointmentTime).getTime();
      if (!Number.isNaN(appointmentMs) && currentTimeMs < appointmentMs) {
        return {
          allowed: false,
          reason: t(
            'Ophthalmologist.consultations.chat.completeBlockedBeforeAppointment',
            'Cannot complete before appointment time.'
          ),
        };
      }
    }

    if (!hasGeneratedCaseReport(selectedSession?.caseSnapshot)) {
      return {
        allowed: false,
        reason: t(
          'Ophthalmologist.consultations.chat.completeBlockedWithoutReport',
          'Generate and save the report before completing this session.'
        ),
      };
    }

    return { allowed: true, reason: null as string | null };
  }, [currentSession, currentTimeMs, selectedSession?.caseSnapshot, t]);

  const handleCancelSession = (sessionId: string) => {
    setSessionActionTarget({ type: 'cancel', sessionId });
  };

  const handleEndSession = (sessionId: string) => {
    setSessionActionTarget({ type: 'complete', sessionId });
  };

  const confirmSessionAction = useCallback(() => {
    if (!currentDoctorId || !sessionActionTarget) {
      return;
    }

    if (sessionActionTarget.type === 'cancel') {
      cancelSessionMutation.mutate(
        {
          sessionId: sessionActionTarget.sessionId,
          cancelledByUserId: currentDoctorId,
          reason: t(
            'Ophthalmologist.consultations.chat.cancelReason',
            'Đã hủy bởi bác sĩ'
          ),
        },
        {
          onSettled: () => setSessionActionTarget(null),
        }
      );
      return;
    }

    const canCompleteTargetSession =
      currentSession?.id === sessionActionTarget.sessionId
        ? canCompleteCurrentSession.allowed
        : true;

    if (!canCompleteTargetSession) {
      if (canCompleteCurrentSession.reason) {
        ophthalToast.warning(canCompleteCurrentSession.reason);
      }
      setSessionActionTarget(null);
      return;
    }

    endSessionMutation.mutate(
      {
        sessionId: sessionActionTarget.sessionId,
        doctorId: currentDoctorId,
      },
      {
        onSettled: () => setSessionActionTarget(null),
      }
    );
  }, [
    cancelSessionMutation,
    canCompleteCurrentSession.allowed,
    canCompleteCurrentSession.reason,
    currentSession?.id,
    currentDoctorId,
    endSessionMutation,
    sessionActionTarget,
    t,
  ]);

  const appendEmoji = (emoji: string) => {
    setNewMessage((previous) => {
      const next = `${previous}${emoji}`;
      if (next.length > MESSAGE_CHARACTER_LIMIT) {
        return next.slice(0, MESSAGE_CHARACTER_LIMIT);
      }
      return next;
    });
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
      ophthalToast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      ophthalToast.error('Image size must be 10MB or less.');
      return;
    }

    try {
      const result = await uploadChatImagesMutation.mutateAsync([file]);
      const uploadedUrl = result.uploadedUrls[0];

      if (!uploadedUrl) {
        ophthalToast.error('Upload failed. Please try again.');
        return;
      }

      setPendingImageUrl(uploadedUrl);
      setPendingImageName(file.name);
      ophthalToast.success('Image attached.');
    } catch (error) {
      const raw = extractApiErrorMessage(
        error,
        'Unable to upload image. Please try again.'
      );
      ophthalToast.error(raw);
    }
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingImageUrl) || !selectedSessionId) return;

    stopOwnTyping();

    const messageParts: string[] = [];
    const trimmedMessage = newMessage.trim();

    if (trimmedMessage) {
      messageParts.push(trimmedMessage);
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
    const draftImageUrl = pendingImageUrl;
    const draftImageName = pendingImageName;
    // Optimistic clear: prevent accidental "abc + xyz" when sending rapidly.
    setNewMessage('');
    setPendingImageUrl(null);
    setPendingImageName(null);
    setIsEmojiPickerOpen(false);

    sendMessageMutation.mutate(
      { sessionId: selectedSessionId, message: messageContent },
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
            ophthalToast.warning(raw);
            sendMessageMutation.reset();
          } else {
            ophthalToast.error(raw);
          }
          // Restore the draft so the user doesn't lose content on failure.
          setNewMessage(draftText);
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

  const getComposerPlaceholder = () => {
    if (phase === 'PRE_VISIT') {
      return t(
        'Ophthalmologist.consultations.chat.preVisitPlaceholder',
        'Review patient notes and leave guidance before session opens...'
      );
    }

    if (phase === 'IN_PROGRESS') {
      return t(
        'Ophthalmologist.consultations.chat.typeMessage',
        'Type a message...'
      );
    }

    return t(
      'Ophthalmologist.consultations.chat.completedPlaceholder',
      'Consultation completed. Messages are read-only.'
    );
  };

  const patientName =
    currentSession?.patientName?.trim() ||
    t('Ophthalmologist.consultations.chat.patient', 'Patient');
  const doctorName =
    user?.fullName?.trim() ||
    t('Ophthalmologist.consultations.chat.doctor', 'Doctor');
  const patientAvatarUrl = resolveAvatarUrl(
    selectedSession?.patientAvatarUrl,
    currentSession?.patientAvatarUrl
  );
  const doctorAvatarUrl = resolveAvatarUrl(
    user?.avatarUrl,
    selectedSession?.ophthalmologistAvatarUrl
  );
  const meetingAccessState = getMeetingAccessState(
    currentSession?.appointmentTime ?? null,
    currentTimeMs,
    t
  );
  const isMeetingClosedBySessionState = phase === 'COMPLETED';
  const canJoinMeeting =
    meetingAccessState.canJoin && !isMeetingClosedBySessionState;

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

        <div className="border-b border-slate-200/80 px-5 py-4 dark:border-[#1e3a5f]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {chatSessions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.consultations.chat.stats.all', 'All')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {totalOpenSessions}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.consultations.chat.stats.open', 'Open')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Clock3 className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {upcomingSessions}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.consultations.chat.stats.upcoming',
                  'Upcoming'
                )}
              </span>
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
              const displayPatientName =
                session.patientName ??
                t('Ophthalmologist.consultations.chat.patient', 'Patient');
              const appointmentTime = formatAppointmentSlotOrPending(
                session.appointmentTime,
                t
              );
              const previewText =
                sessionPreviewMap[session.id] ??
                getSessionPreviewText(session, t);
              const isUnread =
                (sessionUnreadMap[session.id] ?? false) ||
                getSessionUnreadCount(session) > 0;
              const statusDotClass = getChatStatusDotClass(session.chatStatus);

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
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-[#0a1f44] ${statusDotClass}`}
                        title={session.chatStatusName}
                      >
                        <span className="sr-only">
                          {session.chatStatusName}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {displayPatientName}
                        </p>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span
                              className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.2)]"
                              title={t(
                                'Ophthalmologist.consultations.chat.unreadActivity',
                                'Unread activity'
                              )}
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
                    name={patientName}
                    avatarUrl={patientAvatarUrl}
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

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-300">
                    <span>{SESSION_TYPE_LABELS[currentSession.type]}</span>
                    <span className="text-slate-300 dark:text-gray-600">•</span>
                    <span>{SESSION_STATUS_LABELS[currentSession.status]}</span>
                    <span className="text-slate-300 dark:text-gray-600">•</span>
                    <span className="truncate">
                      {formatAppointmentSlotOrPending(
                        currentSession.appointmentTime,
                        t
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex w-full flex-col items-start gap-1 sm:w-auto sm:items-end">
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                    {canCancelCurrentSession && (
                      <button
                        onClick={() => handleCancelSession(currentSession.id)}
                        disabled={cancelSessionMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-200"
                      >
                        {cancelSessionMutation.isPending ? (
                          <Spinner size={14} />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">
                          {t('Ophthalmologist.common.cancel', 'Cancel')}
                        </span>
                      </button>
                    )}

                    {currentSession.status === SessionStatus.Confirmed && (
                      <button
                        onClick={() => {
                          if (!canCompleteCurrentSession.allowed) {
                            if (canCompleteCurrentSession.reason) {
                              ophthalToast.warning(
                                canCompleteCurrentSession.reason
                              );
                            }
                            return;
                          }
                          handleEndSession(currentSession.id);
                        }}
                        disabled={
                          endSessionMutation.isPending ||
                          !canCompleteCurrentSession.allowed
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        {endSessionMutation.isPending ? (
                          <Spinner size={14} />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">
                          {t(
                            'Ophthalmologist.consultations.chat.complete',
                            'Complete'
                          )}
                        </span>
                      </button>
                    )}

                    {currentSession.meetingLink ? (
                      canJoinMeeting ? (
                        <a
                          href={currentSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
                        >
                          <Video className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {t(
                              'Ophthalmologist.consultations.chat.joinMeeting',
                              'Join Meeting'
                            )}
                          </span>
                          <span className="sm:hidden">
                            {t(
                              'Ophthalmologist.consultations.chat.join',
                              'Join'
                            )}
                          </span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
                        >
                          <Video className="h-4 w-4" />
                          {isMeetingClosedBySessionState
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm"
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
                    <p className="hidden text-xs font-medium text-slate-500 md:block dark:text-gray-400">
                      {isMeetingClosedBySessionState
                        ? t(
                            'Ophthalmologist.consultations.chat.meetingWindowClosed',
                            'Appointment has passed the meeting window'
                          )
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
                      ? t(
                          'Ophthalmologist.consultations.chat.hideSessionOverview',
                          'Hide session overview'
                        )
                      : t(
                          'Ophthalmologist.consultations.chat.showSessionOverview',
                          'Show session overview'
                        )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600 dark:bg-[#0a1f44] dark:border-[#1e3a5f] dark:text-gray-300"
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
                          <span className="inline-flex animate-pulse items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs ring-1 ring-amber-200 dark:bg-amber-900/30 dark:ring-amber-700/40">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            {t(
                              'Ophthalmologist.consultations.chat.opensIn',
                              'Chat opens in'
                            )}{' '}
                            {formatCountdown(Math.ceil(msUntilStart / 1000))}
                          </span>
                        </p>
                      );
                    })()}
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
                  const isDoctorMessage =
                    message.senderUserId === currentDoctorId;
                  const scanAttachmentMeta = message.scanMeta;
                  const imageAttachmentMeta = message.imageMeta;
                  const messageBody = message.body;
                  const previousMessage = parsedMessages[index - 1];
                  const nextMessage = parsedMessages[index + 1];
                  const isPreviousSameSender =
                    previousMessage?.senderUserId === message.senderUserId;
                  const isNextSameSender =
                    nextMessage?.senderUserId === message.senderUserId;
                  const showAvatar = !isPreviousSameSender || !isNextSameSender;
                  const showDateDivider =
                    !previousMessage ||
                    formatFullDate(previousMessage.sentAt) !==
                      formatFullDate(message.sentAt);

                  const bubbleMetaTitle = isDoctorMessage
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
                        );
                  const BubbleMetaIcon = isDoctorMessage
                    ? phase === 'PRE_VISIT'
                      ? FileText
                      : CheckCheck
                    : UserRound;

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
                        className={`flex items-end gap-3 ${isDoctorMessage ? 'justify-end' : 'justify-start'} ${isPreviousSameSender ? 'mt-1' : ''}`}
                      >
                        {!isDoctorMessage &&
                          (showAvatar ? (
                            <AvatarBadge
                              name={patientName}
                              avatarUrl={patientAvatarUrl}
                              size="sm"
                            />
                          ) : (
                            <div className="h-9 w-9 shrink-0" aria-hidden />
                          ))}

                        <div
                          className={`max-w-[78%] ${isDoctorMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}
                        >
                          <div
                            className={`rounded-[24px] px-4 py-3 shadow-sm ${
                              isDoctorMessage
                                ? 'rounded-br-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-white'
                            }`}
                          >
                            {!isPreviousSameSender && (
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
                            )}

                            {messageBody && (
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {messageBody}
                              </p>
                            )}

                            {imageAttachmentMeta && (
                              <div
                                className={`mt-3 rounded-2xl border p-2 ${
                                  isDoctorMessage
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
                                      t(
                                        'Ophthalmologist.consultations.chat.sharedImage',
                                        'Ảnh đã chia sẻ'
                                      )
                                    }
                                    className="max-h-64 w-full rounded-xl object-cover"
                                    loading="lazy"
                                  />
                                </a>
                                {imageAttachmentMeta.fileName && (
                                  <p
                                    className={`mt-2 truncate text-xs ${
                                      isDoctorMessage
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
                                      {scanAttachmentMeta.title}
                                    </p>
                                    <p
                                      className={`mt-1 text-xs ${
                                        isDoctorMessage
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
                            className={`flex items-center gap-1 px-1 text-[11px] ${isDoctorMessage ? 'text-slate-400 dark:text-gray-500' : 'text-slate-500 dark:text-gray-400'}`}
                          >
                            <span
                              className="group relative inline-flex items-center"
                              title={bubbleMetaTitle}
                              aria-label={bubbleMetaTitle}
                              tabIndex={0}
                            >
                              <BubbleMetaIcon
                                className={`h-3.5 w-3.5 ${
                                  isDoctorMessage
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

                        {isDoctorMessage &&
                          (showAvatar ? (
                            <AvatarBadge
                              name={doctorName}
                              avatarUrl={doctorAvatarUrl}
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
            {isPeerTyping && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/90 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:border-cyan-800/40 dark:bg-cyan-950/30 dark:text-cyan-200">
                <div className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
                </div>
                <span>
                  {t(
                    'Ophthalmologist.consultations.chat.patientTyping',
                    'Patient is typing...'
                  )}
                </span>
              </div>
            )}

            {pendingImageUrl && (
              <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                <img
                  src={pendingImageUrl}
                  alt={
                    pendingImageName ??
                    t(
                      'Ophthalmologist.consultations.chat.pendingImage',
                      'Pending image'
                    )
                  }
                  className="h-14 w-14 rounded-2xl object-cover ring-1 ring-emerald-200 dark:ring-emerald-800/50"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    {t(
                      'Ophthalmologist.consultations.chat.readyToShareImage',
                      'Ready to share image'
                    )}
                  </p>
                  <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-200">
                    {pendingImageName ?? pendingImageUrl}
                  </p>
                </div>
                <button
                  type="button"
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
                          {t(
                            'Ophthalmologist.consultations.chat.encryptionNoticeShort',
                            'Encrypted'
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {pendingImageUrl && (
                          <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 sm:inline-block dark:bg-emerald-900/25 dark:text-emerald-200 dark:ring-emerald-800/50">
                            {t(
                              'Ophthalmologist.consultations.chat.imageAttached',
                              'image attached'
                            )}
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
                        {t(
                          'Ophthalmologist.consultations.chat.characterLimitReached',
                          'Character limit reached.'
                        )}
                      </p>
                    )}
                  </div>
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
        <>
          <button
            type="button"
            aria-label={t(
              'Ophthalmologist.consultations.chat.closeSessionOverview',
              'Close session overview'
            )}
            onClick={() => setIsSessionOverviewOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/35 backdrop-blur-[1px] xl:hidden"
          />

          <section className="fixed inset-x-0 bottom-0 z-40 max-h-[78vh] overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl xl:hidden dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarBadge
                  name={patientName}
                  avatarUrl={patientAvatarUrl}
                  size="md"
                />
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {patientName}
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

                <div className="mt-3 flex items-start gap-3">
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

                <div className="mt-3 flex items-start gap-3">
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

                <div className="mt-3 flex items-start gap-3">
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#1e3a5f] dark:bg-[#0a1929]/40">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.consultations.chat.shareCase.title',
                    'Share Case To Network'
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.consultations.chat.shareCase.description',
                    'Share anonymized cases to Aura Network with a clinical post layout.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setIsShareCaseModalOpen(true)}
                  disabled={
                    !currentSession?.id ||
                    !selectedSession?.caseSnapshot ||
                    shareConsultationMutation.isPending
                  }
                  className="mt-3 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shareConsultationMutation.isPending
                    ? t(
                        'Ophthalmologist.consultations.chat.shareCase.sharing',
                        'Sharing case...'
                      )
                    : t(
                        'Ophthalmologist.consultations.chat.shareCase.title',
                        'Share Case To Network'
                      )}
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-[#030712]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  <Stethoscope className="h-4 w-4" />
                  {t(
                    'Ophthalmologist.consultations.chat.conversationGuidance',
                    'Conversation Guidance'
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {t(
                    'Ophthalmologist.consultations.chat.guidanceDescription',
                    'Be specific about symptom timing, changes in vision, pain, and recent scan results. Short, structured notes make it easier to triage quickly.'
                  )}
                </p>
              </div>
            </div>
          </section>

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
                    {t(
                      'Ophthalmologist.consultations.chat.shareCase.title',
                      'Share Case To Network'
                    )}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.consultations.chat.shareCase.description',
                      'Share anonymized cases to Aura Network with a clinical post layout.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsShareCaseModalOpen(true)}
                    disabled={
                      !currentSession?.id ||
                      !selectedSession?.caseSnapshot ||
                      shareConsultationMutation.isPending
                    }
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {shareConsultationMutation.isPending
                      ? t(
                          'Ophthalmologist.consultations.chat.shareCase.sharing',
                          'Sharing case...'
                        )
                      : t(
                          'Ophthalmologist.consultations.chat.shareCase.title',
                          'Share Case To Network'
                        )}
                  </button>
                  {!selectedSession?.caseSnapshot && (
                    <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-300">
                      {t(
                        'Ophthalmologist.consultations.chat.shareCase.notEligible',
                        'This consultation has no retinal snapshot or final diagnosis yet, so it cannot be shared.'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {selectedSession?.caseSnapshot && (
                <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0a1f44] dark:ring-[#1e3a5f]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.consultations.chat.aiCaseSnapshot',
                      'AI Case Snapshot'
                    )}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                    Screening #
                    {selectedSession.caseSnapshot.screeningId.slice(0, 8)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0a1929]/40">
                      {selectedSession.caseSnapshot.originalImageUrls[0] ? (
                        <img
                          src={
                            selectedSession.caseSnapshot.originalImageUrls[0]
                          }
                          alt={t(
                            'Ophthalmologist.consultations.chat.originalRetinalImage',
                            'Original retinal image'
                          )}
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="h-24 w-full flex items-center justify-center text-[11px] text-slate-500">
                          {t(
                            'Ophthalmologist.consultations.chat.noOriginalImage',
                            'No original image'
                          )}
                        </div>
                      )}
                      <p className="px-2 py-1 text-[10px] text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-[#1e3a5f]">
                        {t(
                          'Ophthalmologist.consultations.chat.original',
                          'Original'
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0a1929]/40">
                      <CaseSnapshotAiThumbnail
                        snapshot={selectedSession.caseSnapshot}
                      />
                      <p className="px-2 py-1 text-[10px] text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-[#1e3a5f]">
                        {t(
                          'Ophthalmologist.consultations.chat.aiAnnotated',
                          'AI Annotated'
                        )}
                      </p>
                    </div>
                  </div>

                  <ScreeningReviewLink
                    screeningId={selectedSession.caseSnapshot.screeningId}
                  />

                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {t('Ophthalmologist.consultations.chat.risk', 'Nguy cơ')}:{' '}
                      {selectedSession.caseSnapshot.riskLevel ??
                        t(
                          'Ophthalmologist.consultations.chat.unknown',
                          'Không rõ'
                        )}{' '}
                      |{' '}
                      {t(
                        'Ophthalmologist.consultations.chat.confidence',
                        'Độ tin cậy'
                      )}
                      : {selectedSession.caseSnapshot.confidenceScore ?? '--'}%
                    </p>
                    {selectedSession.caseSnapshot.summary && (
                      <p className="text-sm text-slate-700 dark:text-gray-300">
                        {selectedSession.caseSnapshot.summary}
                      </p>
                    )}
                    {selectedSession.caseSnapshot.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSession.caseSnapshot.symptoms.map(
                          (symptom) => (
                            <span
                              key={symptom}
                              className="rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200 px-2 py-1 text-[11px] font-medium border border-cyan-200 dark:border-cyan-800"
                            >
                              {symptom}
                            </span>
                          )
                        )}
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
        </>
      )}

      {currentSession && selectedSession?.caseSnapshot && (
        <ShareCaseModal
          t={t}
          isOpen={isShareCaseModalOpen}
          isSubmitting={shareConsultationMutation.isPending}
          patientName={patientName}
          content={shareCaseContent}
          onChangeContent={setShareCaseContent}
          onClose={() => setIsShareCaseModalOpen(false)}
          onSubmit={() =>
            shareConsultationMutation.mutate({
              consultationSessionId: currentSession.id,
              aiSummary: selectedSession.caseSnapshot?.summary ?? '',
              finalDiagnosis:
                selectedSession.caseSnapshot?.findings ??
                selectedSession.caseSnapshot?.summary ??
                '',
              doctorNote: shareCaseContent.trim(),
            })
          }
          caseSnapshot={{
            summary: selectedSession.caseSnapshot.summary,
            findings: selectedSession.caseSnapshot.findings,
            riskLevel: selectedSession.caseSnapshot.riskLevel,
            confidenceScore: selectedSession.caseSnapshot.confidenceScore,
            originalImageUrls: selectedSession.caseSnapshot.originalImageUrls,
          }}
        />
      )}

      <ConfirmModal
        open={!!sessionActionTarget}
        title={
          sessionActionTarget?.type === 'cancel'
            ? t(
                'Ophthalmologist.consultations.chat.cancelSessionTitle',
                'Cancel session?'
              )
            : t(
                'Ophthalmologist.consultations.chat.completeConsultationTitle',
                'Complete consultation?'
              )
        }
        message={
          sessionActionTarget?.type === 'cancel'
            ? t(
                'Ophthalmologist.consultations.chat.confirmCancelSession',
                'Cancel this session? The slot will be burned and the patient will be refunded.'
              )
            : t(
                'Ophthalmologist.consultations.chat.confirmCompleteSession',
                'Complete this consultation? The patient will be charged and the chat will be locked.'
              )
        }
        confirmLabel={
          sessionActionTarget?.type === 'cancel'
            ? t('Ophthalmologist.common.cancel', 'Cancel')
            : t('Ophthalmologist.consultations.chat.complete', 'Complete')
        }
        cancelLabel={t('Ophthalmologist.common.back', 'Back')}
        tone={sessionActionTarget?.type === 'cancel' ? 'danger' : 'default'}
        isLoading={
          sessionActionTarget?.type === 'cancel'
            ? cancelSessionMutation.isPending
            : endSessionMutation.isPending
        }
        onCancel={() => setSessionActionTarget(null)}
        onConfirm={confirmSessionAction}
      />
    </div>
  );
}
