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

type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed';
type VerificationStatus = 'verified' | 'pending' | 'unverified';
type DoctorStatus = 'available' | 'busy' | 'unavailable' | 'fully_booked';

interface OphthalmologistRequest {
  id: string;
  patientName: string;
  patientId: string;
  status: RequestStatus;
  requestedAt: string;
  message?: string;
}

interface Ophthalmologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  status: DoctorStatus;
  yearsOfExperience: number;
  bio?: string;
  // Request stats
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  // Financial stats
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayouts: number;
  // Feedback stats
  averageRating: number;
  totalReviews: number;
  // Activity
  lastActive?: string;
  joinedAt: string;
  requests?: OphthalmologistRequest[];
}

// Mock data for demonstration
const getMockOphthalmologists = (): Ophthalmologist[] => [
  {
    id: '#OPH001',
    name: 'Dr. Alex Chen',
    email: 'alex.chen@aura.med',
    phone: '+1 (555) 111-2222',
    verificationStatus: 'verified',
    status: 'available',
    yearsOfExperience: 15,
    bio: 'Specialist in diabetic retinopathy and macular degeneration',
    totalRequests: 145,
    pendingRequests: 8,
    completedRequests: 130,
    monthlyEarnings: 12500,
    totalEarnings: 87500,
    pendingPayouts: 3200,
    averageRating: 4.9,
    totalReviews: 120,
    lastActive: '2024-01-23 10:30 AM',
    joinedAt: 'Mar 15, 2023',
    requests: [
      {
        id: 'REQ001',
        patientName: 'John Smith',
        patientId: '#PAT001',
        status: 'pending',
        requestedAt: '2024-01-23 09:00 AM',
        message: 'Follow-up consultation needed',
      },
      {
        id: 'REQ002',
        patientName: 'Sarah Johnson',
        patientId: '#PAT002',
        status: 'in_progress',
        requestedAt: '2024-01-22 02:30 PM',
      },
    ],
  },
  {
    id: '#OPH002',
    name: 'Dr. Sarah Williams',
    email: 'sarah.williams@clinic.com',
    phone: '+1 (555) 333-4444',
    verificationStatus: 'verified',
    status: 'busy',
    yearsOfExperience: 12,
    bio: 'Expert in retinal imaging and glaucoma diagnosis',
    totalRequests: 98,
    pendingRequests: 5,
    completedRequests: 88,
    monthlyEarnings: 9800,
    totalEarnings: 62400,
    pendingPayouts: 2100,
    averageRating: 4.8,
    totalReviews: 82,
    lastActive: '2024-01-22 04:15 PM',
    joinedAt: 'Jun 20, 2023',
  },
  {
    id: '#OPH003',
    name: 'Dr. Michael Lee',
    email: 'michael.lee@eyecare.com',
    phone: '+1 (555) 555-6666',
    verificationStatus: 'pending',
    status: 'available',
    yearsOfExperience: 8,
    bio: 'Pediatric ophthalmology specialist',
    totalRequests: 45,
    pendingRequests: 3,
    completedRequests: 40,
    monthlyEarnings: 5200,
    totalEarnings: 28600,
    pendingPayouts: 1500,
    averageRating: 4.7,
    totalReviews: 38,
    lastActive: '2024-01-21 11:00 AM',
    joinedAt: 'Sep 10, 2023',
  },
  {
    id: '#OPH004',
    name: 'Dr. Emily Zhang',
    email: 'emily.zhang@vision.care',
    verificationStatus: 'unverified',
    status: 'unavailable',
    yearsOfExperience: 5,
    totalRequests: 12,
    pendingRequests: 0,
    completedRequests: 10,
    monthlyEarnings: 1200,
    totalEarnings: 6800,
    pendingPayouts: 500,
    averageRating: 4.5,
    totalReviews: 10,
    lastActive: '2024-01-15 02:00 PM',
    joinedAt: 'Dec 01, 2023',
  },
  {
    id: '#OPH005',
    name: 'Dr. James Park',
    email: 'james.park@eyeclinic.com',
    phone: '+1 (555) 777-8888',
    verificationStatus: 'verified',
    status: 'fully_booked',
    yearsOfExperience: 20,
    bio: 'Senior retinal specialist with 20 years experience',
    totalRequests: 220,
    pendingRequests: 0,
    completedRequests: 215,
    monthlyEarnings: 18500,
    totalEarnings: 125000,
    pendingPayouts: 4500,
    averageRating: 5.0,
    totalReviews: 200,
    lastActive: '2024-01-23 08:00 AM',
    joinedAt: 'Jan 01, 2023',
  },
];

type TabType = 'overview' | 'requests' | 'feedback';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Ophthalmologist | null>(
    null
  );

  // Load data
  const loadData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      setOphthalmologists(getMockOphthalmologists());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalDoctors = ophthalmologists.length;
  const verifiedDoctors = ophthalmologists.filter(
    (o) => o.verificationStatus === 'verified'
  ).length;
  const pendingVerification = ophthalmologists.filter(
    (o) => o.verificationStatus === 'pending'
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

  // Filter data
  const filteredOphthalmologists = ophthalmologists.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerification =
      verificationFilter === 'all' ||
      doctor.verificationStatus === verificationFilter;
    const matchesStatus =
      statusFilter === 'all' || doctor.status === statusFilter;

    return matchesSearch && matchesVerification && matchesStatus;
  });

  // Handle verification actions
  const handleVerify = async (doctorId: string) => {
    try {
      // TODO: Implement API call
      console.log(`Verify doctor ${doctorId}`);
      loadData();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handleReject = async (doctorId: string) => {
    try {
      // TODO: Implement API call
      console.log(`Reject doctor ${doctorId}`);
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
        const statusConfig: Record<
          VerificationStatus,
          { status: 'success' | 'warning' | 'error'; label: string }
        > = {
          verified: { status: 'success', label: 'Verified' },
          pending: { status: 'warning', label: 'Pending' },
          unverified: { status: 'error', label: 'Unverified' },
        };
        const config = statusConfig[value as VerificationStatus];
        return <StatusBadge status={config.status} label={config.label} />;
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
          {row.verificationStatus === 'pending' && (
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
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
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
                Showing {filteredOphthalmologists.length} of{' '}
                {ophthalmologists.length} doctors
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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

              {/* Recent Requests */}
              {selectedDoctor.requests &&
                selectedDoctor.requests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                      Recent Requests
                    </h3>
                    <div className="space-y-2">
                      {selectedDoctor.requests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {request.patientName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {request.requestedAt}
                            </p>
                          </div>
                          <StatusBadge
                            status={
                              request.status === 'completed'
                                ? 'success'
                                : request.status === 'pending'
                                  ? 'warning'
                                  : 'info'
                            }
                            label={request.status.replace('_', ' ')}
                          />
                        </div>
                      ))}
                    </div>
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
