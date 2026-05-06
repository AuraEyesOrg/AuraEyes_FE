import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  XCircle,
  Plus,
  Pencil,
  History,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { resolvePathWithLocale } from '@/i18n/middleware';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import AvatarFallback from '@/components/ui/avatar-fallback';
import { useTranslation } from 'react-i18next';
import { getClinicPatients, type ClinicPatientDto } from '../api/patients.api';
import { clinicQueueApi, type ClinicQueueItem } from '../api/queue.api';
import { formatAppointmentSlot } from '@/lib/date-utils';
import CreateWalkInPatientModal from '../components/CreateWalkInPatientModal';
import UpdatePatientContactModal from '../components/UpdatePatientContactModal';

function normalize(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function getRiskBadge(priority: string) {
  const p = normalize(priority);
  if (p === 'high')
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (p === 'medium')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
}

function getPatientTypeBadge(isWalkIn: boolean) {
  return isWalkIn
    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
}

type ActionMenuPosition = { top: number; left: number };

export default function ClinicStaffPatientsPage() {
  const navigate = useNavigate();
  const { t: i18nT } = useTranslation();
  const t = (
    key: string,
    defaultValueOrOptions?: string | any,
    options?: any
  ) => {
    if (typeof defaultValueOrOptions === 'object') {
      return i18nT(
        key as never,
        defaultValueOrOptions as never
      ) as unknown as string;
    }
    return i18nT(
      key as never,
      { defaultValue: defaultValueOrOptions, ...options } as never
    ) as unknown as string;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<ClinicPatientDto | null>(
    null
  );
  const [openActionMenuPatientId, setOpenActionMenuPatientId] = useState<
    string | null
  >(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const actionMenuTriggerRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const [actionMenuPosition, setActionMenuPosition] =
    useState<ActionMenuPosition | null>(null);

  const [visitPickerOpen, setVisitPickerOpen] = useState(false);
  const [visitPickerPatientId, setVisitPickerPatientId] = useState<
    string | null
  >(null);
  const [visitPickerItems, setVisitPickerItems] = useState<ClinicQueueItem[]>(
    []
  );
  const [screenVisitLoadingFor, setScreenVisitLoadingFor] = useState<
    string | null
  >(null);

  const patientsQuery = useQuery({
    queryKey: ['clinic-staff', 'patients'],
    queryFn: getClinicPatients,
    staleTime: 30_000,
  });

  const patients = patientsQuery.data ?? [];

  const filteredPatients = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return patients;
    return patients.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        (p.phoneNumber && normalize(p.phoneNumber).includes(q)) ||
        (p.citizenId && normalize(p.citizenId).includes(q))
    );
  }, [patients, searchTerm]);

  const clearDisabled = searchTerm.trim() === '';

  useEffect(() => {
    if (patientsQuery.isError) {
      toast.error(
        t('ClinicStaff.patients.toast.loadFailed', 'Unable to load patients.')
      );
    }
  }, [patientsQuery.isError, t]);

  // Action-menu positioning
  useEffect(() => {
    if (!openActionMenuPatientId) {
      setActionMenuPosition(null);
      return;
    }

    const updatePos = () => {
      const triggerEl = actionMenuTriggerRefs.current[openActionMenuPatientId];
      if (!triggerEl) {
        setActionMenuPosition(null);
        return;
      }

      const rect = triggerEl.getBoundingClientRect();
      const menuH = actionMenuRef.current?.offsetHeight ?? 104;
      const menuW = actionMenuRef.current?.offsetWidth ?? 176;
      const vpH = window.innerHeight;
      const vpW = window.innerWidth;

      const preferTop = rect.bottom + 8;
      const flippedTop = rect.top - 8 - menuH;
      const shouldFlip = preferTop + menuH > vpH - 12;
      const rawTop = shouldFlip ? flippedTop : preferTop;
      const top = Math.min(
        Math.max(rawTop, 12),
        Math.max(12, vpH - 12 - menuH)
      );

      const preferRight = rect.right;
      const maxRight = vpW - 12;
      const minRight = Math.min(12 + menuW, maxRight);
      const left = Math.min(Math.max(preferRight, minRight), maxRight);

      setActionMenuPosition({ top, left });
    };

    updatePos();
    const rafId = window.requestAnimationFrame(updatePos);
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [openActionMenuPatientId]);

  // Close action menu on outside click or Escape
  useEffect(() => {
    if (!openActionMenuPatientId) return;
    const activeTrigger =
      actionMenuTriggerRefs.current[openActionMenuPatientId];

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (actionMenuRef.current?.contains(target)) return;
      if (activeTrigger?.contains(target)) return;
      setOpenActionMenuPatientId(null);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenActionMenuPatientId(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openActionMenuPatientId]);

  if (patientsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  if (patientsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <div className="font-medium mb-3">
            {t(
              'ClinicStaff.patients.states.loadFailed',
              'Unable to load patients'
            )}
          </div>
          <button
            type="button"
            onClick={() => patientsQuery.refetch()}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {t('ClinicStaff.patients.actions.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const handleScreenPatient = async (patientId: string) => {
    setScreenVisitLoadingFor(patientId);
    try {
      const queue = await clinicQueueApi.getQueue();
      const items = queue.filter((i) => i.patientId === patientId);
      if (items.length === 0) {
        toast.error(
          t(
            'ClinicStaff.patients.toast.noActiveVisit',
            'No active check-in for this patient. Check them in from the queue first.'
          )
        );
        return;
      }
      if (items.length === 1) {
        navigate(
          resolvePathWithLocale(
            `/clinic-staff/screenings/new?patientId=${encodeURIComponent(patientId)}&visitId=${encodeURIComponent(items[0].visitId)}`
          )
        );
        return;
      }
      setVisitPickerPatientId(patientId);
      setVisitPickerItems(items);
      setVisitPickerOpen(true);
    } catch {
      toast.error(
        t(
          'ClinicStaff.patients.toast.queueLoadFailed',
          'Could not load the clinic queue. Try again.'
        )
      );
    } finally {
      setScreenVisitLoadingFor(null);
    }
  };

  const closeVisitPicker = () => {
    setVisitPickerOpen(false);
    setVisitPickerPatientId(null);
    setVisitPickerItems([]);
  };

  const confirmVisitForScreening = (visitId: string) => {
    if (!visitPickerPatientId) return;
    navigate(
      resolvePathWithLocale(
        `/clinic-staff/screenings/new?patientId=${encodeURIComponent(visitPickerPatientId)}&visitId=${encodeURIComponent(visitId)}`
      )
    );
    closeVisitPicker();
  };

  const handleViewPatientHistory = (patientId: string) => {
    navigate(
      resolvePathWithLocale(`/clinic-staff/patients/${patientId}/history`)
    );
  };

  const handleOpenEditContact = (patient: ClinicPatientDto) => {
    setEditingPatient(patient);
    setOpenActionMenuPatientId(null);
  };

  const handleOpenPatientHistory = (patientId: string) => {
    handleViewPatientHistory(patientId);
    setOpenActionMenuPatientId(null);
  };

  return (
    <ClinicStaffLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">
              {t('ClinicStaff.patients.header.title', 'Patients')}
            </h1>
            <p className="text-sm text-(--text-secondary)">
              {t(
                'ClinicStaff.patients.header.subtitle',
                "Manage your clinic's patient records and screenings"
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWalkInModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('ClinicStaff.patients.actions.walkInPatient', 'Walk-in Patient')}
          </button>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-tertiary)"
              />
              <input
                type="text"
                placeholder={t(
                  'ClinicStaff.patients.search.placeholder',
                  'Search by name, phone number, or CCCD...'
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-xl pl-11 pr-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              disabled={clearDisabled}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-(--border-primary) bg-(--bg-primary) text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <XCircle size={16} />
              {t('ClinicStaff.patients.actions.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Results summary */}
        <p className="text-sm text-(--text-tertiary) mb-3 px-1">
          {t(
            'ClinicStaff.patients.summary.countFound',
            '{{count}} {{unit}} found',
            {
              count: filteredPatients.length,
              unit:
                filteredPatients.length !== 1
                  ? t('ClinicStaff.patients.summary.patients', 'patients')
                  : t('ClinicStaff.patients.summary.patient', 'patient'),
            }
          )}
        </p>

        {/* Patient Table */}
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--border-primary)">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.patients.table.patient', 'Patient')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t(
                      'ClinicStaff.patients.table.lastScreening',
                      'Last Screening'
                    )}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.patients.table.type', 'Type')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.patients.table.risk', 'Risk')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                    {t('ClinicStaff.patients.table.action', 'Action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-(--text-tertiary)"
                    >
                      {t(
                        'ClinicStaff.patients.states.noMatch',
                        'No patients match your search.'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient: ClinicPatientDto) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-(--bg-tertiary) transition-colors"
                    >
                      {/* Patient info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarFallback
                            fullName={patient.name}
                            avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(patient.id.slice(0, 8))}`}
                            size="w-10 h-10"
                          />
                          <div>
                            <div className="text-sm font-semibold text-(--text-primary)">
                              {patient.name}
                            </div>
                            <div className="text-xs text-(--text-tertiary)">
                              {patient.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Last Screening */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-(--text-secondary)">
                          {patient.lastScreening
                            ? new Date(
                                patient.lastScreening
                              ).toLocaleDateString('vi-VN')
                            : '—'}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getPatientTypeBadge(patient.isWalkIn)}`}
                        >
                          {patient.isWalkIn
                            ? t('ClinicStaff.patients.types.walkIn', 'Walk-in')
                            : t(
                                'ClinicStaff.patients.types.auraPartner',
                                'Aura Partner'
                              )}
                        </span>
                      </td>

                      {/* Risk badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskBadge(patient.priority)}`}
                        >
                          {t(
                            `ClinicStaff.patients.risk.${patient.priority || 'low'}`,
                            patient.priority || 'low'
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            ref={(el) => {
                              actionMenuTriggerRefs.current[patient.id] = el;
                            }}
                            type="button"
                            onClick={() =>
                              setOpenActionMenuPatientId((cur) =>
                                cur === patient.id ? null : patient.id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-(--border-primary) bg-(--bg-tertiary) p-1.5 text-(--text-secondary) transition hover:bg-(--bg-primary)"
                            aria-label={`${t('ClinicStaff.patients.actions.moreFor', 'More actions for')} ${patient.name}`}
                            aria-haspopup="menu"
                            aria-expanded={
                              openActionMenuPatientId === patient.id
                            }
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>

                          {openActionMenuPatientId === patient.id &&
                            actionMenuPosition &&
                            createPortal(
                              <div
                                ref={actionMenuRef}
                                role="menu"
                                className="fixed z-30 w-44 rounded-xl border border-(--border-primary) bg-(--bg-primary) p-1.5 shadow-lg"
                                style={{
                                  top: actionMenuPosition.top,
                                  left: actionMenuPosition.left,
                                  transform: 'translateX(-100%)',
                                }}
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    handleOpenPatientHistory(patient.id)
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-(--text-secondary) transition hover:bg-(--bg-tertiary)"
                                >
                                  <History className="h-3.5 w-3.5" />
                                  {t(
                                    'ClinicStaff.patients.actions.viewHistory',
                                    'View History'
                                  )}
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleOpenEditContact(patient)}
                                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-(--text-secondary) transition hover:bg-(--bg-tertiary)"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {t(
                                    'ClinicStaff.patients.actions.editContact',
                                    'Edit Contact'
                                  )}
                                </button>
                              </div>,
                              document.body
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {visitPickerOpen &&
          visitPickerPatientId &&
          createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="visit-picker-title"
            >
              <div className="w-full max-w-md rounded-2xl border border-(--border-primary) bg-(--bg-primary) p-6 shadow-xl">
                <h2
                  id="visit-picker-title"
                  className="text-lg font-semibold text-(--text-primary)"
                >
                  {t(
                    'ClinicStaff.patients.visitPicker.title',
                    'Choose a check-in'
                  )}
                </h2>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  {t(
                    'ClinicStaff.patients.visitPicker.subtitle',
                    'This patient has more than one active visit. Pick the one you are screening for.'
                  )}
                </p>
                <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                  {visitPickerItems.map((item) => (
                    <li key={item.visitId}>
                      <button
                        type="button"
                        onClick={() => confirmVisitForScreening(item.visitId)}
                        className="flex w-full flex-col rounded-xl border border-(--border-primary) bg-(--bg-secondary) px-4 py-3 text-left text-sm transition hover:bg-(--bg-tertiary)"
                      >
                        <span className="font-medium text-(--text-primary)">
                          {formatAppointmentSlot(item.checkedInAt)}
                        </span>
                        <span className="text-xs text-(--text-tertiary)">
                          {item.flowState} · {item.visitId.slice(0, 8)}…
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={closeVisitPicker}
                  className="mt-4 w-full rounded-xl border border-(--border-primary) py-2.5 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-tertiary)"
                >
                  {t('ClinicStaff.patients.visitPicker.cancel', 'Cancel')}
                </button>
              </div>
            </div>,
            document.body
          )}

        {/* Modals */}
        <CreateWalkInPatientModal
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          onSuccess={() => {
            setIsWalkInModalOpen(false);
            patientsQuery.refetch();
          }}
        />

        <UpdatePatientContactModal
          isOpen={editingPatient !== null}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={() => {
            setEditingPatient(null);
            patientsQuery.refetch();
          }}
        />
      </div>
    </ClinicStaffLayout>
  );
}
