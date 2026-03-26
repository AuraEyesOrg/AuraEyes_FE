import { useMemo, useState } from 'react';
import {
  Search,
  Eye,
  Calendar,
  Clock,
  MessageSquare,
  Users,
  UserCheck,
  AlertTriangle,
  UserX,
  LayoutGrid,
  List,
  ArrowRight,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DoctorSidebar, DoctorHeader } from '../components';
import Spinner from '@/components/ui/spinner';
import { useConsultationSessions } from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import { SessionStatus } from '@/types/consultation';
import type { ConsultationSessionListDto } from '@/types/consultation';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { DEFAULT_LOCALE, getLocaleFromPathname } from '@/i18n/locales';

type PatientCardStatus = 'active' | 'urgent' | 'past';
type ViewMode = 'grid' | 'table';

/* ────────────────────── helpers ────────────────────── */

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
  lastDiagnosis: string;
  visitHistory: [number, number, number];
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

const formatAppointmentDate = (
  value: string | null | undefined,
  locale: string,
  fallback: string
) => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(locale, {
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

const getSessionTimestamp = (session: ConsultationSessionListDto) => {
  const base = session.appointmentTime ?? session.createdAt;
  const date = new Date(base);
  const time = date.getTime();
  if (!Number.isNaN(time)) return time;
  return new Date(session.createdAt).getTime();
};

const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

const getVisitHistoryFromSessions = (
  patientSessions: ConsultationSessionListDto[]
): [number, number, number] => {
  const now = new Date();
  const current = monthIndex(now);
  const buckets: [number, number, number] = [0, 0, 0]; // 2 mo ago, 1 mo ago, this

  for (const s of patientSessions) {
    const ts = getSessionTimestamp(s);
    if (Number.isNaN(ts)) continue;
    const d = new Date(ts);
    const diff = current - monthIndex(d);
    if (diff === 0) buckets[2] += 1;
    else if (diff === 1) buckets[1] += 1;
    else if (diff === 2) buckets[0] += 1;
  }

  return buckets;
};

const getLastDiagnosisFromSessions = (
  patientSessions: ConsultationSessionListDto[],
  fallback: string
) => {
  const sorted = [...patientSessions].sort(
    (a, b) => getSessionTimestamp(b) - getSessionTimestamp(a)
  );

  for (const s of sorted) {
    const findings = s.caseSnapshot?.findings?.trim();
    if (findings) return findings;
    const summary = s.caseSnapshot?.summary?.trim();
    if (summary) return summary;
  }

  return fallback;
};

const getStatusMeta = (status: PatientCardStatus) => {
  switch (status) {
    case 'urgent':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        pulse: true,
      };
    case 'active':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        pulse: false,
      };
    case 'past':
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        pulse: false,
      };
  }
};

/* ────────────────────── Mini bar chart component ────────────────────── */
function MiniBarChart({ data }: { data: [number, number, number] }) {
  const max = Math.max(...data, 1);
  const labels = ['2 mo', '1 mo', 'This'];
  return (
    <div className="flex items-end gap-1 h-8">
      {data.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            className={`w-4 rounded-sm transition-all ${
              i === 2 ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            style={{ height: `${Math.max((val / max) * 24, 2)}px` }}
          />
          <span className="text-[9px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────── component ────────────────────── */

export default function PatientsPage() {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
        const aValue = getSessionTimestamp(a);
        const bValue = getSessionTimestamp(b);
        return bValue - aValue;
      });

      const upcomingSessions = patientSessions
        .filter((session) => isUpcomingSession(session))
        .sort((a, b) => {
          const aValue = getSessionTimestamp(a);
          const bValue = getSessionTimestamp(b);
          return aValue - bValue;
        });

      const completedSessions = patientSessions.filter(
        (session) => session.status === SessionStatus.Completed
      );

      const nextUpcoming = upcomingSessions[0]?.appointmentTime ?? null;
      const latestCompleted = [...completedSessions].sort((a, b) => {
        const aValue = getSessionTimestamp(a);
        const bValue = getSessionTimestamp(b);
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
        `${t('Ophthalmologist.patients.patientPrefix', 'Patient')} ${patientId.slice(0, 8)}`;

      const lastDiagnosis = getLastDiagnosisFromSessions(
        patientSessions,
        t('Ophthalmologist.patients.notAvailable', 'N/A')
      );

      result.push({
        id: patientId,
        name: displayName,
        initials: getInitials(displayName),
        avatarColor: getAvatarColor(patientId),
        status,
        statusLabel:
          status === 'urgent'
            ? t('Ophthalmologist.patients.statusLabel.urgent', 'Upcoming < 24h')
            : status === 'active'
              ? t('Ophthalmologist.patients.statusLabel.active', 'Has upcoming')
              : t('Ophthalmologist.patients.statusLabel.past', 'Past only'),
        totalVisits: patientSessions.length,
        upcomingCount: upcomingSessions.length,
        completedCount: completedSessions.length,
        nextAppointment: formatAppointmentDate(
          nextUpcoming,
          dateLocale,
          t('Ophthalmologist.patients.notAvailable', 'N/A')
        ),
        lastVisit: formatAppointmentDate(
          latestCompleted,
          dateLocale,
          t('Ophthalmologist.patients.notAvailable', 'N/A')
        ),
        lastDiagnosis,
        visitHistory: getVisitHistoryFromSessions(patientSessions),
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
  }, [sessions, t, dateLocale]);

  const filteredPatients = patients.filter((patient) => {
    const needle = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      patient.name.toLowerCase().includes(needle) ||
      patient.id.toLowerCase().includes(needle) ||
      patient.lastDiagnosis.toLowerCase().includes(needle);
    const matchesStatus =
      selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const urgentPatients = patients.filter((p) => p.status === 'urgent').length;
  const pastPatients = patients.filter((p) => p.status === 'past').length;

  const statusTabs = [
    {
      key: 'all',
      label: t('Ophthalmologist.patients.filter.allStatus', 'All'),
      count: totalPatients,
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: 'urgent',
      label: t('Ophthalmologist.patients.filter.urgent', 'Urgent'),
      count: urgentPatients,
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      key: 'active',
      label: t('Ophthalmologist.patients.filter.active', 'Active'),
      count: activePatients,
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      key: 'past',
      label: t('Ophthalmologist.patients.filter.pastOnly', 'Past'),
      count: pastPatients,
      icon: <UserX className="w-4 h-4" />,
    },
  ];

  const goToPatient = (patientId: string) =>
    navigate(
      `/ophthalmologist/consultations?patientId=${encodeURIComponent(patientId)}`
    );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader
            pageName={t('Ophthalmologist.patients.title', 'Patients')}
          />
          <main className="p-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <Spinner size={40} className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.patients.loading',
                    'Loading patient consultations...'
                  )}
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
        <DoctorHeader
          pageName={t('Ophthalmologist.patients.title', 'Patients')}
        />

        <main className="p-6 max-w-[1400px] mx-auto">
          {/* ── Header ── */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('Ophthalmologist.patients.title', 'Patients')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  'Ophthalmologist.patients.subtitle',
                  'Patients with past or upcoming consultations assigned to you'
                )}
              </p>
            </div>
          </div>

          {/* ── Compact Stats ── */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {totalPatients}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.patients.stats.totalPatients', 'Total')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {urgentPatients}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.patients.stats.urgent', 'Urgent')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {activePatients}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.patients.stats.active', 'Active')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f]">
              <UserX className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {pastPatients}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('Ophthalmologist.patients.stats.pastOnly', 'Past')}
              </span>
            </div>
          </div>

          {/* ── Search + Tabs + View Toggle ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t(
                  'Ophthalmologist.patients.searchPlaceholder',
                  'Search patients by name, ID, or diagnosis...'
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-[#0a1929] rounded-xl p-1 gap-0.5">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedStatus === tab.key
                      ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                      selectedStatus === tab.key
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-[#0a1929] rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Empty state ── */}
          {filteredPatients.length === 0 ? (
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Ophthalmologist.patients.emptyTitle', 'No Patients Found')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery
                  ? t(
                      'Ophthalmologist.patients.emptySearch',
                      'No patients match your search. Try different keywords.'
                    )
                  : t(
                      'Ophthalmologist.patients.empty',
                      'No patients found for this doctor.'
                    )}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => {
                const meta = getStatusMeta(patient.status);

                return (
                  <div
                    key={patient.id}
                    className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300 group"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: patient.avatarColor }}
                          >
                            {patient.initials}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                              {patient.name}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {patient.id.slice(0, 8)} • {patient.totalVisits}{' '}
                              {t(
                                'Ophthalmologist.patients.sessionsSuffix',
                                'sessions'
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${
                              meta.pulse ? 'animate-pulse' : ''
                            }`}
                          />
                          {patient.statusLabel}
                        </span>
                      </div>

                      {/* Last Diagnosis */}
                      <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-[#0a1929] rounded-lg">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Last Diagnosis
                        </span>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {patient.lastDiagnosis}
                        </p>
                      </div>

                      {/* Dates + Visit Chart */}
                      <div className="flex items-end justify-between mb-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={12} className="text-gray-400" />
                            <span>
                              {t(
                                'Ophthalmologist.patients.nextAppointment',
                                'Next'
                              )}
                              :{' '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {patient.nextAppointment}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={12} className="text-gray-400" />
                            <span>
                              {t(
                                'Ophthalmologist.patients.lastCompletedVisit',
                                'Last visit'
                              )}
                              :{' '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {patient.lastVisit}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 ml-3">
                          <MiniBarChart data={patient.visitHistory} />
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#1e3a5f]">
                        <button
                          type="button"
                          onClick={() => goToPatient(patient.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                          {t(
                            'Ophthalmologist.patients.viewRecords',
                            'View Records'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => goToPatient(patient.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
                        >
                          <MessageSquare size={14} />
                          {t('Ophthalmologist.patients.message', 'Message')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Table View ── */
            <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#1e3a5f]">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Diagnosis
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Next Appt
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Visits
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-[#1e3a5f]/50">
                    {filteredPatients.map((patient) => {
                      const meta = getStatusMeta(patient.status);
                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#0a1929]/30 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                style={{
                                  backgroundColor: patient.avatarColor,
                                }}
                              >
                                {patient.initials}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white text-sm">
                                  {patient.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {patient.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${
                                  meta.pulse ? 'animate-pulse' : ''
                                }`}
                              />
                              {patient.statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                              {patient.lastDiagnosis}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {patient.nextAppointment}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {patient.lastVisit}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {patient.totalVisits}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <MiniBarChart data={patient.visitHistory} />
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => goToPatient(patient.id)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                            >
                              View
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
