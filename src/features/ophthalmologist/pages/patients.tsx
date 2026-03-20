import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import Spinner from '@/components/ui/spinner';
import { useConsultationSessions } from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import { SessionStatus } from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';

type PatientCardStatus = 'active' | 'urgent' | 'past';

interface PatientCardItem {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  status: PatientCardStatus;
  statusLabel: string;
  totalVisits: number;
  upcomingCount: number;
  completedCount: number;
  nextAppointment: string;
  lastVisit: string;
}

const AVATAR_COLORS = [
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#10b981',
  '#6366f1',
  '#ef4444',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getAvatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const formatAppointmentDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isUpcomingSession = (session: ConsultationSessionListDto) => {
  if (
    session.status !== SessionStatus.Pending &&
    session.status !== SessionStatus.Confirmed
  ) {
    return false;
  }

  if (!session.appointmentTime) return true;
  const appointmentTime = new Date(session.appointmentTime);
  if (Number.isNaN(appointmentTime.getTime())) return true;
  return appointmentTime.getTime() >= Date.now();
};

const getStatusStyle = (
  status: PatientCardStatus
): { bg: string; text: string } => {
  switch (status) {
    case 'urgent':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'past':
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
    default:
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  }
};

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { user } = useAuthStore();
  const ophthalmologistId = user?.roleId;

  const { data: sessionsData, isLoading } = useConsultationSessions(
    {
      ophthalmologistId: ophthalmologistId ?? undefined,
      pageSize: 200,
    },
    {
      enabled: !!ophthalmologistId,
    }
  );

  const sessions = sessionsData?.items ?? [];

  const patients = useMemo<PatientCardItem[]>(() => {
    const grouped = new Map<string, ConsultationSessionListDto[]>();

    for (const session of sessions) {
      const key = session.patientId;
      const current = grouped.get(key) ?? [];
      current.push(session);
      grouped.set(key, current);
    }

    const result: PatientCardItem[] = [];

    grouped.forEach((patientSessions, patientId) => {
      const sortedByTimeDesc = [...patientSessions].sort((a, b) => {
        const aValue = new Date(a.appointmentTime ?? a.createdAt).getTime();
        const bValue = new Date(b.appointmentTime ?? b.createdAt).getTime();
        return bValue - aValue;
      });

      const upcomingSessions = patientSessions
        .filter((session) => isUpcomingSession(session))
        .sort((a, b) => {
          const aValue = new Date(a.appointmentTime ?? a.createdAt).getTime();
          const bValue = new Date(b.appointmentTime ?? b.createdAt).getTime();
          return aValue - bValue;
        });

      const completedSessions = patientSessions.filter(
        (session) => session.status === SessionStatus.Completed
      );

      const nextUpcoming = upcomingSessions[0]?.appointmentTime ?? null;
      const latestCompleted = [...completedSessions].sort((a, b) => {
        const aValue = new Date(a.appointmentTime ?? a.createdAt).getTime();
        const bValue = new Date(b.appointmentTime ?? b.createdAt).getTime();
        return bValue - aValue;
      })[0]?.appointmentTime;

      let status: PatientCardStatus = 'past';
      if (upcomingSessions.length > 0) {
        const nearest = nextUpcoming ? new Date(nextUpcoming).getTime() : null;
        status =
          nearest !== null &&
          !Number.isNaN(nearest) &&
          nearest - Date.now() <= 24 * 60 * 60 * 1000
            ? 'urgent'
            : 'active';
      }

      const displayName =
        sortedByTimeDesc[0]?.patientName?.trim() ||
        `Patient ${patientId.slice(0, 8)}`;

      result.push({
        id: patientId,
        name: displayName,
        initials: getInitials(displayName),
        avatarColor: getAvatarColor(patientId),
        status,
        statusLabel:
          status === 'urgent'
            ? 'Upcoming < 24h'
            : status === 'active'
              ? 'Has upcoming appointment'
              : 'Past consultations only',
        totalVisits: patientSessions.length,
        upcomingCount: upcomingSessions.length,
        completedCount: completedSessions.length,
        nextAppointment: formatAppointmentDate(nextUpcoming),
        lastVisit: formatAppointmentDate(latestCompleted),
      });
    });

    return result.sort((a, b) => {
      if (a.status !== b.status) {
        const order: Record<PatientCardStatus, number> = {
          urgent: 0,
          active: 1,
          past: 2,
        };
        return order[a.status] - order[b.status];
      }

      return a.name.localeCompare(b.name);
    });
  }, [sessions]);

  const filteredPatients = patients.filter((patient) => {
    const needle = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      patient.name.toLowerCase().includes(needle) ||
      patient.id.toLowerCase().includes(needle);
    const matchesStatus =
      selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const urgentPatients = patients.filter((p) => p.status === 'urgent').length;
  const pastPatients = patients.filter((p) => p.status === 'past').length;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader pageName="Patients" />
          <main className="p-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <Spinner size={40} className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading patient consultations...
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
      <DoctorSidebar pendingCount={urgentPatients} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Patients" />

        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Patients
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Patients with past or upcoming consultations assigned to you
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name or profile ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="urgent">Urgent</option>
                <option value="past">Past Only</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] hover:bg-gray-50 dark:hover:bg-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white transition-colors">
                <Filter size={16} />
                More Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalPatients}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Active
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activePatients}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Urgent
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {urgentPatients}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Past Only
              </p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                {pastPatients}
              </p>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-10 text-center text-gray-500 dark:text-gray-400">
              No patients found for this doctor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => {
                const statusStyle = getStatusStyle(patient.status);

                return (
                  <div
                    key={patient.id}
                    className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: patient.avatarColor }}
                        >
                          {patient.initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {patient.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {patient.id.slice(0, 8)}... • {patient.totalVisits}{' '}
                            session(s)
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {patient.statusLabel}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar
                          size={14}
                          className="text-gray-400 dark:text-gray-500"
                        />
                        Next appointment: {patient.nextAppointment}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock
                          size={14}
                          className="text-gray-400 dark:text-gray-500"
                        />
                        Last completed visit: {patient.lastVisit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#1e3a5f]">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} />
                        Upcoming: {patient.upcomingCount}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Eye size={12} />
                        Completed: {patient.completedCount}
                      </div>
                    </div>

                    <button className="w-full mt-4 py-2.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-xl transition-colors">
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
