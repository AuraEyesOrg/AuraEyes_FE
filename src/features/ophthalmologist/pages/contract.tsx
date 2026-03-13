/**
 * Ophthalmologist Contract Page
 * Shows the ophthalmologist's contract status, template preview,
 * and upload area for signed contract image.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  X,
  Image,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import DoctorSidebar from '../components/DoctorSidebar';
import DoctorHeader from '../components/DoctorHeader';
import { contractApi, type ContractDetailDto } from '../api/contract.api';

const CONTRACT_QUERY_KEY = ['ophthalmologist', 'my-contract'] as const;

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────
function getStatusConfig(status: string, hasUpload: boolean) {
  switch (status) {
    case 'PendingSignature':
      return hasUpload
        ? {
            label: 'Đã upload — Chờ admin duyệt',
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            dotColor: 'bg-blue-500',
            icon: Clock,
          }
        : {
            label: 'Chờ ký hợp đồng',
            color: 'text-amber-600 bg-amber-50 border-amber-200',
            dotColor: 'bg-amber-500',
            icon: AlertTriangle,
          };
    case 'Active':
      return {
        label: 'Đang hiệu lực',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        dotColor: 'bg-emerald-500',
        icon: CheckCircle,
      };
    case 'Draft':
      return {
        label: 'Nháp',
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        dotColor: 'bg-slate-400',
        icon: FileText,
      };
    default:
      return {
        label: status,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        dotColor: 'bg-slate-400',
        icon: FileText,
      };
  }
}

// ─────────────────────────────────────────────
// Contract Preview Modal
// ─────────────────────────────────────────────
function ContractPreviewModal({
  html,
  onClose,
}: {
  html: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl m-4 max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Xem trước hợp đồng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          <iframe
            srcDoc={html}
            className="w-full min-h-[70vh] border-0"
            title="Contract Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Upload Section
// ─────────────────────────────────────────────
function UploadSection({
  contract,
  onUploadSuccess,
}: {
  contract: ContractDetailDto;
  onUploadSuccess: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showReupload, setShowReupload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => contractApi.uploadSignedContract(file),
    onSuccess: () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowReupload(false);
      onUploadSuccess();
    },
  });

  const handleFile = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file JPEG, PNG, WebP hoặc PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 10MB.');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);

  // Already uploaded — show the scanned document prominently
  if (contract.scannedDocumentUrl && !showReupload) {
    return (
      <div className="space-y-4">
        {/* Uploaded document preview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
          {isImageUrl(contract.scannedDocumentUrl) ? (
            <img
              src={contract.scannedDocumentUrl}
              alt="Hợp đồng đã ký"
              className="w-full max-h-125 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FileText className="w-14 h-14 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">File PDF đã upload</p>
              </div>
            </div>
          )}
        </div>

        {/* Status + actions row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Đang chờ admin xác nhận
              </p>
              <p className="text-xs text-slate-500">
                Hợp đồng của bạn đã được gửi đi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={contract.scannedDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mở ảnh gốc
            </a>
            <button
              onClick={() => setShowReupload(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cancel re-upload */}
      {showReupload && contract.scannedDocumentUrl && (
        <button
          onClick={() => {
            setShowReupload(false);
            setSelectedFile(null);
            setPreviewUrl(null);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Hủy, quay lại xem hợp đồng đã nộp
        </button>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Upload
          className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-primary' : 'text-slate-400'}`}
        />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Kéo thả ảnh hợp đồng vào đây hoặc{' '}
          <span className="text-primary font-semibold">chọn file</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          JPEG, PNG, WebP hoặc PDF — Tối đa 10MB
        </p>
      </div>

      {/* Preview */}
      {selectedFile && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Tải lên hợp đồng đã ký
        </button>
      )}

      {uploadMutation.isError && (
        <p className="text-sm text-red-500 text-center">
          Upload thất bại. Vui lòng thử lại.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ContractPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: contract,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...CONTRACT_QUERY_KEY],
    queryFn: contractApi.getMyContract,
  });

  // Sync contractStatus to auth store when admin activates the contract,
  // then redirect to dashboard so the doctor is no longer gated here.
  useEffect(() => {
    if (contract?.status === 'Active' && user?.contractStatus !== 'Active') {
      setUser({ ...user!, contractStatus: 'Active' });
      navigate('/ophthalmologist/dashboard', { replace: true });
    }
  }, [contract?.status]);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY });
  };

  const statusConfig = contract
    ? getStatusConfig(contract.status, !!contract.scannedDocumentUrl)
    : null;

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader />

        <main className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Hợp đồng hợp tác
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Xem, tải và upload hợp đồng hợp tác chuyên môn với AURA
              </p>
            </div>
            {contract && (
              <button
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: CONTRACT_QUERY_KEY,
                  })
                }
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">
                  Đang tải thông tin hợp đồng...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-amber-800">Chưa có hợp đồng</p>
              <p className="text-sm text-amber-600 mt-1">
                Hợp đồng sẽ được tạo sau khi admin phê duyệt hồ sơ xác minh của
                bạn.
              </p>
            </div>
          )}

          {/* Contract info */}
          {contract && (
            <>
              {/* Status card */}
              <div
                className={`flex items-center gap-4 p-5 rounded-xl border ${statusConfig?.color}`}
              >
                {statusConfig && (
                  <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0">
                    <statusConfig.icon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`h-2 w-2 rounded-full ${statusConfig?.dotColor} animate-pulse`}
                    />
                    <span className="font-semibold text-sm">
                      {statusConfig?.label}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">
                    Mã hợp đồng: {contract.contractNumber}
                  </p>
                </div>
                {contract.signedDate && (
                  <div className="text-right text-xs">
                    <p className="opacity-60">Ngày ký</p>
                    <p className="font-medium">
                      {new Date(contract.signedDate).toLocaleDateString(
                        'vi-VN'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Contract details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Thông tin hợp đồng
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Mẫu</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.templateTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Loại</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Bác sĩ nhãn khoa
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Ngày tạo</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(contract.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Người ký
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Họ tên</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.userFullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.userEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hành động
                </p>

                {/* View contract template */}
                {contract.signedContent && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Xem mẫu hợp đồng
                      </p>
                      <p className="text-xs text-slate-500">
                        Xem nội dung hợp đồng mẫu để in và ký
                      </p>
                    </div>
                  </button>
                )}

                {/* Download link */}
                {contract.signedContent && (
                  <button
                    onClick={() => {
                      const blob = new Blob([contract.signedContent!], {
                        type: 'text/html',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `contract-${contract.contractNumber}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Tải hợp đồng
                      </p>
                      <p className="text-xs text-slate-500">
                        Tải file HTML để in ra giấy và ký
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Upload section - only show when PendingSignature */}
              {contract.status === 'PendingSignature' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Upload hợp đồng đã ký
                    </p>
                    <p className="text-sm text-slate-500">
                      In hợp đồng, ký tên và đóng dấu, sau đó chụp ảnh hoặc scan
                      để upload
                    </p>
                  </div>

                  {/* Step guide */}
                  {!contract.scannedDocumentUrl && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          step: 1,
                          icon: Download,
                          text: 'Tải & in hợp đồng',
                        },
                        { step: 2, icon: FileText, text: 'Ký tên & đóng dấu' },
                        { step: 3, icon: Image, text: 'Chụp ảnh & upload' },
                      ].map(({ step, icon: Icon, text }) => (
                        <div
                          key={step}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                            {step}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <UploadSection
                    contract={contract}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </div>
              )}

              {/* Active contract info */}
              {contract.status === 'Active' && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        Hợp đồng đã được kích hoạt!
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Bạn có thể bắt đầu nhận ca bệnh và tư vấn trên hệ thống
                        AURA.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Contract preview modal */}
      {showPreview && contract?.signedContent && (
        <ContractPreviewModal
          html={contract.signedContent}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
