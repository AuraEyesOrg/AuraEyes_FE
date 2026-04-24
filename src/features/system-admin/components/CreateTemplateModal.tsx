import { useState } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';
import { X, Clock, Calendar, Users } from 'lucide-react';
import { extractApiErrorMessage } from '@/lib/api-error';
import schedulingApi from '../api/scheduling.api';
import { DAY_OF_WEEK_LABELS } from '@/types/schedule';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const { t } = useSafeTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '17:00',
    slotDuration: 30,
    maxCapacity: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await schedulingApi.createTemplate({
        ...formData,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
      });
      toast.success(
        t(
          'SystemAdmin.scheduling.toasts.createSuccess',
          'Schedule template created successfully.'
        )
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.scheduling.toasts.createError',
            'Failed to create template.'
          )
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t(
              'SystemAdmin.scheduling.createModal.title',
              'Create Slot Template'
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              {t('SystemAdmin.scheduling.fields.dayOfWeek', 'Day of Week')}
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dayOfWeek: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <option key={day} value={day}>
                  {DAY_OF_WEEK_LABELS[day]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {t('SystemAdmin.scheduling.fields.startTime', 'Start Time')}
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {t('SystemAdmin.scheduling.fields.endTime', 'End Time')}
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {t('SystemAdmin.scheduling.fields.duration', 'Duration (min)')}
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.slotDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slotDuration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                {t('SystemAdmin.scheduling.fields.capacity', 'Capacity')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxCapacity: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('common.saving', 'Saving...')
                : t('common.save', 'Save Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
