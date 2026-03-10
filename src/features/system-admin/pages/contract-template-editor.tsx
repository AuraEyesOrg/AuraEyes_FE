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

/* ─── Template mock registry ─────────────────────────────── */
const TEMPLATE_REGISTRY: Record<
  string,
  { name: string; type: string; html: string }
> = {
  'tpl-001': {
    name: 'Hợp đồng hợp tác chuyên môn y khoa',
    type: 'ophthalmologist',
    html: MOCK_OPHTHALMOLOGIST_HTML,
  },
  'tpl-002': {
    name: 'Hợp đồng liên kết cung cấp dịch vụ y tế',
    type: 'organization',
    html: MOCK_ORGANIZATION_HTML,
  },
  'tpl-003': {
    name: 'Hợp đồng thử nghiệm – Bác sĩ (v2)',
    type: 'ophthalmologist',
    html: MOCK_OPHTHALMOLOGIST_HTML,
  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function extractVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{([^}]+)\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
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

/* ─── Variable chip (draggable) ─────────────────────────── */
function DraggableVariableChip({
  variable,
  categoryColor,
  categoryBg,
  categoryBorder,
  inUse,
  onDragStart,
  onClick,
  isHighlighted,
}: {
  variable: TemplateVariable;
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
  inUse: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, v: TemplateVariable) => void;
  onClick: (key: string) => void;
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
      title={`Example: ${variable.example}`}
    >
      <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-60 shrink-0" />
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-bold font-mono truncate"
          style={{ color: categoryColor }}
        >
          {`{{${variable.key}}}`}
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          {variable.label}
        </div>
      </div>
      {inUse && (
        <CheckCircle2
          className="w-3 h-3 shrink-0 opacity-60"
          style={{ color: categoryColor }}
        />
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
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  /* Template state */
  const [templateName, setTemplateName] = useState(
    isNew ? 'Untitled Template' : (TEMPLATE_REGISTRY[id!]?.name ?? 'Template')
  );
  const [templateHTML, setTemplateHTML] = useState(
    isNew ? MOCK_BLANK_HTML : (TEMPLATE_REGISTRY[id!]?.html ?? MOCK_BLANK_HTML)
  );
  const [saved, setSaved] = useState(!isNew);

  /* Canvas state */
  const [zoom, setZoom] = useState(90);
  const [highlightedVar, setHighlightedVar] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /* Panel state */
  const [varSearch, setVarSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'variables' | 'used'>('variables');

  /* Toast */
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragVarRef = useRef<string | null>(null);

  /* Extract variables currently in template */
  const usedVars = extractVariables(templateHTML);

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

    /* Append {{varKey}} before the closing </div> of the document */
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
  }, []);

  /* Zoom helpers */
  const changeZoom = (delta: number) =>
    setZoom((z) => Math.max(40, Math.min(160, z + delta)));

  /* Save */
  const handleSave = () => {
    setSaved(true);
    setToast('Template saved successfully!');
  };

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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Save Template
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
            <div className="flex-1 overflow-auto p-8">
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
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                Variables
              </h2>
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
                VARIABLE_CATEGORIES.map((cat) => (
                  <VariableCategorySection
                    key={cat.id}
                    cat={cat}
                    usedVars={usedVars}
                    searchQ={searchQ}
                    onDragStart={handleVarDragStart}
                    onVarClick={(key) =>
                      setHighlightedVar((prev) => (prev === key ? null : key))
                    }
                    highlightedVar={highlightedVar}
                  />
                ))
              ) : (
                /* "In Use" tab: show only variables present in the template */
                <div className="space-y-1 pt-1">
                  {usedVars.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      No variables in template yet.
                    </p>
                  ) : (
                    usedVars.map((key) => {
                      const cat = getCategoryForVar(key);
                      const varDef = cat?.variables.find((v) => v.key === key);
                      return (
                        <div
                          key={key}
                          onClick={() =>
                            setHighlightedVar((prev) =>
                              prev === key ? null : key
                            )
                          }
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
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
                            <div
                              className="text-xs font-bold font-mono"
                              style={{ color: cat?.color ?? '#6b7280' }}
                            >
                              {`{{${key}}}`}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {varDef?.label ?? 'Custom variable'}
                            </div>
                          </div>
                          <CheckCircle2
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: cat?.color ?? '#22c55e' }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Add custom variable */}
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
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
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
