/**
 * Contract Templates Page
 * Gallery of contract templates for system admin management
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Edit2,
  Eye,
  Trash2,
  Copy,
  Search,
  Calendar,
  Hash,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  Clock,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

/* ─── Types ──────────────────────────────────────────────── */
interface ContractTemplate {
  id: string;
  name: string;
  type: 'ophthalmologist' | 'organization';
  description: string;
  variableCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  lastModified: string;
  usageCount: number;
}

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Hợp đồng hợp tác chuyên môn y khoa',
    type: 'ophthalmologist',
    description:
      'Hợp đồng dành cho bác sĩ nhãn khoa ký kết với Aura Eyes Vietnam, bao gồm điều khoản tài chính, bảo mật và hiệu lực.',
    variableCount: 12,
    status: 'active',
    createdAt: '2025-11-01',
    lastModified: '2026-02-15',
    usageCount: 47,
  },
  {
    id: 'tpl-002',
    name: 'Hợp đồng liên kết cung cấp dịch vụ y tế',
    type: 'organization',
    description:
      'Hợp đồng dành cho tổ chức y tế (phòng khám, bệnh viện) liên kết cung cấp thiết bị và dịch vụ tầm soát đáy mắt.',
    variableCount: 15,
    status: 'active',
    createdAt: '2025-11-01',
    lastModified: '2026-02-20',
    usageCount: 23,
  },
  {
    id: 'tpl-003',
    name: 'Hợp đồng thử nghiệm – Bác sĩ (v2)',
    type: 'ophthalmologist',
    description:
      'Phiên bản thử nghiệm với điều khoản chia sẻ doanh thu linh hoạt theo hiệu suất.',
    variableCount: 14,
    status: 'draft',
    createdAt: '2026-01-10',
    lastModified: '2026-03-08',
    usageCount: 0,
  },
];

/* ─── Status badge ─────────────────────────────────────── */
function StatusBadge({ status }: { status: ContractTemplate['status'] }) {
  const map = {
    active: {
      label: 'Active',
      icon: CheckCircle2,
      cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    draft: {
      label: 'Draft',
      icon: Clock,
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    archived: {
      label: 'Archived',
      icon: AlertCircle,
      cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    },
  };
  const { label, icon: Icon, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ─── Template card ─────────────────────────────────────── */
function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: ContractTemplate;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const TypeIcon =
    template.type === 'ophthalmologist' ? Stethoscope : Building2;
  const typeLabel =
    template.type === 'ophthalmologist' ? 'Ophthalmologist' : 'Organization';
  const typeClr =
    template.type === 'ophthalmologist'
      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Colorful header strip */}
      <div
        className={`h-1.5 w-full ${
          template.type === 'ophthalmologist'
            ? 'bg-gradient-to-r from-violet-500 to-purple-400'
            : 'bg-gradient-to-r from-cyan-500 to-blue-400'
        }`}
      />

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Top row: icon + title + status */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              template.type === 'ophthalmologist'
                ? 'bg-violet-100 dark:bg-violet-900/30'
                : 'bg-cyan-100 dark:bg-cyan-900/30'
            }`}
          >
            <TypeIcon
              className={`w-5 h-5 ${
                template.type === 'ophthalmologist'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-cyan-600 dark:text-cyan-400'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {template.name}
            </h3>
            <span
              className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeClr}`}
            >
              <TypeIcon className="w-3 h-3" />
              {typeLabel}
            </span>
          </div>

          <StatusBadge status={template.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {template.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            {template.variableCount} variables
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {template.usageCount} contracts
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(template.lastModified).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
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
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
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
  onConfirm,
  onCancel,
}: {
  name: string;
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
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
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
  const [templates, setTemplates] =
    useState<ContractTemplate[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ContractTemplate | null>(
    null
  );

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) =>
    navigate(`/system-admin/contract-templates/${id}/edit`);

  const handleDuplicate = (id: string) => {
    const source = templates.find((t) => t.id === id);
    if (!source) return;
    const copy: ContractTemplate = {
      ...source,
      id: `tpl-${Date.now()}`,
      name: `${source.name} (copy)`,
      status: 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTemplates((prev) => [...prev, copy]);
  };

  const handleDelete = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setDeleteTarget(tpl);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.status === 'active').length,
    draft: templates.filter((t) => t.status === 'draft').length,
    totalContracts: templates.reduce((s, t) => s + t.usageCount, 0),
  };

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Contract Templates"
          description="Manage reusable contract templates with dynamic variable placeholders"
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
                value: stats.total,
                color: 'text-slate-700 dark:text-slate-200',
              },
              {
                label: 'Active',
                value: stats.active,
                color: 'text-emerald-600',
              },
              { label: 'Drafts', value: stats.draft, color: 'text-amber-600' },
              {
                label: 'Contracts Issued',
                value: stats.totalContracts,
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
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
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
            <span className="text-sm text-slate-400">
              {filtered.length} template{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Template grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Create new card */}
              <button
                onClick={() => navigate('/system-admin/contract-templates/new')}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 p-10 text-slate-400 hover:text-primary min-h-[240px]"
              >
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold">
                  Create New Template
                </span>
              </button>

              {filtered.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
