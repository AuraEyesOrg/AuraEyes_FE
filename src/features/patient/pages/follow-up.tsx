import React, { useState } from 'react';
import {
  Calendar,
  Search,
  History,
  FileText,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { toast } from 'react-toastify';
import { formatShortDate } from '@/lib/date-utils';
import { lookupAccountByCitizenId } from '@/features/auth/api/auth.api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Trans } from 'react-i18next';

interface HistoricalRecord {
  id: string;
  date: string;
  diagnosis: string;
  doctor: string;
  clinic: string;
}

const MOCK_RECORDS: HistoricalRecord[] = [
  {
    id: 'REC-2024-001',
    date: '2024-03-15T09:00:00Z',
    diagnosis: 'Đục thủy tinh thể nhẹ - Cần theo dõi',
    doctor: 'BS. Nguyễn Văn A',
    clinic: 'Aura Clinic Quận 1',
  },
  {
    id: 'REC-2023-085',
    date: '2023-11-20T14:30:00Z',
    diagnosis: 'Viêm kết mạc cấp',
    doctor: 'BS. Trần Thị B',
    clinic: 'Aura Clinic Quận 7',
  },
];

export default function FollowUpPage() {
  const { t } = useSafeTranslation();
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [records, setRecords] = useState<HistoricalRecord[] | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRecord | null>(
    null
  );
  const [followUpReason, setFollowUpReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [step, setStep] = useState(1); // 1: Search, 2: Select/Fill, 3: Success

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error(
        t(
          'PatientAppointments.followUp.search.toastError',
          'Please enter CitizenID or UserId'
        )
      );
      return;
    }
    setIsSearching(true);
    try {
      const result = await lookupAccountByCitizenId({
        citizenId: searchId.trim(),
      });
      if (!result.exists) {
        toast.info(
          t(
            'PatientAppointments.followUp.search.notFound',
            'No account found with this CitizenID. Please contact reception for support.'
          )
        );
        setRecords(null);
        return;
      }

      if (result.maskedEmail) {
        toast.success(
          t('PatientAppointments.followUp.search.foundEmail', {
            email: result.maskedEmail,
            defaultValue: `Account found. Please login with email: ${result.maskedEmail}`,
          })
        );
      } else {
        toast.success(
          t(
            'PatientAppointments.followUp.search.foundNoEmail',
            'Account found. Please login to view history.'
          )
        );
      }

      setRecords(MOCK_RECORDS);
      setIsSearching(false);
      setStep(1); // Stay on step 1 but show results
    } catch (error) {
      toast.error(
        t(
          'PatientAppointments.followUp.search.loadError',
          'Could not lookup account. Please try again later.'
        )
      );
      setRecords(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecord = (record: HistoricalRecord) => {
    setSelectedRecord(record);
    setStep(2);
  };

  const handleSubmitFollowUp = () => {
    if (!preferredDate) {
      toast.error(
        t(
          'PatientAppointments.followUp.form.dateRequired',
          'Please select an appointment date'
        )
      );
      return;
    }
    toast.success(
      t('PatientAppointments.followUp.success.title', 'Booking Successful!')
    );
    setStep(3);
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 dark:text-white">
            {t('PatientAppointments.followUp.page.title', 'Đặt Lịch Tái Khám')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
            {t(
              'PatientAppointments.followUp.page.subtitle',
              'Dễ dàng đặt lịch hẹn tái khám dựa trên lịch sử hồ sơ bệnh án của bạn. Chúng tôi sẽ giúp bạn tiếp nối quá trình điều trị một cách liền mạch.'
            )}
          </p>
        </header>

        {/* PROGRESS STEPS */}
        <div className="flex items-center justify-center mb-12">
          {[
            {
              id: 1,
              label: t(
                'PatientAppointments.followUp.steps.findRecord',
                'Tìm hồ sơ'
              ),
            },
            {
              id: 2,
              label: t(
                'PatientAppointments.followUp.steps.info',
                'Thông tin tái khám'
              ),
            },
            {
              id: 3,
              label: t(
                'PatientAppointments.followUp.steps.complete',
                'Hoàn tất'
              ),
            },
          ].map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                    step >= s.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.id}
                </div>
                <span
                  className={`absolute -bottom-7 whitespace-nowrap text-xs font-bold uppercase tracking-wider ${
                    step >= s.id ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-20 h-0.5 mx-4 transition-colors duration-500 ${
                    step > s.id ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: SEARCH & RESULTS */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
                {t(
                  'PatientAppointments.followUp.search.label',
                  'Tra cứu hồ sơ bệnh án'
                )}
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder={t(
                      'PatientAppointments.followUp.search.placeholder',
                      'Nhập CitizenID hoặc UserId...'
                    )}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all text-lg font-medium dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {t('PatientAppointments.followUp.search.button', 'TÌM KIẾM')}
                </button>
              </div>
            </div>

            {records && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 px-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  {t('PatientAppointments.followUp.search.results', {
                    count: records.length,
                    defaultValue: `Kết quả tìm thấy (${records.length})`,
                  })}
                </h3>
                <div className="grid gap-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-indigo-500 shadow-md hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer flex items-center justify-between dark:border-slate-800"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <FileText className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                              {record.id}
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              {formatShortDate(record.date)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {record.diagnosis}
                          </h4>
                          <p className="text-sm text-slate-500 flex items-center gap-4 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" /> {record.doctor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> {record.clinic}
                            </span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: FILL FOLLOW-UP INFO */}
        {step === 2 && selectedRecord && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {t(
                      'PatientAppointments.followUp.form.title',
                      'Thông tin tái khám'
                    )}
                  </h3>
                  <p className="text-indigo-100 opacity-80">
                    {t('PatientAppointments.followUp.form.basedOn', {
                      id: selectedRecord.id,
                      defaultValue: `Dựa trên hồ sơ: ${selectedRecord.id}`,
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div>
                  <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">
                    {t(
                      'PatientAppointments.followUp.form.previousDiagnosis',
                      'Chẩn đoán trước đó'
                    )}
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {selectedRecord.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">
                    {t(
                      'PatientAppointments.followUp.form.previousDoctor',
                      'Bác sĩ phụ trách'
                    )}
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {selectedRecord.doctor}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                  {t(
                    'PatientAppointments.followUp.form.reasonLabel',
                    'Lý do tái khám (nếu có)'
                  )}
                </label>
                <textarea
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  placeholder={t(
                    'PatientAppointments.followUp.form.reasonPlaceholder',
                    'Nhập tình trạng hiện tại của bạn hoặc lý do muốn tái khám...'
                  )}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all min-h-[120px] font-medium dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                    {t(
                      'PatientAppointments.followUp.form.dateLabel',
                      'Ngày hẹn mong muốn'
                    )}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-medium dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-4">
                    {t(
                      'PatientAppointments.followUp.form.note',
                      '* Phòng khám sẽ liên hệ lại với bạn để xác nhận khung giờ chính xác.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold transition-all active:scale-95"
                >
                  {t('PatientAppointments.followUp.form.back', 'QUAY LẠI')}
                </button>
                <button
                  onClick={handleSubmitFollowUp}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {t(
                    'PatientAppointments.followUp.form.confirm',
                    'XÁC NHẬN ĐẶT HẸN'
                  )}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              {t(
                'PatientAppointments.followUp.success.title',
                'Đặt Lịch Thành Công!'
              )}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10">
              <Trans
                i18nKey="PatientAppointments.followUp.success.message"
                values={{ clinic: selectedRecord?.clinic }}
              >
                Yêu cầu tái khám của bạn đã được gửi đến{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedRecord?.clinic}
                </span>
                . Chúng tôi sẽ phản hồi sớm nhất qua email hoặc số điện thoại.
              </Trans>
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button
                onClick={() => (window.location.href = '/patient/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                {t(
                  'PatientAppointments.followUp.success.backHome',
                  'VỀ TRANG CHỦ'
                )}
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {t(
                  'PatientAppointments.followUp.success.bookMore',
                  'Đặt thêm lịch hẹn khác'
                )}
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!records && !isSearching && step === 1 && (
          <div className="mt-20 text-center opacity-40 grayscale animate-pulse">
            <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t(
                'PatientAppointments.followUp.search.empty',
                'Nhập mã định danh để xem lịch sử khám bệnh của bạn'
              )}
            </p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
