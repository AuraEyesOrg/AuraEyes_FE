import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, ShieldCheck, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { leavePoliciesApi, type LeavePolicy } from '../api/leave-policies.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';

export default function LeavePoliciesPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPolicy) {
      updateMutation.mutate({ id: editingPolicy.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title={t('SystemAdmin.leavePolicies.title', 'Leave Policies')}
          description={t(
            'SystemAdmin.leavePolicies.description',
            'Define compensation rules for ophthalmologists (e.g., Trực Tết = +3 days)'
          )}
        />

        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-(--text-primary)">
              {t(
                'SystemAdmin.leavePolicies.listTitle',
                'Compensation Policies'
              )}
            </h2>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('SystemAdmin.leavePolicies.actions.add', 'Add Policy')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-(--text-secondary)">
                {t('SystemAdmin.common.loading', 'Loading policies...')}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Gift className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-(--text-secondary)">
                  {t(
                    'SystemAdmin.leavePolicies.empty',
                    'No leave policies defined yet.'
                  )}
                </p>
              </div>
            ) : (
              data?.items.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            t(
                              'SystemAdmin.common.confirmDelete',
                              'Are you sure you want to delete this?'
                            )
                          )
                        ) {
                          deleteMutation.mutate(policy.id);
                        }
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-(--text-primary)">
                        {policy.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          +{policy.additionalDays}
                        </span>
                        <span className="text-sm font-medium text-(--text-secondary)">
                          {t('SystemAdmin.leavePolicies.days', 'days')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-(--text-secondary) line-clamp-3 min-h-[3rem]">
                    {policy.description ||
                      t(
                        'SystemAdmin.leavePolicies.noDescription',
                        'No description provided'
                      )}
                  </p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-xl font-bold text-(--text-primary)">
                {editingPolicy
                  ? t('SystemAdmin.leavePolicies.editTitle', 'Edit Policy')
                  : t('SystemAdmin.leavePolicies.addTitle', 'New Leave Policy')}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--text-primary)">
                  {t('SystemAdmin.leavePolicies.fields.name', 'Policy Name')}
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t(
                    'SystemAdmin.leavePolicies.placeholders.name',
                    'e.g., Trực Tết'
                  )}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--text-primary)">
                  {t(
                    'SystemAdmin.leavePolicies.fields.days',
                    'Additional Days'
                  )}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    required
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.additionalDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalDays: parseFloat(e.target.value),
                      })
                    }
                    className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <span className="text-sm text-(--text-secondary)">
                    {t(
                      'SystemAdmin.leavePolicies.hint.positiveValue',
                      "Number of days to add to doctor's fund"
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--text-primary)">
                  {t(
                    'SystemAdmin.leavePolicies.fields.description',
                    'Description'
                  )}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t(
                    'SystemAdmin.leavePolicies.placeholders.description',
                    'Explain when this policy applies'
                  )}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('SystemAdmin.common.actions.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t('SystemAdmin.common.actions.saving', 'Saving...')
                    : t('SystemAdmin.common.actions.save', 'Save Policy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
