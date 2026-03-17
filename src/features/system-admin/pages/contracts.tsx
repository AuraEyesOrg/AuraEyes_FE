/**
 * System Admin Contracts Management Page
 * Lists all contracts, allows viewing scanned documents and verifying (signing) contracts.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { contractsApi } from '../api/contracts.api';
import { formatViDate } from '@/lib/date-utils';
import type {
  ContractDto,
  ContractStatusValue,
} from '../types/system-admin.types';

const CONTRACTS_QUERY_KEY = 'admin-contracts';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const statusConfigs: Record<
  ContractStatusValue,
  { label: string; bg: string; text: string; icon: typeof CheckCircle }
> = {
  Draft: {
    label: 'Nháp',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: FileText,
  },
  PendingSignature: {
    label: 'Chờ ký',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: Clock,
  },
  Active: {
    label: 'Hiệu lực',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: CheckCircle,
  },
  Expired: {
    label: 'Hết hạn',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: XCircle,
  },
  Terminated: {
    label: 'Đã hủy',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    icon: XCircle,
  },
  Cancelled: {
    label: 'Đã hủy bỏ',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: ContractStatusValue }) {
  const cfg = statusConfigs[status] ?? statusConfigs.Draft;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function UploadBadge({ hasUpload }: { hasUpload: boolean }) {
  if (hasUpload) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <CheckCircle className="w-3 h-3" />
        Đã upload
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
      Chưa upload
    </span>
  );
}

// ─────────────────────────────────────────────
// Contract Detail Dialog
// ─────────────────────────────────────────────
function ContractDetailDialog({
  contractId,
  onClose,
  onVerify,
}: {
  contractId: string;
  onClose: () => void;
  onVerify: (id: string) => void;
}) {
  const { data: contract, isLoading } = useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, contractId],
    queryFn: () => contractsApi.getContractById(contractId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl m-4 max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Chi tiết hợp đồng
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {contract && (
            <>
              {/* Contract info grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Mã hợp đồng" value={contract.contractNumber} />
                <InfoRow label="Trạng thái">
                  <StatusBadge
                    status={contract.status as ContractStatusValue}
                  />
                </InfoRow>
                <InfoRow label="Họ tên" value={contract.userFullName} />
                <InfoRow label="Email" value={contract.userEmail} />
                <InfoRow label="Mẫu hợp đồng" value={contract.templateTitle} />
                <InfoRow
                  label="Ngày tạo"
                  value={formatViDate(contract.createdAt)}
                />
                {contract.signedDate && (
                  <InfoRow
                    label="Ngày ký"
                    value={formatViDate(contract.signedDate)}
                  />
                )}
                <InfoRow
                  label="AI Quota"
                  value={String(contract.aiQuotaLimit)}
                />
                <InfoRow
                  label="Hoa hồng"
                  value={`${contract.platformCommissionRate}%`}
                />
              </div>

              {/* Scanned document */}
              {contract.scannedDocumentUrl && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Hợp đồng đã ký
                  </p>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/\.(jpe?g|png|webp|gif)(\?|$)/i.test(
                      contract.scannedDocumentUrl
                    ) ? (
                      <img
                        src={contract.scannedDocumentUrl}
                        alt="Scanned contract"
                        className="w-full max-h-[400px] object-contain bg-slate-50"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-800 gap-3">
                        <FileText className="w-10 h-10 text-slate-400" />
                        <p className="text-sm text-slate-500">
                          File PDF — nhấn liên kết bên dưới để mở
                        </p>
                      </div>
                    )}
                  </div>
                  <a
                    href={contract.scannedDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở file gốc trong tab mới
                  </a>
                </div>
              )}

              {/* Contract content preview */}
              {contract.signedContent && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nội dung hợp đồng
                  </p>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <iframe
                      srcDoc={contract.signedContent}
                      className="w-full h-64 border-0"
                      title="Contract content"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {contract &&
          contract.status === 'PendingSignature' &&
          contract.scannedDocumentUrl && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => onVerify(contractId)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận hợp đồng
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      {children ?? (
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {value || '—'}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ ký', value: 'PendingSignature' },
  { label: 'Hiệu lực', value: 'Active' },
  { label: 'Nháp', value: 'Draft' },
  { label: 'Hết hạn', value: 'Expired' },
  { label: 'Đã hủy', value: 'Terminated' },
];

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, { search, statusFilter, page }],
    queryFn: () =>
      contractsApi.getContracts({
        searchTerm: search || undefined,
        status: statusFilter || undefined,
        pageNumber: page,
        pageSize,
      }),
  });

  const contracts: ContractDto[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const signMutation = useMutation({
    mutationFn: (id: string) => contractsApi.signContract(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      setSelectedId(null);
    },
  });

  const handleVerify = (id: string) => {
    signMutation.mutate(id);
  };

  // Count pending contracts with uploaded documents
  const pendingWithUpload = contracts.filter(
    (c) => c.status === 'PendingSignature' && c.scannedDocumentUrl
  ).length;

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Quản lý hợp đồng"
          description="Xem danh sách, xác nhận hợp đồng đã ký của bác sĩ nhãn khoa"
        />

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Tổng hợp đồng"
              value={data?.totalCount ?? 0}
              icon={FileText}
              color="text-slate-600 bg-slate-100"
            />
            <StatCard
              label="Chờ xác nhận"
              value={pendingWithUpload}
              icon={AlertTriangle}
              color="text-amber-600 bg-amber-100"
            />
            <StatCard
              label="Hiệu lực"
              value={contracts.filter((c) => c.status === 'Active').length}
              icon={CheckCircle}
              color="text-emerald-600 bg-emerald-100"
            />
            <StatCard
              label="Chờ upload"
              value={
                contracts.filter(
                  (c) =>
                    c.status === 'PendingSignature' && !c.scannedDocumentUrl
                ).length
              }
              icon={Clock}
              color="text-blue-600 bg-blue-100"
            />
          </div>

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, mã hợp đồng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Không tìm thấy hợp đồng nào.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Mã HĐ</th>
                    <th className="px-5 py-3">Bác sĩ</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Upload</th>
                    <th className="px-5 py-3">Ngày tạo</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contracts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-mono text-slate-900 dark:text-white">
                        {c.contractNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {c.userFullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {c.userEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status as ContractStatusValue} />
                      </td>
                      <td className="px-5 py-3.5">
                        <UploadBadge hasUpload={!!c.scannedDocumentUrl} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {formatViDate(c.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedId(c.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'PendingSignature' &&
                            c.scannedDocumentUrl && (
                              <button
                                onClick={() => handleVerify(c.id)}
                                disabled={signMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                title="Xác nhận hợp đồng"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Xác nhận
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">
                    Trang {page} / {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail dialog */}
      {selectedId && (
        <ContractDetailDialog
          contractId={selectedId}
          onClose={() => setSelectedId(null)}
          onVerify={handleVerify}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
