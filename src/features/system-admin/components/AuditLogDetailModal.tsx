/**
 * Audit Log Detail Modal — JSON Diff Viewer
 * Shows Before/After comparison of oldValue vs newValue
 */

import { X } from 'lucide-react';
import type { AuditLogDto } from '../types/system-admin.types';

interface AuditLogDetailModalProps {
  log: AuditLogDto;
  onClose: () => void;
}

function safeParse(jsonStr: string | null): object | null {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Highlight changed keys between old and new objects */
function getChangedKeys(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown> | null
): Set<string> {
  const changed = new Set<string>();
  if (!oldObj || !newObj) return changed;
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changed.add(key);
    }
  }
  return changed;
}

function JsonPanel({
  title,
  data,
  changedKeys,
  variant,
}: {
  title: string;
  data: object | null;
  changedKeys: Set<string>;
  variant: 'old' | 'new';
}) {
  if (!data) {
    return (
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
          {title}
        </h4>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-400 italic">No data</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data as Record<string, unknown>);

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h4>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-auto max-h-[400px]">
        <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
          {'{'}
          {entries.map(([key, value], i) => {
            const isChanged = changedKeys.has(key);
            const highlightClass = isChanged
              ? variant === 'old'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'text-slate-700 dark:text-slate-300';
            return (
              <span key={key} className={highlightClass}>
                {'\n  '}
                <span className="text-purple-600 dark:text-purple-400">
                  &quot;{key}&quot;
                </span>
                : {JSON.stringify(value, null, 2)}
                {i < entries.length - 1 ? ',' : ''}
              </span>
            );
          })}
          {'\n}'}
        </pre>
      </div>
    </div>
  );
}

export default function AuditLogDetailModal({
  log,
  onClose,
}: AuditLogDetailModalProps) {
  const oldData = safeParse(log.oldValue);
  const newData = safeParse(log.newValue);
  const changedKeys = getChangedKeys(
    oldData as Record<string, unknown> | null,
    newData as Record<string, unknown> | null
  );

  const actionColor =
    log.action === 'Insert'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : log.action === 'Delete'
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Audit Log Detail
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {log.entityName} &middot; {formatTimestamp(log.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-500">Action:</span>{' '}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${actionColor}`}
            >
              {log.action}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Entity:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {log.entityName}
            </span>
          </div>
          {log.entityId && (
            <div>
              <span className="text-slate-500">Entity ID:</span>{' '}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {log.entityId}
              </span>
            </div>
          )}
          <div>
            <span className="text-slate-500">User:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {log.userName ?? log.userId ?? 'System'}
            </span>
          </div>
          {log.ipAddress && (
            <div>
              <span className="text-slate-500">IP:</span>{' '}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {log.ipAddress}
              </span>
            </div>
          )}
        </div>

        {/* Diff Panels */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {log.action === 'Insert' && !oldData ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Created Data
              </h4>
              <pre className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm font-mono text-green-800 dark:text-green-300 whitespace-pre-wrap break-all max-h-[400px] overflow-auto">
                {JSON.stringify(newData ?? log.newValue, null, 2)}
              </pre>
            </div>
          ) : log.action === 'Delete' && !newData ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Deleted Data
              </h4>
              <pre className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap break-all max-h-[400px] overflow-auto">
                {JSON.stringify(oldData ?? log.oldValue, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex gap-4">
              <JsonPanel
                title="Before (Old Value)"
                data={oldData}
                changedKeys={changedKeys}
                variant="old"
              />
              <JsonPanel
                title="After (New Value)"
                data={newData}
                changedKeys={changedKeys}
                variant="new"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
