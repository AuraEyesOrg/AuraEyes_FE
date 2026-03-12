import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';
import {
  useConsultationSessions,
  useCancelSession,
} from '@/features/consultation/hooks';
import {
  SessionStatus,
  ConsultationSessionType,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';

// TODO: Replace with actual user ID from auth store
const CURRENT_PATIENT_ID = '9648d5eb-7a29-4699-9a37-d0fb991d656c';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

const AppointmentsPage = () => {
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data: sessionsData, isLoading } = useConsultationSessions({
    patientId: CURRENT_PATIENT_ID,
    pageSize: 50,
  });

  const cancelMutation = useCancelSession();

  const sessions = sessionsData?.items ?? [];

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filter === 'all') return true;
      if (filter === 'upcoming')
        return (
          s.status === SessionStatus.Pending ||
          s.status === SessionStatus.Confirmed
        );
      if (filter === 'completed') return s.status === SessionStatus.Completed;
      if (filter === 'cancelled') return s.status === SessionStatus.Cancelled;
      return true;
    });
  }, [sessions, filter]);

  const upcomingCount = sessions.filter(
    (s) =>
      s.status === SessionStatus.Pending || s.status === SessionStatus.Confirmed
  ).length;
  const completedCount = sessions.filter(
    (s) => s.status === SessionStatus.Completed
  ).length;

  const handleCancel = (sessionId: string) => {
    cancelMutation.mutate({
      sessionId,
      cancelledByUserId: CURRENT_PATIENT_ID,
      reason: 'Cancelled by patient',
    });
  };

  const getStatusBadge = (session: ConsultationSessionListDto) => {
    switch (session.status) {
      case SessionStatus.Pending:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case SessionStatus.Confirmed:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      case SessionStatus.Completed:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case SessionStatus.Cancelled:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getSessionIcon = (type: ConsultationSessionType) => {
    switch (type) {
      case ConsultationSessionType.Verification:
        return <Eye className="w-7 h-7 text-blue-600" />;
      case ConsultationSessionType.VideoCall:
        return <Video className="w-7 h-7 text-purple-600" />;
      default:
        return <Calendar className="w-7 h-7 text-brand" />;
    }
  };

  const getSessionIconBg = (session: ConsultationSessionListDto) => {
    if (
      session.status === SessionStatus.Pending ||
      session.status === SessionStatus.Confirmed
    ) {
      return 'bg-brand-soft';
    }
    if (session.status === SessionStatus.Completed) {
      return 'bg-green-100 dark:bg-green-900/30';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Spinner size={40} className="mx-auto mb-4" />
            <p className="text-(--text-secondary)">Loading appointments...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
            Appointments
          </h1>
          <p className="text-(--text-secondary)">
            Manage your consultation sessions
          </p>
        </div>

        <Link
          to="/patient/clinics"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold w-fit"
        >
          <Plus className="h-5 w-5" />
          Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {upcomingCount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {completedCount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {sessions.length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {
                  sessions.filter((s) => s.status === SessionStatus.Cancelled)
                    .length
                }
              </p>
              <p className="text-xs text-[var(--text-muted)]">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        {(['all', 'upcoming', 'completed', 'cancelled'] as FilterTab[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-brand text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`medical-card p-6 hover:border-brand/30 transition-colors ${
              session.status === SessionStatus.Cancelled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${getSessionIconBg(session)}`}
                >
                  {getSessionIcon(session.type)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-(--text-primary)">
                      {SESSION_TYPE_LABELS[session.type]}
                    </h3>
                    {getStatusBadge(session)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(session.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    {session.appointmentTime && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(session.appointmentTime).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <User className="w-4 h-4" />
                      <span>{SESSION_STATUS_LABELS[session.status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.type === ConsultationSessionType.VideoCall ? (
                        <>
                          <Video className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600">
                            Video Consultation
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span className="text-[var(--text-secondary)]">
                            {SESSION_TYPE_LABELS[session.type]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                {(session.status === SessionStatus.Pending ||
                  session.status === SessionStatus.Confirmed) && (
                  <>
                    <Link
                      to="/patient/chat"
                      className="flex-1 lg:flex-none px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Chat
                    </Link>
                    {session.type === ConsultationSessionType.VideoCall && (
                      <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        Join Call
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(session.id)}
                      disabled={cancelMutation.isPending}
                      className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {session.status === SessionStatus.Completed && (
                  <Link
                    to="/patient/chat"
                    className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No Sessions Found
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {filter === 'all'
              ? "You haven't created any consultation sessions yet."
              : `No ${filter} sessions.`}
          </p>
          <Link
            to="/patient/clinics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Book Your First Appointment
          </Link>
        </div>
      )}
    </PatientLayout>
  );
};

export default AppointmentsPage;
