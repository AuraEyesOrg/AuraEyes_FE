import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  Info,
  CalendarCheck,
  Zap,
  Users,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import schedulingApi from '../api/scheduling.api';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { extractApiErrorMessage } from '@/lib/api-error';
import Spinner from '@/components/ui/spinner';

export default function SystemAdminScheduling() {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Queries ---
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['system-admin', 'schedule-templates'],
    queryFn: () => schedulingApi.getTemplates({ pageSize: 100 }),
  });

  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['system-admin', 'appointment-slots'],
    queryFn: () => schedulingApi.getSlots({ pageSize: 10 }),
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

  const templates = templatesData?.data?.items ?? [];
  const slots = slotsData?.data?.items ?? [];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t('SystemAdmin.scheduling.page.title', 'Clinic Scheduling')}
          description={t(
            'SystemAdmin.scheduling.page.description',
            'Manage recurring availability templates and generate clinic slots.'
          )}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => triggerGenerationMutation.mutate()}
                disabled={triggerGenerationMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all shadow-lg shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                {t(
                  'SystemAdmin.scheduling.actions.addTemplate',
                  'Add Template'
                )}
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Info Card */}
          <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 rounded-2xl p-6 flex gap-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Templates Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
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
                  <Spinner size="lg" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {template.dayOfWeek.substring(0, 2)}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">
                              {template.dayOfWeek}
                            </h5>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {template.startTime.substring(0, 5)} -{' '}
                              {template.endTime.substring(0, 5)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            deleteTemplateMutation.mutate(template.id)
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                            {template.slotDuration} min
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                            {t(
                              'SystemAdmin.scheduling.templates.capacity',
                              'Max Capacity'
                            )}
                          </p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {template.maxCapacity}{' '}
                            {t(
                              'SystemAdmin.scheduling.templates.patients',
                              'patients'
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
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Slots Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary-500" />
                {t('SystemAdmin.scheduling.slots.title', 'Upcoming Slots')}
              </h3>

              {isLoadingSlots ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                  <p className="text-slate-500 text-sm">
                    {t(
                      'SystemAdmin.scheduling.slots.empty',
                      'No slots generated yet.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                            {new Date(slot.date).toLocaleDateString(undefined, {
                              month: 'short',
                            })}
                          </span>
                          <span className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-tight">
                            {new Date(slot.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {slot.startTime.substring(0, 5)}
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {slot.bookedCount} / {slot.maxCapacity} booked
                          </p>
                        </div>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          slot.status === 'Available'
                            ? 'bg-green-50 text-green-600'
                            : slot.status === 'Booked'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {slot.status}
                      </div>
                    </div>
                  ))}

                  <button className="w-full py-3 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                    {t('common.viewAll', 'View All')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: ['system-admin', 'schedule-templates'],
          })
        }
      />
    </div>
  );
}
