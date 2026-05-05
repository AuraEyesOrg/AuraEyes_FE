import { useState, useEffect, useMemo } from 'react';
import {
  X,
  CalendarDays,
  Users,
  User,
  Stethoscope,
  Loader2,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw,
  Ticket,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { mapClinicStaffErrorMessage } from '@/lib/api-error';
import { formatSlotTime } from '@/lib/date-utils';
import {
  useCheckLateArrival,
  useAvailableDoctorsForSlot,
  useRebookToExistingSlot,
  useRebookToAdHocSlot,
  useCancelLateAndGrantDiscount,
} from '../hooks/use-late-patient';
import type { AvailableDoctorDto } from '../api/late-patient.api';

interface AggregatedAvailableSlot {
  key: string;
  startTime: string;
  endTime: string;
  totalRemaining: number;
  slotIds: string[];
  cost: number | null;
}

interface LatePatientModalProps {
  isOpen: boolean;
  appointmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LatePatientModal({
  isOpen,
  appointmentId,
  onClose,
  onSuccess,
}: LatePatientModalProps) {
  const { t } = useSafeTranslation();
  const [activeTab, setActiveTab] = useState<'existing' | 'adhoc' | 'cancel'>(
    'existing'
  );
  const [expandedSlot, setExpandedSlot] =
    useState<AggregatedAvailableSlot | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [adHocForm, setAdHocForm] = useState({
    startTime: '',
    endTime: '',
    doctorId: '',
  });

  const {
    data: lateCheck,
    isLoading: isChecking,
    isError: isCheckError,
  } = useCheckLateArrival(appointmentId, isOpen);

  // Fetch doctors for expanded slot (existing tab)
  const { data: slotDoctors, isLoading: isLoadingSlotDoctors } =
    useAvailableDoctorsForSlot(
      lateCheck?.slotDate ?? '',
      expandedSlot?.startTime ?? '',
      expandedSlot?.endTime ?? '',
      activeTab === 'existing' && !!expandedSlot && !!lateCheck?.slotDate
    );

  // Fetch doctors for adhoc tab
  const { data: availableDoctors, isLoading: isLoadingDoctors } =
    useAvailableDoctorsForSlot(
      lateCheck?.slotDate ?? '',
      (adHocForm.startTime || lateCheck?.adHocDefaults?.suggestedStartTime) ??
        '',
      adHocForm.endTime || '',
      activeTab === 'adhoc' && !!lateCheck?.slotDate && !!adHocForm.endTime
    );

  const rebookExisting = useRebookToExistingSlot();
  const rebookAdHoc = useRebookToAdHocSlot();
  const cancelLate = useCancelLateAndGrantDiscount();

  const aggregatedSlots = useMemo(() => {
    if (!lateCheck?.availableSlots?.length) return [];
    const map = new Map<string, AggregatedAvailableSlot>();
    for (const slot of lateCheck.availableSlots) {
      const key = `${slot.startTime}-${slot.endTime}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalRemaining += slot.remainingCapacity;
        existing.slotIds.push(slot.slotId);
      } else {
        map.set(key, {
          key,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalRemaining: slot.remainingCapacity,
          slotIds: [slot.slotId],
          cost: slot.cost,
        });
      }
    }
    return Array.from(map.values());
  }, [lateCheck?.availableSlots]);

  useEffect(() => {
    if (isOpen && lateCheck) {
      setActiveTab('existing');
      setSelectedSlotId('');
      setSelectedDoctorId(null);
      setExpandedSlot(null);
      setAdHocForm({
        startTime: lateCheck.adHocDefaults?.suggestedStartTime ?? '',
        endTime: '',
        doctorId: '',
      });
    }
  }, [isOpen, lateCheck]);

  if (!isOpen) return null;

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
        <div className="bg-(--bg-primary) w-full max-w-lg rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-(--text-secondary)">
            {t(
              'Organisation.latePatientModal.checking',
              'Checking appointment status...'
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isCheckError || !lateCheck?.isLate) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
        <div className="bg-(--bg-primary) w-full max-w-lg rounded-2xl shadow-xl p-6">
          <p className="text-sm text-(--text-secondary)">
            {isCheckError
              ? t(
                  'Organisation.latePatientModal.checkError',
                  'Không thể kiểm tra trạng thái. Vui lòng thử lại.'
                )
              : t(
                  'Organisation.latePatientModal.notLate',
                  'Bệnh nhân chưa đến muộn hoặc lịch hẹn chưa đến giờ.'
                )}
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-(--bg-secondary) hover:bg-(--bg-tertiary)"
            >
              {t('Organisation.common.close', 'Close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRebookExisting = async () => {
    if (!selectedSlotId) {
      toast.error(
        t(
          'Organisation.latePatientModal.error.selectSlot',
          'Please select a slot'
        )
      );
      return;
    }
    try {
      await rebookExisting.mutateAsync({
        appointmentId,
        payload: { slotId: selectedSlotId },
      });
      toast.success(
        t(
          'Organisation.latePatientModal.success.rebooked',
          'Rebooked to new slot successfully'
        )
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  const handleCancelAndDiscount = async () => {
    try {
      const result = await cancelLate.mutateAsync(appointmentId);
      toast.success(
        t(
          'Organisation.latePatientModal.success.cancelledWithDiscount',
          'Appointment cancelled. Patient received {{rate}}% discount for next booking.',
          { rate: Math.round(result.discountRate * 100) }
        )
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  const handleRebookAdHoc = async () => {
    if (!adHocForm.startTime || !adHocForm.endTime) {
      toast.error(
        t(
          'Organisation.latePatientModal.error.timesRequired',
          'Start and end times are required'
        )
      );
      return;
    }
    try {
      await rebookAdHoc.mutateAsync({
        appointmentId,
        payload: {
          date: lateCheck.slotDate,
          startTime: adHocForm.startTime,
          endTime: adHocForm.endTime,
          maxCapacity: 1,
          cost: null,
          doctorId: adHocForm.doctorId || null,
        },
      });
      toast.success(
        t(
          'Organisation.latePatientModal.success.adHocCreated',
          'Ad-hoc slot created and patient rebooked'
        )
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(mapClinicStaffErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-(--bg-primary) w-full max-w-xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-(--border-primary) sticky top-0 bg-(--bg-primary) z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--text-primary)">
                {t(
                  'Organisation.latePatientModal.header.title',
                  'Patient Arrived Late'
                )}
              </h2>
              <p className="text-xs text-(--text-tertiary)">
                {t(
                  'Organisation.latePatientModal.header.subtitle',
                  'Arrived {{minutes}} min past the {{threshold}} min threshold',
                  {
                    minutes: lateCheck.lateMinutes,
                    threshold: lateCheck.thresholdMinutes,
                  }
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-2 p-1 bg-(--bg-secondary) rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'existing'
                  ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              {t(
                'Organisation.latePatientModal.tabs.existing',
                'Book Another Slot'
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adhoc')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'adhoc'
                  ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t(
                'Organisation.latePatientModal.tabs.adhoc',
                'Create Ad-hoc Slot'
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cancel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'cancel'
                  ? 'bg-(--bg-primary) text-(--text-primary) shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Ticket className="w-4 h-4" />
              {t(
                'Organisation.latePatientModal.tabs.cancel',
                'Cancel & Discount'
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'cancel' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {t(
                        'Organisation.latePatientModal.cancel.title',
                        'Cancel this appointment'
                      )}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t(
                        'Organisation.latePatientModal.cancel.description',
                        'The current appointment will be cancelled and the slot released.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      {t(
                        'Organisation.latePatientModal.cancel.discountTitle',
                        'Patient receives 10% discount'
                      )}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {t(
                        'Organisation.latePatientModal.cancel.discountDescription',
                        'A 10% discount will be applied automatically when the patient books their next appointment online. Valid for 30 days.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={cancelLate.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-tertiary)"
                >
                  {t('Organisation.common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleCancelAndDiscount}
                  disabled={cancelLate.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {cancelLate.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {t(
                    'Organisation.latePatientModal.actions.cancelAndDiscount',
                    'Cancel & Grant Discount'
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'existing' ? (
            <div className="space-y-3">
              <p className="text-sm text-(--text-secondary)">
                {t(
                  'Organisation.latePatientModal.existing.description',
                  'Select an available slot, then choose a doctor.'
                )}
              </p>

              {aggregatedSlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-(--border-primary) p-6 text-center">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 text-(--text-muted)" />
                  <p className="text-sm text-(--text-muted)">
                    {t(
                      'Organisation.latePatientModal.existing.noSlots',
                      'No available slots on this day.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {/* Slot list */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {aggregatedSlots.map((agg) => {
                      const isExpanded = expandedSlot?.key === agg.key;
                      return (
                        <button
                          key={agg.key}
                          type="button"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedSlot(null);
                              setSelectedSlotId('');
                              setSelectedDoctorId(null);
                            } else {
                              setExpandedSlot(agg);
                              setSelectedSlotId('');
                              setSelectedDoctorId(null);
                            }
                          }}
                          className={`relative p-3 rounded-xl border text-center transition-all duration-200 flex flex-col gap-1 ${
                            isExpanded
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                              : 'border-(--border-primary) bg-(--bg-secondary) hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          <span
                            className={`text-sm font-bold tracking-tight ${
                              isExpanded
                                ? 'text-white'
                                : 'text-(--text-primary)'
                            }`}
                          >
                            {formatSlotTime(agg.startTime)}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              isExpanded
                                ? 'text-white/70'
                                : 'text-(--text-muted)'
                            }`}
                          >
                            {formatSlotTime(agg.endTime)}
                          </span>
                          <div
                            className={`flex items-center justify-center gap-1 text-[10px] font-bold ${
                              isExpanded
                                ? 'text-white/80'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            {agg.totalRemaining}
                          </div>
                          {isExpanded && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-primary rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Doctor list for expanded slot */}
                  {expandedSlot && (
                    <div className="mt-4 pt-4 border-t border-(--border-primary) space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-primary" />
                          {t(
                            'Organisation.latePatientModal.existing.selectDoctor',
                            'Select Doctor'
                          )}
                        </h4>
                        <span className="text-xs text-(--text-muted)">
                          {formatSlotTime(expandedSlot.startTime)} –{' '}
                          {formatSlotTime(expandedSlot.endTime)}
                          {expandedSlot.slotIds.length > 1 && (
                            <span className="ml-1 text-[10px] bg-(--bg-tertiary) px-1.5 py-0.5 rounded-full">
                              {expandedSlot.slotIds.length} slots
                            </span>
                          )}
                        </span>
                      </div>

                      {isLoadingSlotDoctors ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="ml-2 text-xs text-(--text-muted)">
                            {t(
                              'Organisation.latePatientModal.existing.loadingDoctors',
                              'Loading doctors...'
                            )}
                          </span>
                        </div>
                      ) : !slotDoctors?.length ? (
                        <div className="rounded-xl border border-dashed border-(--border-primary) p-4 text-center">
                          <p className="text-xs text-(--text-muted)">
                            {t(
                              'Organisation.latePatientModal.existing.noDoctors',
                              'No doctors available for this slot.'
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Random doctor option */}
                          <button
                            type="button"
                            onClick={() => {
                              if (slotDoctors.length > 0) {
                                setSelectedSlotId(expandedSlot.slotIds[0]);
                                setSelectedDoctorId('auto');
                              }
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border border-dashed transition-all ${
                              selectedDoctorId === 'auto' &&
                              expandedSlot.slotIds.includes(selectedSlotId)
                                ? 'border-primary bg-primary/5'
                                : 'border-(--border-primary) hover:bg-(--bg-secondary)'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <RefreshCw className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-bold text-(--text-primary)">
                                {t(
                                  'Organisation.latePatientModal.existing.anyDoctor',
                                  'Any available doctor'
                                )}
                              </p>
                              <p className="text-[10px] text-(--text-muted)">
                                {t(
                                  'Organisation.latePatientModal.existing.anyDoctorDesc',
                                  'System will auto-assign a doctor'
                                )}
                              </p>
                            </div>
                            {selectedDoctorId === 'auto' &&
                              expandedSlot.slotIds.includes(selectedSlotId) && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                          </button>

                          {/* Individual doctors */}
                          {slotDoctors.map((doc: AvailableDoctorDto) => {
                            const isDocSelected =
                              selectedDoctorId === doc.id &&
                              expandedSlot.slotIds.includes(selectedSlotId);
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSlotId(expandedSlot.slotIds[0]);
                                  setSelectedDoctorId(doc.id);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  isDocSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-(--border-primary) hover:bg-(--bg-secondary)'
                                }`}
                              >
                                {doc.avatarUrl ? (
                                  <img
                                    src={doc.avatarUrl}
                                    alt={doc.fullName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-muted) border-2 border-white dark:border-slate-700 shadow-sm">
                                    <User className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-bold text-(--text-primary)">
                                    {doc.fullName}
                                  </p>
                                  <p className="text-[10px] text-(--text-muted)">
                                    Ophthalmologist
                                  </p>
                                </div>
                                {isDocSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={rebookExisting.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-tertiary)"
                >
                  {t('Organisation.common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleRebookExisting}
                  disabled={
                    rebookExisting.isPending ||
                    !selectedSlotId ||
                    !lateCheck.availableSlots?.length
                  }
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {rebookExisting.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {t(
                    'Organisation.latePatientModal.actions.rebook',
                    'Rebook Patient'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-(--text-secondary)">
                {t(
                  'Organisation.latePatientModal.adhoc.description',
                  'Create a custom time slot for this patient.'
                )}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-(--text-secondary)">
                    {t(
                      'Organisation.latePatientModal.adhoc.startTime',
                      'Start Time'
                    )}
                  </label>
                  <input
                    type="time"
                    value={adHocForm.startTime}
                    onChange={(e) =>
                      setAdHocForm({ ...adHocForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-(--text-secondary)">
                    {t(
                      'Organisation.latePatientModal.adhoc.endTime',
                      'End Time'
                    )}
                  </label>
                  <input
                    type="time"
                    value={adHocForm.endTime}
                    onChange={(e) =>
                      setAdHocForm({ ...adHocForm, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary outline-none transition text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-(--text-secondary)">
                  {t(
                    'Organisation.latePatientModal.adhoc.doctor',
                    'Assign Doctor'
                  )}
                </label>
                <div className="relative">
                  <select
                    value={adHocForm.doctorId}
                    onChange={(e) =>
                      setAdHocForm({ ...adHocForm, doctorId: e.target.value })
                    }
                    disabled={isLoadingDoctors}
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary outline-none transition text-sm appearance-none"
                  >
                    <option value="">
                      {t(
                        'Organisation.latePatientModal.adhoc.noDoctor',
                        'Auto-assign / No preference'
                      )}
                    </option>
                    {availableDoctors?.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName}
                      </option>
                    ))}
                  </select>
                  <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted) pointer-events-none" />
                </div>
                {isLoadingDoctors && (
                  <p className="text-xs text-(--text-muted)">
                    {t(
                      'Organisation.latePatientModal.adhoc.loadingDoctors',
                      'Loading doctors...'
                    )}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={rebookAdHoc.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-tertiary)"
                >
                  {t('Organisation.common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleRebookAdHoc}
                  disabled={rebookAdHoc.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {rebookAdHoc.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {t(
                    'Organisation.latePatientModal.actions.createAndRebook',
                    'Create Slot & Rebook'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
