import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Stethoscope,
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  Check,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { resolvePathWithLocale } from '@/i18n/middleware';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { useTranslation } from 'react-i18next';
import {
  clinicQueueApi,
  type ClinicQueueItem,
  type ClinicFlowState,
  type AvailableDoctor,
} from '../api/queue.api';
import { formatShortDate } from '@/lib/date-utils';

type QueueTab = 'all' | ClinicFlowState;

const FLOW_STATE_CONFIG: Record<
  ClinicFlowState,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof Clock;
  }
> = {
  CheckedIn: {
    label: 'Checked In',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Users,
  },
  ScreeningPending: {
    label: 'Screening Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  AICompleted: {
    label: 'AI Completed',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: Sparkles,
  },
  SentToDoctor: {
    label: 'Sent to Doctor',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    icon: Stethoscope,
  },
  ConsultationInProgress: {
    label: 'In Consultation',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: Activity,
  },
  Finalized: {
    label: 'Finalized',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle,
  },
};

// ── Custom Doctor Select Component ──────────────────────────────────────────
function DoctorSelect({
  doctors,
  value,
  onChange,
  placeholder,
}: {
  doctors: AvailableDoctor[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDoctor = doctors.find((d) => d.id === value);
  const selectedDoctorName =
    selectedDoctor?.fullName?.trim() || placeholder || 'Select a doctor';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-(--border-primary) bg-white px-4 py-2.5 text-sm text-(--text-primary) shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800"
      >
        <span
          className={
            selectedDoctor?.fullName?.trim()
              ? 'text-(--text-primary)'
              : 'text-(--text-tertiary)'
          }
        >
          {selectedDoctorName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-(--text-tertiary) transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border border-(--border-primary) bg-white p-1 shadow-xl dark:bg-slate-800"
            >
              {doctors.map((doctor, index) => {
                const doctorName =
                  doctor.fullName?.trim() || `Doctor #${index + 1}`;

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      onChange(doctor.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      value === doctor.id
                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                        : 'text-(--text-primary) hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{doctorName}</span>
                      {doctor.yearsOfExperience > 0 && (
                        <span className="text-[10px] opacity-70">
                          {doctor.yearsOfExperience} years exp
                        </span>
                      )}
                    </div>
                    {value === doctor.id && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClinicStaffQueuePage() {
  const navigate = useNavigate();
  const { t: i18nT } = useTranslation();
  const t = (key: string, defaultValue?: string) =>
    i18nT(key as never, { defaultValue } as never) as unknown as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<QueueTab>('all');
  const [sendModalItem, setSendModalItem] = useState<ClinicQueueItem | null>(
    null
  );
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>(
    []
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [sendDoctorNotes, setSendDoctorNotes] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const queueQuery = useQuery({
    queryKey: ['clinic-staff', 'queue'],
    queryFn: clinicQueueApi.getQueue,
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
    staleTime: 10_000,
  });

  const queue = queueQuery.data ?? [];
  const sendToDoctorMutation = useMutation({
    mutationFn: (payload: {
      visitId: string;
      screeningId: string;
      doctorId?: string;
      notes?: string;
    }) =>
      clinicQueueApi.sendToDoctor(payload.visitId, {
        screeningId: payload.screeningId,
        doctorId: payload.doctorId,
        notes: payload.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-staff', 'queue'] });
      setSendModalItem(null);
      setSendDoctorNotes('');
      setSelectedDoctorId('');
      toast.success(
        t(
          'ClinicStaff.queue.toast.sentToDoctorSuccess',
          'Case sent to doctor successfully.'
        )
      );
    },
    onError: () => {
      toast.error(
        t(
          'ClinicStaff.queue.toast.sentToDoctorFailed',
          'Unable to send this case to doctor.'
        )
      );
    },
  });

  const filteredQueue = useMemo(() => {
    if (activeTab === 'all') return queue;
    return queue.filter((item) => item.flowState === activeTab);
  }, [queue, activeTab]);

  const stats = useMemo(() => {
    const counts: Record<ClinicFlowState, number> = {
      CheckedIn: 0,
      ScreeningPending: 0,
      AICompleted: 0,
      SentToDoctor: 0,
      ConsultationInProgress: 0,
      Finalized: 0,
    };
    queue.forEach((item) => {
      counts[item.flowState]++;
    });
    return counts;
  }, [queue]);

  const handleViewScreening = (item: ClinicQueueItem) => {
    if (item.screeningId) {
      navigate(
        resolvePathWithLocale(
          `/clinic-staff/screenings/result?id=${item.screeningId}`
        )
      );
    }
  };

  const handleCreateScreening = (item: ClinicQueueItem) => {
    navigate(
      resolvePathWithLocale(
        `/clinic-staff/screenings/new?patientId=${item.patientId}`
      )
    );
  };

  const handleSendToDoctor = async (item: ClinicQueueItem) => {
    if (!item.screeningId) {
      toast.error(
        t(
          'ClinicStaff.queue.toast.screeningRequired',
          'Please complete AI screening before sending to doctor.'
        )
      );
      return;
    }

    setSendModalItem(item);
    setSendDoctorNotes('');
    setSelectedDoctorId('');
    setLoadingDoctors(true);

    try {
      const doctors = await clinicQueueApi.getAvailableDoctors();
      setAvailableDoctors(doctors);
      if (doctors.length > 0) {
        setSelectedDoctorId(doctors[0].id);
      }
    } catch {
      setAvailableDoctors([]);
      toast.error(
        t(
          'ClinicStaff.queue.toast.loadDoctorsFailed',
          'Unable to load available doctors.'
        )
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleConfirmSendToDoctor = () => {
    if (!sendModalItem?.screeningId || !selectedDoctorId) return;

    sendToDoctorMutation.mutate({
      visitId: sendModalItem.visitId,
      screeningId: sendModalItem.screeningId,
      doctorId: selectedDoctorId,
      notes: sendDoctorNotes.trim() || undefined,
    });
  };

  const handleCopyDoctorConsultationLink = async (item: ClinicQueueItem) => {
    if (!item.consultationSessionId) return;
    const path = resolvePathWithLocale(
      `/ophthalmologist/consultations?patientId=${encodeURIComponent(item.patientId)}&sessionId=${encodeURIComponent(item.consultationSessionId)}`
    );
    const fullUrl = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(
        t(
          'ClinicStaff.queue.toast.copyDoctorConsultationLinkSuccess',
          'Doctor consultation link copied.'
        )
      );
    } catch {
      toast.error(
        t(
          'ClinicStaff.queue.toast.copyDoctorConsultationLinkFailed',
          'Failed to copy doctor consultation link.'
        )
      );
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    const r = riskLevel.toLowerCase();
    if (r === 'high')
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (r === 'moderate' || r === 'medium')
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  };

  if (queueQuery.isLoading) {
    return (
      <ClinicStaffLayout>
        <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
          <Spinner size={36} />
        </div>
      </ClinicStaffLayout>
    );
  }

  if (queueQuery.isError) {
    return (
      <ClinicStaffLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-(--text-primary) font-semibold mb-2">
            {t('ClinicStaff.queue.error.title', 'Failed to load queue')}
          </p>
          <p className="text-(--text-secondary) text-sm mb-4">
            {t(
              'ClinicStaff.queue.error.message',
              'Unable to fetch clinic queue. Please try again.'
            )}
          </p>
          <button
            type="button"
            onClick={() => queueQuery.refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            {t('ClinicStaff.queue.actions.retry', 'Retry')}
          </button>
        </div>
      </ClinicStaffLayout>
    );
  }

  return (
    <ClinicStaffLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              {t('ClinicStaff.queue.page.title', 'Clinic Queue')}
            </h1>
            <p className="text-(--text-secondary) text-sm">
              {t(
                'ClinicStaff.queue.page.subtitle',
                'Monitor patient flow and coordinate care'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => queueQuery.refetch()}
            disabled={queueQuery.isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-(--border-primary) bg-(--bg-primary) text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-50 transition shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${queueQuery.isFetching ? 'animate-spin' : ''}`}
            />
            {t('ClinicStaff.queue.actions.refresh', 'Refresh')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {(Object.keys(FLOW_STATE_CONFIG) as ClinicFlowState[]).map(
            (state) => {
              const config = FLOW_STATE_CONFIG[state];
              const Icon = config.icon;
              return (
                <div
                  key={state}
                  className="medical-card p-4 cursor-pointer hover:shadow-md transition"
                  onClick={() => setActiveTab(state)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-(--text-primary)">
                        {stats[state]}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {config.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-tertiary)'
            }`}
          >
            {t('ClinicStaff.queue.tabs.all', 'All')} ({queue.length})
          </button>
          {(Object.keys(FLOW_STATE_CONFIG) as ClinicFlowState[]).map(
            (state) => {
              const config = FLOW_STATE_CONFIG[state];
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => setActiveTab(state)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                    activeTab === state
                      ? 'bg-primary text-white'
                      : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-tertiary)'
                  }`}
                >
                  {config.label} ({stats[state]})
                </button>
              );
            }
          )}
        </div>

        {/* Queue List */}
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden flex-1">
          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-(--text-muted) mb-4" />
              <p className="text-(--text-secondary) font-semibold mb-1">
                {t('ClinicStaff.queue.empty.title', 'No patients in queue')}
              </p>
              <p className="text-(--text-muted) text-sm">
                {t(
                  'ClinicStaff.queue.empty.message',
                  'Patients will appear here as they check in'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border-primary)">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.patient', 'Patient')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.checkedIn', 'Checked In')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.status', 'Status')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.screening', 'Screening')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.doctor', 'Doctor')}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {t('ClinicStaff.queue.table.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-primary)">
                  {filteredQueue.map((item) => {
                    const config = FLOW_STATE_CONFIG[item.flowState];
                    const Icon = config.icon;
                    return (
                      <tr
                        key={item.visitId}
                        className="hover:bg-(--bg-tertiary) transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-(--text-primary)">
                            {item.patientName}
                          </div>
                          <div className="text-xs text-(--text-tertiary)">
                            ID: {item.patientId.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-(--text-secondary)">
                            {formatShortDate(item.checkedInAt)}
                          </div>
                          <div className="text-xs text-(--text-tertiary)">
                            {new Date(item.checkedInAt).toLocaleTimeString(
                              'en-US',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.screeningId ? (
                            <div>
                              <div className="text-sm text-(--text-secondary)">
                                {item.screeningStatus === 'completed'
                                  ? 'Completed'
                                  : 'Pending'}
                              </div>
                              {item.screeningRiskLevel && (
                                <span
                                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${getRiskBadge(item.screeningRiskLevel)}`}
                                >
                                  {item.screeningRiskLevel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-(--text-muted)">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.assignedDoctorName ? (
                            <div className="text-sm text-(--text-secondary)">
                              {item.assignedDoctorName}
                            </div>
                          ) : (
                            <span className="text-sm text-(--text-muted)">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.flowState === 'CheckedIn' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate('/erm-patient', {
                                    state: {
                                      formData: {
                                        patientId: item.patientId,
                                        fullName: item.patientName,
                                        maYT: item.visitId
                                          .substring(0, 8)
                                          .toUpperCase(),
                                        gender: item.patientGender,
                                        age: item.patientAge?.toString() || '',
                                        citizenId: item.citizenId,
                                      },
                                    },
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {t(
                                  'ClinicStaff.queue.actions.fillErm',
                                  'Fill ERM'
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCreateScreening(item)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                {t(
                                  'ClinicStaff.queue.actions.createScreening',
                                  'Create Screening'
                                )}
                              </button>
                            </div>
                          )}
                          {(item.flowState === 'ScreeningPending' ||
                            item.flowState === 'AICompleted') && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewScreening(item)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t(
                                  'ClinicStaff.queue.actions.viewScreening',
                                  'View Screening'
                                )}
                              </button>
                              {item.flowState === 'AICompleted' && (
                                <button
                                  type="button"
                                  disabled={sendToDoctorMutation.isPending}
                                  onClick={() => void handleSendToDoctor(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                  {sendToDoctorMutation.isPending
                                    ? t(
                                        'ClinicStaff.queue.actions.sending',
                                        'Sending...'
                                      )
                                    : t(
                                        'ClinicStaff.queue.actions.sendToDoctor',
                                        'Send to Doctor'
                                      )}
                                </button>
                              )}
                            </div>
                          )}
                          {item.flowState === 'SentToDoctor' && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-(--text-muted) italic">
                                {t(
                                  'ClinicStaff.queue.states.awaitingDoctor',
                                  'Awaiting doctor'
                                )}
                              </span>
                              {item.consultationSessionId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleCopyDoctorConsultationLink(item)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
                                >
                                  {t(
                                    'ClinicStaff.queue.actions.copyDoctorLink',
                                    'Copy Doctor Link'
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                          {item.flowState === 'ConsultationInProgress' && (
                            <span className="text-xs text-(--text-muted) italic">
                              {t(
                                'ClinicStaff.queue.states.inConsultation',
                                'In consultation'
                              )}
                            </span>
                          )}
                          {item.flowState === 'Finalized' && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                                <CheckCircle className="h-3.5 w-3.5" />
                                {t(
                                  'ClinicStaff.queue.states.completed',
                                  'Done'
                                )}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {sendModalItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-xl rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-(--text-primary)">
                    {t(
                      'ClinicStaff.queue.sendDoctorModal.title',
                      'Send Case to Doctor'
                    )}
                  </h3>
                  <p className="mt-1 truncate text-sm text-(--text-secondary)">
                    {sendModalItem.patientName}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t('ClinicStaff.common.close', 'Close')}
                  onClick={() => {
                    if (!sendToDoctorMutation.isPending) setSendModalItem(null);
                  }}
                  className="rounded-lg p-2 text-(--text-tertiary) transition hover:bg-(--bg-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="queue-send-doctor-select"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)"
                  >
                    {t(
                      'ClinicStaff.queue.sendDoctorModal.doctorLabel',
                      'Available Doctor'
                    )}
                  </label>
                  {loadingDoctors ? (
                    <div className="flex items-center gap-2 rounded-xl border border-(--border-primary) bg-(--bg-primary) px-3 py-3 text-sm text-(--text-secondary)">
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      {t(
                        'ClinicStaff.queue.sendDoctorModal.loadingDoctors',
                        'Loading doctors…'
                      )}
                    </div>
                  ) : availableDoctors.length > 0 ? (
                    <DoctorSelect
                      doctors={availableDoctors}
                      value={selectedDoctorId}
                      onChange={setSelectedDoctorId}
                      placeholder={t(
                        'ClinicStaff.queue.sendDoctorModal.selectDoctor',
                        'Select an available doctor'
                      )}
                    />
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                      {t(
                        'ClinicStaff.queue.sendDoctorModal.noDoctors',
                        'No available ophthalmologists were found.'
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="queue-send-doctor-notes"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)"
                  >
                    {t(
                      'ClinicStaff.queue.sendDoctorModal.notesLabel',
                      'Coordinator Notes'
                    )}
                  </label>
                  <textarea
                    id="queue-send-doctor-notes"
                    name="notes"
                    rows={4}
                    value={sendDoctorNotes}
                    onChange={(event) => setSendDoctorNotes(event.target.value)}
                    placeholder={t(
                      'ClinicStaff.queue.sendDoctorModal.notesPlaceholder',
                      'Add symptoms, visit context, or handoff notes…'
                    )}
                    className="w-full resize-none rounded-xl border border-(--border-primary) bg-(--bg-primary) px-3 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!sendToDoctorMutation.isPending) setSendModalItem(null);
                  }}
                  disabled={sendToDoctorMutation.isPending}
                  className="rounded-xl border border-(--border-primary) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  {t('ClinicStaff.common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendToDoctor}
                  disabled={
                    sendToDoctorMutation.isPending ||
                    loadingDoctors ||
                    availableDoctors.length === 0 ||
                    !selectedDoctorId
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  {sendToDoctorMutation.isPending ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  )}
                  {sendToDoctorMutation.isPending
                    ? t('ClinicStaff.queue.actions.sending', 'Sending…')
                    : t(
                        'ClinicStaff.queue.sendDoctorModal.confirm',
                        'Confirm Assignment'
                      )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicStaffLayout>
  );
}
