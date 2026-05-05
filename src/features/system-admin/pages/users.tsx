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
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { User, UserRole } from '../types/system-admin.types';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { toast } from 'react-toastify';

const roleLabelMeta: Record<UserRole, { key: string; fallback: string }> = {
  SystemAdmin: {
    key: 'SystemAdmin.users.roles.systemAdmin',
    fallback: 'System Admin',
  },
  Ophthalmologist: {
    key: 'SystemAdmin.users.roles.ophthalmologist',
    fallback: 'Ophthalmologist',
  },
  ClinicStaff: {
    key: 'SystemAdmin.users.roles.clinicStaff',
    fallback: 'Clinic Staff',
  },
  Patient: { key: 'SystemAdmin.users.roles.patient', fallback: 'Patient' },
};

const roleColors: Record<UserRole, string> = {
  SystemAdmin:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Ophthalmologist:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ClinicStaff:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Patient: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

export default function UsersPage() {
  const { t } = useSafeTranslation();
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const roleFilterOptions: Array<{ value: string; label: string }> = [
    {
      value: 'all',
      label: t('SystemAdmin.users.filters.options.allRoles', 'All Roles'),
    },
    {
      value: 'SystemAdmin',
      label: t('SystemAdmin.users.roles.systemAdmin', 'System Admin'),
    },
    {
      value: 'Ophthalmologist',
      label: t('SystemAdmin.users.roles.ophthalmologist', 'Ophthalmologist'),
    },
    {
      value: 'ClinicStaff',
      label: t('SystemAdmin.users.roles.clinicStaff', 'Clinic Staff'),
    },
    {
      value: 'Patient',
      label: t('SystemAdmin.users.roles.patient', 'Patient'),
    },
  ];

  const getRoleLabel = (role: UserRole) => {
    const meta = roleLabelMeta[role];
    return t(meta.key, meta.fallback);
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) =>
      u.status === 'Active' || u.status === 'active' || u.status === 'Online'
  ).length;
  const lockedUsers = users.filter(
    (u) => u.status === 'Locked' || u.status === 'locked'
  ).length;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const toSearchable = (value: unknown) => String(value ?? '').toLowerCase();

  // Filter data
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      toSearchable(user.name).includes(normalizedSearchQuery) ||
      toSearchable(user.email).includes(normalizedSearchQuery) ||
      toSearchable(user.id).includes(normalizedSearchQuery);

    const userRoles = (user as any).roles || [user.role];
    const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  // Handle lock/unlock user
  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'locked') {
        await userApi.unlockUser(userId);
        toast.success(
          t(
            'SystemAdmin.users.toasts.userUnlocked',
            'User account has been unlocked.'
          )
        );
      } else {
        await userApi.lockUser(userId);
        toast.success(
          t(
            'SystemAdmin.users.toasts.userLocked',
            'User account has been locked.'
          )
        );
      }
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle user lock status:', error);
      toast.error(
        t(
          'SystemAdmin.users.toasts.toggleLockError',
          'Failed to update user lock status. Please try again.'
        )
      );
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
        toast.info(
          t(
            'SystemAdmin.users.toasts.exportNoData',
            'No users available for export.'
          )
        );
        return;
      }

      await downloadXlsxFile(
        usersForExport,
        [
          {
            header: t('SystemAdmin.users.table.columns.id', 'User ID'),
            value: (row) => row.id,
          },
          {
            header: t('SystemAdmin.users.export.columns.name', 'Name'),
            value: (row) => row.name,
          },
          {
            header: t('SystemAdmin.users.export.columns.email', 'Email'),
            value: (row) => row.email,
          },
          {
            header: t('SystemAdmin.users.table.columns.role', 'Role'),
            value: (row) => getRoleLabel(row.role),
          },
          {
            header: t('SystemAdmin.users.table.columns.status', 'Status'),
            value: (row) =>
              t(`SystemAdmin.users.status.${row.status}`, row.status),
          },
          {
            header: t(
              'SystemAdmin.users.table.columns.organization',
              'Organization'
            ),
            value: (row) => row.organisationName ?? '',
          },
          {
            header: t(
              'SystemAdmin.users.table.columns.lastLogin',
              'Last Login'
            ),
            value: (row) => row.lastLogin ?? '',
          },
          {
            header: t(
              'SystemAdmin.users.export.columns.createdAt',
              'Created At'
            ),
            value: (row) => row.createdAt,
          },
          {
            header: t(
              'SystemAdmin.users.export.columns.emailVerified',
              'Email Verified'
            ),
            value: (row) =>
              row.emailVerified
                ? t('SystemAdmin.users.export.yes', 'Yes')
                : t('SystemAdmin.users.export.no', 'No'),
          },
        ],
        buildTimestampedFileName('system-admin-users', 'xlsx'),
        t('SystemAdmin.users.export.sheetName', 'Users')
      );
      toast.success(
        t(
          'SystemAdmin.users.toasts.exportSuccess',
          'Exported {{count}} users.',
          {
            count: usersForExport.length,
          }
        )
      );
    } catch (error) {
      console.error('Failed to export users:', error);
      toast.error(
        t(
          'SystemAdmin.users.toasts.exportError',
          'Failed to export users. Please try again.'
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const userColumns: TableColumn<User>[] = [
    {
      header: t('SystemAdmin.users.table.columns.id', 'ID'),
      accessor: 'id',
      width: '100px',
    },
    {
      header: t('SystemAdmin.users.table.columns.user', 'User'),
      accessor: 'name',
      render: (_, row) => {
        const displayName =
          (row.name || '').trim() ||
          row.email ||
          t('SystemAdmin.users.table.values.unknownUser', 'Unknown User');
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
                {row.email || notAvailableLabel}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: t('SystemAdmin.users.table.columns.role', 'Role'),
      accessor: 'role',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[value as UserRole]}`}
        >
          {getRoleLabel(value as UserRole)}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.users.table.columns.organization', 'Organization'),
      accessor: 'organisationName',
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {(value as string) || notAvailableLabel}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.users.table.columns.lastLogin', 'Last Login'),
      accessor: 'lastLogin',
    },
    {
      header: t('SystemAdmin.users.table.columns.status', 'Status'),
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          Active: 'success',
          Online: 'success',
          inactive: 'warning',
          Inactive: 'warning',
          locked: 'error',
          Locked: 'error',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={t(
              `SystemAdmin.users.status.${value as string}`,
              value as string
            )}
          />
        );
      },
    },
    {
      header: t('SystemAdmin.users.table.columns.actions', 'Actions'),
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleLock(row.id, row.status)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title={
              row.status === 'locked'
                ? t('SystemAdmin.users.actions.unlockUser', 'Unlock User')
                : t('SystemAdmin.users.actions.lockUser', 'Lock User')
            }
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
          title={t('SystemAdmin.users.title', 'User & Role Management')}
          description={t(
            'SystemAdmin.users.description',
            'Manage platform users, assign roles, and control access permissions'
          )}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting
                  ? t('SystemAdmin.users.actions.exporting', 'Exporting...')
                  : t('SystemAdmin.actions.export', 'Export')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                {t('SystemAdmin.users.actions.addUser', 'Add User')}
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title={t('SystemAdmin.users.stats.totalUsers', 'Total Users')}
                value={totalUsers}
                icon={Users}
                description={t(
                  'SystemAdmin.users.stats.totalUsersDescription',
                  'All registered users'
                )}
                variant="primary"
              />
              <StatsCard
                title={t('SystemAdmin.users.stats.activeUsers', 'Active Users')}
                value={activeUsers}
                icon={UserCheck}
                change={12}
                trend="up"
                description={t(
                  'SystemAdmin.users.stats.activeUsersDescription',
                  '+12 this month'
                )}
                variant="success"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.users.stats.lockedAccounts',
                  'Locked Accounts'
                )}
                value={lockedUsers}
                icon={UserX}
                description={t(
                  'SystemAdmin.users.stats.lockedAccountsDescription',
                  'Require attention'
                )}
                variant="danger"
              />
              <StatsCard
                title={t('SystemAdmin.users.stats.roleTypes', 'Role Types')}
                value={Object.keys(roleLabelMeta).length}
                icon={Shield}
                description={t(
                  'SystemAdmin.users.stats.roleTypesDescription',
                  'Available roles'
                )}
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
                  placeholder={t(
                    'SystemAdmin.users.filters.searchPlaceholder',
                    'Search by name, email, or ID...'
                  )}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('SystemAdmin.users.filters.roleLabel', 'Role')}:
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
                emptyMessage={t(
                  'SystemAdmin.users.states.empty',
                  'No users found'
                )}
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                {t(
                  'SystemAdmin.users.summary.showing',
                  'Showing {{shown}} of {{total}} users',
                  {
                    shown: filteredUsers.length,
                    total: users.length,
                  }
                )}
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {t('SystemAdmin.common.pagination.previous', 'Previous page')}
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {t('SystemAdmin.common.pagination.next', 'Next page')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
