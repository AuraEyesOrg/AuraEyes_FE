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
import { RefreshButton } from '@/components/ui/button/refresh-button';
import {
  organisationContractApi,
  type OrganisationContractDetailDto,
} from '../api/contract.api';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const CONTRACT_QUERY_KEY = ['organisation', 'my-contract'] as const;

type TranslateFn = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>
) => string;

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
  contractNumber: string,
  downloadErrorMessage: string
) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(downloadErrorMessage);

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

function getStatusConfig(status: string, hasUpload: boolean, t: TranslateFn) {
  switch (status) {
    case 'PendingSignature':
      return hasUpload
        ? {
            label: t(
              'Organisation.contract.status.pendingReview',
              'Uploaded - Awaiting admin review'
            ),
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            dotColor: 'bg-blue-500',
            icon: Clock,
          }
        : {
            label: t(
              'Organisation.contract.status.pendingSignature',
              'Pending contract signature'
            ),
            color: 'text-amber-600 bg-amber-50 border-amber-200',
            dotColor: 'bg-amber-500',
            icon: AlertTriangle,
          };
    case 'Active':
      return {
        label: t('Organisation.contract.status.active', 'Active'),
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
  const { t } = useSafeTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showReupload, setShowReupload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isActiveContract = contract.status === 'Active';

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
      toast.error(
        t(
          'Organisation.contract.toast.invalidFileType',
          'Only JPEG, PNG, WebP, or PDF files are accepted.'
        )
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        t(
          'Organisation.contract.toast.fileTooLarge',
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

  const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);

  if (contract.scannedDocumentUrl && !showReupload) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          {isImageUrl(contract.scannedDocumentUrl) ? (
            <img
              src={contract.scannedDocumentUrl}
              alt={t(
                'Organisation.contract.upload.signedContractAlt',
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
                    'Organisation.contract.upload.pdfUploaded',
                    'Uploaded PDF file'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActiveContract ? 'bg-emerald-100' : 'bg-blue-100'
              }`}
            >
              {isActiveContract ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isActiveContract
                  ? t(
                      'Organisation.contract.upload.activatedTitle',
                      'Contract has been activated'
                    )
                  : t(
                      'Organisation.contract.upload.awaitingAdminTitle',
                      'Awaiting admin confirmation'
                    )}
              </p>
              <p className="text-xs text-slate-500">
                {isActiveContract
                  ? t(
                      'Organisation.contract.upload.activatedDescription',
                      'Your organisation can now use all AURA features.'
                    )
                  : t(
                      'Organisation.contract.upload.awaitingAdminDescription',
                      'The organisation contract has been submitted for review.'
                    )}
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
              {t(
                'Organisation.contract.actions.openOriginalFile',
                'Open original file'
              )}
            </a>
            {!isActiveContract ? (
              <button
                onClick={() => setShowReupload(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('Organisation.contract.actions.reupload', 'Re-upload')}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('Organisation.contract.status.active', 'Active')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isActiveContract) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        {t(
          'Organisation.contract.upload.activeContractHint',
          'The organisation has completed signing and the contract is currently active.'
        )}
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
          {t(
            'Organisation.contract.actions.cancelReupload',
            'Cancel and go back to the submitted contract'
          )}
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
          {t(
            'Organisation.contract.upload.dropzonePrefix',
            'Drag and drop the signed contract or'
          )}{' '}
          <span className="text-primary font-semibold">
            {t('Organisation.contract.upload.selectFileAction', 'select file')}
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {t(
            'Organisation.contract.upload.supportedFormats',
            'JPEG, PNG, WebP, or PDF - Max 10MB'
          )}
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={t('Organisation.contract.upload.previewAlt', 'Preview')}
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
          {t(
            'Organisation.contract.actions.uploadSignedContract',
            'Upload signed contract'
          )}
        </button>
      )}
    </div>
  );
}

export default function OrganisationContractPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { t } = useSafeTranslation();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);

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
    }
  }, [contract?.status, navigate, setUser, user]);

  useEffect(() => {
    if (contract?.status !== 'Active') {
      setRedirectSeconds(null);
      return;
    }

    setRedirectSeconds(5);

    const timer = window.setInterval(() => {
      setRedirectSeconds((current) => {
        if (current === null) {
          return 5;
        }

        if (current <= 1) {
          window.clearInterval(timer);
          navigate('/organisation/dashboard', { replace: true });
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [contract?.status, navigate]);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY });
  };

  const statusConfig = contract
    ? getStatusConfig(contract.status, !!contract.scannedDocumentUrl, t)
    : null;

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader
          pageName={t('Organisation.contract.pageName', 'Contract')}
        />

        <main className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t(
                  'Organisation.contract.header.title',
                  'Organisation Contract'
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t(
                  'Organisation.contract.header.subtitle',
                  'View, download, and upload your organisation cooperation contract with AURA.'
                )}
              </p>
            </div>
            <RefreshButton
              onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEY })
              }
              label={t('Organisation.common.refresh', 'Refresh')}
              isRefreshing={isLoading}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">
                  {t(
                    'Organisation.contract.states.loading',
                    'Loading contract details...'
                  )}
                </p>
              </div>
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-amber-800">
                {t(
                  'Organisation.contract.states.noContractTitle',
                  'No contract found'
                )}
              </p>
              <p className="text-sm text-amber-600 mt-1">
                {t(
                  'Organisation.contract.states.noContractDescription',
                  'Your account is provisioned, but the contract has not been created by System Admin yet.'
                )}
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
                    {t(
                      'Organisation.contract.summary.contractCode',
                      'Contract code'
                    )}
                    : {contract.contractNumber}
                  </p>
                  {contract.status === 'Active' && redirectSeconds !== null && (
                    <p className="text-xs opacity-80 mt-1">
                      {t(
                        'Organisation.contract.summary.redirectIn',
                        'Auto redirect to dashboard in {{seconds}} seconds.',
                        { seconds: redirectSeconds }
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {t(
                      'Organisation.contract.sections.contractInfo',
                      'Contract Information'
                    )}
                  </p>
                  <div className="space-y-3">
                    <Row
                      label={t(
                        'Organisation.contract.fields.template',
                        'Template'
                      )}
                      value={contract.templateTitle}
                    />
                    <Row
                      label={t('Organisation.contract.fields.type', 'Type')}
                      value={t(
                        'Organisation.contract.fields.organisationType',
                        'Medical organisation'
                      )}
                    />
                    <Row
                      label={t(
                        'Organisation.contract.fields.createdAt',
                        'Created At'
                      )}
                      value={new Date(contract.createdAt).toLocaleDateString(
                        'vi-VN'
                      )}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {t(
                      'Organisation.contract.sections.organisationAccount',
                      'Organisation Account'
                    )}
                  </p>
                  <div className="space-y-3">
                    <Row
                      label={t(
                        'Organisation.contract.fields.contactPerson',
                        'Contact Person'
                      )}
                      value={contract.userFullName}
                    />
                    <Row
                      label={t('Organisation.contract.fields.email', 'Email')}
                      value={contract.userEmail}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {t('Organisation.contract.sections.actions', 'Actions')}
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
                        {t(
                          'Organisation.contract.actions.viewTemplate',
                          'View contract template'
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(
                          'Organisation.contract.actions.viewTemplateHint',
                          'Open the contract file directly in a new tab.'
                        )}
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
                          contract.contractNumber,
                          t(
                            'Organisation.contract.toast.downloadTemplateFailed',
                            'Unable to download contract template file.'
                          )
                        );
                      } catch (error) {
                        setDownloadError(
                          error instanceof Error
                            ? error.message
                            : t(
                                'Organisation.contract.toast.downloadTemplateFailed',
                                'Unable to download contract template file.'
                              )
                        );
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {t(
                          'Organisation.contract.actions.downloadTemplate',
                          'Download contract template'
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(
                          'Organisation.contract.actions.downloadTemplateHint',
                          'Download the original file for printing and signing.'
                        )}
                      </p>
                    </div>
                  </button>
                )}
                {downloadError && (
                  <p className="text-sm text-red-500">{downloadError}</p>
                )}
              </div>

              {(contract.status === 'PendingSignature' ||
                contract.status === 'Active') && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {contract.scannedDocumentUrl
                        ? t(
                            'Organisation.contract.sections.signedContract',
                            'Signed Contract'
                          )
                        : t(
                            'Organisation.contract.sections.uploadSignedContract',
                            'Upload Signed Contract'
                          )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {contract.scannedDocumentUrl
                        ? contract.status === 'Active'
                          ? t(
                              'Organisation.contract.sections.signedDescriptionActive',
                              'You can now start using all AURA features.'
                            )
                          : t(
                              'Organisation.contract.sections.signedDescriptionPending',
                              'The contract has been submitted and is awaiting admin approval.'
                            )
                        : t(
                            'Organisation.contract.sections.uploadDescription',
                            'Download, sign, stamp, and upload the scanned file or photo.'
                          )}
                    </p>
                  </div>
                  {!contract.scannedDocumentUrl && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          step: 1,
                          icon: Download,
                          text: t(
                            'Organisation.contract.steps.downloadAndPrint',
                            'Download & print contract'
                          ),
                        },
                        {
                          step: 2,
                          icon: FileText,
                          text: t(
                            'Organisation.contract.steps.signAndStamp',
                            'Sign & stamp'
                          ),
                        },
                        {
                          step: 3,
                          icon: Image,
                          text: t(
                            'Organisation.contract.steps.captureAndUpload',
                            'Capture & upload'
                          ),
                        },
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
