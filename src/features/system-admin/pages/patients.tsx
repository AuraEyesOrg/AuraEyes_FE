/**
 * Patient Management Page
 * System Admin view for managing patients
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Search,
  Download,
  Eye,
  MoreVertical,
  Lock,
  Unlock,
  FileText,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'locked';
  screeningsCount: number;
  lastScreening?: string;
  createdAt: string;
  medicalHistorySummary?: string;
  emailVerified: boolean;
}

// Mock data for demonstration
const getMockPatients = (): Patient[] => [
  {
    id: '#PAT001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    screeningsCount: 5,
    lastScreening: '2024-01-20',
    createdAt: 'Oct 15, 2023',
    emailVerified: true,
  },
  {
    id: '#PAT002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    screeningsCount: 3,
    lastScreening: '2024-01-18',
    createdAt: 'Nov 02, 2023',
    emailVerified: true,
  },
  {
    id: '#PAT003',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    screeningsCount: 1,
    lastScreening: '2023-12-10',
    createdAt: 'Dec 05, 2023',
    emailVerified: true,
  },
  {
    id: '#PAT004',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    status: 'locked',
    screeningsCount: 0,
    createdAt: 'Jan 10, 2024',
    emailVerified: false,
  },
  {
    id: '#PAT005',
    name: 'Robert Wilson',
    email: 'robert.w@email.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    screeningsCount: 8,
    lastScreening: '2024-01-22',
    createdAt: 'Sep 20, 2023',
    emailVerified: true,
  },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      setPatients(getMockPatients());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const lockedPatients = patients.filter((p) => p.status === 'locked').length;
  const totalScreenings = patients.reduce(
    (sum, p) => sum + p.screeningsCount,
    0
  );

  // Filter data
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle lock/unlock patient
  const handleToggleLock = async (patientId: string, currentStatus: string) => {
    try {
      // TODO: Implement API call
      console.log(
        `Toggle lock for patient ${patientId}, current status: ${currentStatus}`
      );
      loadData();
    } catch (error) {
      console.error('Failed to toggle patient lock status:', error);
    }
  };

  const patientColumns: TableColumn<Patient>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'Patient',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            {row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {row.name}
            </span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Screenings',
      accessor: 'screeningsCount',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
          {value as number}
        </span>
      ),
    },
    {
      header: 'Last Screening',
      accessor: 'lastScreening',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {(value as string) || 'Never'}
        </span>
      ),
    },
    { header: 'Joined', accessor: 'createdAt' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          inactive: 'warning',
          locked: 'error',
        };
        const labelMap: Record<string, string> = {
          active: 'Active',
          inactive: 'Inactive',
          locked: 'Locked',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={labelMap[value as string] || (value as string)}
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
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Medical History"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleLock(row.id, row.status)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title={row.status === 'locked' ? 'Unlock Patient' : 'Lock Patient'}
          >
            {row.status === 'locked' ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </button>
          <button className="text-slate-500 hover:text-primary transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPath="/system-admin/patients" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Patient Management"
          description="Manage patient accounts, view screening history, and monitor patient activity"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Patients"
                value={totalPatients}
                icon={Users}
                description="All registered patients"
                variant="primary"
              />
              <StatsCard
                title="Active Patients"
                value={activePatients}
                icon={UserCheck}
                change={8}
                trend="up"
                description="+8 this month"
                variant="success"
              />
              <StatsCard
                title="Locked Accounts"
                value={lockedPatients}
                icon={UserX}
                description="Require attention"
                variant="danger"
              />
              <StatsCard
                title="Total Screenings"
                value={totalScreenings}
                icon={Activity}
                change={15}
                trend="up"
                description="All time"
                variant="primary"
              />
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
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="locked">Locked</option>
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
              <DataTable<Patient>
                columns={patientColumns}
                data={filteredPatients}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No patients found"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredPatients.length} of {patients.length} patients
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
    </div>
  );
}
