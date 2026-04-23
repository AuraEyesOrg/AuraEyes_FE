import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Lock,
  Unlock,
  Shield,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { userApi } from '../api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { User } from '../types/system-admin.types';
import { toast } from 'react-toastify';
import CreateStaffModal from '../components/CreateStaffModal';

const roleLabelMeta: Record<string, { key: string; fallback: string }> = {
  ophthalmologist: {
    key: 'SystemAdmin.users.roles.ophthalmologist',
    fallback: 'Ophthalmologist',
  },
  clinic_staff: {
    key: 'SystemAdmin.users.roles.clinicStaff',
    fallback: 'Clinic Staff',
  },
};

const roleColors: Record<string, string> = {
  ophthalmologist:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  clinic_staff:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function StaffManagementPage() {
  const { t } = useSafeTranslation();
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const roleFilterOptions: Array<{ value: string; label: string }> = [
    {
      value: 'all',
      label: t('SystemAdmin.users.filters.options.allRoles', 'All Roles'),
    },
    { value: 'ophthalmologist', label: 'Ophthalmologist' },
    { value: 'clinic_staff', label: 'Clinic Staff' },
  ];

  const getRoleLabel = (role: string) => {
    const meta = roleLabelMeta[role];
    return meta ? t(meta.key, meta.fallback) : role;
  };

  const loadData = useCallback(async () => {
    try {
      const usersData = await userApi.getUsers().catch(() => null);
      // Only keep staff roles
      const staffUsers = (usersData?.items ?? usersData?.data ?? []).filter(
        (u: User) => u.role === 'ophthalmologist' || u.role === 'clinic_staff'
      );
      setUsers(staffUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalStaff = users.length;
  const activeStaff = users.filter((u) => u.status === 'active').length;
  const pendingStaff = users.filter((u) => (u as any).mustUpdateProfile).length;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const toSearchable = (value: unknown) => String(value ?? '').toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      toSearchable(user.name).includes(normalizedSearchQuery) ||
      toSearchable(user.email).includes(normalizedSearchQuery) ||
      toSearchable(user.id).includes(normalizedSearchQuery);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'locked') {
        await userApi.unlockUser(userId);
        toast.success('Account unlocked.');
      } else {
        await userApi.lockUser(userId);
        toast.success('Account locked.');
      }
      loadData();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const userColumns: TableColumn<User>[] = [
    {
      header: 'Staff',
      accessor: 'name',
      render: (_, row) => {
        const displayName = (row.name || '').trim() || row.email || 'Unknown';
        const avatarInitials = displayName.substring(0, 2).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {avatarInitials || 'S'}
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
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[value as string] || 'bg-slate-100 text-slate-800'}`}
        >
          {getRoleLabel(value as string)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value, row) => {
        const isPending = (row as any).mustUpdateProfile;
        if (isPending) {
          return <StatusBadge status="warning" label="Pending Profile" />;
        }

        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          inactive: 'warning',
          locked: 'error',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={value as string}
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
          >
            {row.status === 'locked' ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </button>
          <button
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Detail"
          >
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
          title="Internal Staff Management"
          description="Manage clinic staff, assign roles, and handle onboarding"
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add New Staff
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Staff"
                value={totalStaff}
                icon={Users}
                description="Total active and pending staff"
                variant="primary"
              />
              <StatsCard
                title="Active Staff"
                value={activeStaff}
                icon={Shield}
                description="Staff with completed profiles"
                variant="success"
              />
              <StatsCard
                title="Pending Profiles"
                value={pendingStaff}
                icon={Users}
                description="Awaiting first login completion"
                variant="warning"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
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

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <DataTable<User>
                columns={userColumns}
                data={filteredUsers}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No staff found"
              />
            </div>
          </div>
        </main>
      </div>

      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
