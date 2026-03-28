/**
 * Verification Requests Page
 * Dedicated System Admin view for reviewing & approving/rejecting
 * pending ophthalmologist credential submissions.
 *
 * Columns: Doctor Info | Documents | Submitted At | Actions
 * – No irrelevant columns (Earnings, Rating) shown for unverified doctors
 * – TanStack Query for data fetching + cache invalidation
 * – Approve / Reject confirmation modals (no window.prompt / window.confirm)
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  Eye,
  ZoomIn,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  ophthalmologistApi,
  type OphthalmologistListItem,
} from '../api/ophthalmologist.api';
import { formatTimeAgo } from '@/lib/utility';
import Spinner from '@/components/ui/spinner';
import AvatarFallback from '@/components/ui/avatar-fallback';

// ─────────────────────────────────────────────
// Query key
// ─────────────────────────────────────────────
const QUERY_KEY = ['admin', 'verification-requests'] as const;

const formatDate = (value: string | undefined) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const isImageUrl = (url: string) =>
  /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

const getCredentialCounts = (doctor: OphthalmologistListItem) => {
  const licenseCount = doctor.licenses?.length ?? (doctor.licenseUrl ? 1 : 0);
  const degreeCount = doctor.degrees?.length ?? (doctor.degreeUrl ? 1 : 0);
  return { licenseCount, degreeCount };
};

// ─────────────────────────────────────────────
// Approve Modal
// ─────────────────────────────────────────────
interface ApproveModalProps {
  doctor: OphthalmologistListItem;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
function ApproveModal({
  doctor,
  onConfirm,
  onCancel,
  isLoading,
}: ApproveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onCancel : undefined}
      />
      <div className="relative z-10 w-full max-w-md m-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Xác nhận phê duyệt
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Doctor card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
            <AvatarFallback
              fullName={doctor.fullName}
              size="w-12 h-12"
              className="flex-shrink-0 text-sm"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {doctor.fullName}
              </p>
              <p className="text-sm text-slate-500">{doctor.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {doctor.yearsOfExperience} năm kinh nghiệm
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bạn có chắc chắn muốn{' '}
            <span className="font-semibold text-emerald-600">phê duyệt</span> hồ
            sơ chứng chỉ của bác sĩ này? Hành động này sẽ cấp quyền hoạt động
            đầy đủ trên hệ thống AURA.
          </p>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Bác sĩ sẽ nhận email thông báo và có thể bắt đầu nhận ca tư vấn
              ngay lập tức.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Spinner size={16} className="text-white" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Xác nhận phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reject Modal
// ─────────────────────────────────────────────
interface RejectModalProps {
  doctor: OphthalmologistListItem;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}
function RejectModal({
  doctor,
  onConfirm,
  onCancel,
  isLoading,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onCancel : undefined}
      />
      <div className="relative z-10 w-full max-w-md m-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Từ chối xác minh
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Doctor card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
            <AvatarFallback
              fullName={doctor.fullName}
              size="w-12 h-12"
              className="flex-shrink-0 text-sm"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {doctor.fullName}
              </p>
              <p className="text-sm text-slate-500">{doctor.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="Mô tả rõ lý do từ chối (ví dụ: ảnh giấy phép không rõ nét, chứng chỉ chưa có hiệu lực, thiếu bằng cấp chuyên ngành...)"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-400/50 focus:border-red-400 outline-none resize-none text-sm transition-all"
            />
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Lý do sẽ được gửi qua email đến bác sĩ. Hãy mô tả cụ thể để họ có
              thể bổ sung hồ sơ.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Spinner size={16} className="text-white" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-xl bg-white dark:bg-slate-900 p-3 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={imageUrl}
          alt="Credential preview"
          className="max-h-[80vh] w-full rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

interface VerificationDetailModalProps {
  doctor: OphthalmologistListItem;
  onClose: () => void;
  onZoomImage: (imageUrl: string) => void;
}

function VerificationDetailModal({
  doctor,
  onClose,
  onZoomImage,
}: VerificationDetailModalProps) {
  const licenses = doctor.licenses ?? [];
  const degrees = doctor.degrees ?? [];

  const renderCredentialCards = (
    credentials: NonNullable<OphthalmologistListItem['licenses']>,
    emptyMessage: string
  ) => {
    if (!credentials.length) {
      return (
        <p className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {credentials.map((credential) => (
          <article
            key={credential.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-4"
          >
            <h5 className="font-semibold text-slate-900 dark:text-white">
              {credential.name}
            </h5>
            <dl className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between gap-3">
                <dt>Cơ quan cấp</dt>
                <dd className="text-right">
                  {credential.issuingAuthority || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ngày cấp</dt>
                <dd className="text-right">
                  {formatDate(credential.issuedDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ngày hết hạn</dt>
                <dd className="text-right">
                  {formatDate(credential.expiryDate)}
                </dd>
              </div>
            </dl>

            {credential.certificateUrl && (
              <div className="mt-3 space-y-2">
                {isImageUrl(credential.certificateUrl) ? (
                  <button
                    type="button"
                    onClick={() => onZoomImage(credential.certificateUrl!)}
                    className="group block w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={credential.certificateUrl}
                      alt={credential.name}
                      className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="flex items-center justify-center gap-1.5 bg-slate-100 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ZoomIn className="h-3.5 w-3.5" />
                      Zoom ảnh
                    </div>
                  </button>
                ) : (
                  <a
                    href={credential.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Mở tài liệu
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Verification Details
            </h3>
            <p className="text-sm text-slate-500">
              {doctor.fullName} • {doctor.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[85vh] space-y-6 overflow-y-auto p-6">
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Licenses / Certificates ({licenses.length})
            </h4>
            {renderCredentialCards(
              licenses,
              'Bác sĩ chưa cung cấp giấy phép hoặc chứng chỉ hợp lệ.'
            )}
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Degrees ({degrees.length})
            </h4>
            {renderCredentialCards(
              degrees,
              'Bác sĩ chưa cung cấp thông tin bằng cấp.'
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function VerificationRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [approvingDoctor, setApprovingDoctor] =
    useState<OphthalmologistListItem | null>(null);
  const [rejectingDoctor, setRejectingDoctor] =
    useState<OphthalmologistListItem | null>(null);
  const [detailDoctor, setDetailDoctor] =
    useState<OphthalmologistListItem | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // ── Fetch pending list ──────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...QUERY_KEY, pageNumber, searchQuery],
    queryFn: () =>
      ophthalmologistApi.getOphthalmologists(
        pageNumber,
        10,
        searchQuery || undefined,
        'PendingVerification'
      ),
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasNext = data?.hasNext ?? false;
  const hasPrevious = data?.hasPrevious ?? false;

  // ── Mutations ───────────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      ophthalmologistApi.verifyOphthalmologist(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setApprovingDoctor(null);
      toast.success('Đã phê duyệt hồ sơ bác sĩ thành công.');
    },
    onError: () => {
      toast.error('Phê duyệt thất bại. Vui lòng thử lại.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ophthalmologistApi.verifyOphthalmologist(id, false, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setRejectingDoctor(null);
      toast.success('Đã từ chối hồ sơ bác sĩ thành công.');
    },
    onError: () => {
      toast.error('Từ chối hồ sơ thất bại. Vui lòng thử lại.');
    },
  });

  const handleApproveConfirm = () => {
    if (!approvingDoctor) return;
    approveMutation.mutate(approvingDoctor.id);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingDoctor) return;
    rejectMutation.mutate({ id: rejectingDoctor.id, reason });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Verification Requests"
          description="Review and approve ophthalmologist credential submissions"
          actions={
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: QUERY_KEY })
              }
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1400px] mx-auto w-full space-y-5">
            {/* Summary banner */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {totalCount} hồ sơ đang chờ xét duyệt
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Mỗi bác sĩ cần được xem xét kỹ tài liệu trước khi phê duyệt
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="Tìm theo tên, email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Bác sĩ
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Credentials Summary
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Thời gian nộp
                    </th>
                    <th className="text-center px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                          <p className="text-slate-500 font-medium">
                            Không có hồ sơ nào đang chờ xét duyệt
                          </p>
                          <p className="text-slate-400 text-xs">
                            Tất cả yêu cầu đã được xử lý!
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((doctor) => (
                      <tr
                        key={doctor.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Doctor info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <AvatarFallback
                              fullName={doctor.fullName}
                              size="w-10 h-10"
                              className="flex-shrink-0 text-sm"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {doctor.fullName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {doctor.email}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-400">
                                  {doctor.yearsOfExperience} năm KN
                                </span>
                                {doctor.organisationName && (
                                  <>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                      {doctor.organisationName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Documents */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {(() => {
                              const { licenseCount, degreeCount } =
                                getCredentialCounts(doctor);
                              return (
                                <>
                                  <p className="font-medium text-slate-700 dark:text-slate-200">
                                    Có {licenseCount} giấy phép, {degreeCount}{' '}
                                    bằng cấp
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Nhấn "View Details" để xem hồ sơ chi tiết
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Submitted at */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {formatTimeAgo(doctor.createdAt)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(doctor.createdAt).toLocaleDateString(
                                'vi-VN',
                                {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => setDetailDoctor(doctor)}
                              title="View details"
                              className="group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>

                            {/* Approve */}
                            <button
                              onClick={() => setApprovingDoctor(doctor)}
                              title="Phê duyệt"
                              className="group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-400 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Duyệt
                            </button>

                            {/* Reject */}
                            <button
                              onClick={() => setRejectingDoctor(doctor)}
                              title="Từ chối"
                              className="group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-400 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(hasNext || hasPrevious) && (
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Hiển thị {items.length} / {totalCount} hồ sơ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!hasPrevious}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-2 font-medium">Trang {pageNumber}</span>
                  <button
                    disabled={!hasNext}
                    onClick={() => setPageNumber((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Approve confirmation modal */}
      {approvingDoctor && (
        <ApproveModal
          doctor={approvingDoctor}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApprovingDoctor(null)}
          isLoading={approveMutation.isPending}
        />
      )}

      {/* Reject modal */}
      {rejectingDoctor && (
        <RejectModal
          doctor={rejectingDoctor}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingDoctor(null)}
          isLoading={rejectMutation.isPending}
        />
      )}

      {detailDoctor && (
        <VerificationDetailModal
          doctor={detailDoctor}
          onClose={() => setDetailDoctor(null)}
          onZoomImage={(imageUrl) => setZoomedImageUrl(imageUrl)}
        />
      )}

      {zoomedImageUrl && (
        <ImagePreviewModal
          imageUrl={zoomedImageUrl}
          onClose={() => setZoomedImageUrl(null)}
        />
      )}
    </div>
  );
}
