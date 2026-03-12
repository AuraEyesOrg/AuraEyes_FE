/**
 * Contract Template Editor
 * Visual drag-and-drop editor for creating/editing contract templates.
 * Left: Zoomable document canvas with {{variable}} chip highlights.
 * Right: Categorized variable panel — drag variables into the document.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type DragEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractTemplatesApi } from '../api/contract-templates.api';
import type { VariablePayload } from '../types/system-admin.types';
import {
  ArrowLeft,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  Calendar,
  User,
  Building2,
  Briefcase,
  CheckCircle2,
  Eye,
  RotateCcw,
  Plus,
  X,
  Loader2,
  Undo2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

/* ─── Variable definitions ───────────────────────────────── */
interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: string;
}

const VARIABLE_CATEGORIES: {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  variables: TemplateVariable[];
}[] = [
  {
    id: 'date',
    label: 'Date & Time',
    icon: Calendar,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    variables: [
      { key: 'day', label: 'Day', example: '15', category: 'date' },
      { key: 'month', label: 'Month', example: '3', category: 'date' },
      { key: 'year', label: 'Year', example: '2026', category: 'date' },
      {
        key: 'paymentDay',
        label: 'Payment Day',
        example: '25',
        category: 'date',
      },
    ],
  },
  {
    id: 'doctor',
    label: 'Doctor (Ophthalmologist)',
    icon: User,
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    variables: [
      {
        key: 'doctorName',
        label: 'Full Name',
        example: 'Dr. Nguyễn Văn An',
        category: 'doctor',
      },
      {
        key: 'doctorDOB',
        label: 'Date of Birth',
        example: '01/01/1980',
        category: 'doctor',
      },
      {
        key: 'doctorLicenseNumber',
        label: 'License Number',
        example: '079080012345',
        category: 'doctor',
      },
      {
        key: 'doctorAddress',
        label: 'Address',
        example: '123 Lê Văn Việt, Q.9, TP.HCM',
        category: 'doctor',
      },
      {
        key: 'doctorPhone',
        label: 'Phone',
        example: '0901 234 567',
        category: 'doctor',
      },
      {
        key: 'doctorEmail',
        label: 'Email',
        example: 'dr.an@example.com',
        category: 'doctor',
      },
      {
        key: 'doctorSpecialization',
        label: 'Specialization',
        example: 'Nhãn khoa lâm sàng',
        category: 'doctor',
      },
      {
        key: 'doctorPracticeNumber',
        label: 'Practice Certificate No.',
        example: '01-HCM-2022',
        category: 'doctor',
      },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Building2,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    variables: [
      {
        key: 'orgName',
        label: 'Organization Name',
        example: 'Phòng Khám Mắt Ánh Sáng',
        category: 'organization',
      },
      {
        key: 'orgLicenseNumber',
        label: 'Business License',
        example: '0312345678',
        category: 'organization',
      },
      {
        key: 'orgAddress',
        label: 'Address',
        example: '456 Nguyễn Trãi, Q.1, TP.HCM',
        category: 'organization',
      },
      {
        key: 'orgPhone',
        label: 'Phone',
        example: '(028) 3812-3456',
        category: 'organization',
      },
      {
        key: 'orgEmail',
        label: 'Email',
        example: 'contact@anhsang.vn',
        category: 'organization',
      },
      {
        key: 'orgRepresentative',
        label: 'Legal Representative',
        example: 'BS. Trần Thị Bích',
        category: 'organization',
      },
      {
        key: 'orgPosition',
        label: 'Position',
        example: 'Giám đốc',
        category: 'organization',
      },
    ],
  },
  {
    id: 'contract',
    label: 'Contract Terms',
    icon: Briefcase,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    variables: [
      {
        key: 'contractNumber',
        label: 'Contract Number',
        example: 'AURA-2026-001',
        category: 'contract',
      },
      {
        key: 'contractDuration',
        label: 'Duration (months)',
        example: '12',
        category: 'contract',
      },
      {
        key: 'revenueShare',
        label: 'Revenue Share (%)',
        example: '30',
        category: 'contract',
      },
      {
        key: 'penaltyAmount',
        label: 'Penalty Amount',
        example: '50,000,000',
        category: 'contract',
      },
    ],
  },
];

/* ─── Mock template HTML content ────────────────────────── */
const MOCK_OPHTHALMOLOGIST_HTML = `<div style="font-family:'Times New Roman',serif;color:#1e293b;line-height:1.7;font-size:13pt;text-align:justify;">
  <div style="text-align:center;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
  <div style="text-align:center;font-weight:bold;border-bottom:1.5px solid #1e293b;display:inline-block;width:100%;padding-bottom:4px;margin-bottom:24px;">Độc lập – Tự do – Hạnh phúc</div>

  <h1 style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;margin:0 0 6px;">HỢP ĐỒNG HỢP TÁC CHUYÊN MÔN Y KHOA</h1>
  <p style="text-align:center;font-style:italic;color:#64748b;margin-bottom:24px;">Số: {{contractNumber}}/AURA-HĐ</p>

  <p>Hôm nay, ngày <strong>{{day}}</strong> tháng <strong>{{month}}</strong> năm <strong>{{year}}</strong>, tại TP. Hồ Chí Minh, chúng tôi gồm:</p>

  <div style="margin:20px 0;padding:16px 20px;border-left:4px solid #7c3aed;background:#f5f3ff;border-radius:0 8px 8px 0;">
    <p style="font-weight:bold;margin:0 0 8px;color:#7c3aed;">BÊN A (Đơn vị cung cấp dịch vụ)</p>
    <p style="margin:2px 0;"><b>Tên tổ chức:</b> Công ty TNHH AURA EYES VIETNAM</p>
    <p style="margin:2px 0;"><b>Địa chỉ:</b> 123 Đường Công nghệ, Khu CNC, TP. Thủ Đức</p>
    <p style="margin:2px 0;"><b>Đại diện:</b> Ban Giám Đốc Công ty</p>
  </div>

  <div style="margin:20px 0;padding:16px 20px;border-left:4px solid #0891b2;background:#ecfeff;border-radius:0 8px 8px 0;">
    <p style="font-weight:bold;margin:0 0 8px;color:#0891b2;">BÊN B (Chuyên gia Y tế)</p>
    <p style="margin:2px 0;"><b>Họ và tên:</b> {{doctorName}}</p>
    <p style="margin:2px 0;"><b>Ngày sinh:</b> {{doctorDOB}}</p>
    <p style="margin:2px 0;"><b>Số CCCD:</b> {{doctorLicenseNumber}}</p>
    <p style="margin:2px 0;"><b>Địa chỉ:</b> {{doctorAddress}}</p>
    <p style="margin:2px 0;"><b>Điện thoại:</b> {{doctorPhone}} &nbsp;|&nbsp; <b>Email:</b> {{doctorEmail}}</p>
    <p style="margin:2px 0;"><b>Chuyên khoa:</b> {{doctorSpecialization}}</p>
    <p style="margin:2px 0;"><b>Chứng chỉ hành nghề số:</b> {{doctorPracticeNumber}}</p>
  </div>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 1. MỤC ĐÍCH VÀ NỘI DUNG HỢP TÁC</h2>
  <ol style="margin:0;padding-left:22px;">
    <li style="margin-bottom:6px;">Bên B thực hiện dịch vụ đọc và phân tích hình ảnh đáy mắt cho các bệnh nhân của Bên A thông qua nền tảng AURA platform.</li>
    <li style="margin-bottom:6px;">Thời hạn hợp đồng: <strong>{{contractDuration}}</strong> tháng kể từ ngày ký.</li>
    <li>Phạm vi hoạt động trên toàn quốc, thông qua hệ thống telemedicine của Bên A.</li>
  </ol>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 2. QUYỀN LỢI VÀ NGHĨA VỤ</h2>
  <ul style="margin:0;padding-left:22px;">
    <li style="margin-bottom:6px;">Bên B được hưởng <strong>{{revenueShare}}%</strong> doanh thu từ mỗi ca khám được phân công.</li>
    <li style="margin-bottom:6px;">Thanh toán định kỳ vào ngày <strong>{{paymentDay}}</strong> hằng tháng.</li>
    <li>Phạt vi phạm hợp đồng: <strong>{{penaltyAmount}}</strong> VNĐ.</li>
  </ul>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 3. BẢO MẬT VÀ HIỆU LỰC</h2>
  <p>Hợp đồng có hiệu lực từ ngày ký. Lập thành 02 bản có giá trị pháp lý ngang nhau.</p>

  <table style="width:100%;margin-top:48px;border-collapse:collapse;">
    <tr>
      <td style="width:50%;text-align:center;padding:12px;vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN A</strong><br/><em style="font-size:11pt;">(Ký, ghi rõ họ tên, đóng dấu)</em>
        <div style="margin-top:60px;border-top:1px solid #94a3b8;padding-top:8px;">Ban Giám Đốc Công ty</div>
      </td>
      <td style="width:50%;text-align:center;padding:12px;vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN B</strong><br/><em style="font-size:11pt;">(Ký, ghi rõ họ tên)</em>
        <div style="margin-top:60px;border-top:1px solid #94a3b8;padding-top:8px;">{{doctorName}}</div>
      </td>
    </tr>
  </table>
</div>`;

const MOCK_ORGANIZATION_HTML = `<div style="font-family:'Times New Roman',serif;color:#1e293b;line-height:1.7;font-size:13pt;text-align:justify;">
  <div style="text-align:center;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
  <div style="text-align:center;font-weight:bold;border-bottom:1.5px solid #1e293b;display:inline-block;width:100%;padding-bottom:4px;margin-bottom:24px;">Độc lập – Tự do – Hạnh phúc</div>

  <h1 style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;margin:0 0 6px;">HỢP ĐỒNG LIÊN KẾT CUNG CẤP DỊCH VỤ Y TẾ</h1>
  <p style="text-align:center;font-style:italic;color:#64748b;margin-bottom:24px;">Số: {{contractNumber}}/AURA-HĐ</p>

  <p>Hôm nay, ngày <strong>{{day}}</strong> tháng <strong>{{month}}</strong> năm <strong>{{year}}</strong>, tại TP. Hồ Chí Minh, chúng tôi gồm:</p>

  <div style="margin:20px 0;padding:16px 20px;border-left:4px solid #7c3aed;background:#f5f3ff;border-radius:0 8px 8px 0;">
    <p style="font-weight:bold;margin:0 0 8px;color:#7c3aed;">BÊN A (AURA EYES VIETNAM)</p>
    <p style="margin:2px 0;"><b>Tên tổ chức:</b> Công ty TNHH AURA EYES VIETNAM</p>
    <p style="margin:2px 0;"><b>Địa chỉ:</b> 123 Đường Công nghệ, Khu CNC, TP. Thủ Đức</p>
    <p style="margin:2px 0;"><b>Đại diện:</b> Ban Giám Đốc Công ty</p>
  </div>

  <div style="margin:20px 0;padding:16px 20px;border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;">
    <p style="font-weight:bold;margin:0 0 8px;color:#d97706;">BÊN B (Đơn vị Y tế)</p>
    <p style="margin:2px 0;"><b>Tên tổ chức:</b> {{orgName}}</p>
    <p style="margin:2px 0;"><b>Số đăng ký kinh doanh:</b> {{orgLicenseNumber}}</p>
    <p style="margin:2px 0;"><b>Địa chỉ:</b> {{orgAddress}}</p>
    <p style="margin:2px 0;"><b>Điện thoại:</b> {{orgPhone}} &nbsp;|&nbsp; <b>Email:</b> {{orgEmail}}</p>
    <p style="margin:2px 0;"><b>Đại diện:</b> {{orgRepresentative}} – <em>{{orgPosition}}</em></p>
  </div>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 1. MỤC TIÊU VÀ NỘI DUNG LIÊN KẾT</h2>
  <p>Hai bên cùng hợp tác triển khai chương trình tầm soát bệnh lý đáy mắt thông qua thiết bị chụp đáy mắt và hệ thống AI AURA.</p>
  <p>Thời hạn hợp đồng: <strong>{{contractDuration}}</strong> tháng kể từ ngày ký.</p>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 3. CƠ CHẾ TÀI CHÍNH</h2>
  <ul style="margin:0;padding-left:22px;">
    <li style="margin-bottom:6px;">Bên B được hưởng <strong>{{revenueShare}}%</strong> doanh thu dịch vụ phát sinh tại cơ sở.</li>
    <li style="margin-bottom:6px;">Thanh toán vào ngày <strong>{{paymentDay}}</strong> hằng tháng.</li>
    <li>Tiền phạt vi phạm: <strong>{{penaltyAmount}}</strong> VNĐ.</li>
  </ul>

  <h2 style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">ĐIỀU 6. ĐIỀU KHOẢN THI HÀNH</h2>
  <p>Hợp đồng có hiệu lực từ ngày ký. Lập thành 02 bản có giá trị pháp lý ngang nhau.</p>

  <table style="width:100%;margin-top:48px;border-collapse:collapse;">
    <tr>
      <td style="width:50%;text-align:center;padding:12px;vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN A</strong><br/><em style="font-size:11pt;">(Ký, ghi rõ họ tên, đóng dấu)</em>
        <div style="margin-top:60px;border-top:1px solid #94a3b8;padding-top:8px;">Ban Giám Đốc Công ty</div>
      </td>
      <td style="width:50%;text-align:center;padding:12px;vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN B</strong><br/><em style="font-size:11pt;">(Ký, ghi rõ họ tên, đóng dấu)</em>
        <div style="margin-top:60px;border-top:1px solid #94a3b8;padding-top:8px;">{{orgRepresentative}}</div>
      </td>
    </tr>
  </table>
</div>`;

const MOCK_BLANK_HTML = `<div style="font-family:'Times New Roman',serif;color:#1e293b;line-height:1.7;font-size:13pt;text-align:justify;">
  <div style="text-align:center;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
  <div style="text-align:center;font-weight:bold;border-bottom:1.5px solid #1e293b;display:inline-block;width:100%;padding-bottom:4px;margin-bottom:24px;">Độc lập – Tự do – Hạnh phúc</div>
  <h1 style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;margin:0 0 6px;">[TÊN HỢP ĐỒNG]</h1>
  <p style="text-align:center;font-style:italic;color:#94a3b8;margin-bottom:24px;">Kéo thả biến từ bảng bên phải vào đây ↑</p>
  <p>Hôm nay, ngày ... tháng ... năm ..., chúng tôi ký kết hợp đồng này.</p>
  <div style="margin-top:40px;padding:20px;border:2px dashed #cbd5e1;border-radius:8px;text-align:center;color:#94a3b8;">
    <p style="margin:0;font-size:11pt;">📝 Nội dung hợp đồng sẽ hiển thị ở đây</p>
    <p style="margin:4px 0 0;font-size:10pt;">Bạn có thể sử dụng nút "Upload HTML" để tải lên file hợp đồng</p>
  </div>
</div>`;

/* ─── Build variables payload from extracted var keys ────── */
function buildVariablesPayload(varKeys: string[]): VariablePayload[] {
  return varKeys.map((key, index) => {
    const cat = getCategoryForVar(key);
    const varDef = cat?.variables.find((v) => v.key === key);
    const variableType = cat?.id === 'date' ? 5 : 1; // Date=5, Text=1
    return {
      key,
      label: varDef?.label ?? key,
      variableType,
      isRequired: false,
      sortOrder: index,
    };
  });
}

/* ─── Helpers ────────────────────────────────────────────── */
function extractVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{([^}]+)\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

/** Count how many times {{key}} appears in the HTML */
function countVariableOccurrences(html: string, key: string): number {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = html.match(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'));
  return matches?.length ?? 0;
}

/**
 * Remove ONE occurrence of {{key}} from the HTML.
 * If the {{key}} sits inside a <p> that contains only whitespace + the variable,
 * remove the entire <p> block (fixes leftover green bg).
 */
function removeOneVariableOccurrence(html: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Try to match a <p ...> that only contains optional whitespace and {{key}}
  const pBlockRegex = new RegExp(
    `<p[^>]*>\\s*\\{\\{${escaped}\\}\\}\\s*</p>`,
    'i'
  );
  if (pBlockRegex.test(html)) {
    return html.replace(pBlockRegex, '');
  }
  // Otherwise just remove the first {{key}} occurrence
  return html.replace(new RegExp(`\\{\\{${escaped}\\}\\}`), '');
}

function getCategoryForVar(key: string) {
  for (const cat of VARIABLE_CATEGORIES) {
    if (cat.variables.some((v) => v.key === key)) return cat;
  }
  return null;
}

function processHTMLForCanvas(
  html: string,
  highlightedVar?: string | null
): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (_, varName: string) => {
    const cat = getCategoryForVar(varName);
    const color = cat?.color ?? '#6b7280';
    const bg = cat?.bgColor ?? '#f1f5f9';
    const border = cat?.borderColor ?? '#e2e8f0';
    const isHighlighted = varName === highlightedVar;
    const ring = isHighlighted ? `box-shadow:0 0 0 3px ${color}55;` : '';

    return `<span
      class="var-chip"
      data-var="${varName}"
      style="display:inline-flex;align-items:center;gap:3px;padding:1px 8px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;color:${color};background:${bg};border:1.5px solid ${border};${ring};transition:box-shadow .15s;font-family:monospace;"
    ><span style="opacity:.5;font-size:9px;">&#x7B;&#x7B;</span>${varName}<span style="opacity:.5;font-size:9px;">&#x7D;&#x7D;</span></span>`;
  });
}

/* ─── Toast notification ─────────────────────────────────── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-3 fade-in">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      {message}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Category def interface for the variable panel ─────────── */
interface PanelCatDef {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

/* ─── Custom category definition (fallback for unknown keys) ── */
const CUSTOM_CAT_DEF: PanelCatDef = {
  id: 'custom',
  label: 'Custom Variables',
  icon: FileText,
  color: '#64748b',
  bgColor: '#f1f5f9',
  borderColor: '#e2e8f0',
};

/* ─── VariableType string → number ─────────────────────────── */
const VTYPE_MAP: Record<string, number> = {
  Text: 1,
  Number: 2,
  Currency: 3,
  Time: 4,
  Date: 5,
  Select: 6,
};
function vtypeNum(s: string): number {
  return VTYPE_MAP[s] ?? 1;
}

/* ─── Group VariablePayload list into category groups ───────── */
type CategoryGroup = {
  id: string;
  catDef: PanelCatDef;
  vars: VariablePayload[];
};
function groupByCategory(vars: VariablePayload[]): CategoryGroup[] {
  const catMap = new Map<string, VariablePayload[]>();
  const custom: VariablePayload[] = [];
  for (const v of vars) {
    const cat = getCategoryForVar(v.key);
    if (cat) {
      if (!catMap.has(cat.id)) catMap.set(cat.id, []);
      catMap.get(cat.id)!.push(v);
    } else {
      custom.push(v);
    }
  }
  const groups: CategoryGroup[] = [];
  for (const catDef of VARIABLE_CATEGORIES) {
    const cv = catMap.get(catDef.id);
    if (cv?.length) groups.push({ id: catDef.id, catDef, vars: cv });
  }
  if (custom.length > 0)
    groups.push({ id: 'custom', catDef: CUSTOM_CAT_DEF, vars: custom });
  return groups;
}

/* ─── Variable chip (draggable) ─────────────────────────── */
function DraggableVariableChip({
  variable,
  categoryColor,
  categoryBg,
  categoryBorder,
  inUse,
  onDragStart,
  onClick,
  onDelete,
  isHighlighted,
}: {
  variable: TemplateVariable;
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
  inUse: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, v: TemplateVariable) => void;
  onClick: (key: string) => void;
  onDelete?: (key: string) => void;
  isHighlighted: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, variable)}
      onClick={() => onClick(variable.key)}
      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isHighlighted ? 'ring-2 ring-offset-1' : ''
      }`}
      style={{
        background: categoryBg,
        borderColor: isHighlighted ? categoryColor : categoryBorder,
      }}
      title={variable.example ? `e.g. ${variable.example}` : undefined}
    >
      <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-60 shrink-0" />
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-semibold truncate"
          style={{ color: categoryColor }}
        >
          {variable.label}
        </div>
        <div className="text-[10px] font-mono text-slate-400 truncate">
          {`{{${variable.key}}}`}
        </div>
      </div>
      {inUse && !onDelete && (
        <CheckCircle2
          className="w-3 h-3 shrink-0 opacity-60"
          style={{ color: categoryColor }}
        />
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(variable.key);
          }}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
          title={inUse ? 'Xóa biến (đang dùng trong template)' : 'Xóa biến'}
        >
          <X className="w-3 h-3 text-red-400 hover:text-red-600" />
        </button>
      )}
    </div>
  );
}

/* ─── Variable category section ─────────────────────────── */
function VariableCategorySection({
  cat,
  usedVars,
  searchQ,
  onDragStart,
  onVarClick,
  highlightedVar,
}: {
  cat: (typeof VARIABLE_CATEGORIES)[0];
  usedVars: string[];
  searchQ: string;
  onDragStart: (e: DragEvent<HTMLDivElement>, v: TemplateVariable) => void;
  onVarClick: (key: string) => void;
  highlightedVar: string | null;
}) {
  const [open, setOpen] = useState(true);
  const Icon = cat.icon;

  const filtered = cat.variables.filter(
    (v) =>
      !searchQ ||
      v.key.toLowerCase().includes(searchQ) ||
      v.label.toLowerCase().includes(searchQ)
  );

  if (!filtered.length) return null;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">
          {cat.label}
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: cat.bgColor, color: cat.color }}
        >
          {filtered.filter((v) => usedVars.includes(v.key)).length}/
          {filtered.length}
        </span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="pl-2 pr-1 pb-1 space-y-1">
          {filtered.map((v) => (
            <DraggableVariableChip
              key={v.key}
              variable={v}
              categoryColor={cat.color}
              categoryBg={cat.bgColor}
              categoryBorder={cat.borderColor}
              inUse={usedVars.includes(v.key)}
              onDragStart={onDragStart}
              onClick={onVarClick}
              isHighlighted={v.key === highlightedVar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main editor page ───────────────────────────────────── */
export default function ContractTemplateEditorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  /* Template state */
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [templateHTML, setTemplateHTML] = useState(MOCK_BLANK_HTML);
  const [templateType, setTemplateType] = useState<1 | 2>(1); // 1=Ophthalmologist, 2=Organization
  const [contractVersion, setContractVersion] = useState('1.0');
  const [saved, setSaved] = useState(isNew);

  /* Variables state — populated from API when editing, empty for new */
  const [localVariables, setLocalVariables] = useState<VariablePayload[]>([]);
  const [showAddVarModal, setShowAddVarModal] = useState(false);

  /* Canvas state */
  const [zoom, setZoom] = useState(90);
  const [highlightedVar, setHighlightedVar] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /* Panel state */
  const [varSearch, setVarSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'variables' | 'used'>('variables');

  /* Toast */
  const [toast, setToast] = useState<string | null>(null);

  /* Undo stack for variable deletions */
  const [undoStack, setUndoStack] = useState<{ html: string; label: string }[]>(
    []
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragVarRef = useRef<string | null>(null);

  /* Extract variables currently in template */
  const usedVars = extractVariables(templateHTML);

  /* Quick lookup map: key → VariablePayload */
  const localVarMap = Object.fromEntries(localVariables.map((v) => [v.key, v]));

  /* ── Load existing template ── */
  const { data: existingTemplate, isLoading: loadingTemplate } = useQuery({
    queryKey: ['contract-template', id],
    queryFn: () => contractTemplatesApi.getContractTemplateById(id!),
    enabled: !isNew && !!id,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!existingTemplate) return;
    setTemplateName(existingTemplate.title);
    setTemplateHTML(existingTemplate.contentTemplate || MOCK_BLANK_HTML);
    setTemplateType(
      existingTemplate.type === 'OphthalmologistContract' ? 1 : 2
    );
    setContractVersion(existingTemplate.contractVersion);
    setSaved(true);
    // Populate panel with variables loaded from the API
    setLocalVariables(
      (existingTemplate.variables ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((v, i) => ({
          key: v.key,
          label: v.label,
          variableType: vtypeNum(v.variableType),
          description: v.description ?? undefined,
          defaultValue: v.defaultValue ?? undefined,
          selectOptions: v.selectOptions ?? undefined,
          unit: v.unit ?? undefined,
          isRequired: v.isRequired,
          sortOrder: i,
        }))
    );
  }, [existingTemplate]);

  /* Merge localVariables with any HTML-only vars (typed manually) for the save payload */
  const buildSaveVariables = (): VariablePayload[] => {
    const merged = [...localVariables];
    extractVariables(templateHTML).forEach((key) => {
      if (!merged.some((v) => v.key === key)) {
        const cat = getCategoryForVar(key);
        const varDef = cat?.variables.find((v) => v.key === key);
        merged.push({
          key,
          label: varDef?.label ?? key,
          variableType: cat?.id === 'date' ? 5 : 1,
          isRequired: false,
          sortOrder: merged.length,
        });
      }
    });
    return merged.map((v, i) => ({ ...v, sortOrder: i }));
  };

  /* ── Save mutation ── */
  const saveMutation = useMutation({
    mutationFn: async () => {
      const variables = buildSaveVariables();
      const payload = {
        title: templateName,
        type: templateType,
        contractVersion,
        contentTemplate: templateHTML,
        variables,
      };
      if (isNew) {
        return contractTemplatesApi.createContractTemplate(payload);
      }
      return contractTemplatesApi.updateContractTemplate(id!, payload);
    },
    onSuccess: (result) => {
      setSaved(true);
      setToast('Template saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      // Also invalidate the detail cache so stale data isn't served on re-visit
      const savedId = isNew ? result?.id : id;
      if (savedId) {
        queryClient.invalidateQueries({
          queryKey: ['contract-template', savedId],
        });
      }
      if (isNew && result?.id) {
        navigate(`/system-admin/contract-templates/${result.id}/edit`, {
          replace: true,
        });
      }
    },
    onError: (err: unknown) => {
      setToast(`Save failed: ${(err as Error)?.message ?? 'Unknown error'}`);
    },
  });

  /* Render processed HTML into canvas */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.innerHTML = processHTMLForCanvas(templateHTML, highlightedVar);

    /* Event delegation for click on var chips */
    const handleClick = (e: MouseEvent) => {
      const chip = (e.target as HTMLElement).closest(
        '[data-var]'
      ) as HTMLElement | null;
      if (chip) {
        const varKey = chip.getAttribute('data-var');
        setHighlightedVar((prev) => (prev === varKey ? null : varKey));
      }
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [templateHTML, highlightedVar]);

  /* Drag handlers for variable chips */
  const handleVarDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, variable: TemplateVariable) => {
      dragVarRef.current = variable.key;
      e.dataTransfer.setData('text/plain', variable.key);
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  const handleCanvasDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleCanvasDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleCanvasDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const varKey = e.dataTransfer.getData('text/plain') || dragVarRef.current;
    if (!varKey) return;

    /* Append {{varKey}} before the closing </table> of the document */
    const insertToken = ` {{${varKey}}}`;
    setTemplateHTML((prev) =>
      prev.replace(
        /<\/table>/,
        `<p style="margin-top:16px;padding:8px 12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:0 6px 6px 0;font-size:11pt;">${insertToken}</p></table>`
      )
    );
    setSaved(false);
    setToast(`Variable {{${varKey}}} added to template`);
    setHighlightedVar(varKey);

    /* Auto-register in localVariables if not already tracked */
    setLocalVariables((prev) => {
      if (prev.some((v) => v.key === varKey)) return prev;
      const cat = getCategoryForVar(varKey);
      const varDef = cat?.variables.find((v) => v.key === varKey);
      return [
        ...prev,
        {
          key: varKey,
          label: varDef?.label ?? varKey,
          variableType: cat?.id === 'date' ? 5 : 1,
          isRequired: false,
          sortOrder: prev.length,
        },
      ];
    });
  }, []);

  /* Delete one occurrence of a variable from the HTML (keeps localVariables intact) */
  const handleDeleteVariableFromHTML = useCallback((key: string) => {
    setTemplateHTML((prev) => {
      // Push current HTML to undo stack before modifying
      setUndoStack((stack) => [
        ...stack.slice(-19),
        { html: prev, label: key },
      ]);
      return removeOneVariableOccurrence(prev, key);
    });
    setSaved(false);
    setHighlightedVar(null);
    setToast(`Removed one {{${key}}} from template`);
  }, []);

  /* Undo the last variable deletion */
  const handleUndoDelete = useCallback(() => {
    setUndoStack((stack) => {
      if (!stack.length) return stack;
      const last = stack[stack.length - 1];
      setTemplateHTML(last.html);
      setSaved(false);
      setToast(`Undo: restored {{${last.label}}}`);
      return stack.slice(0, -1);
    });
  }, []);

  /* Zoom helpers */
  const changeZoom = (delta: number) =>
    setZoom((z) => Math.max(40, Math.min(160, z + delta)));

  /* Save */
  const handleSave = () => saveMutation.mutate();

  /* Upload HTML file */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setTemplateHTML(content);
      setSaved(false);
      setToast('HTML file loaded');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const searchQ = varSearch.toLowerCase();

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Top Toolbar ──────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => navigate('/system-admin/contract-templates')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              setSaved(false);
            }}
            className="text-sm font-semibold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-2 py-1 w-64"
          />

          {!saved && (
            <span className="text-xs text-amber-500 font-medium">
              ● Unsaved
            </span>
          )}

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Template type */}
          <select
            value={templateType}
            onChange={(e) => {
              setTemplateType(Number(e.target.value) as 1 | 2);
              setSaved(false);
            }}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value={1}>Ophthalmologist</option>
            <option value={2}>Organization</option>
          </select>

          {/* Contract version */}
          <input
            value={contractVersion}
            onChange={(e) => {
              setContractVersion(e.target.value);
              setSaved(false);
            }}
            placeholder="v1.0"
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 w-20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/40 outline-none"
          />

          <div className="ml-auto flex items-center gap-2">
            {/* Upload */}
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload HTML
              <input
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={handleUpload}
              />
            </label>

            {/* Preview */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saveMutation.isPending ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </div>

        {/* ── Main 2-column layout ──────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT: Document Canvas ─────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-200 dark:bg-slate-950 relative">
            {/* Canvas toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-500 font-medium mr-2">
                Document Preview
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => changeZoom(-10)}
                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(90)}
                  className="px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md min-w-[3.5rem] text-center transition-colors"
                >
                  {zoom}%
                </button>
                <button
                  onClick={() => changeZoom(10)}
                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(90)}
                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors ml-1"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable canvas area */}
            {loadingTemplate && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-60" />
              </div>
            )}
            <div
              className={`flex-1 overflow-auto p-8 ${loadingTemplate ? 'hidden' : ''}`}
            >
              {/* Drop zone hint */}
              {isDragOver && (
                <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
                  <div className="bg-primary/10 border-2 border-dashed border-primary rounded-2xl px-8 py-4 text-primary font-semibold text-sm shadow-lg">
                    Release to add variable to template
                  </div>
                </div>
              )}

              {/* A4-style paper */}
              <div
                className="mx-auto origin-top transition-transform duration-150"
                style={{ transform: `scale(${zoom / 100})`, width: '210mm' }}
              >
                <div
                  className={`bg-white shadow-2xl rounded-sm p-[20mm] min-h-[297mm] transition-all duration-150 ${
                    isDragOver ? 'ring-4 ring-primary/40 ring-offset-4' : ''
                  }`}
                  onDragOver={handleCanvasDragOver}
                  onDragLeave={handleCanvasDragLeave}
                  onDrop={handleCanvasDrop}
                >
                  {/* Rendered HTML content — event delegation handles var chip clicks */}
                  <div ref={canvasRef} />
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              <span>{usedVars.length} variables in template</span>
              {highlightedVar && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-primary font-mono">{`{{${highlightedVar}}}`}</span>
                  <span>selected</span>
                  <button
                    onClick={() => setHighlightedVar(null)}
                    className="ml-auto hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: Variables Panel ─────────────────── */}
          <div className="w-72 shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Variables
                </h2>
                <button
                  onClick={() => setShowAddVarModal(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(
                  [
                    { id: 'variables', label: 'All Fields' },
                    { id: 'used', label: `In Use (${usedVars.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={varSearch}
                  onChange={(e) => setVarSearch(e.target.value)}
                  placeholder="Search variables..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Drag hint */}
            <div className="mx-3 mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 shrink-0">
              <span className="font-semibold">Drag</span> a variable into the
              document to insert it.{' '}
              <span className="font-semibold">Click</span> to highlight in
              document.
            </div>

            {/* Scrollable variable list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {activeTab === 'variables' ? (
                localVariables.length > 0 ? (
                  /* API-loaded variables grouped by category */
                  <>
                    {groupByCategory(localVariables).map(
                      ({ id: catId, catDef, vars }) => {
                        const filtered = searchQ
                          ? vars.filter(
                              (v) =>
                                v.key.toLowerCase().includes(searchQ) ||
                                v.label.toLowerCase().includes(searchQ)
                            )
                          : vars;
                        if (!filtered.length) return null;
                        return (
                          <ApiVariableCategorySection
                            key={catId}
                            catDef={catDef}
                            vars={filtered}
                            usedVars={usedVars}
                            onDragStart={handleVarDragStart}
                            onVarClick={(key) =>
                              setHighlightedVar((prev) =>
                                prev === key ? null : key
                              )
                            }
                            highlightedVar={highlightedVar}
                          />
                        );
                      }
                    )}
                    <button
                      onClick={() => setShowAddVarModal(true)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Variable
                    </button>
                  </>
                ) : (
                  /* Library mode: show preset categories for new templates */
                  <>
                    {VARIABLE_CATEGORIES.map((cat) => (
                      <VariableCategorySection
                        key={cat.id}
                        cat={cat}
                        usedVars={usedVars}
                        searchQ={searchQ}
                        onDragStart={handleVarDragStart}
                        onVarClick={(key) =>
                          setHighlightedVar((prev) =>
                            prev === key ? null : key
                          )
                        }
                        highlightedVar={highlightedVar}
                      />
                    ))}
                    {/* Custom variable quick-add for new templates */}
                    <div className="mt-4 px-1">
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 px-1">
                          Custom Variable
                        </p>
                        <CustomVariableAdder
                          onAdd={(key) => {
                            setTemplateHTML((prev) =>
                              prev.replace(
                                /<\/table>/,
                                `<p style="margin-top:12px;"> {{${key}}} </p></table>`
                              )
                            );
                            setSaved(false);
                            setToast(`Custom variable {{${key}}} added`);
                          }}
                        />
                      </div>
                    </div>
                  </>
                )
              ) : (
                /* “In Use” tab: variables currently in the HTML */
                <div className="space-y-1 pt-1">
                  {usedVars.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      No variables in template yet.
                    </p>
                  ) : (
                    <>
                      {undoStack.length > 0 && (
                        <button
                          onClick={handleUndoDelete}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-1 rounded-lg border border-dashed border-amber-300 dark:border-amber-600 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          Undo remove{' '}
                          {`{{${undoStack[undoStack.length - 1].label}}}`}
                        </button>
                      )}
                      {usedVars.map((key) => {
                        const cat = getCategoryForVar(key);
                        const apiVar = localVarMap[key];
                        const displayLabel =
                          apiVar?.label ??
                          cat?.variables.find((v) => v.key === key)?.label ??
                          'Custom variable';
                        const count = countVariableOccurrences(
                          templateHTML,
                          key
                        );
                        const selectOpts: string[] = (() => {
                          try {
                            return apiVar?.selectOptions
                              ? (JSON.parse(apiVar.selectOptions) as string[])
                              : [];
                          } catch {
                            return [];
                          }
                        })();
                        return (
                          <div
                            key={key}
                            onClick={() =>
                              setHighlightedVar((prev) =>
                                prev === key ? null : key
                              )
                            }
                            className={`group flex items-start gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                              highlightedVar === key
                                ? 'ring-2 ring-primary/40'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                            style={{
                              background: cat?.bgColor ?? '#f1f5f9',
                              borderColor: cat?.borderColor ?? '#e2e8f0',
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {displayLabel}
                                </span>
                                {count > 1 && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-700/60 border"
                                    style={{
                                      borderColor:
                                        cat?.borderColor ?? '#e2e8f0',
                                      color: cat?.color ?? '#6b7280',
                                    }}
                                  >
                                    x{count}
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-[10px] font-mono truncate"
                                style={{ color: cat?.color ?? '#6b7280' }}
                              >
                                {`{{${key}}}`}
                              </div>
                              {selectOpts.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectOpts.map((opt) => (
                                    <span
                                      key={opt}
                                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                                    >
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVariableFromHTML(key);
                              }}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shrink-0 mt-0.5"
                              title={
                                count > 1
                                  ? `Remove one of ${count} occurrences`
                                  : 'Remove from template'
                              }
                            >
                              <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {showAddVarModal && (
        <AddVariableModal
          onClose={() => setShowAddVarModal(false)}
          onAdd={(v) => {
            setLocalVariables((prev) => {
              if (prev.some((x) => x.key === v.key)) {
                setToast(`Variable key "{{${v.key}}}" already exists`);
                return prev;
              }
              return [...prev, { ...v, sortOrder: prev.length }];
            });
            setSaved(false);
            setToast(`Variable {{${v.key}}} added — drag it into the document`);
          }}
        />
      )}
    </div>
  );
}

/* ─── Custom variable adder ─────────────────────────────── */
function CustomVariableAdder({ onAdd }: { onAdd: (key: string) => void }) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const cleaned = value
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    if (!cleaned) return;
    onAdd(cleaned);
    setValue('');
  };

  return (
    <div className="flex gap-1.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="myVariable"
        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono"
      />
      <button
        onClick={handleAdd}
        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── API Variable category section ─────────────────────── */
function ApiVariableCategorySection({
  catDef,
  vars,
  usedVars,
  onDragStart,
  onVarClick,
  highlightedVar,
}: {
  catDef: PanelCatDef;
  vars: VariablePayload[];
  usedVars: string[];
  onDragStart: (e: DragEvent<HTMLDivElement>, v: TemplateVariable) => void;
  onVarClick: (key: string) => void;
  highlightedVar: string | null;
}) {
  const [open, setOpen] = useState(true);
  const Icon = catDef.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <Icon className="w-3.5 h-3.5" style={{ color: catDef.color }} />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">
          {catDef.label}
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: catDef.bgColor, color: catDef.color }}
        >
          {vars.filter((v) => usedVars.includes(v.key)).length}/{vars.length}
        </span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="pl-2 pr-1 pb-1 space-y-1">
          {vars.map((v) => (
            <DraggableVariableChip
              key={v.key}
              variable={{
                key: v.key,
                label: v.label,
                example: v.unit ?? '',
                category: catDef.id,
              }}
              categoryColor={catDef.color}
              categoryBg={catDef.bgColor}
              categoryBorder={catDef.borderColor}
              inUse={usedVars.includes(v.key)}
              onDragStart={onDragStart}
              onClick={onVarClick}
              isHighlighted={v.key === highlightedVar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add Variable Modal ─────────────────────────────────── */
const VAR_TYPE_OPTIONS = [
  { value: 1, label: 'Text' },
  { value: 2, label: 'Number' },
  { value: 3, label: 'Currency' },
  { value: 4, label: 'Time' },
  { value: 5, label: 'Date' },
  { value: 6, label: 'Select (Dropdown)' },
];

function AddVariableModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (v: VariablePayload) => void;
}) {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [varType, setVarType] = useState(1);
  const [unit, setUnit] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [selectOptions, setSelectOptions] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const cleanKey = key
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    if (!cleanKey || !label.trim()) return;

    let parsedOptions: string | undefined;
    if (varType === 6 && selectOptions.trim()) {
      const opts = selectOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      parsedOptions = JSON.stringify(opts);
    }

    onAdd({
      key: cleanKey,
      label: label.trim(),
      variableType: varType,
      unit: unit.trim() || undefined,
      isRequired,
      selectOptions: parsedOptions,
      description: description.trim() || undefined,
      sortOrder: 0,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Add New Variable
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Label — primary display name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Loại hình công việc"
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Displayed in the variable panel
            </p>
          </div>

          {/* Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. employmentType"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Used as <span className="font-mono">{'{{key}}'}</span> in the HTML
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              value={varType}
              onChange={(e) => setVarType(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {VAR_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select options — only for Select type */}
          {varType === 6 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Options
              </label>
              <input
                value={selectOptions}
                onChange={(e) => setSelectOptions(e.target.value)}
                placeholder="Part-time, Full-time, Contract"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Comma-separated values
              </p>
            </div>
          )}

          {/* Unit — for Number / Currency */}
          {(varType === 2 || varType === 3) && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Unit
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. VNĐ, %, tháng"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Description{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tooltip / helper text"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Required */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Required field
            </span>
          </label>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!key.trim() || !label.trim()}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Variable
          </button>
        </div>
      </div>
    </div>
  );
}
