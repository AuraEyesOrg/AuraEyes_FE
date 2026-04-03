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
import { exportApi } from '../api';
import { patientApi, type PatientListItem } from '../api/patient.api';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

interface Patient extends PatientListItem {
  name: string;
  status: 'active' | 'inactive' | 'locked';
  screeningsCount: number;
  lastScreening?: string;
  emailVerified: boolean;
}

/** Map API item to UI Patient model */
const mapToUiPatient = (item: PatientListItem): Patient => ({
  ...item,
  name: item.fullName,
  status: item.isActive ? 'active' : 'locked',
  screeningsCount: 0,
  lastScreening: item.lastLoginAt
    ? new Date(item.lastLoginAt).toLocaleDateString()
    : undefined,
  emailVerified: item.emailConfirmed,
});

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const apiStatus = statusFilter === 'all' ? undefined : statusFilter;
      const result = await patientApi.getPatients(
        pageNumber,
        10,
        searchQuery || undefined,
        apiStatus
      );
      setPatients(result.items.map(mapToUiPatient));
      setTotalCount(result.totalCount);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalPatients = totalCount;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const lockedPatients = patients.filter((p) => p.status === 'locked').length;
  const totalScreenings = patients.reduce(
    (sum, p) => sum + p.screeningsCount,
    0
  );

  // Use server-side filtering; client-side list is already filtered
  const filteredPatients = patients;

  // Handle lock/unlock patient
  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      const action = currentStatus === 'locked' ? 'activate' : 'lock';
      let reason: string | undefined;
      if (action === 'lock') {
        reason =
          window.prompt('Enter reason for locking this patient:') || undefined;
      }
      await patientApi.updatePatientStatus(userId, action, reason);
      loadData();
    } catch (error) {
      console.error('Failed to toggle patient lock status:', error);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const patientsForExport = await exportApi.getPatients({
        searchTerm: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (patientsForExport.length === 0) {
        toast.info('No patients available for export.');
        return;
      }

      await downloadXlsxFile(
        patientsForExport,
        [
          { header: 'Patient ID', value: (row) => row.id },
          { header: 'User ID', value: (row) => row.userId },
          { header: 'Full Name', value: (row) => row.fullName },
          { header: 'Email', value: (row) => row.email },
          { header: 'Phone', value: (row) => row.phone ?? '' },
          {
            header: 'Status',
            value: (row) => (row.isActive ? 'Active' : 'Locked'),
          },
          {
            header: 'Email Confirmed',
            value: (row) => (row.emailConfirmed ? 'Yes' : 'No'),
          },
          { header: 'Created At', value: (row) => row.createdAt },
          { header: 'Last Login', value: (row) => row.lastLoginAt ?? '' },
        ],
        buildTimestampedFileName('system-admin-patients', 'xlsx'),
        'Patients'
      );
      toast.success(`Exported ${patientsForExport.length} patients.`);
    } catch (error) {
      console.error('Failed to export patients:', error);
      toast.error('Failed to export patients. Please try again.');
    } finally {
      setIsExporting(false);
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
            onClick={() => handleToggleLock(row.userId, row.status)}
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
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Patient Management"
          description="Manage patient accounts, view screening history, and monitor patient activity"
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
                Showing {filteredPatients.length} of {totalCount} patients
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
