/**
 * Organisation Management Page
 * System Admin view for managing organizations - contracts, billing, AI usage
 * Based on FR-26 to FR-36 requirements
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  FileText,
  CreditCard,
  Search,
  Download,
  Plus,
  MoreVertical,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { organisationApi } from '../api/organisation.api';
import type { Organisation as ApiOrganisation } from '../types/system-admin.types';

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
  monthlyAIUsage: 0,
  monthlyBilling: 0,
  pendingPayment: 0,
  totalScreenings: 0,
  contractStartDate: item.createdAt,
  contractEndDate: '',
  createdAt: new Date(item.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }),
  contactEmail: item.contactEmail || '',
});

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('organisations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to load organisations:', error);
      setOrganisations([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const activeOrgs = organisations.filter((o) => o.status === 'active').length;
  const totalMonthlyRevenue = organisations.reduce(
    (sum, o) => sum + o.monthlyBilling,
    0
  );
  const totalPendingPayments = organisations.reduce(
    (sum, o) => sum + o.pendingPayment,
    0
  );
  const totalScreenings = organisations.reduce(
    (sum, o) => sum + o.totalScreenings,
    0
  );
  const totalUsers = organisations.reduce((sum, o) => sum + o.usersCount, 0);

  // Server-side filtering is already applied, use all results
  const filteredOrganisations = organisations;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const organisationColumns: TableColumn<Organisation>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'Organisation',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
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
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-slate-500 hover:text-primary transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const billingColumns: TableColumn<Organisation>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
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
      header: 'Monthly Billing',
      accessor: 'monthlyBilling',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(value as number)}
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
          {formatCurrency(value as number)}
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
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Invoice"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button className="text-slate-500 hover:text-primary transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const contractColumns: TableColumn<Organisation>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
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
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Contract End',
      accessor: 'contractEndDate',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {new Date(value as string).toLocaleDateString()}
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
          <button className="text-slate-500 hover:text-primary transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
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
      <Sidebar currentPath="/system-admin/organisations" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Organisation Management"
          description="Manage organizations, contracts, billing, and AI usage reports"
          actions={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Add Organisation
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Active Organisations"
                value={activeOrgs}
                icon={Building2}
                change={2}
                trend="up"
                description={`${organisations.length} total`}
                variant="success"
              />
              <StatsCard
                title="Monthly Revenue"
                value={formatCurrency(totalMonthlyRevenue)}
                icon={DollarSign}
                change={15}
                trend="up"
                description="From AI services"
                variant="primary"
              />
              <StatsCard
                title="Pending Payments"
                value={formatCurrency(totalPendingPayments)}
                icon={CreditCard}
                description="Awaiting collection"
                variant="warning"
              />
              <StatsCard
                title="Total Screenings"
                value={totalScreenings.toLocaleString()}
                icon={Activity}
                change={8}
                trend="up"
                description="All time AI usage"
                variant="primary"
              />
              <StatsCard
                title="Organisation Users"
                value={totalUsers}
                icon={Users}
                description="Across all orgs"
                variant="primary"
              />
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    AI Screening Revenue
                  </h3>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalMonthlyRevenue)}
                  </span>
                  <span className="text-sm text-emerald-500">+12%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on{' '}
                  {organisations.reduce((sum, o) => sum + o.monthlyAIUsage, 0)}{' '}
                  screenings this month
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Active Contracts
                  </h3>
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {
                      organisations.filter((o) => o.contractStatus === 'active')
                        .length
                    }
                  </span>
                  <span className="text-sm text-slate-500">
                    / {organisations.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {
                    organisations.filter((o) => o.contractStatus === 'pending')
                      .length
                  }{' '}
                  pending signature,{' '}
                  {
                    organisations.filter((o) => o.contractStatus === 'expired')
                      .length
                  }{' '}
                  expired
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Collection Rate
                  </h3>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {totalMonthlyRevenue > 0
                      ? Math.round(
                          ((totalMonthlyRevenue - totalPendingPayments) /
                            totalMonthlyRevenue) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatCurrency(totalPendingPayments)} pending collection
                </p>
              </div>
            </div>

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
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
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
    </div>
  );
}
