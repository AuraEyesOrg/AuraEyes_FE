/**
 * Organisation Management Page
 * System Admin view for managing organizations - contracts, billing, AI usage
 * Based on FR-26 to FR-36 requirements
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  CreditCard,
  Search,
  Download,
  Plus,
  Eye,
  Pencil,
  Users,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { exportApi } from '../api';
import { organisationApi } from '../api/organisation.api';
import type {
  ApproveOrganisationOnboardingResult,
  Organisation as ApiOrganisation,
  OrganisationOnboardingRequestDto,
} from '../types/system-admin.types';
import { formatViDate, formatViTimestamp } from '@/lib/date-utils';
import { extractApiErrorMessage } from '@/lib/api-error';
import { formatCurrency } from '@/lib/helper';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

type ContractStatus = 'active' | 'pending' | 'expired' | 'suspended';
type TabType = 'organisations' | 'billing' | 'contracts';

interface Organisation {
  id: string;
  name: string;
  type: string;
  location: string;
  country: string;
  status: 'active' | 'inactive' | 'suspended';
  contractStatus: ContractStatus;
  usersCount: number;
  purchasedAiQuota: number;
  monthlyQuotaLimit: number;
  monthlyQuotaUsed: number;
  monthlyQuotaRemaining: number;
  managedPatientCount: number;
  registeredPatientCount: number;
  walkInPatientCount: number;
  // Billing info
  monthlyAIUsage: number;
  monthlyBilling: number;
  pendingPayment: number;
  totalScreenings: number;
  // Contract info
  contractStartDate: string;
  contractEndDate: string;
  createdAt: string;
  contactEmail: string;
}

/** Map API response to UI Organisation */
const mapToUiOrg = (item: ApiOrganisation): Organisation => ({
  id: item.id,
  name: item.name,
  type: (item.orgType || 'clinic').toLowerCase(),
  location: item.address || 'Unknown',
  country: '',
  status: item.isActive ? 'active' : 'inactive',
  contractStatus: item.isActive ? 'active' : 'expired',
  usersCount: item.usersCount ?? 0,
  purchasedAiQuota: item.purchasedAiQuota ?? 0,
  monthlyQuotaLimit: item.monthlyQuotaLimit ?? 0,
  monthlyQuotaUsed: item.monthlyQuotaUsed ?? 0,
  monthlyQuotaRemaining: item.monthlyQuotaRemaining ?? 0,
  managedPatientCount: item.managedPatientCount ?? 0,
  registeredPatientCount: item.registeredPatientCount ?? 0,
  walkInPatientCount: item.walkInPatientCount ?? 0,
  monthlyAIUsage: 0,
  monthlyBilling: 0,
  pendingPayment: 0,
  totalScreenings: 0,
  contractStartDate: item.createdAt,
  contractEndDate: '',
  createdAt: formatViDate(item.createdAt),
  contactEmail: item.contactEmail || '',
});

export default function OrganisationsPage() {
  const navigate = useNavigate();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<
    OrganisationOnboardingRequestDto[]
  >([]);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null
  );
  const [approvalResult, setApprovalResult] =
    useState<ApproveOrganisationOnboardingResult | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('organisations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [editingQuotaOrg, setEditingQuotaOrg] = useState<Organisation | null>(
    null
  );
  const [monthlyQuotaInput, setMonthlyQuotaInput] = useState('0');
  const [isUpdatingQuota, setIsUpdatingQuota] = useState(false);

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const orgTypeFilter = statusFilter === 'all' ? undefined : statusFilter;
      const result = await organisationApi.getOrganisations(
        pageNumber,
        10,
        searchQuery || undefined,
        orgTypeFilter
      );
      if (result) {
        setOrganisations((result.items || []).map(mapToUiOrg));
        setTotalCount(result.totalCount ?? 0);
        setHasNext(result.hasNext ?? false);
        setHasPrevious(result.hasPrevious ?? false);
      }

      const requests = await organisationApi.getOnboardingRequests();
      setOnboardingRequests(requests ?? []);
      setOnboardingError(null);
    } catch (error) {
      console.error('Failed to load organisations:', error);
      setOrganisations([]);
      setOnboardingError(
        extractApiErrorMessage(error, 'Failed to load onboarding requests.')
      );
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const activeOrgs = organisations.filter((o) => o.status === 'active').length;
  const totalPurchasedQuota = organisations.reduce(
    (sum, o) => sum + o.purchasedAiQuota,
    0
  );
  const inactiveOrgs = organisations.filter(
    (o) => o.status !== 'active'
  ).length;
  const pendingOnboardingRequests = onboardingRequests.filter(
    (request) => request.status === 'Pending'
  );

  const focusOrganisationInTab = useCallback((tab: TabType, name: string) => {
    setActiveTab(tab);
    setSearchQuery(name);
    setPageNumber(1);
  }, []);

  const openContractsManagement = useCallback(() => {
    navigate('/system-admin/contracts');
  }, [navigate]);

  const handleApproveOnboarding = async (requestId: string) => {
    try {
      setApprovingRequestId(requestId);
      setApprovalResult(null);
      const result = await organisationApi.approveOnboardingRequest(requestId);
      setApprovalResult(result ?? null);
      await loadData();
    } catch (error) {
      setOnboardingError(
        extractApiErrorMessage(error, 'Failed to approve onboarding request.')
      );
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const organisationsForExport = await exportApi.getOrganisations({
        searchTerm: searchQuery || undefined,
        orgType: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (organisationsForExport.length === 0) {
        toast.info('No organisations available for export.');
        return;
      }

      await downloadXlsxFile(
        organisationsForExport,
        [
          { header: 'Name', value: (row) => row.name },
          { header: 'Type', value: (row) => row.orgType ?? '' },
          { header: 'Address', value: (row) => row.address ?? '' },
          { header: 'Contact Email', value: (row) => row.contactEmail ?? '' },
          {
            header: 'License Number',
            value: (row) => row.licenseNumber ?? '',
          },
          {
            header: 'Tax Code',
            value: (row) => row.taxCode ?? '',
          },
          { header: 'Device Count', value: (row) => row.deviceCount ?? 0 },
          { header: 'Users Count', value: (row) => row.usersCount ?? 0 },
          {
            header: 'Status',
            value: (row) => (row.isActive ? 'Active' : 'Inactive'),
          },
          { header: 'Created At', value: (row) => row.createdAt },
        ],
        buildTimestampedFileName('system-admin-organisations', 'xlsx'),
        'Organisations'
      );
      toast.success(`Exported ${organisationsForExport.length} organisations.`);
    } catch (error) {
      console.error('Failed to export organisations:', error);
      toast.error('Failed to export organisations. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Server-side filtering is already applied, use all results
  const filteredOrganisations = organisations;

  const openMonthlyQuotaEditor = (org: Organisation) => {
    setEditingQuotaOrg(org);
    setMonthlyQuotaInput(String(org.monthlyQuotaLimit));
  };

  const closeMonthlyQuotaEditor = () => {
    setEditingQuotaOrg(null);
    setMonthlyQuotaInput('0');
    setIsUpdatingQuota(false);
  };

  const handleSaveMonthlyQuota = async () => {
    if (!editingQuotaOrg) return;

    const parsedQuota = Number.parseInt(monthlyQuotaInput, 10);
    if (!Number.isFinite(parsedQuota) || parsedQuota < 0) {
      toast.error('Monthly quota must be a non-negative integer.');
      return;
    }

    try {
      setIsUpdatingQuota(true);
      await organisationApi.updateMonthlyQuota(editingQuotaOrg.id, parsedQuota);
      await loadData();
      toast.success('Monthly quota updated successfully.');
      closeMonthlyQuotaEditor();
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, 'Failed to update monthly quota.')
      );
      setIsUpdatingQuota(false);
    }
  };

  const usdCurrencyOptions = {
    locale: 'en-US',
    currency: 'USD',
    minimumFractionDigits: 0,
  } as const;

  const organisationColumns: TableColumn<Organisation>[] = [
    {
      header: 'Organisation',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {row.name}
            </span>
            <span className="text-xs text-slate-500">
              {row.type.replace('_', ' ')}
            </span>
          </div>
        </div>
      ),
    },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Users',
      accessor: 'usersCount',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {value as number}
        </span>
      ),
    },
    {
      header: 'Purchased Quota',
      accessor: 'purchasedAiQuota',
      render: (value) => (
        <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          {(value as number).toLocaleString()} credits
        </span>
      ),
    },
    {
      header: 'Monthly Quota',
      accessor: 'monthlyQuotaLimit',
      render: (_, row) => (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold">
            {row.monthlyQuotaLimit.toLocaleString()} limit
          </p>
          <p className="text-xs text-slate-500">
            {row.monthlyQuotaUsed.toLocaleString()} used •{' '}
            {row.monthlyQuotaRemaining.toLocaleString()} remaining
          </p>
        </div>
      ),
    },
    {
      header: 'AI Screenings',
      accessor: 'totalScreenings',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {(value as number).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Contract',
      accessor: 'contractStatus',
      render: (value) => {
        const statusMap: Record<
          ContractStatus,
          'success' | 'warning' | 'error' | 'info'
        > = {
          active: 'success',
          pending: 'warning',
          expired: 'error',
          suspended: 'error',
        };
        const labelMap: Record<ContractStatus, string> = {
          active: 'Active',
          pending: 'Pending',
          expired: 'Expired',
          suspended: 'Suspended',
        };
        return (
          <StatusBadge
            status={statusMap[value as ContractStatus]}
            label={labelMap[value as ContractStatus]}
          />
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          inactive: 'error',
          suspended: 'warning',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={
              (value as string).charAt(0).toUpperCase() +
              (value as string).slice(1)
            }
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => focusOrganisationInTab('contracts', row.name)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View contracts"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => focusOrganisationInTab('billing', row.name)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View billing"
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button
            onClick={() => openMonthlyQuotaEditor(row)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="Edit monthly quota"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const billingColumns: TableColumn<Organisation>[] = [
    {
      header: 'Organisation',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-slate-500">{row.contactEmail}</span>
        </div>
      ),
    },
    {
      header: 'Monthly AI Usage',
      accessor: 'monthlyAIUsage',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {value as number} screenings
        </span>
      ),
    },
    {
      header: 'Purchased Quota',
      accessor: 'purchasedAiQuota',
      render: (value) => (
        <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          {(value as number).toLocaleString()} credits
        </span>
      ),
    },
    {
      header: 'Monthly Quota',
      accessor: 'monthlyQuotaLimit',
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {row.monthlyQuotaUsed.toLocaleString()} /{' '}
          {row.monthlyQuotaLimit.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Managed Patients',
      accessor: 'managedPatientCount',
      render: (_, row) => (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold">{row.managedPatientCount}</p>
          <p className="text-xs text-slate-500">
            {row.registeredPatientCount} registered • {row.walkInPatientCount}{' '}
            walk-in
          </p>
        </div>
      ),
    },
    {
      header: 'Monthly Billing',
      accessor: 'monthlyBilling',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(value as number, usdCurrencyOptions)}
        </span>
      ),
    },
    {
      header: 'Pending Payment',
      accessor: 'pendingPayment',
      render: (value) => (
        <span
          className={`text-sm font-semibold ${(value as number) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
        >
          {formatCurrency(value as number, usdCurrencyOptions)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'pendingPayment',
      render: (value) => {
        const isPaid = (value as number) === 0;
        return (
          <StatusBadge
            status={isPaid ? 'success' : 'warning'}
            label={isPaid ? 'Paid' : 'Pending'}
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => focusOrganisationInTab('organisations', row.name)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View organisation"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const contractColumns: TableColumn<Organisation>[] = [
    {
      header: 'Organisation',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-slate-500">
            {row.type.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      header: 'Contract Start',
      accessor: 'contractStartDate',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {value ? formatViDate(value as string) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Contract End',
      accessor: 'contractEndDate',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {value ? formatViDate(value as string) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Contract Status',
      accessor: 'contractStatus',
      render: (value) => {
        const statusMap: Record<
          ContractStatus,
          'success' | 'warning' | 'error' | 'info'
        > = {
          active: 'success',
          pending: 'warning',
          expired: 'error',
          suspended: 'error',
        };
        const labelMap: Record<ContractStatus, string> = {
          active: 'Active',
          pending: 'Pending Signature',
          expired: 'Expired',
          suspended: 'Suspended',
        };
        return (
          <StatusBadge
            status={statusMap[value as ContractStatus]}
            label={labelMap[value as ContractStatus]}
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={openContractsManagement}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Contract"
          >
            <FileText className="w-4 h-4" />
          </button>
          {row.contractStatus === 'expired' && (
            <button className="text-xs px-2 py-1 bg-primary text-slate-900 rounded font-medium hover:opacity-90">
              Renew
            </button>
          )}
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: 'organisations' as const,
      label: 'All Organisations',
      icon: Building2,
      count: organisations.length,
    },
    { id: 'billing' as const, label: 'Billing & Payments', icon: CreditCard },
    { id: 'contracts' as const, label: 'Contracts', icon: FileText },
  ];

  const getActiveColumns = () => {
    switch (activeTab) {
      case 'billing':
        return billingColumns;
      case 'contracts':
        return contractColumns;
      default:
        return organisationColumns;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Organisation Management"
          description="Manage organizations, contracts, billing, and AI usage reports"
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Report'}
              </button>
              <button
                onClick={() => {
                  document
                    .getElementById('onboarding-requests')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Review Onboarding
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-400 mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Organisations"
                value={totalCount}
                icon={Building2}
                description="Current page is server-paginated"
                variant="primary"
              />
              <StatsCard
                title="Active Organisations"
                value={activeOrgs}
                icon={CheckCircle2}
                change={2}
                trend="up"
                description={`${organisations.length} total`}
                variant="success"
              />
              <StatsCard
                title="Purchased Quota"
                value={totalPurchasedQuota.toLocaleString()}
                icon={CreditCard}
                description="Credits purchased by organisations"
                variant="warning"
              />
              <StatsCard
                title="Inactive Organisations"
                value={inactiveOrgs}
                icon={Users}
                description="Need admin review"
                variant="warning"
              />
            </div>

            <section
              id="onboarding-requests"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Organisation Onboarding Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Duyệt hồ sơ gửi từ form public và cấp tài khoản quản trị tổ
                    chức.
                  </p>
                </div>
                <div className="rounded-xl bg-cyan-50 px-4 py-3 text-right dark:bg-cyan-500/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {pendingOnboardingRequests.length}
                  </p>
                </div>
              </div>

              {approvalResult && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        Đã cấp tài khoản thành công
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {onboardingError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                  {onboardingError}
                </div>
              )}

              <div className="mt-5 grid gap-4">
                {pendingOnboardingRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Không có yêu cầu onboarding nào đang chờ duyệt.
                  </div>
                ) : (
                  pendingOnboardingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                              {request.organisationName}
                            </h3>
                            <StatusBadge status="warning" label="Pending" />
                          </div>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {request.orgType} • Gửi lúc{' '}
                            {formatViTimestamp(request.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApproveOnboarding(request.id)}
                          disabled={approvingRequestId === request.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {approvingRequestId === request.id
                            ? 'Đang cấp tài khoản...'
                            : 'Xác nhận & cấp tài khoản'}
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <InfoTile
                          icon={Mail}
                          label="Email"
                          value={request.contactEmail}
                        />
                        <InfoTile
                          icon={Phone}
                          label="Số điện thoại"
                          value={request.contactPhone || 'Chưa cung cấp'}
                        />
                        <InfoTile
                          label="Người liên hệ"
                          value={request.contactFullName}
                        />
                        <InfoTile
                          label="Giấy phép"
                          value={request.licenseNumber || 'Chưa cung cấp'}
                        />
                        <InfoTile
                          label="Mã số thuế"
                          value={request.taxCode || 'Chưa cung cấp'}
                        />
                      </div>

                      {(request.address || request.notes) && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Địa chỉ
                            </p>
                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                              {request.address || 'Chưa cung cấp'}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Ghi chú
                            </p>
                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                              {request.notes || 'Không có ghi chú'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organisations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <DataTable<Organisation>
                columns={getActiveColumns()}
                data={filteredOrganisations}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No organisations found"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredOrganisations.length} of {totalCount}{' '}
                organisations
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!hasPrevious}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-2 font-medium">Page {pageNumber}</span>
                <button
                  disabled={!hasNext}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {editingQuotaOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Monthly Quota
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {editingQuotaOrg.name}
            </p>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="monthlyQuota"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Monthly quota limit
              </label>
              <input
                id="monthlyQuota"
                type="number"
                min={0}
                value={monthlyQuotaInput}
                onChange={(e) => setMonthlyQuotaInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current usage:{' '}
                {editingQuotaOrg.monthlyQuotaUsed.toLocaleString()} credits
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeMonthlyQuotaEditor}
                disabled={isUpdatingQuota}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMonthlyQuota}
                disabled={isUpdatingQuota}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingQuota ? 'Saving...' : 'Save quota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon className="h-4 w-4" />}
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}
