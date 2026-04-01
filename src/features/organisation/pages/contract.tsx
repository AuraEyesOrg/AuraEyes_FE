import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import {
  organisationContractApi,
  type OrganisationContractDetailDto,
} from '../api/contract.api';
import { toast } from 'react-toastify';

const CONTRACT_QUERY_KEY = ['organisation', 'my-contract'] as const;

const getFileExtension = (url: string) => {
  const cleanUrl = url.split('?')[0] ?? url;
  return cleanUrl.split('.').pop()?.toLowerCase() ?? '';
};

const getOfficeViewerUrl = (fileUrl: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;

const openContractTemplate = (fileUrl: string) => {
  const extension = getFileExtension(fileUrl);
  const previewUrl = ['doc', 'docx'].includes(extension)
    ? getOfficeViewerUrl(fileUrl)
    : fileUrl;

  window.open(previewUrl, '_blank', 'noopener,noreferrer');
};

const downloadContractTemplate = async (
  fileUrl: string,
  contractNumber: string
) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error('Không thể tải file mẫu hợp đồng.');

  const blob = await response.blob();
  const extension = getFileExtension(fileUrl);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `organisation-contract-${contractNumber}.${extension || 'docx'}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

function getStatusConfig(status: string, hasUpload: boolean) {
  switch (status) {
    case 'PendingSignature':
      return hasUpload
        ? {
            label: 'Đã upload - Chờ admin duyệt',
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
    default:
      return {
        label: status,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        dotColor: 'bg-slate-400',
        icon: FileText,
      };
  }
}

function UploadSection({
  contract,
  onUploadSuccess,
}: {
  contract: OrganisationContractDetailDto;
  onUploadSuccess: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showReupload, setShowReupload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      organisationContractApi.uploadSignedContract(file),
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
      toast.error('Chỉ chấp nhận file JPEG, PNG, WebP hoặc PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB.');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);

  if (contract.scannedDocumentUrl && !showReupload) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
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

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Đang chờ admin xác nhận
              </p>
              <p className="text-xs text-slate-500">
                Hợp đồng của tổ chức đã được gửi đi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={contract.scannedDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mở file gốc
            </a>
            <button
              onClick={() => setShowReupload(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100"
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
      {showReupload && contract.scannedDocumentUrl && (
        <button
          onClick={() => {
            setShowReupload(false);
            setSelectedFile(null);
            setPreviewUrl(null);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          <X className="w-3.5 h-3.5" />
          Hủy, quay lại xem hợp đồng đã nộp
        </button>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 hover:border-primary hover:bg-slate-50'
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
        <p className="text-sm font-medium text-slate-700">
          Kéo thả hợp đồng đã ký hoặc{' '}
          <span className="text-primary font-semibold">chọn file</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          JPEG, PNG, WebP hoặc PDF - Tối đa 10MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
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
            className="p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={() => uploadMutation.mutate(selectedFile)}
          disabled={uploadMutation.isPending}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60"
        >
          {uploadMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Tải lên hợp đồng đã ký
        </button>
      )}
    </div>
  );
}

export default function OrganisationContractPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    data: contract,
    isLoading,
    isError,
  } = useQuery({
    queryKey: CONTRACT_QUERY_KEY,
    queryFn: organisationContractApi.getMyContract,
  });

  useEffect(() => {
    if (
      contract?.status === 'Active' &&
      user &&
      user.contractStatus !== 'Active'
    ) {
      setUser({ ...user, contractStatus: 'Active' });
      navigate('/organisation/dashboard', { replace: true });
    }
  }, [contract?.status, navigate, setUser, user]);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY });
  };

  const statusConfig = contract
    ? getStatusConfig(contract.status, !!contract.scannedDocumentUrl)
    : null;

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Contract" />

        <main className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Hợp đồng tổ chức
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Xem, tải và upload hợp đồng hợp tác của tổ chức với AURA
              </p>
            </div>
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY })
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>

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

          {isError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-amber-800">Chưa có hợp đồng</p>
              <p className="text-sm text-amber-600 mt-1">
                Tài khoản đã được cấp nhưng hợp đồng chưa được System Admin khởi
                tạo.
              </p>
            </div>
          )}

          {contract && (
            <>
              <div
                className={`flex items-center gap-4 p-5 rounded-xl border ${statusConfig?.color}`}
              >
                {statusConfig && (
                  <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shrink-0">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Thông tin hợp đồng
                  </p>
                  <div className="space-y-3">
                    <Row label="Mẫu" value={contract.templateTitle} />
                    <Row label="Loại" value="Tổ chức y tế" />
                    <Row
                      label="Ngày tạo"
                      value={new Date(contract.createdAt).toLocaleDateString(
                        'vi-VN'
                      )}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Tài khoản tổ chức
                  </p>
                  <div className="space-y-3">
                    <Row label="Người liên hệ" value={contract.userFullName} />
                    <Row label="Email" value={contract.userEmail} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hành động
                </p>
                {contract.signedContent && (
                  <button
                    onClick={() =>
                      openContractTemplate(contract.signedContent!)
                    }
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Xem mẫu hợp đồng
                      </p>
                      <p className="text-xs text-slate-500">
                        Mở trực tiếp file hợp đồng ở tab mới
                      </p>
                    </div>
                  </button>
                )}
                {contract.signedContent && (
                  <button
                    onClick={async () => {
                      try {
                        setDownloadError(null);
                        await downloadContractTemplate(
                          contract.signedContent!,
                          contract.contractNumber
                        );
                      } catch (error) {
                        setDownloadError(
                          error instanceof Error
                            ? error.message
                            : 'Không thể tải file mẫu hợp đồng.'
                        );
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Tải mẫu hợp đồng
                      </p>
                      <p className="text-xs text-slate-500">
                        Tải file gốc để in và ký
                      </p>
                    </div>
                  </button>
                )}
                {downloadError && (
                  <p className="text-sm text-red-500">{downloadError}</p>
                )}
              </div>

              {contract.status === 'PendingSignature' && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Upload hợp đồng đã ký
                    </p>
                    <p className="text-sm text-slate-500">
                      Tải mẫu, ký đóng dấu rồi upload lại file scan hoặc ảnh
                      chụp.
                    </p>
                  </div>
                  {!contract.scannedDocumentUrl && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { step: 1, icon: Download, text: 'Tải & in hợp đồng' },
                        { step: 2, icon: FileText, text: 'Ký tên & đóng dấu' },
                        { step: 3, icon: Image, text: 'Chụp ảnh & upload' },
                      ].map(({ step, icon: Icon, text }) => (
                        <div
                          key={step}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                            {step}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right">
        {value}
      </span>
    </div>
  );
}
