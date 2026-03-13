import { CheckCircle2 } from 'lucide-react';

interface FeedbackSubmittedBadgeProps {
  label?: string;
}

export const FeedbackSubmittedBadge = ({
  label = 'Feedback submitted',
}: FeedbackSubmittedBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

export default FeedbackSubmittedBadge;
