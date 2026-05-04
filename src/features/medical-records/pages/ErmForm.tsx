import React, { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  PrescriptionTable,
  normalizePrescriptionItemsForPersistence,
  validatePrescriptionItems,
} from '@/features/ophthalmologist/components/PrescriptionTable';
import type { RxItem } from '@/features/ophthalmologist/types/drug.type';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  User,
  Lock,
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
  CheckCircle,
  ArrowLeft,
  X,
  Pill,
} from 'lucide-react';
import { AuraLogo } from '@/components/ui/aura-logo';
import { useTheme } from '@/contexts/ThemeContext';
import ConfirmModal from '@/components/ui/confirm-modal';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/auth-store';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { MedicalRecordStatus } from '../api/medical-record.api';
import {
  useMedicalRecord,
  useUpdateDiagnosis,
  useFinalizeRecord,
  useStartConsultation,
  useUpdateAdministrative,
} from '../hooks/useMedicalRecords';
import { usePatientProfile } from '@/features/patient/hooks/useProfile';
import { clinicScreeningApi } from '@/features/clinic-staff/api/screening.api';
import { getConsultationSession } from '@/features/consultation/api/consultation.api';
import {
  useConsultationSessions,
  useSubmitVerificationReport,
} from '@/features/consultation/hooks/use-consultation';
import { ConsultationSessionType, SessionStatus } from '@/types/consultation';
import {
  masterDataApi,
  Province,
  District,
  Ward,
  Country,
} from '../api/master-data.api';

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
  address: string; // Street address
  workplace: string;
  objectType: 'BHYT' | 'Thu phí' | 'Miễn' | 'Khác';
  bhytNumber: string;
  bhytExpiry: string;
  relativeName: string;
  relativePhone: string;
  ward: string;
  district: string;
  province: string;
  wardCode?: number;
  districtCode?: number;
  provinceCode?: number;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  referralPlace: string;
  admissionReason: string;
  directEntry: string;
  dischargeDate: string;
  totalTreatmentDays: string;

  // Additional 23/BV-01 Management Fields
  admissionCount: string; // Vào viện do bệnh này lần thứ mấy
  department: string; // Vào khoa
  transferHospital: string; // Chuyển viện: 1. Tuyến trên 2. Tuyến dưới 3.CK
  transferTo: string; // Chuyển đến
  dischargeType: string; // 1. Ra viện 2. Xin về 3. Bỏ về 4. Đưa về
  transferDiagnosis: string; // Nơi chuyển đến (chẩn đoán)
  kkbDiagnosis: string; // KKB, Cấp cứu (chẩn đoán)
  departmentDiagnosis: string; // Khi vào khoa điều trị (chẩn đoán)
  complications: string; // Tai biến, Biến chứng
  complicationType: string; // 1. Do phẫu thuật 2. Do gây mê 3. Do nhiễm khuẩn 4. Khác
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  postOpDays: string;
  opCount: string;
  treatmentResult: string; // 1. Khỏi 2. Đỡ, giảm... 5. Tử vong
  deathTime: string;
  deathDate: string;
  deathReason: string;
  deathPeriod: string; // 1. Trong 24 giờ...

  // Section III: Clinical
  medicalHistory: string;
  personalHistory: string;
  familyHistory: string;
  diseaseProcess: string;
  companionDisease: string;
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

const ETHNICITIES = [
  'Kinh',
  'Tày',
  'Thái',
  'Mường',
  'Khơ Me',
  'Nùng',
  "H'Mông",
  'Dao',
  'Gia Rai',
  'Ê Đê',
  'Ba Na',
  'Sán Chay',
  'Chăm',
  'Kơ Ho',
  'Xơ Đăng',
  'Sán Dìu',
  'Hrê',
  'Mnông',
  'Ra Glai',
  'Xtiêng',
  'Bru-Vân Kiều',
  'Thổ',
  'Giáy',
  'Cơ Tu',
  'Giẻ Triêng',
  'Mạ',
  'Khơ Mú',
  'Co',
  'Tà Ôi',
  'Chơ Ro',
  'Kháng',
  'Xinh Mun',
  'Hà Nhì',
  'Chu Ru',
  'Lào',
  'La Chí',
  'La Ha',
  'Phù Lá',
  'La Hủ',
  'Lự',
  'Lô Lô',
  'Chứt',
  'Mảng',
  'Pà Thẻn',
  'Cơ Lao',
  'Cống',
  'Bố Y',
  'Si La',
  'Pu Péo',
  'Rơ Măm',
  'Brâu',
  'Ơ Đu',
  'Hoa',
  'Ngái',
].sort();

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { theme } = useTheme();

  const [recordStatus, setRecordStatus] = useState<MedicalRecordStatus>(
    MedicalRecordStatus.DraftAdmin
  );
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [showAiResult, setShowAiResult] = useState(false);
  const [activeStep, setActiveStep] = useState<
    'admin' | 'clinical' | 'prescription'
  >('admin');
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const hasInitiatedConsultation = useRef(false);

  // ─── Prescription state ────────────────────────────────────────────────────
  const [prescriptionItems, setPrescriptionItems] = useState<RxItem[]>([]);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [noMedicationPrescribed, setNoMedicationPrescribed] = useState(false);
  const [prescriptionErrors, setPrescriptionErrors] = useState<
    Record<string, (keyof Omit<RxItem, 'id'>)[]>
  >({});

  // Custom Hooks
  const { data: record, isLoading: isLoadingRecord } = useMedicalRecord(
    id || ''
  );
  const updateDiagnosisMutation = useUpdateDiagnosis();
  const finalizeMutation = useFinalizeRecord();
  const startConsultationMutation = useStartConsultation();
  const updateAdministrativeMutation = useUpdateAdministrative();
  const submitVerificationReportMutation = useSubmitVerificationReport();

  // Fetch patient profile if needed
  const patientIdFromRecord =
    record?.patientId || location.state?.formData?.patientId;

  // Find the active consultation session to link the diagnosis for the Cashier
  const consultationSessionsQuery = useConsultationSessions(
    {
      patientId: patientIdFromRecord,
    },
    { enabled: Boolean(patientIdFromRecord) }
  );

  const linkedSessions = consultationSessionsQuery.data?.items ?? [];
  const activeSessions = linkedSessions.filter(
    (s) =>
      s.status !== SessionStatus.Cancelled &&
      s.status !== SessionStatus.Completed
  );
  const reportableSession = activeSessions.find(
    (s) =>
      s.type === ConsultationSessionType.ClinicBooking ||
      s.type === ConsultationSessionType.Verification ||
      s.type === ConsultationSessionType.VideoCall
  );
  const reportableSessionId = reportableSession?.id ?? null;

  // Role Detection
  const isOphthalmologist = user?.roles.includes('Ophthalmologist');
  const isStaff = user?.roles.includes('ClinicStaff');
  const isFinalizer = user?.permissions?.includes('medical-records:finalize');

  const isReadOnlyAdmin =
    recordStatus === MedicalRecordStatus.Finalized || isOphthalmologist;
  const isReadOnlyClinical =
    recordStatus === MedicalRecordStatus.Finalized || !isOphthalmologist;

  useEffect(() => {
    if (id === 'new' && isOphthalmologist) {
      toast.error(
        'Bác sĩ không có quyền tạo hồ sơ mới. Hồ sơ phải được tạo bởi nhân viên phòng khám.'
      );
      navigate('/dashboard');
    }
  }, [id, isOphthalmologist, navigate]);

  const { data: patientProfile } = usePatientProfile(patientIdFromRecord);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    control,
    formState: { isDirty, isSubmitting },
  } = useForm<FullEmrFormData>({
    defaultValues: INITIAL_VALUES as FullEmrFormData,
  });

  // Pre-fill administrative data from patient profile if fields are empty
  useEffect(() => {
    if (patientProfile) {
      console.log('Synchronizing patient profile info:', patientProfile);

      const currentValues = control._formValues;

      if (!currentValues.fullName)
        setValue('fullName', patientProfile.fullName);
      if (!currentValues.birthDate && patientProfile.dateOfBirth) {
        const d = new Date(patientProfile.dateOfBirth);
        if (!isNaN(d.getTime())) {
          setValue('birthDate', d.toISOString().split('T')[0]);
        }
      }
      if (!currentValues.gender && patientProfile.gender) {
        setValue('gender', patientProfile.gender === 'female' ? 'Nữ' : 'Nam');
      }
      if (!currentValues.relativePhone && patientProfile.phone) {
        setValue('relativePhone', patientProfile.phone);
      }
      if (!currentValues.address && patientProfile.address) {
        setValue('address', patientProfile.address);
      }
      if (!currentValues.maYT && (patientProfile as any).medicalRecordNumber) {
        setValue('maYT', (patientProfile as any).medicalRecordNumber);
      }
    }
  }, [patientProfile, setValue, control]);

  // Auto-calculate age from birthDate
  const birthDateValue = useWatch({ control, name: 'birthDate' });
  useEffect(() => {
    if (birthDateValue) {
      const birth = new Date(birthDateValue);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        if (age >= 0) {
          setValue('age', age.toString());
        }
      }
    }
  }, [birthDateValue, setValue]);

  // Auto-transition to PendingClinical if opened by Doctor (Run only once)
  useEffect(() => {
    if (
      id &&
      id !== 'new' &&
      isOphthalmologist &&
      recordStatus === MedicalRecordStatus.DraftAdmin &&
      !isStaff &&
      !startConsultationMutation.isPending &&
      !startConsultationMutation.isSuccess &&
      !hasInitiatedConsultation.current
    ) {
      hasInitiatedConsultation.current = true;
      startConsultationMutation.mutate(id);
    }

    // Default to clinical tab for doctors only once
    if (isOphthalmologist && !hasAutoSwitched && record) {
      setActiveStep('clinical');
      setHasAutoSwitched(true);
    }
  }, [
    id,
    isOphthalmologist,
    recordStatus,
    startConsultationMutation.isPending,
    startConsultationMutation.isSuccess,
    hasAutoSwitched,
    record,
    isStaff,
  ]);

  useEffect(() => {
    const tab = location.state?.initialTab;
    if (tab === 'admin' || tab === 'clinical' || tab === 'prescription') {
      setActiveStep(tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isOphthalmologist && activeStep === 'prescription') {
      setActiveStep('admin');
    }
  }, [isOphthalmologist, activeStep]);

  useEffect(() => {
    if (record) {
      const adminData = JSON.parse(record.administrativeDataJson || '{}');
      const clinicalData = JSON.parse(record.clinicalDataJson || '{}');

      // Helper to format date for input[type="date"]
      const formatDateForInput = (d: any) => {
        if (!d) return '';
        const date = new Date(d);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      };

      // Format all date fields
      const formattedAdmin = { ...adminData };
      ['birthDate', 'admissionDate', 'dischargeDate', 'bhytExpiry'].forEach(
        (key) => {
          if (formattedAdmin[key])
            formattedAdmin[key] = formatDateForInput(formattedAdmin[key]);
        }
      );

      const mergeEyeSections = (savedEye: Record<string, any> | undefined) =>
        SECTION_KEYS.reduce(
          (acc, key) => {
            const savedSection = savedEye?.[key] ?? {};
            acc[key] = {
              ...INITIAL_ITEM,
              ...savedSection,
              checks: { ...(savedSection.checks ?? {}) },
              inputs: { ...(savedSection.inputs ?? {}) },
              other: savedSection.other ?? '',
            };
            return acc;
          },
          {} as Record<string, DetailedEyeItem>
        );

      const normalizedClinicalData = {
        ...clinicalData,
        rightEye: mergeEyeSections(clinicalData?.rightEye),
        leftEye: mergeEyeSections(clinicalData?.leftEye),
      };

      reset({
        ...INITIAL_VALUES,
        ...formattedAdmin,
        ...normalizedClinicalData,
        maYT: record.medicalRecordNumber,
        finalDiagnosisMain: record.finalDiagnosis,
        finalDiagnosisExtra: record.treatmentPlan,
      });

      // Hydrate prescription from clinicalDataJson (safe fallback for old records)
      try {
        const savedItems = clinicalData?.prescriptionItems;
        if (Array.isArray(savedItems) && savedItems.length > 0) {
          setPrescriptionItems(
            savedItems.map((item: Partial<RxItem>) => ({
              id:
                item.id ??
                `rx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              medicineName: item.medicineName ?? '',
              dosage: item.dosage ?? '',
              unit: item.unit ?? '',
              frequency: item.frequency ?? '',
              duration: item.duration ?? '',
              instruction: item.instruction ?? '',
            }))
          );
        } else {
          setPrescriptionItems([]);
        }
        setPrescriptionNote(clinicalData?.prescriptionNote ?? '');
        setNoMedicationPrescribed(
          clinicalData?.noMedicationPrescribed ?? false
        );
      } catch {
        // silently ignore malformed prescription data from old records
        setPrescriptionItems([]);
        setPrescriptionNote('');
        setNoMedicationPrescribed(false);
      }

      // Explicitly load geographic data and set values to ensure they aren't lost
      const loadLocations = async () => {
        if (!adminData.provinceCode) return;
        setIsLoadingGeo(true);
        try {
          // Fetch districts
          const districtsRes = await masterDataApi.getDistricts(
            adminData.provinceCode
          );
          setDistricts(districtsRes);

          // Re-set values after options are loaded to prevent RHF from clearing them
          if (adminData.districtCode) {
            setValue('districtCode', adminData.districtCode);

            // Fetch wards
            const wardsRes = await masterDataApi.getWards(
              adminData.districtCode
            );
            setWards(wardsRes);

            if (adminData.wardCode) {
              setValue('wardCode', adminData.wardCode);
            }
          }
        } catch (err) {
          console.error('Error loading locations:', err);
        } finally {
          setIsLoadingGeo(false);
        }
      };

      void loadLocations();

      setRecordStatus(record.status as MedicalRecordStatus);

      const fetchAiResult = async (sid: string) => {
        try {
          const res = await clinicScreeningApi.getSessionDetail(sid);
          if (res.data) {
            setScreeningId(res.data.screeningId);
            if (res.data.latestResult) {
              setAiResult(res.data.latestResult);
            }
          }
        } catch (err: any) {
          // If the screening ID was invalid (e.g. accidentally saved as medical record ID),
          // fallback to getting the AiScreeningId from the Consultation Session.
          if (err.response?.status === 404 && record.consultationSessionId) {
            try {
              const consultation = await getConsultationSession(
                record.consultationSessionId
              );
              if (consultation.aiScreeningId) {
                const realRes = await clinicScreeningApi.getSessionDetail(
                  consultation.aiScreeningId
                );
                if (realRes.data) {
                  setScreeningId(realRes.data.screeningId);
                  if (realRes.data.latestResult) {
                    setAiResult(realRes.data.latestResult);
                  }
                }
              }
            } catch (innerErr) {
              console.error('Failed to fallback fetch screening ID', innerErr);
            }
          } else {
            console.error('Failed to fetch AI Result:', err);
          }
        }
      };

      // Fetch AI Results
      const screeningIdToLoad =
        location.state?.screeningId || clinicalData.screeningId;
      if (screeningIdToLoad) {
        void fetchAiResult(screeningIdToLoad);
      } else if (record.consultationSessionId) {
        // No screening ID saved at all, try falling back immediately
        void fetchAiResult('fallback-to-consultation');
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

  // Age calculation effect
  const birthDate = useWatch({ control, name: 'birthDate' });
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        if (age >= 0) {
          setValue('age', age.toString());
        }
      }
    }
  }, [birthDate, setValue]);

  // Geographic Data Effects
  const provinceCode = useWatch({ control, name: 'provinceCode' });
  const districtCode = useWatch({ control, name: 'districtCode' });

  // 1. Initial Load of Master Data (Provinces & Countries)
  useEffect(() => {
    const initMasterData = async () => {
      if (provinces.length > 0 && countries.length > 0) return;
      setIsLoadingGeo(true);
      try {
        const [pData, cData] = await Promise.all([
          masterDataApi.getProvinces(),
          masterDataApi.getCountries(),
        ]);
        setProvinces(pData);
        setCountries(cData);
      } catch (err) {
        console.error('Failed to load initial master data:', err);
      } finally {
        setIsLoadingGeo(false);
      }
    };
    void initMasterData();
  }, []);

  // 2. Fetch Districts when provinceCode changes
  useEffect(() => {
    if (provinceCode && provinces.length > 0) {
      masterDataApi
        .getDistricts(provinceCode)
        .then((data: District[]) => {
          setDistricts(data);
          // If we have a pending value from the record, ensure it stays
          const currentDistrict = getValues('districtCode');
          if (currentDistrict && data.some((d) => d.code === currentDistrict)) {
            setValue('districtCode', currentDistrict);
          }
        })
        .catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [provinceCode, provinces.length, setValue, getValues]);

  // 3. Fetch Wards when districtCode changes
  useEffect(() => {
    if (districtCode && districts.length > 0) {
      masterDataApi
        .getWards(districtCode)
        .then((data: Ward[]) => {
          setWards(data);
          // If we have a pending value from the record, ensure it stays
          const currentWard = getValues('wardCode');
          if (currentWard && data.some((w) => w.code === currentWard)) {
            setValue('wardCode', currentWard);
          }
        })
        .catch(console.error);
    } else {
      setWards([]);
    }
  }, [districtCode, districts.length, setValue, getValues]);

  const formData = useWatch({ control });
  const rightEyeData = formData.rightEye;
  const leftEyeData = formData.leftEye;

  const handleSetAllNormal = () => {
    const newRightEye = { ...rightEyeData } as Record<string, DetailedEyeItem>;
    const newLeftEye = { ...leftEyeData } as Record<string, DetailedEyeItem>;

    SECTION_KEYS.forEach((key) => {
      if (newRightEye[key]) {
        newRightEye[key] = { ...newRightEye[key], normal: true };
      }
      if (newLeftEye[key]) {
        newLeftEye[key] = { ...newLeftEye[key], normal: true };
      }
    });

    setValue('rightEye', newRightEye);
    setValue('leftEye', newLeftEye);
    toast.info('Đã đặt tất cả trạng thái bình thường');
  };

  const onSubmit = async (data: FullEmrFormData) => {
    const missingFields: string[] = [];

    if (!data.fullName) missingFields.push('Họ tên');
    if (!data.age) missingFields.push('Tuổi');
    if (!data.gender) missingFields.push('Giới tính');
    if (!data.province) missingFields.push('Tỉnh/Thành phố');
    if (!data.district) missingFields.push('Quận/Huyện');
    if (!data.ward) missingFields.push('Phường/Xã');
    if (!data.address) missingFields.push('Số nhà/Tên đường');
    if (!data.admissionReason) missingFields.push('Lý do vào viện');

    if (isOphthalmologist) {
      if (!data.medicalHistory) missingFields.push('Tiền sử bệnh');
      if (!data.finalDiagnosisMain) missingFields.push('Chẩn đoán chính');
      if (!data.doctorName) missingFields.push('Tên bác sĩ');

      // Visual Acuity Validation
      if (!data.rightEyeVisionNoGlass)
        missingFields.push('Thị lực MP (Không kính)');
      if (!data.leftEyeVisionNoGlass)
        missingFields.push('Thị lực MT (Không kính)');
      if (!data.rightEyeVisionWithGlass)
        missingFields.push('Thị lực MP (Có kính)');
      if (!data.leftEyeVisionWithGlass)
        missingFields.push('Thị lực MT (Có kính)');
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
          'district',
          'province',
          'ward',
          'districtCode',
          'provinceCode',
          'wardCode',
          'admissionDate',
          'admissionTime',
          'admissionType',
          'referralPlace',
          'admissionReason',
          'directEntry',
          'dischargeDate',
          'totalTreatmentDays',
          'diseaseProcess',
          'companionDisease',
          'admissionCount',
          'department',
          'dischargeType',
          'transferDiagnosis',
          'kkbDiagnosis',
          'departmentDiagnosis',
          'complications',
          'postOpDiagnosis',
          'postOpDays',
          'opCount',
          'treatmentResult',
          'doctorName',
        ];
        const currentValues = getValues();
        const adminData = adminFields.reduce((acc, field) => {
          acc[field] = (currentValues as any)[field];
          return acc;
        }, {} as any);

        await updateAdministrativeMutation.mutateAsync({
          id,
          data: { administrativeDataJson: JSON.stringify(adminData) },
        });

        await queryClient.invalidateQueries({
          queryKey: ['clinic-staff', 'queue'],
        });
        navigate(resolvePathWithLocale('/clinic-staff/queue'));
      } else if (isOphthalmologist) {
        const clinicalFields = [
          'medicalHistory',
          'personalHistory',
          'familyHistory',
          'diseaseProcess',
          'companionDisease',
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
          'doctorName',
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

        const normalizedPrescriptionItems =
          normalizePrescriptionItemsForPersistence(prescriptionItems);
        clinicalData.prescriptionItems = normalizedPrescriptionItems;
        clinicalData.prescriptionNote = prescriptionNote.trim();
        clinicalData.noMedicationPrescribed = noMedicationPrescribed;

        await updateDiagnosisMutation.mutateAsync({
          id,
          data: {
            clinicalDataJson: JSON.stringify(clinicalData),
            finalDiagnosis: data.finalDiagnosisMain,
            treatmentPlan: data.finalDiagnosisExtra,
          },
        });
      }
      reset(data); // Clear dirty state
      toast.success('Đã lưu hồ sơ');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalize = () => {
    if (!id) return;
    setShowFinalizeModal(true);
  };

  const onFinalizeConfirm = async () => {
    if (!id) return;
    try {
      if (isOphthalmologist) {
        // Validate prescription before finalizing
        if (!noMedicationPrescribed) {
          const { valid, errors: rxErrors } = validatePrescriptionItems(
            prescriptionItems,
            noMedicationPrescribed
          );
          if (!valid) {
            setPrescriptionErrors(rxErrors);
            toast.error(
              'Mỗi dòng thuốc cần điền đủ: Tên thuốc, Liều, Tần suất và Số ngày. Hoặc tick "Không kê thuốc".'
            );
            setShowFinalizeModal(false);
            return;
          }
        }

        // Save latest clinical state (including prescription) before finalizing
        const currentValues = getValues();
        const clinicalFields = [
          'medicalHistory',
          'personalHistory',
          'familyHistory',
          'diseaseProcess',
          'companionDisease',
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
          'doctorName',
          'finalDiagnosisMain',
          'finalDiagnosisExtra',
        ];

        const clinicalData = clinicalFields.reduce((acc, field) => {
          acc[field] = (currentValues as any)[field];
          return acc;
        }, {} as any);

        const normalizedPrescriptionItems =
          normalizePrescriptionItemsForPersistence(prescriptionItems);
        clinicalData.prescriptionItems = normalizedPrescriptionItems;
        clinicalData.prescriptionNote = prescriptionNote.trim();
        clinicalData.noMedicationPrescribed = noMedicationPrescribed;

        await updateDiagnosisMutation.mutateAsync({
          id,
          data: {
            clinicalDataJson: JSON.stringify(clinicalData),
            finalDiagnosis: currentValues.finalDiagnosisMain,
            treatmentPlan: currentValues.finalDiagnosisExtra,
          },
        });

        // Submit the Diagnosis report to the Consultation Session so the Cashier can process it
        if (reportableSessionId) {
          const doctorId = user?.roleId || '';
          await submitVerificationReportMutation.mutateAsync({
            sessionId: reportableSessionId,
            doctorId: doctorId,
            diagnosisCode: currentValues.finalDiagnosisMain || 'N/A',
            clinicalFindings:
              clinicalData.diseaseProcess ||
              currentValues.finalDiagnosisMain ||
              'No findings recorded',
            treatmentPlan: currentValues.finalDiagnosisExtra || '',
            prescriptionItems:
              normalizedPrescriptionItems.length > 0
                ? normalizedPrescriptionItems
                : undefined,
            prescriptionNote: prescriptionNote.trim() || undefined,
            noMedicationPrescribed,
            status: 'Finalized',
            finalizedAt: new Date().toISOString(),
          });
        } else {
          toast.warning(
            'Không tìm thấy phiên khám nào đang hoạt động để liên kết chẩn đoán. Thu ngân có thể không tìm thấy phí khám.'
          );
        }
      }

      // Finalize the record → sends to Cashier
      await finalizeMutation.mutateAsync(id);

      toast.success('Hồ sơ đã được khóa và gửi tới Thu ngân thành công!');

      if (isOphthalmologist) {
        navigate('/ophthalmologist/consultations');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi khóa hồ sơ. Vui lòng thử lại.');
    } finally {
      setShowFinalizeModal(false);
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
          <AuraLogo size="sm" />
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

          {isOphthalmologist && activeStep === 'clinical' && (
            <button
              onClick={handleSetAllNormal}
              disabled={recordStatus === MedicalRecordStatus.Finalized}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-emerald-100 transition-all border border-emerald-200"
            >
              <CheckCircle className="w-3.5 h-3.5" /> TẤT CẢ BÌNH THƯỜNG
            </button>
          )}

          <button
            onClick={() => navigate(`/medical-records/patient/${id}`)}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> XEM BẢN IN
          </button>

          {((isFinalizer && !isStaff) || isOphthalmologist) &&
            recordStatus !== MedicalRecordStatus.Finalized && (
              <button
                onClick={handleFinalize}
                disabled={isSubmitting || finalizeMutation.isPending}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-[10px] transition-all bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-50`}
              >
                <Lock className="w-3.5 h-3.5" /> KHÓA HỒ SƠ
              </button>
            )}

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={
              recordStatus === MedicalRecordStatus.Finalized ||
              !isDirty ||
              isSubmitting
            }
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-[10px] transition-all ${
              recordStatus === MedicalRecordStatus.Finalized ||
              !isDirty ||
              isSubmitting
                ? 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-black hover:shadow-lg hover:shadow-black/20'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSubmitting ? 'ĐANG LƯU...' : id ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU'}
          </button>
        </div>
      </nav>

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
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
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

      <main className="max-w-6xl mx-auto p-6 md:p-10 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-10 md:left-10 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>

        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-900">
            Hồ sơ bệnh án
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Tiêu chuẩn Bộ Y tế - Mẫu 23/BV-01
          </p>
          <div className="w-16 h-1 bg-cyan-500 mx-auto rounded-full mt-4" />
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center gap-y-4 gap-x-8">
            <div className="flex items-center gap-4 border-r border-slate-200 pr-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
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

            {recordStatus !== MedicalRecordStatus.DraftAdmin && (
              <div className="ml-auto flex items-center gap-3">
                <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase">
                      Admin Confirmed
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-4 bg-white border-b border-slate-100 flex items-center justify-center md:px-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveStep('admin')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all md:px-6 md:text-[11px] ${
                  activeStep === 'admin'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-4 h-4 shrink-0" /> I & II. HÀNH CHÍNH
              </button>
              <button
                type="button"
                onClick={() => isOphthalmologist && setActiveStep('clinical')}
                disabled={!isOphthalmologist}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all md:px-6 md:text-[11px] ${
                  activeStep === 'clinical'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-400 hover:text-slate-600'
                } disabled:opacity-50 disabled:hover:text-slate-400`}
              >
                <Stethoscope className="w-4 h-4 shrink-0" /> III. LÂM SÀNG
              </button>
              <button
                type="button"
                onClick={() =>
                  isOphthalmologist && setActiveStep('prescription')
                }
                disabled={!isOphthalmologist}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all md:px-6 md:text-[11px] ${
                  activeStep === 'prescription'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-400 hover:text-slate-600'
                } disabled:opacity-50 disabled:hover:text-slate-400`}
              >
                <Pill className="w-4 h-4 shrink-0" /> IV. ĐƠN THUỐC
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            {activeStep === 'admin' ? (
              <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Khoa
                    </label>
                    <input
                      {...register('khoa')}
                      disabled={isReadOnlyAdmin}
                      className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Giường
                    </label>
                    <input
                      {...register('giuong')}
                      disabled={isReadOnlyAdmin}
                      className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Số lưu trữ
                    </label>
                    <input
                      {...register('soLuuTru')}
                      disabled={isReadOnlyAdmin}
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
                        Họ và tên (In hoa){' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...register('fullName')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white p-4 rounded-2xl outline-none font-black uppercase text-slate-800 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Ngày sinh <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('birthDate')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Tuổi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...register('age')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-center"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Giới tính <span className="text-rose-500">*</span>
                      </label>
                      <select
                        {...register('gender')}
                        disabled={isReadOnlyAdmin}
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
                          disabled={isReadOnlyAdmin}
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
                      <select
                        {...register('ethnicity')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium appearance-none"
                      >
                        <option value="">Chọn dân tộc</option>
                        {ETHNICITIES.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Quốc tịch
                      </label>
                      <select
                        {...register('nationality')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium appearance-none"
                      >
                        <option value="">
                          {countries.length === 0
                            ? 'Đang tải quốc gia...'
                            : 'Chọn quốc tịch'}
                        </option>
                        {countries.map((c) => (
                          <option key={c.isoCode} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Nơi làm việc
                      </label>
                      <input
                        {...register('workplace')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Tỉnh / Thành phố{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register('provinceCode', { valueAsNumber: true })}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setValue('provinceCode', undefined);
                              setValue('province', '');
                              setValue('districtCode', undefined);
                              setValue('district', '');
                              setValue('wardCode', undefined);
                              setValue('ward', '');
                              return;
                            }
                            const code = parseInt(val);
                            const name =
                              provinces.find((p) => p.code === code)?.name ||
                              '';
                            setValue('provinceCode', code);
                            setValue('province', name);
                            setValue('districtCode', undefined);
                            setValue('district', '');
                            setValue('wardCode', undefined);
                            setValue('ward', '');
                          }}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium appearance-none"
                        >
                          <option value="">
                            {isLoadingGeo && provinces.length === 0
                              ? 'Đang tải tỉnh thành...'
                              : 'Chọn Tỉnh/Thành phố'}
                          </option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {isLoadingGeo && provinces.length === 0 && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Quận / Huyện <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register('districtCode', { valueAsNumber: true })}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setValue('districtCode', undefined);
                              setValue('district', '');
                              setValue('wardCode', undefined);
                              setValue('ward', '');
                              return;
                            }
                            const code = parseInt(val);
                            const name =
                              districts.find((d) => d.code === code)?.name ||
                              '';
                            setValue('districtCode', code);
                            setValue('district', name);
                            setValue('wardCode', undefined);
                            setValue('ward', '');
                          }}
                          disabled={isReadOnlyAdmin || !provinceCode}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium appearance-none"
                        >
                          <option value="">
                            {isLoadingGeo &&
                            districts.length === 0 &&
                            provinceCode
                              ? 'Đang tải quận huyện...'
                              : 'Chọn Quận/Huyện'}
                          </option>
                          {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        {isLoadingGeo &&
                          districts.length === 0 &&
                          provinceCode && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                              <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Phường / Xã <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register('wardCode', { valueAsNumber: true })}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setValue('wardCode', undefined);
                              setValue('ward', '');
                              return;
                            }
                            const code = parseInt(val);
                            const name =
                              wards.find((w) => w.code === code)?.name || '';
                            setValue('wardCode', code);
                            setValue('ward', name);
                          }}
                          disabled={isReadOnlyAdmin || !districtCode}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium appearance-none"
                        >
                          <option value="">
                            {isLoadingGeo && wards.length === 0 && districtCode
                              ? 'Đang tải phường xã...'
                              : 'Chọn Phường/Xã'}
                          </option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        {isLoadingGeo && wards.length === 0 && districtCode && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Số nhà, tên đường <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        {...register('address')}
                        disabled={isReadOnlyAdmin}
                        placeholder="Ví dụ: 123 Đường ABC..."
                        className="w-full bg-slate-50 pl-11 pr-4 py-4 rounded-2xl outline-none font-medium"
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
                            disabled={isReadOnlyAdmin}
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
                        disabled={isReadOnlyAdmin}
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
                        disabled={isReadOnlyAdmin}
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
                          disabled={isReadOnlyAdmin}
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
                          disabled={isReadOnlyAdmin}
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
                        disabled={isReadOnlyAdmin}
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
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Vào viện lần thứ mấy
                      </label>
                      <input
                        {...register('admissionCount')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                        placeholder="1, 2..."
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        13. Trực tiếp vào
                      </label>
                      <select
                        {...register('directEntry')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold appearance-none"
                      >
                        <option value="">Chọn hình thức</option>
                        <option value="Cấp cứu">Cấp cứu</option>
                        <option value="KKB">KKB</option>
                        <option value="Khoa điều trị">Khoa điều trị</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        14. Nơi giới thiệu
                      </label>
                      <input
                        {...register('referralPlace')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        15. Vào khoa
                      </label>
                      <input
                        {...register('department')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                        placeholder="Tên khoa..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        18. Ngày ra viện (dự kiến)
                      </label>
                      <input
                        type="date"
                        {...register('dischargeDate')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Hình thức ra viện
                      </label>
                      <select
                        {...register('dischargeType')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold appearance-none"
                      >
                        <option value="">Chọn hình thức</option>
                        <option value="Ra viện">Ra viện</option>
                        <option value="Xin về">Xin về</option>
                        <option value="Bỏ về">Bỏ về</option>
                        <option value="Đưa về">Đưa về</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        19. Tổng số ngày điều trị
                      </label>
                      <input
                        {...register('totalTreatmentDays')}
                        disabled={isReadOnlyAdmin}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Lý do vào viện <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      {...register('admissionReason')}
                      disabled={isReadOnlyAdmin}
                      className="w-full h-24 bg-slate-50 p-6 rounded-[2rem] outline-none text-sm font-medium resize-none focus:bg-white transition-all shadow-inner"
                      placeholder="Mô tả lý do khám..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      1. Quá trình bệnh lý
                    </label>
                    <textarea
                      {...register('diseaseProcess')}
                      disabled={isReadOnlyAdmin}
                      className="w-full h-32 bg-slate-50 p-6 rounded-[2rem] outline-none text-sm font-medium resize-none focus:bg-white transition-all shadow-inner"
                      placeholder="Mô tả diễn biến bệnh..."
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-cyan-600" />
                      <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                        III. Chẩn đoán & Tình trạng
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          20. Nơi chuyển đến
                        </label>
                        <input
                          {...register('transferDiagnosis')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Chẩn đoán nơi chuyển đến..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          21. KKB, Cấp cứu
                        </label>
                        <input
                          {...register('kkbDiagnosis')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Chẩn đoán tại KKB/Cấp cứu..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          22. Khi vào khoa ĐT
                        </label>
                        <input
                          {...register('departmentDiagnosis')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Chẩn đoán khi vào khoa điều trị..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          Tai biến / Biến chứng
                        </label>
                        <input
                          {...register('complications')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Các tai biến, biến chứng nếu có..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          Chẩn đoán sau phẫu thuật
                        </label>
                        <input
                          {...register('postOpDiagnosis')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Chẩn đoán sau mổ..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          Số ngày sau phẫu thuật
                        </label>
                        <input
                          {...register('postOpDays')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Số ngày..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          Số lần phẫu thuật
                        </label>
                        <input
                          {...register('opCount')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Lần..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          26. Kết quả điều trị
                        </label>
                        <select
                          {...register('treatmentResult')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold appearance-none"
                        >
                          <option value="">Chọn kết quả</option>
                          <option value="Khỏi">Khỏi</option>
                          <option value="Đỡ, giảm">Đỡ, giảm</option>
                          <option value="Không thay đổi">Không thay đổi</option>
                          <option value="Nặng hơn">Nặng hơn</option>
                          <option value="Tử vong">Tử vong</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                          Bệnh kèm theo
                        </label>
                        <input
                          {...register('companionDisease')}
                          disabled={isReadOnlyAdmin}
                          className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium"
                          placeholder="Các bệnh khác kèm theo..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!isOphthalmologist &&
                  recordStatus !== MedicalRecordStatus.Finalized && (
                    <div className="flex justify-end pt-10">
                      <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className={`px-10 py-4 rounded-2xl font-black text-xs transition-all shadow-xl uppercase tracking-widest flex items-center gap-2 ${
                          !isDirty || isSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20'
                        }`}
                      >
                        <Save className="w-4 h-4" />{' '}
                        {isSubmitting ? 'Đang lưu...' : 'Lưu hành chính'}
                      </button>
                    </div>
                  )}
              </div>
            ) : activeStep === 'clinical' ? (
              <div className="p-8 md:p-12 space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-6 py-2 bg-cyan-600 text-white font-black text-[10px] tracking-widest uppercase rounded-bl-3xl">
                      MẮT PHẢI
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị lực không kính{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register('rightEyeVisionNoGlass', {
                            required: true,
                          })}
                          disabled={isReadOnlyClinical}
                          placeholder="V"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-cyan-600 border border-slate-100 focus:border-cyan-500/20"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">
                          Định dạng: n/10 (vd 8/10). Có kính ≥ không kính.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị lực có kính{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register('rightEyeVisionWithGlass', {
                            required: true,
                          })}
                          disabled={isReadOnlyClinical}
                          placeholder="V"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-cyan-600 border border-slate-100 focus:border-cyan-500/20"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">
                          Định dạng: n/10 (vd 8/10). Có kính ≥ không kính.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Nhãn áp
                        </label>
                        <input
                          {...register('rightEyePressure')}
                          disabled={isReadOnlyClinical}
                          placeholder="mmHg"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-cyan-600 border border-slate-100 focus:border-cyan-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị trường
                        </label>
                        <input
                          {...register('rightEyeField')}
                          disabled={isReadOnlyClinical}
                          placeholder="..."
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-cyan-600 border border-slate-100 focus:border-cyan-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white font-black text-[10px] tracking-widest uppercase rounded-bl-3xl">
                      MẮT TRÁI
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị lực không kính{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register('leftEyeVisionNoGlass', {
                            required: true,
                          })}
                          disabled={isReadOnlyClinical}
                          placeholder="V"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-rose-500 border border-transparent focus:border-rose-500/20"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">
                          Định dạng: n/10 (vd 8/10). Có kính ≥ không kính.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị lực có kính{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register('leftEyeVisionWithGlass', {
                            required: true,
                          })}
                          disabled={isReadOnlyClinical}
                          placeholder="V"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-rose-500 border border-transparent focus:border-rose-500/20"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">
                          Định dạng: n/10 (vd 8/10). Có kính ≥ không kính.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Nhãn áp
                        </label>
                        <input
                          {...register('leftEyePressure')}
                          disabled={isReadOnlyClinical}
                          placeholder="mmHg"
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-rose-500 border border-transparent focus:border-rose-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">
                          Thị trường
                        </label>
                        <input
                          {...register('leftEyeField')}
                          disabled={isReadOnlyClinical}
                          placeholder="..."
                          className="w-full bg-white p-3 rounded-xl outline-none font-black text-xl text-rose-500 border border-transparent focus:border-rose-500/20"
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
                      disabled={isReadOnlyClinical}
                      className="w-full h-32 bg-slate-50 p-6 rounded-[2.5rem] outline-none text-sm font-medium resize-none border border-slate-100 focus:bg-white transition-all"
                      placeholder="Tiền sử bệnh..."
                    />
                    <textarea
                      {...register('familyHistory')}
                      disabled={isReadOnlyClinical}
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

                <div className="rounded-[2.5rem] border border-slate-300 bg-slate-50 p-8 shadow-md shadow-slate-300/25 ring-1 ring-slate-200/90 md:p-10 space-y-8">
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 shadow-sm">
                      <FileText className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 sm:text-sm">
                        Kết luận & chẩn đoán
                      </h2>
                      <p className="max-w-prose text-xs font-medium leading-relaxed text-slate-600">
                        Chẩn đoán cuối cùng dựa trên khám lâm sàng và kết quả AI
                        hỗ trợ.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Chẩn đoán chính
                      </label>
                      <input
                        {...register('finalDiagnosisMain')}
                        disabled={isReadOnlyClinical}
                        className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 md:p-5 md:text-base disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                        placeholder="Chẩn đoán..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Bệnh kèm theo
                      </label>
                      <input
                        {...register('companionDisease')}
                        disabled={isReadOnlyClinical}
                        className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                        placeholder="Bệnh kèm theo (nếu có)..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Hướng điều trị
                      </label>
                      <textarea
                        {...register('finalDiagnosisExtra')}
                        disabled={isReadOnlyClinical}
                        className="h-32 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                        placeholder="Lời dặn bác sĩ..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-8 md:grid-cols-2 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Bác sĩ khám
                      </label>
                      <input
                        {...register('doctorName')}
                        disabled={isReadOnlyClinical}
                        className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                        placeholder="Họ tên bác sĩ"
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-3 md:flex-row md:items-end md:justify-end">
                      {isOphthalmologist &&
                        recordStatus !== MedicalRecordStatus.Finalized && (
                          <button
                            type="button"
                            onClick={handleFinalize}
                            disabled={
                              isSubmitting || finalizeMutation.isPending
                            }
                            className={`flex items-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all md:px-10 ${
                              isSubmitting || finalizeMutation.isPending
                                ? 'cursor-not-allowed bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 shadow-none'
                                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                            }`}
                          >
                            <Lock className="h-4 w-4" /> Khóa hồ sơ
                          </button>
                        )}
                      <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className={`group flex items-center gap-2 rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all md:px-12 ${
                          !isDirty || isSubmitting
                            ? 'cursor-not-allowed bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 shadow-none'
                            : 'bg-cyan-600 text-white shadow-cyan-600/25 hover:bg-cyan-700'
                        }`}
                      >
                        {isSubmitting ? 'ĐANG LƯU...' : 'LƯU CHẨN ĐOÁN'}{' '}
                        <ChevronRight className="inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-cyan-600" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                      IV. Đơn thuốc
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
                    Kê đơn theo khám thực tế. Khi khóa hồ sơ, hệ thống kiểm tra
                    đủ thông tin từng dòng thuốc hoặc tùy chọn không kê thuốc.
                  </p>
                  <div className="rounded-[2.5rem] border border-slate-300 bg-slate-50 p-6 shadow-md shadow-slate-300/20 ring-1 ring-slate-200/90 md:p-8">
                    <PrescriptionTable
                      items={prescriptionItems}
                      onChange={(items) => {
                        setPrescriptionItems(items);
                        setPrescriptionErrors({});
                      }}
                      noMedicationPrescribed={noMedicationPrescribed}
                      onNoMedicationChange={setNoMedicationPrescribed}
                      prescriptionNote={prescriptionNote}
                      onNoteChange={setPrescriptionNote}
                      locked={recordStatus === MedicalRecordStatus.Finalized}
                      validationErrors={prescriptionErrors}
                      t={t}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 rounded-[2.5rem] border border-slate-300 bg-slate-100/80 p-6 shadow-sm ring-1 ring-slate-200/90 md:grid-cols-2 md:p-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Bác sĩ khám
                      </label>
                      <input
                        {...register('doctorName')}
                        disabled={isReadOnlyClinical}
                        className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                        placeholder="Họ tên bác sĩ"
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-3 md:flex-row md:items-end md:justify-end">
                      {recordStatus !== MedicalRecordStatus.Finalized && (
                        <button
                          type="button"
                          onClick={handleFinalize}
                          disabled={isSubmitting || finalizeMutation.isPending}
                          className={`flex items-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all md:px-10 ${
                            isSubmitting || finalizeMutation.isPending
                              ? 'cursor-not-allowed bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 shadow-none'
                              : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                          }`}
                        >
                          <Lock className="h-4 w-4" /> Khóa hồ sơ
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className={`group flex items-center gap-2 rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all md:px-12 ${
                          !isDirty || isSubmitting
                            ? 'cursor-not-allowed bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 shadow-none'
                            : 'bg-cyan-600 text-white shadow-cyan-600/25 hover:bg-cyan-700'
                        }`}
                      >
                        {isSubmitting ? 'ĐANG LƯU...' : 'LƯU CHẨN ĐOÁN'}{' '}
                        <ChevronRight className="inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        open={showFinalizeModal}
        title="Khóa hồ sơ & Gửi tới Thu ngân"
        message="Thao tác này sẽ: (1) Lưu chẩn đoán và đơn thuốc, (2) Khóa hồ sơ bệnh án, (3) Gửi bệnh nhân đến quầy Thu ngân. Sau khi khóa sẽ không thể chỉnh sửa. Bạn có chắc chắn?"
        confirmLabel="Xác nhận Finalize & Gửi Thu ngân"
        cancelLabel="Hủy"
        isLoading={
          finalizeMutation.isPending || updateDiagnosisMutation.isPending
        }
        tone="danger"
        onConfirm={onFinalizeConfirm}
        onCancel={() => setShowFinalizeModal(false)}
      />
    </div>
  );
}
