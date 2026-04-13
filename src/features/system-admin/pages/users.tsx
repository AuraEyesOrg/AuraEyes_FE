/**
 * User & Role Management Page
 * System Admin view for managing users and their roles
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Download,
  Plus,
  MoreVertical,
  Lock,
  Unlock,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { exportApi, userApi } from '../api';
import type { User, UserRole } from '../types/system-admin.types';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

const roleLabels: Record<UserRole, string> = {
  system_admin: 'System Admin',
  organisation_admin: 'Org Admin',
  doctor: 'Doctor',
  operator: 'Operator',
  analyst: 'Analyst',
};

const roleColors: Record<UserRole, string> = {
  system_admin:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  organisation_admin:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  doctor:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  operator: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  analyst:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleFilterOptions: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Roles' },
  { value: 'system_admin', label: 'System Admin' },
  { value: 'organisation_admin', label: 'Org Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'operator', label: 'Operator' },
  { value: 'analyst', label: 'Analyst' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const usersData = await userApi.getUsers().catch(() => null);
      setUsers(usersData?.items ?? usersData?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const lockedUsers = users.filter((u) => u.status === 'locked').length;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const toSearchable = (value: unknown) => String(value ?? '').toLowerCase();

  // Filter data
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      toSearchable(user.name).includes(normalizedSearchQuery) ||
      toSearchable(user.email).includes(normalizedSearchQuery) ||
      toSearchable(user.id).includes(normalizedSearchQuery);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle lock/unlock user
  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'locked') {
        await userApi.unlockUser(userId);
      } else {
        await userApi.lockUser(userId);
      }
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle user lock status:', error);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const usersForExport = await exportApi.getUsers({
        searchTerm: searchQuery || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
      });

      if (usersForExport.length === 0) {
        toast.info('No users available for export.');
        return;
      }

      await downloadXlsxFile(
        usersForExport,
        [
          { header: 'User ID', value: (row) => row.id },
          { header: 'Name', value: (row) => row.name },
          { header: 'Email', value: (row) => row.email },
          { header: 'Role', value: (row) => roleLabels[row.role] ?? row.role },
          { header: 'Status', value: (row) => row.status },
          {
            header: 'Organisation',
            value: (row) => row.organisationName ?? '',
          },
          { header: 'Last Login', value: (row) => row.lastLogin ?? '' },
          { header: 'Created At', value: (row) => row.createdAt },
          {
            header: 'Email Verified',
            value: (row) => (row.emailVerified ? 'Yes' : 'No'),
          },
        ],
        buildTimestampedFileName('system-admin-users', 'xlsx'),
        'Users'
      );
      toast.success(`Exported ${usersForExport.length} users.`);
    } catch (error) {
      console.error('Failed to export users:', error);
      toast.error('Failed to export users. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const userColumns: TableColumn<User>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'User',
      accessor: 'name',
      render: (_, row) => {
        const displayName =
          (row.name || '').trim() || row.email || 'Unknown User';
        const avatarInitials = displayName
          .split(' ')
          .map((namePart) => namePart[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {avatarInitials || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span className="text-xs text-slate-500">
                {row.email || 'N/A'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[value as UserRole]}`}
        >
          {roleLabels[value as UserRole]}
        </span>
      ),
    },
    {
      header: 'Organization',
      accessor: 'organisationName',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {(value as string) || '—'}
        </span>
      ),
    },
    { header: 'Last Login', accessor: 'lastLogin' },
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
            onClick={() => handleToggleLock(row.id, row.status)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title={row.status === 'locked' ? 'Unlock User' : 'Lock User'}
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
          title="User & Role Management"
          description="Manage platform users, assign roles, and control access permissions"
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
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value={totalUsers}
                icon={Users}
                description="All registered users"
                variant="primary"
              />
              <StatsCard
                title="Active Users"
                value={activeUsers}
                icon={UserCheck}
                change={12}
                trend="up"
                description="+12 this month"
                variant="success"
              />
              <StatsCard
                title="Locked Accounts"
                value={lockedUsers}
                icon={UserX}
                description="Require attention"
                variant="danger"
              />
              <StatsCard
                title="Role Types"
                value={Object.keys(roleLabels).length}
                icon={Shield}
                description="Available roles"
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
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {roleFilterOptions.map((option) => {
                      const isActive = roleFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRoleFilter(option.value)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-primary/15 text-primary'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <DataTable<User>
                columns={userColumns}
                data={filteredUsers}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No users found"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredUsers.length} of {users.length} users
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
