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
      toast.error('Vui lòng nhập CitizenID hoặc UserId');
      return;
    }
    setIsSearching(true);
    try {
      const result = await lookupAccountByCitizenId({
        citizenId: searchId.trim(),
      });
      if (!result.exists) {
        toast.info(
          'Chua tim thay tai khoan voi CCCD nay. Vui long lien he tiep tan de duoc ho tro.'
        );
        setRecords(null);
        return;
      }

      if (result.maskedEmail) {
        toast.success(
          `Da tim thay tai khoan. Ban dang nhap bang email: ${result.maskedEmail}`
        );
      } else {
        toast.success(
          'Da tim thay tai khoan. Vui long dang nhap de xem lich su.'
        );
      }

      setRecords(MOCK_RECORDS);
      setIsSearching(false);
      setStep(1); // Stay on step 1 but show results
    } catch (error) {
      toast.error('Khong the tra cuu tai khoan. Vui long thu lai sau.');
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
      toast.error('Vui lòng chọn ngày hẹn');
      return;
    }
    toast.success('Yêu cầu tái khám đã được gửi!');
    setStep(3);
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Đặt Lịch Tái Khám
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Dễ dàng đặt lịch hẹn tái khám dựa trên lịch sử hồ sơ bệnh án của
            bạn. Chúng tôi sẽ giúp bạn tiếp nối quá trình điều trị một cách liền
            mạch.
          </p>
        </header>

        {/* PROGRESS STEPS */}
        <div className="flex items-center justify-center mb-12">
          {[
            { id: 1, label: 'Tìm hồ sơ' },
            { id: 2, label: 'Thông tin tái khám' },
            { id: 3, label: 'Hoàn tất' },
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
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">
                Tra cứu hồ sơ bệnh án
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Nhập CitizenID hoặc UserId..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
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
                  TÌM KIẾM
                </button>
              </div>
            </div>

            {records && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Kết quả tìm thấy ({records.length})
                </h3>
                <div className="grid gap-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className="group bg-white p-6 rounded-3xl border-2 border-transparent hover:border-indigo-500 shadow-md hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <FileText className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                              {record.id}
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              {formatShortDate(record.date)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">
                            {record.diagnosis}
                          </h4>
                          <p className="text-sm text-slate-500 flex items-center gap-4">
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
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Thông tin tái khám</h3>
                  <p className="text-indigo-100 opacity-80">
                    Dựa trên hồ sơ: {selectedRecord.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div>
                  <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">
                    Chẩn đoán trước đó
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {selectedRecord.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">
                    Bác sĩ phụ trách
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {selectedRecord.doctor}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">
                  Lý do tái khám (nếu có)
                </label>
                <textarea
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  placeholder="Nhập tình trạng hiện tại của bạn hoặc lý do muốn tái khám..."
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all min-h-[120px] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">
                    Ngày hẹn mong muốn
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <p className="text-sm text-slate-500 italic mb-4">
                    * Phòng khám sẽ liên hệ lại với bạn để xác nhận khung giờ
                    chính xác.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-600 py-4 rounded-2xl font-bold transition-all active:scale-95"
                >
                  QUAY LẠI
                </button>
                <button
                  onClick={handleSubmitFollowUp}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  XÁC NHẬN ĐẶT HẸN
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
            <h2 className="text-3xl font-black text-slate-900 mb-4">
              Đặt Lịch Thành Công!
            </h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10">
              Yêu cầu tái khám của bạn đã được gửi đến{' '}
              <span className="font-bold text-slate-900">
                {selectedRecord?.clinic}
              </span>
              . Chúng tôi sẽ phản hồi sớm nhất qua email hoặc số điện thoại.
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button
                onClick={() => (window.location.href = '/patient/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                VỀ TRANG CHỦ
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-indigo-600 font-bold hover:underline"
              >
                Đặt thêm lịch hẹn khác
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!records && !isSearching && step === 1 && (
          <div className="mt-20 text-center opacity-40 grayscale animate-pulse">
            <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              Nhập mã định danh để xem lịch sử khám bệnh của bạn
            </p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
