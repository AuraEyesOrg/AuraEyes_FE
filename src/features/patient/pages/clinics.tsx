import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Star,
  Stethoscope,
  Wallet,
  X,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useCreateClinicAppointment,
  useOrganisationAvailableSlots,
  useOrganisations,
} from '../hooks/use-clinic-booking';
import { useWallet } from '../hooks/use-wallet';
import useAuthStore from '@/store/auth-store';
import { mapClinicPatientErrorMessage } from '@/lib/api-error';
import {
  formatSlotTime,
  formatDate,
  toLocalDateKey,
  parseSlotDateTimeUtc,
} from '@/lib/date-utils';
import { toast } from 'react-toastify';

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const isExpiredClinicSlot = (slot: { date: string; startTime: string }) => {
  const startAt = parseSlotDateTimeUtc(slot.date, slot.startTime).getTime();
  if (Number.isNaN(startAt)) return false;
  return startAt < Date.now();
};

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface SlotItem {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
  maxCapacity: number;
  cost?: number | null;
}

interface MiniCalendarProps {
  availableDateKeys: Set<string>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function MiniCalendar({
  availableDateKeys,
  selectedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    return d.getMonth();
  });

  useEffect(() => {
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    if (Number.isNaN(d.getTime())) return;

    const nextYear = d.getFullYear();
    const nextMonth = d.getMonth();

    setViewYear((current) => (current === nextYear ? current : nextYear));
    setViewMonth((current) => (current === nextMonth ? current : nextMonth));
  }, [selectedDate]);

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [viewYear, viewMonth]
  );

  const cells = useMemo(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: Array<{ day: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < firstDow; i++)
      result.push({ day: null, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, dateStr });
    }
    return result;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-(--text-primary)">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DOW_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] text-(--text-muted)"
          >
            {d}
          </div>
        ))}

        {cells.map((cell, idx) => {
          if (cell.day === null || cell.dateStr === null) {
            return <div key={`empty-${idx}`} />;
          }
          const dateStr = cell.dateStr;
          const cellDate = new Date(dateStr + 'T00:00:00');
          const isPast = cellDate < today;
          const isToday = toYMD(today) === dateStr;
          const hasSlots = availableDateKeys.has(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || !hasSlots}
              onClick={() => onSelectDate(dateStr)}
              className={[
                'relative flex aspect-square items-center justify-center rounded-lg text-[13px] transition',
                isPast
                  ? 'cursor-default text-(--text-muted) opacity-40'
                  : !hasSlots
                    ? 'cursor-default text-(--text-muted)'
                    : isSelected
                      ? 'bg-cyan-600 font-medium text-white'
                      : 'cursor-pointer text-(--text-primary) hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
                isToday && !isSelected ? 'font-semibold' : '',
              ].join(' ')}
            >
              {cell.day}
              {hasSlots && !isSelected && (
                <span className="absolute bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SlotGroupProps {
  label: string;
  fullLabel: string;
  slots: SlotItem[];
  selectedSlotId: string;
  bookingPending: boolean;
  onSelect: (slotId: string) => void;
}

function SlotGroup({
  label,
  fullLabel,
  slots,
  selectedSlotId,
  bookingPending,
  onSelect,
}: SlotGroupProps) {
  if (slots.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isFull = slot.remaining <= 0;
          const isLow = slot.remaining > 0 && slot.remaining <= 2;
          const isSelected = selectedSlotId === slot.slotId;
          return (
            <button
              key={slot.slotId}
              type="button"
              disabled={isFull || bookingPending}
              onClick={() => onSelect(slot.slotId)}
              className={[
                'flex min-w-[76px] flex-col items-center gap-0.5 rounded-xl border px-3 py-2 transition',
                isFull
                  ? 'cursor-not-allowed border-(--border-color) opacity-40'
                  : isSelected
                    ? 'border-cyan-600 bg-cyan-600 text-white'
                    : 'border-(--border-color) bg-(--bg-secondary) hover:border-cyan-400',
              ].join(' ')}
            >
              <span
                className={`text-[13px] font-medium ${isSelected ? 'text-white' : 'text-(--text-primary)'}`}
              >
                {formatSlotTime(slot.startTime)}
              </span>
              <span
                className={`text-[11px] ${
                  isSelected
                    ? 'text-cyan-100'
                    : isFull
                      ? 'text-(--text-muted)'
                      : isLow
                        ? 'text-amber-500'
                        : 'text-(--text-muted)'
                }`}
              >
                {isFull ? fullLabel : `${slot.remaining}/${slot.maxCapacity}`}
              </span>
              {slot.cost != null && slot.cost > 0 && (
                <span
                  className={`text-[10px] font-medium ${
                    isSelected
                      ? 'text-cyan-200'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {slot.cost.toLocaleString('vi-VN')}₫
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ClinicBookingConfirmModalProps {
  organisationName: string;
  organisationAddress: string;
  slot: SlotItem;
  visitReason: string;
  walletBalance: number | null;
  errorMessage: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function ClinicBookingConfirmModal({
  organisationName,
  organisationAddress,
  slot,
  visitReason,
  walletBalance,
  errorMessage,
  isSubmitting,
  onCancel,
  onConfirm,
  t,
}: ClinicBookingConfirmModalProps) {
  const depositFee = slot.cost ?? 0;
  const requiresDeposit = depositFee > 0;
  const insufficientBalance =
    requiresDeposit && walletBalance != null && walletBalance < depositFee;
  const balanceAfter =
    walletBalance != null ? walletBalance - depositFee : null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (isSubmitting) return;
    onCancel();
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !isSubmitting) {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clinic-confirm-title"
      onClick={handleBackdropClick}
      onKeyDown={handleDialogKeyDown}
      tabIndex={-1}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-primary) shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-(--border-color) px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="clinic-confirm-title"
                className="text-base font-semibold text-(--text-primary)"
              >
                {t('PatientClinics.confirmModal.title')}
              </h3>
              <p className="mt-0.5 text-xs text-(--text-muted)">
                {t('PatientClinics.confirmModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label={t('PatientClinics.confirmModal.close')}
            className="rounded-lg p-1.5 text-(--text-muted) transition hover:bg-(--bg-secondary) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          {/* Summary */}
          <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-(--text-muted)" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                  {t('PatientClinics.labels.organisation')}
                </p>
                <p className="truncate text-sm font-semibold text-(--text-primary)">
                  {organisationName}
                </p>
                {organisationAddress && (
                  <p className="mt-0.5 truncate text-xs text-(--text-secondary)">
                    {organisationAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-(--text-muted)" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                  {t('PatientClinics.fields.visitDate')}
                </p>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {formatDate(slot.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-(--text-muted)" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                  {t('PatientClinics.confirmModal.time')}
                </p>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {formatSlotTime(slot.startTime)} –{' '}
                  {formatSlotTime(slot.endTime)}
                </p>
              </div>
            </div>
            {visitReason.trim() && (
              <div className="flex items-start gap-3">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-(--text-muted)" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                    {t('PatientClinics.fields.visitReason')}
                  </p>
                  <p className="text-sm text-(--text-primary)">
                    {visitReason.trim()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Deposit breakdown */}
          <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-secondary)">
                {t('PatientClinics.deposit.fee')}
              </span>
              <span className="font-semibold text-(--text-primary)">
                {requiresDeposit
                  ? `${depositFee.toLocaleString('vi-VN')}₫`
                  : t('PatientClinics.confirmModal.free')}
              </span>
            </div>
            {walletBalance != null && requiresDeposit && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 text-(--text-secondary)">
                    <Wallet className="h-3.5 w-3.5" />
                    {t('PatientClinics.deposit.walletBalance')}
                  </span>
                  <span className="font-medium text-(--text-primary)">
                    {walletBalance.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="border-t border-dashed border-(--border-color) pt-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-(--text-secondary)">
                    {t('PatientClinics.confirmModal.balanceAfter')}
                  </span>
                  <span
                    className={`font-semibold ${
                      balanceAfter != null && balanceAfter < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {balanceAfter != null
                      ? `${balanceAfter.toLocaleString('vi-VN')}₫`
                      : '—'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Insufficient balance warning */}
          {insufficientBalance && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t('PatientClinics.deposit.insufficient')}</span>
            </div>
          )}

          {/* Server error */}
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Terms note */}
          <p className="text-xs text-(--text-muted)">
            {t('PatientClinics.confirmModal.terms')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-(--border-color) bg-(--bg-secondary) px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-(--border-color) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-primary) transition hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('PatientClinics.confirmModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || insufficientBalance}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Spinner /> : <CheckCircle className="h-4 w-4" />}
            {isSubmitting
              ? t('PatientClinics.confirmModal.processing')
              : t('PatientClinics.confirmModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;
  const visitReasonPresets = [
    t('PatientClinics.reasons.routine'),
    t('PatientClinics.reasons.blurredVision'),
    t('PatientClinics.reasons.eyePressure'),
    t('PatientClinics.reasons.eyePain'),
    t('PatientClinics.reasons.firstVisit'),
  ];

  const { user } = useAuthStore();
  const patientId = user?.roleId ?? '';

  const [searchText, setSearchText] = useState('');
  const [selectedOrganisationId, setSelectedOrganisationId] = useState('');
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()));
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    data: organisations = [],
    isLoading: loadingOrganisations,
    error: organisationsError,
  } = useOrganisations();

  const {
    data: availableSlots = [],
    isLoading: loadingSlots,
    error: availableSlotsError,
  } = useOrganisationAvailableSlots(undefined, !!selectedOrganisationId);

  const createAppointmentMutation = useCreateClinicAppointment();
  const { data: walletData } = useWallet();

  const upcomingSlots = useMemo(
    () => availableSlots.filter((slot) => !isExpiredClinicSlot(slot)),
    [availableSlots]
  );

  const availableDateKeys = useMemo(
    () => Array.from(new Set(upcomingSlots.map((slot) => slot.date))),
    [upcomingSlots]
  );

  const availableDateSet = useMemo(
    () => new Set(availableDateKeys),
    [availableDateKeys]
  );

  // Auto-select first available date when org changes
  useEffect(() => {
    if (!selectedOrganisationId || availableDateKeys.length === 0) return;
    if (!availableDateSet.has(selectedDate)) {
      setSelectedDate(availableDateKeys[0]);
      setSelectedSlotId('');
    }
  }, [
    availableDateKeys,
    availableDateSet,
    selectedDate,
    selectedOrganisationId,
  ]);

  // Reset selected slot when date changes
  useEffect(() => {
    setSelectedSlotId('');
  }, [selectedDate]);

  const slotsForDate = useMemo(
    () => upcomingSlots.filter((slot) => slot.date === selectedDate),
    [selectedDate, upcomingSlots]
  );

  const morningSlots = useMemo(
    () => slotsForDate.filter((s) => parseInt(s.startTime) < 12),
    [slotsForDate]
  );
  const afternoonSlots = useMemo(
    () => slotsForDate.filter((s) => parseInt(s.startTime) >= 12),
    [slotsForDate]
  );

  const selectedSlot = useMemo(
    () => slotsForDate.find((s) => s.slotId === selectedSlotId),
    [slotsForDate, selectedSlotId]
  );

  const filteredOrganisations = useMemo(() => {
    if (!searchText.trim()) return organisations;
    const query = searchText.toLowerCase();
    return organisations.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.address ?? '').toLowerCase().includes(query) ||
        (item.city ?? '').toLowerCase().includes(query)
    );
  }, [organisations, searchText]);

  const selectedOrganisation = organisations.find(
    (item) => item.id === selectedOrganisationId
  );

  const openConfirmModal = () => {
    if (!selectedOrganisationId || !patientId || !selectedSlotId) return;
    setErrorMessage('');
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    if (createAppointmentMutation.isPending) return;
    setShowConfirmModal(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedOrganisationId || !patientId || !selectedSlotId) return;
    setErrorMessage('');
    try {
      await createAppointmentMutation.mutateAsync({
        slotId: selectedSlotId,
        visitReason: visitReason.trim() || undefined,
      });
      toast.success(t('PatientClinics.toast.bookSuccess'));
      setSelectedSlotId('');
      setShowConfirmModal(false);
    } catch (error) {
      setErrorMessage(mapClinicPatientErrorMessage(error));
    }
  };

  const availableCount = slotsForDate.filter((s) => s.remaining > 0).length;

  return (
    <PatientLayout>
      <div>
        <section>
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-(--text-primary)">
              {t('PatientClinics.page.title')}
            </h1>
            <p className="mt-2 text-(--text-secondary)">
              {t('PatientClinics.page.subtitle')}
            </p>
          </div>

          {(organisationsError || availableSlotsError) && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {mapClinicPatientErrorMessage(
                organisationsError ?? availableSlotsError
              )}
            </div>
          )}

          {/* Organisation picker */}
          <div className="medical-card p-5">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
              <input
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-secondary) py-2.5 pl-10 pr-3 text-(--text-primary) outline-none ring-brand/40 placeholder:text-(--text-muted) focus:ring-2"
                placeholder={t('PatientClinics.search.placeholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {loadingOrganisations ? (
              <div className="flex items-center gap-3 py-8 text-(--text-secondary)">
                <Spinner />
                <span>{t('PatientClinics.loading.organisations')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredOrganisations.map((organisation) => {
                  const isSelected = selectedOrganisationId === organisation.id;
                  return (
                    <button
                      key={organisation.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrganisationId(organisation.id);
                        setSelectedSlotId('');
                        setErrorMessage('');
                      }}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-(--border-color) bg-(--bg-secondary) hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={organisation.avatarUrl ?? ''}
                          alt={organisation.name}
                          className="h-10 w-10 rounded-lg border border-(--border-color) bg-(--bg-tertiary) object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-(--text-primary)">
                            {organisation.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-(--text-secondary)">
                            <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                              {organisation.orgType ??
                                t('PatientClinics.labels.organisation')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              {organisation.ratingAverage?.toFixed(1) ?? '0.0'}
                              <span className="text-(--text-muted)">
                                ({organisation.ratingCount ?? 0})
                              </span>
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-(--text-secondary)">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {[organisation.address, organisation.city]
                                .filter(Boolean)
                                .join(', ') ||
                                t('PatientClinics.labels.noAddress')}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredOrganisations.length === 0 && (
                  <div className="rounded-xl border border-dashed border-(--border-color) p-6 text-center text-(--text-secondary) md:col-span-2">
                    {t('PatientClinics.empty.organisations')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Confirm booking modal ── */}
          {showConfirmModal && selectedSlot && selectedOrganisation && (
            <ClinicBookingConfirmModal
              organisationName={selectedOrganisation.name}
              organisationAddress={[
                selectedOrganisation.address,
                selectedOrganisation.city,
              ]
                .filter(Boolean)
                .join(', ')}
              slot={selectedSlot}
              visitReason={visitReason}
              walletBalance={walletData?.balance ?? null}
              errorMessage={errorMessage}
              isSubmitting={createAppointmentMutation.isPending}
              onCancel={closeConfirmModal}
              onConfirm={() => void handleConfirmBooking()}
              t={t}
            />
          )}

          {/* ── Booking panel ── */}
          <div className="medical-card mt-6 p-5">
            {/* Panel header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                {t('PatientClinics.slots.title')}
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {selectedOrganisation
                  ? t('PatientClinics.slots.organisation', {
                      name: selectedOrganisation.name,
                    })
                  : t('PatientClinics.slots.selectOrganisation')}
              </p>
            </div>

            {!selectedOrganisationId ? (
              <div className="rounded-xl border border-dashed border-(--border-color) p-8 text-center text-(--text-secondary)">
                {t('PatientClinics.empty.selectOrganisationFirst')}
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center gap-3 py-8 text-(--text-secondary)">
                <Spinner />
                <span>{t('PatientClinics.loading.slots')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                {/* ── Left column: calendar + reason ── */}
                <div className="flex flex-col gap-4">
                  {/* Mini calendar */}
                  <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                      {t('PatientClinics.fields.visitDate')}
                    </p>
                    <MiniCalendar
                      availableDateKeys={availableDateSet}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                    {availableDateKeys.length === 0 && (
                      <p className="mt-3 text-center text-xs text-(--text-muted)">
                        {t('PatientClinics.empty.noUpcomingSlots')}
                      </p>
                    )}
                  </div>

                  {/* Visit reason */}
                  <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
                      {t('PatientClinics.fields.visitReason')}
                    </p>
                    <input
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      placeholder={t(
                        'PatientClinics.fields.visitReasonPlaceholder'
                      )}
                      className="w-full rounded-lg border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {visitReasonPresets.map((label) => {
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setVisitReason(label)}
                            className={`rounded-full border px-2.5 py-1 text-xs transition ${
                              visitReason === label
                                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300'
                                : 'border-(--border-color) text-(--text-secondary) hover:border-cyan-300'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Right column: slots ── */}
                <div className="flex flex-col">
                  <div className="mb-3 flex items-baseline justify-between">
                    <p className="font-medium text-(--text-primary)">
                      {formatDate(selectedDate)}
                    </p>
                    {availableCount > 0 && (
                      <span className="text-xs text-(--text-muted)">
                        {t('PatientClinics.slots.availableCount', {
                          count: availableCount,
                        })}
                      </span>
                    )}
                  </div>

                  {slotsForDate.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-(--border-color) p-8 text-center text-(--text-secondary)">
                      {t('PatientClinics.empty.noSlotsForDate')}
                    </div>
                  ) : (
                    <>
                      <SlotGroup
                        label={t('PatientClinics.labels.morning')}
                        fullLabel={t('PatientClinics.slots.full')}
                        slots={morningSlots}
                        selectedSlotId={selectedSlotId}
                        bookingPending={createAppointmentMutation.isPending}
                        onSelect={setSelectedSlotId}
                      />
                      <SlotGroup
                        label={t('PatientClinics.labels.afternoon')}
                        fullLabel={t('PatientClinics.slots.full')}
                        slots={afternoonSlots}
                        selectedSlotId={selectedSlotId}
                        bookingPending={createAppointmentMutation.isPending}
                        onSelect={setSelectedSlotId}
                      />
                    </>
                  )}

                  {/* Error */}
                  {errorMessage && (
                    <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  {/* Confirm bar */}
                  {selectedSlot && (
                    <div className="mt-auto pt-4">
                      {selectedSlot.cost != null &&
                        selectedSlot.cost > 0 &&
                        walletData != null && (
                          <div
                            className={`mb-2 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
                              walletData.balance < selectedSlot.cost
                                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300'
                            }`}
                          >
                            <Wallet className="h-4 w-4 shrink-0" />
                            <span>
                              {t('PatientClinics.deposit.walletBalance')}:{' '}
                              <strong>
                                {walletData.balance.toLocaleString('vi-VN')}₫
                              </strong>
                              {' · '}
                              {t('PatientClinics.deposit.fee')}:{' '}
                              <strong>
                                {selectedSlot.cost.toLocaleString('vi-VN')}₫
                              </strong>
                              {walletData.balance < selectedSlot.cost && (
                                <>
                                  {' — '}
                                  {t('PatientClinics.deposit.insufficient')}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800/60 dark:bg-cyan-900/20">
                        <div className="min-w-0">
                          <p className="text-xs text-cyan-700 dark:text-cyan-300">
                            {t('PatientClinics.labels.selectedSlot')}
                          </p>
                          <p className="truncate text-sm font-medium text-cyan-900 dark:text-cyan-100">
                            {formatDate(selectedSlot.date)}
                            {' · '}
                            {formatSlotTime(selectedSlot.startTime)}
                            {' – '}
                            {formatSlotTime(selectedSlot.endTime)}
                            {selectedSlot.cost != null &&
                              selectedSlot.cost > 0 && (
                                <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                  ({t('PatientClinics.deposit.label')}:{' '}
                                  {selectedSlot.cost.toLocaleString('vi-VN')}₫)
                                </span>
                              )}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={
                            createAppointmentMutation.isPending ||
                            (selectedSlot.cost != null &&
                              selectedSlot.cost > 0 &&
                              walletData != null &&
                              walletData.balance < selectedSlot.cost)
                          }
                          onClick={openConfirmModal}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Stethoscope className="h-4 w-4" />
                          {t('PatientClinics.actions.bookClinicVisit')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
}
