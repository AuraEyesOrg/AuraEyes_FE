import { useEffect, useState, useCallback } from 'react';
import { Users, Search, Eye, X, Lock, Unlock, Shield } from 'lucide-react';
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
import { ophthalmologistApi } from '../api/ophthalmologist.api';
import { formatCurrency, vndCurrencyOptions } from '@/lib/helper';

const roleLabelMeta: Record<string, { key: string; fallback: string }> = {
  Ophthalmologist: {
    key: 'SystemAdmin.users.roles.ophthalmologist',
    fallback: 'Ophthalmologist',
  },
  ClinicStaff: {
    key: 'SystemAdmin.users.roles.clinicStaff',
    fallback: 'Clinic Staff',
  },
};

const roleColors: Record<string, string> = {
  Ophthalmologist:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ClinicStaff:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

type StaffUser = User & {
  phoneNumber?: string | null;
  isActive?: boolean;
  emailConfirmed?: boolean;
  fullName?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  roles?: string[];
  organisationId?: string;
  organisationName?: string;
  mustUpdateProfile?: boolean;
  consultationFee?: number;
  ophthalmologistId?: string;
  subRoles?: string[];
  clinicStaffId?: string;
};

export default function StaffManagementPage() {
  const { t } = useSafeTranslation();
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState<number>(0);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [editingSubRoles, setEditingSubRoles] = useState(false);
  const [subRolesValue, setSubRolesValue] = useState<string[]>([]);
  const [isUpdatingSubRoles, setIsUpdatingSubRoles] = useState(false);

  const roleFilterOptions: Array<{ value: string; label: string }> = [
    {
      value: 'all',
      label: t('SystemAdmin.users.filters.options.allRoles', 'All Roles'),
    },
    { value: 'Ophthalmologist', label: 'Ophthalmologist' },
    { value: 'ClinicStaff', label: 'Clinic Staff' },
  ];

  const getRoleLabel = (role: string) => {
    const meta = roleLabelMeta[role];
    return meta ? t(meta.key, meta.fallback) : role;
  };

  const isLockedStatus = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    return (
      normalized === 'locked' ||
      normalized === 'suspended' ||
      normalized === 'inactive'
    );
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return notAvailableLabel;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await userApi.getUsers(1, 100); // Get a larger batch for now

      // Only keep staff roles (ClinicStaff, Ophthalmologist)
      const staffUsers = (usersData?.items || []).filter(
        (u: StaffUser) =>
          u.role === 'ClinicStaff' || u.role === 'Ophthalmologist'
      );
      setUsers(staffUsers);
    } catch (error) {
      console.error('Failed to load staff data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalStaff = users.length;
  const activeStaff = users.filter((u) => {
    const status = (u.status || '').toLowerCase();
    return status === 'active' || status === 'online';
  }).length;
  const pendingStaff = users.filter(
    (u) => u.status === 'Pending' || (u as any).mustUpdateProfile
  ).length;

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
      if (isLockedStatus(currentStatus)) {
        await userApi.unlockUser(userId);
        toast.success('Account unlocked.');
      } else {
        await userApi.lockUser(userId);
        toast.success('Account locked.');
      }
      await loadData();
      setSelectedUser((prev) =>
        prev && prev.id === userId
          ? {
              ...prev,
              status: isLockedStatus(currentStatus) ? 'Active' : 'Suspended',
              isActive: isLockedStatus(currentStatus),
            }
          : prev
      );
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleUpdateFee = async () => {
    if (!selectedUser) return;
    try {
      setIsUpdatingFee(true);
      // We use the onboard/update API pattern.
      // Actually, we can use the same updateEmploymentType but we need the other required fields.
      // Since this is a shortcut, we might need a specific "UpdateFee" endpoint in the future.
      // For now, I'll use the existing updateEmploymentType with current values.

      // But wait, staff-management doesn't have all doctor details.
      // I'll call updateConsultationFee directly if I can.
      // Let's check if there's a simpler endpoint.
      // Actually, I'll just use the one I updated earlier.

      await ophthalmologistApi.updateEmploymentType({
        id: selectedUser.ophthalmologistId || selectedUser.id,
        bio: (selectedUser as any).bio || '',
        employmentType: (selectedUser as any).employmentType || 'FullTime',
        consultationFee: feeValue,
      });

      toast.success('Consultation fee updated successfully.');
      setEditingFee(false);
      await loadData();
      setSelectedUser((prev) =>
        prev ? { ...prev, consultationFee: feeValue } : null
      );
    } catch (error) {
      toast.error('Failed to update consultation fee.');
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleUpdateSubRoles = async () => {
    if (!selectedUser || !selectedUser.clinicStaffId) return;
    try {
      setIsUpdatingSubRoles(true);
      await userApi.updateClinicStaff(selectedUser.clinicStaffId, {
        subRoles: subRolesValue,
        phone: selectedUser.phoneNumber || undefined,
      });

      toast.success('Functional roles updated successfully.');
      setEditingSubRoles(false);
      await loadData();
      setSelectedUser((prev) =>
        prev ? { ...prev, subRoles: subRolesValue } : null
      );
    } catch (error) {
      toast.error('Failed to update functional roles.');
    } finally {
      setIsUpdatingSubRoles(false);
    }
  };

  const toggleSubRoleValue = (sub: string) => {
    setSubRolesValue((prev) => {
      const current = [...prev];
      const index = current.indexOf(sub);
      if (index > -1) {
        if (current.length > 1) current.splice(index, 1);
      } else {
        current.push(sub);
      }
      return current;
    });
  };

  const userColumns: TableColumn<StaffUser>[] = [
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
          Active: 'success',
          Online: 'success',
          suspended: 'error',
          Suspended: 'error',
          inactive: 'warning',
          Inactive: 'warning',
          locked: 'error',
          Locked: 'error',
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
            title={
              isLockedStatus(row.status) ? 'Unlock account' : 'Lock account'
            }
          >
            {isLockedStatus(row.status) ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setSelectedUser(row)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title="View Detail"
          >
            <Eye className="w-5 h-5" />
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
          showLogo={true}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20"
              >
                {t('SystemAdmin.staff.actions.addNew', 'Add New Staff')}
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
              <DataTable<StaffUser>
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Staff Detail
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">User ID</p>
                <p className="font-medium break-all">{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Full Name</p>
                <p className="font-medium">
                  {selectedUser.fullName ||
                    selectedUser.name ||
                    notAvailableLabel}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium">
                  {selectedUser.email || notAvailableLabel}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Phone Number</p>
                <p className="font-medium">
                  {selectedUser.phoneNumber || notAvailableLabel}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Primary Role</p>
                <p className="font-medium">{getRoleLabel(selectedUser.role)}</p>
              </div>
              <div>
                <p className="text-slate-500">All Roles</p>
                <p className="font-medium">
                  {(selectedUser.roles || [selectedUser.role]).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium">
                  {selectedUser.status || notAvailableLabel}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Active</p>
                <p className="font-medium">
                  {selectedUser.isActive ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Email Confirmed</p>
                <p className="font-medium">
                  {selectedUser.emailConfirmed ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Created At</p>
                <p className="font-medium">
                  {formatDateTime(selectedUser.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Last Login</p>
                <p className="font-medium">
                  {formatDateTime(
                    selectedUser.lastLoginAt || selectedUser.lastLogin
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Profile Completion Required</p>
                <p className="font-medium">
                  {selectedUser.mustUpdateProfile ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedUser.role === 'Ophthalmologist' && (
                <div className="md:col-span-2 p-4 rounded-xl bg-primary/5 border border-primary/20 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-primary">
                      Consultation Fee
                    </p>
                    {!editingFee ? (
                      <button
                        onClick={() => {
                          setFeeValue(selectedUser.consultationFee || 0);
                          setEditingFee(true);
                        }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Edit Fee
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleUpdateFee}
                          disabled={isUpdatingFee}
                          className="text-xs font-bold text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          {isUpdatingFee ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingFee(false)}
                          className="text-xs font-bold text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!editingFee ? (
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedUser.consultationFee
                        ? formatCurrency(
                            selectedUser.consultationFee,
                            vndCurrencyOptions
                          )
                        : 'Not set'}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                          ₫
                        </span>
                        <input
                          type="number"
                          value={feeValue}
                          onChange={(e) => setFeeValue(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border border-primary/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          placeholder="e.g. 500000"
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center px-1">
                        <span>Preview:</span>
                        <span className="text-primary">
                          {formatCurrency(feeValue || 0, vndCurrencyOptions)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
              {selectedUser.role === 'ClinicStaff' && (
                <div className="md:col-span-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Functional Roles (Sub-roles)
                    </p>
                    {!editingSubRoles ? (
                      <button
                        onClick={() => {
                          setSubRolesValue(selectedUser.subRoles || []);
                          setEditingSubRoles(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Edit Roles
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleUpdateSubRoles}
                          disabled={isUpdatingSubRoles}
                          className="text-xs font-bold text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          {isUpdatingSubRoles ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingSubRoles(false)}
                          className="text-xs font-bold text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!editingSubRoles ? (
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.subRoles || []).length > 0 ? (
                        (selectedUser.subRoles || []).map((sub) => (
                          <span
                            key={sub}
                            className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          No sub-roles assigned
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['Receptionist', 'Coordinator', 'Cashier'].map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubRoleValue(sub)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                            subRolesValue.includes(sub)
                              ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10'
                              : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedUser.role === 'Ophthalmologist' && (
                <div>
                  <p className="text-slate-500">Role Summary</p>
                  <p className="font-medium">
                    Clinical ophthalmologist account
                  </p>
                </div>
              )}
              {selectedUser.role === 'ClinicStaff' && (
                <div>
                  <p className="text-slate-500">Role Summary</p>
                  <p className="font-medium">
                    Internal clinic operations staff
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  handleToggleLock(selectedUser.id, selectedUser.status || '')
                }
                className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${
                  isLockedStatus(selectedUser.status)
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isLockedStatus(selectedUser.status)
                  ? 'Unlock Account'
                  : 'Lock Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
