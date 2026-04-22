import { useState } from 'react';
import { toast } from 'react-toastify';
import { MessageSquareHeart } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useCreateWebsiteFeedback } from '../../hooks/use-feedback';
import FeedbackModal from './FeedbackModal';
import FeedbackSuccessState from './FeedbackSuccessState';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface WebsiteFeedbackFormProps {
  className?: string;
}

export const WebsiteFeedbackForm = ({
  className,
}: WebsiteFeedbackFormProps) => {
  const { t } = useSafeTranslation();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { canSubmitWebsiteFeedback, isLoading } = useDashboard();
  const createWebsiteFeedbackMutation = useCreateWebsiteFeedback();

  const canSubmit = canSubmitWebsiteFeedback;

  return (
    <div className={className}>
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-(--text-primary)">
              {t('PatientHelpFeedback.form.title', 'Help & Feedback')}
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {t(
                'PatientHelpFeedback.form.subtitle',
                'Takes less than 30 seconds. Your feedback helps us improve the platform.'
              )}
            </p>

            {!isLoading && !canSubmit && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                {t(
                  'PatientHelpFeedback.form.unlockHint',
                  'Complete at least one analysis, report, or appointment to unlock website feedback.'
                )}
              </div>
            )}

            {submitted ? (
              <div className="mt-4">
                <FeedbackSuccessState
                  title={t(
                    'PatientHelpFeedback.form.success.title',
                    'Feedback submitted'
                  )}
                  message={t(
                    'PatientHelpFeedback.form.success.message',
                    'Thanks for helping us improve your care journey.'
                  )}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!canSubmit || isLoading}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t(
                  'PatientHelpFeedback.form.actions.leaveFeedback',
                  'Leave website feedback'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <FeedbackModal
        open={open}
        showCategory
        title={t('PatientHelpFeedback.modal.title', 'Website feedback')}
        subtitle={t(
          'PatientHelpFeedback.modal.subtitle',
          'Tell us what worked well and what can be improved.'
        )}
        submitLabel={t(
          'PatientHelpFeedback.modal.submitLabel',
          'Submit website feedback'
        )}
        labels={{
          rating: t('PatientHelpFeedback.modal.labels.rating', 'Rating'),
          ratingValidation: t(
            'PatientHelpFeedback.modal.labels.ratingValidation',
            'Please select a rating from 1 to 5.'
          ),
          category: t('PatientHelpFeedback.modal.labels.category', 'Category'),
          categories: {
            BUG: t('PatientHelpFeedback.modal.categories.BUG', 'Bug'),
            UX: t('PatientHelpFeedback.modal.categories.UX', 'UX'),
            SUGGESTION: t(
              'PatientHelpFeedback.modal.categories.SUGGESTION',
              'Suggestion'
            ),
            OTHER: t('PatientHelpFeedback.modal.categories.OTHER', 'Other'),
          },
          commentOptional: t(
            'PatientHelpFeedback.modal.labels.commentOptional',
            'Comment (optional)'
          ),
          commentPlaceholder: t(
            'PatientHelpFeedback.modal.labels.commentPlaceholder',
            'Tell us more about your experience'
          ),
          cancel: t('PatientHelpFeedback.modal.actions.notNow', 'Not now'),
          submitting: t(
            'PatientHelpFeedback.modal.actions.submitting',
            'Submitting...'
          ),
          discardTitle: t(
            'PatientHelpFeedback.modal.discard.title',
            'Discard draft?'
          ),
          discardDescription: t(
            'PatientHelpFeedback.modal.discard.description',
            'Your current feedback has not been submitted yet. If you leave now, the draft will be lost.'
          ),
          keepEditing: t(
            'PatientHelpFeedback.modal.discard.keepEditing',
            'Keep editing'
          ),
          discardDraft: t(
            'PatientHelpFeedback.modal.discard.discardDraft',
            'Discard draft'
          ),
        }}
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
          toast.success(
            t(
              'PatientHelpFeedback.toast.feedbackSubmitted',
              'Feedback submitted'
            )
          );
        }}
      />
    </div>
  );
};

export default WebsiteFeedbackForm;
