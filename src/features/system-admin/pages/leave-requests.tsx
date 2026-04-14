import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock3, RefreshCw, Search, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  adminLeaveRequestsApi,
  type AdminLeaveRequestItem,
  type OphthalmologistLeaveRequestStatus,
} from '../api/leave-requests.api';
import { extractApiErrorMessage } from '@/lib/api-error';

type StatusFilter = OphthalmologistLeaveRequestStatus | 'all';
type ReviewAction = 'approve' | 'reject';

interface ReviewDialogState {
  action: ReviewAction;
  request: AdminLeaveRequestItem;
}

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Đang chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Rejected', label: 'Đã từ chối' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

const statusBadgeClass: Record<OphthalmologistLeaveRequestStatus, string> = {
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Approved:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Cancelled:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const statusLabel: Record<OphthalmologistLeaveRequestStatus, string> = {
  Pending: 'Đang chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Đã từ chối',
  Cancelled: 'Đã hủy',
};

const formatDate = (dateText: string) => {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return dateText;
  return parsed.toLocaleDateString('vi-VN');
};

const formatDateTime = (dateText?: string | null) => {
  if (!dateText) return 'N/A';
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString('vi-VN');
};

export default function SystemAdminLeaveRequestsPage() {
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<StatusFilter>('Pending');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState | null>(
    null
  );
  const [adminNote, setAdminNote] = useState('');

  const listQuery = useQuery({
    queryKey: [
      'system-admin',
      'leave-requests',
      { pageNumber, pageSize, status },
    ],
    queryFn: () =>
      adminLeaveRequestsApi.getLeaveRequests(
        pageNumber,
        pageSize,
        status === 'all' ? undefined : status
      ),
  });

  const approveMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note: string }) =>
      adminLeaveRequestsApi.approveLeaveRequest(requestId, note),
    onSuccess: (result) => {
      toast.success(
        `Đã duyệt đơn nghỉ phép. Hệ thống đã hủy ${result.cancelledConsultationSessions} phiên tư vấn, ${result.cancelledAppointments} lịch hẹn và chặn ${result.blockedSlots} slot.`
      );
      setReviewDialog(null);
      setAdminNote('');
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'leave-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(error, 'Không thể duyệt đơn nghỉ phép.')
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note: string }) =>
      adminLeaveRequestsApi.rejectLeaveRequest(requestId, note),
    onSuccess: () => {
      toast.success('Đã từ chối đơn nghỉ phép.');
      setReviewDialog(null);
      setAdminNote('');
      queryClient.invalidateQueries({
        queryKey: ['system-admin', 'leave-requests'],
      });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(error, 'Không thể từ chối đơn nghỉ phép.')
      );
    },
  });

  const filteredItems = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) => {
      return (
        item.doctorFullName.toLowerCase().includes(keyword) ||
        item.doctorEmail.toLowerCase().includes(keyword) ||
        item.reason.toLowerCase().includes(keyword)
      );
    });
  }, [listQuery.data?.items, searchKeyword]);

  const summary = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const pendingCount = items.filter(
      (item) => item.status === 'Pending'
    ).length;
    const approvedCount = items.filter(
      (item) => item.status === 'Approved'
    ).length;

    return {
      pendingCount,
      approvedCount,
      totalCount: listQuery.data?.totalCount ?? 0,
    };
  }, [listQuery.data]);

  const submitReview = () => {
    if (!reviewDialog) return;

    const payload = {
      requestId: reviewDialog.request.id,
      note: adminNote,
    };

    if (reviewDialog.action === 'approve') {
      approveMutation.mutate(payload);
      return;
    }

    rejectMutation.mutate(payload);
  };

  const isSubmittingReview =
    approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title="Leave Requests"
          description="Duyệt và quản lý đơn xin nghỉ phép của bác sĩ toàn thời gian"
        />

        <main className="p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Đang chờ duyệt
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {summary.pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Đã duyệt
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {summary.approvedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-4">
              <p className="text-sm text-sky-700 dark:text-sky-300">
                Tổng số đơn
              </p>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                {summary.totalCount}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 min-w-72">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Tìm bác sĩ, email, lý do nghỉ phép..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as StatusFilter);
                    setPageNumber(1);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => listQuery.refetch()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </button>
              </div>
            </div>

            {listQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Không có đơn nghỉ phép nào.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const canReview = item.status === 'Pending';

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.doctorFullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.doctorEmail}
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(item.startDate)} -{' '}
                            {formatDate(item.endDate)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {item.reason}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Tạo lúc: {formatDateTime(item.createdAt)}
                          </p>
                          {item.reviewedAt ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Duyệt lúc: {formatDateTime(item.reviewedAt)}
                            </p>
                          ) : null}
                          {item.adminNote ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Ghi chú admin: {item.adminNote}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[item.status]}`}
                          >
                            {statusLabel[item.status]}
                          </span>

                          {canReview ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setReviewDialog({
                                    action: 'approve',
                                    request: item,
                                  });
                                  setAdminNote('');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Duyệt
                              </button>
                              <button
                                onClick={() => {
                                  setReviewDialog({
                                    action: 'reject',
                                    request: item,
                                  });
                                  setAdminNote('');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300 px-3 py-1.5 text-xs font-semibold"
                              >
                                <XCircle className="w-4 h-4" />
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Clock3 className="w-3.5 h-3.5" />
                              Không còn thao tác
                            </span>
                          )}
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
                  onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                  disabled={!listQuery.data.hasPrevious}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  Trang trước
                </button>

                <span className="text-slate-500">
                  Trang {pageNumber}/{listQuery.data.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPageNumber((page) =>
                      Math.min(listQuery.data!.totalPages, page + 1)
                    )
                  }
                  disabled={!listQuery.data.hasNext}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            ) : null}
          </section>
        </main>
      </div>

      {reviewDialog ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {reviewDialog.action === 'approve'
                ? 'Duyệt đơn nghỉ phép'
                : 'Từ chối đơn nghỉ phép'}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Bác sĩ: <strong>{reviewDialog.request.doctorFullName}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Thời gian: {formatDate(reviewDialog.request.startDate)} -{' '}
              {formatDate(reviewDialog.request.endDate)}
            </p>

            <label className="mt-4 block text-sm text-slate-700 dark:text-slate-300">
              <span className="block mb-1.5">
                Ghi chú admin (không bắt buộc)
              </span>
              <textarea
                rows={4}
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Nhập ghi chú để bác sĩ hiểu rõ quyết định của bạn"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (!isSubmittingReview) {
                    setReviewDialog(null);
                    setAdminNote('');
                  }
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm"
                disabled={isSubmittingReview}
              >
                Hủy
              </button>

              <button
                onClick={submitReview}
                disabled={isSubmittingReview}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  reviewDialog.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingReview
                  ? 'Đang xử lý...'
                  : reviewDialog.action === 'approve'
                    ? 'Xác nhận duyệt'
                    : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
