import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CheckCircle2, Save, Printer } from 'lucide-react';
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
  // Header
  khoa: string;
  giuong: string;
  soLuuTru: string;
  maYT: string;

  // I. Administrative
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

  // II. Patient Management
  admissionTime: string;
  admissionDate: string;
  admissionType: string;
  referralPlace: string;
  admissionReason: string;
  medicalHistory: string;
  personalHistory: string;
  familyHistory: string;

  // Vision & Pressure
  rightEyeVisionNoGlass: string;
  leftEyeVisionNoGlass: string;
  rightEyeVisionWithGlass: string;
  leftEyeVisionWithGlass: string;
  rightEyePressure: string;
  leftEyePressure: string;
  rightEyeField: string;
  leftEyeField: string;

  // Eye Exam Sections (1-9)
  rightEye: Record<string, DetailedEyeItem>;
  leftEye: Record<string, DetailedEyeItem>;

  // Extra Sections
  hocMatNormal: boolean;
  hocMatDetail: string;
  vanNhanNormal: boolean;
  vanNhanDetail: string;

  // General Health
  generalHealthNormal: boolean;
  generalHealthDetail: string;

  // Conclusion
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
  const { register, handleSubmit, setValue, reset, control } =
    useForm<FullErmFormData>({
      defaultValues: INITIAL_VALUES as FullErmFormData,
    });

  const rightEyeData = useWatch({ control, name: 'rightEye' });
  const leftEyeData = useWatch({ control, name: 'leftEye' });

  const handleSetAllNormal = () => {
    SECTION_KEYS.forEach((key) => {
      setValue(`rightEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
      setValue(`leftEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
    });
    setValue('hocMatNormal', true);
    setValue('vanNhanNormal', true);
    setValue('generalHealthNormal', true);
    toast.success('Thiết lập: Tất cả bình thường');
  };

  const onSubmit = (data: FullErmFormData) => {
    console.log('Final ERM Data:', data);
    toast.success('Hồ sơ bệnh án đã được lưu!');
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
      label: '1. Mi mắt',
      checks: { phuNe: 'Phù nề', phanUngTheMi: 'Phản ứng thể mi' },
      inputs: {},
    },
    ketMac: {
      label: '2. Kết mạc',
      checks: {
        cuongTuNong: 'Cương tụ nông',
        cuongTuSau: 'Cương tụ sâu',
        xuatHuyet: 'Xuất huyết',
        seoKM: 'Sẹo KM',
      },
      inputs: {},
    },
    giacMac: {
      label: '3. Giác mạc',
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
    cungMac: {
      label: '4. Củng mạc',
      checks: { seoCM: 'Sẹo CM' },
      inputs: {},
    },
    tienPhong: {
      label: '5. Tiền phòng',
      checks: {
        sauSach: 'Sâu sạch',
        xep: 'Xẹp',
        xuatHuyet: 'Xuất huyết',
        mu: 'Mủ, xuất tiết',
        tyndall: 'Tyndall',
        dinh: 'Dính',
        sacTo: 'Sắc tố',
        tanMach: 'Tân mạch',
      },
      inputs: {
        doXuatHuyet: 'Độ xh',
        mucDoMu: 'Mức độ mủ',
        doTyndall: 'Độ tyndall',
      },
    },
    mongMat: {
      label: '6. Mống mắt',
      checks: {
        thoaiHoa: 'Thoái hóa',
        tanMach: 'Tân mạch',
        koeppi: 'Hạt Koeppi',
        busaca: 'Hạt Busaca',
        tron: 'Tròn',
        meo: 'Méo',
        dinh: 'Dính',
        pxdt: 'PXĐT (Có)',
        pxdtKhong: 'PXĐT (Không)',
        gianLiet: 'Giãn liệt',
      },
      inputs: {
        anhDongTu: 'Ánh đồng tử',
        kichThuoc: 'Kích thước (mm)',
        viTriDinh: 'Vị trí dính',
      },
    },
    theThuyTinh: {
      label: '7. Thể thủy tinh',
      checks: {
        trong: 'Trong',
        duc: 'Đục',
        ducVo: 'Đục vỡ T3',
        saLech: 'Sa lệch',
        raTienPhong: 'Ra tiền phòng',
        vaoBuongDK: 'Vào buồng dịch kính',
        dinhSacTo: 'Dính sắc tố',
        viêmMu: 'Viêm mủ',
      },
      inputs: {},
    },
    dichKinh: {
      label: '8. Dịch kính',
      checks: {
        sach: 'Sạch',
        tyndall: 'Tyndall',
        viêmMu: 'Viêm mủ',
        xuatHuyet: 'Xuất huyết',
        toChucHoa: 'Tổ chức hóa',
        bongDKS: 'Bong dịch kính sau',
      },
      inputs: { doTyndall: 'Độ tyndall' },
    },
    vongMac: {
      label: '9. Võng mạc',
      checks: {
        machBinhThuong: 'Hệ mạch BT',
        tacDMTT: 'Tắc ĐMTT',
        tacDMnhanh: 'Tắc ĐM nhánh',
        tacDMmi: 'Tắc ĐM mi VM',
        tacTMTT: 'Tắc TMTT',
        tacTMnhanh: 'Tắc TM nhánh',
        phu: 'Phù',
        thieuMau: 'Thiếu máu',
        honHop: 'Hỗn hợp',
        viemMaoMach: 'Viêm mao mạch',
        tanMachVM: 'Tân mạch VM',
        tanMachHMcduoi: 'Tân mạch HM (dưới HĐ)',
        tanMachHMcngoai: 'Tân mạch HM (ngoài HĐ)',
        diaThiBT: 'Đĩa thị BT',
        diaThiPhu: 'Phù',
        diaThiTeo: 'Teo',
        diaThiBacMau: 'Bạc màu',
        tanMachGai: 'Tân mạch gai',
        hoangDiemBT: 'Hoàng điểm BT',
        matAnhHD: 'Mất ánh HĐ',
        phuKhuTru: 'Phù khu trú',
        phuToaLan: 'Phù tỏa lan',
        loLop: 'Lỗ lớp',
        giaLo: 'Giả lỗ',
        seoHD: 'Sẹo HĐ',
        chuBien: 'Thoái hóa chu biên',
        trungTam: 'Thoái hóa trung tâm',
        xhNong: 'XH nông',
        xhSau: 'XH sâu',
        xhHM: 'XH hắc mạc',
        xietCung: 'Xuất tiết cứng',
        xietBong: 'Xuất tiết bông',
        bongThanhDich: 'Bong thanh dịch',
        bongBMST: 'Bong BMST',
        hoatTinh: 'Viêm HM hoạt tính',
        seoHM: 'Sẹo HM',
        bongVM: 'Bong VM',
        rachVM: 'Rách VM',
      },
      inputs: {
        hinhThaiThoaiHoa: 'Hình thái thoái hóa',
        slViemHM: 'Số lượng ổ viêm',
        viTriHM: 'Vị trí HM',
        mucDoBong: 'Mức độ bong',
        slRach: 'Số lượng rách',
        viTriRach: 'Vị trí rách',
        hinhThaiRach: 'Hình thái rách',
      },
    },
  };

  const renderDetailedSection = (
    eye: 'rightEye' | 'leftEye',
    field: string
  ) => {
    const config = sectionConfig[field];
    const data = (eye === 'rightEye' ? rightEyeData : leftEyeData)?.[
      field
    ] as DetailedEyeItem;

    return (
      <div className="bg-white p-3 border border-slate-300 mb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-black text-xs">{config.label}</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-none border-slate-400 text-black focus:ring-0"
              {...register(`${eye}.${field}.normal`)}
              onChange={(e) => {
                if (e.target.checked) {
                  setValue(`${eye}.${field}.checks`, {});
                  setValue(`${eye}.${field}.other`, '');
                }
                setValue(`${eye}.${field}.normal`, e.target.checked);
              }}
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              BT
            </span>
          </label>
        </div>

        {!data?.normal && (
          <div className="space-y-2 mt-1 pl-3 border-l-2 border-slate-200 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(config.checks).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded-none border-slate-400 text-black"
                    {...register(`${eye}.${field}.checks.${key}`)}
                  />
                  <span className="text-[10px] text-slate-700 font-medium group-hover:text-black">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {Object.entries(config.inputs).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(config.inputs).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 shrink-0">
                      {label}:
                    </label>
                    <input
                      {...register(`${eye}.${field}.inputs.${key}`)}
                      className="flex-1 border-b border-slate-300 text-[10px] outline-none py-0.5 focus:border-black"
                    />
                  </div>
                ))}
              </div>
            )}
            <input
              {...register(`${eye}.${field}.other`)}
              placeholder="Ghi chú bệnh lý khác..."
              className="w-full border-b border-slate-300 text-[10px] outline-none py-1 focus:border-black"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20 font-sans text-slate-900 leading-relaxed">
      {/* TOOLBAR (COLORED BUTTONS) */}
      <div className="sticky top-0 z-50 bg-white/95 border-b border-slate-300 px-6 py-3 flex items-center justify-between shadow-sm no-print">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AURA" className="h-10 w-auto" />
          <div className="h-6 w-px bg-slate-300" />
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-600">
            Electronic Medical Record
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSetAllNormal}
            className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> TẤT CẢ BÌNH THƯỜNG
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-slate-700/20 hover:bg-slate-800 transition-all"
          >
            <Printer className="w-4 h-4" /> IN BỆNH ÁN
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <Save className="w-4 h-4" /> LƯU HỒ SƠ
          </button>
        </div>
      </div>

      {/* PAPER DOCUMENT (BLACK TEXT) */}
      <main className="max-w-[1000px] mx-auto my-6 bg-white shadow-xl p-12 border border-slate-300 space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-black">
          <div className="w-1/3">
            <img
              src="/logo.png"
              alt="AURA"
              className="h-16 w-auto object-contain"
            />
            <div className="mt-6 space-y-2 text-sm font-bold text-black">
              <div className="flex gap-2 items-center">
                Khoa:{' '}
                <input
                  {...register('khoa')}
                  className="border-b border-black w-full outline-none px-1"
                />
              </div>
              <div className="flex gap-2 items-center">
                Giường:{' '}
                <input
                  {...register('giuong')}
                  className="border-b border-black w-full outline-none px-1"
                />
              </div>
            </div>
          </div>
          <div className="w-1/3 text-center pt-2">
            <h1 className="text-3xl font-black uppercase text-black leading-none">
              Bệnh án mắt
            </h1>
            <p className="text-md font-bold mt-2 text-black">(Đáy mắt)</p>
          </div>
          <div className="w-1/3 text-right text-[11px] font-bold space-y-1.5 text-black">
            <p>MS: 23/BV-01</p>
            <p>Số lưu trữ: ....................</p>
            <p className="flex justify-end gap-1 items-center">
              Mã YT:{' '}
              <input
                {...register('maYT')}
                className="border-b border-black w-24 outline-none text-center"
              />
            </p>
          </div>
        </div>

        {/* I. HÀNH CHÍNH */}
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase border-b border-black text-black pb-1">
            I. Hành Chính
          </h2>
          <div className="grid grid-cols-12 gap-y-5 gap-x-6 text-[13px] font-bold text-black">
            <div className="col-span-8 flex gap-2 items-center">
              <span>1. Họ và tên:</span>
              <input
                {...register('fullName')}
                className="border-b border-black w-full outline-none uppercase font-black px-2 py-0.5"
              />
            </div>
            <div className="col-span-4 flex gap-2 items-center">
              <span>2. Ngày sinh:</span>
              <input
                {...register('birthDate')}
                placeholder="DD/MM/YYYY"
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
            <div className="col-span-3 flex gap-4 items-center">
              <span>3. Giới tính:</span>
              <label className="flex gap-1.5 items-center cursor-pointer">
                <input
                  type="radio"
                  value="Nam"
                  {...register('gender')}
                  className="w-4 h-4 text-black"
                />{' '}
                Nam
              </label>
              <label className="flex gap-1.5 items-center cursor-pointer">
                <input
                  type="radio"
                  value="Nữ"
                  {...register('gender')}
                  className="w-4 h-4 text-black"
                />{' '}
                Nữ
              </label>
            </div>
            <div className="col-span-5 flex gap-2 items-center">
              <span>4. Nghề nghiệp:</span>
              <input
                {...register('job')}
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
            <div className="col-span-4 flex gap-2 items-center">
              <span>5. Dân tộc:</span>
              <input
                {...register('ethnicity')}
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
            <div className="col-span-12 flex gap-2 items-center">
              <span>7. Địa chỉ:</span>
              <input
                {...register('address')}
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
            <div className="col-span-12 flex gap-4 items-center">
              <span>9. Đối tượng:</span>
              {['BHYT', 'Thu phí', 'Miễn', 'Khác'].map((obj, i) => (
                <label
                  key={obj}
                  className="flex gap-1.5 items-center uppercase text-[11px] cursor-pointer"
                >
                  <input
                    type="radio"
                    value={obj}
                    {...register('objectType')}
                    className="w-3.5 h-3.5 text-black"
                  />{' '}
                  {i + 1}. {obj}
                </label>
              ))}
            </div>
            <div className="col-span-12 flex gap-2 items-center">
              <span>11. Người báo tin:</span>
              <input
                {...register('relativeName')}
                className="border-b border-black w-full outline-none px-2"
              />
              <span className="ml-6 shrink-0">Số điện thoại:</span>
              <input
                {...register('relativePhone')}
                className="border-b border-black w-48 outline-none px-2"
              />
            </div>
          </div>
        </section>

        {/* II. QUẢN LÝ */}
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase border-b border-black text-black pb-1">
            II. Quản lý người bệnh
          </h2>
          <div className="grid grid-cols-1 gap-3 text-[13px] font-bold text-black border border-black p-5">
            <div className="flex gap-2 items-center">
              12. Vào viện lúc:{' '}
              <input
                {...register('admissionTime')}
                className="border-b border-black w-24 outline-none px-2 text-center"
              />{' '}
              ngày{' '}
              <input
                {...register('admissionDate')}
                className="border-b border-black w-36 outline-none px-2 text-center"
              />
            </div>
            <div className="flex gap-2 items-center">
              Lý do vào viện:{' '}
              <input
                {...register('admissionReason')}
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
            <div className="flex gap-2 items-center">
              Nơi giới thiệu:{' '}
              <input
                {...register('referralPlace')}
                className="border-b border-black w-full outline-none px-2"
              />
            </div>
          </div>
        </section>

        {/* III. KHÁM BỆNH */}
        <section className="space-y-8">
          <h2 className="text-xl font-black uppercase border-b border-black text-black pb-1">
            III. Khám bệnh
          </h2>

          <div className="border-2 border-black p-6 space-y-6">
            <h3 className="font-black text-center uppercase text-sm text-black">
              Thị lực & Nhãn áp vào viện
            </h3>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="font-black text-[12px] border-b border-black pb-1 text-black">
                  MẮT PHẢI (MP)
                </p>
                <div className="grid grid-cols-1 gap-3 text-[12px] font-bold text-black">
                  <div className="flex gap-2 items-center">
                    Không kính:{' '}
                    <input
                      {...register('rightEyeVisionNoGlass')}
                      className="border-b border-black flex-1 text-center font-black"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    Có kính:{' '}
                    <input
                      {...register('rightEyeVisionWithGlass')}
                      className="border-b border-black flex-1 text-center font-black"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    Nhãn áp:{' '}
                    <input
                      {...register('rightEyePressure')}
                      className="border-b border-black w-24 text-center font-black"
                    />{' '}
                    mmHg
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-black text-[12px] border-b border-black pb-1 text-black">
                  MẮT TRÁI (MT)
                </p>
                <div className="grid grid-cols-1 gap-3 text-[12px] font-bold text-black">
                  <div className="flex gap-2 items-center">
                    Không kính:{' '}
                    <input
                      {...register('leftEyeVisionNoGlass')}
                      className="border-b border-black flex-1 text-center font-black"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    Có kính:{' '}
                    <input
                      {...register('leftEyeVisionWithGlass')}
                      className="border-b border-black flex-1 text-center font-black"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    Nhãn áp:{' '}
                    <input
                      {...register('leftEyePressure')}
                      className="border-b border-black w-24 text-center font-black"
                    />{' '}
                    mmHg
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED EXAM */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="bg-slate-900 text-white py-1.5 px-6 font-black uppercase text-[12px] tracking-widest">
                Mắt phải (MP) - Chi tiết lâm sàng
              </div>
              <div className="grid grid-cols-1">
                {SECTION_KEYS.map((key) =>
                  renderDetailedSection('rightEye', key)
                )}
                <div className="border border-slate-300 p-4 text-[12px] font-bold text-black flex gap-6 items-center mt-[-1px] bg-slate-50">
                  <span className="uppercase">10. Hốc mắt & Vận nhãn:</span>
                  <div className="flex gap-4">
                    <label className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('hocMatNormal')}
                        className="w-4 h-4 text-black"
                      />{' '}
                      Bình thường
                    </label>
                  </div>
                  {!useWatch({ control, name: 'hocMatNormal' }) && (
                    <input
                      {...register('hocMatDetail')}
                      className="border-b border-slate-400 flex-1 outline-none font-medium px-2 py-0.5"
                      placeholder="Mô tả bệnh lý..."
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900 text-white py-1.5 px-6 font-black uppercase text-[12px] tracking-widest">
                Mắt trái (MT) - Chi tiết lâm sàng
              </div>
              <div className="grid grid-cols-1">
                {SECTION_KEYS.map((key) =>
                  renderDetailedSection('leftEye', key)
                )}
                <div className="border border-slate-300 p-4 text-[12px] font-bold text-black flex gap-6 items-center mt-[-1px] bg-slate-50">
                  <span className="uppercase">10. Hốc mắt & Vận nhãn:</span>
                  <div className="flex gap-4">
                    <label className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('vanNhanNormal')}
                        className="w-4 h-4 text-black"
                      />{' '}
                      Bình thường
                    </label>
                  </div>
                  {!useWatch({ control, name: 'vanNhanNormal' }) && (
                    <input
                      {...register('vanNhanDetail')}
                      className="border-b border-slate-400 flex-1 outline-none font-medium px-2 py-0.5"
                      placeholder="Mô tả bệnh lý..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <section className="space-y-8 pt-8 border-t-2 border-black">
          <div className="grid grid-cols-1 gap-6 text-[13px] text-black">
            <div className="space-y-2">
              <label className="font-black uppercase block">
                IV. Các xét nghiệm cần làm:
              </label>
              <textarea
                {...register('testsNeeded')}
                className="w-full h-20 border border-slate-300 p-4 outline-none resize-none font-medium focus:border-black transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase block">
                V. Tóm tắt bệnh án:
              </label>
              <textarea
                {...register('summary')}
                className="w-full h-32 border border-slate-300 p-4 outline-none resize-none font-medium focus:border-black transition-colors"
              />
            </div>
            <div className="border border-black p-6 space-y-4 bg-slate-50/50">
              <label className="font-black uppercase block border-b border-slate-300 pb-2">
                VI. Chẩn đoán:
              </label>
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  <span className="font-bold shrink-0">- Bệnh chính:</span>
                  <input
                    {...register('finalDiagnosisMain')}
                    className="flex-1 border-b border-slate-400 outline-none font-black text-lg py-1 focus:border-black"
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-bold shrink-0">- Bệnh kèm:</span>
                  <input
                    {...register('finalDiagnosisExtra')}
                    className="flex-1 border-b border-slate-400 outline-none font-medium py-1 focus:border-black"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-black uppercase shrink-0">
                VII. Tiên lượng:
              </span>
              <input
                {...register('prognosis')}
                className="flex-1 border-b border-slate-400 outline-none font-medium py-1 focus:border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase block">
                VIII. Điều trị:
              </label>
              <textarea
                {...register('treatmentPlan')}
                className="w-full h-20 border border-slate-300 p-4 outline-none resize-none font-medium focus:border-black transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col items-end pt-8">
            <p className="text-xs mb-2 font-bold italic">
              Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{' '}
              {new Date().getFullYear()}
            </p>
            <div className="text-center w-64 pt-4">
              <p className="font-black uppercase text-xs mb-20">
                Bác sỹ làm bệnh án
              </p>
              <input
                {...register('doctorName')}
                className="w-full text-center font-black uppercase text-sm outline-none border-b border-black py-1"
                placeholder="Họ và tên bác sỹ"
              />
            </div>
          </div>
        </section>
      </main>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { border: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; }
          input, textarea { border-color: black !important; }
        }
      `}</style>
    </div>
  );
}
