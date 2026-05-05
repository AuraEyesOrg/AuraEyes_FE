import { useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { X, CheckCircle2 } from 'lucide-react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import * as yup from 'yup';
import type {
  FeedbackFormValues,
  WebsiteFeedbackCategory,
} from '../../types/feedback.types';
import StarRatingInput from './StarRatingInput';

type TargetType = 'CLINIC' | 'DOCTOR' | 'STAFF';

type ModalFormValues = {
  rating: number;
  comment?: string;
  category: WebsiteFeedbackCategory;
  targetId?: string;
  targetType: TargetType;
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
      .mixed<TargetType>()
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
  /** Target types that have already been submitted before opening the modal (from server). */
  alreadySubmittedTargets?: string[];
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
      targetType?: TargetType;
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
  alreadySubmittedTargets = [],
  initialValues,
  labels,
  targets,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  /**
   * Track which targets have been submitted **during this modal session**.
   * Merged with alreadySubmittedTargets to build the full "done" set.
   */
  const [sessionSubmitted, setSessionSubmitted] = useState<Set<TargetType>>(
    new Set()
  );

  /** Combined set of submitted targets (server + this session). */
  const allSubmitted = useMemo<Set<string>>(() => {
    const merged = new Set(alreadySubmittedTargets.map((t) => t.toUpperCase()));
    sessionSubmitted.forEach((t) => merged.add(t));
    return merged;
  }, [alreadySubmittedTargets, sessionSubmitted]);

  /** Whether a specific target can still be submitted. */
  const isTargetDone = (type: TargetType) => allSubmitted.has(type);

  /** Which targets exist at all (have data from the appointment). */
  const availableTargets = useMemo<TargetType[]>(() => {
    const list: TargetType[] = ['CLINIC'];
    if (targets?.doctorId) list.push('DOCTOR');
    if (targets?.staffId) list.push('STAFF');
    return list;
  }, [targets]);

  /** Whether ALL available targets have been submitted. */
  const allDone = availableTargets.every((t) => allSubmitted.has(t));

  const defaults = useMemo(
    () => ({
      rating: initialValues?.rating ?? 0,
      comment: initialValues?.comment ?? '',
      category: initialValues?.category ?? 'UX',
      targetType:
        (initialValues as any)?.targetType ?? ('CLINIC' as TargetType),
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

  const currentTargetType = watch('targetType');

  useEffect(() => {
    if (open) {
      reset(defaults);
      setSessionSubmitted(new Set());
      setShowDiscardConfirm(false);
    }
  }, [open]);

  // When the user switches target type, update targetId & reset rating/comment
  const handleSelectTarget = (type: TargetType) => {
    if (isTargetDone(type) || isSubmitting) return;
    let targetId: string | undefined;
    if (type === 'CLINIC') targetId = targets?.clinicId;
    else if (type === 'DOCTOR') targetId = targets?.doctorId;
    else if (type === 'STAFF') targetId = targets?.staffId;
    setValue('targetType', type);
    setValue('targetId', targetId);
    setValue('rating', 0);
    setValue('comment', '');
  };

  const commentLength = watch('comment')?.length ?? 0;

  const handleAttemptClose = () => {
    if (isSubmitting) return;

    // If they have already submitted at least one target in this session,
    // let them close freely (it's like 'Finish early').
    if (sessionSubmitted.size > 0) {
      onClose();
      return;
    }

    // Only show discard confirm if they have unsaved changes on the VERY FIRST target they are rating
    const hasUnsavedWork = watch('rating') > 0 || watch('comment')?.trim();
    if (hasUnsavedWork) {
      setShowDiscardConfirm(true);
      return;
    }

    onClose();
  };

  const handleKeepEditing = () => setShowDiscardConfirm(false);

  const handleDiscardDraft = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  if (!open) return null;

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

        {/* All-done success banner */}
        {allDone ? (
          <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-bold text-(--text-primary)">
                Cảm ơn đánh giá của bạn!
              </p>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Bạn đã hoàn thành tất cả đánh giá cho lượt khám này.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(async (values) => {
              await onSubmit({
                rating: values.rating,
                comment: values.comment || undefined,
                category: values.category,
                targetType: values.targetType,
                targetId: values.targetId,
              });
              // Mark current target as submitted in this session
              setSessionSubmitted((prev) => {
                const next = new Set(prev);
                next.add(values.targetType);
                return next;
              });
              // Auto-switch to next pending target (if any)
              const nextPending = availableTargets.find(
                (t) => t !== values.targetType && !allSubmitted.has(t)
              );
              if (nextPending) {
                handleSelectTarget(nextPending);
              } else {
                reset(defaults);
              }
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
                      {/* Clinic button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTarget('CLINIC')}
                        disabled={isTargetDone('CLINIC') || isSubmitting}
                        className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isTargetDone('CLINIC')
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20 text-emerald-600'
                            : field.value === 'CLINIC'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                        }`}
                      >
                        {isTargetDone('CLINIC') && (
                          <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-emerald-500" />
                        )}
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
                          onClick={() => handleSelectTarget('DOCTOR')}
                          disabled={isTargetDone('DOCTOR') || isSubmitting}
                          className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isTargetDone('DOCTOR')
                              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20 text-emerald-600'
                              : field.value === 'DOCTOR'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                          }`}
                        >
                          {isTargetDone('DOCTOR') && (
                            <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-emerald-500" />
                          )}
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
                          onClick={() => handleSelectTarget('STAFF')}
                          disabled={isTargetDone('STAFF') || isSubmitting}
                          className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isTargetDone('STAFF')
                              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20 text-emerald-600'
                              : field.value === 'STAFF'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-(--border-color) bg-(--bg-secondary)/30 text-(--text-secondary) hover:bg-(--bg-secondary)'
                          }`}
                        >
                          {isTargetDone('STAFF') && (
                            <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-emerald-500" />
                          )}
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
                {/* Per-target submitted success notice */}
                {sessionSubmitted.size > 0 && !allDone && (
                  <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đã gửi đánh giá cho{' '}
                      {[...sessionSubmitted]
                        .map((t) =>
                          t === 'CLINIC'
                            ? (labels?.targetClinic ?? 'Phòng khám')
                            : t === 'DOCTOR'
                              ? (labels?.targetDoctor ?? 'Bác sĩ')
                              : (labels?.targetStaff ?? 'Nhân viên')
                        )
                        .join(', ')}
                      .
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
                      Bạn có thể tiếp tục đánh giá các đối tượng khác hoặc nhấn{' '}
                      <strong>"Hoàn tất"</strong> để kết thúc.
                    </p>
                  </div>
                )}
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
                  <p className="text-xs text-red-500">
                    {errors.comment.message}
                  </p>
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
                {sessionSubmitted.size > 0
                  ? (labels?.cancel ?? 'Hoàn tất')
                  : (labels?.cancel ?? 'Để sau')}
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
        )}

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
