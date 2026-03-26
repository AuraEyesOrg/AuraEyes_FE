import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Calendar,
  X,
  ArrowLeft,
  FileText,
  CheckCircle,
  MessageSquare,
  Award,
  ExternalLink,
  Sparkles,
  Stethoscope,
  Banknote,
  Video,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  searchOphthalmologistsForPatient,
  type OphthalmologistSearchItem,
} from '../api/patient.api';
import { listOphthalmologistFeedback } from '../api/feedback.api';
import Spinner from '@/components/ui/spinner';
import BookAppointmentPage from './book-appointment';
import BookingConfirmationPage from './booking-confirmation';
import { useAppointmentSlots } from '../hooks/use-booking';
import { ScheduleStatus, SlotType } from '@/types/schedule';
import N8nChatWidget, { openN8nChat } from '../components/N8nChatWidget';
import Footer from '@/features/guest/components/Footer';
import {
  loadScreeningConsultationContext,
  saveScreeningConsultationContext,
  type ScreeningConsultationContext,
} from '../types/consultation-context';
import type { Anomaly, RetinalImage } from '../types/type';

const FALLBACK_AVATAR = import.meta.env.VITE_AVATAR_FALLBACK_URL;

function getAvatarUrl(doctor: OphthalmologistSearchItem): string {
  if (doctor.userAvatarUrl) return doctor.userAvatarUrl;
  const name = doctor.userFullName ?? 'Dr';
  return `${FALLBACK_AVATAR}${encodeURIComponent(name)}`;
}

function formatVnd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return '--';
  return `${value.toLocaleString('vi-VN')}đ`;
}

function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function getDemoTitleBadges(doctorId: string, fallbackIndex: number) {
  // Mock titles for UI preview. Keep deterministic so UI doesn't jump.
  const pool = ['BSCKII', 'Th.S', 'BS', 'ThS', 'PGS.TS'];
  const seed = doctorId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const start = (seed + fallbackIndex) % pool.length;
  const result = [pool[start]];
  const second = pool[(start + 2) % pool.length];
  if (fallbackIndex % 2 === 0) result.push(second);
  return result;
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const routeState = location.state as
    | {
        consultationContext?: ScreeningConsultationContext;
        screeningId?: string;
        images?: RetinalImage[];
        anomalies?: Anomaly[];
        riskLevel?: 'low' | 'moderate' | 'high';
        riskScore?: number;
        rawJsonOutput?: string;
      }
    | undefined;

  const consultationContext = useMemo(() => {
    if (routeState?.consultationContext?.screeningId) {
      return routeState.consultationContext;
    }

    if (routeState?.screeningId) {
      return {
        screeningId: routeState.screeningId,
        images: routeState.images ?? [],
        anomalies: routeState.anomalies ?? [],
        riskLevel: routeState.riskLevel ?? 'low',
        riskScore: routeState.riskScore,
        rawJsonOutput: routeState.rawJsonOutput,
        createdAt: new Date().toISOString(),
      } satisfies ScreeningConsultationContext;
    }

    return loadScreeningConsultationContext();
  }, [routeState]);

  useEffect(() => {
    if (!consultationContext?.screeningId) return;
    saveScreeningConsultationContext(consultationContext);
  }, [consultationContext]);

  // Filters
  const [timeFrom, setTimeFrom] = useState<string>('');
  const [timeTo, setTimeTo] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const [consultMode, setConsultMode] = useState<'now' | 'schedule'>(
    'schedule'
  );
  const [showFilters, setShowFilters] = useState(false);

  const [selectedDoctor, setSelectedDoctor] =
    useState<OphthalmologistSearchItem | null>(null);

  const [bookingMode, setBookingMode] = useState<'none' | 'select' | 'confirm'>(
    'none'
  );
  const [bookingSlotId, setBookingSlotId] = useState<string>('');

  const handleSelectDoctor = (doctor: OphthalmologistSearchItem | null) => {
    setSelectedDoctor(doctor);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['patient-ophthalmologists', searchTerm],
    queryFn: () =>
      searchOphthalmologistsForPatient({
        searchTerm: searchTerm || undefined,
        pageNumber: 1,
        pageSize: 20,
      }),
  });

  // Real query results
  const apiDoctors: OphthalmologistSearchItem[] = data?.items ?? [];
  const timeFilterEnabled = Boolean(timeFrom && timeTo);
  const maxPriceRangeDays = 30;
  const selectedRangeDays = useMemo(() => {
    if (!timeFilterEnabled) return 0;
    const from = new Date(`${timeFrom}T00:00:00`).getTime();
    const to = new Date(`${timeTo}T00:00:00`).getTime();
    if (Number.isNaN(from) || Number.isNaN(to) || to < from) return 0;
    return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
  }, [timeFrom, timeTo, timeFilterEnabled]);
  const slotsEnabled =
    timeFilterEnabled &&
    selectedRangeDays > 0 &&
    selectedRangeDays <= maxPriceRangeDays;

  const { data: appointmentSlotsData, isLoading: slotsLoading } =
    useAppointmentSlots(
      {
        // Search across doctors by leaving ophthalId undefined.
        ophthalId: undefined,
        status: ScheduleStatus.Available,
        slotType: SlotType.Consultation,
        fromDate: timeFrom || undefined,
        toDate: timeTo || undefined,
        excludePastSlots: true,
        pageNumber: 1,
        pageSize: 200,
      },
      { enabled: slotsEnabled }
    );

  // Compute min cost per doctor in the selected time range (used for price filter + "From ...")
  const minCostByDoctorId = useMemo(() => {
    const map = new Map<string, number | null>();

    if (!timeFilterEnabled) return map;

    for (const slot of appointmentSlotsData?.items ?? []) {
      const doctorId = slot.ophthalId;
      if (!doctorId) continue;

      const cost = slot.cost ?? null;
      if (cost === null) continue;

      const current = map.get(doctorId);
      if (current === undefined || current === null) {
        map.set(doctorId, cost);
      } else {
        map.set(doctorId, Math.min(current, cost));
      }
    }

    return map;
  }, [appointmentSlotsData?.items, timeFilterEnabled, timeFrom, timeTo]);

  const filteredDoctors = useMemo(() => {
    const ratingFiltered =
      minRating === null
        ? apiDoctors
        : apiDoctors.filter((d) => (d.ratingAverage ?? 0) >= (minRating ?? 0));

    let priceFiltered = ratingFiltered;
    if (priceMin !== null || priceMax !== null) {
      priceFiltered = ratingFiltered.filter((doctor) => {
        const minCost = doctor.minPrice ?? null;
        if (minCost === null) return false;
        if (priceMin !== null && minCost < priceMin) return false;
        if (priceMax !== null && minCost > priceMax) return false;
        return true;
      });
    }

    if (!timeFilterEnabled) return priceFiltered;

    if (slotsLoading) {
      // Don't blank the list while prices are still loading
      return priceFiltered;
    }

    const timeFiltered = priceFiltered.filter((doctor) => {
      const minCost = minCostByDoctorId.get(doctor.id) ?? null;
      // Time availability (doctor must have at least one slot with a known cost)
      if (minCost === null) return false;
      return true;
    });

    return timeFiltered;
  }, [
    apiDoctors,
    minCostByDoctorId,
    minRating,
    priceMax,
    priceMin,
    searchTerm,
    slotsLoading,
    timeFilterEnabled,
  ]);

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['patient-ophthalmologist-feedback', selectedDoctor?.id],
    queryFn: () => listOphthalmologistFeedback(selectedDoctor!.id, 1, 20),
    enabled: !!selectedDoctor,
  });
  const feedbacks = feedbackData?.items ?? [];

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col w-full relative">
      <header className="sticky top-0 z-40 border-b border-(--border-color) bg-(--bg-primary)/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-(--text-primary) leading-none">
            Find Ophthalmologists
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Search and select a verified eye specialist for your consultation
          </p>
        </div>
        <button
          onClick={() =>
            navigate('/patient/screening/review', {
              state: consultationContext
                ? {
                    screeningId: consultationContext.screeningId,
                    images: consultationContext.images,
                    anomalies: consultationContext.anomalies,
                    riskLevel: consultationContext.riskLevel,
                    riskScore: consultationContext.riskScore,
                    rawJsonOutput: consultationContext.rawJsonOutput,
                  }
                : undefined,
            })
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-secondary) hover:bg-[var(--border-color)] rounded-xl transition-all border border-(--border-color) shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>
      </header>

      {/* Hero Banner Area */}
      <div className="w-full bg-brand/5 dark:bg-brand/10 pt-10 pb-28 px-6 relative border-b border-(--border-color)">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-brand uppercase tracking-tight">
              GỌI VIDEO VỚI BÁC SĨ
            </h2>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Khám/tư vấn
                sức khỏe từ xa với bác sĩ chuyên khoa
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Được nhắn
                tin với bác sĩ trước, trong và sau buổi khám
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Thanh toán
                tiện lợi, nhanh chóng
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Bảo mật
                thông tin cuộc gọi an toàn
              </li>
            </ul>
            <div className="mt-8 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-brand/20 backdrop-blur-sm inline-block shadow-sm">
              <p className="text-sm font-semibold text-(--text-secondary)">
                Liên hệ chuyên gia để tư vấn thêm:{' '}
                <a
                  href="tel:19002115"
                  className="text-brand text-xl font-bold ml-1"
                >
                  1900 2115 Này chắc cần xem lại
                </a>
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 relative items-center justify-center">
            <div className="w-full max-w-sm aspect-video bg-gradient-to-tr from-brand/20 to-brand/5 rounded-3xl flex items-center justify-center border-4 border-white dark:border-(--bg-primary) shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
              <Video className="w-24 h-24 text-brand/60" />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 pb-12">
        {/* Floating Search & Filter Bar */}
        <section className="relative -mt-12 z-20 w-full mb-8">
          <div className="medical-card p-2 md:p-3 shadow-xl shadow-brand/5 flex flex-col md:flex-row items-center gap-3 bg-(--bg-primary)">
            <div className="relative w-full md:w-2/3 flex-1 flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-(--text-muted)" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 md:py-3 bg-transparent border-none text-(--text-primary) placeholder-(--text-muted) focus:outline-none text-lg md:text-base font-medium"
              />
            </div>
            {/* Divider */}
            <div className="hidden md:block w-px h-10 bg-(--border-color)"></div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto px-6 py-4 md:py-3 flex items-center justify-between gap-3 text-(--text-primary) font-semibold hover:bg-(--bg-secondary) rounded-xl transition-colors shrink-0"
            >
              <span>{showFilters ? 'Ẩn tùy chọn' : 'Tùy chọn hiển thị'}</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </section>

        {/* Tabs & Filters Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1.5 bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-full shadow-sm">
            <button
              className={`px-8 py-3 rounded-full text-base font-bold transition-all ${
                consultMode === 'now'
                  ? 'bg-brand text-white shadow-md transform scale-105'
                  : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/50 dark:hover:bg-black/20'
              }`}
              onClick={() => {
                setConsultMode('now');
                toast.info(
                  'Bạn đang chọn dịch vụ Khám qua video, để chuyển sang khám bệnh tại CSYT vui lòng chọn chức năng tương ứng!'
                );
              }}
            >
              Tư vấn ngay
            </button>
            <button
              className={`px-8 py-3 rounded-full text-base font-bold transition-all ${
                consultMode === 'schedule'
                  ? 'bg-brand text-white shadow-md transform scale-105'
                  : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/50 dark:hover:bg-black/20'
              }`}
              onClick={() => setConsultMode('schedule')}
            >
              Đặt lịch hẹn
            </button>
            <button
              className={`px-8 py-3 rounded-full text-base font-bold transition-all text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/50 dark:hover:bg-black/20`}
              onClick={() => navigate('/patient/clinics')}
            >
              Cơ sở y tế
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <section
          className={`medical-card p-6 mb-8 ${showFilters ? 'block animate-in slide-in-from-top-4 fade-in duration-300' : 'hidden'}`}
        >
          <div className="flex flex-col gap-5">
            {/* Filters header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-(--text-primary)">
                  Filters
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTimeFrom('');
                  setTimeTo('');
                  setMinRating(null);
                  setPriceMin(null);
                  setPriceMax(null);
                }}
                className="text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  Time From
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                  <input
                    type="date"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  Time To
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                  <input
                    type="date"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMinRating(v ? Number(v) : null);
                  }}
                  className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="">Any</option>
                  <option value="4.8">4.8+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  Price (VND)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Min"
                    value={priceMin ?? ''}
                    onChange={(e) =>
                      setPriceMin(parseNullableNumber(e.target.value))
                    }
                    disabled={!timeFilterEnabled}
                    className="w-1/2 px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Max"
                    value={priceMax ?? ''}
                    onChange={(e) =>
                      setPriceMax(parseNullableNumber(e.target.value))
                    }
                    disabled={!timeFilterEnabled}
                    className="w-1/2 px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
              </div>
            </div>

            {timeFilterEnabled && selectedRangeDays > maxPriceRangeDays && (
              <p className="text-sm text-amber-700 mt-2">
                Thời gian lọc đang quá rộng. Hãy chọn tối đa {maxPriceRangeDays}{' '}
                ngày.
              </p>
            )}

            {timeFilterEnabled &&
              !slotsEnabled &&
              selectedRangeDays > 0 &&
              selectedRangeDays <= maxPriceRangeDays && (
                <p className="text-sm text-amber-700 mt-2">
                  Đang áp dụng bộ lọc theo giá. Nếu danh sách rỗng, thử giảm
                  khoảng giá hoặc thay đổi thời gian.
                </p>
              )}
          </div>
        </section>

        {isLoading && (
          <div className="medical-card p-8 mb-6 text-center">
            <Spinner size={32} className="mx-auto mb-3" />
            <p className="text-(--text-secondary)">
              Loading ophthalmologists...
            </p>
          </div>
        )}

        {slotsLoading && timeFilterEnabled && (
          <div className="text-sm text-(--text-secondary) mb-4 flex items-center gap-2">
            <Spinner size={16} />
            Loading price availability...
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor, index) => {
            const ratingText =
              doctor.ratingAverage !== undefined &&
              doctor.ratingAverage !== null &&
              Number.isFinite(doctor.ratingAverage)
                ? `${doctor.ratingAverage.toFixed(1)}`
                : '—';
            const reviewCount = doctor.ratingCount ?? 0;
            const titleBadges = getDemoTitleBadges(doctor.id, index);
            const titleString = titleBadges.join(', ');

            return (
              <div
                key={doctor.id}
                onClick={() => handleSelectDoctor(doctor)}
                className="medical-card p-0 flex flex-col sm:flex-row gap-0 hover:border-brand/40 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-(--bg-secondary) overflow-hidden"
              >
                {/* Left side: Avatar and Rating */}
                <div className="w-full sm:w-[180px] p-6 flex flex-col items-center bg-brand/5 dark:bg-brand/10 border-b sm:border-b-0 sm:border-r border-(--border-color) shrink-0">
                  <img
                    src={getAvatarUrl(doctor)}
                    alt={doctor.userFullName ?? 'Doctor'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-(--bg-primary) shadow-sm bg-(--bg-secondary)"
                  />
                  <span className="mt-4 px-3 py-1 bg-white dark:bg-(--bg-primary) border border-brand/20 text-brand rounded-full text-[11px] font-bold text-center">
                    {titleString || 'Bác sĩ'}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 p-1.5 px-3 bg-white dark:bg-black/20 rounded-lg shadow-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-500">
                      {ratingText}
                    </span>
                    <span className="text-xs font-semibold text-(--text-muted)">
                      ({reviewCount})
                    </span>
                  </div>
                </div>

                {/* Right side: Details */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col">
                  {/* Name */}
                  <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-bold text-brand group-hover:text-brand/80 transition-colors">
                      {doctor.userFullName ?? 'Unnamed Ophthalmologist'}
                    </h3>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="leading-snug">
                        Chuyên khoa:{' '}
                        <span className="font-semibold">
                          Nhãn khoa tổng quát
                        </span>
                        <br />
                        <span className="text-(--text-muted)">
                          Phòng khám AuraEyes, {doctor.yearsOfExperience} năm
                          kinh nghiệm
                        </span>
                      </span>
                    </p>
                    {doctor.bio && (
                      <p className="text-sm text-(--text-primary) flex items-start gap-3">
                        <Stethoscope className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">
                          Chuyên môn: {doctor.bio}
                        </span>
                      </p>
                    )}
                    {/* Time / Dates available */}
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span>Lịch khám: Tùy chọn</span>
                    </p>
                    {/* Price */}
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Banknote className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Giá khám:{' '}
                        {doctor.minPrice != null && doctor.maxPrice != null
                          ? doctor.minPrice === doctor.maxPrice
                            ? formatVnd(doctor.minPrice)
                            : `${formatVnd(doctor.minPrice)} - ${formatVnd(doctor.maxPrice)}`
                          : 'Theo lịch đặt'}
                      </span>
                    </p>
                  </div>

                  {/* Action Button at the bottom right */}
                  <div className="mt-5 pt-4 border-t border-(--border-color) flex justify-end shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoctor(doctor);
                        setBookingMode('select');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-brand hover:bg-brand/90 text-white font-bold rounded-full shadow-md transition-transform transform active:scale-95 z-10 w-full sm:w-auto"
                    >
                      {consultMode === 'now' ? 'Đặt ngay' : 'Đặt khám ngay'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && filteredDoctors.length === 0 && (
          <div className="medical-card p-12 text-center mt-6">
            <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
              Chưa có bác sĩ nào
            </h3>
            <p className="text-(--text-secondary)">
              {timeFilterEnabled
                ? 'Try adjusting your time/rating/price filters.'
                : 'Try adjusting your search term.'}
            </p>
          </div>
        )}

        {/* Need help choosing */}
        <div className="medical-card p-6 mt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand mt-0.5" />
              <div>
                <h3 className="font-bold text-(--text-primary)">
                  Need Help choosing?
                </h3>
                <p className="text-sm text-(--text-secondary) mt-1">
                  Bạn không chắc chọn bác sĩ nào? Hãy hỏi AURA để được gợi ý
                  theo tình trạng và thời gian phù hợp.
                </p>
              </div>
            </div>
            <button
              onClick={openN8nChat}
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Ask AURA AI Assistant
            </button>
          </div>
        </div>

        {/* ======= Slots Drawer (slide-in panel) ======= */}
        {selectedDoctor && bookingMode === 'none' && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => handleSelectDoctor(null)}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-(--bg-primary) shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-(--border-color)">
              {/* Clean flat header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-(--border-color) shrink-0">
                <img
                  src={getAvatarUrl(selectedDoctor)}
                  alt={selectedDoctor.userFullName ?? 'Doctor'}
                  className="w-12 h-12 rounded-full object-cover border border-(--border-color) shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-(--text-primary) truncate">
                    {selectedDoctor.userFullName ?? 'Unnamed'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified · {selectedDoctor.yearsOfExperience} yrs exp
                  </span>
                </div>
                <button
                  onClick={() => handleSelectDoctor(null)}
                  className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Content Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Stats Box */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color) flex flex-col items-center justify-center text-center">
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {selectedDoctor.ratingAverage
                          ? selectedDoctor.ratingAverage.toFixed(1)
                          : 'No rating'}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        {selectedDoctor.ratingCount || 0} Reviews
                      </span>
                    </div>
                    <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color) flex flex-col items-center justify-center text-center">
                      <span className="flex items-center gap-1 text-brand font-bold text-lg">
                        <Award className="w-4 h-4 text-brand" />
                        {selectedDoctor.certificateCount || 0}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        Certificates
                      </span>
                    </div>
                  </div>

                  {/* Links Box */}
                  {(selectedDoctor.licenseUrl || selectedDoctor.degreeUrl) && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold text-(--text-primary)">
                        Credentials
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.licenseUrl && (
                          <a
                            href={selectedDoctor.licenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> License
                            Document
                          </a>
                        )}
                        {selectedDoctor.degreeUrl && (
                          <a
                            href={selectedDoctor.degreeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Degree
                            Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio block */}
                  {selectedDoctor.bio && (
                    <div className="bg-(--bg-secondary) p-4 rounded-xl border border-(--border-color)">
                      <h3 className="text-sm font-bold text-(--text-primary) mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" /> About Doctor
                      </h3>
                      <p className="text-sm text-(--text-secondary) leading-relaxed">
                        {selectedDoctor.bio}
                      </p>
                    </div>
                  )}

                  {/* Feedback block */}
                  <div>
                    <h3 className="text-sm font-bold text-(--text-primary) mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand" /> Patient
                      Feedback
                    </h3>
                    {feedbackLoading ? (
                      <div className="py-6 flex justify-center">
                        <Spinner size={24} />
                      </div>
                    ) : feedbacks.length > 0 ? (
                      <div className="space-y-3">
                        {feedbacks.map((fb) => (
                          <div
                            key={fb.id}
                            className="p-3 bg-(--bg-secondary) rounded-xl border border-(--border-color)"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-(--text-primary)">
                                {fb.patientFullName ?? 'Anonymous Patient'}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-(--text-secondary) break-words whitespace-pre-wrap">
                              {fb.comment || 'No comment provided.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-(--border-color) border-dashed rounded-xl">
                        <p className="text-xs text-(--text-muted)">
                          There are no reviews yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floating call to action */}
                  <button
                    onClick={() => setBookingMode('select')}
                    className="w-full mt-4 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlays */}
        {bookingMode === 'select' && selectedDoctor && (
          <BookAppointmentPage
            embeddedDoctorId={selectedDoctor.id}
            embeddedDoctorSnapshot={{
              id: selectedDoctor.id,
              userFullName: selectedDoctor.userFullName,
              userEmail: selectedDoctor.userEmail,
              userAvatarUrl: selectedDoctor.userAvatarUrl,
              yearsOfExperience: selectedDoctor.yearsOfExperience,
              isVerified: selectedDoctor.isVerified,
              bio: selectedDoctor.bio,
            }}
            viewMode={consultMode === 'now' ? 'today' : 'week'}
            onClose={() => {
              setBookingMode('none');
              setSelectedDoctor(null);
            }}
            onProceedToConfirm={(slotId) => {
              setBookingSlotId(slotId);
              setBookingMode('confirm');
            }}
          />
        )}

        {bookingMode === 'confirm' && bookingSlotId && (
          <BookingConfirmationPage
            embeddedSlotId={bookingSlotId}
            onClose={() => setBookingMode('select')}
            onSuccess={() => setBookingMode('none')}
          />
        )}
      </main>
      <N8nChatWidget />
      <Footer />
    </div>
  );
}
