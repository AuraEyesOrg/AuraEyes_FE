/**
 * Contract Templates Page
 * Gallery of contract templates for system admin management
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  FileText,
  Edit2,
  Eye,
  Trash2,
  Copy,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  Clock,
  Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { contractTemplatesApi } from '../api/contract-templates.api';
import type { ContractTemplateDto } from '../types/system-admin.types';
import { extractApiErrorMessage } from '@/lib/api-error';

/* ─── Status badge ─────────────────────────────────────── */
function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="w-3 h-3" />
      Inactive
    </span>
  );
}

/* ─── Template card ─────────────────────────────────────── */
function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  isDuplicating,
  isUpdatingStatus,
}: {
  template: ContractTemplateDto;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (tpl: ContractTemplateDto) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  isDuplicating: boolean;
  isUpdatingStatus: boolean;
}) {
  const isOphthalmologist = template.type === 'OphthalmologistContract';
  const TypeIcon = isOphthalmologist ? Stethoscope : Building2;
  const typeLabel = isOphthalmologist ? 'Ophthalmologist' : 'Organization';
  const typeClr = isOphthalmologist
    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Colorful header strip */}
      <div
        className={`h-1.5 w-full ${
          isOphthalmologist
            ? 'bg-gradient-to-r from-violet-500 to-purple-400'
            : 'bg-gradient-to-r from-cyan-500 to-blue-400'
        }`}
      />

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Top row: icon + title + status */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isOphthalmologist
                ? 'bg-violet-100 dark:bg-violet-900/30'
                : 'bg-cyan-100 dark:bg-cyan-900/30'
            }`}
          >
            <TypeIcon
              className={`w-5 h-5 ${
                isOphthalmologist
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-cyan-600 dark:text-cyan-400'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {template.title}
            </h3>
            <span
              className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeClr}`}
            >
              <TypeIcon className="w-3 h-3" />
              {typeLabel}
            </span>
          </div>

          <StatusBadge isActive={template.isActive} />
        </div>

        {/* Version */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Version:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {template.contractVersion}
          </span>
          {template.effectiveDate && (
            <>
              {' '}
              &nbsp;·&nbsp; Effective:{' '}
              {new Date(template.effectiveDate).toLocaleDateString('vi-VN')}
            </>
          )}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            DOCX template
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {template.usageCount} contracts
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(
              template.updatedAt ?? template.createdAt
            ).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => onToggleStatus(template.id, !template.isActive)}
            disabled={isUpdatingStatus}
            className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            {isUpdatingStatus
              ? 'Updating...'
              : template.isActive
                ? 'Deactivate'
                : 'Activate'}
          </button>
          <button
            onClick={() => onEdit(template.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Template
          </button>
          <button
            onClick={() => onEdit(template.id)}
            title="Preview"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(template.id)}
            title="Duplicate"
            disabled={isDuplicating}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors disabled:opacity-50"
          >
            {isDuplicating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(template)}
            title="Delete"
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete confirmation dialog ───────────────────────── */
function DeleteDialog({
  name,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  name: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Delete Template?
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-70"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function ContractTemplatesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [deleteTarget, setDeleteTarget] = useState<ContractTemplateDto | null>(
    null
  );
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  /* ── Fetch templates ── */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contract-templates', search, statusFilter],
    queryFn: () =>
      contractTemplatesApi.getContractTemplates({
        searchTerm: search || undefined,
        isActive:
          statusFilter === 'all' ? undefined : statusFilter === 'active',
        pageSize: 100,
      }),
    staleTime: 1000 * 30,
  });

  const templates = data?.items ?? [];
  const loadErrorMessage = isError
    ? extractApiErrorMessage(error, 'Failed to load templates.')
    : null;

  /* ── Delete mutation ── */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractTemplatesApi.deleteContractTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      setDeleteTarget(null);
    },
  });

  /* ── Duplicate: single API call ── */
  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      await contractTemplatesApi.duplicateContractTemplate(id);
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleEdit = (id: string) =>
    navigate(`/system-admin/contract-templates/${id}/edit`);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setUpdatingStatusId(id);
    try {
      await contractTemplatesApi.setContractTemplateStatus(id, isActive);
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-template', id] });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = (tpl: ContractTemplateDto) => setDeleteTarget(tpl);

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const activeCount = templates.filter((t) => t.isActive).length;
  const inactiveCount = templates.filter((t) => !t.isActive).length;
  const totalContracts = templates.reduce((s, t) => s + t.usageCount, 0);

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Contract Templates"
          description="Manage DOCX contract templates and activation status by version"
          actions={
            <button
              onClick={() => navigate('/system-admin/contract-templates/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Templates',
                value: templates.length,
                color: 'text-slate-700 dark:text-slate-200',
              },
              {
                label: 'Active',
                value: activeCount,
                color: 'text-emerald-600',
              },
              {
                label: 'Inactive',
                value: inactiveCount,
                color: 'text-amber-600',
              },
              {
                label: 'Contracts Issued',
                value: totalContracts,
                color: 'text-violet-600',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Search / filter bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <span className="text-sm text-slate-400">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-60" />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Failed to load templates: {loadErrorMessage ?? 'Unknown error'}
            </div>
          )}

          {/* Template grid */}
          {!isLoading && !isError && (
            <>
              {templates.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No templates found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Create new card */}
                  <button
                    onClick={() =>
                      navigate('/system-admin/contract-templates/new')
                    }
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 p-10 text-slate-400 hover:text-primary min-h-[240px]"
                  >
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/10 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">
                      Create New Template
                    </span>
                  </button>

                  {templates.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      isDuplicating={duplicatingId === tpl.id}
                      isUpdatingStatus={updatingStatusId === tpl.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.title}
          isDeleting={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
