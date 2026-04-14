import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { CalendarDays, RefreshCw, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { DoctorHeader, DoctorSidebar } from '../components';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import useAuthStore from '@/store/auth-store';
import { getLocaleFromPathname, withLocalePathname } from '@/i18n/locales';
import {
  ophthalmologistLeaveRequestsApi,
  type OphthalmologistLeaveRequestStatus,
} from '../api/leave-requests.api';

const normalizeEmploymentType = (
  value: string | null | undefined
): 'FullTime' | 'PartTime' | null => {
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

const formatDate = (dateText: string) => {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return dateText;
  }

  return parsed.toLocaleDateString('vi-VN');
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

const statusBadgeClass: Record<OphthalmologistLeaveRequestStatus, string> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Approved:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Cancelled:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function OphthalmologistLeaveRequestsPage() {
  const { t } = useSafeTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const locale = getLocaleFromPathname(location.pathname);
  const dashboardPath = locale
    ? withLocalePathname(locale, '/ophthalmologist/dashboard')
    : '/ophthalmologist/dashboard';
  const isFullTimeDoctor =
    normalizeEmploymentType(user?.employmentType ?? null) === 'FullTime';

  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<
    OphthalmologistLeaveRequestStatus | 'all'
  >('all');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const statusOptions = useMemo(
    () => [
      {
        value: 'all' as const,
        label: t('Ophthalmologist.leaveRequests.status.all', 'All statuses'),
      },
      {
        value: 'Pending' as const,
        label: t('Ophthalmologist.leaveRequests.status.pending', 'Pending'),
      },
      {
        value: 'Approved' as const,
        label: t('Ophthalmologist.leaveRequests.status.approved', 'Approved'),
      },
      {
        value: 'Rejected' as const,
        label: t('Ophthalmologist.leaveRequests.status.rejected', 'Rejected'),
      },
      {
        value: 'Cancelled' as const,
        label: t('Ophthalmologist.leaveRequests.status.cancelled', 'Cancelled'),
      },
    ],
    [t]
  );

  const minStartDate = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + 3);
    return now.toISOString().split('T')[0] ?? '';
  }, []);

  const leaveRequestsQuery = useQuery({
    queryKey: ['ophthalmologist', 'leave-requests', { pageNumber, status }],
    queryFn: () =>
      ophthalmologistLeaveRequestsApi.getLeaveRequests(
        pageNumber,
        20,
        status === 'all' ? undefined : status
      ),
    enabled: isFullTimeDoctor,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      ophthalmologistLeaveRequestsApi.createLeaveRequest({
        startDate,
        endDate,
        reason,
      }),
    onSuccess: () => {
      ophthalToast.success(
        t(
          'Ophthalmologist.leaveRequests.toast.createSuccess',
          'Leave request submitted successfully.'
        )
      );
      setStartDate('');
      setEndDate('');
      setReason('');
      queryClient.invalidateQueries({
        queryKey: ['ophthalmologist', 'leave-requests'],
      });
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(
          error,
          t(
            'Ophthalmologist.leaveRequests.toast.createFailed',
            'Failed to submit leave request.'
          )
        )
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistLeaveRequestsApi.cancelLeaveRequest(requestId),
    onSuccess: () => {
      ophthalToast.success(
        t(
          'Ophthalmologist.leaveRequests.toast.cancelSuccess',
          'Leave request cancelled successfully.'
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['ophthalmologist', 'leave-requests'],
      });
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(
          error,
          t(
            'Ophthalmologist.leaveRequests.toast.cancelFailed',
            'Failed to cancel leave request.'
          )
        )
      );
    },
  });

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason.trim()) {
      ophthalToast.error(
        t(
          'Ophthalmologist.leaveRequests.toast.missingFields',
          'Please provide start date, end date, and reason.'
        )
      );
      return;
    }

    if (endDate < startDate) {
      ophthalToast.error(
        t(
          'Ophthalmologist.leaveRequests.toast.invalidDateRange',
          'End date must be on or after start date.'
        )
      );
      return;
    }

    createMutation.mutate();
  };

  const leaveRequests = leaveRequestsQuery.data?.items ?? [];

  if (!isFullTimeDoctor) {
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t(
            'Ophthalmologist.leaveRequests.pageTitle',
            'Leave Requests'
          )}
        />

        <main className="p-6 space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                <CalendarDays className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(
                    'Ophthalmologist.leaveRequests.submitTitle',
                    'Submit New Leave Request'
                  )}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    'Ophthalmologist.leaveRequests.submitDescription',
                    'Leave requests must be submitted at least 3 days in advance and will be reviewed by system admin.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm text-slate-700 dark:text-slate-300">
                <span className="block mb-1.5">
                  {t('Ophthalmologist.leaveRequests.startDate', 'Start date')}
                </span>
                <input
                  type="date"
                  min={minStartDate}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </label>

              <label className="text-sm text-slate-700 dark:text-slate-300">
                <span className="block mb-1.5">
                  {t('Ophthalmologist.leaveRequests.endDate', 'End date')}
                </span>
                <input
                  type="date"
                  min={startDate || minStartDate}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm text-slate-700 dark:text-slate-300">
              <span className="block mb-1.5">
                {t('Ophthalmologist.leaveRequests.reason', 'Reason')}
              </span>
              <textarea
                rows={4}
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t(
                  'Ophthalmologist.leaveRequests.reasonPlaceholder',
                  'Describe why you need this leave request.'
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
                      'Ophthalmologist.leaveRequests.submitAction',
                      'Submit Request'
                    )}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t(
                  'Ophthalmologist.leaveRequests.historyTitle',
                  'Request History'
                )}
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(
                      event.target.value as
                        | OphthalmologistLeaveRequestStatus
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
                  onClick={() => leaveRequestsQuery.refetch()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('Ophthalmologist.common.refresh', 'Refresh')}
                </button>
              </div>
            </div>

            {leaveRequestsQuery.isLoading ? (
              <div className="py-10 flex items-center justify-center">
                <Spinner size={28} />
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="py-8 text-sm text-slate-500 text-center">
                {t(
                  'Ophthalmologist.leaveRequests.empty',
                  'No leave requests found for the selected filter.'
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(request.startDate)} -{' '}
                          {formatDate(request.endDate)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          {request.reason}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {t(
                            'Ophthalmologist.leaveRequests.submittedAt',
                            'Submitted at'
                          )}
                          : {formatDateTime(request.createdAt)}
                        </p>
                        {request.adminNote ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {t(
                              'Ophthalmologist.leaveRequests.adminNote',
                              'Admin note'
                            )}
                            : {request.adminNote}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[request.status]}`}
                        >
                          {t(
                            `Ophthalmologist.leaveRequests.status.${request.status.toLowerCase()}`,
                            request.status
                          )}
                        </span>

                        {request.status === 'Pending' ? (
                          <button
                            onClick={() => cancelMutation.mutate(request.id)}
                            disabled={cancelMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                          >
                            <XCircle className="w-4 h-4" />
                            {t(
                              'Ophthalmologist.leaveRequests.cancelAction',
                              'Cancel request'
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {leaveRequestsQuery.data &&
            leaveRequestsQuery.data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                  disabled={!leaveRequestsQuery.data.hasPrevious}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  {t('Ophthalmologist.common.previous', 'Previous')}
                </button>

                <span className="text-slate-500">
                  {t('Ophthalmologist.common.page', 'Page')} {pageNumber}/
                  {leaveRequestsQuery.data.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPageNumber((page) =>
                      Math.min(leaveRequestsQuery.data!.totalPages, page + 1)
                    )
                  }
                  disabled={!leaveRequestsQuery.data.hasNext}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  {t('Ophthalmologist.common.next', 'Next')}
                </button>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
