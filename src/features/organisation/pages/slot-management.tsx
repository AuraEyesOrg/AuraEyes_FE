import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Calendar,
  CalendarPlus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UserX,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirm-modal';
import Spinner from '@/components/ui/spinner';
import {
  formatDate,
  formatSlotTimeShort,
  getStartOfWeekMonday,
  getWeekOffsetFromDateKey,
  formatWeekDayLabel,
  formatWeekRange,
  toLocalDateKey,
} from '@/lib/date-utils';
import useAuthStore from '@/store/auth-store';
import OrganisationHeader from '../components/OrganisationHeader';
import Sidebar from '../components/Sidebar';
import {
  useCreateOrganisationTemplate,
  useDeleteOrganisationTemplate,
  useGenerateOrganisationSlots,
  useOrganisationSlots,
  useOrganisationTemplates,
  useUpdateOrganisationSlotStatus,
} from '../hooks/use-organisation-booking';

const DAYS_PER_WEEK = 7;

const dayOptions = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const getDayOfWeekLabel = (dayOfWeek: string) =>
  dayOptions.find((d) => d.value === Number(dayOfWeek))?.label ?? dayOfWeek;

type WorkspaceTab = 'slots' | 'templates' | 'generate';

const statusBadge: Record<string, string> = {
  Available:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Reserved:
    'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Booked: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Blocked:
    'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  Completed: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Cancelled: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  NoShow:
    'bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  Expired:
    'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function OrganisationSlotManagementPage() {
  const { user } = useAuthStore();
  const organisationId = user?.organizationId ?? '';

  const todayKey = toLocalDateKey(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [templateId, setTemplateId] = useState('');
  const [fromDate, setFromDate] = useState(todayKey);
  const [toDate, setToDate] = useState(todayKey);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [templateToDeleteId, setTemplateToDeleteId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('slots');

  const weekWindow = useMemo(() => {
    const weekStart = getStartOfWeekMonday(new Date());
    weekStart.setDate(weekStart.getDate() + currentWeekOffset * DAYS_PER_WEEK);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + DAYS_PER_WEEK - 1);
    const days = Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dateKey = toLocalDateKey(day);
      return {
        dateKey,
        dayLabel: formatWeekDayLabel(day),
        dayNumber: day.getDate(),
        isToday: dateKey === todayKey,
      };
    });
    return {
      from: toLocalDateKey(weekStart),
      to: toLocalDateKey(weekEnd),
      label: formatWeekRange(weekStart, weekEnd),
      days,
    };
  }, [currentWeekOffset, todayKey]);

  const { data: templates = [], isLoading: templatesLoading } =
    useOrganisationTemplates(organisationId, !!organisationId);

  const { data: slotsPage, isLoading: slotsLoading } = useOrganisationSlots(
    {
      orgId: organisationId,
      fromDate: weekWindow.from,
      toDate: weekWindow.to,
      pageSize: 200,
    },
    !!organisationId
  );

  const createTemplateMutation = useCreateOrganisationTemplate();
  const deleteTemplateMutation = useDeleteOrganisationTemplate();
  const generateSlotsMutation = useGenerateOrganisationSlots();
  const updateSlotStatusMutation = useUpdateOrganisationSlotStatus();

  const slots = slotsPage?.items ?? [];

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, typeof slots> = {};
    slots.forEach((slot) => {
      grouped[slot.date] ??= [];
      grouped[slot.date].push(slot);
    });
    Object.values(grouped).forEach((g) =>
      g.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [slots]);

  const daySlots = slotsByDate[selectedDate] ?? [];

  const weekDaySummaries = weekWindow.days.map((day) => {
    const items = slotsByDate[day.dateKey] ?? [];
    return {
      ...day,
      total: items.length,
      booked: items.filter((s) => s.status === 'Booked').length,
    };
  });

  const stats = useMemo(
    () => ({
      total: slots.length,
      available: slots.filter((s) => s.status === 'Available').length,
      booked: slots.filter((s) => s.status === 'Booked').length,
      blocked: slots.filter((s) => s.status === 'Blocked').length,
    }),
    [slots]
  );

  useEffect(() => {
    const inWeek = weekWindow.days.some((d) => d.dateKey === selectedDate);
    if (!inWeek && weekWindow.days[0])
      setSelectedDate(weekWindow.days[0].dateKey);
  }, [selectedDate, weekWindow.days]);

  const handleCreateTemplate = async () => {
    if (!organisationId) return;
    if (startTime >= endTime) {
      toast.error('End time must be later than start time.');
      return;
    }
    if (slotDuration < 5 || slotDuration % 5 !== 0) {
      toast.error('Slot duration must be a multiple of 5 minutes.');
      return;
    }
    if (maxCapacity < 1) {
      toast.error('Max capacity must be at least 1.');
      return;
    }
    try {
      await createTemplateMutation.mutateAsync({
        orgId: organisationId,
        request: {
          dayOfWeek,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          slotDuration,
          maxCapacity,
        },
      });
      toast.success('Template created successfully.');
    } catch {
      toast.error('Failed to create template.');
    }
  };

  const handleGenerateSlots = async () => {
    if (!templateId) {
      toast.error('Please select a template before generating slots.');
      return;
    }
    if (fromDate > toDate) {
      toast.error('From date cannot be later than to date.');
      return;
    }
    try {
      const count = await generateSlotsMutation.mutateAsync({
        scheduleTemplateId: templateId,
        fromDate,
        toDate,
        skipExistingDates: true,
      });
      toast.success(`Generated ${count} slots.`);
    } catch {
      toast.error('Failed to generate slots.');
    }
  };

  const confirmDeleteTemplate = async () => {
    if (!organisationId || !templateToDeleteId) return;
    try {
      await deleteTemplateMutation.mutateAsync({
        templateId: templateToDeleteId,
        orgId: organisationId,
      });
      toast.success('Template deleted.');
      setTemplateToDeleteId(null);
    } catch {
      toast.error('Failed to delete template.');
    }
  };

  const updateSlotStatus = async (slotId: string, newStatus: number) => {
    try {
      await updateSlotStatusMutation.mutateAsync({ slotId, newStatus });
      toast.success('Slot status updated.');
    } catch {
      toast.error('Failed to update slot status.');
    }
  };

  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
    setCurrentWeekOffset(getWeekOffsetFromDateKey(dateKey));
  };

  const tabs: { id: WorkspaceTab; label: string }[] = [
    { id: 'slots', label: 'Daily slots' },
    { id: 'templates', label: 'Template setup' },
    { id: 'generate', label: 'Generate schedule' },
  ];

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="h-full flex-1 overflow-y-auto">
        <OrganisationHeader pageName="Slot Management" />

        <main className="p-6">
          {!organisationId && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              No organisation linked to this account. Slot management is
              unavailable.
            </div>
          )}

          {/* Tab navigation */}
          <div className="mb-5 flex gap-1 border-b border-(--border-color)">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  '-mb-px border-b-2 px-4 py-2.5 text-sm transition',
                  activeTab === tab.id
                    ? 'border-cyan-600 font-medium text-cyan-700 dark:text-cyan-300'
                    : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Daily slots ── */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    label: 'Total this week',
                    value: stats.total,
                    color: 'text-(--text-primary)',
                  },
                  {
                    label: 'Available',
                    value: stats.available,
                    color: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: 'Booked',
                    value: stats.booked,
                    color: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    label: 'Blocked',
                    value: stats.blocked,
                    color: 'text-slate-600 dark:text-slate-300',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-(--bg-secondary) p-4"
                  >
                    <p className="text-xs text-(--text-muted)">{s.label}</p>
                    <p className={`mt-1.5 text-2xl font-semibold ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Week navigator */}
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((p) => p - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-(--border-color) px-3 py-1.5 text-sm text-(--text-secondary) transition hover:bg-(--bg-secondary)"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <p className="flex-1 text-center text-sm font-medium text-(--text-primary)">
                    {weekWindow.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((p) => p + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-(--border-color) px-3 py-1.5 text-sm text-(--text-secondary) transition hover:bg-(--bg-secondary)"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentWeekOffset(0);
                      setSelectedDate(todayKey);
                    }}
                    className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300"
                  >
                    Today
                  </button>
                  <label className="text-xs text-(--text-muted)">
                    Jump to
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      className="ml-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) px-2 py-1.5 text-sm text-(--text-primary)"
                    />
                  </label>
                </div>

                {/* Week strip */}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {weekDaySummaries.map((day) => {
                    const isSelected = day.dateKey === selectedDate;
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => setSelectedDate(day.dateKey)}
                        className={[
                          'rounded-xl border p-3 text-center transition',
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-900/20'
                            : 'border-(--border-color) hover:border-cyan-300 hover:bg-cyan-50/60 dark:hover:border-cyan-700/50',
                        ].join(' ')}
                      >
                        <p
                          className={`text-[11px] ${isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-(--text-muted)'}`}
                        >
                          {day.dayLabel}
                        </p>
                        <p
                          className={`mt-1 text-xl font-semibold ${isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-(--text-primary)'}`}
                        >
                          {day.dayNumber}
                        </p>
                        <p className="mt-1 text-[11px] text-(--text-muted)">
                          {day.total} slots
                        </p>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400">
                          {day.booked} booked
                        </p>
                        {day.isToday && (
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot table */}
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-medium text-(--text-primary)">
                    {formatDate(selectedDate, 'long')}
                  </h2>
                  <span className="rounded-full bg-(--bg-secondary) px-3 py-1 text-xs text-(--text-secondary)">
                    {daySlots.length} slots
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-(--text-secondary)">
                    <Spinner /> Loading slots...
                  </div>
                ) : daySlots.length === 0 ? (
                  <div className="py-10 text-center text-sm text-(--text-muted)">
                    No slots on this day.{' '}
                    <button
                      type="button"
                      className="text-cyan-600 underline underline-offset-2"
                      onClick={() => setActiveTab('generate')}
                    >
                      Generate from a template?
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-(--border-color) text-left">
                          <th className="px-3 py-2 text-[11px] font-medium text-(--text-muted)">
                            Time
                          </th>
                          <th className="px-3 py-2 text-[11px] font-medium text-(--text-muted)">
                            Status
                          </th>
                          <th className="px-3 py-2 text-[11px] font-medium text-(--text-muted)">
                            Capacity
                          </th>
                          <th className="px-3 py-2 text-[11px] font-medium text-(--text-muted)">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySlots.map((slot) => {
                          const pct =
                            slot.maxCapacity > 0
                              ? Math.round(
                                  (slot.bookedCount / slot.maxCapacity) * 100
                                )
                              : 0;
                          const barColor =
                            pct === 100
                              ? 'bg-red-400'
                              : pct >= 60
                                ? 'bg-amber-400'
                                : 'bg-emerald-500';

                          return (
                            <tr
                              key={slot.id}
                              className="border-b border-(--border-color) transition last:border-0 hover:bg-(--bg-secondary)"
                            >
                              <td className="px-3 py-3 font-medium tabular-nums text-(--text-primary)">
                                {formatSlotTimeShort(slot.startTime)}–
                                {formatSlotTimeShort(slot.endTime)}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge[slot.status] ?? statusBadge.Available}`}
                                >
                                  {slot.status}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-(--border-color)">
                                    <div
                                      className={`h-full rounded-full ${barColor}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-(--text-secondary)">
                                    {slot.bookedCount}/{slot.maxCapacity}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={
                                      slot.status === 'Blocked' ||
                                      updateSlotStatusMutation.isPending
                                    }
                                    onClick={() =>
                                      void updateSlotStatus(slot.id, 7)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                                  >
                                    <Ban className="h-3 w-3" /> Block
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      slot.status !== 'Blocked' ||
                                      updateSlotStatusMutation.isPending
                                    }
                                    onClick={() =>
                                      void updateSlotStatus(slot.id, 1)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-800 dark:text-emerald-400"
                                  >
                                    <CheckCircle className="h-3 w-3" /> Unblock
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      updateSlotStatusMutation.isPending
                                    }
                                    onClick={() =>
                                      void updateSlotStatus(slot.id, 4)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-cyan-200 px-2 py-1 text-xs text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-40 dark:border-cyan-800 dark:text-cyan-400"
                                  >
                                    <Calendar className="h-3 w-3" /> Complete
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      updateSlotStatusMutation.isPending
                                    }
                                    onClick={() =>
                                      void updateSlotStatus(slot.id, 5)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-violet-200 px-2 py-1 text-xs text-violet-700 transition hover:bg-violet-50 disabled:opacity-40 dark:border-violet-800 dark:text-violet-400"
                                  >
                                    <UserX className="h-3 w-3" /> No-show
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Template setup ── */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-(--text-primary)">
                  <CalendarPlus className="h-4 w-4 text-cyan-600" />
                  Create new template
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    Day of week
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    >
                      {dayOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    Slot duration (minutes)
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    Start time
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    End time
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                  <label className="block text-xs font-medium text-(--text-secondary) md:col-span-2">
                    Max capacity per slot
                    <input
                      type="number"
                      min={1}
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="mt-1.5 w-full max-w-[160px] rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreateTemplate()}
                  disabled={createTemplateMutation.isPending || !organisationId}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
                >
                  {createTemplateMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  Create template
                </button>
              </div>

              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-5">
                <h2 className="mb-4 text-base font-medium text-(--text-primary)">
                  Existing templates
                </h2>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-(--text-secondary)">
                    <Spinner /> Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <p className="py-6 text-center text-sm text-(--text-muted)">
                    No templates yet.
                  </p>
                ) : (
                  <div className="divide-y divide-(--border-color)">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-(--text-primary)">
                            {getDayOfWeekLabel(tpl.dayOfWeek)}
                            {' · '}
                            {formatSlotTimeShort(tpl.startTime)}–
                            {formatSlotTimeShort(tpl.endTime)}
                          </p>
                          <p className="mt-0.5 text-xs text-(--text-muted)">
                            {tpl.slotDuration} min per slot · capacity{' '}
                            {tpl.maxCapacity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTemplateToDeleteId(tpl.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                        >
                          <Ban className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Generate schedule ── */}
          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-5">
                <h2 className="mb-1 flex items-center gap-2 text-base font-medium text-(--text-primary)">
                  <Calendar className="h-4 w-4 text-cyan-500" />
                  Generate slots
                </h2>
                <p className="mb-4 text-xs text-(--text-muted)">
                  Slots matching the template's day-of-week will be created for
                  every matching date in the range.
                </p>

                <label className="mb-3 block text-xs font-medium text-(--text-secondary)">
                  Template
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                  >
                    <option value="">Select a template…</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {getDayOfWeekLabel(tpl.dayOfWeek)} ·{' '}
                        {formatSlotTimeShort(tpl.startTime)}–
                        {formatSlotTimeShort(tpl.endTime)}
                        {' (cap '}
                        {tpl.maxCapacity}
                        {')'}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    From date
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                  <label className="block text-xs font-medium text-(--text-secondary)">
                    To date
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate(weekWindow.from);
                      setToDate(weekWindow.to);
                    }}
                    className="rounded-lg border border-(--border-color) px-3 py-2 text-sm text-(--text-secondary) transition hover:bg-(--bg-secondary)"
                  >
                    Use current week
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleGenerateSlots()}
                    disabled={
                      generateSlotsMutation.isPending || !organisationId
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {generateSlotsMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <CalendarPlus className="h-4 w-4" />
                    )}
                    Generate slots
                  </button>
                </div>
              </div>

              {/* Quick template picker */}
              <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-5">
                <h3 className="mb-1 text-sm font-medium text-(--text-primary)">
                  Quick template picker
                </h3>
                <p className="mb-3 text-xs text-(--text-muted)">
                  Click to pre-select a template.
                </p>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-(--text-secondary)">
                    <Spinner /> Loading...
                  </div>
                ) : templates.length === 0 ? (
                  <p className="py-4 text-center text-sm text-(--text-muted)">
                    No templates.{' '}
                    <button
                      type="button"
                      className="text-cyan-600 underline underline-offset-2"
                      onClick={() => setActiveTab('templates')}
                    >
                      Create one first.
                    </button>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templates.map((tpl) => {
                      const isSelected = templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setTemplateId(tpl.id)}
                          className={[
                            'w-full rounded-xl border px-3 py-2.5 text-left transition',
                            isSelected
                              ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-900/20'
                              : 'border-(--border-color) hover:border-cyan-200 hover:bg-cyan-50/50 dark:hover:border-cyan-800',
                          ].join(' ')}
                        >
                          <p
                            className={`text-sm font-medium ${isSelected ? 'text-cyan-800 dark:text-cyan-200' : 'text-(--text-primary)'}`}
                          >
                            {getDayOfWeekLabel(tpl.dayOfWeek)}
                          </p>
                          <p
                            className={`text-xs ${isSelected ? 'text-cyan-600 dark:text-cyan-300' : 'text-(--text-muted)'}`}
                          >
                            {formatSlotTimeShort(tpl.startTime)}–
                            {formatSlotTimeShort(tpl.endTime)}
                            {' · '}
                            {tpl.slotDuration} min · cap {tpl.maxCapacity}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <ConfirmModal
            open={!!templateToDeleteId}
            title="Delete template"
            message="This template will be permanently removed. Existing generated slots are not affected."
            confirmLabel="Delete template"
            cancelLabel="Keep template"
            tone="danger"
            isLoading={deleteTemplateMutation.isPending}
            onCancel={() => {
              if (!deleteTemplateMutation.isPending)
                setTemplateToDeleteId(null);
            }}
            onConfirm={() => void confirmDeleteTemplate()}
          />
        </main>
      </div>
    </div>
  );
}
