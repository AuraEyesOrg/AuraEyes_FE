import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Save,
  Eye,
  Activity,
  RotateCcw,
  Stethoscope,
  User,
  Zap,
  FileText,
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
  hocMatNormal: boolean;
  hocMatDetail: string;
  vanNhanNormal: boolean;
  vanNhanDetail: string;
  generalHealthNormal: boolean;
  generalHealthDetail: string;
  testsNeeded: string;
  summary: string;
  finalDiagnosisMain: string;
  finalDiagnosisExtra: string;
  finalDiagnosisDiff: string;
  prognosis: string;
  treatmentPlan: string;
  doctorName: string;
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
  hocMatNormal: true,
  vanNhanNormal: true,
  generalHealthNormal: true,
  doctorName: '',
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
    setValue('hocMatNormal', true);
    setValue('vanNhanNormal', true);
    setValue('generalHealthNormal', true);
    toast.success('Đã thiết lập trạng thái: Tất cả bình thường');
  };

  const onSubmit = (data: FullErmFormData) => {
    console.log('Final ERM Data:', data);
    toast.success('Hồ sơ bệnh án đã được lưu!');
  };

  const handlePreviewPatient = () => {
    navigate('/erm-patient', { state: { formData: formData } });
  };

  const sectionConfig: Record<
    string,
    {
      label: string;
      checks: Record<string, string>;
      inputs: Record<string, string>;
    }
  > = {
    miMat: {
      label: 'Mi mắt',
      checks: { phuNe: 'Phù nề', phanUngTheMi: 'Phản ứng thể mi' },
      inputs: {},
    },
    ketMac: {
      label: 'Kết mạc',
      checks: {
        cuongTuNong: 'Cương tụ nông',
        cuongTuSau: 'Cương tụ sâu',
        xuatHuyet: 'Xuất huyết',
        seoKM: 'Sẹo KM',
      },
      inputs: {},
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
      inputs: { viTriTua: 'Vị trí tủa' },
    },
    cungMac: { label: 'Củng mạc', checks: { seoCM: 'Sẹo CM' }, inputs: {} },
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
      inputs: { doXuatHuyet: 'Độ', mucDoMu: 'Mức độ', doTyndall: 'Độ' },
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
      inputs: {
        anhDongTu: 'Ánh đồng tử',
        kichThuoc: 'Kích thước',
        viTriDinh: 'Vị trí dính',
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
      inputs: {},
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
      inputs: { doTyndall: 'Độ' },
    },
    vongMac: {
      label: 'Võng mạc',
      checks: {
        heMachBinhThuong: 'Hệ mạch: Bình thường',
        tacDMTrungTam: 'Tắc ĐM : trung tâm',
        tacDMNhanh: 'Tắc ĐM : nhánh',
        tacDMmiVM: 'Tắc ĐM : mi VM',
        tacTMTrungTam: 'Tắc TM : trung tâm',
        tacTMNhanh: 'Tắc TM : nhánh',
        phu: 'phù',
        thieuMau: 'thiếu máu',
        honHop: 'hỗn hợp',
        viemMaoMach: 'Viêm mao mạch',
        tanMachVM: 'Tân mạch võng mạc',
        tanMachHMcDuoi: 'Tân mạch hắc mạc: dưới HĐ',
        tanMachHMcNgoai: 'Tân mạch hắc mạc: ngoài HĐ',
        diaThiBT: 'Đĩa thị: Bình thường',
        diaThiPhu: 'Phù',
        diaThiTeo: 'Teo',
        diaThiBacMau: 'Bạc màu',
        tanMachGai: 'Tân mạch gai',
        hoangDiemBT: 'Hoàng điểm: Bình thường',
        matAnhHD: 'Mất ánh HĐ',
        phuKhuTru: 'Phù : Khu trú',
        phuToaLan: 'Phù : Tỏa lan',
        loLop: 'lỗ lớp',
        giaLo: 'giả lỗ',
        seoHDco: 'Sẹo HĐ có',
        seoHDkhong: 'Sẹo HĐ không',
        thoaiHoaVMChuBien: 'Thoái hóa VM: chu biên',
        thoaiHoaVMTrungTam: 'Thoái hóa VM: trung tâm',
        xhVMNong: 'Xuất huyết: VM nông',
        xhVMSau: 'Xuất huyết: VM sâu',
        xhHM: 'Xuất huyết: Hắc mạc',
        xietCung: 'Xuất tiết : Cứng',
        xietDangBong: 'Xuất tiết : Dạng bông',
        bongThanhDich: 'Bong thanh dịch',
        bongBMST: 'Bong BMST',
        hoatTinh: 'Hoạt tính',
        seoHM: 'Sẹo',
        bongVM: 'Bong võng mạc',
        rachVM: 'Rách võng mạc',
      },
      inputs: {
        doLo: 'Độ',
        hinhThaiThoaiHoa: 'Hình thái thoái hóa',
        slViemHM: 'Số lượng',
        viTriHM: 'Vị trí',
        mucDoBong: 'Mức độ',
        slRach: 'Số lượng',
        viTriRach: 'Vị trí vết rách',
        hinhThaiRach: 'Hình thái',
      },
    },
  };

  const renderSection = (eye: 'rightEye' | 'leftEye', field: string) => {
    const config = sectionConfig[field];
    const itemData = (eye === 'rightEye' ? rightEyeData : leftEyeData)?.[
      field
    ] as DetailedEyeItem;

    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-slate-800 text-xs">
            {config.label}
          </span>
          <button
            type="button"
            onClick={() =>
              setValue(`${eye}.${field}.normal`, !itemData?.normal)
            }
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${itemData?.normal ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
          >
            {itemData?.normal ? 'Bình thường' : 'Bệnh lý'}
          </button>
        </div>

        {!itemData?.normal && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(config.checks).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white hover:border-primary/30 transition-all"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded border-slate-300"
                    {...register(`${eye}.${field}.checks.${key}`)}
                  />
                  <span className="text-[10px] font-bold text-slate-600">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              {...register(`${eye}.${field}.other`)}
              placeholder="Mô tả chi tiết tổn thương..."
              className="w-full bg-slate-50 border-none p-3 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-primary/20 min-h-[60px]"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* HEADER NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AURA" className="h-10" />
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-xs">
            <Zap className="w-4 h-4 fill-primary" />
            Doctor Speed Input
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviewPatient}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-black transition-all"
          >
            <Eye className="w-4 h-4" /> BẢN IN BỆNH NHÂN
          </button>
          <button
            onClick={handleSetAllNormal}
            className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" /> TẤT CẢ BÌNH THƯỜNG
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-2xl font-black text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" /> LƯU HỒ SƠ
          </button>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto p-10 grid grid-cols-12 gap-10">
        {/* LEFT COLUMN: I. HÀNH CHÍNH & II. QUẢN LÝ */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-900 p-2 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                I. Hành chính & II. Quản lý
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Họ và tên
                </label>
                <input
                  {...register('fullName')}
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold uppercase text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ngày sinh
                  </label>
                  <input
                    {...register('birthDate')}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Giới tính
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-bold"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Mã YT
                  </label>
                  <input
                    {...register('maYT')}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vào khoa
                  </label>
                  <input
                    {...register('khoa')}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Lý do vào viện
                </label>
                <textarea
                  {...register('admissionReason')}
                  className="w-full h-24 bg-slate-50 p-4 rounded-2xl outline-none text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 p-2 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest">
                III. Chẩn đoán ra viện
              </h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Bệnh chính (tổn thương)
                </label>
                <input
                  {...register('finalDiagnosisMain')}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-sm font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Bệnh kèm theo
                </label>
                <input
                  {...register('finalDiagnosisExtra')}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: III. KHÁM BỆNH (SIDE BY SIDE) */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tighter">
              III. Khám chuyên khoa mắt
            </h2>
          </div>

          {/* VISION & PRESSURE */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Thị lực & Nhãn áp MP
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register('rightEyeVisionNoGlass')}
                  placeholder="V (không kính)"
                  className="bg-slate-50 p-3 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-primary/20"
                />
                <input
                  {...register('rightEyePressure')}
                  placeholder="Nhãn áp"
                  className="bg-slate-50 p-3 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Thị lực & Nhãn áp MT
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register('leftEyeVisionNoGlass')}
                  placeholder="V (không kính)"
                  className="bg-slate-50 p-3 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-rose-500/20"
                />
                <input
                  {...register('leftEyePressure')}
                  placeholder="Nhãn áp"
                  className="bg-slate-50 p-3 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-rose-500/20"
                />
              </div>
            </div>
          </div>

          {/* PATHOLOGY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mắt phải
                </span>
              </div>
              {SECTION_KEYS.map((key) => renderSection('rightEye', key))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mắt trái
                </span>
              </div>
              {SECTION_KEYS.map((key) => renderSection('leftEye', key))}
            </div>
          </div>

          {/* DOCTOR NAME */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="max-w-md ml-auto space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Bác sĩ làm bệnh án
              </label>
              <input
                {...register('doctorName')}
                placeholder="Họ và tên bác sĩ..."
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-black text-slate-800 text-center"
              />
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => reset(INITIAL_VALUES as FullErmFormData)}
        className="fixed bottom-10 right-10 p-5 bg-white text-slate-300 hover:text-rose-500 rounded-full shadow-2xl border border-slate-200 transition-all active:scale-95 group"
      >
        <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  );
}
