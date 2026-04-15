import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRightLeft, RefreshCw, XCircle } from 'lucide-react';
import { DoctorHeader, DoctorSidebar } from '../components';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import useAuthStore from '@/store/auth-store';
import {
  ophthalmologistEmploymentTypeChangeRequestsApi,
  type EmploymentType,
  type OphthalmologistEmploymentTypeChangeRequestStatus,
} from '../api/employment-type-change-requests.api';

const normalizeEmploymentType = (
  value: string | null | undefined
): EmploymentType | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[\s_-]/g, '').toLowerCase();
  if (normalized === 'fulltime') {
    return 'FullTime';
  }

  if (normalized === 'parttime') {
    return 'PartTime';
  }

  return null;
};

const formatDateTime = (dateText?: string | null) => {
  if (!dateText) {
    return 'N/A';
  }

  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString('vi-VN');
};

const statusBadgeClass: Record<
  OphthalmologistEmploymentTypeChangeRequestStatus,
  string
> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Approved:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Cancelled:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function OphthalmologistEmploymentTypeChangeRequestsPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<
    OphthalmologistEmploymentTypeChangeRequestStatus | 'all'
  >('all');
  const [reason, setReason] = useState('');

  const currentEmploymentType = useMemo(
    () => normalizeEmploymentType(user?.employmentType),
    [user?.employmentType]
  );

  const targetEmploymentType: EmploymentType =
    currentEmploymentType === 'PartTime' ? 'FullTime' : 'PartTime';

  const statusOptions = useMemo(
    () => [
      {
        value: 'all' as const,
        label: t(
          'Ophthalmologist.employmentTypeChangeRequests.status.all',
          'All statuses'
        ),
      },
      {
        value: 'Pending' as const,
        label: t(
          'Ophthalmologist.employmentTypeChangeRequests.status.pending',
          'Pending'
        ),
      },
      {
        value: 'Approved' as const,
        label: t(
          'Ophthalmologist.employmentTypeChangeRequests.status.approved',
          'Approved'
        ),
      },
      {
        value: 'Rejected' as const,
        label: t(
          'Ophthalmologist.employmentTypeChangeRequests.status.rejected',
          'Rejected'
        ),
      },
      {
        value: 'Cancelled' as const,
        label: t(
          'Ophthalmologist.employmentTypeChangeRequests.status.cancelled',
          'Cancelled'
        ),
      },
    ],
    [t]
  );

  const listQuery = useQuery({
    queryKey: [
      'ophthalmologist',
      'employment-type-change-requests',
      { pageNumber, status },
    ],
    queryFn: () =>
      ophthalmologistEmploymentTypeChangeRequestsApi.getRequests(
        pageNumber,
        20,
        status === 'all' ? undefined : status
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      ophthalmologistEmploymentTypeChangeRequestsApi.createRequest({
        targetEmploymentType,
        reason,
      }),
    onSuccess: () => {
      ophthalToast.success(
        t(
          'Ophthalmologist.employmentTypeChangeRequests.toast.createSuccess',
          'Employment type change request submitted successfully.'
        )
      );
      setReason('');
      queryClient.invalidateQueries({
        queryKey: ['ophthalmologist', 'employment-type-change-requests'],
      });
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(
          error,
          t(
            'Ophthalmologist.employmentTypeChangeRequests.toast.createFailed',
            'Failed to submit employment type change request.'
          )
        )
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistEmploymentTypeChangeRequestsApi.cancelRequest(requestId),
    onSuccess: () => {
      ophthalToast.success(
        t(
          'Ophthalmologist.employmentTypeChangeRequests.toast.cancelSuccess',
          'Employment type change request cancelled successfully.'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['ophthalmologist', 'employment-type-change-requests'],
      });
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(
          error,
          t(
            'Ophthalmologist.employmentTypeChangeRequests.toast.cancelFailed',
            'Failed to cancel employment type change request.'
          )
        )
      );
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      ophthalToast.error(
        t(
          'Ophthalmologist.employmentTypeChangeRequests.toast.missingReason',
          'Please provide a reason.'
        )
      );
      return;
    }

    if (
      currentEmploymentType &&
      currentEmploymentType === targetEmploymentType
    ) {
      ophthalToast.error(
        t(
          'Ophthalmologist.employmentTypeChangeRequests.toast.sameType',
          'Target employment type must be different from current type.'
        )
      );
      return;
    }

    createMutation.mutate();
  };

  const handleCancelRequest = useCallback(
    async (requestId: string) => {
      const confirmed = await ophthalToast.confirm(
        t(
          'Ophthalmologist.employmentTypeChangeRequests.confirmCancel',
          'Are you sure you want to cancel this request?'
        ),
        {
          confirmLabel: t('Ophthalmologist.common.confirm', 'Confirm'),
          cancelLabel: t('Ophthalmologist.common.cancel', 'Cancel'),
        }
      );

      if (!confirmed) {
        return;
      }

      cancelMutation.mutate(requestId);
    },
    [cancelMutation, t]
  );

  const requests = listQuery.data?.items ?? [];

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t(
            'Ophthalmologist.employmentTypeChangeRequests.pageTitle',
            'Employment Type Change Requests'
          )}
        />

        <main className="p-6 space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                <ArrowRightLeft className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(
                    'Ophthalmologist.employmentTypeChangeRequests.submitTitle',
                    'Submit New Request'
                  )}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    'Ophthalmologist.employmentTypeChangeRequests.submitDescription',
                    'System admin will review your request. Approved requests require signing a new contract.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm text-slate-700 dark:text-slate-300">
                <span className="block mb-1.5">
                  {t(
                    'Ophthalmologist.employmentTypeChangeRequests.currentType',
                    'Current employment type'
                  )}
                </span>
                <input
                  type="text"
                  readOnly
                  value={currentEmploymentType ?? 'Unknown'}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3 py-2"
                />
              </label>

              <label className="text-sm text-slate-700 dark:text-slate-300">
                <span className="block mb-1.5">
                  {t(
                    'Ophthalmologist.employmentTypeChangeRequests.targetType',
                    'Target employment type'
                  )}
                </span>
                <input
                  type="text"
                  readOnly
                  value={targetEmploymentType}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3 py-2"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm text-slate-700 dark:text-slate-300">
              <span className="block mb-1.5">
                {t(
                  'Ophthalmologist.employmentTypeChangeRequests.reason',
                  'Reason'
                )}
              </span>
              <textarea
                rows={4}
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t(
                  'Ophthalmologist.employmentTypeChangeRequests.reasonPlaceholder',
                  'Describe why you need to change your employment type.'
                )}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white text-sm font-semibold disabled:opacity-60"
              >
                {createMutation.isPending
                  ? t('Ophthalmologist.common.submitting', 'Submitting...')
                  : t(
                      'Ophthalmologist.employmentTypeChangeRequests.submitAction',
                      'Submit Request'
                    )}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t(
                  'Ophthalmologist.employmentTypeChangeRequests.historyTitle',
                  'Request History'
                )}
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(
                      event.target.value as
                        | OphthalmologistEmploymentTypeChangeRequestStatus
                        | 'all'
                    );
                    setPageNumber(1);
                  }}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => listQuery.refetch()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('Ophthalmologist.common.refresh', 'Refresh')}
                </button>
              </div>
            </div>

            {listQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t('Ophthalmologist.common.loading', 'Loading...')}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {t(
                  'Ophthalmologist.employmentTypeChangeRequests.empty',
                  'No requests found.'
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((requestItem) => {
                  const canCancel = requestItem.status === 'Pending';

                  return (
                    <article
                      key={requestItem.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {requestItem.currentEmploymentType} {'->'}{' '}
                            {requestItem.targetEmploymentType}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {requestItem.reason}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {t(
                              'Ophthalmologist.employmentTypeChangeRequests.createdAt',
                              'Created at'
                            )}
                            : {formatDateTime(requestItem.createdAt)}
                          </p>
                          {requestItem.reviewedAt ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {t(
                                'Ophthalmologist.employmentTypeChangeRequests.reviewedAt',
                                'Reviewed at'
                              )}
                              : {formatDateTime(requestItem.reviewedAt)}
                            </p>
                          ) : null}
                          {requestItem.adminNote ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {t(
                                'Ophthalmologist.employmentTypeChangeRequests.adminNote',
                                'Admin note'
                              )}
                              : {requestItem.adminNote}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[requestItem.status]}`}
                          >
                            {requestItem.status}
                          </span>

                          {canCancel ? (
                            <button
                              onClick={() =>
                                handleCancelRequest(requestItem.id)
                              }
                              disabled={cancelMutation.isPending}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              {t(
                                'Ophthalmologist.employmentTypeChangeRequests.cancelAction',
                                'Cancel request'
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {listQuery.data && listQuery.data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() =>
                    setPageNumber((value) => Math.max(1, value - 1))
                  }
                  disabled={!listQuery.data.hasPrevious}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  {t('Ophthalmologist.common.previousPage', 'Previous')}
                </button>

                <span className="text-slate-500">
                  {t('Ophthalmologist.common.page', 'Page')} {pageNumber}/
                  {listQuery.data.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPageNumber((value) =>
                      Math.min(listQuery.data!.totalPages, value + 1)
                    )
                  }
                  disabled={!listQuery.data.hasNext}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  {t('Ophthalmologist.common.nextPage', 'Next')}
                </button>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
