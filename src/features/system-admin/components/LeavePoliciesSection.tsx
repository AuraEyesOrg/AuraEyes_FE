import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, ShieldCheck, Gift, X, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { leavePoliciesApi, type LeavePolicy } from '../api/leave-policies.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';

export default function LeavePoliciesSection() {
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    additionalDays: 1,
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['system-admin', 'leave-policies'],
    queryFn: () => leavePoliciesApi.getPaged(1, 100),
  });

  const resetForm = () => {
    setFormData({ name: '', additionalDays: 1, description: '' });
    setEditingPolicy(null);
  };

  const handleEdit = (policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      additionalDays: policy.additionalDays,
      description: policy.description || '',
    });
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: leavePoliciesApi.create,
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.leavePolicies.toasts.createSuccess',
          'Policy created successfully'
        )
      );
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'leave-policies'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.leavePolicies.toasts.createError',
            'Failed to create policy'
          )
        )
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeavePolicy> }) =>
      leavePoliciesApi.update(id, data),
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.leavePolicies.toasts.updateSuccess',
          'Policy updated successfully'
        )
      );
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'leave-policies'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.leavePolicies.toasts.updateError',
            'Failed to update policy'
          )
        )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leavePoliciesApi.delete,
    onSuccess: () => {
      toast.success(
        t(
          'SystemAdmin.leavePolicies.toasts.deleteSuccess',
          'Policy deleted successfully'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'leave-policies'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.leavePolicies.toasts.deleteError',
            'Failed to delete policy'
          )
        )
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPolicy) {
      updateMutation.mutate({ id: editingPolicy.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('SystemAdmin.settings.leavePolicies.title', 'Leave Policies')}
            </h3>
            <p className="text-sm text-slate-500">
              {t(
                'SystemAdmin.settings.leavePolicies.description',
                'Define automatic leave day compensation rules for staff.'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {t('SystemAdmin.leavePolicies.actions.add', 'New Policy')}
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))
        ) : !data?.items || data.items.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Gift className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('SystemAdmin.leavePolicies.empty', 'No leave policies yet')}
            </h4>
            <p className="text-slate-500 max-w-sm mt-2">
              {t(
                'SystemAdmin.leavePolicies.emptyDesc',
                'Start by adding a policy to define how staff earn extra leave days.'
              )}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-primary font-bold hover:underline underline-offset-4"
            >
              + {t('SystemAdmin.leavePolicies.actions.add', 'Add Policy')}
            </button>
          </div>
        ) : (
          data.items.map((policy) => (
            <div
              key={policy.id}
              className="group relative flex flex-col p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => handleEdit(policy)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            'SystemAdmin.common.confirmDelete',
                            'Delete this policy?'
                          )
                        )
                      ) {
                        deleteMutation.mutate(policy.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {policy.name}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-3 flex-1 mb-6">
                {policy.description ||
                  t(
                    'SystemAdmin.leavePolicies.noDescription',
                    'No description provided'
                  )}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Plus className="w-3.5 h-3.5" />
                  {policy.additionalDays}{' '}
                  {t('SystemAdmin.leavePolicies.days', 'days')}
                </div>
                <div className="text-[10px] font-bold text-slate-300 dark:text-slate-600 tracking-widest uppercase">
                  ACTIVE RULE
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingPolicy
                    ? t('SystemAdmin.leavePolicies.editTitle', 'Edit Policy')
                    : t('SystemAdmin.leavePolicies.addTitle', 'New Policy')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingPolicy
                    ? t(
                        'SystemAdmin.leavePolicies.editSubtitle',
                        'Modify existing rule'
                      )
                    : t(
                        'SystemAdmin.leavePolicies.addSubtitle',
                        'Configure a new compensation rule'
                      )}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t('SystemAdmin.leavePolicies.fields.name', 'Policy Name')}
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Small Holiday Shift"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t(
                    'SystemAdmin.leavePolicies.fields.days',
                    'Additional Days'
                  )}
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={formData.additionalDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalDays: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-primary text-xl"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 pointer-events-none">
                    <Gift className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      Days
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 px-2 mt-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t(
                      'SystemAdmin.leavePolicies.fields.daysHint',
                      "This number will be added to the staff member's leave fund when this policy is applied."
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t(
                    'SystemAdmin.leavePolicies.fields.description',
                    'Description'
                  )}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the conditions for this policy..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  {t('SystemAdmin.common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-[2] bg-primary hover:opacity-90 text-slate-900 px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t('SystemAdmin.common.saving', 'Saving...')
                    : editingPolicy
                      ? t('SystemAdmin.common.update', 'Update Policy')
                      : t('SystemAdmin.common.create', 'Create Policy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
