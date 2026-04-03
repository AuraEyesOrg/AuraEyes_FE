import { useMemo, useState, type ComponentType } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock3,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  ophthalmologistApi,
  type AdminWithdrawalRequestItem,
  type WithdrawalRequestStatus,
} from '../api/ophthalmologist.api';

const statusOptions: Array<{
  label: string;
  value: WithdrawalRequestStatus | 'all';
}> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang chờ', value: 'Pending' },
  { label: 'Đang xử lý', value: 'Processing' },
  { label: 'Hoàn tất', value: 'Completed' },
  { label: 'Từ chối', value: 'Failed' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const formatMoney = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString('vi-VN');
};

const getStatusChip = (status: WithdrawalRequestStatus) => {
  if (status === 'Completed') {
    return {
      label: 'Đã hoàn tất',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      icon: BadgeCheck,
    };
  }

  if (status === 'Failed' || status === 'Cancelled') {
    return {
      label: status === 'Cancelled' ? 'Đã hủy' : 'Từ chối',
      className:
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      icon: XCircle,
    };
  }

  return {
    label: status === 'Processing' ? 'Đang xử lý' : 'Đang chờ',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: Clock3,
  };
};

export default function WithdrawalRequestsPage() {
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<WithdrawalRequestStatus | 'all'>(
    'Pending'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [transferReference, setTransferReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const listQuery = useQuery({
    queryKey: [
      'admin',
      'withdrawal-requests',
      { pageNumber, pageSize, status },
    ],
    queryFn: () =>
      ophthalmologistApi.getWithdrawalRequests(
        pageNumber,
        pageSize,
        status === 'all' ? undefined : status
      ),
  });

  const confirmMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.confirmWithdrawalRequest(requestId, {
        transferReference: transferReference.trim() || undefined,
        note: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã xác nhận chuyển khoản thành công.');
      setConfirmingId(null);
      setTransferReference('');
      setAdminNote('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Không thể xác nhận yêu cầu.';
      toast.error(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      ophthalmologistApi.rejectWithdrawalRequest(requestId, {
        reason: rejectReason.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu rút tiền.');
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'withdrawal-requests'],
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Không thể từ chối yêu cầu.';
      toast.error(message);
    },
  });

  const filteredItems = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) => {
      return (
        item.doctorFullName.toLowerCase().includes(keyword) ||
        item.doctorEmail.toLowerCase().includes(keyword) ||
        item.bankAccountNumber.toLowerCase().includes(keyword) ||
        item.bankName.toLowerCase().includes(keyword) ||
        (item.contractNumber ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [listQuery.data?.items, searchTerm]);

  const summary = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const pending = items.filter(
      (x) => x.status === 'Pending' || x.status === 'Processing'
    ).length;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    return { pending, totalAmount };
  }, [listQuery.data?.items]);

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <PageHeader
          title="Withdrawal Requests"
          description="Xử lý yêu cầu rút tiền của bác sĩ"
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Yêu cầu chờ xử lý
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {summary.pending}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-4">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Tổng tiền trên trang hiện tại
              </p>
              <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                {formatMoney(summary.totalAmount)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 min-w-60">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm bác sĩ, email, STK..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(
                      e.target.value as WithdrawalRequestStatus | 'all'
                    );
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
                Không có yêu cầu rút tiền nào.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const statusChip = getStatusChip(item.status);
                  const StatusIcon = statusChip.icon;
                  const canProcess =
                    item.status === 'Pending' || item.status === 'Processing';

                  return (
                    <RequestCard
                      key={item.id}
                      item={item}
                      canProcess={canProcess}
                      statusLabel={statusChip.label}
                      statusClassName={statusChip.className}
                      StatusIcon={StatusIcon}
                      onConfirm={() => {
                        setConfirmingId(item.id);
                        setTransferReference(item.transferReference ?? '');
                        setAdminNote(item.adminNote ?? '');
                      }}
                      onReject={() => {
                        setRejectingId(item.id);
                        setRejectReason('');
                      }}
                    />
                  );
                })}
              </div>
            )}

            {listQuery.data && listQuery.data.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!listQuery.data.hasPrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Trước
                </button>
                <p className="text-sm text-slate-500">
                  Trang {listQuery.data.pageNumber}/{listQuery.data.totalPages}
                </p>
                <button
                  onClick={() =>
                    setPageNumber((p) =>
                      Math.min(listQuery.data!.totalPages, p + 1)
                    )
                  }
                  disabled={!listQuery.data.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  Sau
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {confirmingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-lg font-semibold">Xác nhận đã chuyển khoản</h3>
            <label className="block space-y-1 text-sm">
              <span>Mã giao dịch/ủy nhiệm chi</span>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Ghi chú admin</span>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmMutation.mutate(confirmingId)}
                disabled={confirmMutation.isPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {confirmMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRejectingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-lg font-semibold">Từ chối yêu cầu rút tiền</h3>
            <label className="block space-y-1 text-sm">
              <span>Lý do (không bắt buộc)</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => rejectMutation.mutate(rejectingId)}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {rejectMutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface RequestCardProps {
  item: AdminWithdrawalRequestItem;
  canProcess: boolean;
  statusLabel: string;
  statusClassName: string;
  StatusIcon: ComponentType<{ className?: string }>;
  onConfirm: () => void;
  onReject: () => void;
}

function RequestCard({
  item,
  canProcess,
  statusLabel,
  statusClassName,
  StatusIcon,
  onConfirm,
  onReject,
}: RequestCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {item.doctorFullName}
          </p>
          <p className="text-xs text-slate-500">{item.doctorEmail}</p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">Số tiền</p>
          <p className="font-semibold text-slate-900 dark:text-white mt-1">
            {formatMoney(item.amount)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">Ngân hàng / STK</p>
          <p className="font-semibold text-slate-900 dark:text-white mt-1">
            {item.bankName}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {item.bankAccountNumber}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {item.accountHolderName}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-slate-500">Thời gian</p>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
            Tạo: {formatDate(item.createdAt)}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
            Xử lý: {formatDate(item.processedAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 space-y-1">
        {item.contractNumber ? <p>Hợp đồng: {item.contractNumber}</p> : null}
        {item.transferReference ? <p>Mã CK: {item.transferReference}</p> : null}
        {item.note ? <p>Ghi chú bác sĩ: {item.note}</p> : null}
        {item.adminNote ? <p>Ghi chú admin: {item.adminNote}</p> : null}
      </div>

      {canProcess ? (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onReject}
            className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 text-sm font-medium"
          >
            Từ chối
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
          >
            Xác nhận đã chuyển khoản
          </button>
        </div>
      ) : null}
    </div>
  );
}
