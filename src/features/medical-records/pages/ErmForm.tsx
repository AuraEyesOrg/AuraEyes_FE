import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Save,
  Eye,
  Activity,
  RotateCcw,
  User,
  Zap,
  FileText,
  MousePointer2,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * DETAILED EYE EXAM ITEM
 */
interface DetailedEyeItem {
  normal: boolean;
  checks: Record<string, boolean>;
  inputs: Record<string, string>;
  other: string;
}

/**
 * ERM FORM DATA
 */
interface FullErmFormData {
  khoa: string;
  giuong: string;
  soLuuTru: string;
  maYT: string;
  fullName: string;
  birthDate: string;
  age: string;
  gender: 'Nam' | 'Nữ';
  job: string;
  ethnicity: string;
  nationality: string;
  address: string;
  workplace: string;
  objectType: 'BHYT' | 'Thu phí' | 'Miễn' | 'Khác';
  bhytExpiry: string;
  bhytNumber: string;
  relativeName: string;
  relativePhone: string;
  admissionTime: string;
  admissionDate: string;
  admissionType: string;
  referralPlace: string;
  admissionReason: string;
  medicalHistory: string;
  personalHistory: string;
  familyHistory: string;
  rightEyeVisionNoGlass: string;
  leftEyeVisionNoGlass: string;
  rightEyeVisionWithGlass: string;
  leftEyeVisionWithGlass: string;
  rightEyePressure: string;
  leftEyePressure: string;
  rightEyeField: string;
  leftEyeField: string;
  rightEye: Record<string, DetailedEyeItem>;
  leftEye: Record<string, DetailedEyeItem>;
  doctorName: string;
  finalDiagnosisMain: string;
  finalDiagnosisExtra: string;
}

const SECTION_KEYS = [
  'miMat',
  'ketMac',
  'giacMac',
  'cungMac',
  'tienPhong',
  'mongMat',
  'theThuyTinh',
  'dichKinh',
  'vongMac',
];

const INITIAL_ITEM: DetailedEyeItem = {
  normal: true,
  checks: {},
  inputs: {},
  other: '',
};

const createInitialEyeData = () => {
  const data: Record<string, DetailedEyeItem> = {};
  SECTION_KEYS.forEach((key) => {
    data[key] = JSON.parse(JSON.stringify(INITIAL_ITEM));
  });
  return data;
};

const INITIAL_VALUES: Partial<FullErmFormData> = {
  fullName: '',
  gender: 'Nam',
  objectType: 'BHYT',
  admissionDate: new Date().toISOString().split('T')[0],
  rightEye: createInitialEyeData(),
  leftEye: createInitialEyeData(),
  doctorName: '',
};

const sectionConfig: Record<
  string,
  { label: string; checks: Record<string, string> }
> = {
  miMat: {
    label: 'Mi mắt',
    checks: { phuNe: 'Phù nề', phanUngTheMi: 'Phản ứng thể mi' },
  },
  ketMac: {
    label: 'Kết mạc',
    checks: {
      cuongTuNong: 'Cương tụ nông',
      cuongTuSau: 'Cương tụ sâu',
      xuatHuyet: 'Xuất huyết',
      seoKM: 'Sẹo KM',
    },
  },
  giacMac: {
    label: 'Giác mạc',
    checks: {
      trong: 'Trong',
      seo: 'Sẹo',
      phu: 'Phù',
      tuaMoi: 'Tủa mới',
      tuaMoCuu: 'Tủa mỡ cừu',
      tuaSacTo: 'Tủa sắc tố',
      tuaCu: 'Tủa cũ',
      seoGM: 'Sẹo GM',
    },
  },
  cungMac: { label: 'Củng mạc', checks: { seoCM: 'Sẹo CM' } },
  tienPhong: {
    label: 'Tiền phòng',
    checks: {
      sauSach: 'Sâu sạch',
      xepTienPhong: 'Xẹp tiền phòng',
      xuatHuyet: 'Xuất huyết',
      mu: 'Mủ, xuất tiết',
      tyndall: 'Tyndall',
      dinh: 'Dính',
      sacTo: 'Sắc tố',
      tanMach: 'Tân mạch',
    },
  },
  mongMat: {
    label: 'Mống mắt',
    checks: {
      thoaiHoa: 'Thoái hóa',
      tanMachMmongMat: 'Tân mạch mống mắt',
      hatKoeppi: 'Hạt Koeppi',
      hatBusaca: 'Hạt Busaca',
      tron: 'Tròn',
      meo: 'Méo',
      dinh: 'Dính',
      pxdtCo: 'PXĐT: Có',
      pxdtKhong: 'PXĐT: Không',
      gianLiet: 'Giãn liệt',
    },
  },
  theThuyTinh: {
    label: 'Thể thủy tinh',
    checks: {
      trong: 'Trong',
      duc: 'Đục',
      ducVoT3: 'Đục vỡ T3',
      saLech: 'Sa lệch',
      raTienPhong: 'Ra tiền phòng',
      vaoBuongDK: 'Vào buồng dịch kính',
      dinhSacToMatTruoc: 'Dính sắc tố mặt trước',
      viêmMu: 'Viêm mủ',
    },
  },
  dichKinh: {
    label: 'Dịch kính',
    checks: {
      sach: 'Sạch',
      tyndall: 'Tyndall',
      viêmMu: 'Viêm mủ',
      xuatHuyet: 'Xuất huyết',
      toChucHoa: 'Tổ chức hóa',
      bongDKSau: 'Bong dịch kính sau',
    },
  },
  vongMac: {
    label: 'Võng mạc',
    checks: {
      heMachBT: 'Hệ mạch BT',
      tacDM: 'Tắc ĐM',
      tacTM: 'Tắc TM',
      phu: 'Phù',
      thieuMau: 'Thiếu máu',
      tanMachVM: 'Tân mạch VM',
      diaThiPhu: 'Đĩa thị phù',
      diaThiTeo: 'Teo',
      hoangDiemBT: 'Hoàng điểm BT',
      bongVM: 'Bong VM',
      rachVM: 'Rách VM',
    },
  },
};

export default function ErmForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset, control } =
    useForm<FullErmFormData>({
      defaultValues: INITIAL_VALUES as FullErmFormData,
    });

  const formData = useWatch({ control });
  const rightEyeData = formData.rightEye;
  const leftEyeData = formData.leftEye;

  const handleSetAllNormal = () => {
    SECTION_KEYS.forEach((key) => {
      setValue(`rightEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
      setValue(`leftEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
    });
    toast.success('Đã thiết lập trạng thái: Tất cả bình thường');
  };

  const onSubmit = (data: FullErmFormData) => {
    console.log('Final ERM Data:', data);
    toast.success('Hồ sơ bệnh án đã được lưu!');
  };

  const handlePreviewPatient = () => {
    navigate('/erm-patient', { state: { formData: formData } });
  };

  const renderEyeCell = (
    eye: 'rightEye' | 'leftEye',
    field: string,
    idx: number
  ) => {
    const config = sectionConfig[field];
    const itemData = (eye === 'rightEye' ? rightEyeData : leftEyeData)?.[
      field
    ] as DetailedEyeItem;
    const isRight = eye === 'rightEye';

    return (
      <div
        className={`p-4 transition-all duration-300 ${itemData?.normal ? 'bg-white' : isRight ? 'bg-primary/5' : 'bg-rose-50'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-[11px] text-slate-800 uppercase tracking-tighter">
            {idx}. {config.label}
          </span>
          <button
            type="button"
            onClick={() =>
              setValue(`${eye}.${field}.normal`, !itemData?.normal)
            }
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm ${itemData?.normal ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {itemData?.normal ? 'Bình thường' : 'Bệnh lý'}
          </button>
        </div>

        {!itemData?.normal && (
          <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(config.checks).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary/20"
                    {...register(`${eye}.${field}.checks.${key}`)}
                  />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-primary transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              {...register(`${eye}.${field}.other`)}
              placeholder="Mô tả tổn thương..."
              className="w-full bg-white/50 border border-slate-200 p-2 rounded-lg text-[10px] font-medium outline-none focus:border-primary/50 min-h-[50px]"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans selection:bg-primary/20">
      {/* MODERN DYNAMIC HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-8 h-8 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">
              AURA <span className="text-primary">EMR</span>
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <MousePointer2 className="w-4 h-4" />
            Chế độ nhập liệu siêu tốc
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSetAllNormal}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl font-black text-[11px] hover:bg-emerald-500 hover:text-white transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> TẤT CẢ BÌNH THƯỜNG
          </button>
          <button
            onClick={handlePreviewPatient}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            <Eye className="w-4 h-4" /> XEM BẢN IN
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-black text-[11px] hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 transition-all"
          >
            <Save className="w-4 h-4" /> LƯU HỒ SƠ
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 grid grid-cols-12 gap-8">
        {/* LEFT SIDEBAR: PATIENT INFO & DIAGNOSIS */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Thông tin hành chính
              </h2>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                  Họ và tên bệnh nhân
                </label>
                <input
                  {...register('fullName')}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-3 rounded-xl outline-none font-bold uppercase text-slate-800 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                    Tuổi
                  </label>
                  <input
                    {...register('age')}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                    Giới tính
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold appearance-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                  Lý do vào viện
                </label>
                <textarea
                  {...register('admissionReason')}
                  className="w-full h-24 bg-slate-50 p-3 rounded-xl outline-none text-xs font-medium resize-none focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="text-[11px] font-black uppercase tracking-widest">
                  Chẩn đoán sau cùng
                </h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">
                    Bệnh chính
                  </label>
                  <input
                    {...register('finalDiagnosisMain')}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/50 p-3 rounded-xl outline-none text-xs font-bold uppercase transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">
                    Bệnh kèm theo
                  </label>
                  <input
                    {...register('finalDiagnosisExtra')}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-xs font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN AREA: SIDE-BY-SIDE EYE TABLE (MODERNIZED) */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tighter">
                III. Khám chuyên khoa mắt
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <TableIcon className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-600 uppercase">
                Bố cục bảng đối xứng
              </span>
            </div>
          </div>

          {/* VISION & PRESSURE - COMPACT BAR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
              <div className="px-3 py-1 bg-primary/10 rounded-lg font-black text-primary text-[10px]">
                MP
              </div>
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <label className="block text-[8px] font-black text-slate-400 uppercase">
                    Thị lực
                  </label>
                  <input
                    {...register('rightEyeVisionNoGlass')}
                    placeholder="V"
                    className="w-full font-black text-sm outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[8px] font-black text-slate-400 uppercase">
                    Nhãn áp
                  </label>
                  <input
                    {...register('rightEyePressure')}
                    placeholder="mmHg"
                    className="w-full font-black text-sm outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
              <div className="px-3 py-1 bg-rose-100 rounded-lg font-black text-rose-500 text-[10px]">
                MT
              </div>
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <label className="block text-[8px] font-black text-slate-400 uppercase">
                    Thị lực
                  </label>
                  <input
                    {...register('leftEyeVisionNoGlass')}
                    placeholder="V"
                    className="w-full font-black text-sm outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[8px] font-black text-slate-400 uppercase">
                    Nhãn áp
                  </label>
                  <input
                    {...register('leftEyePressure')}
                    placeholder="mmHg"
                    className="w-full font-black text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* THE MASTER TABLE */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50">
              <div className="p-4 text-center font-black text-xs uppercase tracking-widest text-slate-500">
                Mắt Phải (Right)
              </div>
              <div className="p-4 text-center font-black text-xs uppercase tracking-widest text-slate-500">
                Mắt Trái (Left)
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200 divide-y-reverse">
              <div className="divide-y divide-slate-100">
                {SECTION_KEYS.map((key, i) =>
                  renderEyeCell('rightEye', key, i + 1)
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {SECTION_KEYS.map((key, i) =>
                  renderEyeCell('leftEye', key, i + 1)
                )}
              </div>
            </div>
          </div>

          {/* SIGNATURE AREA */}
          <div className="flex justify-end p-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full max-w-sm">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">
                Bác sĩ khám
              </label>
              <input
                {...register('doctorName')}
                placeholder="Ký và ghi rõ họ tên"
                className="w-full text-center font-black text-lg text-slate-800 outline-none placeholder:text-slate-200"
              />
            </div>
          </div>
        </div>
      </main>

      {/* RESET BUTTON */}
      <button
        onClick={() => reset(INITIAL_VALUES as FullErmFormData)}
        className="fixed bottom-8 left-8 p-4 bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-lg border border-slate-200 transition-all hover:rotate-180 duration-500"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  );
}
