import { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  Clock,
  Ban,
  CheckCircle,
  UserX,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import {
  useCreateOrganisationTemplate,
  useDeleteOrganisationTemplate,
  useGenerateOrganisationSlots,
  useOrganisationSlots,
  useOrganisationTemplates,
  useUpdateOrganisationSlotStatus,
} from '../hooks/use-organisation-booking';

const dayOptions = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
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
};

const formatTime = (value: string) => value.slice(0, 5);

export default function OrganisationSlotManagementPage() {
  const { user } = useAuthStore();
  const organisationId = user?.organizationId ?? '';

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [templateId, setTemplateId] = useState('');
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: templates = [], isLoading: templatesLoading } =
    useOrganisationTemplates(organisationId, !!organisationId);

  const { data: slotsPage, isLoading: slotsLoading } = useOrganisationSlots(
    {
      orgId: organisationId,
      fromDate: selectedDate,
      toDate: selectedDate,
      pageSize: 200,
    },
    !!organisationId
  );

  const createTemplateMutation = useCreateOrganisationTemplate();
  const deleteTemplateMutation = useDeleteOrganisationTemplate();
  const generateSlotsMutation = useGenerateOrganisationSlots();
  const updateSlotStatusMutation = useUpdateOrganisationSlotStatus();

  const slots = slotsPage?.items ?? [];

  const stats = useMemo(
    () => ({
      total: slots.length,
      available: slots.filter((s) => s.status === 'Available').length,
      booked: slots.filter((s) => s.status === 'Booked').length,
      blocked: slots.filter((s) => s.status === 'Blocked').length,
    }),
    [slots]
  );

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const handleCreateTemplate = async () => {
    if (!organisationId) return;
    resetMessages();
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
      setMessage('Template created successfully.');
    } catch {
      setError('Failed to create template.');
    }
  };

  const handleGenerateSlots = async () => {
    if (!templateId) {
      setError('Please select a template before generating slots.');
      return;
    }

    resetMessages();
    try {
      const count = await generateSlotsMutation.mutateAsync({
        scheduleTemplateId: templateId,
        fromDate,
        toDate,
        skipExistingDates: true,
      });
      setMessage(`Generated ${count} slots.`);
    } catch {
      setError('Failed to generate slots.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!organisationId) return;
    resetMessages();
    try {
      await deleteTemplateMutation.mutateAsync({
        templateId: id,
        orgId: organisationId,
      });
      setMessage('Template deleted.');
    } catch {
      setError('Failed to delete template.');
    }
  };

  const updateSlotStatus = async (slotId: string, newStatus: number) => {
    resetMessages();
    try {
      await updateSlotStatusMutation.mutateAsync({ slotId, newStatus });
      setMessage('Slot status updated.');
    } catch {
      setError('Failed to update slot status.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />
      <div className="h-full flex-1 overflow-y-auto">
        <OrganisationHeader pageName="Slot Management" />

        <main className="space-y-6 p-6">
          {!organisationId && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Tài khoản chưa có organisationId, chưa thể quản lý lịch tổ chức.
            </div>
          )}

          {(message || error) && (
            <div className="space-y-2">
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Slots
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Booked</p>
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5" />
                Generate Slots
              </h2>
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
                        {template.dayOfWeek} {formatTime(template.startTime)}-
                        {formatTime(template.endTime)} (cap{' '}
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
              <button
                type="button"
                onClick={() => void handleGenerateSlots()}
                disabled={generateSlotsMutation.isPending || !organisationId}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {generateSlotsMutation.isPending ? (
                  <Spinner />
                ) : (
                  <CalendarPlus className="h-4 w-4" />
                )}
                Generate slots
              </button>
            </section>
          </div>

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
                          {formatTime(template.startTime)}-
                          {formatTime(template.endTime)}
                        </td>
                        <td className="px-3 py-2">{template.slotDuration}m</td>
                        <td className="px-3 py-2">{template.maxCapacity}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteTemplate(template.id)
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

          <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2d4a6f] dark:bg-[#1e3a5f]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Slots by Date
              </h2>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Visit date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#2d4a6f] dark:bg-[#17324f]"
                />
              </label>
            </div>

            {slotsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Spinner /> Loading slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No slots for selected date.
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
                    {slots.map((slot) => (
                      <tr
                        key={slot.id}
                        className="border-b border-gray-100 dark:border-[#2d4a6f]"
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(slot.startTime)}-
                            {formatTime(slot.endTime)}
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
                              onClick={() => void updateSlotStatus(slot.id, 7)}
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
                              onClick={() => void updateSlotStatus(slot.id, 1)}
                              disabled={
                                slot.status !== 'Blocked' ||
                                updateSlotStatusMutation.isPending
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Unblock
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateSlotStatus(slot.id, 4)}
                              disabled={updateSlotStatusMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-md border border-cyan-300 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
                            >
                              <Calendar className="h-3.5 w-3.5" /> Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateSlotStatus(slot.id, 5)}
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
        </main>
      </div>
    </div>
  );
}
