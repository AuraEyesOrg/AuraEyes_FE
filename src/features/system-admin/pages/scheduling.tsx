import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  Info,
  Zap,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSameDay,
} from 'date-fns';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import schedulingApi from '../api/scheduling.api';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { extractApiErrorMessage } from '@/lib/api-error';
import Spinner from '@/components/ui/spinner';

import { ophthalmologistApi } from '../api/ophthalmologist.api';
import { ScheduleTemplateDto, DAY_OF_WEEK_LABELS } from '@/types/schedule';

type Tab = 'appointments' | 'templates';

export default function SystemAdminScheduling() {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ScheduleTemplateDto | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [filterOphthalId, setFilterOphthalId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // --- Queries ---
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['system-admin', 'schedule-templates'],
    queryFn: () => schedulingApi.getTemplates({ pageSize: 100 }),
  });

  const { data: doctorsData } = useQuery({
    queryKey: ['system-admin', 'ophthalmologists-list'],
    queryFn: () => ophthalmologistApi.getOphthalmologists(1, 100),
  });
  const doctors = doctorsData?.items ?? [];

  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: [
      'system-admin',
      'appointment-slots',
      format(selectedDate, 'yyyy-MM-dd'),
      filterOphthalId,
      filterStatus,
    ],
    queryFn: () =>
      schedulingApi.getSlots({
        fromDate: format(selectedDate, 'yyyy-MM-dd'),
        toDate: format(selectedDate, 'yyyy-MM-dd'),
        pageSize: 100,
        ophthalId: filterOphthalId || undefined,
      }),
  });

  // --- Mutations ---
  const triggerGenerationMutation = useMutation({
    mutationFn: schedulingApi.triggerGeneration,
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.scheduling.toasts.triggerSuccess',
          'Slot generation job triggered successfully.'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'appointment-slots'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.scheduling.toasts.triggerError',
            'Failed to trigger job.'
          )
        )
      );
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: schedulingApi.deleteTemplate,
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.scheduling.toasts.deleteSuccess',
          'Template deleted successfully.'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'schedule-templates'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.scheduling.toasts.deleteError',
            'Failed to delete template.'
          )
        )
      );
    },
  });

  const toggleTemplateStatusMutation = useMutation({
    mutationFn: ({
      templateId,
      isActive,
      template,
    }: {
      templateId: string;
      isActive: boolean;
      template: ScheduleTemplateDto;
    }) => {
      const getDayNumber = (day: string | number): number => {
        if (typeof day === 'number') return day;
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const index = days.indexOf(day);
        return index !== -1 ? index : 1;
      };

      return schedulingApi.updateTemplate(templateId, {
        dayOfWeek: getDayNumber(template.dayOfWeek),
        startTime: template.startTime,
        endTime: template.endTime,
        slotDuration: Number(template.slotDuration),
        maxCapacity: Number(template.maxCapacity),
        isActive: isActive,
      });
    },
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.scheduling.toasts.statusUpdateSuccess',
          'Template status updated successfully.'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'schedule-templates'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.scheduling.toasts.statusUpdateError',
            'Failed to update template status.'
          )
        )
      );
    },
  });

  const templates = templatesData?.data?.items ?? [];
  // We no longer pre-filter by status here. We only filter by OphthalId (which is already done by API, but we can double check).
  // Status filtering will be applied AFTER grouping.
  const slots = slotsData?.data?.items ?? [];

  // Group slots by time, compute group status, then apply filterStatus
  const groupedAndFilteredSlots = useMemo(() => {
    // 1. Group by time
    const groupsMap = slots.reduce(
      (acc, slot) => {
        const timeKey = `${slot.startTime}-${slot.endTime}`;
        if (!acc[timeKey]) {
          acc[timeKey] = {
            id: timeKey,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slots: [],
            totalCapacity: 0,
            totalBooked: 0,
            isPast: false,
          };
        }
        acc[timeKey].slots.push(slot);
        acc[timeKey].totalCapacity += slot.maxCapacity;
        acc[timeKey].totalBooked += slot.bookedCount;

        // Determine if the slot time has already passed
        const now = new Date();
        const slotDateStr = `${slot.date}T${slot.startTime}`;
        const slotDateTime = new Date(slotDateStr);
        if (slotDateTime < now) acc[timeKey].isPast = true;

        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          startTime: string;
          endTime: string;
          slots: typeof slots;
          totalCapacity: number;
          totalBooked: number;
          isPast: boolean;
        }
      >
    );

    // 2. Filter groups by status
    const groupsArray = Object.values(groupsMap).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    return groupsArray.filter((group) => {
      if (!filterStatus) return true;

      const isFullyBooked = group.totalBooked >= group.totalCapacity;
      const hasBookings = group.totalBooked > 0;
      // If ANY slot in the group is blocked, we can consider the group blocked, or we can just check if all are blocked.
      // Usually, if we want to filter by blocked, we check if the group is fully blocked, or has blocked slots.
      // For simplicity, let's say a group is blocked if totalBooked == 0 and capacity == 0, or all slots are blocked.
      const isBlocked = group.slots.every((s) => s.status === 'Blocked');

      let computedStatus = 'Available';
      if (group.isPast) {
        computedStatus = hasBookings ? 'Attended' : 'Expired';
      } else if (isBlocked) {
        computedStatus = 'Blocked';
      } else if (isFullyBooked) {
        computedStatus = 'Full';
      } else if (hasBookings) {
        computedStatus = 'Partial';
      }

      return computedStatus === filterStatus;
    });
  }, [slots, filterStatus]);
  const sortedTemplates = useMemo(() => {
    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return [...templates].sort((a, b) => {
      // First sort by Active status (Active first, Inactive last)
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }

      const getDayIndex = (day: string | number) => {
        if (typeof day === 'number') return day === 0 ? 7 : day;
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const idx = days.indexOf(day as string);
        return idx === 0 ? 7 : idx === -1 ? 99 : idx;
      };

      const indexA = getDayIndex(a.dayOfWeek);
      const indexB = getDayIndex(b.dayOfWeek);
      if (indexA !== indexB) return indexA - indexB;
      // If same day, sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  }, [templates]);

  // Week Calendar Logic
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // If selecting a date outside current week view, update week view
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    if (!isSameDay(weekStart, currentWeekStart)) {
      setCurrentWeekStart(weekStart);
    }
  };

  const handleSetToday = () => {
    handleSelectDate(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      handleSelectDate(new Date(e.target.value));
    }
  };

  // Summary Metrics based on slots
  const metrics = useMemo(() => {
    const now = new Date();
    const stats = {
      total: slots.length,
      attended: 0,
      expired: 0,
      full: 0,
      partial: 0,
      available: 0,
      blocked: 0,
      totalBookings: 0,
    };

    slots.forEach((slot) => {
      const slotDateStr = `${slot.date}T${slot.startTime}`;
      const slotDateTime = new Date(slotDateStr);
      const isPast = slotDateTime < now;
      const isBlocked = slot.status === 'Blocked';
      const isFullyBooked = slot.bookedCount >= slot.maxCapacity;
      const hasBookings = slot.bookedCount > 0;

      stats.totalBookings += slot.bookedCount;

      if (isPast) {
        if (hasBookings) stats.attended++;
        else stats.expired++;
      } else {
        if (isBlocked) stats.blocked++;
        else if (isFullyBooked) stats.full++;
        else if (hasBookings) stats.partial++;
        else stats.available++;
      }
    });

    return stats;
  }, [slots]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t('SystemAdmin.scheduling.page.title', 'Clinic Scheduling')}
          description={t(
            'SystemAdmin.scheduling.page.description',
            'Manage appointments and clinic availability.'
          )}
          actions={
            activeTab === 'templates' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerGenerationMutation.mutate()}
                  disabled={triggerGenerationMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {triggerGenerationMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {t(
                    'SystemAdmin.scheduling.actions.trigger',
                    'Trigger Generation'
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditTemplate(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  {t(
                    'SystemAdmin.scheduling.actions.addTemplate',
                    'Add Template'
                  )}
                </button>
              </div>
            )
          }
        />

        {/* Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'appointments'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t(
                'SystemAdmin.scheduling.tabs.appointments',
                'Daily Appointments'
              )}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'templates'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t('SystemAdmin.scheduling.tabs.templates', 'Schedule Templates')}
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-hidden flex">
          {activeTab === 'appointments' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar for Daily View */}
              <div className="w-[320px] bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/50 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                {/* Week Calendar */}
                <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={handlePrevWeek}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {format(currentWeekStart, 'MMM d')} -{' '}
                      {format(
                        endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
                        'MMM d, yyyy'
                      )}
                    </span>
                    <button
                      onClick={handleNextWeek}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 mb-6">
                    {weekDays.map((date) => {
                      const isSelected = isSameDay(date, selectedDate);
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleSelectDate(date)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-lg ${isSelected ? 'font-bold' : ''}`}
                            >
                              {format(date, 'd')}
                            </span>
                            <span className="text-xs">
                              {format(date, 'EEE')}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSetToday}
                    className="w-full py-2.5 rounded-xl border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 font-bold text-sm bg-cyan-50/50 dark:bg-cyan-900/10 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                  >
                    {t('SystemAdmin.scheduling.daily.today', 'Today')}
                  </button>

                  <div className="mt-4">
                    <div className="relative">
                      <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={handleDateInputChange}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all cursor-pointer"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm shadow-slate-200/20 dark:shadow-none">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                    {t(
                      'SystemAdmin.scheduling.daily.summary',
                      '{{date}} Summary',
                      { date: format(selectedDate, 'EEE, MMM d') }
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        {t(
                          'SystemAdmin.scheduling.daily.totalSlots',
                          'Total Slots'
                        )}
                      </p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {metrics.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        {t('SystemAdmin.scheduling.daily.bookings', 'Bookings')}
                      </p>
                      <p className="text-xl font-bold text-blue-500">
                        {metrics.totalBookings}
                      </p>
                    </div>
                    <div className="col-span-2 border-t border-slate-50 dark:border-slate-800/50 my-1 pt-4 grid grid-cols-2 gap-y-4 gap-x-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          {t(
                            'SystemAdmin.scheduling.daily.available',
                            'Available'
                          )}
                        </p>
                        <p className="text-lg font-bold text-emerald-500">
                          {metrics.available}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          {t(
                            'SystemAdmin.scheduling.daily.fullPartial',
                            'Full/Partial'
                          )}
                        </p>
                        <p className="text-lg font-bold text-orange-500">
                          {metrics.full + metrics.partial}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          {t(
                            'SystemAdmin.scheduling.daily.attended',
                            'Attended'
                          )}
                        </p>
                        <p className="text-lg font-bold text-blue-400">
                          {metrics.attended}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          {t('SystemAdmin.scheduling.daily.expired', 'Expired')}
                        </p>
                        <p className="text-lg font-bold text-slate-400">
                          {metrics.expired}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content for Daily View */}
              <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="flex items-center gap-4">
                    <select
                      value={filterOphthalId}
                      onChange={(e) => setFilterOphthalId(e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">
                        {t(
                          'SystemAdmin.scheduling.filters.allDoctors',
                          'All Doctors'
                        )}
                      </option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">
                        {t(
                          'SystemAdmin.scheduling.filters.allStatuses',
                          'All Statuses'
                        )}
                      </option>
                      <option value="Available">
                        {t(
                          'SystemAdmin.scheduling.status.available',
                          'Available'
                        )}
                      </option>
                      <option value="Partial">
                        {t(
                          'SystemAdmin.scheduling.status.partial',
                          'Partial Booked'
                        )}
                      </option>
                      <option value="Full">
                        {t(
                          'SystemAdmin.scheduling.status.full',
                          'Fully Booked'
                        )}
                      </option>
                      <option value="Blocked">
                        {t('SystemAdmin.scheduling.status.blocked', 'Blocked')}
                      </option>
                      <option value="Attended">
                        {t(
                          'SystemAdmin.scheduling.status.attended',
                          'Attended (Past)'
                        )}
                      </option>
                      <option value="Expired">
                        {t(
                          'SystemAdmin.scheduling.status.expired',
                          'Expired (Past)'
                        )}
                      </option>
                    </select>

                    <span className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
                      {groupedAndFilteredSlots.reduce(
                        (acc, g) => acc + g.slots.length,
                        0
                      )}{' '}
                      {t('SystemAdmin.scheduling.records', 'records')}
                    </span>
                  </div>
                </div>

                {isLoadingSlots ? (
                  <div className="flex items-center justify-center h-64">
                    <Spinner size={40} />
                  </div>
                ) : groupedAndFilteredSlots.length === 0 ? (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex items-center justify-center bg-white/50 dark:bg-slate-900/30">
                    <p className="text-slate-400 dark:text-slate-500 font-medium">
                      {t(
                        'SystemAdmin.scheduling.daily.empty',
                        'No appointments on this day.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Aggregated Slots Logic */}
                    {groupedAndFilteredSlots.map((group) => {
                      const isFullyBooked =
                        group.totalBooked >= group.totalCapacity;
                      const hasBookings = group.totalBooked > 0;

                      let statusLabel: string;
                      let statusClass =
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
                      let cardClass =
                        'border-emerald-100 dark:border-emerald-900/30';

                      if (group.isPast) {
                        statusLabel = hasBookings
                          ? t(
                              'SystemAdmin.scheduling.status.attended',
                              'Attended'
                            )
                          : t(
                              'SystemAdmin.scheduling.status.expired',
                              'Expired'
                            );
                        statusClass =
                          'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
                        cardClass =
                          'border-slate-100 dark:border-slate-800 opacity-75';
                      } else if (isFullyBooked) {
                        statusLabel = t(
                          'SystemAdmin.scheduling.status.full',
                          'Fully Booked'
                        );
                        statusClass =
                          'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
                        cardClass =
                          'border-orange-100 dark:border-orange-900/30';
                      } else if (hasBookings) {
                        statusLabel = t(
                          'SystemAdmin.scheduling.status.partial',
                          'Partial Booked'
                        );
                        statusClass =
                          'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
                        cardClass = 'border-amber-100 dark:border-amber-900/30';
                      } else {
                        statusLabel = t(
                          'SystemAdmin.scheduling.status.available',
                          'Available'
                        );
                      }

                      return (
                        <div
                          key={`${group.startTime}-${group.endTime}`}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all ${cardClass}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                                <Clock className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {group.startTime.substring(0, 5)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">
                                  {group.startTime.substring(0, 5)} -{' '}
                                  {group.endTime.substring(0, 5)}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}
                                  >
                                    {statusLabel}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-500">
                                    {group.totalBooked} / {group.totalCapacity}{' '}
                                    {t(
                                      'SystemAdmin.scheduling.daily.booked',
                                      'Booked'
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Doctor Specific Slots inside the group */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            {group.slots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`p-3 rounded-2xl border ${slot.bookedCount > 0 ? 'bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-slate-50/30 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800'} flex flex-col gap-3`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                                      {slot.ophthalFullName
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .substring(0, 2) ||
                                        t(
                                          'SystemAdmin.scheduling.doctorInitials',
                                          'Dr'
                                        )}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                        {slot.ophthalFullName ||
                                          t(
                                            'SystemAdmin.scheduling.clinicSlot',
                                            'Clinic Slot'
                                          )}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        {slot.bookedCount}/{slot.maxCapacity}{' '}
                                        {t(
                                          'SystemAdmin.scheduling.daily.booked',
                                          'Booked'
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  {slot.status === 'Blocked' && (
                                    <span className="text-[8px] font-bold uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                      {t(
                                        'SystemAdmin.scheduling.status.blocked',
                                        'Blocked'
                                      )}
                                    </span>
                                  )}
                                </div>

                                {slot.bookings && slot.bookings.length > 0 && (
                                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-2 space-y-1.5">
                                    {slot.bookings.map((b) => (
                                      <div
                                        key={b.appointmentId}
                                        className="flex flex-col gap-0.5 bg-white/50 dark:bg-slate-800/50 rounded-lg p-2"
                                      >
                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                                          {b.patientName}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold uppercase tracking-wider ${b.status === 'Cancelled' || b.status === 'CancellationRequested' ? 'text-red-500' : 'text-blue-500'}`}
                                        >
                                          {b.status === 'Cancelled' ||
                                          b.status === 'CancellationRequested'
                                            ? t(
                                                'SystemAdmin.appointments.status.cancelled',
                                                'Cancelled'
                                              )
                                            : t(
                                                'SystemAdmin.appointments.status.confirmed',
                                                'Confirmed'
                                              )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-8">
              {/* Info Card */}
              <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 rounded-2xl p-6 flex gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {t(
                      'SystemAdmin.scheduling.info.title',
                      'Automatic Slot Generation'
                    )}
                  </h4>
                  <p className="text-primary-700 dark:text-primary-300 mt-1">
                    {t(
                      'SystemAdmin.scheduling.info.description',
                      'The system automatically generates slots every night based on these templates. Use "Trigger Generation" to manually fill missing slots for the next 14 days.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  {t(
                    'SystemAdmin.scheduling.templates.title',
                    'Recurring Templates'
                  )}
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500">
                  {templates.length}{' '}
                  {t('SystemAdmin.scheduling.templates.count', 'templates')}
                </span>
              </div>

              {isLoadingTemplates ? (
                <div className="h-64 flex items-center justify-center">
                  <Spinner size={40} />
                </div>
              ) : templates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {t(
                      'SystemAdmin.scheduling.templates.empty',
                      'No recurring templates defined yet.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedTemplates.map((template) => {
                    const dayString =
                      typeof template.dayOfWeek === 'string'
                        ? template.dayOfWeek
                        : DAY_OF_WEEK_LABELS[template.dayOfWeek as number] ||
                          String(template.dayOfWeek);

                    return (
                      <div
                        key={template.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group ${
                          !template.isActive ? 'opacity-70 grayscale-[0.3]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                              {dayString.substring(0, 3)}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 dark:text-white">
                                {dayString}
                              </h5>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {template.startTime.substring(0, 5)} -{' '}
                                {template.endTime.substring(0, 5)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() =>
                                toggleTemplateStatusMutation.mutate({
                                  templateId: template.id,
                                  isActive: !template.isActive,
                                  template,
                                })
                              }
                              title={
                                template.isActive
                                  ? t(
                                      'SystemAdmin.scheduling.actions.deactivate',
                                      'Deactivate'
                                    )
                                  : t(
                                      'SystemAdmin.scheduling.actions.activate',
                                      'Activate'
                                    )
                              }
                              className={`p-2 rounded-lg transition-all ${
                                template.isActive
                                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {template.isActive ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditTemplate(template);
                                setIsModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteTemplateMutation.mutate(template.id)
                              }
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Status indicator badge */}
                        <div className="mb-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              template.isActive
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            {template.isActive
                              ? t(
                                  'SystemAdmin.scheduling.states.active',
                                  'Active'
                                )
                              : t(
                                  'SystemAdmin.scheduling.states.inactive',
                                  'Inactive'
                                )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                              {t(
                                'SystemAdmin.scheduling.templates.duration',
                                'Slot Duration'
                              )}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {template.slotDuration}{' '}
                              {t(
                                'SystemAdmin.scheduling.templates.minutes',
                                'min'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                              {t(
                                'SystemAdmin.scheduling.templates.capacityMode',
                                'Capacity Mode'
                              )}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {t(
                                'SystemAdmin.scheduling.templates.dynamic',
                                'Dynamic (By Doctor)'
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                            />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {template.isActive
                                ? t(
                                    'SystemAdmin.scheduling.states.active',
                                    'Active'
                                  )
                                : t(
                                    'SystemAdmin.scheduling.states.inactive',
                                    'Inactive'
                                  )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <CreateTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTemplate(null);
        }}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: ['system-admin', 'schedule-templates'],
          })
        }
        editTemplate={editTemplate}
      />
    </div>
  );
}
