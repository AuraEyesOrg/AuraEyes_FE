import { CheckCircle2, Clock, AlertTriangle, Ban } from 'lucide-react';
import type { EffectiveRoadmapStepStatus } from '../types/health-roadmap.types';

const STATUS_STYLES: Record<
  EffectiveRoadmapStepStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Upcoming: {
    label: 'Upcoming',
    className:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50',
    icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  Completed: {
    label: 'Completed',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
    icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  Overdue: {
    label: 'Overdue',
    className:
      'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50',
    icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  Cancelled: {
    label: 'Cancelled',
    className:
      'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    icon: <Ban className="w-3.5 h-3.5" strokeWidth={2} />,
  },
};

export interface RoadmapStepBadgeProps {
  status: EffectiveRoadmapStepStatus;
  label?: string;
}

export default function RoadmapStepBadge({
  status,
  label,
}: RoadmapStepBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.className}`}
    >
      {style.icon}
      {label ?? style.label}
    </span>
  );
}
