import {
  CalendarClock,
  Eye,
  Pill,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import RoadmapStepBadge from './RoadmapStepBadge';
import type {
  HealthRoadmapStepDto,
  RoadmapStepType,
} from '../types/health-roadmap.types';

const STEP_TYPE_META: Record<
  RoadmapStepType,
  {
    labelKey: string;
    defaultLabel: string;
    icon: React.ReactNode;
    tone: string;
  }
> = {
  FollowUp: {
    labelKey: 'CarePlan.stepType.followUp',
    defaultLabel: 'Follow-up',
    icon: <Stethoscope className="w-4 h-4" strokeWidth={1.8} />,
    tone: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-900/20 dark:border-cyan-700/50',
  },
  Test: {
    labelKey: 'CarePlan.stepType.test',
    defaultLabel: 'Test',
    icon: <Eye className="w-4 h-4" strokeWidth={1.8} />,
    tone: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-900/20 dark:border-violet-700/50',
  },
  Medication: {
    labelKey: 'CarePlan.stepType.medication',
    defaultLabel: 'Medication',
    icon: <Pill className="w-4 h-4" strokeWidth={1.8} />,
    tone: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-700/50',
  },
  Custom: {
    labelKey: 'CarePlan.stepType.custom',
    defaultLabel: 'Custom',
    icon: <ClipboardList className="w-4 h-4" strokeWidth={1.8} />,
    tone: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
  },
};

const formatDate = (iso: string, locale?: string) => {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return iso;
  }
};

export interface RoadmapStepCardProps {
  step: HealthRoadmapStepDto;
  /** Doctor mode shows action buttons. */
  mode: 'doctor' | 'patient';
  highlightNext?: boolean;
  onComplete?: (step: HealthRoadmapStepDto) => void;
  onEdit?: (step: HealthRoadmapStepDto) => void;
  onDelete?: (step: HealthRoadmapStepDto) => void;
}

export default function RoadmapStepCard({
  step,
  mode,
  highlightNext = false,
  onComplete,
  onEdit,
  onDelete,
}: RoadmapStepCardProps) {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale =
    i18n.resolvedLanguage === 'vi' || i18n.language.startsWith('vi')
      ? 'vi-VN'
      : 'en-US';
  const typeMeta = STEP_TYPE_META[step.stepType];
  const isCompleted = step.effectiveStatus === 'Completed';
  const isOverdue = step.effectiveStatus === 'Overdue';
  const isCancelled = step.effectiveStatus === 'Cancelled';

  const cardClass = [
    'relative rounded-2xl border p-5 transition-shadow',
    isOverdue
      ? 'border-red-300 bg-red-50/40 dark:border-red-700/60 dark:bg-red-900/10 shadow-sm'
      : isCompleted
        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-700/40 dark:bg-emerald-900/10 opacity-80'
        : isCancelled
          ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30 opacity-60'
          : highlightNext
            ? 'border-brand/50 bg-brand/5 dark:bg-brand/10 shadow-md ring-2 ring-brand/20'
            : 'border-(--border-color) bg-(--bg-primary)',
  ].join(' ');

  const titleClass = [
    'text-lg font-bold leading-tight',
    isCompleted ? 'line-through text-(--text-muted)' : 'text-(--text-primary)',
  ].join(' ');

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${typeMeta.tone}`}
          >
            {typeMeta.icon}
            {t(typeMeta.labelKey, typeMeta.defaultLabel)}
          </span>
          {highlightNext && !isCompleted && !isCancelled && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand text-white text-[10px] font-bold uppercase tracking-wider">
              {t('CarePlan.actions.nextUp', 'Next up')}
            </span>
          )}
        </div>
        <RoadmapStepBadge status={step.effectiveStatus} />
      </div>

      <h3 className={titleClass}>{step.title}</h3>

      <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-(--text-secondary)">
        <CalendarClock className="w-4 h-4" strokeWidth={1.8} />
        <span>{formatDate(step.plannedDate, dateLocale)}</span>
      </div>

      {step.description && (
        <p
          className={`mt-3 text-sm leading-relaxed ${
            isCompleted ? 'text-(--text-muted)' : 'text-(--text-secondary)'
          }`}
        >
          {step.description}
        </p>
      )}

      {mode === 'doctor' && !isCompleted && !isCancelled && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onComplete && (
            <button
              type="button"
              onClick={() => onComplete(step)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              {t('CarePlan.actions.markComplete', 'Mark complete')}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(step)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--bg-secondary) hover:bg-(--bg-primary) text-(--text-primary) text-xs font-semibold transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
              {t('CarePlan.actions.edit', 'Edit')}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(step)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors dark:border-red-700/50 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              {t('CarePlan.actions.delete', 'Delete')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
