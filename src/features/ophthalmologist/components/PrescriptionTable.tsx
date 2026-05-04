import {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { PlusSquare, X, AlertCircle } from 'lucide-react';
import { DrugEntry, RxItem } from '../types/drug.type';

export interface PrescriptionTableProps {
  items: RxItem[];
  onChange: (items: RxItem[]) => void;
  noMedicationPrescribed: boolean;
  onNoMedicationChange: (val: boolean) => void;
  prescriptionNote: string;
  onNoteChange: (val: string) => void;
  locked?: boolean;
  validationErrors?: Record<string, (keyof Omit<RxItem, 'id'>)[]>;
  t: (key: string, fallback?: string) => string;
}

// ─── Drug catalogue ───────────────────────────────────────────────────────────

const DRUG_CATALOGUE: DrugEntry[] = [
  // Nhóm tiêm nội nhãn (Anti-VEGF & Steroid) - Đặc trị võng mạc
  {
    label: 'Ranibizumab (Lucentis) 10mg/ml',
    defaultDosage: '0.05ml',
    defaultUnit: 'ống',
    defaultFrequency: '1 lần/tháng',
    defaultInstruction: 'Tiêm nội nhãn (theo lịch trình)',
  },
  {
    label: 'Aflibercept (Eylea) 40mg/ml',
    defaultDosage: '0.05ml',
    defaultUnit: 'ống',
    defaultFrequency: '1 lần/tháng',
    defaultInstruction: 'Tiêm nội nhãn (theo lịch trình)',
  },
  {
    label: 'Bevacizumab (Avastin) 25mg/ml',
    defaultDosage: '0.05ml',
    defaultUnit: 'ống',
    defaultFrequency: '1 lần/tháng',
    defaultInstruction: 'Tiêm nội nhãn (theo lịch trình)',
  },
  {
    label: 'Dexamethasone implant (Ozurdex) 0.7mg',
    defaultDosage: '1 mảnh ghép',
    defaultUnit: 'implant',
    defaultFrequency: '1 lần/6 tháng',
    defaultInstruction: 'Cấy nội nhãn điều trị phù hoàng điểm',
  },

  // Nhóm nhỏ mắt phục vụ khám, chụp chiếu võng mạc
  {
    label: 'Tropicamide 1%',
    defaultDosage: '1-2 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '1 lần',
    defaultInstruction: 'Nhỏ giãn đồng tử trước khi chụp võng mạc',
  },
  {
    label: 'Proparacaine 0.5% (Alcaine)',
    defaultDosage: '1-2 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '1 lần',
    defaultInstruction: 'Nhỏ gây tê bề mặt trước khi tiêm/khám',
  },

  // Nhóm thực phẩm chức năng bổ trợ võng mạc (Macular degeneration)
  {
    label: 'Lutein & Zeaxanthin 20mg/4mg',
    defaultDosage: '1 viên',
    defaultUnit: 'viên',
    defaultFrequency: '1 lần/ngày',
    defaultInstruction: 'Uống sau ăn sáng',
  },
  {
    label: 'AREDS 2 Formula (Ocuvite/PreserVision)',
    defaultDosage: '1 viên',
    defaultUnit: 'viên',
    defaultFrequency: '2 lần/ngày',
    defaultInstruction: 'Uống sáng - tối sau ăn',
  },

  // Nhóm kháng sinh & Kháng viêm (Dùng sau tiêm nội nhãn hoặc phẫu thuật)
  {
    label: 'Moxifloxacin 0.5% (Vigamox)',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '4 lần/ngày',
    defaultInstruction: 'Nhỏ mắt (phòng ngừa nhiễm trùng sau tiêm)',
  },
  {
    label: 'Tobramycin + Dexamethasone (Tobradex)',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '4 lần/ngày',
    defaultInstruction: 'Nhỏ mắt giảm viêm',
  },
  {
    label: 'Prednisolone acetate 1% (Pred Forte)',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '4 lần/ngày',
    defaultInstruction: 'Nhỏ mắt theo chỉ định của bác sĩ',
  },
  {
    label: 'Nepafenac 0.1% (Nevanac)',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '3 lần/ngày',
    defaultInstruction: 'Nhỏ mắt ngừa phù hoàng điểm dạng nang',
  },

  // Nhóm hạ nhãn áp (Thường gặp ở bệnh nhân có biến chứng võng mạc)
  {
    label: 'Timolol 0.5%',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '2 lần/ngày',
    defaultInstruction: 'Nhỏ mắt sáng – tối',
  },
  {
    label: 'Latanoprost 0.005%',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '1 lần/ngày',
    defaultInstruction: 'Nhỏ mắt trước khi ngủ tối',
  },
  {
    label: 'Dorzolamide 2% + Timolol 0.5% (Cosopt)',
    defaultDosage: '1 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '2 lần/ngày',
    defaultInstruction: 'Nhỏ mắt sáng - tối',
  },

  // Nhóm nước mắt nhân tạo & Dinh dưỡng giác mạc
  {
    label: 'Sodium Hyaluronate 0.1% (Vismed)',
    defaultDosage: '1-2 giọt',
    defaultUnit: 'tép',
    defaultFrequency: 'Khi cần',
    defaultInstruction: 'Nhỏ mắt khi thấy khô, cộm',
  },
  {
    label: 'Polyethylene Glycol (Systane Ultra)',
    defaultDosage: '1-2 giọt',
    defaultUnit: 'lọ',
    defaultFrequency: '4 lần/ngày',
    defaultInstruction: 'Nhỏ mắt dưỡng ẩm',
  },

  // Nhóm thuốc uống hỗ trợ toàn thân (Tiểu đường / Huyết áp ảnh hưởng võng mạc)
  {
    label: 'Metformin 500mg',
    defaultDosage: '1 viên',
    defaultUnit: 'viên',
    defaultFrequency: '2 lần/ngày',
    defaultInstruction: 'Uống trong bữa ăn (kiểm soát đường huyết)',
  },
];

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const getTranslatedDrugCatalogue = (
  t: (key: string, fallback?: string) => string
): DrugEntry[] =>
  DRUG_CATALOGUE.map((drug) => {
    const key = `Ophthalmologist.drug.${slugify(drug.label)}`;
    return {
      ...drug,
      defaultDosage: t(`${key}.dosage`, drug.defaultDosage),
      defaultUnit: t(`${key}.unit`, drug.defaultUnit),
      defaultFrequency: t(`${key}.frequency`, drug.defaultFrequency),
      defaultInstruction: t(`${key}.instruction`, drug.defaultInstruction),
    };
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeId = () =>
  `rx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const makeBlankRow = (): RxItem => ({
  id: makeId(),
  medicineName: '',
  dosage: '',
  unit: '',
  frequency: '',
  duration: '',
  instruction: '',
});

function fuzzyMatch(label: string, query: string): boolean {
  if (!query) return true;
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < l.length && qi < q.length; i++) {
    if (l[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: {
  field: keyof Omit<RxItem, 'id'>;
  label: string;
  placeholder: string;
  flex: number;
  required: boolean;
}[] = [
  {
    field: 'medicineName',
    label: 'Tên thuốc',
    placeholder: 'Nhập tên…',
    flex: 5,
    required: true,
  },
  {
    field: 'dosage',
    label: 'Liều',
    placeholder: '1 viên',
    flex: 2,
    required: true,
  },
  {
    field: 'unit',
    label: 'Đơn vị',
    placeholder: 'viên',
    flex: 2,
    required: false,
  },
  {
    field: 'frequency',
    label: 'Tần suất',
    placeholder: '2 lần/ngày',
    flex: 3,
    required: true,
  },
  {
    field: 'duration',
    label: 'Số ngày',
    placeholder: '28',
    flex: 2,
    required: true,
  },
  {
    field: 'instruction',
    label: 'Hướng dẫn',
    placeholder: 'Uống sau ăn…',
    flex: 4,
    required: false,
  },
];

const LAST_FIELD = COLUMNS[COLUMNS.length - 1].field;
const GRID_TEMPLATE = COLUMNS.map((c) => `${c.flex}fr`).join(' ');

// ─── Row component ─────────────────────────────────────────────────────────────

interface RowProps {
  index: number;
  item: RxItem;
  locked: boolean;
  hasError: (field: keyof Omit<RxItem, 'id'>) => boolean;
  onChange: (
    id: string,
    field: keyof Omit<RxItem, 'id'>,
    value: string
  ) => void;
  onBatchChange: (id: string, patch: Partial<Omit<RxItem, 'id'>>) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string) => void;
  registerRef: (
    id: string,
    field: keyof Omit<RxItem, 'id'>,
    el: HTMLInputElement | null
  ) => void;
  t: (key: string, fallback?: string) => string;
}

function RxRow({
  index,
  item,
  locked,
  hasError,
  onChange,
  onBatchChange,
  onDelete,
  onAddAfter,
  registerRef,
  t,
}: RowProps) {
  const [suggestions, setSuggestions] = useState<DrugEntry[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const openSuggestions = useCallback((query: string) => {
    const results = getTranslatedDrugCatalogue(t).filter((d) => fuzzyMatch(d.label, query));
    setSuggestions(results);
    setDropdownOpen(results.length > 0);
    setActiveIdx(-1);
  }, [t]);

  const applyDrug = useCallback(
    (drug: DrugEntry) => {
      onBatchChange(item.id, {
        medicineName: drug.label,
        dosage: item.dosage || drug.defaultDosage,
        unit: item.unit || drug.defaultUnit,
        frequency: item.frequency || drug.defaultFrequency,
        instruction: item.instruction || drug.defaultInstruction,
      });
      setDropdownOpen(false);
      // Move focus to dosage after applying
      document.dispatchEvent(
        new CustomEvent('rx-focus-next', {
          detail: { id: item.id, field: 'dosage' },
        })
      );
    },
    [item, onBatchChange]
  );

  const handleMedicineKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!dropdownOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        const pick = activeIdx >= 0 ? suggestions[activeIdx] : suggestions[0];
        if (pick) {
          e.preventDefault();
          applyDrug(pick);
        }
        return;
      }
    },
    [dropdownOpen, suggestions, activeIdx, applyDrug]
  );

  const handleFieldKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, field: keyof Omit<RxItem, 'id'>) => {
      if (field === 'medicineName') {
        handleMedicineKeyDown(e);
        if (dropdownOpen && (e.key === 'Enter' || e.key === 'Tab')) return;
      }
      if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
        if (field === LAST_FIELD) {
          e.preventDefault();
          onAddAfter(item.id);
          return;
        }
        const colIdx = COLUMNS.findIndex((c) => c.field === field);
        if (colIdx < COLUMNS.length - 1) {
          e.preventDefault();
          document.dispatchEvent(
            new CustomEvent('rx-focus-next', {
              detail: { id: item.id, field: COLUMNS[colIdx + 1].field },
            })
          );
        }
      }
    },
    [handleMedicineKeyDown, dropdownOpen, item.id, onAddAfter]
  );

  return (
    <div className="flex items-start gap-1 py-1 border-b border-gray-100 dark:border-white/5 last:border-0">
      {/* Row number */}
      <span className="w-5 shrink-0 pt-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 text-right select-none">
        {index + 1}.
      </span>

      {/* Fields */}
      <div
        className="flex-1 min-w-0 grid gap-1"
        style={{ gridTemplateColumns: GRID_TEMPLATE }}
      >
        {COLUMNS.map((col) => {
          const isName = col.field === 'medicineName';
          const err = hasError(col.field);
          return (
            <div key={col.field} className="relative min-w-0">
              <input
                ref={(el) => registerRef(item.id, col.field, el)}
                value={item[col.field]}
                disabled={locked}
                placeholder={t(
                  `Ophthalmologist.prescriptionTable.placeholders.${col.field}`,
                  col.placeholder
                )}
                autoComplete="off"
                spellCheck={false}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onChange(item.id, col.field, e.target.value);
                  if (isName) openSuggestions(e.target.value);
                }}
                onFocus={() => {
                  if (isName && item.medicineName)
                    openSuggestions(item.medicineName);
                }}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 160)}
                onKeyDown={(e) => handleFieldKeyDown(e, col.field)}
                className={[
                  'w-full rounded-md px-2 py-1.5 text-xs border transition-colors',
                  'placeholder-gray-300 dark:placeholder-white/20 text-gray-900 dark:text-white',
                  'focus:outline-none focus:ring-1 disabled:opacity-60 disabled:cursor-default bg-gray-50 dark:bg-white/5',
                  err
                    ? 'border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-white/10 focus:ring-cyan-500/60 focus:border-cyan-400',
                ].join(' ')}
              />
              {err && (
                <AlertCircle className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-red-400 pointer-events-none" />
              )}

              {/* Autocomplete dropdown */}
              {isName && dropdownOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 mt-0.5 w-80 max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1f3c] shadow-xl shadow-black/20">
                  {suggestions.map((drug, idx) => (
                    <button
                      key={drug.label}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyDrug(drug);
                      }}
                      className={[
                        'w-full text-left px-3 py-2 text-xs transition-colors flex flex-col gap-0.5',
                        idx === activeIdx
                          ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200',
                      ].join(' ')}
                    >
                      <span className="font-semibold truncate">
                        {drug.label}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 truncate">
                        {drug.defaultDosage} · {drug.defaultFrequency} ·{' '}
                        {drug.defaultInstruction}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!locked ? (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          title={t('Ophthalmologist.prescriptionTable.deleteRow', 'Xoá dòng')}
          className="mt-1.5 shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 dark:text-white/25 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="shrink-0 w-5" />
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PrescriptionTable({
  items,
  onChange,
  noMedicationPrescribed,
  onNoMedicationChange,
  prescriptionNote,
  onNoteChange,
  locked = false,
  validationErrors = {},
  t,
}: PrescriptionTableProps) {
  const refMap = useRef<
    Record<
      string,
      Partial<Record<keyof Omit<RxItem, 'id'>, HTMLInputElement | null>>
    >
  >({});

  const registerRef = useCallback(
    (
      id: string,
      field: keyof Omit<RxItem, 'id'>,
      el: HTMLInputElement | null
    ) => {
      if (!refMap.current[id]) refMap.current[id] = {};
      refMap.current[id][field] = el;
    },
    []
  );

  const focusField = useCallback(
    (id: string, field: keyof Omit<RxItem, 'id'>) => {
      refMap.current[id]?.[field]?.focus();
      refMap.current[id]?.[field]?.select();
    },
    []
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, field } = (e as CustomEvent).detail as {
        id: string;
        field: keyof Omit<RxItem, 'id'>;
      };
      focusField(id, field);
    };
    document.addEventListener('rx-focus-next', handler);
    return () => document.removeEventListener('rx-focus-next', handler);
  }, [focusField]);

  const handleChange = useCallback(
    (id: string, field: keyof Omit<RxItem, 'id'>, value: string) => {
      onChange(
        items.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      );
    },
    [items, onChange]
  );

  // FIX 1: single setState call for all backfilled fields
  const handleBatchChange = useCallback(
    (id: string, patch: Partial<Omit<RxItem, 'id'>>) => {
      onChange(
        items.map((row) => (row.id === id ? { ...row, ...patch } : row))
      );
    },
    [items, onChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = items.filter((r) => r.id !== id);
      onChange(next.length ? next : [makeBlankRow()]);
    },
    [items, onChange]
  );

  const handleAddAfter = useCallback(
    (id: string) => {
      const idx = items.findIndex((r) => r.id === id);
      const newRow = makeBlankRow();
      onChange([...items.slice(0, idx + 1), newRow, ...items.slice(idx + 1)]);
      setTimeout(() => focusField(newRow.id, 'medicineName'), 30);
    },
    [items, onChange, focusField]
  );

  const handleAddBottom = useCallback(() => {
    const newRow = makeBlankRow();
    onChange([...items, newRow]);
    setTimeout(() => focusField(newRow.id, 'medicineName'), 30);
  }, [items, onChange, focusField]);

  const hasError = useCallback(
    (id: string) => (field: keyof Omit<RxItem, 'id'>) =>
      (validationErrors[id] ?? []).includes(field),
    [validationErrors]
  );

  const handleNoMedChange = (checked: boolean) => {
    onNoMedicationChange(checked);
    if (checked) {
      onChange([]);
    } else {
      const blank = makeBlankRow();
      onChange([blank]);
      setTimeout(() => focusField(blank.id, 'medicineName'), 30);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('Ophthalmologist.prescriptionTable.title', 'Đơn thuốc')}
        </h4>
        {!locked && !noMedicationPrescribed && (
          <button
            type="button"
            onClick={handleAddBottom}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
          >
            <PlusSquare className="h-3.5 w-3.5" />
            {t('Ophthalmologist.prescriptionTable.addMedicine', 'Thêm thuốc')}
          </button>
        )}
      </div>

      {/* No medication toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={noMedicationPrescribed}
          onChange={(e) => handleNoMedChange(e.target.checked)}
          disabled={locked}
          className="h-3.5 w-3.5 accent-cyan-600 cursor-pointer disabled:cursor-default"
        />
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {t(
            'Ophthalmologist.prescriptionTable.noMedication',
            'Không kê thuốc (chỉ tư vấn / lifestyle)'
          )}
        </span>
      </label>

      {/* Table */}
      {!noMedicationPrescribed && (
        <div>
          {/* Column headers aligned with row grid: [20px number] [fields] [20px delete] */}
          <div
            className="grid gap-1 pb-1"
            style={{ gridTemplateColumns: `20px ${GRID_TEMPLATE} 20px` }}
          >
            <span />
            {COLUMNS.map((col) => (
              <span
                key={col.field}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate"
              >
                {t(
                  `Ophthalmologist.prescriptionTable.columns.${col.field}`,
                  col.label
                )}
                {col.required && <span className="ml-0.5 text-red-400">*</span>}
              </span>
            ))}
            <span />
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#0a1f44] px-2 py-0.5">
            {items.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                {t(
                  'Ophthalmologist.prescriptionTable.empty',
                  'Chưa có thuốc. Nhấn "Thêm thuốc" hoặc bắt đầu nhập.'
                )}
              </p>
            ) : (
              items.map((item, index) => (
                <RxRow
                  key={item.id}
                  index={index}
                  item={item}
                  locked={locked}
                  hasError={hasError(item.id)}
                  onChange={handleChange}
                  onBatchChange={handleBatchChange}
                  onDelete={handleDelete}
                  onAddAfter={handleAddAfter}
                  registerRef={registerRef}
                  t={t}
                />
              ))
            )}
          </div>

          {!locked && items.length > 0 && (
            <p className="mt-1.5 pl-5 text-[10px] text-gray-400 dark:text-gray-500 italic">
              <kbd className="font-mono bg-gray-100 dark:bg-white/10 px-1 rounded">
                Tab
              </kbd>{' '}
              {t('Ophthalmologist.prescriptionTable.keyboardHint.or', 'hoặc')}{' '}
              <kbd className="font-mono bg-gray-100 dark:bg-white/10 px-1 rounded">
                Enter
              </kbd>{' '}
              {t(
                'Ophthalmologist.prescriptionTable.keyboardHint.description',
                'để chuyển ô · Enter ở ô cuối để thêm dòng mới'
              )}
            </p>
          )}
        </div>
      )}

      {/* Note */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
          {t('Ophthalmologist.prescriptionTable.note', 'Ghi chú cho dược sĩ / bệnh nhân')}
        </label>
        <textarea
          value={prescriptionNote}
          onChange={(e) => onNoteChange(e.target.value)}
          disabled={locked}
          placeholder={t(
            'Ophthalmologist.prescriptionTable.notePlaceholder',
            'Ví dụ: Bệnh nhân dị ứng Penicillin. Lưu ý bảo quản thuốc ở nhiệt độ thường…'
          )}
          rows={2}
          className="w-full px-4 py-2.5 text-xs bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none disabled:opacity-60 disabled:cursor-default"
        />
      </div>

      {locked && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          {t(
            'Ophthalmologist.prescriptionTable.lockedMessage',
            'Đơn thuốc đã finalize — không thể chỉnh sửa.'
          )}
        </p>
      )}
    </div>
  );
}

export function validatePrescriptionItems(
  items: RxItem[],
  noMedication: boolean
): { valid: boolean; errors: Record<string, (keyof Omit<RxItem, 'id'>)[]> } {
  if (noMedication) return { valid: true, errors: {} };
  const errors: Record<string, (keyof Omit<RxItem, 'id'>)[]> = {};
  const REQUIRED: (keyof Omit<RxItem, 'id'>)[] = [
    'medicineName',
    'dosage',
    'frequency',
    'duration',
  ];
  for (const item of items) {
    const missing = REQUIRED.filter((f) => !item[f].trim());
    if (missing.length) errors[item.id] = missing;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
