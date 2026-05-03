import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft, Save, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { medicalRecordApi } from '../api/medical-record.api';
import { masterDataApi, District, Ward } from '../api/master-data.api';
import { AuraLogo } from '@/components/ui/aura-logo';
import { resolvePathWithLocale } from '@/i18n/middleware';
import ethnicities from '../data/ethnicities.json';
import provinces from '../data/provinces.json';
import nationalities from '../data/nationalities.json';

export default function ErmFormPatient() {
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
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<any>(location.state?.formData || {});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [status, setStatus] = useState<string>('');
  const isFinalized = status === 'Finalized';

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
        diaThiBacMau: 'Bạc màu',
        tanMachGai: 'Tân mạch gai',
        hoangDiemBT: 'Hoàng điểm BT',
        matAnhHD: 'Mất ánh HĐ',
        phuKhuTru: 'Phù khu trú',
        phuToaLan: 'Phù tỏa lan',
        lo: 'Lỗ',
        loLop: 'Lỗ lớp',
        giaLo: 'Giả lỗ',
        seoHDCo: 'Sẹo HĐ có',
        seoHDKhong: 'Sẹo HĐ không',
        bongVM: 'Bong VM',
        rachVM: 'Rách VM',
        thoaiHoaVMChuBien: 'Thoái hóa VM chu biên',
        thoaiHoaVMTrungTam: 'Thoái hóa VM trung tâm',
      },
    },
  };

  useEffect(() => {
    const loadRecord = async () => {
      if (id && id !== 'new') {
        setIsLoading(true);
        try {
          let record: any = null;
          const isPatientRoute = window.location.pathname.includes('/patient/');

          if (isPatientRoute) {
            // Try fetching by patient ID
            const response = await medicalRecordApi.getByPatient(id);
            const records = response.data.data;
            if (Array.isArray(records) && records.length > 0) {
              record = records[0];
            } else if (records && !Array.isArray(records)) {
              record = records;
            } else {
              // If empty, it might actually be a record ID passed to a patient route
              try {
                const fallbackRes = await medicalRecordApi.getById(id);
                if (fallbackRes.data.success) {
                  record = fallbackRes.data.data;
                }
              } catch (e) {
                // Ignore fallback error
              }
            }
          } else {
            const response = await medicalRecordApi.getById(id);
            record = response.data.data;
          }

          if (record) {
            setStatus(record.status || record.Status || '');
            // Handle both camelCase and PascalCase from .NET backend
            const adminJson =
              record.administrativeDataJson ||
              record.AdministrativeDataJson ||
              '{}';
            const clinicalJson =
              record.clinicalDataJson || record.ClinicalDataJson || '{}';

            const adminData = JSON.parse(adminJson || '{}');
            const clinicalData = JSON.parse(clinicalJson || '{}');
            const patient = record.patient || record.Patient || {};

            // Calculate age from birthday if needed
            const birthday =
              patient.birthday || patient.Birthday || adminData.birthDate;
            let age = adminData.age || '';
            if (birthday && !age) {
              const birthYear = new Date(birthday).getFullYear();
              const currentYear = new Date().getFullYear();
              age = (currentYear - birthYear).toString();
            }

            const mappedClinical: any = {};
            if (clinicalData.rightEye) {
              SECTION_KEYS.forEach((key) => {
                if (clinicalData.rightEye[key]) {
                  mappedClinical[`right_${key}`] = clinicalData.rightEye[key];
                }
              });
            }
            if (clinicalData.leftEye) {
              SECTION_KEYS.forEach((key) => {
                if (clinicalData.leftEye[key]) {
                  mappedClinical[`left_${key}`] = clinicalData.leftEye[key];
                }
              });
            }

            const mergedData: any = {
              // Default patient info from patient object if not in adminData
              fullName:
                patient.fullName || patient.FullName || adminData.fullName,
              birthDate: birthday,
              gender: patient.gender || patient.Gender || adminData.gender,
              address: patient.address || patient.Address || adminData.address,
              age,
              ...adminData,
              ...clinicalData,
              ...mappedClinical,
              finalDiagnosisMain:
                record.finalDiagnosis ||
                record.FinalDiagnosis ||
                clinicalData.finalDiagnosis,
              finalDiagnosisExtra:
                record.treatmentPlan ||
                record.TreatmentPlan ||
                clinicalData.treatmentPlan,
              maYT: record.medicalRecordNumber || record.MedicalRecordNumber,
              patient: patient,
            };

            // Normalize nationality
            if (mergedData.nationality === 'Vietnam') {
              mergedData.nationality = 'Việt Nam';
            }

            setData(mergedData);

            // Fetch locations if codes are present
            if (mergedData.provinceCode) {
              const dRes = await masterDataApi.getDistricts(
                mergedData.provinceCode
              );
              setDistricts(dRes);
              if (mergedData.districtCode) {
                const wRes = await masterDataApi.getWards(
                  mergedData.districtCode
                );
                setWards(wRes);
              }
            }
          }
        } catch (_error) {
          console.error(_error);
          toast.error('Không thể tải hồ sơ bệnh án');
        } finally {
          setIsLoading(false);
        }
      } else if (location.state?.formData) {
        setData(location.state.formData);
      }
    };

    loadRecord();
  }, [id]);

  const handleChange = async (field: string, value: any) => {
    if (isFinalized) return;
    setData((prev: any) => ({ ...prev, [field]: value }));

    // Handle cascading locations
    if (field === 'provinceCode') {
      setData((prev: any) => ({
        ...prev,
        provinceCode: value,
        province: provinces.find((p) => p.code === value)?.name || '',
        districtCode: '',
        district: '',
        wardCode: '',
        ward: '',
      }));
      setWards([]);
      if (value) {
        const dRes = await masterDataApi.getDistricts(value);
        setDistricts(dRes);
      } else {
        setDistricts([]);
      }
    } else if (field === 'districtCode') {
      setData((prev: any) => ({
        ...prev,
        districtCode: value,
        district: districts.find((d) => d.code === value)?.name || '',
        wardCode: '',
        ward: '',
      }));
      if (value) {
        const wRes = await masterDataApi.getWards(value);
        setWards(wRes);
      } else {
        setWards([]);
      }
    } else if (field === 'wardCode') {
      setData((prev: any) => ({
        ...prev,
        wardCode: value,
        ward: wards.find((w) => w.code === value)?.name || '',
      }));
    }
  };

  const renderClinicalOptions = (eyeData: any, sectionKey: string) => {
    if (!eyeData) return null;

    const options = [];
    const config = sectionConfig[sectionKey];

    // Normal option
    options.push(
      <span key="normal" className="mr-3 whitespace-nowrap">
        Bình thường {renderSquare(!!eyeData.normal)}
      </span>
    );

    // Checks from config
    if (eyeData.checks && config?.checks) {
      Object.entries(config.checks).forEach(([key, label]) => {
        const isChecked = !!eyeData.checks[key];
        options.push(
          <span key={key} className="mr-3 whitespace-nowrap">
            {label} {renderSquare(isChecked)}
          </span>
        );
      });
    }

    // Other/Additional fields
    if (eyeData.other !== undefined) {
      options.push(
        <span key="other" className="mr-3 whitespace-nowrap">
          Khác:{' '}
          <span className="underline italic ml-1">
            {eyeData.other || '...'}
          </span>
        </span>
      );
    }

    return <div className="flex flex-wrap gap-x-2 gap-y-1">{options}</div>;
  };

  const handleSave = async () => {
    if (!id || id === 'new') {
      toast.warning('Vui lòng tạo hồ sơ từ luồng tiếp nhận/check-in');
      return;
    }

    try {
      await medicalRecordApi.updateAdministrative(id, {
        administrativeDataJson: JSON.stringify(data),
      });
      toast.success('Thông tin hành chính đã được lưu!');
      navigate(resolvePathWithLocale('/clinic-staff/queue'));
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || id === 'new') {
      toast.warning('Hồ sơ chưa được tạo. Không thể tải PDF.');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const response = await medicalRecordApi.downloadPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });

      const contentDisposition = response.headers['content-disposition'] as
        | string
        | undefined;
      const fallbackFileName = `EMR_${data.maYT || id}.pdf`;
      const fileNameMatch = contentDisposition?.match(
        /filename\*?=(?:UTF-8''|\")?([^\";]+)/i
      );
      const fileName = fileNameMatch?.[1]
        ? decodeURIComponent(fileNameMatch[1].replace(/\"/g, '').trim())
        : fallbackFileName;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải EMR PDF thành công.');
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải EMR PDF. Vui lòng thử lại.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const renderSquare = (checked: boolean, field?: string, value?: string) => (
    <span
      onClick={() => {
        if (isFinalized) return;
        if (field) {
          if (value) {
            handleChange(field, value);
          } else {
            handleChange(field, !checked);
          }
        }
      }}
      className="inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-[11px] font-black mr-1 leading-none cursor-pointer"
    >
      {checked ? 'X' : ''}
    </span>
  );

  const renderDateDigits = (dateStr: string) => {
    if (!dateStr) return Array(8).fill(' ');
    // Handle ISO strings from backend
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing DD/MM/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const d = parts[0].padStart(2, '0');
          const m = parts[1].padStart(2, '0');
          const y = parts[2];
          return (d + m + y).split('');
        }
      }
      return Array(8).fill(' ');
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return (day + month + year).split('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 no-print text-black selection:bg-primary/20 relative">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <AuraLogo size="lg" className="animate-pulse" />
          <p className="text-sm font-bold text-slate-500 animate-bounce">
            ĐANG TẢI THÔNG TIN BỆNH ÁN...
          </p>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 flex gap-4 no-print z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-white border border-slate-200 px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" /> QUAY LẠI
        </button>
        {!isFinalized && (
          <button
            onClick={handleSave}
            className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-primary/90 shadow-xl transition-all"
          >
            <Save className="w-4 h-4" /> LƯU THÔNG TIN
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-black shadow-xl transition-all"
        >
          <Printer className="w-4 h-4" /> IN BỆNH ÁN
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="bg-emerald-600 text-white px-8 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 shadow-xl transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloadingPdf ? 'ĐANG TẢI PDF...' : 'TẢI PDF'}
        </button>
      </div>

      <main
        className="max-w-[850px] mx-auto bg-white p-[50px] shadow-2xl print:p-0 print:shadow-none print:border-none border border-slate-200 leading-tight"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* HEADER */}
        <div className="grid grid-cols-12 mb-8 items-start">
          <div className="col-span-4 space-y-1">
            <AuraLogo size="sm" variant="dark" />
            <div className="text-[10px] font-bold uppercase space-y-0.5 mt-2">
              <p>Sở Y tế: .................................</p>
              <p>Bệnh viện: AURA DIGITAL CLINIC</p>
            </div>
          </div>

          <div className="col-span-4 text-center">
            <h1 className="text-xl font-bold uppercase tracking-tight">
              BỆNH ÁN MẮT
            </h1>
            <p className="text-[12px] font-bold uppercase mt-1">
              (Dùng cho điều trị ngoại trú)
            </p>
          </div>

          <div className="col-span-4 text-[11px] font-bold text-right space-y-1">
            <p>MS: 23/BV-01</p>
            <p>
              Số lưu trữ:{' '}
              <span className="inline-block border-b border-black w-24 text-center">
                {data.soLuuTru || '...............'}
              </span>
            </p>
            <p>
              Mã YT:{' '}
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={data.maYT || ''}
                onChange={(e) => handleChange('maYT', e.target.value)}
                disabled={isFinalized}
                className="w-32 border-b border-black outline-none bg-transparent text-center font-bold"
                placeholder="...................."
              />
            </p>
          </div>
        </div>

        <div className="flex justify-between text-[12px] font-bold mb-6 italic">
          <p>
            Khoa:{' '}
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={data.khoa || ''}
              onChange={(e) => handleChange('khoa', e.target.value)}
              disabled={isFinalized}
              className="border-b border-black w-[150px] text-center outline-none bg-transparent font-bold not-italic"
              placeholder="................"
            />
          </p>
          <p>
            Giường:{' '}
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={data.giuong || ''}
              onChange={(e) => handleChange('giuong', e.target.value)}
              disabled={isFinalized}
              className="border-b border-black w-[80px] text-center outline-none bg-transparent font-bold not-italic"
              placeholder="............"
            />
          </p>
        </div>

        {/* I. HÀNH CHÍNH */}
        <section className="space-y-1.5 mb-6">
          <div className="flex justify-between items-end border-b-2 border-black pb-0.5 mb-2">
            <h2 className="text-lg font-bold uppercase">I. HÀNH CHÍNH</h2>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span>
                Tuổi <span className="text-rose-500">*</span>
              </span>
              <div className="flex gap-0.5">
                <span className="border border-black px-1.5 min-w-[20px] text-center">
                  {data.age?.charAt(0) || ' '}
                </span>
                <span className="border border-black px-1.5 min-w-[20px] text-center">
                  {data.age?.charAt(1) || ' '}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 text-[12.5px] font-medium leading-relaxed gap-y-1">
            <div className="col-span-8 flex items-end">
              1. Họ và tên <span className="text-rose-500">*</span>:{' '}
              <input
                type="text"
                value={data.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                disabled={isFinalized}
                className="uppercase font-bold border-b border-black flex-1 ml-1 px-2 h-5 outline-none bg-transparent"
                placeholder="..………………………...................................."
              />
            </div>
            <div className="col-span-4 flex items-center justify-end gap-2">
              2. Ngày sinh <span className="text-rose-500">*</span>{' '}
              <div className="flex gap-0.5">
                {renderDateDigits(data.birthDate).map((digit, i) => (
                  <span
                    key={i}
                    className={`border border-black px-1 min-w-[16px] text-center font-bold ${i === 2 || i === 4 ? 'ml-1' : ''}`}
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              3. Giới <span className="text-rose-500">*</span>:{' '}
              {renderSquare(data.gender === 'Nam', 'gender')} Nam{' '}
              {renderSquare(data.gender === 'Nữ', 'gender')} Nữ
              <span className="ml-10">4. Nghề nghiệp:</span>{' '}
              <input
                type="text"
                value={data.job || ''}
                onChange={(e) => handleChange('job', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 mx-2 h-5 outline-none bg-transparent"
                placeholder=".............................................."
              />
              <div className="flex gap-0.5">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              5. Dân tộc:{' '}
              <select
                value={data.ethnicity || ''}
                onChange={(e) => handleChange('ethnicity', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black min-w-[120px] px-2 h-5 outline-none bg-transparent appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="">Chọn dân tộc...</option>
                {ethnicities.map((e) => (
                  <option key={e.code} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-0.5 mx-2">
                <span className="border border-black px-1 min-w-[16px] flex items-center justify-center font-bold">
                  {ethnicities.findIndex((e) => e.name === data.ethnicity) +
                    1 || ' '}
                </span>
              </div>
              6. Ngoại kiều:{' '}
              <select
                value={data.nationality || ''}
                onChange={(e) => handleChange('nationality', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="">Chọn quốc tịch...</option>
                {nationalities.map((n) => (
                  <option key={n.code} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-0.5 ml-2">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              7. Địa chỉ <span className="text-rose-500">*</span>:{' '}
              <input
                type="text"
                value={data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent"
                placeholder="Số nhà …… Thôn, phố ……"
              />
              Xã, phường <span className="text-rose-500">*</span>:{' '}
              <select
                value={data.wardCode || ''}
                onChange={(e) => handleChange('wardCode', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent mx-2 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="">Chọn Phường/Xã...</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-12 flex items-center">
              Huyện (Quận, thị xã) <span className="text-rose-500">*</span>:{' '}
              <select
                value={data.districtCode || ''}
                onChange={(e) => handleChange('districtCode', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent mx-2 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="">Chọn Quận/Huyện...</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
              Tỉnh (thành phố) <span className="text-rose-500">*</span>:{' '}
              <select
                value={data.provinceCode || ''}
                onChange={(e) => handleChange('provinceCode', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent mx-2 appearance-none cursor-pointer hover:bg-slate-50 transition-colors font-bold"
              >
                <option value="">Chọn tỉnh/thành...</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 flex items-center">
              8. Nơi làm việc:{' '}
              <input
                type="text"
                value={data.workplace || ''}
                onChange={(e) => handleChange('workplace', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent"
                placeholder=".................................................................."
              />
              <span className="ml-4 mr-2">9. Đối tượng:</span>
              1.BHYT
              {renderSquare(
                data.objectType === 'BHYT',
                'objectType',
                'BHYT'
              )}{' '}
              2.Thu phí
              {renderSquare(
                data.objectType === 'Thu phí',
                'objectType',
                'Thu phí'
              )}{' '}
              3.Miễn
              {renderSquare(
                data.objectType === 'Miễn',
                'objectType',
                'Miễn'
              )}{' '}
              4.Khác
              {renderSquare(data.objectType === 'Khác', 'objectType', 'Khác')}
            </div>
            <div className="col-span-12 flex items-center">
              10.BHYT giá trị đến ngày
              <input
                type="text"
                value={data.bhytExpiry?.split('-')[2] || '……'}
                onChange={(e) => {
                  const parts = (data.bhytExpiry || '--').split('-');
                  parts[2] = e.target.value;
                  handleChange('bhytExpiry', parts.join('-'));
                }}
                disabled={isFinalized}
                className="border-b border-black w-8 text-center h-5 outline-none bg-transparent mx-1"
              />
              tháng
              <input
                type="text"
                value={data.bhytExpiry?.split('-')[1] || '……'}
                onChange={(e) => {
                  const parts = (data.bhytExpiry || '--').split('-');
                  parts[1] = e.target.value;
                  handleChange('bhytExpiry', parts.join('-'));
                }}
                disabled={isFinalized}
                className="border-b border-black w-8 text-center h-5 outline-none bg-transparent mx-1"
              />
              năm 20
              <input
                type="text"
                value={data.bhytExpiry?.split('-')[0]?.substring(2) || '…..'}
                onChange={(e) => {
                  const parts = (data.bhytExpiry || '2026--').split('-');
                  parts[0] = '20' + e.target.value;
                  handleChange('bhytExpiry', parts.join('-'));
                }}
                disabled={isFinalized}
                className="border-b border-black w-8 text-center h-5 outline-none bg-transparent mx-1"
              />
              Số thẻ BHYT:
              <input
                type="text"
                value={data.bhytNumber || ''}
                onChange={(e) => handleChange('bhytNumber', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent mx-2"
                placeholder="………..........................................….."
              />
            </div>
            <div className="col-span-12 flex items-center">
              11. Họ tên, địa chỉ người nhà khi cần báo tin:
              <input
                type="text"
                value={data.relativeName || ''}
                onChange={(e) => handleChange('relativeName', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent mx-2"
                placeholder="……..………………………….........................................."
              />
            </div>
            <div className="col-span-12 flex items-center">
              Số điện thoại liên lạc:
              <input
                type="text"
                value={data.relativePhone || ''}
                onChange={(e) => handleChange('relativePhone', e.target.value)}
                disabled={isFinalized}
                className="border-b border-black w-64 px-2 h-5 outline-none bg-transparent mx-2"
                placeholder="…………..........................................."
              />
            </div>
          </div>
        </section>

        {/* II. QUẢN LÝ NGƯỜI BỆNH */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-0.5 mb-1">
            II. QUẢN LÝ NGƯỜI BỆNH
          </h2>
          <div className="border border-black text-[12px]">
            <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
              <div className="p-1.5 space-y-1">
                <p>
                  12. Vào viện {data.admissionTime?.split(':')[0] || '……'} giờ{' '}
                  {data.admissionTime?.split(':')[1] || '……'} phút ngày{' '}
                  {data.admissionDate
                    ? new Date(data.admissionDate).getDate()
                    : '….'}{' '}
                  /{' '}
                  {data.admissionDate
                    ? new Date(data.admissionDate).getMonth() + 1
                    : '….'}{' '}
                  /{' '}
                  {data.admissionDate
                    ? new Date(data.admissionDate).getFullYear()
                    : '….'}{' '}
                  13.
                </p>
                <p>
                  Trực tiếp vào: 1.Cấp cứu
                  {renderSquare(data.directEntry === 'Cấp cứu')} 2.KKB
                  {renderSquare(data.directEntry === 'KKB')} 3.Khoa điều trị
                  {renderSquare(data.directEntry === 'Khoa điều trị')}
                </p>
              </div>
              <div className="p-1.5 space-y-1">
                <p>
                  14. Nơi giới thiệu: 1. Cơ quan y tế
                  {renderSquare(data.admissionType === 'Cơ quan y tế')} 2.Tự đến
                  {renderSquare(data.admissionType === 'Tự đến')} 3.Khác
                  {renderSquare(data.admissionType === 'Khác')}
                </p>
                <p>
                  - Vào viện do bệnh này lần thứ mấy{' '}
                  {renderSquare(!!data.admissionCount)}{' '}
                  {data.admissionCount || ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-black min-h-[140px]">
              <div className="divide-y divide-black">
                <div className="p-1.5 h-14 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    15. Vào khoa{' '}
                    <div className="border border-black w-24 h-10 flex flex-col items-center justify-center font-bold text-[10px] uppercase">
                      <span className="border-b border-black w-full text-center">
                        Khoa
                      </span>
                      <span>{data.department || ' '}</span>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-0.5 text-right font-bold">
                    <p>ng / th / năm Số ngày ĐT</p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                  </div>
                </div>
                <div className="p-1.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    16. Chuyển{' '}
                    <div className="border border-black w-24 h-10 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-tighter">
                      <span className="border-b border-black w-full text-center">
                        Khoa
                      </span>
                      <span> </span>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-1 text-right mt-2">
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-2">
                <p>
                  17. Chuyển viện: 1. Tuyến trên
                  {renderSquare(data.transferHospital === 'Tuyến trên')} 2.
                  Tuyến dưới
                  {renderSquare(data.transferHospital === 'Tuyến dưới')} 3.CK
                  {renderSquare(data.transferHospital === 'CK')}
                </p>
                <p>
                  - Chuyển đến{' '}
                  <span className="inline-block border-b border-dotted border-black w-3/4 ml-2 leading-tight">
                    {data.transferTo ||
                      '............................................................................'}
                  </span>
                </p>
                <p className="mt-4">
                  18. Ra viện{' '}
                  <span className="border-b border-dotted border-black px-2">
                    {data.dischargeDate
                      ? data.dischargeDate.split('-')[2]
                      : '............'}
                  </span>{' '}
                  /{' '}
                  <span className="border-b border-dotted border-black px-2">
                    {data.dischargeDate
                      ? data.dischargeDate.split('-')[1]
                      : '............'}
                  </span>{' '}
                  /{' '}
                  <span className="border-b border-dotted border-black px-2">
                    {data.dischargeDate
                      ? data.dischargeDate.split('-')[0]
                      : '............'}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div className="space-y-1">
                    <p>
                      1. Ra viện{' '}
                      {renderSquare(data.dischargeType === 'Ra viện')}
                    </p>
                    <p>
                      2. Xin về {renderSquare(data.dischargeType === 'Xin về')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      3. Bỏ về {renderSquare(data.dischargeType === 'Bỏ về')}
                    </p>
                    <p>
                      4. Đưa về {renderSquare(data.dischargeType === 'Đưa về')}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2">
                  19. Tổng số ngày điều trị.{' '}
                  <span className="font-bold border-b border-black px-4 min-w-[50px] text-center">
                    {data.totalTreatmentDays || '..........'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* III. CHẨN ĐOÁN */}
        <section className="mb-6">
          <div className="flex justify-between items-end border-b-2 border-black pb-0.5 mb-1">
            <h2 className="text-lg font-bold uppercase">III. CHẨN ĐOÁN</h2>
            <div className="flex gap-32 mr-20 text-[11px] font-bold">
              <span>MÃ</span>
              <span>MÃ</span>
            </div>
          </div>

          <div className="border border-black text-[12px]">
            <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
              <div className="p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="flex-1">
                    20. Nơi chuyển đến:{' '}
                    <span className="font-bold border-b border-black border-dotted px-2">
                      {data.transferDiagnosis ||
                        '.................................................'}
                    </span>
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="flex-1">
                    21. KKB, Cấp cứu:{' '}
                    <span className="font-bold border-b border-black border-dotted px-2">
                      {data.kkbDiagnosis ||
                        '....................................................'}
                    </span>
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="flex-1">
                    22. Khi vào khoa điều trị:{' '}
                    <span className="font-bold border-b border-black border-dotted px-2">
                      {data.departmentDiagnosis ||
                        '.........................................'}
                    </span>
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <p className="flex items-center gap-6 mt-2">
                  - Tai biến: {renderSquare(!!data.complications)} - Biến chứng:{' '}
                  {renderSquare(false)}
                </p>
                <p className="text-[11px] font-bold italic ml-4">
                  Chi tiết:{' '}
                  {data.complications || '................................'}
                </p>
                <div className="grid grid-cols-2 text-[11px] gap-y-1 pl-4 mt-2 font-bold">
                  <p>1. Do phẫu thuật {renderSquare(false)}</p>
                  <p>2. Do gây mê {renderSquare(false)}</p>
                  <p>3. Do nhiễm khuẩn {renderSquare(false)}</p>
                  <p>4. Khác {renderSquare(false)}</p>
                </div>
              </div>
              <div className="p-2 space-y-2">
                <p className="font-bold">25. Ra viện</p>
                <div className="pl-2 space-y-1">
                  <p>+ Bệnh chính: (tổn thương)</p>
                  <p className="border-b border-black italic min-h-[20px] font-bold">
                    {data.finalDiagnosisMain ||
                      '........................................................................'}
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p className="text-center italic mt-1 text-[11px]">
                    (nguyên nhân)
                    ........................................................
                  </p>
                  <div className="flex justify-end gap-0.5 pr-10">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p className="mt-1">
                    + Bệnh kèm theo:{' '}
                    <span className="font-bold">
                      {data.companionDisease ||
                        '................................................'}
                    </span>
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p>
                    + Chẩn đoán trước phẫu thuật:{' '}
                    <span className="font-bold">
                      {data.preOpDiagnosis ||
                        '.........................................'}
                    </span>
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p>
                    + Chẩn đoán sau phẫu thuật:{' '}
                    <span className="font-bold">
                      {data.postOpDiagnosis ||
                        '..........................................'}
                    </span>
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-1 px-2 border-b border-black text-[11px] font-bold">
              <p>
                23. Tổng số ngày điều trị sau phẫu thuật:{' '}
                <span className="font-black px-2">
                  {data.postOpDays || '...'}
                </span>
              </p>
              <div className="flex gap-0.5">
                <span className="border border-black px-1.5">
                  {data.postOpDays?.toString().padStart(3, '0').charAt(0) ||
                    ' '}
                </span>
                <span className="border border-black px-1.5">
                  {data.postOpDays?.toString().padStart(3, '0').charAt(1) ||
                    ' '}
                </span>
                <span className="border border-black px-1.5">
                  {data.postOpDays?.toString().padStart(3, '0').charAt(2) ||
                    ' '}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-1 px-2 text-[11px] font-bold">
              <p>
                24. Tổng số lần phẫu thuật:{' '}
                <span className="font-black px-2">{data.opCount || '...'}</span>
              </p>
              <div className="flex gap-0.5 mr-28">
                <span className="border border-black px-1.5">
                  {data.opCount?.toString().padStart(2, '0').charAt(0) || ' '}
                </span>
                <span className="border border-black px-1.5">
                  {data.opCount?.toString().padStart(2, '0').charAt(1) || ' '}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* III. TÌNH TRẠNG RA VIỆN */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-0.5 mb-1">
            III. TÌNH TRẠNG RA VIỆN
          </h2>
          <div className="border border-black text-[12.5px]">
            <div className="grid grid-cols-2 divide-x divide-black min-h-[120px]">
              <div className="p-2 space-y-1">
                <p className="font-bold mb-1">26. Kết quả điều trị</p>
                <div className="grid grid-cols-2 gap-y-1 pl-4">
                  <p>
                    1. Khỏi{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    4. Nặng hơn{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    2. Đỡ , giảm{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    5. Tử vong{' '}
                    <span className="border border-black px-2.5 ml-6"> </span>
                  </p>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-bold">
                  28. Tình hình tử vong: .........giờ. ........ phút
                  Ngày........tháng..........năm...........
                </p>
                <div className="flex gap-4 pl-4 mt-1">
                  <p>1. Do bệnh {renderSquare(false)}</p>
                  <p>2. Do tai biến điều trị {renderSquare(false)}</p>
                  <p>3. Khác {renderSquare(false)}</p>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9.5px] pt-3 border-t border-black border-dotted mt-2 font-bold uppercase">
                  <p>1. Trong 24 giờ vào viện {renderSquare(false)}</p>
                  <p>2. trong 48 giờ vào viện {renderSquare(false)}</p>
                  <p>3. Trong 72 giờ vào viện {renderSquare(false)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start mt-12 text-[14px] px-10">
            <div className="text-center w-64 space-y-20">
              <h3 className="font-bold text-base uppercase">
                Giám đốc bệnh viện
              </h3>
              <p className="text-slate-400">
                Họ và
                tên...........................................................
              </p>
            </div>
            <div className="text-center w-64 space-y-20">
              <div className="space-y-1">
                <p className="italic text-[12px]">
                  Ngày........ tháng........ năm 20.......
                </p>
                <h3 className="font-bold text-base uppercase">Trưởng khoa</h3>
              </div>
              <p className="text-slate-400">
                Họ và
                tên...........................................................
              </p>
            </div>
          </div>
        </section>

        {/* PAGE 2: BỆNH ÁN CHI TIẾT */}
        <div className="pt-24 border-t-8 border-slate-100 break-before-page space-y-10">
          <h2 className="text-2xl font-bold text-center uppercase tracking-tight">
            A. BỆNH ÁN
          </h2>

          <div className="space-y-6 text-[14px] font-medium leading-relaxed px-2">
            <p>
              <span className="font-bold uppercase">
                I. LÝ DO VÀO VIỆN <span className="text-rose-500">*</span>:
              </span>{' '}
              <span className="border-b border-black flex-1 min-w-[400px] inline-block h-5 mx-2">
                {data.admissionReason ||
                  '...........................................................................'}
              </span>{' '}
              ngày thứ. .......... của bệnh
            </p>

            <div className="space-y-2">
              <p className="font-bold uppercase">II. HỎI BỆNH:</p>
              <div className="space-y-1">
                <p>
                  1. Quá trình bệnh lý:{' '}
                  <span className="font-bold border-b border-black border-dotted px-2">
                    {data.diseaseProcess ||
                      '...........................................................................'}
                  </span>
                </p>
                <div className="border-b border-black h-7 w-full"></div>
                <div className="border-b border-black h-7 w-full"></div>
                <div className="border-b border-black h-7 w-full"></div>
              </div>
              <div className="space-y-4 mt-4">
                <p>2. Tiền sử:</p>
                <p>
                  Bản thân:{' '}
                  <span className="font-bold border-b border-black border-dotted px-2">
                    {data.medicalHistory ||
                      '...........................................................................'}
                  </span>
                  <span className="border-b border-black block w-full h-8"></span>
                </p>
                <p>
                  Gia đình:{' '}
                  <span className="font-bold border-b border-black border-dotted px-2">
                    {data.familyHistory ||
                      '...........................................................................'}
                  </span>
                  <span className="border-b border-black block w-full h-8"></span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-bold uppercase">III. KHÁM BỆNH</p>
              <p className="font-bold ml-6 underline">1. Khám chuyên khoa</p>

              <div className="border border-black overflow-hidden mx-4">
                <table className="w-full border-collapse">
                  <tr className="divide-x divide-black border-b border-black h-9 bg-white">
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Thị lực vào viện: Không kính: MP{' '}
                      <span className="underline">
                        {data.rightEyeVisionNoGlass || '..........'}
                      </span>{' '}
                      MT{' '}
                      <span className="underline">
                        {data.leftEyeVisionNoGlass || '........'}
                      </span>
                    </td>
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Nhãn áp vào viện MP{' '}
                      <span className="underline">
                        {data.rightEyePressure || '...............'}
                      </span>{' '}
                      MT{' '}
                      <span className="underline">
                        {data.leftEyePressure || '..............'}
                      </span>
                    </td>
                  </tr>
                  <tr className="divide-x divide-black h-9">
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Có kính : MP{' '}
                      <span className="underline">
                        {data.rightEyeVisionWithGlass || '..........'}
                      </span>{' '}
                      MT{' '}
                      <span className="underline">
                        {data.leftEyeVisionWithGlass || '.........'}
                      </span>
                    </td>
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Thị trường MP{' '}
                      <span className="underline">
                        {data.rightEyeField || '...............'}
                      </span>{' '}
                      MT{' '}
                      <span className="underline">
                        {data.leftEyeField || '...............'}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              {/* SIDE BY SIDE TABLE */}
              <div className="border border-black mx-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="divide-x divide-black border-b border-black font-bold uppercase text-center h-10 bg-white">
                      <th className="w-1/2 text-base">MẮT PHẢI</th>
                      <th className="w-1/2 text-base">MẮT TRÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black text-[12px] leading-snug">
                    {[
                      { id: 1, key: 'miMat', label: 'Mi mắt' },
                      { id: 2, key: 'ketMac', label: 'Kết mạc' },
                      { id: 3, key: 'giacMac', label: 'Giác mạc' },
                      { id: 4, key: 'cungMac', label: 'Củng mạc' },
                      { id: 5, key: 'tienPhong', label: 'Tiền phòng' },
                      { id: 6, key: 'mongMat', label: 'Mống mắt' },
                      { id: 7, key: 'theThuyTinh', label: 'Thể thủy tinh' },
                      { id: 8, key: 'dichKinh', label: 'Dịch kính' },
                      { id: 9, key: 'vongMac', label: 'Võng mạc' },
                    ].map((row) => {
                      const rightEyeData = data.rightEye?.[row.key as any];
                      const leftEyeData = data.leftEye?.[row.key as any];
                      return (
                        <tr
                          key={row.id}
                          className="divide-x divide-black h-24 align-top"
                        >
                          <td className="p-2 relative">
                            <p className="font-bold leading-relaxed">
                              {row.id}. {row.label}
                            </p>
                            <div className="mt-1 ml-4 text-[11px] font-bold">
                              {renderClinicalOptions(rightEyeData, row.key)}
                            </div>
                            <div className="mt-4 border-b border-black border-dotted h-4 w-full"></div>
                          </td>
                          <td className="p-2 relative">
                            <p className="font-bold leading-relaxed">
                              {row.id}. {row.label}
                            </p>
                            <div className="mt-1 ml-4 text-[11px] font-bold">
                              {renderClinicalOptions(leftEyeData, row.key)}
                            </div>
                            <div className="mt-4 border-b border-black border-dotted h-4 w-full"></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body { background: white !important; font-family: "Times New Roman", Times, serif !important; }
            .no-print { display: none !important; }
            main { border: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; box-shadow: none !important; }
            .break-before-page { page-break-before: always; }
          }
          main {
            font-family: "Times New Roman", Times, serif;
          }
          .divide-x > * + * { border-left-width: 1px; }
          .divide-y > * + * { border-top-width: 1px; }
        `}</style>
      </main>
    </div>
  );
}
