import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Calendar,
  CalendarPlus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserX,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirm-modal';
import Spinner from '@/components/ui/spinner';
import {
  formatDate,
  formatSlotTimeShort,
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
const DAY_IN_MS = 86_400_000;
const WEEK_IN_MS = DAYS_PER_WEEK * DAY_IN_MS;

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T00:00:00`);

const getStartOfWeekMonday = (baseDate: Date): Date => {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date;
};

const getWeekOffsetFromDateKey = (dateKey: string): number => {
  const currentWeekStart = getStartOfWeekMonday(new Date());
  const targetWeekStart = getStartOfWeekMonday(parseDateKey(dateKey));
  return Math.round(
    (targetWeekStart.getTime() - currentWeekStart.getTime()) / WEEK_IN_MS
  );
};

const dayOptions = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

type WorkspaceTab = 'slots' | 'templates' | 'generate';

const workspaceTabs: {
  id: WorkspaceTab;
  title: string;
  description: string;
}[] = [
  {
    id: 'slots',
    title: 'Daily slots',
    description: 'Track and update slot status by day.',
  },
  {
    id: 'templates',
    title: 'Template setup',
    description: 'Create and manage recurring schedule templates.',
  },
  {
    id: 'generate',
    title: 'Generate schedule',
    description: 'Create slots from a template by date range.',
  },
];

const statusStyles: Record<string, string> = {
  Available:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Reserved:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Booked: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Blocked: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Completed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  NoShow:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Expired:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
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
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('slots');

  const weekWindow = useMemo(() => {
    const weekStart = getStartOfWeekMonday(new Date());
    weekStart.setDate(weekStart.getDate() + currentWeekOffset * DAYS_PER_WEEK);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + DAYS_PER_WEEK - 1);

    const days = Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);

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
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });

    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [slots]);

  const daySlots = slotsByDate[selectedDate] ?? [];

  const weekDaySummaries = weekWindow.days.map((day) => {
    const items = slotsByDate[day.dateKey] ?? [];
    return {
      ...day,
      total: items.length,
      booked: items.filter((slot) => slot.status === 'Booked').length,
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
    const inCurrentWeek = weekWindow.days.some(
      (day) => day.dateKey === selectedDate
    );

    if (!inCurrentWeek && weekWindow.days[0]) {
      setSelectedDate(weekWindow.days[0].dateKey);
    }
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

  const handleGoToday = () => {
    setCurrentWeekOffset(0);
    setSelectedDate(todayKey);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar />
      <div className="h-full flex-1 overflow-y-auto">
        <OrganisationHeader pageName="Slot Management" />

        <main className="space-y-6 p-6">
          {!organisationId && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Tài khoản chưa có organisationId, chưa thể quản lý lịch tổ chức.
            </div>
          )}

          <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Slot management workspace
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Focus each step separately to reduce clutter and speed up daily
              operations.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
              {workspaceTabs.map((tab) => {
                const isActive = tab.id === activeWorkspace;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveWorkspace(tab.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-600 dark:bg-cyan-900/20'
                        : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/70 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:hover:border-cyan-700/60 dark:hover:bg-cyan-900/10'
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        isActive
                          ? 'text-cyan-700 dark:text-cyan-300'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {tab.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {tab.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {activeWorkspace === 'slots' ? (
            <>
              <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-gray-200 dark:hover:bg-[#1f3c60]"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev week
                  </button>
                  <p className="min-w-[180px] flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {weekWindow.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-gray-200 dark:hover:bg-[#1f3c60]"
                  >
                    Next week <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToday}
                    className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/40"
                  >
                    Today
                  </button>
                  <label className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-300">
                    Jump date
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => handleDateSelect(event.target.value)}
                      className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-white"
                    />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                  {weekDaySummaries.map((day) => {
                    const isSelected = day.dateKey === selectedDate;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => setSelectedDate(day.dateKey)}
                        className={`rounded-xl border px-3 py-2 text-left transition-all ${
                          isSelected
                            ? 'border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-600 dark:bg-cyan-900/20'
                            : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/70 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:hover:border-cyan-700/60 dark:hover:bg-cyan-900/10'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {day.dayLabel}
                        </p>
                        <p
                          className={`mt-1 text-lg font-semibold ${
                            isSelected
                              ? 'text-cyan-700 dark:text-cyan-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {day.dayNumber}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {day.total} slots
                        </p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300">
                          {day.booked} booked
                        </p>
                        {day.isToday ? (
                          <span className="mt-1 inline-flex rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                            Today
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Slots (Week)
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Available
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.available}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Booked
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {stats.booked}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Blocked
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-700 dark:text-slate-200">
                    {stats.blocked}
                  </p>
                </div>
              </div>

              <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Slots by Date
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {formatDate(selectedDate, 'long')}
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Spinner /> Loading slots...
                  </div>
                ) : daySlots.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No slots on this day. Pick another day from the weekly strip
                    above or switch to Generate Schedule.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-[#2d4a6f] dark:text-gray-300">
                          <th className="px-3 py-2 font-medium">Time</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Booked</th>
                          <th className="px-3 py-2 font-medium">Capacity</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySlots.map((slot) => (
                          <tr
                            key={slot.id}
                            className="border-b border-gray-100 dark:border-[#2d4a6f]"
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatSlotTimeShort(slot.startTime)}-
                                {formatSlotTimeShort(slot.endTime)}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[slot.status] ?? statusStyles.Available}`}
                              >
                                {slot.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">{slot.bookedCount}</td>
                            <td className="px-3 py-2">{slot.maxCapacity}</td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateSlotStatus(slot.id, 7)
                                  }
                                  disabled={
                                    slot.status === 'Blocked' ||
                                    updateSlotStatusMutation.isPending
                                  }
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                  <Ban className="h-3.5 w-3.5" /> Block
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateSlotStatus(slot.id, 1)
                                  }
                                  disabled={
                                    slot.status !== 'Blocked' ||
                                    updateSlotStatusMutation.isPending
                                  }
                                  className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />{' '}
                                  Unblock
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateSlotStatus(slot.id, 4)
                                  }
                                  disabled={updateSlotStatusMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-md border border-cyan-300 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
                                >
                                  <Calendar className="h-3.5 w-3.5" /> Complete
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateSlotStatus(slot.id, 5)
                                  }
                                  disabled={updateSlotStatusMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                                >
                                  <UserX className="h-3.5 w-3.5" /> No-show
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : null}

          {activeWorkspace === 'templates' ? (
            <>
              <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <CalendarPlus className="h-5 w-5" />
                  Create Template
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Day of week
                    <select
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    >
                      {dayOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Slot duration (minutes)
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Start time
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    End time
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                    Max capacity
                    <input
                      type="number"
                      min={1}
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreateTemplate()}
                  disabled={createTemplateMutation.isPending || !organisationId}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  {createTemplateMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  Create template
                </button>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Templates
                </h2>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Spinner /> Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No templates yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-[#2d4a6f] dark:text-gray-300">
                          <th className="px-3 py-2 font-medium">Day</th>
                          <th className="px-3 py-2 font-medium">Time</th>
                          <th className="px-3 py-2 font-medium">Duration</th>
                          <th className="px-3 py-2 font-medium">Capacity</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templates.map((template) => (
                          <tr
                            key={template.id}
                            className="border-b border-gray-100 dark:border-[#2d4a6f]"
                          >
                            <td className="px-3 py-2">{template.dayOfWeek}</td>
                            <td className="px-3 py-2">
                              {formatSlotTimeShort(template.startTime)}-
                              {formatSlotTimeShort(template.endTime)}
                            </td>
                            <td className="px-3 py-2">
                              {template.slotDuration}m
                            </td>
                            <td className="px-3 py-2">
                              {template.maxCapacity}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setTemplateToDeleteId(template.id)
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                              >
                                <Ban className="h-3.5 w-3.5" /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : null}

          {activeWorkspace === 'generate' ? (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Calendar className="h-5 w-5" />
                  Generate slots
                </h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  Choose a template and date range to create clinic slots in
                  batch.
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                    Template
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.dayOfWeek}{' '}
                          {formatSlotTimeShort(template.startTime)}-
                          {formatSlotTimeShort(template.endTime)} (cap{' '}
                          {template.maxCapacity})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    From date
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    To date
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
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
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-[#17324f] dark:text-slate-200 dark:hover:bg-[#1f3c60]"
                  >
                    Use current week ({weekWindow.label})
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleGenerateSlots()}
                    disabled={
                      generateSlotsMutation.isPending || !organisationId
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
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

              <aside className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Quick template picker
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  Select one template quickly, then run generation.
                </p>

                {templatesLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Spinner /> Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    No template found. Switch to Template Setup first.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {templates.map((template) => {
                      const isSelected = templateId === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setTemplateId(template.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                            isSelected
                              ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-900/20 dark:text-violet-300'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-violet-200 hover:bg-violet-50/70 dark:border-[#2d4a6f] dark:bg-[#17324f] dark:text-gray-200 dark:hover:border-violet-700/60 dark:hover:bg-violet-900/10'
                          }`}
                        >
                          <p className="font-semibold">{template.dayOfWeek}</p>
                          <p className="text-xs opacity-85">
                            {formatSlotTimeShort(template.startTime)}-
                            {formatSlotTimeShort(template.endTime)} |{' '}
                            {template.slotDuration}m | cap{' '}
                            {template.maxCapacity}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </aside>
            </section>
          ) : null}

          <ConfirmModal
            open={!!templateToDeleteId}
            title="Delete template"
            message="This template will be removed permanently. Existing generated slots are not deleted."
            confirmLabel="Delete template"
            cancelLabel="Keep template"
            tone="danger"
            isLoading={deleteTemplateMutation.isPending}
            onCancel={() => {
              if (!deleteTemplateMutation.isPending) {
                setTemplateToDeleteId(null);
              }
            }}
            onConfirm={() => void confirmDeleteTemplate()}
          />
        </main>
      </div>
    </div>
  );
}
