/**
 * System Admin Contracts Management Page
 * Lists all contracts, allows viewing scanned documents and verifying (signing) contracts.
 */

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type {
  ContractDto,
  ContractStatusValue,
  SignContractPayload,
} from '../types/system-admin.types';

const CONTRACTS_QUERY_KEY = 'admin-contracts';

const formatDate = (
  value: string | undefined | null,
  locale: string,
  fallback: string
) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString(locale);
};

const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);
const getPdfPreviewUrl = (url: string) => url.replace(/\.pdf(\?.*)?$/i, '.jpg');
const getAttachmentUrl = (url: string) => {
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const statusConfigs: Record<
  ContractStatusValue,
  {
    labelKey: string;
    labelFallback: string;
    bg: string;
    text: string;
    icon: typeof CheckCircle;
  }
> = {
  Draft: {
    labelKey: 'SystemAdmin.contracts.status.draft',
    labelFallback: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: FileText,
  },
  PendingSignature: {
    labelKey: 'SystemAdmin.contracts.status.pendingSignature',
    labelFallback: 'Pending signature',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: Clock,
  },
  Active: {
    labelKey: 'SystemAdmin.contracts.status.active',
    labelFallback: 'Active',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: CheckCircle,
  },
  Expired: {
    labelKey: 'SystemAdmin.contracts.status.expired',
    labelFallback: 'Expired',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: XCircle,
  },
  Terminated: {
    labelKey: 'SystemAdmin.contracts.status.terminated',
    labelFallback: 'Terminated',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    icon: XCircle,
  },
  Cancelled: {
    labelKey: 'SystemAdmin.contracts.status.cancelled',
    labelFallback: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: ContractStatusValue }) {
  const { t } = useSafeTranslation();
  const cfg = statusConfigs[status] ?? statusConfigs.Draft;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-3 h-3" />
      {t(cfg.labelKey, cfg.labelFallback)}
    </span>
  );
}

function UploadBadge({ hasUpload }: { hasUpload: boolean }) {
  const { t } = useSafeTranslation();

  if (hasUpload) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <CheckCircle className="w-3 h-3" />
        {t('SystemAdmin.contracts.upload.uploaded', 'Uploaded')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
      {t('SystemAdmin.contracts.upload.missing', 'Not uploaded')}
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
  onVerify: (id: string, payload: SignContractPayload) => void;
}) {
  const { data: contract, isLoading } = useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, contractId],
    queryFn: () => contractsApi.getContractById(contractId),
  });
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');

  const [confirmedMonthlyQuotaLimit, setConfirmedMonthlyQuotaLimit] =
    useState<string>('');

  useEffect(() => {
    if (!contract) return;

    setConfirmedMonthlyQuotaLimit(String(contract.monthlyQuotaLimit ?? ''));
  }, [contract]);

  const confirmedMonthlyQuotaValue = Number(confirmedMonthlyQuotaLimit);
  const isOrganisationContract =
    contract?.contractType === 'MedicalOrganizationContract';
  const canVerifyWithMonthlyQuota =
    Number.isFinite(confirmedMonthlyQuotaValue) &&
    confirmedMonthlyQuotaLimit.trim().length > 0 &&
    confirmedMonthlyQuotaValue > 0;
  const canVerify = isOrganisationContract ? canVerifyWithMonthlyQuota : true;

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
            {t('SystemAdmin.contracts.detailDialog.title', 'Contract details')}
          </h3>
          <button
            onClick={onClose}
            aria-label={t(
              'SystemAdmin.contracts.detailDialog.closeAriaLabel',
              'Close contract details'
            )}
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
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.contractNumber',
                    'Contract number'
                  )}
                  value={contract.contractNumber}
                />
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.status',
                    'Status'
                  )}
                >
                  <StatusBadge
                    status={contract.status as ContractStatusValue}
                  />
                </InfoRow>
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.fullName',
                    'Full name'
                  )}
                  value={contract.userFullName}
                />
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.email',
                    'Email'
                  )}
                  value={contract.userEmail}
                />
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.template',
                    'Contract template'
                  )}
                  value={contract.templateTitle}
                />
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.createdDate',
                    'Created date'
                  )}
                  value={formatDate(
                    contract.createdAt,
                    dateLocale,
                    notAvailableLabel
                  )}
                />
                {contract.signedDate && (
                  <InfoRow
                    label={t(
                      'SystemAdmin.contracts.detailDialog.fields.signedDate',
                      'Signed date'
                    )}
                    value={formatDate(
                      contract.signedDate,
                      dateLocale,
                      notAvailableLabel
                    )}
                  />
                )}
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.aiQuota',
                    'AI quota'
                  )}
                  value={String(contract.aiQuotaLimit)}
                />
                <InfoRow
                  label={t(
                    'SystemAdmin.contracts.detailDialog.fields.monthlyAiQuota',
                    'Monthly AI quota'
                  )}
                  value={String(contract.monthlyQuotaLimit ?? 0)}
                />
              </div>

              {contract.status === 'PendingSignature' &&
                contract.scannedDocumentUrl && (
                  <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {isOrganisationContract
                        ? t(
                            'SystemAdmin.contracts.detailDialog.sections.quotaTerms',
                            'Quota terms (admin confirmation)'
                          )
                        : t(
                            'SystemAdmin.contracts.detailDialog.sections.dealTerms',
                            'Deal terms (admin confirmation)'
                          )}
                    </p>
                    {isOrganisationContract ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-sm text-slate-600 dark:text-slate-300">
                          {t(
                            'SystemAdmin.contracts.detailDialog.fields.confirmedMonthlyQuota',
                            'Confirmed monthly quota'
                          )}
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={confirmedMonthlyQuotaLimit}
                            onChange={(e) =>
                              setConfirmedMonthlyQuotaLimit(e.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                    ) : (
                      <></>
                    )}
                    {!canVerify && (
                      <p className="text-xs text-red-500">
                        {isOrganisationContract
                          ? t(
                              'SystemAdmin.contracts.detailDialog.validation.monthlyQuotaRequired',
                              'Enter a monthly quota greater than 0 before confirming the contract.'
                            )
                          : t(
                              'SystemAdmin.contracts.detailDialog.validation.dealTermsRequired',
                              'Enter commission rate (0-100) and actual monthly salary before confirming the contract.'
                            )}
                      </p>
                    )}
                  </div>
                )}

              {/* Scanned document */}
              {contract.scannedDocumentUrl && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.contracts.detailDialog.sections.signedContract',
                      'Signed contract'
                    )}
                  </p>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {isImageUrl(contract.scannedDocumentUrl) ? (
                      <img
                        src={contract.scannedDocumentUrl}
                        alt={t(
                          'SystemAdmin.contracts.detailDialog.scannedContractAlt',
                          'Scanned contract'
                        )}
                        className="w-full max-h-100 object-contain bg-slate-50"
                      />
                    ) : isPdfUrl(contract.scannedDocumentUrl) ? (
                      <div className="w-full h-auto bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={getPdfPreviewUrl(contract.scannedDocumentUrl)}
                          alt={t(
                            'SystemAdmin.contracts.detailDialog.pdfPreviewAlt',
                            'PDF Contract Preview'
                          )}
                          className="w-full h-full object-contain bg-slate-50"
                        />
                        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-500">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              PDF Document
                            </span>
                          </div>
                          <a
                            href={getAttachmentUrl(contract.scannedDocumentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {t(
                              'SystemAdmin.contracts.detailDialog.actions.viewFullPdf',
                              'View Full PDF'
                            )}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-800 gap-3">
                        <FileText className="w-10 h-10 text-slate-400" />
                        <p className="text-sm text-slate-500">
                          {t(
                            'SystemAdmin.contracts.detailDialog.pdfHint',
                            'PDF file. Click the link below to open it.'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  <a
                    href={getAttachmentUrl(contract.scannedDocumentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t(
                      'SystemAdmin.contracts.detailDialog.actions.openOriginalFile',
                      'Open original file in new tab'
                    )}
                  </a>
                </div>
              )}

              {/* Contract template file */}
              {contract.signedContent && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.contracts.detailDialog.sections.templateDocx',
                      'Contract template (DOCX)'
                    )}
                  </p>
                  <a
                    href={contract.signedContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t(
                      'SystemAdmin.contracts.detailDialog.actions.openTemplateFile',
                      'Open contract template file'
                    )}
                  </a>
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
                {t('SystemAdmin.contracts.detailDialog.actions.close', 'Close')}
              </button>
              <button
                onClick={() =>
                  onVerify(contractId, {
                    confirmedMonthlyQuotaLimit: isOrganisationContract
                      ? confirmedMonthlyQuotaValue
                      : undefined,
                  })
                }
                disabled={!canVerify}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {t(
                  'SystemAdmin.contracts.detailDialog.actions.confirmContract',
                  'Confirm contract'
                )}
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
  const { t } = useSafeTranslation();

  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      {children ?? (
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {value || t('SystemAdmin.contracts.states.emptyValue', '—')}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const STATUS_FILTERS: {
  value: string;
  labelKey: string;
  labelFallback: string;
}[] = [
  {
    value: '',
    labelKey: 'SystemAdmin.contracts.filters.status.all',
    labelFallback: 'All',
  },
  {
    value: 'PendingSignature',
    labelKey: 'SystemAdmin.contracts.status.pendingSignature',
    labelFallback: 'Pending signature',
  },
  {
    value: 'Active',
    labelKey: 'SystemAdmin.contracts.status.active',
    labelFallback: 'Active',
  },
  {
    value: 'Draft',
    labelKey: 'SystemAdmin.contracts.status.draft',
    labelFallback: 'Draft',
  },
  {
    value: 'Expired',
    labelKey: 'SystemAdmin.contracts.status.expired',
    labelFallback: 'Expired',
  },
  {
    value: 'Terminated',
    labelKey: 'SystemAdmin.contracts.status.terminated',
    labelFallback: 'Terminated',
  },
];

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SignContractPayload;
    }) => contractsApi.signContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      setSelectedId(null);
    },
  });

  const handleVerify = (id: string, payload: SignContractPayload) => {
    signMutation.mutate({ id, payload });
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
          title={t('SystemAdmin.contracts.title', 'Contract Management')}
          description={t(
            'SystemAdmin.contracts.description',
            'Review contracts and verify signed contracts from ophthalmologists'
          )}
        />

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label={t(
                'SystemAdmin.contracts.summary.totalContracts',
                'Total contracts'
              )}
              value={data?.totalCount ?? 0}
              icon={FileText}
              color="text-slate-600 bg-slate-100"
            />
            <StatCard
              label={t(
                'SystemAdmin.contracts.summary.pendingVerification',
                'Pending verification'
              )}
              value={pendingWithUpload}
              icon={AlertTriangle}
              color="text-amber-600 bg-amber-100"
            />
            <StatCard
              label={t('SystemAdmin.contracts.status.active', 'Active')}
              value={contracts.filter((c) => c.status === 'Active').length}
              icon={CheckCircle}
              color="text-emerald-600 bg-emerald-100"
            />
            <StatCard
              label={t(
                'SystemAdmin.contracts.summary.pendingUpload',
                'Pending upload'
              )}
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
                placeholder={t(
                  'SystemAdmin.contracts.filters.searchPlaceholder',
                  'Search by name, email, contract number...'
                )}
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
                  {t(f.labelKey, f.labelFallback)}
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
              <p className="text-slate-500">
                {t('SystemAdmin.contracts.states.empty', 'No contracts found.')}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">
                      {t(
                        'SystemAdmin.contracts.table.columns.contractCode',
                        'Contract code'
                      )}
                    </th>
                    <th className="px-5 py-3">
                      {t(
                        'SystemAdmin.contracts.table.columns.doctor',
                        'Doctor'
                      )}
                    </th>
                    <th className="px-5 py-3">
                      {t(
                        'SystemAdmin.contracts.table.columns.status',
                        'Status'
                      )}
                    </th>
                    <th className="px-5 py-3">
                      {t(
                        'SystemAdmin.contracts.table.columns.upload',
                        'Upload'
                      )}
                    </th>
                    <th className="px-5 py-3">
                      {t(
                        'SystemAdmin.contracts.table.columns.createdDate',
                        'Created date'
                      )}
                    </th>
                    <th className="px-5 py-3 text-right">
                      {t(
                        'SystemAdmin.contracts.table.columns.actions',
                        'Actions'
                      )}
                    </th>
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
                        {formatDate(c.createdAt, dateLocale, notAvailableLabel)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedId(c.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                            title={t(
                              'SystemAdmin.contracts.table.actions.viewDetails',
                              'View details'
                            )}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'PendingSignature' &&
                            c.scannedDocumentUrl && (
                              <button
                                onClick={() => setSelectedId(c.id)}
                                disabled={signMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                title={t(
                                  'SystemAdmin.contracts.table.actions.verifyContract',
                                  'Enter deal terms and verify contract'
                                )}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t(
                                  'SystemAdmin.contracts.table.actions.dealAndVerify',
                                  'Deal & verify'
                                )}
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
                    {t(
                      'SystemAdmin.contracts.pagination.label',
                      'Page {{page}} / {{totalPages}}',
                      {
                        page,
                        totalPages,
                      }
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      aria-label={t(
                        'SystemAdmin.common.pagination.previous',
                        'Previous page'
                      )}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      aria-label={t(
                        'SystemAdmin.common.pagination.next',
                        'Next page'
                      )}
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
