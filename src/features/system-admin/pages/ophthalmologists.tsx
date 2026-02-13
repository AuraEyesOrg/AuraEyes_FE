/**
 * Ophthalmologist Management Page
 * System Admin view for managing ophthalmologists - request status, fees, feedback
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Stethoscope,
  UserCheck,
  Clock,
  DollarSign,
  Star,
  Search,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Wallet,
  Activity,
  Circle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import {
  ophthalmologistApi,
  type OphthalmologistListItem,
} from '../api/ophthalmologist.api';

type VerificationStatus = 'PendingVerification' | 'Approved' | 'Rejected';

interface Ophthalmologist extends OphthalmologistListItem {
  // UI mapped fields
  name: string;
  status: 'available' | 'busy' | 'unavailable' | 'fully_booked';
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayouts: number;
  averageRating: number;
  totalReviews: number;
  lastActive?: string;
  joinedAt: string;
}

/** Map API item to UI Ophthalmologist model */
const mapToUiModel = (item: OphthalmologistListItem): Ophthalmologist => ({
  ...item,
  name: item.fullName,
  status: item.isVerified ? 'available' : 'unavailable',
  totalRequests: 0,
  pendingRequests: 0,
  completedRequests: 0,
  monthlyEarnings: 0,
  totalEarnings: 0,
  pendingPayouts: 0,
  averageRating: 0,
  totalReviews: 0,
  joinedAt: new Date(item.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }),
});

type TabType = 'overview' | 'requests' | 'feedback';

type DoctorStatus = 'available' | 'busy' | 'unavailable' | 'fully_booked';

const statusConfig: Record<
  DoctorStatus,
  { label: string; color: string; dotColor: string }
> = {
  available: {
    label: 'Available',
    color: 'text-emerald-600 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  busy: {
    label: 'Busy',
    color: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  unavailable: {
    label: 'Unavailable',
    color: 'text-slate-500 dark:text-slate-400',
    dotColor: 'bg-slate-400',
  },
  fully_booked: {
    label: 'Fully Booked',
    color: 'text-red-600 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
};

export default function OphthalmologistsPage() {
  const [ophthalmologists, setOphthalmologists] = useState<Ophthalmologist[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Ophthalmologist | null>(
    null
  );

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const apiVerificationStatus =
        verificationFilter === 'all' ? undefined : verificationFilter;
      const result = await ophthalmologistApi.getOphthalmologists(
        pageNumber,
        10,
        searchQuery || undefined,
        apiVerificationStatus
      );
      setOphthalmologists(result.items.map(mapToUiModel));
      setTotalCount(result.totalCount);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error('Failed to load ophthalmologists:', error);
      setOphthalmologists([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, verificationFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalDoctors = totalCount;
  const verifiedDoctors = ophthalmologists.filter(
    (o) => o.verificationStatus === 'Approved'
  ).length;
  const pendingVerification = ophthalmologists.filter(
    (o) => o.verificationStatus === 'PendingVerification'
  ).length;
  const availableDoctors = ophthalmologists.filter(
    (o) => o.status === 'available'
  ).length;
  const totalPendingRequests = ophthalmologists.reduce(
    (sum, o) => sum + o.pendingRequests,
    0
  );
  const totalMonthlyEarnings = ophthalmologists.reduce(
    (sum, o) => sum + o.monthlyEarnings,
    0
  );
  const averageRating =
    ophthalmologists.length > 0
      ? (
          ophthalmologists.reduce((sum, o) => sum + o.averageRating, 0) /
          ophthalmologists.length
        ).toFixed(1)
      : '0';

  // Client-side status filter (verification + search is server-side)
  const filteredOphthalmologists = ophthalmologists.filter((doctor) => {
    const matchesStatus =
      statusFilter === 'all' || doctor.status === statusFilter;
    return matchesStatus;
  });

  // Handle verification actions
  const handleVerify = async (doctorId: string) => {
    try {
      await ophthalmologistApi.verifyOphthalmologist(doctorId, true);
      loadData();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handleReject = async (doctorId: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return; // user cancelled
    try {
      await ophthalmologistApi.verifyOphthalmologist(
        doctorId,
        false,
        reason || 'Not specified'
      );
      loadData();
    } catch (error) {
      console.error('Failed to reject doctor:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const ophthalmologistColumns: TableColumn<Ophthalmologist>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'Doctor',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {row.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            {/* Status indicator dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${statusConfig[row.status].dotColor}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {row.name}
            </span>
            <span className="text-xs text-slate-500">
              {row.yearsOfExperience} years exp.
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const config = statusConfig[value as DoctorStatus];
        return (
          <div className="flex items-center gap-2">
            <Circle className={`w-2 h-2 fill-current ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Verification',
      accessor: 'verificationStatus',
      render: (value) => {
        const statusMap: Record<
          VerificationStatus,
          { status: 'success' | 'warning' | 'error'; label: string }
        > = {
          Approved: { status: 'success', label: 'Verified' },
          PendingVerification: { status: 'warning', label: 'Pending' },
          Rejected: { status: 'error', label: 'Rejected' },
        };
        const config = statusMap[value as VerificationStatus];
        return (
          <StatusBadge
            status={config?.status ?? 'warning'}
            label={config?.label ?? String(value)}
          />
        );
      },
    },
    {
      header: 'Requests',
      accessor: 'pendingRequests',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {row.pendingRequests} pending
          </span>
          <span className="text-xs text-slate-500">
            {row.totalRequests} total
          </span>
        </div>
      ),
    },
    {
      header: 'Monthly Earnings',
      accessor: 'monthlyEarnings',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'averageRating',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {row.averageRating}
          </span>
          <span className="text-xs text-slate-500">({row.totalReviews})</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDoctor(row)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.verificationStatus === 'PendingVerification' && (
            <>
              <button
                onClick={() => handleVerify(row.id)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors p-1"
                title="Approve Verification"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
                title="Reject Verification"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button className="text-slate-500 hover:text-primary transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    {
      id: 'requests' as const,
      label: 'Pending Requests',
      icon: Clock,
      count: totalPendingRequests,
    },
    { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPath="/system-admin/ophthalmologists" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Ophthalmologist Management"
          description="Manage doctors, monitor consultation requests, earnings, and feedback"
          actions={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Doctors"
                value={totalDoctors}
                icon={Stethoscope}
                description={`${verifiedDoctors} verified`}
                variant="primary"
              />
              <StatsCard
                title="Available Now"
                value={availableDoctors}
                icon={UserCheck}
                description="Ready for consultations"
                variant="success"
              />
              <StatsCard
                title="Pending Verification"
                value={pendingVerification}
                icon={AlertCircle}
                description="Require review"
                variant="warning"
              />
              <StatsCard
                title="Pending Requests"
                value={totalPendingRequests}
                icon={Clock}
                description="Consultation requests"
                variant="primary"
              />
              <StatsCard
                title="Monthly Revenue"
                value={formatCurrency(totalMonthlyEarnings)}
                icon={DollarSign}
                change={12}
                trend="up"
                description="Platform earnings"
                variant="success"
              />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Average Rating
                  </h3>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {averageRating}
                  </span>
                  <span className="text-sm text-slate-500">/ 5.0</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on{' '}
                  {ophthalmologists.reduce((sum, o) => sum + o.totalReviews, 0)}{' '}
                  reviews
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Total Consultations
                  </h3>
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {ophthalmologists.reduce(
                      (sum, o) => sum + o.completedRequests,
                      0
                    )}
                  </span>
                  <span className="text-sm text-slate-500">completed</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {ophthalmologists.reduce(
                    (sum, o) => sum + o.totalRequests,
                    0
                  )}{' '}
                  total requests
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Pending Payouts
                  </h3>
                  <Wallet className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(
                      ophthalmologists.reduce(
                        (sum, o) => sum + o.pendingPayouts,
                        0
                      )
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Awaiting transfer to doctors
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
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
                  placeholder="Search by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Verification Filter */}
                <div className="relative">
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">All Verification</option>
                    <option value="PendingVerification">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
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

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="fully_booked">Fully Booked</option>
                    <option value="unavailable">Unavailable</option>
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
              <DataTable<Ophthalmologist>
                columns={ophthalmologistColumns}
                data={filteredOphthalmologists}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No ophthalmologists found"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredOphthalmologists.length} of {totalCount}{' '}
                doctors
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

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedDoctor(null)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl m-4">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                      {selectedDoctor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${statusConfig[selectedDoctor.status].dotColor}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedDoctor.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Circle
                        className={`w-2 h-2 fill-current ${statusConfig[selectedDoctor.status].color}`}
                      />
                      <span
                        className={`text-xs font-medium ${statusConfig[selectedDoctor.status].color}`}
                      >
                        {statusConfig[selectedDoctor.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Total Requests</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDoctor.totalRequests}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Pending</p>
                  <p className="text-xl font-bold text-amber-600">
                    {selectedDoctor.pendingRequests}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">
                    Monthly Earnings
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(selectedDoctor.monthlyEarnings)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.averageRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedDoctor.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}

              {/* Documents */}
              {(selectedDoctor.licenseUrl || selectedDoctor.degreeUrl) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                    Uploaded Documents
                  </h3>
                  <div className="flex gap-4">
                    {selectedDoctor.licenseUrl && (
                      <a
                        href={selectedDoctor.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View License
                      </a>
                    )}
                    {selectedDoctor.degreeUrl && (
                      <a
                        href={selectedDoctor.degreeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Degree
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedDoctor.verificationStatus === 'Rejected' &&
                selectedDoctor.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedDoctor.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Financial Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      Total Earnings
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedDoctor.totalEarnings)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">This Month</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedDoctor.monthlyEarnings)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      Pending Payout
                    </p>
                    <p className="text-lg font-bold text-amber-600">
                      {formatCurrency(selectedDoctor.pendingPayouts)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
