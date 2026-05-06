import { useEffect, useMemo, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type {
  CreateRoadmapStepRequest,
  HealthRoadmapStepDto,
  RoadmapStepType,
  UpdateRoadmapStepRequest,
} from '../types/health-roadmap.types';

const STEP_TYPES: RoadmapStepType[] = [
  'FollowUp',
  'Test',
  'Medication',
  'Custom',
];

interface PresetSpec {
  key: string;
  labelKey: string;
  labelDefault: string;
  titleKey: string;
  titleDefault: string;
  stepType: RoadmapStepType;
  daysFromToday: number;
  descriptionKey?: string;
  descriptionDefault?: string;
}

const PRESETS: PresetSpec[] = [
  {
    key: 'follow-up-1m',
    labelKey: 'CarePlan.form.presets.followUp1m',
    labelDefault: 'Follow-up in 1 month',
    titleKey: 'CarePlan.form.stepTypeLabel.followUp',
    titleDefault: 'Follow-up visit',
    stepType: 'FollowUp',
    daysFromToday: 30,
  },
  {
    key: 'recheck-vision',
    labelKey: 'CarePlan.form.presets.recheckVision',
    labelDefault: 'Re-check vision',
    titleKey: 'CarePlan.form.presets.recheckVision',
    titleDefault: 'Re-check vision',
    stepType: 'Test',
    daysFromToday: 14,
  },
  {
    key: 'med-review',
    labelKey: 'CarePlan.form.stepTypeLabel.medication',
    labelDefault: 'Medication review',
    titleKey: 'CarePlan.form.stepTypeLabel.medication',
    titleDefault: 'Medication review',
    stepType: 'Medication',
    daysFromToday: 7,
  },
];

const todayIso = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isoFromTodayPlus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export type RoadmapStepFormMode =
  | { kind: 'create'; patientId: string; createdFromVisitId?: string }
  | { kind: 'edit'; step: HealthRoadmapStepDto };

export interface RoadmapStepFormProps {
  open: boolean;
  mode: RoadmapStepFormMode;
  isSubmitting?: boolean;
  onClose: () => void;
  onCreate?: (request: CreateRoadmapStepRequest) => Promise<void> | void;
  onUpdate?: (
    stepId: string,
    request: UpdateRoadmapStepRequest
  ) => Promise<void> | void;
}

export default function RoadmapStepForm({
  open,
  mode,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: RoadmapStepFormProps) {
  const { t } = useSafeTranslation();
  const isEdit = mode.kind === 'edit';

  const initial = useMemo(() => {
    if (mode.kind === 'edit') {
      return {
        title: mode.step.title,
        description: mode.step.description ?? '',
        stepType: mode.step.stepType,
        plannedDate: mode.step.plannedDate,
      };
    }
    return {
      title: '',
      description: '',
      stepType: 'FollowUp' as RoadmapStepType,
      plannedDate: isoFromTodayPlus(30),
    };
  }, [mode]);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [stepType, setStepType] = useState<RoadmapStepType>(initial.stepType);
  const [plannedDate, setPlannedDate] = useState(initial.plannedDate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setDescription(initial.description);
    setStepType(initial.stepType);
    setPlannedDate(initial.plannedDate);
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const applyPreset = (preset: PresetSpec) => {
    setTitle(t(preset.titleKey, preset.titleDefault));
    setStepType(preset.stepType);
    setPlannedDate(isoFromTodayPlus(preset.daysFromToday));
    if (preset.descriptionKey || preset.descriptionDefault) {
      setDescription(
        t(preset.descriptionKey ?? '', preset.descriptionDefault ?? '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(
        t('CarePlan.form.validation.titleRequired', 'Title is required.')
      );
      return;
    }
    if (!plannedDate) {
      setError(
        t(
          'CarePlan.form.validation.plannedDateRequired',
          'Planned date is required.'
        )
      );
      return;
    }

    try {
      if (mode.kind === 'create') {
        if (!onCreate) return;
        await onCreate({
          patientId: mode.patientId,
          title: title.trim(),
          description: description.trim() || undefined,
          stepType,
          plannedDate,
          createdFromVisitId: mode.createdFromVisitId,
        });
      } else {
        if (!onUpdate) return;
        await onUpdate(mode.step.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          stepType,
          plannedDate,
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : t(
              'CarePlan.form.validation.saveFailed',
              'Failed to save roadmap step.'
            );
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-color)">
          <h2 className="text-lg font-bold text-(--text-primary)">
            {isEdit
              ? t('CarePlan.form.title.edit', 'Edit roadmap step')
              : t('CarePlan.form.title.add', 'Add roadmap step')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label={t('CarePlan.form.actions.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {!isEdit && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                <Sparkles className="w-3.5 h-3.5" />{' '}
                {t('CarePlan.form.quickPresets', 'Quick-add presets')}
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--bg-secondary) hover:bg-brand/10 hover:border-brand/40 text-(--text-primary) text-xs font-semibold transition-colors"
                  >
                    {t(preset.labelKey, preset.labelDefault)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-1.5">
              {t('CarePlan.form.labels.title', 'Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder={t(
                'CarePlan.form.placeholders.title',
                'e.g. Follow-up visit'
              )}
              className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--text-primary) mb-1.5">
                {t('CarePlan.form.labels.type', 'Type')}
              </label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value as RoadmapStepType)}
                className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {STEP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(
                      `CarePlan.form.stepTypeLabel.${type === 'FollowUp' ? 'followUp' : type === 'Test' ? 'test' : type === 'Medication' ? 'medication' : 'custom'}`,
                      type
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text-primary) mb-1.5">
                {t('CarePlan.form.labels.plannedDate', 'Planned date')}
              </label>
              <input
                type="date"
                value={plannedDate}
                min={isEdit ? undefined : todayIso()}
                onChange={(e) => setPlannedDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-1.5">
              {t('CarePlan.form.labels.description', 'Description')}{' '}
              <span className="text-xs font-normal text-(--text-muted)">
                ({t('CarePlan.form.labels.optional', 'optional')})
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder={t(
                'CarePlan.form.placeholders.description',
                'Doctor instruction or context for the patient'
              )}
              className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) text-sm font-semibold hover:bg-(--bg-primary) transition-colors disabled:opacity-60"
            >
              {t('CarePlan.form.actions.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {isSubmitting
                ? t('CarePlan.form.actions.saving', 'Saving...')
                : isEdit
                  ? t('CarePlan.form.actions.saveChanges', 'Save changes')
                  : t('CarePlan.form.actions.addStep', 'Add step')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
