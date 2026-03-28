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
  FileText,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { exportApi } from '../api';
import {
  ophthalmologistApi,
  type OphthalmologistListItem,
} from '../api/ophthalmologist.api';
import { formatCurrency } from '@/lib/helper';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

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

const calculateCommissionAmount = (
  actualMonthlySalary: number | null | undefined,
  commissionRate: number | null | undefined
): number | null => {
  if (actualMonthlySalary == null || actualMonthlySalary <= 0) {
    return null;
  }

  if (commissionRate == null || commissionRate <= 0) {
    return null;
  }

  // Accept both 5 (percent) and 0.05 (fraction) representations.
  const normalizedRate =
    commissionRate > 1 ? commissionRate / 100 : commissionRate;
  return actualMonthlySalary * normalizedRate;
};

/** Map API item to UI Ophthalmologist model */
const mapToUiModel = (item: OphthalmologistListItem): Ophthalmologist => ({
  ...item,
  name: item.fullName,
  status: item.isVerified ? 'available' : 'unavailable',
  totalRequests: 0,
  pendingRequests: 0,
  completedRequests: 0,
  monthlyEarnings: item.actualMonthlySalary ?? 0,
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
  const [pendingTotalCount, setPendingTotalCount] = useState(0);

  // Reject modal state
  const [rejectingDoctor, setRejectingDoctor] =
    useState<Ophthalmologist | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [payingSalary, setPayingSalary] = useState(false);

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

  // Load total pending count for tab badge (independent of current page filter)
  useEffect(() => {
    ophthalmologistApi
      .getOphthalmologists(1, 1, undefined, 'PendingVerification')
      .then((r) => setPendingTotalCount(r.totalCount))
      .catch(() => {});
  }, []);

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
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPageNumber(1);
    if (tab === 'requests') setVerificationFilter('PendingVerification');
    else if (tab === 'overview') setVerificationFilter('all');
  };

  const handleVerify = async (doctorId: string) => {
    try {
      await ophthalmologistApi.verifyOphthalmologist(doctorId, true);
      setPendingTotalCount((c) => Math.max(0, c - 1));
      loadData();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handlePaySalary = async (doctor: Ophthalmologist) => {
    if (doctor.actualMonthlySalary == null || doctor.actualMonthlySalary <= 0) {
      toast.error('Doctor has no valid actual salary to payout.');
      return;
    }

    setPayingSalary(true);
    try {
      await ophthalmologistApi.paySalary(
        doctor.id,
        doctor.actualMonthlySalary,
        `Salary payout (${new Date().toISOString().slice(0, 7)})`
      );
      toast.success('Salary paid to doctor wallet successfully.');
      await loadData();
    } catch (error) {
      console.error('Failed to pay salary:', error);
      toast.error('Failed to pay salary. Please try again.');
    } finally {
      setPayingSalary(false);
    }
  };

  const handleRejectClick = (doctor: Ophthalmologist) => {
    setRejectingDoctor(doctor);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectCancel = () => {
    if (rejectSubmitting) return;
    setRejectingDoctor(null);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectingDoctor) return;
    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setRejectSubmitting(true);
    setRejectError('');
    try {
      await ophthalmologistApi.verifyOphthalmologist(
        rejectingDoctor.id,
        false,
        rejectReason.trim()
      );
      setRejectingDoctor(null);
      setPendingTotalCount((c) => Math.max(0, c - 1));
      loadData();
    } catch {
      setRejectError('Từ chối thất bại. Vui lòng thử lại.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const doctorsForExport = await exportApi.getOphthalmologists({
        searchTerm: searchQuery || undefined,
        verificationStatus:
          verificationFilter === 'all' ? undefined : verificationFilter,
      });

      const mappedDoctors = doctorsForExport
        .map(mapToUiModel)
        .filter((doctor) =>
          statusFilter === 'all' ? true : doctor.status === statusFilter
        );

      if (mappedDoctors.length === 0) {
        toast.info('No ophthalmologists available for export.');
        return;
      }

      await downloadXlsxFile(
        mappedDoctors,
        [
          { header: 'Ophthalmologist ID', value: (row) => row.id },
          { header: 'User ID', value: (row) => row.userId },
          { header: 'Full Name', value: (row) => row.fullName },
          { header: 'Email', value: (row) => row.email },
          { header: 'Phone', value: (row) => row.phone ?? '' },
          {
            header: 'Verification Status',
            value: (row) => row.verificationStatus,
          },
          {
            header: 'Is Verified',
            value: (row) => (row.isVerified ? 'Yes' : 'No'),
          },
          {
            header: 'Active Status',
            value: (row) => (row.isActive ? 'Active' : 'Inactive'),
          },
          {
            header: 'Years of Experience',
            value: (row) => row.yearsOfExperience,
          },
          {
            header: 'Organisation',
            value: (row) => row.organisationName ?? '',
          },
          { header: 'Created At', value: (row) => row.createdAt },
        ],
        buildTimestampedFileName('system-admin-ophthalmologists', 'xlsx'),
        'Ophthalmologists'
      );
      toast.success(`Exported ${mappedDoctors.length} ophthalmologists.`);
    } catch (error) {
      console.error('Failed to export ophthalmologists:', error);
      toast.error('Failed to export ophthalmologists. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const vndCurrencyOptions = {
    locale: 'vi-VN',
    currency: 'VND',
    minimumFractionDigits: 0,
  } as const;

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
          {formatCurrency(value as number, vndCurrencyOptions)}
        </span>
      ),
    },
    {
      header: 'Deal Terms',
      accessor: 'commissionRate',
      render: (_, row) => {
        const commissionAmount = calculateCommissionAmount(
          row.actualMonthlySalary,
          row.commissionRate
        );

        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {row.commissionRate != null ? `${row.commissionRate}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">
              {commissionAmount != null
                ? formatCurrency(commissionAmount, vndCurrencyOptions)
                : 'Commission pending'}
            </span>
          </div>
        );
      },
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
                onClick={() => handleRejectClick(row)}
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
      label: 'Pending Verification',
      icon: Clock,
      count: pendingTotalCount,
    },
    { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Ophthalmologist Management"
          description="Manage doctors, monitor consultation requests, earnings, and feedback"
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export'}
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
                value={formatCurrency(totalMonthlyEarnings, vndCurrencyOptions)}
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
                      ),
                      vndCurrencyOptions
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
                  onClick={() => handleTabChange(tab.id)}
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
            {activeTab === 'feedback' ? (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center gap-3">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  Chức năng đánh giá đang được phát triển
                </p>
                <p className="text-slate-400 text-sm">Coming soon</p>
              </div>
            ) : (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {activeTab === 'requests' && (
                  <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {totalCount} bác sĩ đang chờ xét duyệt hồ sơ chứng chỉ
                    </span>
                    <span className="ml-auto text-xs text-amber-500">
                      Xem tài liệu đính kèm trong hàng chi tiết (biểu tượng mắt)
                    </span>
                  </div>
                )}
                <DataTable<Ophthalmologist>
                  columns={ophthalmologistColumns}
                  data={filteredOphthalmologists}
                  keyExtractor={(row) => row.id}
                  isLoading={loading}
                  emptyMessage={
                    activeTab === 'requests'
                      ? 'Không có hồ sơ nào đang chờ xét duyệt'
                      : 'No ophthalmologists found'
                  }
                />
              </div>
            )}

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

      {/* ── Reject Modal ───────────────────────────────────────────────── */}
      {rejectingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleRejectCancel}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl m-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Từ chối xác minh
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                    {rejectingDoctor.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRejectCancel}
                disabled={rejectSubmitting}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Credential docs quick-access */}
              {(rejectingDoctor.licenseUrl || rejectingDoctor.degreeUrl) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex gap-4 text-sm">
                    {rejectingDoctor.licenseUrl && (
                      <a
                        href={rejectingDoctor.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Xem giấy phép
                      </a>
                    )}
                    {rejectingDoctor.degreeUrl && (
                      <a
                        href={rejectingDoctor.degreeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Xem bằng cấp
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  rows={4}
                  placeholder="Nhập lý do từ chối hồ sơ (ví dụ: ảnh giấy phép không rõ, chứng chỉ chưa đủ điều kiện...)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-400/50 focus:border-red-400 outline-none transition-all text-sm resize-none"
                />
                {rejectError && (
                  <p className="text-xs text-red-500 font-medium">
                    {rejectError}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Lý do từ chối sẽ được gửi qua email đến bác sĩ. Hãy mô tả rõ
                  ràng để họ có thể bổ sung hồ sơ.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={handleRejectCancel}
                disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectSubmitting || !rejectReason.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {formatCurrency(
                      selectedDoctor.monthlyEarnings,
                      vndCurrencyOptions
                    )}
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
                      {formatCurrency(
                        selectedDoctor.totalEarnings,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">This Month</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(
                        selectedDoctor.monthlyEarnings,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      Pending Payout
                    </p>
                    <p className="text-lg font-bold text-amber-600">
                      {formatCurrency(
                        selectedDoctor.pendingPayouts,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Contract Deal Terms
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Employment</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.employmentType}
                    </p>
                    {selectedDoctor.workingHoursPerWeek !== undefined && (
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedDoctor.workingHoursPerWeek}h/week
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Commission</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.commissionRate != null
                        ? `${selectedDoctor.commissionRate}%`
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      Expected Salary
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.expectedMonthlySalary !== undefined
                        ? formatCurrency(
                            selectedDoctor.expectedMonthlySalary,
                            vndCurrencyOptions
                          )
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Actual Salary</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {selectedDoctor.actualMonthlySalary != null
                        ? formatCurrency(
                            selectedDoctor.actualMonthlySalary,
                            vndCurrencyOptions
                          )
                        : 'Pending'}
                    </p>
                    {selectedDoctor.actualMonthlySalary != null &&
                      selectedDoctor.actualMonthlySalary > 0 && (
                        <button
                          onClick={() => handlePaySalary(selectedDoctor)}
                          disabled={payingSalary}
                          className="mt-3 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {payingSalary ? 'Paying...' : 'Pay salary to wallet'}
                        </button>
                      )}
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
