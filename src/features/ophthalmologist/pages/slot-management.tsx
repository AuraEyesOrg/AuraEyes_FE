import { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Power,
  PowerOff,
  Sparkles,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { DoctorSidebar, DoctorHeader } from '../components';
import {
  useAppointmentSlots,
  useScheduleTemplates,
  useGenerateSlots,
  useBlockSlot,
  useUnblockSlot,
  useCreateScheduleTemplate,
  useDeleteScheduleTemplate,
} from '@/features/patient/hooks/use-booking';
import {
  SlotType,
  SLOT_TYPE_LABELS,
  DAY_OF_WEEK_LABELS,
} from '@/types/schedule';
import type {
  AppointmentSlotListDto,
  ScheduleTemplateDto,
} from '@/types/schedule';
import useAuthStore from '@/store/auth-store';
import { extractApiErrorMessage } from '@/lib/api-error';
import {
  formatSlotTime,
  toLocalDateKey,
  formatWeekRange,
  formatWeekDayLabel,
} from '@/lib/date-utils';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const formatTemplateCost = (
  cost: number | null | undefined,
  t: (key: string, fallback: string) => string
) => {
  if (typeof cost === 'number' && Number.isFinite(cost) && cost > 0) {
    return `${cost.toLocaleString('vi-VN')} VND`;
  }

  return t('Ophthalmologist.slotManagement.notConfigured', 'Not configured');
};

const getSlotStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Available:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300',
    Reserved:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300',
    Booked:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300',
    Blocked:
      'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-400',
    Completed:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300',
    Cancelled:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300',
    NoShow:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300',
    Expired:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300',
  };
  return colors[status] || colors['Available'];
};

export default function SlotManagementPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const doctorId = useMemo(() => user?.roleId ?? '', [user?.roleId]);

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplateDto | null>(null);

  // Template form state
  const [templateDayOfWeek, setTemplateDayOfWeek] = useState(1);
  const [templateStartTime, setTemplateStartTime] = useState('18:00');
  const [templateEndTime, setTemplateEndTime] = useState('21:00');
  const [templateSlotDuration, setTemplateSlotDuration] = useState(30);
  const [templateSlotType, setTemplateSlotType] = useState<SlotType>(
    SlotType.Consultation
  );
  const [templateCost, setTemplateCost] = useState('200000');

  // Generate form state
  const [generateFromDate, setGenerateFromDate] = useState('');
  const [generateToDate, setGenerateToDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  // Fetch slots
  const { data: slotsData, isLoading: slotsLoading } = useAppointmentSlots({
    ophthalId: doctorId,
    fromDate: weekRange.from,
    toDate: weekRange.to,
    pageSize: 200,
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } =
    useScheduleTemplates(doctorId);

  const generateMutation = useGenerateSlots();
  const blockMutation = useBlockSlot();
  const unblockMutation = useUnblockSlot();
  const createTemplateMutation = useCreateScheduleTemplate();
  const deleteTemplateMutation = useDeleteScheduleTemplate();

  const slots = slotsData?.items ?? [];

  const resetMessages = useCallback(() => {
    setMessage('');
    setError('');
  }, []);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentSlotListDto[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    });
    Object.values(grouped).forEach((daySlots) =>
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [slots]);

  // Week days
  const weekDays = useMemo(() => {
    const days: {
      date: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
    }[] = [];
    const startDate = new Date(weekRange.from + 'T00:00:00');
    const today = toLocalDateKey(new Date());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = toLocalDateKey(d);
      days.push({
        date: dateStr,
        dayName: formatWeekDayLabel(d),
        dayNum: d.getDate(),
        isToday: dateStr === today,
      });
    }
    return days;
  }, [weekRange.from]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: slots.length,
      available: slots.filter((s) => s.status === 'Available').length,
      booked: slots.filter((s) => s.status === 'Booked').length,
      blocked: slots.filter((s) => s.status === 'Blocked').length,
    };
  }, [slots]);

  // Handlers
  const handleBlockSlot = useCallback(
    (slot: AppointmentSlotListDto) => {
      if (!slot.ophthalId || slot.ophthalId !== doctorId) {
        setError(
          t(
            'Ophthalmologist.slotManagement.errors.onlyOwnBlock',
            'You can only block your own slots.'
          )
        );
        return;
      }

      resetMessages();
      blockMutation.mutate(
        {
          slotId: slot.id,
          request: {
            ophthalmologistId: doctorId,
            reason: t(
              'Ophthalmologist.slotManagement.blockReason',
              'Blocked by doctor'
            ),
          },
        },
        {
          onSuccess: () =>
            setMessage(
              t(
                'Ophthalmologist.slotManagement.messages.slotBlocked',
                'Slot blocked.'
              )
            ),
          onError: (err) =>
            setError(
              extractApiErrorMessage(
                err,
                t(
                  'Ophthalmologist.slotManagement.errors.failedBlock',
                  'Failed to block slot.'
                )
              )
            ),
        }
      );
    },
    [doctorId, blockMutation, resetMessages, t]
  );

  const handleUnblockSlot = useCallback(
    (slot: AppointmentSlotListDto) => {
      if (!slot.ophthalId || slot.ophthalId !== doctorId) {
        setError(
          t(
            'Ophthalmologist.slotManagement.errors.onlyOwnUnblock',
            'You can only unblock your own slots.'
          )
        );
        return;
      }

      resetMessages();
      unblockMutation.mutate(
        {
          slotId: slot.id,
          request: { ophthalmologistId: doctorId },
        },
        {
          onSuccess: () =>
            setMessage(
              t(
                'Ophthalmologist.slotManagement.messages.slotUnblocked',
                'Slot unblocked.'
              )
            ),
          onError: (err) =>
            setError(
              extractApiErrorMessage(
                err,
                t(
                  'Ophthalmologist.slotManagement.errors.failedUnblock',
                  'Failed to unblock slot.'
                )
              )
            ),
        }
      );
    },
    [doctorId, unblockMutation, resetMessages, t]
  );

  const handleCreateTemplate = useCallback(() => {
    resetMessages();
    createTemplateMutation.mutate(
      {
        ophthalId: doctorId,
        dayOfWeek: templateDayOfWeek,
        startTime: `${templateStartTime}:00`,
        endTime: `${templateEndTime}:00`,
        slotDuration: templateSlotDuration,
        slotType: templateSlotType,
        cost: parseInt(templateCost) || 0,
        maxCapacity: 1,
      },
      {
        onSuccess: () => {
          setMessage(
            t(
              'Ophthalmologist.slotManagement.messages.templateCreated',
              'Template created successfully.'
            )
          );
          setShowTemplateModal(false);
          // Reset form
          setTemplateDayOfWeek(1);
          setTemplateStartTime('18:00');
          setTemplateEndTime('21:00');
          setTemplateSlotDuration(30);
          setTemplateSlotType(SlotType.Consultation);
          setTemplateCost('200000');
        },
        onError: (err) => {
          setError(
            extractApiErrorMessage(
              err,
              t(
                'Ophthalmologist.slotManagement.errors.failedCreateTemplate',
                'Failed to create schedule template.'
              )
            )
          );
        },
      }
    );
  }, [
    doctorId,
    templateDayOfWeek,
    templateStartTime,
    templateEndTime,
    templateSlotDuration,
    templateSlotType,
    templateCost,
    createTemplateMutation,
    resetMessages,
    t,
  ]);

  const handleGenerateSlots = useCallback(() => {
    if (!selectedTemplate || !generateFromDate || !generateToDate) {
      setError(
        t(
          'Ophthalmologist.slotManagement.errors.missingGenerateInputs',
          'Please choose a template and date range before generating.'
        )
      );
      return;
    }

    resetMessages();

    generateMutation.mutate(
      {
        scheduleTemplateId: selectedTemplate.id,
        fromDate: generateFromDate,
        toDate: generateToDate,
        skipExistingDates: true,
      },
      {
        onSuccess: (count) => {
          setShowGenerateModal(false);
          setSelectedTemplate(null);
          setGenerateFromDate('');
          setGenerateToDate('');
          setMessage(
            `${t('Ophthalmologist.slotManagement.messages.generatedPrefix', 'Generated')} ${count} ${t('Ophthalmologist.slotManagement.messages.generatedSuffix', 'slots.')}`
          );
        },
        onError: (err) => {
          setError(
            extractApiErrorMessage(
              err,
              t(
                'Ophthalmologist.slotManagement.errors.failedGenerate',
                'Failed to generate slots.'
              )
            )
          );
        },
      }
    );
  }, [
    selectedTemplate,
    generateFromDate,
    generateToDate,
    generateMutation,
    resetMessages,
    t,
  ]);

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      if (
        confirm(
          t(
            'Ophthalmologist.slotManagement.confirmDeleteTemplate',
            'Are you sure you want to delete this template?'
          )
        )
      ) {
        resetMessages();
        deleteTemplateMutation.mutate(templateId, {
          onSuccess: () =>
            setMessage(
              t(
                'Ophthalmologist.slotManagement.messages.templateDeleted',
                'Template deleted.'
              )
            ),
          onError: (err) =>
            setError(
              extractApiErrorMessage(
                err,
                t(
                  'Ophthalmologist.slotManagement.errors.failedDeleteTemplate',
                  'Failed to delete template.'
                )
              )
            ),
        });
      }
    },
    [deleteTemplateMutation, resetMessages, t]
  );

  const openGenerateModal = useCallback((template: ScheduleTemplateDto) => {
    setSelectedTemplate(template);
    // Set default dates: next 2 weeks
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() + 1);
    const toDate = new Date(now);
    toDate.setDate(now.getDate() + 14);
    setGenerateFromDate(toLocalDateKey(fromDate));
    setGenerateToDate(toLocalDateKey(toDate));
    setShowGenerateModal(true);
  }, []);

  if (slotsLoading || templatesLoading) {
    return (
      <div className="flex h-screen w-full bg-(--bg-primary)">
        <DoctorSidebar pendingCount={0} />
        <div className="flex-1 h-full overflow-y-auto">
          <DoctorHeader
            pageName={t(
              'Ophthalmologist.slotManagement.title',
              'Appointment Slots'
            )}
          />
          <main className="p-6 flex items-center justify-center h-[calc(100vh-220px)]">
            <div className="text-center">
              <Spinner size={40} className="mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.slotManagement.loading',
                  'Loading slot management...'
                )}
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
          pageName={t(
            'Ophthalmologist.slotManagement.title',
            'Appointment Slots'
          )}
        />

        <main className="p-6">
          {(message || error) && (
            <div className="mb-4 space-y-2">
              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {t('Ophthalmologist.slotManagement.title', 'Appointment Slots')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.slotManagement.subtitle',
                  'Manage your schedule templates and appointment slots'
                )}
              </p>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('Ophthalmologist.slotManagement.newTemplate', 'New Template')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.slotManagement.stats.totalSlots',
                      'Total Slots'
                    )}
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
                    {stats.available}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.slotManagement.stats.available',
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
                    {stats.booked}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('Ophthalmologist.slotManagement.stats.booked', 'Booked')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.blocked}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.slotManagement.stats.blocked',
                      'Blocked'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Templates Section */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t(
                'Ophthalmologist.slotManagement.templates.title',
                'Schedule Templates'
              )}
            </h2>

            {templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-50 dark:bg-[#0d2850] rounded-lg border border-gray-200 dark:border-[#1e3a5f] p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium">
                        {DAY_OF_WEEK_LABELS[template.dayOfWeek]}
                      </span>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatSlotTime(template.startTime)} -{' '}
                        {formatSlotTime(template.endTime)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          {template.slotDuration} min slots
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatTemplateCost(template.cost, t)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openGenerateModal(template)}
                      className="w-full mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t(
                        'Ophthalmologist.slotManagement.templates.generateSlots',
                        'Generate Slots'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    'Ophthalmologist.slotManagement.templates.empty',
                    'No templates yet. Create a template to auto-generate slots.'
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Week Navigation */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0d2850] text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {weekRange.label}
                </span>
              </div>
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0d2850] text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slots Calendar Grid */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#1e3a5f]">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className={`p-4 text-center border-r last:border-r-0 border-gray-200 dark:border-[#1e3a5f] ${
                    day.isToday
                      ? 'bg-cyan-50 dark:bg-cyan-900/20'
                      : 'bg-gray-50 dark:bg-[#0d2850]'
                  }`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {day.dayName}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 ${
                      day.isToday
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {day.dayNum}
                  </div>
                </div>
              ))}
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-7 min-h-100">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className="p-2 border-r last:border-r-0 border-gray-200 dark:border-[#1e3a5f]"
                >
                  {slotsByDate[day.date]?.length ? (
                    <div className="space-y-2">
                      {slotsByDate[day.date].map((slot) => {
                        const canModifySlot =
                          !!slot.ophthalId && slot.ophthalId === doctorId;

                        return (
                          <div
                            key={slot.id}
                            className={`relative px-2 py-2 rounded-lg border text-xs font-medium ${getSlotStatusColor(slot.status)}`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatSlotTime(slot.startTime)}
                            </div>
                            <div className="text-[10px] mt-1 opacity-75 text-center">
                              {slot.status}
                            </div>

                            {/* Block/Unblock Button */}
                            {slot.status === 'Available' && canModifySlot && (
                              <button
                                onClick={() => handleBlockSlot(slot)}
                                className="absolute -top-1 -right-1 p-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow"
                                title={t(
                                  'Ophthalmologist.slotManagement.blockThisSlot',
                                  'Block this slot'
                                )}
                              >
                                <PowerOff className="w-3 h-3" />
                              </button>
                            )}
                            {slot.status === 'Blocked' && canModifySlot && (
                              <button
                                onClick={() => handleUnblockSlot(slot)}
                                className="absolute -top-1 -right-1 p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow"
                                title={t(
                                  'Ophthalmologist.slotManagement.unblockThisSlot',
                                  'Unblock this slot'
                                )}
                              >
                                <Power className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        {t(
                          'Ophthalmologist.slotManagement.noSlots',
                          'No slots'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300" />
              <span className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.slotManagement.legend.available',
                  'Available'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300" />
              <span className="text-gray-600 dark:text-gray-400">
                {t(
                  'Ophthalmologist.slotManagement.legend.reserved',
                  'Reserved'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('Ophthalmologist.slotManagement.legend.booked', 'Booked')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800 border border-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('Ophthalmologist.slotManagement.legend.blocked', 'Blocked')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-300" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('Ophthalmologist.slotManagement.legend.expired', 'Expired')}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t(
                'Ophthalmologist.slotManagement.modal.createTemplateTitle',
                'Create Schedule Template'
              )}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.slotManagement.modal.dayOfWeek',
                    'Day of Week'
                  )}
                </label>
                <select
                  value={templateDayOfWeek}
                  onChange={(e) =>
                    setTemplateDayOfWeek(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <option key={day} value={day}>
                      {DAY_OF_WEEK_LABELS[day]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t(
                      'Ophthalmologist.slotManagement.modal.startTime',
                      'Start Time'
                    )}
                  </label>
                  <input
                    type="time"
                    value={templateStartTime}
                    onChange={(e) => setTemplateStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t(
                      'Ophthalmologist.slotManagement.modal.endTime',
                      'End Time'
                    )}
                  </label>
                  <input
                    type="time"
                    value={templateEndTime}
                    onChange={(e) => setTemplateEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.slotManagement.modal.slotDuration',
                    'Slot Duration (minutes)'
                  )}
                </label>
                <select
                  value={templateSlotDuration}
                  onChange={(e) =>
                    setTemplateSlotDuration(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={15}>
                    15 {t('Ophthalmologist.slotManagement.minutes', 'minutes')}
                  </option>
                  <option value={20}>
                    20 {t('Ophthalmologist.slotManagement.minutes', 'minutes')}
                  </option>
                  <option value={30}>
                    30 {t('Ophthalmologist.slotManagement.minutes', 'minutes')}
                  </option>
                  <option value={45}>
                    45 {t('Ophthalmologist.slotManagement.minutes', 'minutes')}
                  </option>
                  <option value={60}>
                    60 {t('Ophthalmologist.slotManagement.minutes', 'minutes')}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.slotManagement.modal.slotType',
                    'Slot Type'
                  )}
                </label>
                <select
                  value={templateSlotType}
                  onChange={(e) =>
                    setTemplateSlotType(parseInt(e.target.value) as SlotType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {Object.entries(SLOT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.slotManagement.modal.costVnd',
                    'Cost (VND)'
                  )}
                </label>
                <input
                  type="number"
                  value={templateCost}
                  onChange={(e) => setTemplateCost(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={createTemplateMutation.isPending}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {createTemplateMutation.isPending
                  ? t('Ophthalmologist.slotManagement.creating', 'Creating...')
                  : t('Ophthalmologist.slotManagement.create', 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Slots Modal */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t(
                'Ophthalmologist.slotManagement.modal.generateTitle',
                'Generate Appointment Slots'
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t(
                'Ophthalmologist.slotManagement.modal.generateFromTemplatePrefix',
                'Generate slots from'
              )}{' '}
              &ldquo;
              {DAY_OF_WEEK_LABELS[selectedTemplate.dayOfWeek]}&rdquo; template (
              {formatSlotTime(selectedTemplate.startTime)} -{' '}
              {formatSlotTime(selectedTemplate.endTime)})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t(
                    'Ophthalmologist.slotManagement.modal.fromDate',
                    'From Date'
                  )}
                </label>
                <input
                  type="date"
                  value={generateFromDate}
                  onChange={(e) => setGenerateFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Ophthalmologist.slotManagement.modal.toDate', 'To Date')}
                </label>
                <input
                  type="date"
                  value={generateToDate}
                  onChange={(e) => setGenerateToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleGenerateSlots}
                disabled={
                  generateMutation.isPending ||
                  !generateFromDate ||
                  !generateToDate
                }
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generateMutation.isPending ? (
                  t(
                    'Ophthalmologist.slotManagement.generating',
                    'Generating...'
                  )
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />{' '}
                    {t('Ophthalmologist.slotManagement.generate', 'Generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
