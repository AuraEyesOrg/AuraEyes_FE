import { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { DoctorSidebar, DoctorHeader } from '../components';
import useAuthStore from '@/store/auth-store';
import { getItem } from '@/lib/local-storage';
import { extractApiErrorMessage } from '@/lib/api-error';
import {
  formatSlotTime,
  toLocalDateKey,
  formatWeekRange,
  formatWeekDayLabel,
} from '@/lib/date-utils';
import {
  useSchedules,
  useCreateSchedule,
  useUpdateScheduleStatus,
} from '@/features/consultation/hooks';
import {
  ScheduleStatus,
  SlotType,
  SCHEDULE_STATUS_LABELS,
  SLOT_TYPE_LABELS,
} from '@/types/schedule';
import type { ScheduleListDto, CreateScheduleRequest } from '@/types/schedule';
import { useTranslation } from 'react-i18next';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';

// Fallback value for local development if auth user does not include profile id.
const CURRENT_DOCTOR_ID = 'a2f30076-6cb8-432a-b920-687c90dd0af0';

type FilterTab = 'all' | 'available' | 'booked' | 'past';

const slotTypeColors: Record<SlotType, string> = {
  [SlotType.Consultation]:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  [SlotType.FollowUp]:
    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  [SlotType.Screening]:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  [SlotType.Emergency]:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const statusColors: Record<ScheduleStatus, string> = {
  [ScheduleStatus.Available]:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  [ScheduleStatus.Booked]:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  [ScheduleStatus.Cancelled]:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  [ScheduleStatus.Completed]:
    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  [ScheduleStatus.NoShow]:
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  [ScheduleStatus.Reserved]:
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  [ScheduleStatus.Blocked]:
    'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500',
  [ScheduleStatus.Expired]:
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

export default function SchedulesPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Form state for creating schedules
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('09:30');
  const [formSlotType, setFormSlotType] = useState<SlotType>(
    SlotType.Consultation
  );
  const [formCost, setFormCost] = useState('');

  const doctorId = useMemo(() => {
    if (user?.roleId) return user.roleId;

    const token = getItem<string>('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(window.atob(normalized)) as {
          profile_id?: string;
        };
        if (decoded.profile_id) return decoded.profile_id;
      } catch {
        // Ignore parsing failures and fall through to fallback id.
      }
    }

    return CURRENT_DOCTOR_ID;
  }, [user?.roleId]);

  // Calculate week range
  const weekRange = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + 1 + currentWeekOffset * 7
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      from: toLocalDateKey(startOfWeek),
      to: toLocalDateKey(endOfWeek),
      label: formatWeekRange(startOfWeek, endOfWeek),
    };
  }, [currentWeekOffset]);

  const { data: schedulesData, isLoading } = useSchedules({
    ophthalmologistId: doctorId,
    fromDate: weekRange.from,
    toDate: weekRange.to,
    pageSize: 100,
  });

  const createMutation = useCreateSchedule();
  const updateStatusMutation = useUpdateScheduleStatus();

  const schedules = schedulesData?.items ?? [];

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s: ScheduleListDto) => {
      if (filter === 'all') return true;
      if (filter === 'available') return s.status === ScheduleStatus.Available;
      if (filter === 'booked') return s.status === ScheduleStatus.Booked;
      if (filter === 'past')
        return (
          s.status === ScheduleStatus.Completed ||
          s.status === ScheduleStatus.NoShow
        );
      return true;
    });
  }, [schedules, filter]);

  // Group schedules by date for the calendar view
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, ScheduleListDto[]> = {};
    filteredSchedules.forEach((s: ScheduleListDto) => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    // Sort each day's slots by startTime
    Object.values(grouped).forEach((slots) =>
      slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [filteredSchedules]);

  const weekDays = useMemo(() => {
    const days: {
      date: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
    }[] = [];
    const startDate = new Date(weekRange.from + 'T00:00:00');
    const today = toLocalDateKey(new Date());
    const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US' };
    const dateLocale = localeMap[i18n.language] || 'en-US';
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = toLocalDateKey(d);
      days.push({
        date: dateStr,
        dayName: formatWeekDayLabel(d, dateLocale),
        dayNum: d.getDate(),
        isToday: dateStr === today,
      });
    }
    return days;
  }, [weekRange, i18n.language]);

  const availableCount = schedules.filter(
    (s: ScheduleListDto) => s.status === ScheduleStatus.Available
  ).length;
  const bookedCount = schedules.filter(
    (s: ScheduleListDto) => s.status === ScheduleStatus.Booked
  ).length;

  const handleCreateSchedule = useCallback(() => {
    if (!formDate || !formStartTime || !formEndTime) {
      toast.error(
        t(
          'Ophthalmologist.schedules.validation.missingDateTime',
          'Please select date and time range.'
        )
      );
      return;
    }

    // Build full datetime strings for validation
    const startDateTimeStr = `${formDate}T${formStartTime}:00`;
    const endDateTimeStr = `${formDate}T${formEndTime}:00`;

    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    // Ensure both dates are valid and end is strictly after start
    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime()) ||
      endDateTime <= startDateTime
    ) {
      toast.error(
        t(
          'Ophthalmologist.schedules.validation.invalidRange',
          'End time must be after start time.'
        )
      );
      return;
    }

    let parsedCost: number | undefined;
    if (formCost !== '') {
      const numericCost = Number(formCost);
      if (!Number.isFinite(numericCost) || numericCost < 0) {
        toast.error(
          t(
            'Ophthalmologist.schedules.validation.invalidCost',
            'Cost must be a non-negative number.'
          )
        );
        return;
      }
      parsedCost = numericCost;
    }

    const request: CreateScheduleRequest = {
      date: formDate,
      startTime: `${formStartTime}:00`,
      endTime: `${formEndTime}:00`,
      slotType: formSlotType,
      cost: parsedCost,
    };

    createMutation.mutate(
      { ...request, ophthalmologistId: doctorId },
      {
        onSuccess: () => {
          toast.success(
            t(
              'Ophthalmologist.schedules.toast.createSuccess',
              'Time slot created successfully.'
            )
          );
          setShowCreateModal(false);
          setFormDate('');
          setFormStartTime('09:00');
          setFormEndTime('09:30');
          setFormSlotType(SlotType.Consultation);
          setFormCost('');
        },
        onError: (error) => {
          toast.error(
            extractApiErrorMessage(
              error,
              t(
                'Ophthalmologist.schedules.errorCreateSlot',
                'Failed to create slot. Please try again.'
              )
            )
          );
        },
      }
    );
  }, [
    formDate,
    formStartTime,
    formEndTime,
    formSlotType,
    formCost,
    createMutation,
    doctorId,
    t,
  ]);

  const handleCancelSlot = (scheduleId: string) => {
    updateStatusMutation.mutate(
      {
        ophthalmologistId: doctorId,
        scheduleId,
        newStatus: ScheduleStatus.Cancelled,
      },
      {
        onSuccess: () => {
          toast.success(
            t(
              'Ophthalmologist.schedules.toast.cancelSuccess',
              'Slot cancelled successfully.'
            )
          );
        },
        onError: (error) => {
          toast.error(
            extractApiErrorMessage(
              error,
              t(
                'Ophthalmologist.schedules.toast.cancelError',
                'Failed to cancel slot. Please try again.'
              )
            )
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader
            pageName={t(
              'Ophthalmologist.schedules.title',
              'Schedule Management'
            )}
          />
          <main className="p-6 flex items-center justify-center h-[calc(100vh-220px)]">
            <div className="text-center">
              <Spinner size={40} className="mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('Ophthalmologist.schedules.loading', 'Loading schedules...')}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.schedules.title', 'Schedule Management')}
        />

        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {t('Ophthalmologist.schedules.title', 'Schedule Management')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.schedules.subtitle',
                  'Manage your availability and appointment slots'
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('Ophthalmologist.schedules.addSlot', 'Add Slot')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {schedules.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('Ophthalmologist.schedules.stats.thisWeek', 'This Week')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {availableCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.schedules.stats.available',
                      'Available'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bookedCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('Ophthalmologist.schedules.stats.booked', 'Booked')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      schedules.filter(
                        (s: ScheduleListDto) =>
                          s.status === ScheduleStatus.Cancelled
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.schedules.stats.cancelled',
                      'Cancelled'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Week Navigation + Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentWeekOffset((p) => p - 1)}
                className="p-2 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e3a5f] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[200px] text-center">
                {weekRange.label}
              </span>
              <button
                onClick={() => setCurrentWeekOffset((p) => p + 1)}
                className="p-2 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e3a5f] transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {currentWeekOffset !== 0 && (
                <button
                  onClick={() => setCurrentWeekOffset(0)}
                  className="px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                  {t('Ophthalmologist.schedules.today', 'Today')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {(['all', 'available', 'booked', 'past'] as FilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === tab
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white dark:bg-[#0a1f44] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#1e3a5f] hover:bg-gray-50 dark:hover:bg-[#1e3a5f]'
                    }`}
                  >
                    {t(
                      `Ophthalmologist.schedules.filter.${tab}`,
                      tab.charAt(0).toUpperCase() + tab.slice(1)
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Week Calendar View */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#1e3a5f]">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className={`p-3 text-center border-r last:border-r-0 border-gray-200 dark:border-[#1e3a5f] ${
                    day.isToday
                      ? 'bg-cyan-50 dark:bg-cyan-900/20'
                      : 'bg-gray-50 dark:bg-[#0a1929]/50'
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {day.dayName}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      day.isToday
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {day.dayNum}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day) => {
                const daySlots = schedulesByDate[day.date] ?? [];
                return (
                  <div
                    key={day.date}
                    className={`border-r last:border-r-0 border-gray-200 dark:border-[#1e3a5f] p-2 space-y-2 ${
                      day.isToday ? 'bg-cyan-50/30 dark:bg-cyan-900/10' : ''
                    }`}
                  >
                    {daySlots.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-[80px]">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                          {t('Ophthalmologist.schedules.noSlots', 'No slots')}
                        </p>
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-2 rounded-lg border text-xs ${slotTypeColors[slot.slotType]} group relative`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">
                              {formatSlotTime(slot.startTime)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[slot.status]}`}
                            >
                              {SCHEDULE_STATUS_LABELS[slot.status]}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-80">
                            {formatSlotTime(slot.startTime)} –{' '}
                            {formatSlotTime(slot.endTime)}
                          </p>
                          <p className="text-[11px] font-medium mt-0.5">
                            {SLOT_TYPE_LABELS[slot.slotType]}
                          </p>
                          {slot.cost != null && (
                            <p className="text-[11px] opacity-70 mt-0.5">
                              ${slot.cost.toFixed(2)}
                            </p>
                          )}

                          {/* Actions on hover */}
                          {slot.status === ScheduleStatus.Available && (
                            <button
                              onClick={() => handleCancelSlot(slot.id)}
                              className="absolute top-1 right-1 p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={t(
                                'Ophthalmologist.schedules.cancelSlotTitle',
                                'Cancel slot'
                              )}
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Create Schedule Modal (portal-style, outside scroll container) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('Ophthalmologist.schedules.modal.title', 'Add New Time Slot')}
            </h2>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Ophthalmologist.schedules.modal.date', 'Date')}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t(
                      'Ophthalmologist.schedules.modal.startTime',
                      'Start Time'
                    )}
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Ophthalmologist.schedules.modal.endTime', 'End Time')}
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Slot Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Ophthalmologist.schedules.modal.slotType', 'Slot Type')}
                </label>
                <select
                  value={formSlotType}
                  onChange={(e) =>
                    setFormSlotType(Number(e.target.value) as SlotType)
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {Object.entries(SLOT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.schedules.modal.costOptional',
                    'Cost (optional)'
                  )}
                </label>
                <input
                  type="number"
                  value={formCost}
                  onChange={(e) => setFormCost(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg text-sm font-medium transition-colors"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={
                  !formDate ||
                  !formStartTime ||
                  !formEndTime ||
                  createMutation.isPending
                }
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <Spinner size={16} />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {t('Ophthalmologist.schedules.modal.createSlot', 'Create Slot')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
