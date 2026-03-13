import { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { X } from 'lucide-react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import * as yup from 'yup';
import type {
  FeedbackFormValues,
  WebsiteFeedbackCategory,
} from '../../types/feedback.types';
import StarRatingInput from './StarRatingInput';

type ModalFormValues = {
  rating: number;
  comment: string;
  category: WebsiteFeedbackCategory;
};

const feedbackSchema: yup.ObjectSchema<ModalFormValues> = yup
  .object({
    rating: yup.number().required().min(1).max(5),
    comment: yup.string().max(2000).required(),
    category: yup
      .mixed<WebsiteFeedbackCategory>()
      .oneOf(['BUG', 'UX', 'SUGGESTION', 'OTHER'])
      .required(),
  })
  .required();

interface FeedbackModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  submitLabel?: string;
  contextLabel?: string;
  isSubmitting?: boolean;
  showCategory?: boolean;
  initialValues?: Partial<
    FeedbackFormValues & { category: WebsiteFeedbackCategory }
  >;
  onClose: () => void;
  onSubmit: (
    values: FeedbackFormValues & { category?: WebsiteFeedbackCategory }
  ) => Promise<void> | void;
}

const categoryOptions: WebsiteFeedbackCategory[] = [
  'BUG',
  'UX',
  'SUGGESTION',
  'OTHER',
];

export const FeedbackModal = ({
  open,
  title,
  subtitle,
  submitLabel = 'Submit feedback',
  contextLabel,
  isSubmitting = false,
  showCategory = false,
  initialValues,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const defaults = useMemo(
    () => ({
      rating: initialValues?.rating ?? 0,
      comment: initialValues?.comment ?? '',
      category: initialValues?.category ?? 'UX',
    }),
    [initialValues]
  );

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    watch,
  } = useForm<ModalFormValues>({
    resolver: yupResolver(feedbackSchema) as Resolver<ModalFormValues>,
    defaultValues: defaults,
  });

  const commentLength = watch('comment')?.length ?? 0;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-(--bg-primary) shadow-2xl">
        <div className="flex items-start justify-between border-b border-(--border-color) px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-(--text-primary)">{title}</h3>
            {subtitle && (
              <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
            )}
            {contextLabel && (
              <p className="mt-2 text-xs font-medium text-(--text-muted)">
                {contextLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--bg-secondary)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({
              rating: values.rating,
              comment: values.comment || undefined,
              category: values.category,
            });
          })}
          className="space-y-5 px-6 py-5"
        >
          <div>
            <p className="mb-2 text-sm font-semibold text-(--text-primary)">
              Rating
            </p>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.rating?.message && (
              <p className="mt-2 text-xs text-red-500">
                Please select a rating from 1 to 5.
              </p>
            )}
          </div>

          {showCategory && (
            <div>
              <p className="mb-2 text-sm font-semibold text-(--text-primary)">
                Category
              </p>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => field.onChange(category)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          field.value === category
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary)'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
              Comment (optional)
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              placeholder="Tell us more about your experience"
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) focus:border-primary"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.comment?.message ? (
                <p className="text-xs text-red-500">Comment is too long.</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-(--text-muted)">
                {commentLength}/2000
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-(--border-color) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) disabled:opacity-60"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
