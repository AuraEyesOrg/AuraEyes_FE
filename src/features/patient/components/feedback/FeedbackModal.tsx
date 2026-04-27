import { useEffect, useMemo, useState } from 'react';
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
  comment?: string;
  category: WebsiteFeedbackCategory;
  targetId?: string;
  targetType: 'CLINIC' | 'DOCTOR' | 'STAFF';
};

const feedbackSchema: yup.ObjectSchema<ModalFormValues> = yup
  .object({
    rating: yup.number().required().min(1).max(5),
    comment: yup
      .string()
      .trim()
      .max(2000, 'Comment must be at most 2000 characters')
      .optional(),
    category: yup
      .mixed<WebsiteFeedbackCategory>()
      .oneOf(['BUG', 'UX', 'SUGGESTION', 'OTHER'])
      .required(),
    targetId: yup.string().optional(),
    targetType: yup
      .mixed<'CLINIC' | 'DOCTOR' | 'STAFF'>()
      .oneOf(['CLINIC', 'DOCTOR', 'STAFF'])
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
  labels?: {
    rating?: string;
    ratingValidation?: string;
    category?: string;
    categories?: Partial<Record<WebsiteFeedbackCategory, string>>;
    commentOptional?: string;
    commentPlaceholder?: string;
    cancel?: string;
    submitting?: string;
    discardTitle?: string;
    discardDescription?: string;
    keepEditing?: string;
    discardDraft?: string;
    targetTitle?: string;
    targetClinic?: string;
    targetDoctor?: string;
    targetStaff?: string;
  };
  targets?: {
    clinicId?: string;
    clinicName?: string;
    doctorId?: string;
    doctorName?: string;
    staffId?: string;
    staffName?: string;
  };
  onClose: () => void;
  onSubmit: (
    values: FeedbackFormValues & {
      category?: WebsiteFeedbackCategory;
      targetType?: 'CLINIC' | 'DOCTOR' | 'STAFF';
      targetId?: string;
    }
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
  labels,
  targets,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const defaults = useMemo(
    () => ({
      rating: initialValues?.rating ?? 0,
      comment: initialValues?.comment ?? '',
      category: initialValues?.category ?? 'UX',
      targetType: (initialValues as any)?.targetType ?? 'CLINIC',
      targetId: (initialValues as any)?.targetId ?? targets?.clinicId,
    }),
    [initialValues, targets]
  );

  const {
    handleSubmit,
    control,
    register,
    reset,
    setValue,
    formState: { errors, isDirty },
    watch,
  } = useForm<ModalFormValues>({
    resolver: yupResolver(feedbackSchema) as Resolver<ModalFormValues>,
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      reset(defaults);
    }
  }, [defaults, open, reset]);

  const commentLength = watch('comment')?.length ?? 0;

  const handleAttemptClose = () => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }

    onClose();
  };

  const handleKeepEditing = () => {
    setShowDiscardConfirm(false);
  };

  const handleDiscardDraft = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

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
            onClick={handleAttemptClose}
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
              targetType: values.targetType,
              targetId: values.targetId,
            });
          })}
          className="space-y-6 px-6 py-5"
        >
          {targets && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-(--text-primary)">
                {labels?.targetTitle ?? 'Bạn muốn đánh giá đối tượng nào?'}
              </p>
              <Controller
                control={control}
                name="targetType"
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('CLINIC');
                        setValue('targetId', targets.clinicId);
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                        field.value === 'CLINIC'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {labels?.targetClinic ?? 'Phòng khám'}
                      </span>
                      <span className="truncate text-xs opacity-70">
                        {targets.clinicName ?? 'Hệ thống'}
                      </span>
                    </button>

                    {targets.doctorId && (
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('DOCTOR');
                          setValue('targetId', targets.doctorId);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                          field.value === 'DOCTOR'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {labels?.targetDoctor ?? 'Bác sĩ'}
                        </span>
                        <span className="truncate text-xs opacity-70">
                          {targets.doctorName}
                        </span>
                      </button>
                    )}

                    {targets.staffId && (
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('STAFF');
                          setValue('targetId', targets.staffId);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                          field.value === 'STAFF'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {labels?.targetStaff ?? 'Nhân viên'}
                        </span>
                        <span className="truncate text-xs opacity-70">
                          {targets.staffName}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-semibold text-(--text-primary)">
              {labels?.rating ?? 'Rating'}
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
                {labels?.ratingValidation ??
                  'Please select a rating from 1 to 5.'}
              </p>
            )}
          </div>

          {showCategory && (
            <div>
              <p className="mb-2 text-sm font-semibold text-(--text-primary)">
                {labels?.category ?? 'Category'}
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
                        {labels?.categories?.[category] ?? category}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
              {labels?.commentOptional ?? 'Comment (optional)'}
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              placeholder={
                labels?.commentPlaceholder ??
                'Tell us more about your experience'
              }
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) focus:border-primary"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.comment?.message ? (
                <p className="text-xs text-red-500">{errors.comment.message}</p>
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
              onClick={handleAttemptClose}
              disabled={isSubmitting}
              className="rounded-lg border border-(--border-color) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) disabled:opacity-60"
            >
              {labels?.cancel ?? 'Not now'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting
                ? (labels?.submitting ?? 'Submitting...')
                : submitLabel}
            </button>
          </div>
        </form>

        {showDiscardConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/45 p-4">
            <div className="w-full max-w-sm rounded-xl border border-(--border-color) bg-(--bg-primary) p-5 shadow-xl">
              <h4 className="text-base font-semibold text-(--text-primary)">
                {labels?.discardTitle ?? 'Discard draft?'}
              </h4>
              <p className="mt-2 text-sm text-(--text-secondary)">
                {labels?.discardDescription ??
                  'Your current feedback has not been submitted yet. If you leave now, the draft will be lost.'}
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleKeepEditing}
                  className="rounded-lg border border-(--border-color) px-3 py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-secondary)"
                >
                  {labels?.keepEditing ?? 'Keep editing'}
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  {labels?.discardDraft ?? 'Discard draft'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
