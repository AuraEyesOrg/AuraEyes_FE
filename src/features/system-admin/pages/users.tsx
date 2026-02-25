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
import { userApi } from '../api';
import type { User, UserRole } from '../types/system-admin.types';

// Mock data for demonstration
const getMockUsers = (): User[] => [
  {
    id: '#USR001',
    name: 'Dr. Alex Chen',
    email: 'alex.chen@aura.med',
    role: 'system_admin',
    status: 'active',
    lastLogin: '2024-01-23 10:30 AM',
    createdAt: 'Oct 12, 2023',
    emailVerified: true,
  },
  {
    id: '#USR002',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@metro.clinic',
    role: 'organisation_admin',
    organisationId: '#CL042',
    organisationName: 'Metro Vascular Center',
    status: 'active',
    lastLogin: '2024-01-22 03:15 PM',
    createdAt: 'Nov 15, 2023',
    emailVerified: true,
  },
  {
    id: '#USR003',
    name: 'Dr. Michael Lee',
    email: 'michael.lee@bayside.health',
    role: 'doctor',
    organisationId: '#CL043',
    organisationName: 'Bayside Eye Institute',
    status: 'active',
    lastLogin: '2024-01-21 09:45 AM',
    createdAt: 'Dec 02, 2023',
    emailVerified: true,
  },
  {
    id: '#USR004',
    name: 'Emily Davis',
    email: 'emily.davis@oakwood.med',
    role: 'operator',
    organisationId: '#CL044',
    organisationName: 'Oakwood Medical',
    status: 'inactive',
    lastLogin: '2024-01-10 02:30 PM',
    createdAt: 'Jan 05, 2024',
    emailVerified: true,
  },
  {
    id: '#USR005',
    name: 'James Wilson',
    email: 'james.wilson@aura.med',
    role: 'analyst',
    status: 'locked',
    lastLogin: '2023-12-20 11:00 AM',
    createdAt: 'Sep 20, 2023',
    emailVerified: false,
  },
];

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const usersData = await userApi.getUsers().catch(() => null);
      setUsers(usersData?.data || getMockUsers());
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

  // Filter data
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

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

  const userColumns: TableColumn<User>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'User',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-sm">
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
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                <Download className="w-4 h-4" />
                Export
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
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-0 pl-1 pr-6"
                  >
                    <option value="all">All Roles</option>
                    <option value="system_admin">System Admin</option>
                    <option value="organisation_admin">Org Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="operator">Operator</option>
                    <option value="analyst">Analyst</option>
                  </select>
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
