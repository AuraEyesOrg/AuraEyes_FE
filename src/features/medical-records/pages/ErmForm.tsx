import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  User,
  Lock,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Info,
  Calendar,
  Phone,
  Briefcase,
  MapPin,
  Sparkles,
  FileText,
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
import { clinicScreeningApi } from '@/features/clinic-staff/api/screening.api';

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
 * EMR FORM DATA (23 Administrative fields + Clinical sections)
 */
interface FullEmrFormData {
  // Section I & II: Administrative (23 fields)
  khoa: string;
  giuong: string;
  soLuuTru: string;
  maYT: string; // Medical Record Number
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
  bhytNumber: string;
  bhytExpiry: string;
  relativeName: string;
  relativePhone: string;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  referralPlace: string;
  admissionReason: string;

  // Section III: Clinical
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
  patientId: string;
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
  khoa: 'Mắt',
  fullName: '',
  gender: 'Nam',
  objectType: 'BHYT',
  admissionDate: new Date().toISOString().split('T')[0],
  admissionTime: new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }),
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

  const [recordStatus, setRecordStatus] = useState<MedicalRecordStatus>(
    MedicalRecordStatus.DraftAdmin
  );
  const [aiResult, setAiResult] = useState<any>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [showAiResult, setShowAiResult] = useState(false);
  const [activeStep, setActiveStep] = useState<'admin' | 'clinical'>('admin');

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

  // Auto-transition to PendingClinical if opened by Doctor
  useEffect(() => {
    if (
      id &&
      isOphthalmologist &&
      recordStatus === MedicalRecordStatus.DraftAdmin
    ) {
      startConsultationMutation.mutate(id);
    }
    if (isOphthalmologist) setActiveStep('clinical');
  }, [id, isOphthalmologist, recordStatus]);

  useEffect(() => {
    if (record) {
      const adminData = JSON.parse(record.administrativeDataJson || '{}');
      const clinicalData = JSON.parse(record.clinicalDataJson || '{}');

      reset({
        ...adminData,
        ...clinicalData,
        maYT: record.medicalRecordNumber,
        finalDiagnosisMain: record.finalDiagnosis,
        finalDiagnosisExtra: record.treatmentPlan,
      });
      setRecordStatus(record.status as MedicalRecordStatus);

      // Fetch AI Results
      const screeningId =
        clinicalData.screeningId || location.state?.screeningId;
      if (screeningId) {
        void clinicScreeningApi
          .getSessionDetail(screeningId)
          .then((res) => {
            if (res.data) {
              setScreeningId(res.data.screeningId);
              if (res.data.latestResult) {
                setAiResult(res.data.latestResult);
              }
            }
          })
          .catch(console.error);
      }
    } else if (location.state?.formData) {
      const incoming = location.state.formData;
      Object.keys(incoming).forEach((key) => {
        setValue(key as keyof FullEmrFormData, incoming[key]);
      });
      if (location.state.screeningId) {
        void clinicScreeningApi
          .getSessionDetail(location.state.screeningId)
          .then((res) => {
            if (res.data) {
              setScreeningId(res.data.screeningId);
              if (res.data.latestResult) {
                setAiResult(res.data.latestResult);
              }
            }
          })
          .catch(console.error);
      }
    }
  }, [record, location.state, reset, setValue]);

  const formData = useWatch({ control });
  const rightEyeData = formData.rightEye;
  const leftEyeData = formData.leftEye;

  const onSubmit = async (data: FullEmrFormData) => {
    const missingFields: string[] = [];

    if (!data.fullName) missingFields.push('Họ tên');
    if (!data.age) missingFields.push('Tuổi');
    if (!data.gender) missingFields.push('Giới tính');
    if (!data.address) missingFields.push('Địa chỉ');
    if (!data.admissionReason) missingFields.push('Lý do vào viện');

    if (isOphthalmologist) {
      if (!data.medicalHistory) missingFields.push('Tiền sử bệnh');
      if (!data.finalDiagnosisMain) missingFields.push('Chẩn đoán chính');
      if (!data.doctorName) missingFields.push('Tên bác sĩ');
    }

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(', ')}`);
      return;
    }

    if (!id) {
      toast.warning('Vui lòng tạo hồ sơ từ luồng tiếp nhận');
      return;
    }

    try {
      if (isStaff && !isOphthalmologist) {
        const adminFields = [
          'khoa',
          'giuong',
          'soLuuTru',
          'maYT',
          'fullName',
          'birthDate',
          'age',
          'gender',
          'job',
          'ethnicity',
          'nationality',
          'address',
          'workplace',
          'objectType',
          'bhytNumber',
          'bhytExpiry',
          'relativeName',
          'relativePhone',
          'admissionDate',
          'admissionTime',
          'admissionType',
          'referralPlace',
          'admissionReason',
        ];
        const adminData = adminFields.reduce((acc, field) => {
          acc[field] = (data as any)[field];
          return acc;
        }, {} as any);

        await updateAdministrativeMutation.mutateAsync({
          id,
          data: { administrativeDataJson: JSON.stringify(adminData) },
        });
      } else if (isOphthalmologist) {
        const clinicalFields = [
          'medicalHistory',
          'personalHistory',
          'familyHistory',
          'rightEyeVisionNoGlass',
          'leftEyeVisionNoGlass',
          'rightEyeVisionWithGlass',
          'leftEyeVisionWithGlass',
          'rightEyePressure',
          'leftEyePressure',
          'rightEyeField',
          'leftEyeField',
          'rightEye',
          'leftEye',
        ];
        const clinicalData = clinicalFields.reduce((acc, field) => {
          acc[field] = (data as any)[field];
          return acc;
        }, {} as any);

        clinicalData.screeningId =
          screeningId ||
          (record?.clinicalDataJson
            ? JSON.parse(record.clinicalDataJson).screeningId
            : null);

        await updateDiagnosisMutation.mutateAsync({
          id,
          data: {
            clinicalDataJson: JSON.stringify(clinicalData),
            finalDiagnosis: data.finalDiagnosisMain,
            treatmentPlan: data.finalDiagnosisExtra,
          },
        });
      }
      toast.success('Đã lưu hồ sơ');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalize = async () => {
    if (!id) return;
    try {
      await finalizeMutation.mutateAsync(id);
      toast.success('Đã khóa hồ sơ');
    } catch (error) {
      toast.error('Lỗi khi khóa hồ sơ');
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
    const disabled =
      !isOphthalmologist || recordStatus === MedicalRecordStatus.Finalized;

    return (
      <div
        className={`p-6 transition-all duration-300 ${itemData?.normal ? 'bg-transparent' : isRight ? 'bg-cyan-50/30' : 'bg-rose-50/30'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xs text-slate-700 uppercase tracking-tight">
            {idx}. {config.label}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              setValue(`${eye}.${field}.normal`, !itemData?.normal)
            }
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
              itemData?.normal
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-600'
            } disabled:opacity-50`}
          >
            {itemData?.normal ? 'Bình thường' : 'Bệnh lý'}
          </button>
        </div>

        {!itemData?.normal && (
          <div className="space-y-3 pt-2 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(config.checks).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 group px-3 py-1.5 rounded-lg border border-slate-100 bg-white/50 cursor-pointer hover:bg-white transition-all"
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600"
                    {...register(`${eye}.${field}.checks.${key}`)}
                  />
                  <span className="text-[10px] font-medium text-slate-600">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              {...register(`${eye}.${field}.other`)}
              disabled={disabled}
              placeholder="Ghi chú bệnh lý chi tiết..."
              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[11px] font-medium outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 min-h-[60px] disabled:opacity-50"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 selection:bg-cyan-500/20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-black italic">
              A
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">
              AURA
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              recordStatus === MedicalRecordStatus.Finalized
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-cyan-100 text-cyan-600'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {recordStatus.replace('_', ' ')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {aiResult && (
            <button
              onClick={() => setShowAiResult(!showAiResult)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] transition-all ${
                showAiResult
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> KẾT QUẢ AI
            </button>
          )}

          <button
            onClick={() => navigate(`/medical-records/patient/${id}`)}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> XEM BẢN IN
          </button>

          {isFinalizer && recordStatus !== MedicalRecordStatus.Finalized && (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2 rounded-xl font-black text-[10px] hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> KHÓA HỒ SƠ
            </button>
          )}

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={recordStatus === MedicalRecordStatus.Finalized}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-[10px] hover:bg-black hover:shadow-lg hover:shadow-black/20 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {id ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-900">
            Hồ sơ bệnh án Ophthalmology
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Tiêu chuẩn Bộ Y tế - Mẫu 23/BV-01
          </p>
          <div className="w-16 h-1 bg-cyan-500 mx-auto rounded-full mt-4" />
        </div>

        {/* AI Result Float Panel */}
        {showAiResult && aiResult && (
          <div className="fixed bottom-10 right-10 z-[60] w-96 bg-white rounded-[2rem] shadow-2xl border border-purple-100 overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-purple-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-black text-sm uppercase">
                    Kết quả AI Screening
                  </span>
                  <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                    CHỈ DÙNG THAM KHẢO
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAiResult(false)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">
                    Phân tích từ AI
                  </span>
                  <div className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-[9px] font-black uppercase">
                    AI Reference
                  </div>
                </div>
                <p className="text-sm font-bold text-purple-900 leading-relaxed italic">
                  "Lưu ý: Đây là kết quả phân tích tự động từ AI hỗ trợ bác sĩ,
                  không phải chẩn đoán cuối cùng."
                </p>
              </div>

              {aiResult.summary && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-purple-400 uppercase">
                    Tóm tắt bệnh lý
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {aiResult.summary}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Dấu hiệu phát hiện
                </p>
                <div className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {aiResult.findings || 'Không có dữ liệu phân tích chi tiết.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Info Summary Bar (Visible to Doctor) */}
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center gap-y-4 gap-x-8">
            <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bệnh nhân
                </p>
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  {formData.fullName || 'Chưa có tên'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Tuổi / GT
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {formData.age || '--'} tuổi • {formData.gender}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Mã Y Tế (MRN)
                </p>
                <p className="text-sm font-black text-cyan-600">
                  {formData.maYT || 'AURA-XXXXXX'}
                </p>
              </div>
              <div className="space-y-1 hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Lý do khám
                </p>
                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                  {formData.admissionReason || 'Không có thông tin'}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    Admin Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveStep('admin')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${
                activeStep === 'admin'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-4 h-4" /> I & II. HÀNH CHÍNH
            </button>
            <button
              onClick={() => isOphthalmologist && setActiveStep('clinical')}
              disabled={!isOphthalmologist}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${
                activeStep === 'clinical'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-300'
              } disabled:opacity-50`}
            >
              <Stethoscope className="w-4 h-4" /> III. LÂM SÀNG
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          {activeStep === 'admin' ? (
            <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Khoa
                  </label>
                  <input
                    {...register('khoa')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Giường
                  </label>
                  <input
                    {...register('giuong')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Số lưu trữ
                  </label>
                  <input
                    {...register('soLuuTru')}
                    disabled={isOphthalmologist}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Mã YT
                  </label>
                  <input
                    {...register('maYT')}
                    disabled
                    className="w-full bg-slate-100 p-3 rounded-xl outline-none font-black text-sm text-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-600" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                    I. Phần Hành Chính
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Họ và tên (In hoa)
                    </label>
                    <input
                      {...register('fullName')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white p-4 rounded-2xl outline-none font-black uppercase text-slate-800 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      {...register('birthDate')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Tuổi
                    </label>
                    <input
                      {...register('age')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-center"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Giới tính
                    </label>
                    <select
                      {...register('gender')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold appearance-none"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Nghề nghiệp
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        {...register('job')}
                        disabled={isOphthalmologist}
                        className="w-full bg-slate-50 pl-11 pr-4 py-4 rounded-2xl outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Dân tộc
                    </label>
                    <input
                      {...register('ethnicity')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Quốc tịch
                    </label>
                    <input
                      {...register('nationality')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Nơi làm việc
                    </label>
                    <input
                      {...register('workplace')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                    <textarea
                      {...register('address')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 pl-11 pr-4 py-4 rounded-2xl outline-none font-medium min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Đối tượng
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['BHYT', 'Thu phí', 'Miễn', 'Khác'].map((obj) => (
                        <button
                          key={obj}
                          type="button"
                          disabled={isOphthalmologist}
                          onClick={() => setValue('objectType', obj as any)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            formData.objectType === obj
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {obj}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Số thẻ BHYT
                    </label>
                    <input
                      {...register('bhytNumber')}
                      disabled={isOphthalmologist}
                      className="w-full bg-white p-3 rounded-xl outline-none font-bold border border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Hạn dùng BHYT
                    </label>
                    <input
                      type="date"
                      {...register('bhytExpiry')}
                      disabled={isOphthalmologist}
                      className="w-full bg-white p-3 rounded-xl outline-none font-bold border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Người thân
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        {...register('relativeName')}
                        disabled={isOphthalmologist}
                        className="w-full bg-slate-50 pl-11 pr-4 py-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Điện thoại liên hệ
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        {...register('relativePhone')}
                        disabled={isOphthalmologist}
                        className="w-full bg-slate-50 pl-11 pr-4 py-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                    II. Quản lý người bệnh
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Ngày vào viện
                    </label>
                    <input
                      type="date"
                      {...register('admissionDate')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Giờ vào viện
                    </label>
                    <input
                      type="time"
                      {...register('admissionTime')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Nơi giới thiệu
                    </label>
                    <input
                      {...register('referralPlace')}
                      disabled={isOphthalmologist}
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
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
                    className="w-full h-32 bg-slate-50 p-6 rounded-[2rem] outline-none text-sm font-medium resize-none focus:bg-white transition-all shadow-inner"
                    placeholder="Mô tả lý do khám..."
                  />
                </div>
              </div>

              {!isOphthalmologist &&
                recordStatus !== MedicalRecordStatus.Finalized && (
                  <div className="flex justify-end pt-10">
                    <button
                      type="submit"
                      onClick={handleSubmit(onSubmit)}
                      className="bg-cyan-600 text-white px-10 py-4 rounded-2xl font-black text-xs hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Lưu hành chính
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <div className="p-8 md:p-12 space-y-12 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-6 py-2 bg-cyan-600 text-white font-black text-[10px] tracking-widest uppercase rounded-bl-3xl">
                    MẮT PHẢI
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Thị lực không kính
                      </label>
                      <input
                        {...register('rightEyeVisionNoGlass')}
                        placeholder="V"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-2xl text-cyan-600 border border-transparent focus:border-cyan-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Nhãn áp
                      </label>
                      <input
                        {...register('rightEyePressure')}
                        placeholder="mmHg"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-2xl text-cyan-600 border border-transparent focus:border-cyan-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white font-black text-[10px] tracking-widest uppercase rounded-bl-3xl">
                    MẮT TRÁI
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Thị lực không kính
                      </label>
                      <input
                        {...register('leftEyeVisionNoGlass')}
                        placeholder="V"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-2xl text-rose-500 border border-transparent focus:border-rose-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Nhãn áp
                      </label>
                      <input
                        {...register('leftEyePressure')}
                        placeholder="mmHg"
                        className="w-full bg-white p-4 rounded-2xl outline-none font-black text-2xl text-rose-500 border border-transparent focus:border-rose-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                    Tiền sử bệnh
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <textarea
                    {...register('medicalHistory')}
                    className="w-full h-32 bg-slate-50 p-6 rounded-[2.5rem] outline-none text-sm font-medium resize-none border border-slate-100 focus:bg-white transition-all"
                    placeholder="Tiền sử bệnh..."
                  />
                  <textarea
                    {...register('familyHistory')}
                    className="w-full h-32 bg-slate-50 p-6 rounded-[2.5rem] outline-none text-sm font-medium resize-none border border-slate-100 focus:bg-white transition-all"
                    placeholder="Tiền sử gia đình..."
                  />
                </div>
              </div>

              <div className="border border-slate-100 rounded-[3rem] overflow-hidden bg-slate-50/30">
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-white">
                  <div className="p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-cyan-600">
                    Bệnh lý Mắt Phải
                  </div>
                  <div className="p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-rose-500">
                    Bệnh lý Mắt Trái
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="divide-y divide-slate-50 bg-white/40">
                    {SECTION_KEYS.map((key, i) =>
                      renderEyeCell('rightEye', key, i + 1)
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 bg-white/40">
                    {SECTION_KEYS.map((key, i) =>
                      renderEyeCell('leftEye', key, i + 1)
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500 rounded-2xl flex items-center justify-center text-white font-black italic">
                    !
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                      KẾT LUẬN & CHẨN ĐOÁN
                    </h2>
                    <span className="text-[10px] font-bold text-cyan-400 italic mt-1">
                      (Chẩn đoán cuối cùng của bác sĩ dựa trên khám lâm sàng và
                      kết quả AI hỗ trợ)
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Chẩn đoán chính
                    </label>
                    <input
                      {...register('finalDiagnosisMain')}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none font-black text-xl text-cyan-400 focus:bg-white/10 transition-all"
                      placeholder="Chẩn đoán..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Hướng điều trị
                    </label>
                    <textarea
                      {...register('finalDiagnosisExtra')}
                      className="w-full h-32 bg-white/5 border border-white/10 p-5 rounded-2xl outline-none font-bold text-sm text-slate-200 focus:bg-white/10 transition-all resize-none"
                      placeholder="Lời dặn bác sĩ..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Bác sĩ khám
                    </label>
                    <input
                      {...register('doctorName')}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none font-black text-sm text-white"
                      placeholder="Họ tên bác sĩ"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="submit"
                      onClick={handleSubmit(onSubmit)}
                      className="bg-cyan-500 text-white px-12 py-4 rounded-2xl font-black text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest group"
                    >
                      LƯU CHẨN ĐOÁN{' '}
                      <ChevronRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
