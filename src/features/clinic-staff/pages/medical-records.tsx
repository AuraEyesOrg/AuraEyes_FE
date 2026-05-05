import { useState } from 'react';
import { useMedicalRecords } from '@/features/medical-records/hooks/useMedicalRecords';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Eye,
  Download,
  MoreVertical,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MedicalRecordDto } from '@/features/medical-records/api/medical-record.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { formatShortDate } from '@/lib/date-utils';

const StatusBadge = ({ status }: { status: string }) => {
  const { t, i18n } = useSafeTranslation();
  const statusKey = `ClinicStaffMedicalRecords.status.${status.toLowerCase()}`;

  switch (status) {
    case 'Draft_Admin':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500">
          <Clock className="w-3 h-3" /> {t(statusKey, 'Draft (Admin)')}
        </span>
      );
    case 'Pending_Clinical':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600">
          <Clock className="w-3 h-3" /> {t(statusKey, 'Pending Clinical')}
        </span>
      );
    case 'Finalized':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="w-3 h-3" /> {t(statusKey, 'Finalized')}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500">
          {status}
        </span>
      );
  }
};

export default function MedicalRecordsManagementPage() {
  const navigate = useNavigate();
  const { t, i18n } = useSafeTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);

  const { data: pagedData, isLoading } = useMedicalRecords({
    searchTerm,
    status: statusFilter || undefined,
    pageNumber,
    pageSize: 10,
  });

  const records: MedicalRecordDto[] = pagedData?.items || [];

  return (
    <ClinicStaffLayout>
      <div className="space-y-8 p-6 lg:p-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {t('ClinicStaffMedicalRecords.header.title', 'Quản lý')}{' '}
              <span className="text-primary">
                {t('ClinicStaffMedicalRecords.page.title', 'Bệnh án')}
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {t(
                'ClinicStaffMedicalRecords.header.subtitle',
                'Tra cứu và quản lý hồ sơ bệnh án EMR 23/BV-01'
              )}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t(
                  'ClinicStaffMedicalRecords.search.placeholder',
                  'Tìm theo tên bệnh nhân hoặc số bệnh án...'
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-600 appearance-none"
              >
                <option value="">
                  {t(
                    'ClinicStaffMedicalRecords.filter.all',
                    'Tất cả trạng thái'
                  )}
                </option>
                <option value="Draft_Admin">
                  {t(
                    'ClinicStaffMedicalRecords.filter.draft_admin',
                    'Nháp (HC)'
                  )}
                </option>
                <option value="Pending_Clinical">
                  {t(
                    'ClinicStaffMedicalRecords.filter.pending_clinical',
                    'Chờ khám'
                  )}
                </option>
                <option value="Finalized">
                  {t('ClinicStaffMedicalRecords.filter.finalized', 'Hoàn tất')}
                </option>
              </select>
              <button className="p-3 bg-slate-900 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {t(
                      'ClinicStaffMedicalRecords.table.recordNumber',
                      'Số bệnh án'
                    )}
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {t('ClinicStaffMedicalRecords.table.patient', 'Bệnh nhân')}
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {t('ClinicStaffMedicalRecords.table.createdAt', 'Ngày tạo')}
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {t('ClinicStaffMedicalRecords.table.status', 'Trạng thái')}
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                    {t('ClinicStaffMedicalRecords.table.actions', 'Thao tác')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-6 bg-slate-100 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-200" />
                        </div>
                      </div>
                      <p className="text-slate-400 font-bold tracking-tight">
                        {t(
                          'ClinicStaffMedicalRecords.empty.title',
                          'Không tìm thấy kết quả phù hợp'
                        )}
                      </p>
                    </td>
                  </tr>
                ) : (
                  records.map((record: MedicalRecordDto) => (
                    <tr
                      key={record.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/medical-records/${record.id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-black text-slate-900 tracking-tighter">
                            {record.medicalRecordNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {record.patient?.fullName || 'N/A'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {record.patient?.phone ||
                              t(
                                'ClinicStaffMedicalRecords.patient.phoneNotUpdated',
                                'Chưa cập nhật'
                              )}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          {formatShortDate(
                            record.createdAt,
                            'medium',
                            i18n.language
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-primary transition-all"
                            title={t(
                              'ClinicStaffMedicalRecords.actions.view',
                              'Xem chi tiết'
                            )}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {record.pdfUrl && (
                            <a
                              href={record.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-emerald-500 transition-all"
                              onClick={(e) => e.stopPropagation()}
                              title={t(
                                'ClinicStaffMedicalRecords.actions.downloadPdf',
                                'Tải PDF'
                              )}
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          )}
                          <button className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 transition-all">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {t(
                'ClinicStaffMedicalRecords.pagination.page',
                'Trang {{page}} / {{total}}',
                {
                  page: pageNumber,
                  total: pagedData?.totalPages || 1,
                }
              )}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pageNumber === 1}
                onClick={() =>
                  setPageNumber((pNumber) => Math.max(1, pNumber - 1))
                }
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                {t('ClinicStaffMedicalRecords.pagination.previous', 'Trước')}
              </button>
              <button
                disabled={pageNumber >= (pagedData?.totalPages || 1)}
                onClick={() => setPageNumber((pNumber) => pNumber + 1)}
                className="px-4 py-2 bg-slate-900 border border-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {t('ClinicStaffMedicalRecords.pagination.next', 'Sau')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClinicStaffLayout>
  );
}
