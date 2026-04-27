import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Save,
  Eye,
  Activity,
  User,
  Lock,
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
 * EMR FORM DATA
 */
interface FullEmrFormData {
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

const INITIAL_VALUES: Partial<FullEmrFormData> = {
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
    MedicalRecordStatus.DraftAdmin
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
    useForm<FullEmrFormData>({
      defaultValues: INITIAL_VALUES as FullEmrFormData,
    });

  // Auto-transition to DoctorFilling if opened by Doctor
  useEffect(() => {
    if (
      id &&
      isOphthalmologist &&
      recordStatus === MedicalRecordStatus.DraftAdmin
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
        setValue(key as keyof FullEmrFormData, incoming[key]);
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

  const onSubmit = async (data: FullEmrFormData) => {
    const missingFields: string[] = [];

    // 1. Validate Administrative Data (Clinic Staff / Doctor)
    if (!data.fullName) missingFields.push('Họ tên');
    if (!data.age) missingFields.push('Tuổi');
    if (!data.gender) missingFields.push('Giới tính');
    if (!data.address) missingFields.push('Địa chỉ');
    if (!data.admissionReason) missingFields.push('Lý do vào viện');
    if (!data.admissionDate) missingFields.push('Ngày vào viện');

    // 2. Validate Clinical Data (Doctor Only)
    if (isOphthalmologist) {
      if (!data.medicalHistory) missingFields.push('Tiền sử bệnh');
      if (!data.rightEyeVisionNoGlass || !data.leftEyeVisionNoGlass)
        missingFields.push('Thị lực (MP/MT)');
      if (!data.rightEyePressure || !data.leftEyePressure)
        missingFields.push('Nhãn áp (MP/MT)');
      if (!data.finalDiagnosisMain) missingFields.push('Chẩn đoán chính');
      if (!data.doctorName) missingFields.push('Tên bác sĩ');

      // Validate pathological details
      SECTION_KEYS.forEach((key) => {
        if (
          data.rightEye?.[key] &&
          !data.rightEye[key].normal &&
          !data.rightEye[key].other
        ) {
          missingFields.push(
            `Mô tả bệnh lý Mắt Phải - ${sectionConfig[key].label}`
          );
        }
        if (
          data.leftEye?.[key] &&
          !data.leftEye[key].normal &&
          !data.leftEye[key].other
        ) {
          missingFields.push(
            `Mô tả bệnh lý Mắt Trái - ${sectionConfig[key].label}`
          );
        }
      });
    }

    if (missingFields.length > 0) {
      toast.error(
        <div className="space-y-1">
          <p className="font-bold">Vui lòng điền đầy đủ các thông tin:</p>
          <ul className="list-disc list-inside text-[10px]">
            {missingFields.slice(0, 5).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
            {missingFields.length > 5 && (
              <li>...và {missingFields.length - 5} trường khác</li>
            )}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

    if (!id) {
      toast.warning('Vui lòng tạo hồ sơ từ luồng tiếp nhận/check-in');
      return;
    }

    try {
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

        await updateAdministrativeMutation.mutateAsync({
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

        await updateDiagnosisMutation.mutateAsync({
          id,
          data: {
            clinicalDataJson: JSON.stringify(clinicalData),
            finalDiagnosis: data.finalDiagnosisMain,
            treatmentPlan: data.finalDiagnosisExtra,
          },
        });
      }
      toast.success('Hồ sơ đã được lưu thành công');
    } catch (err) {
      // Errors are handled by mutation callbacks or global error handler
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

  const [activeStep, setActiveStep] = React.useState<'admin' | 'clinical'>(
    isOphthalmologist ? 'clinical' : 'admin'
  );

  const canProceedToAi =
    recordStatus === MedicalRecordStatus.PendingClinical ||
    recordStatus === MedicalRecordStatus.Finalized;

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
        className={`p-6 transition-all duration-500 ${
          itemData?.normal
            ? 'bg-transparent'
            : isRight
              ? 'bg-primary/5'
              : 'bg-rose-50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-[11px] text-slate-800 uppercase tracking-tighter">
            {idx}. {config.label}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              setValue(`${eye}.${field}.normal`, !itemData?.normal)
            }
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
            } ${itemData?.normal ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {itemData?.normal ? 'Bình thường' : 'Bệnh lý'}
          </button>
        </div>

        {!itemData?.normal && (
          <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-500">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(config.checks).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 group px-3 py-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
                    className="w-4 h-4 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all"
                    {...register(`${eye}.${field}.checks.${key}`)}
                  />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              {...register(`${eye}.${field}.other`)}
              disabled={disabled}
              placeholder="Nhập mô tả chi tiết tổn thương..."
              className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-[11px] font-medium outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 min-h-[80px] disabled:opacity-50 transition-all"
            />
          </div>
        )}
      </div>
    );
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveStep('admin')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeStep === 'admin' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <User className="w-4 h-4" /> 1. HÀNH CHÍNH
        </button>
        <button
          onClick={() => isOphthalmologist && setActiveStep('clinical')}
          disabled={!isOphthalmologist}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeStep === 'clinical' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-300 cursor-not-allowed hover:bg-slate-50'}`}
        >
          <Activity className="w-4 h-4" /> 2. KHÁM LÂM SÀNG
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 font-sans selection:bg-primary/20 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="AURA"
              className="h-8 w-auto object-contain"
            />
            <span className="font-black text-xl tracking-tighter text-slate-900">
              AURA
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              recordStatus === MedicalRecordStatus.Finalized
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            Trạng thái: {recordStatus}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeStep === 'clinical' && isOphthalmologist && (
            <button
              onClick={handleSetAllNormal}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl font-black text-[11px] hover:bg-emerald-500 hover:text-white transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> BÌNH THƯỜNG HẾT
            </button>
          )}

          <button
            onClick={() => navigate(`/retinal-processing/${id}`)}
            disabled={!canProceedToAi}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[11px] transition-all ${
              canProceedToAi
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Activity className="w-4 h-4" /> XỬ LÝ ẢNH AI
          </button>

          <button
            onClick={handlePreviewPatient}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl font-black text-[11px] hover:bg-slate-200 transition-all"
          >
            <Eye className="w-4 h-4" /> BẢN IN
          </button>

          {isFinalizer && recordStatus !== MedicalRecordStatus.Finalized && (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 bg-rose-500 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/20 transition-all"
            >
              <Lock className="w-4 h-4" /> KHÓA
            </button>
          )}

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={
              updateDiagnosisMutation.isPending ||
              updateAdministrativeMutation.isPending ||
              recordStatus === MedicalRecordStatus.Finalized
            }
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-2xl font-black text-[11px] hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {id ? 'CẬP NHẬT' : 'LƯU'}
          </button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-8">
        <div className="flex flex-col items-center justify-center space-y-4 pt-4 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-800">
            Hồ sơ bệnh án điện tử
          </h1>
          <div className="w-12 h-1 bg-primary rounded-full" />
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {activeStep === 'admin' ? (
            <div className="p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Họ và tên
                  </label>
                  <input
                    {...register('fullName')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl outline-none font-bold uppercase text-slate-800 transition-all disabled:opacity-50"
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Địa chỉ
                  </label>
                  <input
                    {...register('address')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Nghề nghiệp
                  </label>
                  <input
                    {...register('job')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium disabled:opacity-50"
                  />
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

              {!isOphthalmologist && (
                <div className="flex justify-end pt-8">
                  <button
                    type="button"
                    onClick={() => setActiveStep('clinical')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-black/10"
                  >
                    TIẾP THEO <Activity className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 bg-primary text-white font-black text-xs rounded-bl-2xl">
                    MẮT PHẢI
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Thị lực
                      </label>
                      <input
                        {...register('rightEyeVisionNoGlass')}
                        placeholder="V"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-xl text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Nhãn áp
                      </label>
                      <input
                        {...register('rightEyePressure')}
                        placeholder="mmHg"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-xl text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 bg-rose-500 text-white font-black text-xs rounded-bl-2xl">
                    MẮT TRÁI
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Thị lực
                      </label>
                      <input
                        {...register('leftEyeVisionNoGlass')}
                        placeholder="V"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-xl text-rose-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Nhãn áp
                      </label>
                      <input
                        {...register('leftEyePressure')}
                        placeholder="mmHg"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-xl text-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-[3rem] overflow-hidden shadow-inner bg-slate-50/50">
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Right Eye Pathology
                  </div>
                  <div className="p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Left Eye Pathology
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="divide-y divide-slate-50 bg-white/50">
                    {SECTION_KEYS.map((key, i) =>
                      renderEyeCell('rightEye', key, i + 1)
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 bg-white/50">
                    {SECTION_KEYS.map((key, i) =>
                      renderEyeCell('leftEye', key, i + 1)
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 space-y-10 text-white shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest italic">
                    Chẩn đoán & Điều trị
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">
                      Bệnh chính (Tổn thương chính)
                    </label>
                    <input
                      {...register('finalDiagnosisMain')}
                      className="w-full bg-white/5 border-2 border-white/10 focus:border-primary/50 p-6 rounded-[2rem] outline-none font-black uppercase text-xl text-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">
                      Phương án điều trị / Ghi chú
                    </label>
                    <textarea
                      {...register('finalDiagnosisExtra')}
                      className="w-full h-40 bg-white/5 border-2 border-white/10 p-6 rounded-[2rem] outline-none font-medium text-lg text-white/80 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-8 mt-10">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Aura Digital Clinic © 2026 | {recordStatus}
          </div>
          <div className="flex items-center gap-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Bác sĩ khám:
            </label>
            <input
              {...register('doctorName')}
              className="bg-transparent border-b-2 border-slate-200 focus:border-primary px-4 py-1 text-lg font-black outline-none text-slate-800"
              placeholder="---"
            />
          </div>
        </div>
      </main>

      {isOphthalmologist && (
        <button
          onClick={() => reset(INITIAL_VALUES as FullEmrFormData)}
          className="fixed bottom-8 left-8 p-5 bg-white text-slate-400 hover:text-primary rounded-2xl shadow-2xl border border-slate-100 transition-all hover:scale-110 active:scale-95 z-40"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
