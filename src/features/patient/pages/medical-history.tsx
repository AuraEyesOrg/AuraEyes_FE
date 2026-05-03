import React from 'react';
import { usePatientMedicalRecords } from '@/features/medical-records/hooks/useMedicalRecords';
import PatientLayout from '../components/PatientLayout';
import useAuthStore from '@/store/auth-store';
import { useProfile } from '../hooks/useProfile';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  Activity,
  ChevronRight,
  ShieldCheck,
  Search,
  Eye,
  PlusCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { MedicalRecordDto } from '@/features/medical-records/api/medical-record.api';
import { toast } from 'react-toastify';
import { resolvePathWithLocale } from '@/i18n/middleware';

const HistoryCard = ({ record }: { record: MedicalRecordDto }) => {
  const navigate = useNavigate();
  const isLocked =
    record.status === 'Finalized' ||
    record.status === '3' ||
    (record.status as any) === 3;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!record.pdfUrl) {
      toast.info('Bản PDF đang được xử lý, vui lòng quay lại sau.');
      return;
    }

    // Simple way: open in new tab
    window.open(record.pdfUrl, '_blank');

    // Blob way (if requested):
    /*
    try {
      const response = await fetch(record.pdfUrl);
      const blob = await response.blob();
      downloadBlobFile(blob, `EMR_${record.medicalRecordNumber}.pdf`);
    } catch (err) {
      window.open(record.pdfUrl, '_blank');
    }
    */
  };

  return (
    <div
      className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
      onClick={() =>
        navigate(resolvePathWithLocale(`/medical-records/patient/${record.id}`))
      }
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLocked ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}
          >
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Mã hồ sơ: {record.medicalRecordNumber}
              </span>
              {isLocked && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                  <ShieldCheck className="w-2.5 h-2.5" /> Official
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
              {record.finalDiagnosis || 'Đang cập nhật chẩn đoán...'}
            </h3>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Calendar className="w-4 h-4 text-slate-300" />
                {format(new Date(record.createdAt), 'dd MMMM, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Activity className="w-4 h-4 text-slate-300" />
                {isLocked ? 'Đã hoàn tất' : 'Đang xử lý'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={handleDownload}
            disabled={!isLocked}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all ${isLocked ? 'bg-slate-900 text-white hover:bg-primary shadow-lg shadow-black/5 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Download className="w-4 h-4" /> Tải PDF
          </button>
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MedicalHistoryPage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const { data: allRecords, isLoading } = usePatientMedicalRecords(
    profile?.id || ''
  );

  const records = React.useMemo(() => {
    if (!allRecords) return [];
    return allRecords.filter(
      (r) =>
        r.status === 'Finalized' || r.status === '3' || (r.status as any) === 3
    );
  }, [allRecords]);

  const PageHeader = () => (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Bệnh án Điện tử
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Theo dõi toàn bộ lịch sử khám bệnh, chẩn đoán và hướng dẫn điều trị
          của bác sĩ chuyên khoa.
        </p>
      </div>

      <Link
        to={resolvePathWithLocale('/patient/schedule')}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 active:scale-95 shadow-sm"
      >
        <PlusCircle className="h-5 w-5" strokeWidth={2} />
        <span>{t('PatientAppointments.actions.bookNew')}</span>
      </Link>
    </div>
  );

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <PageHeader />

        {/* SEARCH & STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ngày hoặc chẩn đoán..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-3xl outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="bg-primary/5 rounded-3xl p-5 flex items-center justify-between border border-primary/10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                Tổng số lượt khám
              </p>
              <p className="text-2xl font-black text-slate-900">
                {records?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 rounded-3xl animate-pulse"
              />
            ))
          ) : !records || records.length === 0 ? (
            <div className="py-20 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-10 h-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Chưa có lịch sử khám
                </h3>
                <p className="text-slate-400 font-medium">
                  Hồ sơ bệnh án của bạn sẽ xuất hiện tại đây sau khi hoàn tất
                  lượt khám.
                </p>
              </div>
              <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-primary transition-all">
                Đặt lịch khám ngay
              </button>
            </div>
          ) : (
            records.map((record) => (
              <HistoryCard key={record.id} record={record} />
            ))
          )}
        </div>

        {/* HELP SECTION */}
        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Eye className="w-8 h-8 text-slate-400" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="font-black text-slate-800 uppercase tracking-tight">
              Cần hỗ trợ về kết quả khám?
            </h4>
            <p className="text-slate-500 text-sm font-medium">
              Nếu có thắc mắc về chẩn đoán hoặc thuốc điều trị, hãy liên hệ ngay
              với đội ngũ bác sĩ.
            </p>
          </div>
          <button className="whitespace-nowrap px-6 py-3 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-white hover:border-primary transition-all">
            Yêu cầu tư vấn
          </button>
        </div>
      </div>
    </PatientLayout>
  );
}
