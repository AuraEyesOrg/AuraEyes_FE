import { useState } from 'react';
import { toast } from 'react-toastify';
import { MessageSquareHeart } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useCreateWebsiteFeedback } from '../../hooks/use-feedback';
import FeedbackModal from './FeedbackModal';
import FeedbackSuccessState from './FeedbackSuccessState';

interface WebsiteFeedbackFormProps {
  className?: string;
}

export const WebsiteFeedbackForm = ({
  className,
}: WebsiteFeedbackFormProps) => {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { latestAnalysis, isLoading } = useDashboard();
  const createWebsiteFeedbackMutation = useCreateWebsiteFeedback();

  const canSubmit = !!latestAnalysis;

  return (
    <div className={className}>
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-(--text-primary)">
              Help & Feedback
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Takes less than 30 seconds. Your feedback helps us improve the
              platform.
            </p>

            {!isLoading && !canSubmit && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                Use AI analysis at least once to unlock website feedback.
              </div>
            )}

            {submitted ? (
              <div className="mt-4">
                <FeedbackSuccessState
                  title="Thank you for sharing your feedback"
                  message="We have recorded your website feedback successfully."
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!canSubmit || isLoading}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Leave website feedback
              </button>
            )}
          </div>
        </div>
      </div>

      <FeedbackModal
        open={open}
        showCategory
        title="Website feedback"
        subtitle="Tell us what worked well and what can be improved."
        submitLabel="Submit website feedback"
        isSubmitting={createWebsiteFeedbackMutation.isPending}
        onClose={() => setOpen(false)}
        onSubmit={async (values) => {
          await createWebsiteFeedbackMutation.mutateAsync({
            rating: values.rating,
            category: values.category ?? 'UX',
            comment: values.comment,
          });
          setSubmitted(true);
          setOpen(false);
          toast.success('Website feedback submitted. Thank you.');
        }}
      />
    </div>
  );
};

export default WebsiteFeedbackForm;
