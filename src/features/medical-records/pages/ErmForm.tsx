import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Save,
  Eye,
  Activity,
  User,
  FileText,
  Lock,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/auth-store';
import { MedicalRecordStatus } from '../api/medical-record.api';
import {
  useMedicalRecord,
  useUpdateDiagnosis,
  useFinalizeRecord,
  useStartConsultation,
  useUpdateAdministrative,
} from '../hooks/useMedicalRecords';

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
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthStore();

  const [recordStatus, setRecordStatus] = React.useState<MedicalRecordStatus>(
    MedicalRecordStatus.Draft
  );

  // Custom Hooks
  const { data: record, isLoading: isLoadingRecord } = useMedicalRecord(
    id || ''
  );
  const updateDiagnosisMutation = useUpdateDiagnosis();
  const finalizeMutation = useFinalizeRecord();
  const startConsultationMutation = useStartConsultation();
  const updateAdministrativeMutation = useUpdateAdministrative();

  // Role Detection
  const isOphthalmologist = user?.roles.includes('Ophthalmologist');
  const isStaff = user?.roles.includes('ClinicStaff');
  const isFinalizer = user?.permissions?.includes('medical-records:finalize');

  const { register, handleSubmit, setValue, reset, control } =
    useForm<FullErmFormData>({
      defaultValues: INITIAL_VALUES as FullErmFormData,
    });

  // Auto-transition to DoctorFilling if opened by Doctor
  useEffect(() => {
    if (
      id &&
      isOphthalmologist &&
      (recordStatus === MedicalRecordStatus.Draft ||
        recordStatus === MedicalRecordStatus.ClinicFilling)
    ) {
      startConsultationMutation.mutate(id);
    }
  }, [id, isOphthalmologist, recordStatus]);

  useEffect(() => {
    if (record) {
      const adminData = JSON.parse(record.administrativeDataJson || '{}');
      const clinicalData = JSON.parse(record.clinicalDataJson || '{}');

      reset({
        ...adminData,
        ...clinicalData,
        finalDiagnosisMain: record.finalDiagnosis,
        finalDiagnosisExtra: record.treatmentPlan,
      });
      setRecordStatus(record.status as MedicalRecordStatus);
    } else if (location.state?.formData) {
      const incoming = location.state.formData;
      Object.keys(incoming).forEach((key) => {
        setValue(key as keyof FullErmFormData, incoming[key]);
      });
    }
  }, [record, location.state, reset, setValue]);

  const formData = useWatch({ control });
  const rightEyeData = formData.rightEye;
  const leftEyeData = formData.leftEye;

  const handleSetAllNormal = () => {
    if (isStaff && !isOphthalmologist) return;
    SECTION_KEYS.forEach((key) => {
      setValue(`rightEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
      setValue(`leftEye.${key}`, JSON.parse(JSON.stringify(INITIAL_ITEM)));
    });
    toast.success('Đã thiết lập trạng thái: Tất cả bình thường');
  };

  const onSubmit = async (data: FullErmFormData) => {
    // Basic validation for required fields
    const missingFields: string[] = [];
    if (!data.fullName) missingFields.push('Họ tên');
    if (!data.age) missingFields.push('Tuổi');
    if (!data.admissionReason) missingFields.push('Lý do vào viện');
    if (isOphthalmologist && !data.finalDiagnosisMain)
      missingFields.push('Chẩn đoán chính');

    if (missingFields.length > 0) {
      toast.error(
        `Vui lòng điền các trường bắt buộc: ${missingFields.join(', ')}`
      );
      return;
    }

    if (!id) {
      toast.warning('Vui lòng tạo hồ sơ từ luồng tiếp nhận/check-in');
      return;
    }

    if (isStaff && !isOphthalmologist) {
      // Clinic Staff saving administrative data
      const adminData = {
        khoa: data.khoa,
        giuong: data.giuong,
        soLuuTru: data.soLuuTru,
        maYT: data.maYT,
        fullName: data.fullName,
        birthDate: data.birthDate,
        age: data.age,
        gender: data.gender,
        job: data.job,
        ethnicity: data.ethnicity,
        nationality: data.nationality,
        address: data.address,
        workplace: data.workplace,
        objectType: data.objectType,
        bhytExpiry: data.bhytExpiry,
        bhytNumber: data.bhytNumber,
        relativeName: data.relativeName,
        relativePhone: data.relativePhone,
        admissionTime: data.admissionTime,
        admissionDate: data.admissionDate,
        admissionType: data.admissionType,
        referralPlace: data.referralPlace,
        admissionReason: data.admissionReason,
      };

      updateAdministrativeMutation.mutate({
        id,
        data: { administrativeDataJson: JSON.stringify(adminData) },
      });
    } else if (isOphthalmologist) {
      // Doctor saving clinical data
      const clinicalData = {
        medicalHistory: data.medicalHistory,
        personalHistory: data.personalHistory,
        familyHistory: data.familyHistory,
        rightEyeVisionNoGlass: data.rightEyeVisionNoGlass,
        leftEyeVisionNoGlass: data.leftEyeVisionNoGlass,
        rightEyeVisionWithGlass: data.rightEyeVisionWithGlass,
        leftEyeVisionWithGlass: data.leftEyeVisionWithGlass,
        rightEyePressure: data.rightEyePressure,
        leftEyePressure: data.leftEyePressure,
        rightEyeField: data.rightEyeField,
        leftEyeField: data.leftEyeField,
        rightEye: data.rightEye,
        leftEye: data.leftEye,
      };

      updateDiagnosisMutation.mutate({
        id,
        data: {
          clinicalData: clinicalData,
          finalDiagnosis: data.finalDiagnosisMain,
          treatmentPlan: data.finalDiagnosisExtra,
        },
      });
    }
  };

  const handleFinalize = async () => {
    if (!id) return;
    try {
      await finalizeMutation.mutateAsync(id);
      toast.success('Đã khóa hồ sơ thành công');
    } catch (error) {
      toast.error('Lỗi khi khóa hồ sơ');
      console.error(error);
    }
  };

  const handlePreviewPatient = () => {
    if (id) {
      navigate(`/medical-records/patient/${id}`);
    } else {
      // For new records, pass current form data in state
      navigate('/medical-records/patient/new', {
        state: { formData: formData },
      });
    }
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
    const disabled = isStaff && !isOphthalmologist;

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
            disabled={disabled}
            onClick={() =>
              setValue(`${eye}.${field}.normal`, !itemData?.normal)
            }
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${itemData?.normal ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
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
                  className={`flex items-center gap-2 group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
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
              disabled={disabled}
              placeholder="Mô tả tổn thương..."
              className="w-full bg-white/50 border border-slate-200 p-2 rounded-lg text-[10px] font-medium outline-none focus:border-primary/50 min-h-[50px] disabled:opacity-50"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary/20 pb-20">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-8 h-8 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">
              AURA <span className="text-primary">EMR</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOphthalmologist && (
            <button
              onClick={handleSetAllNormal}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl font-black text-[11px] hover:bg-emerald-500 hover:text-white transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> TẤT CẢ BÌNH THƯỜNG
            </button>
          )}
          <button
            onClick={handlePreviewPatient}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            <Eye className="w-4 h-4" /> XEM BẢN IN
          </button>
          {isFinalizer && (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 bg-rose-500 text-white px-8 py-2.5 rounded-xl font-black text-[11px] hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/20 transition-all"
            >
              <Lock className="w-4 h-4" /> KHÓA HỒ SƠ
            </button>
          )}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={
              updateDiagnosisMutation.isPending ||
              updateAdministrativeMutation.isPending ||
              recordStatus === MedicalRecordStatus.Locked
            }
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-black text-[11px] hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
          >
            {updateDiagnosisMutation.isPending ||
            updateAdministrativeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {id ? 'CẬP NHẬT HỒ SƠ' : 'LƯU HỒ SƠ'}
          </button>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto p-8 space-y-10">
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <img
            src="/logo.png"
            alt="AURA Logo"
            className="h-16 w-auto object-contain"
          />
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-800">
            Hồ sơ bệnh án mắt
          </h1>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                I. Thông tin hành chính
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Họ và tên bệnh nhân
                </label>
                <input
                  {...register('fullName')}
                  disabled={isOphthalmologist}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl outline-none font-bold uppercase text-slate-800 transition-all disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Tuổi
                  </label>
                  <input
                    {...register('age')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Giới tính
                  </label>
                  <select
                    {...register('gender')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold appearance-none disabled:opacity-50"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Lý do vào viện
              </label>
              <textarea
                {...register('admissionReason')}
                disabled={isOphthalmologist}
                className="w-full h-32 bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium resize-none focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="p-10 border-b border-slate-50 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                II. Khám chuyên khoa mắt
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-8 border border-slate-100">
                <div className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs">
                  MP
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      Thị lực
                    </label>
                    <input
                      {...register('rightEyeVisionNoGlass')}
                      disabled={isStaff && !isOphthalmologist}
                      placeholder="V"
                      className="bg-transparent font-black text-lg outline-none w-full disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      Nhãn áp
                    </label>
                    <input
                      {...register('rightEyePressure')}
                      disabled={isStaff && !isOphthalmologist}
                      placeholder="mmHg"
                      className="bg-transparent font-black text-lg outline-none w-full disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-8 border border-slate-100">
                <div className="px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-xs">
                  MT
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      Thị lực
                    </label>
                    <input
                      {...register('leftEyeVisionNoGlass')}
                      disabled={isStaff && !isOphthalmologist}
                      placeholder="V"
                      className="bg-transparent font-black text-lg outline-none w-full disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      Nhãn áp
                    </label>
                    <input
                      {...register('leftEyePressure')}
                      disabled={isStaff && !isOphthalmologist}
                      placeholder="mmHg"
                      className="bg-transparent font-black text-lg outline-none w-full disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100">
                <div className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-500">
                  Mắt Phải (Right)
                </div>
                <div className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-500">
                  Mắt Trái (Left)
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="divide-y divide-slate-50">
                  {SECTION_KEYS.map((key, i) =>
                    renderEyeCell('rightEye', key, i + 1)
                  )}
                </div>
                <div className="divide-y divide-slate-50">
                  {SECTION_KEYS.map((key, i) =>
                    renderEyeCell('leftEye', key, i + 1)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 space-y-8 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white/40">
                III. Chẩn đoán sau cùng
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase ml-1">
                  Bệnh chính
                </label>
                <input
                  {...register('finalDiagnosisMain')}
                  disabled={isStaff && !isOphthalmologist}
                  placeholder="Nhập chẩn đoán xác định..."
                  className="w-full bg-white/5 border-2 border-white/10 focus:border-primary/50 p-4 rounded-2xl outline-none font-bold uppercase text-white transition-all disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase ml-1">
                  Bệnh kèm theo (nếu có)
                </label>
                <input
                  {...register('finalDiagnosisExtra')}
                  disabled={isStaff && !isOphthalmologist}
                  placeholder="Nhập bệnh phụ hoặc ghi chú..."
                  className="w-full bg-white/5 border-2 border-white/10 p-4 rounded-2xl outline-none font-medium text-white transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Mã lưu trữ: {formData.soLuuTru || '---'} | MS: 23/BV-01
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg w-full max-w-sm text-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
              Bác sĩ điều trị
            </label>
            <input
              {...register('doctorName')}
              disabled={isStaff && !isOphthalmologist}
              placeholder="Họ và tên bác sĩ"
              className="w-full text-center font-black text-xl text-slate-800 outline-none bg-transparent placeholder:text-slate-100 disabled:opacity-50"
            />
          </div>
        </div>
      </main>

      {!isFinalizer && (
        <button
          onClick={() => reset(INITIAL_VALUES as FullErmFormData)}
          className="fixed bottom-8 left-8 p-4 bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-xl border border-slate-100 transition-all hover:rotate-180 duration-500 z-40"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
