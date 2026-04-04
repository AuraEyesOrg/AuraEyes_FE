/**
 * Ophthalmologist Contract Page
 * Shows the ophthalmologist's contract status, template preview,
 * and upload area for signed contract image.
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import { formatViDate } from '@/lib/date-utils';
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
import Spinner from '@/components/ui/spinner';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { extractApiErrorMessage } from '@/lib/api-error';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';

const CONTRACT_QUERY_KEY = ['ophthalmologist', 'my-contract'] as const;

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
  if (!response.ok) {
    throw new Error('Không thể tải file mẫu hợp đồng.');
  }

  const blob = await response.blob();
  const extension = getFileExtension(fileUrl);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `contract-${contractNumber}.${extension || 'docx'}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────
function getStatusConfig(
  status: string,
  hasUpload: boolean,
  t: (key: string, fallback: string) => string
) {
  switch (status) {
    case 'PendingSignature':
      return hasUpload
        ? {
            label: t(
              'Ophthalmologist.contract.status.uploadedPendingApproval',
              'Uploaded - Waiting for admin approval'
            ),
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            dotColor: 'bg-blue-500',
            icon: Clock,
          }
        : {
            label: t(
              'Ophthalmologist.contract.status.pendingSignature',
              'Waiting for signature'
            ),
            color: 'text-amber-600 bg-amber-50 border-amber-200',
            dotColor: 'bg-amber-500',
            icon: AlertTriangle,
          };
    case 'Active':
      return {
        label: t('Ophthalmologist.contract.status.active', 'Active'),
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        dotColor: 'bg-emerald-500',
        icon: CheckCircle,
      };
    case 'Draft':
      return {
        label: t('Ophthalmologist.contract.status.draft', 'Draft'),
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
// Upload Section
// ─────────────────────────────────────────────
function UploadSection({
  contract,
  onUploadSuccess,
  allowReupload,
  t,
}: {
  contract: ContractDetailDto;
  onUploadSuccess: () => void;
  allowReupload: boolean;
  t: (key: string, fallback: string) => string;
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
      ophthalToast.success(
        t(
          'Ophthalmologist.contract.upload.uploadSuccess',
          'Signed contract uploaded successfully.'
        )
      );
      onUploadSuccess();
    },
    onError: (error) => {
      ophthalToast.error(
        extractApiErrorMessage(
          error,
          t(
            'Ophthalmologist.contract.upload.uploadFailed',
            'Upload failed. Please try again.'
          )
        )
      );
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
      ophthalToast.error(
        t(
          'Ophthalmologist.contract.upload.invalidType',
          'Only JPEG, PNG, WebP, or PDF files are allowed.'
        )
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      ophthalToast.error(
        t(
          'Ophthalmologist.contract.upload.fileTooLarge',
          'File size must not exceed 10MB.'
        )
      );
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
  const isActiveContract = contract.status === 'Active';

  // Already uploaded — show the scanned document prominently
  if (contract.scannedDocumentUrl && !showReupload) {
    return (
      <div className="space-y-4">
        {/* Uploaded document preview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
          {isImageUrl(contract.scannedDocumentUrl) ? (
            <img
              src={contract.scannedDocumentUrl}
              alt={t(
                'Ophthalmologist.contract.upload.signedContract',
                'Signed contract'
              )}
              className="w-full max-h-125 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FileText className="w-14 h-14 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  {t(
                    'Ophthalmologist.contract.upload.pdfUploaded',
                    'PDF file uploaded'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status + actions row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActiveContract
                  ? 'bg-emerald-100 dark:bg-emerald-900/40'
                  : 'bg-blue-100 dark:bg-blue-900/40'
              }`}
            >
              {isActiveContract ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {isActiveContract
                  ? t(
                      'Ophthalmologist.contract.activeTitle',
                      'Contract has been activated!'
                    )
                  : t(
                      'Ophthalmologist.contract.upload.waitingAdmin',
                      'Waiting for admin confirmation'
                    )}
              </p>
              <p className="text-xs text-slate-500">
                {isActiveContract
                  ? t(
                      'Ophthalmologist.contract.activeDescription',
                      'You can now start receiving cases and consulting on the AURA platform.'
                    )
                  : t(
                      'Ophthalmologist.contract.upload.sentNotice',
                      'Your contract has been submitted'
                    )}
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
              {t(
                'Ophthalmologist.contract.upload.openOriginal',
                'Open original'
              )}
            </a>
            {allowReupload ? (
              <button
                onClick={() => setShowReupload(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('Ophthalmologist.contract.upload.reupload', 'Re-upload')}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('Ophthalmologist.contract.status.active', 'Active')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!allowReupload) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'Ophthalmologist.contract.activeDescription',
          'You can now start receiving cases and consulting on the AURA platform.'
        )}
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
          {t(
            'Ophthalmologist.contract.upload.cancelReupload',
            'Cancel and return to submitted contract'
          )}
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
          {t(
            'Ophthalmologist.contract.upload.dropzoneLabel',
            'Drag and drop contract file here or'
          )}{' '}
          <span className="text-primary font-semibold">
            {t('Ophthalmologist.contract.upload.selectFile', 'select file')}
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {t(
            'Ophthalmologist.contract.upload.dropzoneHint',
            'JPEG, PNG, WebP, or PDF - Max 10MB'
          )}
        </p>
      </div>

      {/* Preview */}
      {selectedFile && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={t('Ophthalmologist.contract.upload.preview', 'Preview')}
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
            <Spinner size={16} className="text-white" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {t(
            'Ophthalmologist.contract.upload.uploadSignedContract',
            'Upload signed contract'
          )}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ContractPage() {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const {
    data: contract,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...CONTRACT_QUERY_KEY],
    queryFn: contractApi.getMyContract,
  });

  // Sync contractStatus to auth store when admin activates the contract.
  // Keep doctor on this page so they can still review/download the contract.
  useEffect(() => {
    if (contract?.status === 'Active' && user?.contractStatus !== 'Active') {
      setUser({ ...user!, contractStatus: 'Active' });
    }
  }, [contract?.status, setUser, user]);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY });
  };

  const statusConfig = contract
    ? getStatusConfig(contract.status, !!contract.scannedDocumentUrl, t)
    : null;

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <DoctorSidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.contract.title', 'Contract')}
        />

        <main className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('Ophthalmologist.contract.title', 'Contract')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t(
                  'Ophthalmologist.contract.subtitle',
                  'View, download, and upload your cooperation contract with AURA'
                )}
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
                {t('Ophthalmologist.contract.refresh', 'Refresh')}
              </button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">
                  {t(
                    'Ophthalmologist.contract.loading',
                    'Loading contract information...'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-amber-800">
                {t('Ophthalmologist.contract.emptyTitle', 'No contract yet')}
              </p>
              <p className="text-sm text-amber-600 mt-1">
                {t(
                  'Ophthalmologist.contract.emptyDescription',
                  'A contract will be generated after admin approves your verification profile.'
                )}
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
                    {t(
                      'Ophthalmologist.contract.contractCode',
                      'Contract code'
                    )}
                    : {contract.contractNumber}
                  </p>
                </div>
                {contract.signedDate && (
                  <div className="text-right text-xs">
                    <p className="opacity-60">
                      {t('Ophthalmologist.contract.signedDate', 'Signed date')}
                    </p>
                    <p className="font-medium">
                      {formatViDate(contract.signedDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Contract details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {t(
                      'Ophthalmologist.contract.contractInfo',
                      'Contract information'
                    )}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t('Ophthalmologist.contract.template', 'Template')}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.templateTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t('Ophthalmologist.contract.type', 'Type')}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {t(
                          'Ophthalmologist.contract.ophthalmologistType',
                          'Ophthalmologist'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t(
                          'Ophthalmologist.contract.createdDate',
                          'Created date'
                        )}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatViDate(contract.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t('Ophthalmologist.contract.commission', 'Commission')}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.commissionRate != null
                          ? `${contract.commissionRate}%`
                          : t(
                              'Ophthalmologist.contract.pendingDeal',
                              'Pending deal'
                            )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t(
                          'Ophthalmologist.contract.actualSalary',
                          'Actual salary'
                        )}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.actualMonthlySalary != null
                          ? `${contract.actualMonthlySalary.toLocaleString('vi-VN')} VND`
                          : t(
                              'Ophthalmologist.contract.pendingDeal',
                              'Pending deal'
                            )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {t('Ophthalmologist.contract.signer', 'Signer')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t('Ophthalmologist.contract.fullName', 'Full name')}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {contract.userFullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        {t('Ophthalmologist.common.email', 'Email')}
                      </span>
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
                  {t('Ophthalmologist.contract.actions', 'Actions')}
                </p>

                {/* View contract template */}
                {contract.signedContent && (
                  <button
                    onClick={() =>
                      openContractTemplate(contract.signedContent!)
                    }
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t(
                          'Ophthalmologist.contract.viewTemplate',
                          'View contract template'
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(
                          'Ophthalmologist.contract.viewTemplateHint',
                          'Open the contract template file in a new tab'
                        )}
                      </p>
                    </div>
                  </button>
                )}

                {/* Download link */}
                {contract.signedContent && (
                  <button
                    onClick={async () => {
                      try {
                        await downloadContractTemplate(
                          contract.signedContent!,
                          contract.contractNumber
                        );
                      } catch (error) {
                        ophthalToast.error(
                          error instanceof Error
                            ? error.message
                            : t(
                                'Ophthalmologist.contract.downloadFailed',
                                'Unable to download contract template file.'
                              )
                        );
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t(
                          'Ophthalmologist.contract.downloadTemplate',
                          'Download contract template'
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(
                          'Ophthalmologist.contract.downloadTemplateHint',
                          'Download the original file for printing and signing'
                        )}
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Upload/signed section - visible for PendingSignature and Active */}
              {(contract.status === 'PendingSignature' ||
                contract.status === 'Active') && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {contract.scannedDocumentUrl
                        ? t(
                            'Ophthalmologist.contract.upload.signedContract',
                            'Signed contract'
                          )
                        : t(
                            'Ophthalmologist.contract.upload.uploadSignedTitle',
                            'Upload signed contract'
                          )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {contract.scannedDocumentUrl
                        ? contract.status === 'Active'
                          ? t(
                              'Ophthalmologist.contract.activeDescription',
                              'You can now start receiving cases and consulting on the AURA platform.'
                            )
                          : t(
                              'Ophthalmologist.contract.upload.sentNotice',
                              'Your contract has been submitted'
                            )
                        : t(
                            'Ophthalmologist.contract.upload.uploadSignedDescription',
                            'Print the contract, sign and stamp it, then upload a photo or scanned copy'
                          )}
                    </p>
                  </div>

                  {/* Step guide */}
                  {contract.status === 'PendingSignature' &&
                    !contract.scannedDocumentUrl && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            step: 1,
                            icon: Download,
                            text: t(
                              'Ophthalmologist.contract.upload.steps.downloadPrint',
                              'Download and print contract'
                            ),
                          },
                          {
                            step: 2,
                            icon: FileText,
                            text: t(
                              'Ophthalmologist.contract.upload.steps.signStamp',
                              'Sign and stamp'
                            ),
                          },
                          {
                            step: 3,
                            icon: Image,
                            text: t(
                              'Ophthalmologist.contract.upload.steps.captureUpload',
                              'Capture and upload'
                            ),
                          },
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
                    allowReupload={contract.status === 'PendingSignature'}
                    t={t}
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
                        {t(
                          'Ophthalmologist.contract.activeTitle',
                          'Contract has been activated!'
                        )}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {t(
                          'Ophthalmologist.contract.activeDescription',
                          'You can now start receiving cases and consulting on the AURA platform.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
