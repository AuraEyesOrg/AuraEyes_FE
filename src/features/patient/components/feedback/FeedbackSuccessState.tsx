import { CheckCircle2 } from 'lucide-react';

interface FeedbackSuccessStateProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

export const FeedbackSuccessState = ({
  title = 'Thanks for your feedback',
  message = 'Your feedback helps us improve care quality.',
  onClose,
}: FeedbackSuccessStateProps) => {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {title}
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            {message}
          </p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default FeedbackSuccessState;
