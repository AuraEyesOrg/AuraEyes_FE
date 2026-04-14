import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Pencil, Search, Trash2, X } from 'lucide-react';
import {
  DISEASE_URGENCY_LEVELS,
  V2_DISEASE_URGENCY,
} from '@/features/patient/mock/disease-mapping';
import { toDisplayDiseaseName } from '@/features/patient/lib/disease-translation';
import type {
  DetectionBox,
  DiseaseOption,
  DiseaseUrgency,
} from '@/features/organisation/types/screening-result.types';

interface BoxLabelSelectorProps {
  box: DetectionBox;
  language: string;
  onUpdate: (patch: {
    name: string;
    localizedName: string;
    confidence: number;
    type: DetectionBox['type'];
  }) => void;
  onDelete: () => void;
  onClose: () => void;
}

function urgencyToBoxType(
  urgency: DiseaseUrgency,
  confidence: number
): DetectionBox['type'] {
  if (urgency === 'critical' || urgency === 'warning') return 'warning';
  if (urgency === 'caution' || confidence >= 45) return 'priority_high';
  return 'info';
}

function buildDiseaseOptions(language: string): DiseaseOption[] {
  const seen = new Set<string>();
  const options: DiseaseOption[] = [];

  for (const [name, urgency] of Object.entries(DISEASE_URGENCY_LEVELS)) {
    if (seen.has(name)) continue;
    seen.add(name);
    options.push({
      code: name,
      name,
      localizedName: toDisplayDiseaseName(name, language),
      urgency,
    });
  }

  for (const [code, urgency] of Object.entries(V2_DISEASE_URGENCY)) {
    if (seen.has(code)) continue;
    seen.add(code);
    options.push({
      code,
      name: code,
      localizedName: toDisplayDiseaseName(code, language),
      urgency,
    });
  }

  return options.sort((a, b) => a.localizedName.localeCompare(b.localizedName));
}

const URGENCY_BADGES: Record<DiseaseUrgency, { label: string; cls: string }> = {
  critical: {
    label: 'Critical',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  warning: {
    label: 'Warning',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  caution: {
    label: 'Caution',
    cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  info: {
    label: 'Info',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  normal: {
    label: 'Normal',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

export function BoxLabelSelector({
  box,
  language,
  onUpdate,
  onDelete,
  onClose,
}: BoxLabelSelectorProps) {
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState(box.name);
  const [confidence, setConfidence] = useState(box.confidence);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => buildDiseaseOptions(language), [language]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allOptions;
    const q = search.toLowerCase();
    return allOptions.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.localizedName.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q)
    );
  }, [allOptions, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Focus search on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelectDisease = useCallback(
    (option: DiseaseOption) => {
      onUpdate({
        name: option.code,
        localizedName: option.localizedName,
        confidence,
        type: urgencyToBoxType(option.urgency, confidence),
      });
      onClose();
    },
    [confidence, onUpdate, onClose]
  );

  const handleCustomSubmit = useCallback(() => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onUpdate({
      name: trimmed,
      localizedName: toDisplayDiseaseName(trimmed, language),
      confidence,
      type:
        confidence >= 70
          ? 'warning'
          : confidence >= 45
            ? 'priority_high'
            : 'info',
    });
    onClose();
  }, [customName, confidence, language, onUpdate, onClose]);

  return (
    <div
      ref={panelRef}
      className="w-80 rounded-xl border border-(--border-primary) bg-(--bg-secondary) shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-(--border-primary) bg-(--bg-tertiary)">
        <span className="text-xs font-semibold text-(--text-primary)">
          {box.source === 'manual' ? 'Label Annotation' : 'Edit AI Box'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete box"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-(--text-tertiary) hover:bg-(--bg-primary) transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confidence slider */}
      <div className="px-3 py-2 border-b border-(--border-primary)">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-(--text-tertiary)">
            Confidence
          </span>
          <span className="text-[11px] font-semibold text-(--text-primary)">
            {Math.round(confidence)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-(--border-primary) accent-primary cursor-pointer"
        />
      </div>

      {/* Toggle: disease list vs custom */}
      <div className="flex gap-1 px-3 pt-2">
        <button
          type="button"
          onClick={() => setIsCustomMode(false)}
          className={`flex-1 text-[11px] font-medium py-1.5 rounded-lg transition ${
            !isCustomMode
              ? 'bg-primary/10 text-primary'
              : 'text-(--text-tertiary) hover:bg-(--bg-primary)'
          }`}
        >
          Disease List
        </button>
        <button
          type="button"
          onClick={() => setIsCustomMode(true)}
          className={`flex-1 text-[11px] font-medium py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
            isCustomMode
              ? 'bg-primary/10 text-primary'
              : 'text-(--text-tertiary) hover:bg-(--bg-primary)'
          }`}
        >
          <Pencil className="w-3 h-3" />
          Custom
        </button>
      </div>

      {!isCustomMode ? (
        <>
          {/* Search */}
          <div className="px-3 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--text-tertiary)" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diseases..."
                className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) py-1.5 pl-8 pr-3 text-xs text-(--text-primary) placeholder:text-(--text-tertiary)"
              />
            </div>
          </div>

          {/* Disease options list */}
          <div className="max-h-52 overflow-y-auto px-1.5 py-1.5">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-(--text-tertiary) py-4">
                No matching diseases
              </p>
            ) : (
              filtered.map((option) => {
                const badge = URGENCY_BADGES[option.urgency];
                const isActive = box.name === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => handleSelectDisease(option)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-(--text-primary) hover:bg-(--bg-primary)'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {option.localizedName}
                      </p>
                      {option.code !== option.localizedName && (
                        <p className="text-[10px] text-(--text-tertiary) truncate">
                          {option.code}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Custom name input */
        <div className="px-3 py-3 space-y-2.5">
          <div>
            <label className="text-[11px] font-medium text-(--text-tertiary) mb-1 block">
              Custom Label
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom finding name..."
              className="w-full rounded-lg border border-(--border-primary) bg-(--bg-primary) py-1.5 px-3 text-xs text-(--text-primary)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomSubmit();
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customName.trim()}
            className="w-full py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 transition"
          >
            Apply Label
          </button>
        </div>
      )}
    </div>
  );
}
