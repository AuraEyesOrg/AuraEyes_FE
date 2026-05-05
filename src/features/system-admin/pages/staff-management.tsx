import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { formatCurrency, vndCurrencyOptions } from '@/lib/helper';
import {
  Activity,
  Eye,
  Gift,
  Lock,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Stethoscope,
  Unlock,
  User,
  Users,
  X,
} from 'lucide-react';
import { resolveAvatarUrl, getUserAvatarMeta } from '@/lib/user-avatar';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { userApi } from '../api';
import { leavePoliciesApi } from '../api/leave-policies.api';
import { ophthalmologistApi } from '../api/ophthalmologist.api';
import CreateStaffModal from '../components/CreateStaffModal';
import DataTable, { type TableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import type { User as BaseUser } from '../types/system-admin.types';

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

// Cooldown to prevent re-fetch on locale-switch remount
let staffCacheTimestamp = 0;
const STAFF_CACHE_TTL = 10_000;

type StaffUser = BaseUser & {
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
  availableLeaveDays?: number;
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

  // Doctor specific states
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState<number>(0);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [availableLeaveDays, setAvailableLeaveDays] = useState<number | null>(
    null
  );
  const [leavePolicies, setLeavePolicies] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false);
  const [isLoadingDoctorDetail, setIsLoadingDoctorDetail] = useState(false);

  // Clinic Staff specific states
  const [editingSubRoles, setEditingSubRoles] = useState(false);
  const [subRolesValue, setSubRolesValue] = useState<string[]>([]);
  const [isUpdatingSubRoles, setIsUpdatingSubRoles] = useState(false);

  const roleFilterOptions = [
    {
      value: 'all',
      label: t('SystemAdmin.users.filters.options.allRoles', 'All Roles'),
    },
    {
      value: 'Ophthalmologist',
      label: t(
        'SystemAdmin.users.filters.options.ophthalmologist',
        'Ophthalmologist'
      ),
    },
    {
      value: 'ClinicStaff',
      label: t('SystemAdmin.users.filters.options.clinicStaff', 'Clinic Staff'),
    },
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
    const now = Date.now();
    if (now - staffCacheTimestamp < STAFF_CACHE_TTL) return;
    staffCacheTimestamp = now;
    try {
      setLoading(true);
      const usersData = await userApi.getUsers(1, 1000);
      const staffUsers = (usersData?.items || []).filter(
        (u: StaffUser) =>
          u.role === 'ClinicStaff' || u.role === 'Ophthalmologist'
      );
      setUsers(staffUsers);
    } catch (error) {
      console.error('Failed to load staff data', error);
      toast.error(
        t(
          'SystemAdmin.staffManagement.toasts.loadError',
          'Failed to load staff data'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadData = useCallback(async () => {
    staffCacheTimestamp = 0;
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedUser?.role === 'Ophthalmologist') {
      const fetchDetails = async () => {
        setIsLoadingDoctorDetail(true);
        try {
          const ophthalmologistId =
            selectedUser.ophthalmologistId || selectedUser.id;
          const docDetail =
            await ophthalmologistApi.getOphthalmologistDetail(
              ophthalmologistId
            );
          setAvailableLeaveDays(docDetail.availableLeaveDays ?? 0);

          const policiesRes = await leavePoliciesApi.getPaged(1, 100);
          setLeavePolicies(policiesRes.items || []);
        } catch (error) {
          console.error('Failed to fetch doctor detail', error);
        } finally {
          setIsLoadingDoctorDetail(false);
        }
      };
      fetchDetails();
    }
  }, [selectedUser]);

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      if (isLockedStatus(currentStatus)) {
        await userApi.unlockUser(userId);
        toast.success(
          t(
            'SystemAdmin.staffManagement.toasts.accountUnlocked',
            'Account unlocked successfully.'
          )
        );
      } else {
        await userApi.lockUser(userId);
        toast.success(
          t(
            'SystemAdmin.staffManagement.toasts.accountLocked',
            'Account locked successfully.'
          )
        );
      }
      await reloadData();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                status: isLockedStatus(currentStatus) ? 'Active' : 'Locked',
              }
            : null
        );
      }
    } catch {
      toast.error(
        t(
          'SystemAdmin.staffManagement.toasts.updateStatusError',
          'Failed to update account status.'
        )
      );
    }
  };

  const handleUpdateFee = async () => {
    if (!selectedUser) return;
    try {
      setIsUpdatingFee(true);
      await ophthalmologistApi.updateEmploymentType({
        id: selectedUser.ophthalmologistId || selectedUser.id,
        bio: (selectedUser as any).bio || '',
        employmentType: (selectedUser as any).employmentType || 'FullTime',
        consultationFee: feeValue,
      });
      toast.success(
        t(
          'SystemAdmin.staffManagement.toasts.feeUpdated',
          'Consultation fee updated.'
        )
      );
      setEditingFee(false);
      await reloadData();
      setSelectedUser((prev) =>
        prev ? { ...prev, consultationFee: feeValue } : null
      );
    } catch {
      toast.error(
        t(
          'SystemAdmin.staffManagement.toasts.updateFeeError',
          'Failed to update fee.'
        )
      );
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
      toast.success(
        t(
          'SystemAdmin.staffManagement.toasts.rolesUpdated',
          'Functional roles updated.'
        )
      );
      setEditingSubRoles(false);
      await reloadData();
      setSelectedUser((prev) =>
        prev ? { ...prev, subRoles: subRolesValue } : null
      );
    } catch {
      toast.error(
        t(
          'SystemAdmin.staffManagement.toasts.updateRolesError',
          'Failed to update roles.'
        )
      );
    } finally {
      setIsUpdatingSubRoles(false);
    }
  };

  const handleApplyPolicy = async () => {
    const ophthalmologistId =
      selectedUser?.ophthalmologistId || selectedUser?.id;
    if (!ophthalmologistId || !selectedPolicyId) return;
    try {
      setIsApplyingPolicy(true);
      await leavePoliciesApi.apply(selectedPolicyId, ophthalmologistId);
      toast.success(
        t(
          'SystemAdmin.staffManagement.toasts.policyApplied',
          'Policy applied: Leave fund increased.'
        )
      );
      const docDetail =
        await ophthalmologistApi.getOphthalmologistDetail(ophthalmologistId);
      setAvailableLeaveDays(docDetail.availableLeaveDays ?? 0);
      setSelectedPolicyId('');
    } catch {
      toast.error(
        t(
          'SystemAdmin.staffManagement.toasts.applyPolicyError',
          'Failed to apply policy.'
        )
      );
    } finally {
      setIsApplyingPolicy(false);
    }
  };

  const renderStatusBadge = (status?: string) => {
    const s = (
      status || t('SystemAdmin.common.active', 'Active')
    ).toLowerCase();
    let variant: 'success' | 'warning' | 'error' | 'info' | 'processing' =
      'info';

    if (s === 'active' || s === 'online') variant = 'success';
    else if (s === 'locked' || s === 'suspended' || s === 'inactive')
      variant = 'error';
    else if (s === 'pending') variant = 'warning';

    return (
      <StatusBadge
        status={variant}
        label={status || t('SystemAdmin.common.active', 'Active')}
      />
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userColumns: TableColumn<StaffUser>[] = [
    {
      header: t(
        'SystemAdmin.staffManagement.table.staffMember',
        'Staff Member'
      ),
      accessor: 'name',
      render: (_, row) => {
        const avatarUrl = resolveAvatarUrl(
          row.avatarUrl,
          row.providerAvatarUrl
        );
        const { initials } = getUserAvatarMeta(row.name);
        return (
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={row.name}
                className="w-10 h-10 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm">
                {initials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {row.name}
              </span>
              <span className="text-xs text-slate-500">{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: t('SystemAdmin.staffManagement.table.role', 'Role'),
      accessor: 'role',
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[val as string]}`}
        >
          {getRoleLabel(val as string)}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.staffManagement.table.status', 'Status'),
      accessor: 'status',
      render: (val) => renderStatusBadge(val as string),
    },
    {
      header: t('SystemAdmin.staffManagement.table.actions', 'Actions'),
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedUser(row)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleLock(row.id, row.status)}
            className={`p-2 rounded-xl transition-all ${isLockedStatus(row.status) ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {isLockedStatus(row.status) ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
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
          title={t('SystemAdmin.staffManagement.title', 'Staff Management')}
          description={t(
            'SystemAdmin.staffManagement.description',
            'Control access and professional settings for your clinic team'
          )}
          actions={
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 bg-primary text-slate-900 font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm uppercase tracking-widest"
            >
              {t('SystemAdmin.staffManagement.actions.addStaff', 'Add Staff')}
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-none">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title={t(
                  'SystemAdmin.staffManagement.stats.totalStaff',
                  'Total Staff'
                )}
                value={users.length}
                icon={Users}
                variant="primary"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.staffManagement.stats.doctors',
                  'Doctors'
                )}
                value={users.filter((u) => u.role === 'Ophthalmologist').length}
                icon={Stethoscope}
                variant="success"
              />
              <StatsCard
                title={t('SystemAdmin.staffManagement.stats.locked', 'Locked')}
                value={users.filter((u) => isLockedStatus(u.status)).length}
                icon={Lock}
                variant="danger"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={t(
                    'SystemAdmin.staffManagement.searchPlaceholder',
                    'Search staff...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
              <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {roleFilterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRoleFilter(opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${roleFilter === opt.value ? 'bg-primary text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
              <DataTable
                columns={userColumns}
                data={filteredUsers}
                isLoading={loading}
                keyExtractor={(r) => r.id}
              />
            </div>
          </div>
        </main>
      </div>

      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadData}
      />

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <User className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t(
                      'SystemAdmin.staffManagement.modal.title',
                      'Staff Details'
                    )}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t(
                      'SystemAdmin.staffManagement.modal.subtitle',
                      'Management Overview'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 scrollbar-thin">
              {/* Profile Card */}
              <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                {resolveAvatarUrl(
                  selectedUser.avatarUrl,
                  selectedUser.providerAvatarUrl
                ) ? (
                  <img
                    src={
                      resolveAvatarUrl(
                        selectedUser.avatarUrl,
                        selectedUser.providerAvatarUrl
                      )!
                    }
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-3xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                    {getUserAvatarMeta(selectedUser.name).initials}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColors[selectedUser.role]}`}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ID: {selectedUser.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                {renderStatusBadge(selectedUser.status)}
              </div>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Mail className="w-4 h-4 text-primary" />
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t(
                        'SystemAdmin.staffManagement.modal.contactInfo',
                        'Contact Info'
                      )}
                    </h5>
                  </div>
                  <div className="space-y-4 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {t('SystemAdmin.staffManagement.modal.email', 'Email')}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                        {selectedUser.email}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Phone
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {selectedUser.phoneNumber || notAvailableLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t(
                        'SystemAdmin.staffManagement.modal.security',
                        'Security'
                      )}
                    </h5>
                  </div>
                  <div className="space-y-4 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {t(
                          'SystemAdmin.staffManagement.modal.lastActivity',
                          'Last Activity'
                        )}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {formatDateTime(selectedUser.lastLoginAt)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleLock(selectedUser.id, selectedUser.status)
                      }
                      className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLockedStatus(selectedUser.status) ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      {isLockedStatus(selectedUser.status)
                        ? t(
                            'SystemAdmin.staffManagement.modal.unlockAccount',
                            'Unlock Account'
                          )
                        : t(
                            'SystemAdmin.staffManagement.modal.lockAccount',
                            'Lock Account'
                          )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional (Doctors) */}
              {selectedUser.role === 'Ophthalmologist' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 px-1">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t(
                        'SystemAdmin.staffManagement.modal.professionalSettings',
                        'Professional Settings'
                      )}
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fee */}
                    <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t(
                            'SystemAdmin.staffManagement.modal.consultationFee',
                            'Consultation Fee'
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setEditingFee(true);
                            setFeeValue(selectedUser.consultationFee || 0);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {editingFee ? (
                        <div className="space-y-3">
                          <input
                            type="number"
                            value={feeValue}
                            onChange={(e) =>
                              setFeeValue(Number(e.target.value))
                            }
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-primary/10"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFee(false)}
                              className="flex-1 py-2 text-[10px] font-bold text-slate-400"
                            >
                              {t(
                                'SystemAdmin.staffManagement.actions.cancel',
                                'Cancel'
                              )}
                            </button>
                            <button
                              onClick={handleUpdateFee}
                              className="flex-1 py-2 bg-primary rounded-xl text-[10px] font-black uppercase"
                            >
                              {t(
                                'SystemAdmin.staffManagement.actions.save',
                                'Save'
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(
                            selectedUser.consultationFee || 0,
                            vndCurrencyOptions
                          )}
                        </p>
                      )}
                    </div>
                    {/* Leave Fund */}
                    <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t(
                            'SystemAdmin.staffManagement.modal.leaveFund',
                            'Leave Fund'
                          )}
                        </span>
                        <Gift className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-600">
                          {availableLeaveDays ?? '...'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {t('SystemAdmin.staffManagement.modal.days', 'Days')}
                        </span>
                      </div>
                      <div className="pt-2">
                        <select
                          value={selectedPolicyId}
                          onChange={(e) => setSelectedPolicyId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                        >
                          <option value="">
                            {t(
                              'SystemAdmin.staffManagement.modal.applyPolicyPlaceholder',
                              'Apply Policy...'
                            )}
                          </option>
                          {leavePolicies.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (+{p.additionalDays})
                            </option>
                          ))}
                        </select>
                        {selectedPolicyId && (
                          <button
                            onClick={handleApplyPolicy}
                            disabled={isApplyingPolicy}
                            className="w-full mt-2 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                          >
                            {isApplyingPolicy
                              ? t(
                                  'SystemAdmin.staffManagement.modal.applying',
                                  'Applying...'
                                )
                              : t(
                                  'SystemAdmin.staffManagement.actions.apply',
                                  'Apply'
                                )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Functional Roles (Clinic Staff) */}
              {selectedUser.role === 'ClinicStaff' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t(
                        'SystemAdmin.staffManagement.modal.functionalRoles',
                        'Functional Roles'
                      )}
                    </h5>
                  </div>
                  <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {t(
                          'SystemAdmin.staffManagement.modal.subRolesLabel',
                          'Sub-roles'
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setEditingSubRoles(true);
                          setSubRolesValue(selectedUser.subRoles || []);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.subRoles || []).map((r) => (
                        <span
                          key={r}
                          className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    {editingSubRoles && (
                      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              key: 'Registration',
                              label: t(
                                'SystemAdmin.staffManagement.modal.subRoles.Registration',
                                'Registration'
                              ),
                            },
                            {
                              key: 'Screening',
                              label: t(
                                'SystemAdmin.staffManagement.modal.subRoles.Screening',
                                'Screening'
                              ),
                            },
                            {
                              key: 'Payment',
                              label: t(
                                'SystemAdmin.staffManagement.modal.subRoles.Payment',
                                'Payment'
                              ),
                            },
                            {
                              key: 'ConsultationSupport',
                              label: t(
                                'SystemAdmin.staffManagement.modal.subRoles.ConsultationSupport',
                                'ConsultationSupport'
                              ),
                            },
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-white transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={subRolesValue.includes(key)}
                                onChange={(e) =>
                                  e.target.checked
                                    ? setSubRolesValue([...subRolesValue, key])
                                    : setSubRolesValue(
                                        subRolesValue.filter((r) => r !== key)
                                      )
                                }
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span className="text-[10px] font-bold text-slate-600">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setEditingSubRoles(false)}
                            className="flex-1 py-2 text-[10px] font-bold text-slate-400"
                          >
                            {t(
                              'SystemAdmin.staffManagement.actions.cancel',
                              'Cancel'
                            )}
                          </button>
                          <button
                            onClick={handleUpdateSubRoles}
                            className="flex-1 py-2 bg-primary rounded-xl text-[10px] font-black uppercase"
                          >
                            {t(
                              'SystemAdmin.staffManagement.actions.update',
                              'Update'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
              >
                {t(
                  'SystemAdmin.staffManagement.actions.closeProfile',
                  'Close Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
