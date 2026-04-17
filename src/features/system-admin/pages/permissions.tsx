/**
 * Permission Management Page
 * System Admin view for managing permissions, role assignments, and user overrides.
 *
 * Tab 1 — All Permissions:  full CRUD (create / edit / deactivate)
 * Tab 2 — Role Assignments: view & manage permissions per Identity role
 * Tab 3 — User Overrides:   grant or revoke individual user permission overrides
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  Key,
  Layers,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Tag,
  Trash2,
  User,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DataTable, { type TableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { permissionsApi } from '../api/permissions.api';
import { userApi } from '../api/user.api';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type {
  ApplicationRoleDto,
  CreatePermissionPayload,
  GrantPermissionToUserPayload,
  PermissionDto,
  RolePermissionAssignment,
  UpdatePermissionPayload,
  User as AdminUser,
  UserEffectivePermissionsDto,
} from '../types/system-admin.types';

// ─── Category helpers ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Users: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Permissions:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Patients:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
};

const categoryClass = (cat?: string) =>
  cat && CATEGORY_COLORS[cat]
    ? CATEGORY_COLORS[cat]
    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

const KNOWN_CATEGORIES = [
  'Users',
  'Permissions',
  'Patients',
  'Ophthalmologists',
  'Organisations',
  'Screening',
  'Consultations',
  'Audit',
  'Dashboard',
];

const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  Users: 'SystemAdmin.permissions.categories.users',
  Permissions: 'SystemAdmin.permissions.categories.permissions',
  Patients: 'SystemAdmin.permissions.categories.patients',
  Ophthalmologists: 'SystemAdmin.permissions.categories.ophthalmologists',
  Organisations: 'SystemAdmin.permissions.categories.organisations',
  Screening: 'SystemAdmin.permissions.categories.screening',
  Consultations: 'SystemAdmin.permissions.categories.consultations',
  Audit: 'SystemAdmin.permissions.categories.audit',
  Dashboard: 'SystemAdmin.permissions.categories.dashboard',
};

const getCategoryLabel = (
  category: string | undefined,
  t: ReturnType<typeof useSafeTranslation>['t']
) => {
  if (!category) return '';
  const key = CATEGORY_TRANSLATION_KEYS[category];
  return key ? t(key, category) : category;
};

// ─── Shared input/label styles ───────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm';
const labelCls =
  'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1';

// ─── Modal wrapper ───────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full overflow-hidden ${wide ? 'max-w-xl' : 'max-w-md'}`}
      >
        {/* header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {/* footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          {footer}
        </div>
      </div>
    </div>
  );
}

const BtnCancel = ({ onClick }: { onClick: () => void }) => {
  const { t } = useSafeTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {t('SystemAdmin.permissions.common.actions.cancel', 'Cancel')}
    </button>
  );
};

const BtnPrimary = ({
  label,
  loading,
  danger,
}: {
  label: string;
  loading?: boolean;
  danger?: boolean;
}) => {
  const { t } = useSafeTranslation();

  return (
    <button
      type="submit"
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-60 ${
        danger
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-primary hover:opacity-90 text-slate-900'
      }`}
    >
      {loading
        ? t('SystemAdmin.permissions.common.actions.saving', 'Saving...')
        : label}
    </button>
  );
};

// ─── Create Permission Modal ──────────────────────────────────────────────────

function CreatePermissionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useSafeTranslation();
  const [form, setForm] = useState<CreatePermissionPayload>({
    name: '',
    displayName: '',
    description: '',
    category: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await permissionsApi.createPermission({
        ...form,
        description: form.description || undefined,
        category: form.category || undefined,
      });
      onCreated();
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(
        err,
        t(
          'SystemAdmin.permissions.modals.create.errors.createFailed',
          'Failed to create permission.'
        )
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        title={t(
          'SystemAdmin.permissions.modals.create.title',
          'Create Permission'
        )}
        onClose={onClose}
        footer={
          <>
            <BtnCancel onClick={onClose} />
            <BtnPrimary
              label={t(
                'SystemAdmin.permissions.modals.create.actions.create',
                'Create'
              )}
              loading={saving}
            />
          </>
        }
      >
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div>
          <label className={labelCls}>
            {t('SystemAdmin.permissions.modals.create.fields.name', 'Name')} *
          </label>
          <input
            className={inputCls}
            placeholder={t(
              'SystemAdmin.permissions.modals.create.fields.namePlaceholder',
              'e.g. users:read'
            )}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            pattern="^[a-zA-Z0-9_.:-]+$"
            title={t(
              'SystemAdmin.permissions.modals.create.fields.namePatternHint',
              'Letters, digits, underscore, dot, colon, or hyphen only'
            )}
          />
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'SystemAdmin.permissions.modals.create.fields.nameConventionPrefix',
              'Convention:'
            )}{' '}
            <code>resource:action</code>{' '}
            {t(
              'SystemAdmin.permissions.modals.create.fields.nameConventionSuffix',
              '(e.g. screening:approve)'
            )}
          </p>
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.create.fields.displayName',
              'Display Name'
            )}{' '}
            *
          </label>
          <input
            className={inputCls}
            placeholder={t(
              'SystemAdmin.permissions.modals.create.fields.displayNamePlaceholder',
              'e.g. Read Users'
            )}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.create.fields.category',
              'Category'
            )}
          </label>
          <select
            className={inputCls}
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">
              {t(
                'SystemAdmin.permissions.modals.create.fields.none',
                '- None -'
              )}
            </option>
            {KNOWN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryLabel(c, t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.create.fields.description',
              'Description'
            )}
          </label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder={t(
              'SystemAdmin.permissions.modals.create.fields.descriptionPlaceholder',
              'What does this permission allow?'
            )}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </Modal>
    </form>
  );
}

// ─── Edit Permission Modal ────────────────────────────────────────────────────

function EditPermissionModal({
  permission,
  onClose,
  onUpdated,
}: {
  permission: PermissionDto;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useSafeTranslation();
  const [form, setForm] = useState<UpdatePermissionPayload>({
    displayName: permission.displayName,
    description: permission.description ?? '',
    category: permission.category ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await permissionsApi.updatePermission(permission.id, {
        displayName: form.displayName,
        description: form.description || undefined,
        category: form.category || undefined,
      });
      onUpdated();
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(
        err,
        t(
          'SystemAdmin.permissions.modals.edit.errors.updateFailed',
          'Failed to update permission.'
        )
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        title={t(
          'SystemAdmin.permissions.modals.edit.title',
          'Edit Permission'
        )}
        onClose={onClose}
        footer={
          <>
            <BtnCancel onClick={onClose} />
            <BtnPrimary
              label={t(
                'SystemAdmin.permissions.modals.edit.actions.saveChanges',
                'Save Changes'
              )}
              loading={saving}
            />
          </>
        }
      >
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.edit.fields.nameReadonly',
              'Name (read-only)'
            )}
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Key className="w-4 h-4 text-slate-400 shrink-0" />
            <code className="text-sm text-slate-700 dark:text-slate-300">
              {permission.name}
            </code>
          </div>
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.edit.fields.displayName',
              'Display Name'
            )}{' '}
            *
          </label>
          <input
            className={inputCls}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.edit.fields.category',
              'Category'
            )}
          </label>
          <select
            className={inputCls}
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">
              {t('SystemAdmin.permissions.modals.edit.fields.none', '- None -')}
            </option>
            {KNOWN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryLabel(c, t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.edit.fields.description',
              'Description'
            )}
          </label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </Modal>
    </form>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  permission,
  onClose,
  onDeleted,
}: {
  permission: PermissionDto;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useSafeTranslation();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await permissionsApi.deletePermission(permission.id);
      onDeleted();
    } catch (err: unknown) {
      toast.error(
        extractApiErrorMessage(
          err,
          t(
            'SystemAdmin.permissions.modals.delete.errors.deactivateFailed',
            'Failed to deactivate permission.'
          )
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        title={t(
          'SystemAdmin.permissions.modals.delete.title',
          'Deactivate Permission'
        )}
        onClose={onClose}
        footer={
          <>
            <BtnCancel onClick={onClose} />
            <BtnPrimary
              label={t(
                'SystemAdmin.permissions.modals.delete.actions.deactivate',
                'Deactivate'
              )}
              loading={saving}
              danger
            />
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t(
                'SystemAdmin.permissions.modals.delete.messagePrefix',
                'Are you sure you want to deactivate'
              )}{' '}
              <strong className="text-slate-900 dark:text-white">
                {permission.displayName}
              </strong>
              ?
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {t(
                'SystemAdmin.permissions.modals.delete.messageNote',
                'The permission record is kept for audit purposes but will no longer be assignable to roles or users.'
              )}
            </p>
          </div>
        </div>
      </Modal>
    </form>
  );
}

// ─── Assign Permission to Role Modal ─────────────────────────────────────────

function AssignToRoleModal({
  role,
  permissions,
  existingPermIds,
  onClose,
  onAssigned,
}: {
  role: ApplicationRoleDto;
  permissions: PermissionDto[];
  existingPermIds: Set<string>;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const { t } = useSafeTranslation();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const available = permissions.filter(
    (p) => p.isActive && !existingPermIds.has(p.id)
  );
  const filtered = available.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setSaving(true);
    try {
      await permissionsApi.assignPermissionToRole({
        roleId: role.id,
        permissionId: selectedId,
      });
      onAssigned();
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(
        err,
        t(
          'SystemAdmin.permissions.modals.assign.errors.assignFailed',
          'Failed to assign permission.'
        )
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        title={t(
          'SystemAdmin.permissions.modals.assign.title',
          'Assign Permission - {{roleName}}',
          { roleName: role.name }
        )}
        onClose={onClose}
        footer={
          <>
            <BtnCancel onClick={onClose} />
            <BtnPrimary
              label={t(
                'SystemAdmin.permissions.modals.assign.actions.assign',
                'Assign'
              )}
              loading={saving}
            />
          </>
        }
        wide
      >
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className={`${inputCls} pl-9`}
            placeholder={t(
              'SystemAdmin.permissions.modals.assign.searchPlaceholder',
              'Search permissions...'
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              {t(
                'SystemAdmin.permissions.modals.assign.empty',
                'No available permissions'
              )}
            </p>
          ) : (
            filtered.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                  selectedId === p.id
                    ? 'bg-primary/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="permission"
                  value={p.id}
                  checked={selectedId === p.id}
                  onChange={() => setSelectedId(p.id)}
                  className="accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {p.displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{p.name}</p>
                </div>
                {p.category && (
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass(p.category)}`}
                  >
                    {getCategoryLabel(p.category, t)}
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      </Modal>
    </form>
  );
}

// ─── Grant / Revoke User Permission Modal ────────────────────────────────────

function GrantUserPermissionModal({
  userId,
  userEmail,
  permissions,
  initialValues,
  onClose,
  onSaved,
}: {
  userId: string;
  userEmail: string;
  permissions: PermissionDto[];
  initialValues?: { permissionId: string; isGranted: boolean };
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useSafeTranslation();
  const [form, setForm] = useState<GrantPermissionToUserPayload>({
    userId,
    permissionId: initialValues?.permissionId ?? '',
    isGranted: initialValues?.isGranted ?? true,
    expiresAt: '',
  });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = permissions
    .filter((p) => p.isActive)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.displayName.toLowerCase().includes(search.toLowerCase())
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.permissionId) return;
    setError('');
    setSaving(true);
    try {
      await permissionsApi.grantPermissionToUser({
        ...form,
        expiresAt: form.expiresAt || undefined,
      });
      onSaved();
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(
        err,
        t(
          'SystemAdmin.permissions.modals.userOverride.errors.saveFailed',
          'Failed to save override.'
        )
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        title={t(
          'SystemAdmin.permissions.modals.userOverride.title',
          'Add Permission Override'
        )}
        onClose={onClose}
        footer={
          <>
            <BtnCancel onClick={onClose} />
            <BtnPrimary
              label={t(
                'SystemAdmin.permissions.modals.userOverride.actions.saveOverride',
                'Save Override'
              )}
              loading={saving}
            />
          </>
        }
        wide
      >
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            'SystemAdmin.permissions.modals.userOverride.subtitle',
            'Adding override for'
          )}{' '}
          <strong className="text-slate-900 dark:text-white">
            {userEmail}
          </strong>
        </p>

        {/* Grant / Revoke toggle */}
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.userOverride.fields.overrideType',
              'Override Type'
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.isGranted
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="overrideType"
                checked={form.isGranted}
                onChange={() => setForm({ ...form, isGranted: true })}
                className="accent-emerald-500"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {t(
                    'SystemAdmin.permissions.modals.userOverride.types.grant',
                    'Grant'
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.permissions.modals.userOverride.types.grantDescription',
                    'Extra permission'
                  )}
                </p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                !form.isGranted
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="overrideType"
                checked={!form.isGranted}
                onChange={() => setForm({ ...form, isGranted: false })}
                className="accent-red-500"
              />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {t(
                    'SystemAdmin.permissions.modals.userOverride.types.revoke',
                    'Revoke'
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.permissions.modals.userOverride.types.revokeDescription',
                    'Remove from role'
                  )}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Permission picker */}
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.userOverride.fields.permission',
              'Permission'
            )}{' '}
            *
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className={`${inputCls} pl-9`}
              placeholder={t(
                'SystemAdmin.permissions.modals.userOverride.fields.searchPermissionPlaceholder',
                'Search...'
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                  form.permissionId === p.id
                    ? 'bg-primary/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="perm"
                  value={p.id}
                  checked={form.permissionId === p.id}
                  onChange={() => setForm({ ...form, permissionId: p.id })}
                  className="accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {p.displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{p.name}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label className={labelCls}>
            {t(
              'SystemAdmin.permissions.modals.userOverride.fields.expiresAt',
              'Expires At (optional)'
            )}
          </label>
          <input
            type="datetime-local"
            className={inputCls}
            value={form.expiresAt ?? ''}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
      </Modal>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = 'permissions' | 'roles' | 'users';

export default function PermissionsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';

  const formatLocalizedDate = useCallback(
    (dateText: string | undefined | null) => {
      if (!dateText) {
        return t('SystemAdmin.common.notAvailable', 'N/A');
      }

      const parsed = new Date(dateText);
      if (Number.isNaN(parsed.getTime())) {
        return t('SystemAdmin.common.notAvailable', 'N/A');
      }

      return parsed.toLocaleDateString(dateLocale);
    },
    [dateLocale, t]
  );

  // ── Shared state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('permissions');
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]); // full list (< 200) for pickers

  // ── Tab 1: Permissions ────────────────────────────────────────────────────
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [permTotal, setPermTotal] = useState(0);
  const [permPage, setPermPage] = useState(1);
  const [permSearch, setPermSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [permLoading, setPermLoading] = useState(true);

  // modals Tab 1
  const [showCreate, setShowCreate] = useState(false);
  const [editingPerm, setEditingPerm] = useState<PermissionDto | null>(null);
  const [deletingPerm, setDeletingPerm] = useState<PermissionDto | null>(null);

  // ── Tab 2: Role Assignments ───────────────────────────────────────────────
  const [roles, setRoles] = useState<ApplicationRoleDto[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<ApplicationRoleDto | null>(
    null
  );
  const [rolePerms, setRolePerms] = useState<RolePermissionAssignment[]>([]);
  const [rolePermsLoading, setRolePermsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [removingRolePerm, setRemovingRolePerm] = useState<string | null>(null);

  // ── Tab 3: User Overrides ─────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userEffective, setUserEffective] =
    useState<UserEffectivePermissionsDto | null>(null);
  const [userPermsLoading, setUserPermsLoading] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantInitial, setGrantInitial] = useState<
    { permissionId: string; isGranted: boolean } | undefined
  >(undefined);
  const [revokingUserPerm, setRevokingUserPerm] = useState<string | null>(null);
  const [showOverrideHistory, setShowOverrideHistory] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  // ── Load helpers ──────────────────────────────────────────────────────────

  const loadPermissions = useCallback(async () => {
    setPermLoading(true);
    try {
      const result = await permissionsApi.getPermissions({
        searchTerm: permSearch || undefined,
        category: categoryFilter || undefined,
        isActive:
          activeFilter === 'active'
            ? true
            : activeFilter === 'inactive'
              ? false
              : undefined,
        pageNumber: permPage,
        pageSize: 20,
      });
      setPermissions(result?.items ?? []);
      setPermTotal(result?.totalCount ?? 0);
    } catch {
      setPermissions([]);
    } finally {
      setPermLoading(false);
    }
  }, [permSearch, categoryFilter, activeFilter, permPage]);

  const loadAllPermissions = useCallback(async () => {
    try {
      const result = await permissionsApi.getPermissions({ pageSize: 200 });
      setAllPermissions(result?.items ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const result = await permissionsApi.getAllRoles();
      setRoles(result ?? []);
    } catch {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const loadRolePerms = useCallback(async (roleId: string) => {
    setRolePermsLoading(true);
    try {
      const result = await permissionsApi.getRolePermissions(roleId);
      setRolePerms(result ?? []);
    } catch {
      setRolePerms([]);
    } finally {
      setRolePermsLoading(false);
    }
  }, []);

  const loadUserEffective = useCallback(async (userId: string) => {
    setUserPermsLoading(true);
    try {
      const result = await permissionsApi.getUserPermissions(userId);
      setUserEffective(result ?? null);
    } catch {
      setUserEffective(null);
    } finally {
      setUserPermsLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    const result = await userApi.getUsers(1, 50).catch(() => null);
    // API returns `fullName`; normalize to the `name` field expected by AdminUser type
    const all = (result?.items ?? []).map((u) => ({
      ...u,
      name: ((u as unknown as { fullName?: string }).fullName ?? u.name) || '',
    })) as AdminUser[];
    const q = query.toLowerCase();
    setUserResults(
      q
        ? all.filter(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q)
          )
        : all.slice(0, 10)
    );
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    loadAllPermissions();
  }, [loadAllPermissions]);

  useEffect(() => {
    if (activeTab === 'roles' && roles.length === 0) loadRoles();
  }, [activeTab, roles.length, loadRoles]);

  // close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userSearchRef.current &&
        !userSearchRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const activeCount = allPermissions.filter((p) => p.isActive).length;
  const inactiveCount = allPermissions.filter((p) => !p.isActive).length;
  const categories = [
    ...new Set(allPermissions.map((p) => p.category).filter(Boolean)),
  ].length;

  // ── Tab 1 handlers ─────────────────────────────────────────────────────────

  const permColumns: TableColumn<PermissionDto>[] = [
    {
      header: t(
        'SystemAdmin.permissions.table.columns.permission',
        'Permission'
      ),
      accessor: 'name',
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            {row.name}
          </code>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {row.displayName}
          </span>
        </div>
      ),
    },
    {
      header: t('SystemAdmin.permissions.table.columns.category', 'Category'),
      accessor: 'category',
      render: (value) =>
        value ? (
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${categoryClass(value as string)}`}
          >
            <Tag className="w-3 h-3" />
            {getCategoryLabel(value as string, t)}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">
            {t('SystemAdmin.common.notProvided', 'Not provided')}
          </span>
        ),
    },
    {
      header: t(
        'SystemAdmin.permissions.table.columns.description',
        'Description'
      ),
      accessor: 'description',
      render: (value) => (
        <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
          {(value as string) ||
            t('SystemAdmin.common.notProvided', 'Not provided')}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.permissions.table.columns.status', 'Status'),
      accessor: 'isActive',
      render: (value) => (
        <StatusBadge
          status={value ? 'success' : 'warning'}
          label={
            value
              ? t('SystemAdmin.permissions.status.active', 'Active')
              : t('SystemAdmin.permissions.status.inactive', 'Inactive')
          }
        />
      ),
    },
    {
      header: t('SystemAdmin.permissions.table.columns.actions', 'Actions'),
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditingPerm(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
            title={t('SystemAdmin.permissions.table.actions.edit', 'Edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingPerm(row)}
            disabled={!row.isActive}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30"
            title={t(
              'SystemAdmin.permissions.table.actions.deactivate',
              'Deactivate'
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Tab 2 handlers ─────────────────────────────────────────────────────────

  const handleSelectRole = (role: ApplicationRoleDto) => {
    setSelectedRole(role);
    loadRolePerms(role.id);
  };

  const handleRemoveFromRole = async (rolePermId: string) => {
    setRemovingRolePerm(rolePermId);
    try {
      await permissionsApi.removePermissionFromRole(rolePermId);
      if (selectedRole) loadRolePerms(selectedRole.id);
    } finally {
      setRemovingRolePerm(null);
    }
  };

  const existingPermIds = new Set(rolePerms.map((rp) => rp.permissionId));

  // ── Tab 3 handlers ─────────────────────────────────────────────────────────

  const handleUserSearchChange = async (q: string) => {
    setUserSearch(q);
    setShowUserDropdown(true);
    await searchUsers(q);
  };

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setShowUserDropdown(false);
    loadUserEffective(user.id);
  };

  const handleRevokeUserPerm = async (userPermId: string) => {
    setRevokingUserPerm(userPermId);
    try {
      await permissionsApi.revokeUserPermission(userPermId);
      if (selectedUser) loadUserEffective(selectedUser.id);
    } finally {
      setRevokingUserPerm(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    {
      id: 'permissions',
      label: t(
        'SystemAdmin.permissions.tabs.allPermissions',
        'All Permissions'
      ),
      icon: Shield,
    },
    {
      id: 'roles',
      label: t(
        'SystemAdmin.permissions.tabs.roleAssignments',
        'Role Assignments'
      ),
      icon: ShieldCheck,
    },
    {
      id: 'users',
      label: t('SystemAdmin.permissions.tabs.userOverrides', 'User Overrides'),
      icon: UserCheck,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t(
            'SystemAdmin.permissions.page.title',
            'Permission Management'
          )}
          description={t(
            'SystemAdmin.permissions.page.description',
            'Define permissions, assign them to roles, and manage per-user overrides'
          )}
          actions={
            activeTab === 'permissions' ? (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                {t(
                  'SystemAdmin.permissions.page.actions.newPermission',
                  'New Permission'
                )}
              </button>
            ) : undefined
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title={t(
                  'SystemAdmin.permissions.stats.totalPermissions',
                  'Total Permissions'
                )}
                value={allPermissions.length}
                icon={Shield}
                description={t(
                  'SystemAdmin.permissions.stats.totalPermissionsDescription',
                  'All defined permissions'
                )}
                variant="primary"
              />
              <StatsCard
                title={t('SystemAdmin.permissions.stats.active', 'Active')}
                value={activeCount}
                icon={CheckCircle2}
                description={t(
                  'SystemAdmin.permissions.stats.activeDescription',
                  'Currently assignable'
                )}
                variant="success"
              />
              <StatsCard
                title={t('SystemAdmin.permissions.stats.inactive', 'Inactive')}
                value={inactiveCount}
                icon={XCircle}
                description={t(
                  'SystemAdmin.permissions.stats.inactiveDescription',
                  'Deactivated / archived'
                )}
                variant="warning"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.permissions.stats.categories',
                  'Categories'
                )}
                value={categories}
                icon={Layers}
                description={t(
                  'SystemAdmin.permissions.stats.categoriesDescription',
                  'Distinct categories'
                )}
                variant="primary"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB 1 — All Permissions
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'permissions' && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={permSearch}
                      onChange={(e) => {
                        setPermPage(1);
                        setPermSearch(e.target.value);
                      }}
                      placeholder={t(
                        'SystemAdmin.permissions.filters.searchPlaceholder',
                        'Search by name or display name...'
                      )}
                      className={`${inputCls} pl-9`}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setPermPage(1);
                        setCategoryFilter(e.target.value);
                      }}
                      className="appearance-none pl-3 pr-9 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer transition-all"
                    >
                      <option value="">
                        {t(
                          'SystemAdmin.permissions.filters.categories.all',
                          'All Categories'
                        )}
                      </option>
                      {KNOWN_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {getCategoryLabel(c, t)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={activeFilter}
                      onChange={(e) => {
                        setPermPage(1);
                        setActiveFilter(e.target.value);
                      }}
                      className="appearance-none pl-3 pr-9 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer transition-all"
                    >
                      <option value="">
                        {t(
                          'SystemAdmin.permissions.filters.status.all',
                          'All Status'
                        )}
                      </option>
                      <option value="active">
                        {t('SystemAdmin.permissions.status.active', 'Active')}
                      </option>
                      <option value="inactive">
                        {t(
                          'SystemAdmin.permissions.status.inactive',
                          'Inactive'
                        )}
                      </option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <DataTable<PermissionDto>
                    columns={permColumns}
                    data={permissions}
                    keyExtractor={(row) => row.id}
                    isLoading={permLoading}
                    emptyMessage={t(
                      'SystemAdmin.permissions.states.empty',
                      'No permissions found'
                    )}
                  />
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    {t(
                      'SystemAdmin.permissions.pagination.showing',
                      'Showing {{shown}} of {{total}} permissions',
                      {
                        shown: permissions.length,
                        total: permTotal,
                      }
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={permPage === 1}
                      onClick={() => setPermPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t(
                        'SystemAdmin.permissions.pagination.previous',
                        'Previous'
                      )}
                    </button>
                    <span className="px-2 font-medium">
                      {t(
                        'SystemAdmin.permissions.pagination.page',
                        'Page {{page}}',
                        {
                          page: permPage,
                        }
                      )}
                    </span>
                    <button
                      disabled={permissions.length < 20}
                      onClick={() => setPermPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('SystemAdmin.permissions.pagination.next', 'Next')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 2 — Role Assignments
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: role picker */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.permissions.roles.selectRole',
                      'Select Role'
                    )}
                  </h3>
                  {rolesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleSelectRole(role)}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                          selectedRole?.id === role.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              selectedRole?.id === role.id
                                ? 'bg-primary text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {role.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {role.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {t(
                                'SystemAdmin.permissions.roles.roleCardHint',
                                'Click to view permissions'
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Right: role permissions panel */}
                <div className="lg:col-span-2">
                  {!selectedRole ? (
                    <div className="h-full min-h-64 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {t(
                            'SystemAdmin.permissions.roles.emptySelectRole',
                            'Select a role to manage its permissions'
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      {/* Panel header */}
                      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedRole.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {rolePermsLoading
                              ? t(
                                  'SystemAdmin.permissions.common.loading',
                                  'Loading...'
                                )
                              : t(
                                  'SystemAdmin.permissions.roles.assignedCount',
                                  '{{count}} permission(s) assigned',
                                  {
                                    count: rolePerms.length,
                                  }
                                )}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          {t(
                            'SystemAdmin.permissions.roles.actions.assign',
                            'Assign'
                          )}
                        </button>
                      </div>

                      {/* Permission list */}
                      {rolePermsLoading ? (
                        <div className="space-y-px">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-14 bg-slate-100 dark:bg-slate-800 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : rolePerms.length === 0 ? (
                        <div className="py-12 text-center">
                          <Shield className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">
                            {t(
                              'SystemAdmin.permissions.roles.empty',
                              'No permissions assigned to this role yet'
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {rolePerms.map((rp) => (
                            <div
                              key={rp.rolePermissionId}
                              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <Key className="w-4 h-4 text-slate-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {rp.permissionDisplayName}
                                </p>
                                <code className="text-xs text-slate-500">
                                  {rp.permissionName}
                                </code>
                              </div>
                              {rp.category && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryClass(rp.category)}`}
                                >
                                  {getCategoryLabel(rp.category, t)}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleRemoveFromRole(rp.rolePermissionId)
                                }
                                disabled={
                                  removingRolePerm === rp.rolePermissionId
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                                title={t(
                                  'SystemAdmin.permissions.roles.actions.removeFromRole',
                                  'Remove from role'
                                )}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 3 — User Overrides
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* User search */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t(
                      'SystemAdmin.permissions.users.searchTitle',
                      'Search User'
                    )}
                  </h3>
                  <div className="relative max-w-md" ref={userSearchRef}>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className={`${inputCls} pl-9`}
                      placeholder={t(
                        'SystemAdmin.permissions.users.searchPlaceholder',
                        'Type name or email...'
                      )}
                      value={userSearch}
                      onChange={(e) => handleUserSearchChange(e.target.value)}
                      onFocus={() => {
                        setShowUserDropdown(true);
                        searchUsers(userSearch);
                      }}
                    />
                    {showUserDropdown && userResults.length > 0 && (
                      <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                        {userResults.slice(0, 8).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {u.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {u.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Effective permissions panel */}
                {selectedUser && (
                  <div className="space-y-5">
                    {/* Header bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {selectedUser.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setGrantInitial(undefined);
                          setShowGrantModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        {t(
                          'SystemAdmin.permissions.users.actions.addOverride',
                          'Add Override'
                        )}
                      </button>
                    </div>

                    {userPermsLoading ? (
                      <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    ) : userEffective ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Roles */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            {t(
                              'SystemAdmin.permissions.users.rolesTitle',
                              'Roles'
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {userEffective.roles.map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                <Shield className="w-3 h-3" />
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Effective permissions */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            {t(
                              'SystemAdmin.permissions.users.effectivePermissionsTitle',
                              'Effective Permissions ({{count}})',
                              {
                                count:
                                  userEffective.effectivePermissionNames.length,
                              }
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                            {userEffective.effectivePermissionNames.map((n) => (
                              <span
                                key={n}
                                className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Role-inherited permissions */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {t(
                                'SystemAdmin.permissions.users.inheritedFromRolesTitle',
                                'Inherited from Roles ({{count}})',
                                {
                                  count: userEffective.rolePermissions.length,
                                }
                              )}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {t(
                                'SystemAdmin.permissions.users.inheritedFromRolesDescription',
                                'Add a deny override to block a role permission'
                              )}
                            </p>
                          </div>
                          {userEffective.rolePermissions.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                              {t(
                                'SystemAdmin.permissions.users.states.noRolePermissions',
                                'No role permissions'
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                              {userEffective.rolePermissions.map((rp) => {
                                const denied = userEffective.userOverrides.some(
                                  (ov) =>
                                    ov.permissionId === rp.id &&
                                    !ov.isGranted &&
                                    ov.isActive
                                );
                                return (
                                  <div
                                    key={rp.id}
                                    className="flex items-center gap-3 px-5 py-3"
                                  >
                                    <Key className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {rp.displayName}
                                      </p>
                                      <code className="text-xs text-slate-500">
                                        {rp.name}
                                      </code>
                                    </div>
                                    {denied ? (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                                        {t(
                                          'SystemAdmin.permissions.users.status.denied',
                                          'Denied'
                                        )}
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setGrantInitial({
                                            permissionId: rp.id,
                                            isGranted: false,
                                          });
                                          setShowGrantModal(true);
                                        }}
                                        className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                                        title={t(
                                          'SystemAdmin.permissions.users.actions.addDenyOverride',
                                          'Add deny override'
                                        )}
                                      >
                                        <ShieldOff className="w-3 h-3" />
                                        {t(
                                          'SystemAdmin.permissions.users.actions.deny',
                                          'Deny'
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* User overrides — active only */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {t(
                                'SystemAdmin.permissions.users.activeOverridesTitle',
                                'Active Overrides ({{count}})',
                                {
                                  count: userEffective.userOverrides.filter(
                                    (ov) => ov.isActive
                                  ).length,
                                }
                              )}
                            </h4>
                          </div>
                          {userEffective.userOverrides.filter(
                            (ov) => ov.isActive
                          ).length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                              {t(
                                'SystemAdmin.permissions.users.states.noActiveOverrides',
                                'No active overrides'
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                              {userEffective.userOverrides
                                .filter((ov) => ov.isActive)
                                .map((ov) => (
                                  <div
                                    key={ov.userPermissionId}
                                    className="flex items-center gap-3 px-5 py-3"
                                  >
                                    <div
                                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                        ov.isGranted
                                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                          : 'bg-red-100 dark:bg-red-900/30'
                                      }`}
                                    >
                                      {ov.isGranted ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {ov.permissionDisplayName}
                                      </p>
                                      <code className="text-xs text-slate-500">
                                        {ov.permissionName}
                                      </code>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                                        ov.isGranted
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                      }`}
                                    >
                                      {ov.isGranted
                                        ? t(
                                            'SystemAdmin.permissions.users.status.granted',
                                            'Granted'
                                          )
                                        : t(
                                            'SystemAdmin.permissions.users.status.denied',
                                            'Denied'
                                          )}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleRevokeUserPerm(
                                          ov.userPermissionId
                                        )
                                      }
                                      disabled={
                                        revokingUserPerm === ov.userPermissionId
                                      }
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40 shrink-0"
                                      title={t(
                                        'SystemAdmin.permissions.users.actions.removeOverride',
                                        'Remove override'
                                      )}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Override history — inactive/revoked — full width, collapsible */}
                        {(() => {
                          const history = userEffective.userOverrides.filter(
                            (ov) => !ov.isActive
                          );
                          if (history.length === 0) return null;
                          return (
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowOverrideHistory((v) => !v)
                                }
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-700"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {t(
                                      'SystemAdmin.permissions.users.overrideHistoryTitle',
                                      'Override History ({{count}} revoked / expired)',
                                      {
                                        count: history.length,
                                      }
                                    )}
                                  </h4>
                                </div>
                                {showOverrideHistory ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                              {showOverrideHistory && (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                                  {history.map((ov) => (
                                    <div
                                      key={ov.userPermissionId}
                                      className="flex items-center gap-3 px-5 py-3 opacity-60"
                                    >
                                      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                          {ov.permissionDisplayName}
                                        </p>
                                        <code className="text-xs text-slate-400">
                                          {ov.permissionName}
                                        </code>
                                      </div>
                                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                            ov.isGranted
                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                          }`}
                                        >
                                          {ov.isGranted
                                            ? t(
                                                'SystemAdmin.permissions.users.status.granted',
                                                'Granted'
                                              )
                                            : t(
                                                'SystemAdmin.permissions.users.status.denied',
                                                'Denied'
                                              )}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {ov.isExpired
                                            ? t(
                                                'SystemAdmin.permissions.users.status.expired',
                                                'Expired'
                                              )
                                            : t(
                                                'SystemAdmin.permissions.users.status.revoked',
                                                'Revoked'
                                              )}
                                          {ov.expiresAt && ov.isExpired
                                            ? ` · ${formatLocalizedDate(ov.expiresAt)}`
                                            : ''}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 py-12 text-center text-sm text-slate-500">
                        {t(
                          'SystemAdmin.permissions.users.states.loadFailed',
                          'Failed to load user permissions'
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ══ Modals ══ */}
      {showCreate && (
        <CreatePermissionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadPermissions();
            loadAllPermissions();
          }}
        />
      )}
      {editingPerm && (
        <EditPermissionModal
          permission={editingPerm}
          onClose={() => setEditingPerm(null)}
          onUpdated={() => {
            setEditingPerm(null);
            loadPermissions();
            loadAllPermissions();
          }}
        />
      )}
      {deletingPerm && (
        <ConfirmDeleteModal
          permission={deletingPerm}
          onClose={() => setDeletingPerm(null)}
          onDeleted={() => {
            setDeletingPerm(null);
            loadPermissions();
            loadAllPermissions();
          }}
        />
      )}
      {showAssignModal && selectedRole && (
        <AssignToRoleModal
          role={selectedRole}
          permissions={allPermissions}
          existingPermIds={existingPermIds}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            loadRolePerms(selectedRole.id);
          }}
        />
      )}
      {showGrantModal && selectedUser && (
        <GrantUserPermissionModal
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          permissions={allPermissions}
          initialValues={grantInitial}
          onClose={() => {
            setShowGrantModal(false);
            setGrantInitial(undefined);
          }}
          onSaved={() => {
            setShowGrantModal(false);
            setGrantInitial(undefined);
            loadUserEffective(selectedUser.id);
          }}
        />
      )}
    </div>
  );
}
