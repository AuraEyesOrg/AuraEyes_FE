import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CalendarDays,
  Users,
  Stethoscope,
  Loader2,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { mapClinicStaffErrorMessage } from '@/lib/api-error';
import {
  useCheckLateArrival,
  useAvailableDoctorsForSlot,
  useRebookToExistingSlot,
  useRebookToAdHocSlot,
} from '../hooks/use-late-patient';
import type { AvailableSlotOption } from '../api/late-patient.api';

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
  const [activeTab, setActiveTab] = useState<'existing' | 'adhoc'>('existing');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [adHocForm, setAdHocForm] = useState({
    startTime: '',
    endTime: '',
    maxCapacity: 1,
    cost: '',
    doctorId: '',
  });

  const {
    data: lateCheck,
    isLoading: isChecking,
    isError: isCheckError,
  } = useCheckLateArrival(appointmentId, isOpen);

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

  useEffect(() => {
    if (isOpen && lateCheck) {
      setActiveTab('existing');
      setSelectedSlotId('');
      setAdHocForm({
        startTime: lateCheck.adHocDefaults?.suggestedStartTime ?? '',
        endTime: '',
        maxCapacity: lateCheck.adHocDefaults?.defaultCapacity ?? 1,
        cost: lateCheck.adHocDefaults?.defaultCost?.toString() ?? '',
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
            {t(
              'Organisation.latePatientModal.notLate',
              'Patient is not late or appointment not found.'
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
          maxCapacity: Number(adHocForm.maxCapacity) || 1,
          cost: adHocForm.cost ? Number(adHocForm.cost) : null,
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
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'existing' ? (
            <div className="space-y-3">
              <p className="text-sm text-(--text-secondary)">
                {t(
                  'Organisation.latePatientModal.existing.description',
                  'Select an available slot on the same day for the patient.'
                )}
              </p>

              {lateCheck.availableSlots?.length === 0 ? (
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lateCheck.availableSlots?.map(
                    (slot: AvailableSlotOption) => (
                      <button
                        key={slot.slotId}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.slotId)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                          selectedSlotId === slot.slotId
                            ? 'border-primary bg-primary/5'
                            : 'border-(--border-primary) hover:bg-(--bg-secondary)'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-(--text-muted)" />
                          <div>
                            <p className="text-sm font-medium text-(--text-primary)">
                              {slot.startTime} – {slot.endTime}
                            </p>
                            <p className="text-xs text-(--text-muted)">
                              {slot.cost
                                ? `${slot.cost.toLocaleString()} VND`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <Users className="w-3.5 h-3.5" />
                          {slot.remainingCapacity} left
                        </div>
                      </button>
                    )
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-(--text-secondary)">
                    {t(
                      'Organisation.latePatientModal.adhoc.capacity',
                      'Capacity'
                    )}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adHocForm.maxCapacity}
                    onChange={(e) =>
                      setAdHocForm({
                        ...adHocForm,
                        maxCapacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-(--text-secondary)">
                    {t(
                      'Organisation.latePatientModal.adhoc.cost',
                      'Cost (VND)'
                    )}
                  </label>
                  <input
                    type="number"
                    value={adHocForm.cost}
                    onChange={(e) =>
                      setAdHocForm({ ...adHocForm, cost: e.target.value })
                    }
                    placeholder={t(
                      'Organisation.latePatientModal.adhoc.costPlaceholder',
                      'Optional'
                    )}
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
