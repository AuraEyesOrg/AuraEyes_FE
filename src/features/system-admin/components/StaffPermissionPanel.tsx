import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  User as UserIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { userApi } from '../api/user.api';
import { permissionsApi } from '../api/permissions.api';
import {
  User as AdminUser,
  PermissionDto,
  UserEffectivePermissionsDto,
} from '../types/system-admin.types';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const CATEGORY_COLORS: Record<string, string> = {
  Users: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Permissions:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Patients:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Ophthalmologists:
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Organisations:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Screening:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Consultations:
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Audit:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Dashboard: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Appointments: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Scheduling:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Quotas:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Wallets:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Financial: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Contracts:
    'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400',
  Platform:
    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  Settings:
    'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  Notifications:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const categoryClass = (cat?: string) =>
  cat && CATEGORY_COLORS[cat]
    ? CATEGORY_COLORS[cat]
    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

export const StaffPermissionPanel: React.FC = () => {
  const { t } = useSafeTranslation();

  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [userEffective, setUserEffective] =
    useState<UserEffectivePermissionsDto | null>(null);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [processingPerm, setProcessingPerm] = useState<string | null>(null);

  // Load staff users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const result = await userApi.getUsers(1, 200);
      const items = (result?.items ?? []).map((u) => ({
        ...u,
        name: ((u as any).fullName ?? u.name) || '',
      })) as AdminUser[];

      // Filter out Patients by default as they don't usually have granular overrides in this UI
      setUsers(items.filter((u) => u.role !== 'Patient'));
    } catch (err) {
      toast.error(
        t('SystemAdmin.permissions.users.loadError', 'Failed to load users')
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [t]);

  // Load all available permissions
  const loadAllPermissions = useCallback(async () => {
    setLoadingPerms(true);
    try {
      const result = await permissionsApi.getPermissions({ pageSize: 500 });
      setAllPermissions(result?.items ?? []);
    } catch (err) {
      toast.error(
        t('SystemAdmin.permissions.loadError', 'Failed to load permissions')
      );
    } finally {
      setLoadingPerms(false);
    }
  }, [t]);

  // Load specific user effective permissions
  const loadUserPermissions = useCallback(
    async (userId: string) => {
      setLoadingUserPerms(true);
      try {
        const result = await permissionsApi.getUserPermissions(userId);
        setUserEffective(result ?? null);
      } catch (err) {
        toast.error(
          t(
            'SystemAdmin.permissions.users.loadPermError',
            'Failed to load user permissions'
          )
        );
      } finally {
        setLoadingUserPerms(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadUsers();
    loadAllPermissions();
  }, [loadUsers, loadAllPermissions]);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    } else {
      setUserEffective(null);
    }
  }, [selectedUser, loadUserPermissions]);

  // Filtering users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDto[]> = {};
    allPermissions.forEach((p) => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [allPermissions]);

  // Handle toggle logic
  const handleTogglePermission = async (perm: PermissionDto) => {
    if (!selectedUser || !userEffective) return;

    setProcessingPerm(perm.name);
    const isCurrentlyGranted = userEffective.effectivePermissionNames.includes(
      perm.name
    );
    const override = userEffective.userOverrides.find(
      (o) => o.permissionName === perm.name && o.isActive
    );

    try {
      if (isCurrentlyGranted) {
        // Current state: Allowed -> Action: Deny
        if (override && override.isGranted) {
          // It was explicitly granted by override -> revoke override to return to (presumably) denied default
          await permissionsApi.revokeUserPermission(override.userPermissionId);
        } else {
          // It was granted by role -> create an explicit DENY override
          await permissionsApi.grantPermissionToUser({
            userId: selectedUser.id,
            permissionId: perm.id,
            isGranted: false,
          });
        }
      } else {
        // Current state: Denied -> Action: Allow
        if (override && !override.isGranted) {
          // It was explicitly denied by override -> revoke override to return to (presumably) allowed role default
          await permissionsApi.revokeUserPermission(override.userPermissionId);
        } else {
          // It was denied by role (or just not in role) -> create an explicit GRANT override
          await permissionsApi.grantPermissionToUser({
            userId: selectedUser.id,
            permissionId: perm.id,
            isGranted: true,
          });
        }
      }

      // Refresh local state to reflect change
      await loadUserPermissions(selectedUser.id);
      toast.success(
        t(
          'SystemAdmin.permissions.users.updateSuccess',
          'Permission updated successfully'
        )
      );
    } catch (err) {
      toast.error(
        extractApiErrorMessage(err, 'Failed to update permission override')
      );
    } finally {
      setProcessingPerm(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-250px)] min-h-[600px] gap-6 bg-slate-50/50 dark:bg-slate-950/30 p-1 rounded-3xl overflow-hidden">
      {/* Left Panel: User List */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" />
              {t('SystemAdmin.permissions.users.staffList', 'Staff Directory')}
            </h3>
            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {filteredUsers.length}
            </span>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t(
                'SystemAdmin.permissions.users.searchPlaceholder',
                'Find staff by name or email...'
              )}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <UserIcon className="absolute inset-0 m-auto w-5 h-5 text-primary opacity-50" />
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                {t('SystemAdmin.common.loading', 'Loading Directory')}
              </span>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  selectedUser?.id === user.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] z-10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {selectedUser?.id === user.id && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10'
                  }`}
                >
                  <UserIcon
                    className={`w-5 h-5 transition-colors ${
                      selectedUser?.id === user.id
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-primary'
                    }`}
                  />
                </div>
                <div className="flex-1 text-left min-w-0 relative">
                  <div
                    className={`text-sm font-bold truncate ${
                      selectedUser?.id === user.id
                        ? 'text-white'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {user.name}
                  </div>
                  <div
                    className={`text-[10px] font-medium uppercase tracking-wider truncate ${
                      selectedUser?.id === user.id
                        ? 'text-white/70'
                        : 'text-primary/70'
                    }`}
                  >
                    {user.role}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-all ${
                    selectedUser?.id === user.id
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                {t('SystemAdmin.common.noResults', 'No matching staff')}
              </p>
              <p className="text-[10px] text-slate-300 mt-1 max-w-[150px]">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Permission Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-2xl">
                <Shield className="w-12 h-12 text-primary animate-float" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {t(
                'SystemAdmin.permissions.users.selectUserTitle',
                'Access Management'
              )}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed text-sm font-medium">
              {t(
                'SystemAdmin.permissions.users.selectUserDesc',
                'Select a team member from the directory to fine-tune their permissions with specific overrides.'
              )}
            </p>
            <div className="mt-8 flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Granular
                Control
              </div>
              <div className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-amber-500" /> Audit Logged
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Area */}
            <div className="relative p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="w-32 h-32 text-primary" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur group-hover:blur-xl transition-all duration-500" />
                    <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-primary/20 shadow-xl overflow-hidden">
                      <UserIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-4 border-white dark:border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2 tracking-tight">
                      {selectedUser.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-primary text-white uppercase tracking-widest shadow-lg shadow-primary/20">
                        {selectedUser.role}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 font-black tracking-widest text-xs">
                        •
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                        {selectedUser.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center min-w-[80px] h-14 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-4">
                    <span className="text-[9px] uppercase tracking-tighter font-black text-slate-400">
                      Total Access
                    </span>
                    <span className="text-xl font-black text-primary leading-none mt-1">
                      {userEffective?.effectivePermissionNames.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center min-w-[80px] h-14 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 px-4">
                    <span className="text-[9px] uppercase tracking-tighter font-black text-white/70">
                      Active Overrides
                    </span>
                    <span className="text-xl font-black text-white leading-none mt-1">
                      {userEffective?.userOverrides.filter((o) => o.isActive)
                        .length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white/40 dark:bg-slate-800/40 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                <Info className="w-3.5 h-3.5 text-primary" />
                Changes made here create immediate overrides. Revoking an
                override reverts to role defaults.
              </div>
            </div>

            {/* Permissions Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              {loadingUserPerms || loadingPerms ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary opacity-30" />
                  <span className="text-xs text-slate-300 font-black uppercase tracking-[0.2em] animate-pulse">
                    Synchronizing Policies
                  </span>
                </div>
              ) : (
                <div className="space-y-12 pt-8 pb-10">
                  {Object.entries(groupedPermissions).map(
                    ([category, perms]) => (
                      <section
                        key={category}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                      >
                        <div className="flex items-center gap-4 mb-6 sticky top-0 z-20 py-3 bg-white dark:bg-slate-900">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-current/10 ${categoryClass(category)}`}
                          >
                            <Tag className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {category}
                          </h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800 ml-2" />
                          <span className="text-[10px] font-black bg-slate-50 dark:bg-slate-800 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                            {perms.length} Functions
                          </span>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          {perms.map((perm) => {
                            const isEffective =
                              userEffective?.effectivePermissionNames.includes(
                                perm.name
                              );
                            const isFromRole =
                              userEffective?.rolePermissions.some(
                                (rp) => rp.name === perm.name
                              );
                            const override = userEffective?.userOverrides.find(
                              (o) =>
                                o.permissionName === perm.name && o.isActive
                            );
                            const isProcessing = processingPerm === perm.name;

                            return (
                              <div
                                key={perm.id}
                                className={`group p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                  isEffective
                                    ? 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-emerald-500/0 hover:ring-emerald-500/20'
                                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 hover:bg-white dark:hover:bg-slate-800/30'
                                }`}
                              >
                                {/* Background highlight for active state */}
                                {isEffective && (
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                                )}

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                        {perm.displayName}
                                      </span>
                                      {override && (
                                        <span
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                            override.isGranted
                                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10'
                                              : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50 shadow-sm shadow-rose-500/10'
                                          }`}
                                        >
                                          {override.isGranted
                                            ? 'Explicit Grant'
                                            : 'Explicit Deny'}
                                        </span>
                                      )}
                                    </div>
                                    <code className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-3 border border-slate-200/50 dark:border-slate-700/50">
                                      {perm.name}
                                    </code>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                      {perm.description ||
                                        t(
                                          'SystemAdmin.common.noDescription',
                                          'No functional description provided'
                                        )}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end justify-between self-stretch pt-1">
                                    {/* Modern Switch */}
                                    <button
                                      onClick={() =>
                                        handleTogglePermission(perm)
                                      }
                                      disabled={isProcessing}
                                      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-500 focus:outline-none disabled:cursor-not-allowed ${
                                        isEffective
                                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                          : 'bg-slate-200 dark:bg-slate-700'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                          isEffective
                                            ? 'translate-x-5 rotate-0'
                                            : 'translate-x-0 -rotate-90'
                                        }`}
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-primary absolute inset-0 m-auto" />
                                        ) : isEffective ? (
                                          <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        ) : null}
                                      </span>
                                    </button>

                                    <div className="flex items-center gap-1.5 h-5">
                                      {isFromRole && (
                                        <div className="group/tip relative flex items-center">
                                          <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
                                          <div className="absolute bottom-full right-0 mb-2 w-48 hidden group-hover/tip:block bg-slate-900 dark:bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-2xl z-20 border border-slate-700 backdrop-blur-md">
                                            <p className="font-bold mb-1 flex items-center gap-2">
                                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                              Role Inherited
                                            </p>
                                            <p className="text-slate-400 font-medium">
                                              This permission is granted by the
                                              user's primary role (
                                              {selectedUser.role}).
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      {!isEffective && !isFromRole && (
                                        <ShieldAlert className="w-4 h-4 text-slate-200 dark:text-slate-800" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};
