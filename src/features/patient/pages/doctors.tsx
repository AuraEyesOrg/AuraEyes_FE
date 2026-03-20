import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  searchOphthalmologistsForPatient,
  type OphthalmologistSearchItem,
  type AvailableSlotItem,
} from '../api/patient.api';
import { listOphthalmologistFeedback } from '../api/feedback.api';
import Spinner from '@/components/ui/spinner';
import { formatShortTime, formatShortDate } from '@/lib/date-utils';
import BookAppointmentPage from './book-appointment';
import BookingConfirmationPage from './booking-confirmation';
import { useAppointmentSlots } from '../hooks/use-booking';
import { ScheduleStatus, SlotType } from '@/types/schedule';
import N8nChatWidget, { openN8nChat } from '../components/N8nChatWidget';
import Footer from '@/features/guest/components/Footer';

const FALLBACK_AVATAR = import.meta.env.VITE_AVATAR_FALLBACK_URL;

function getAvatarUrl(doctor: OphthalmologistSearchItem): string {
  if (doctor.userAvatarUrl) return doctor.userAvatarUrl;
  const name = doctor.userFullName ?? 'Dr';
  return `${FALLBACK_AVATAR}${encodeURIComponent(name)}`;
}

function formatSlotTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '--:--' : formatShortTime(value);
}

function formatSlotDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? 'Unknown date'
    : formatShortDate(value, 'short');
}

function isExpiredSlot(slot: AvailableSlotItem) {
  const now = Date.now();

  const startFromDateTime = new Date(slot.startDateTime).getTime();
  if (!Number.isNaN(startFromDateTime)) {
    return startFromDateTime < now;
  }

  const startFromDateAndTime = new Date(
    `${slot.date}T${slot.startTime}Z`
  ).getTime();
  if (!Number.isNaN(startFromDateAndTime)) {
    return startFromDateAndTime < now;
  }

  return false;
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

function matchesLocalSearch(
  doctor: OphthalmologistSearchItem,
  searchTerm: string
): boolean {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return true;

  const fullName = doctor.userFullName ?? '';
  const email = doctor.userEmail ?? '';
  const bio = doctor.bio ?? '';

  return [fullName, email, bio].some((v) => v.toLowerCase().includes(q));
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [timeFrom, setTimeFrom] = useState<string>('');
  const [timeTo, setTimeTo] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const [selectedDoctor, setSelectedDoctor] =
    useState<OphthalmologistSearchItem | null>(null);

  const [bookingMode, setBookingMode] = useState<'none' | 'select' | 'confirm'>(
    'none'
  );
  const [bookingSlotId, setBookingSlotId] = useState<string>('');

  const handleSelectDoctor = (doctor: OphthalmologistSearchItem | null) => {
    setSelectedDoctor(doctor);
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
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
  const useDemoDoctors =
    !searchTerm.trim() && (isError || apiDoctors.length === 0);
  const apiErrorMessage = !isError
    ? null
    : ((error as unknown as { message?: string; response?: { data?: any } })
        ?.response?.data?.message ??
      (error as { message?: string })?.message ??
      'Unknown error');

  const baseDoctors = apiDoctors;

  // If the API list is empty, we show demo doctors so the UI doesn't look broken.
  // Booking/slot filtering may still depend on backend availability.

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
    selectedRangeDays <= maxPriceRangeDays &&
    !useDemoDoctors;

  const { data: appointmentSlotsData, isLoading: slotsLoading } =
    useAppointmentSlots(
      {
        // Search across doctors by leaving ophthalId undefined.
        ophthalId: undefined,
        status: ScheduleStatus.Available,
        slotType: SlotType.Consultation,
        fromDate: timeFrom || undefined,
        toDate: timeTo || undefined,
        pageNumber: 1,
        pageSize: 200,
      },
      { enabled: slotsEnabled }
    );

  // Compute min cost per doctor in the selected time range (used for price filter + "From ...")
  const minCostByDoctorId = useMemo(() => {
    const map = new Map<string, number | null>();

    if (!timeFilterEnabled) return map;

    if (useDemoDoctors) {
      const today = new Date();
      const demoAvailability = [
        {
          doctorId: 'demo-ophthal-1',
          offsetDays: 0,
          windowDays: 14,
          minCost: 250000,
        },
        {
          doctorId: 'demo-ophthal-2',
          offsetDays: 3,
          windowDays: 10,
          minCost: 180000,
        },
        {
          doctorId: 'demo-ophthal-3',
          offsetDays: 0,
          windowDays: 20,
          minCost: 320000,
        },
        {
          doctorId: 'demo-ophthal-4',
          offsetDays: 7,
          windowDays: 8,
          minCost: 150000,
        },
      ];

      const from = new Date(`${timeFrom}T00:00:00`).getTime();
      const to = new Date(`${timeTo}T00:00:00`).getTime();
      const hasOverlap = (aFrom: number, aTo: number) =>
        aFrom <= to && aTo >= from;

      for (const d of demoAvailability) {
        const availableFrom = new Date(today);
        availableFrom.setDate(availableFrom.getDate() + d.offsetDays);
        availableFrom.setHours(0, 0, 0, 0);

        const availableTo = new Date(availableFrom);
        availableTo.setDate(availableTo.getDate() + d.windowDays);
        availableTo.setHours(0, 0, 0, 0);

        if (hasOverlap(availableFrom.getTime(), availableTo.getTime())) {
          map.set(d.doctorId, d.minCost);
        } else {
          map.set(d.doctorId, null);
        }
      }

      return map;
    }

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
  }, [
    appointmentSlotsData?.items,
    timeFilterEnabled,
    timeFrom,
    timeTo,
    useDemoDoctors,
  ]);

  const filteredDoctors = useMemo(() => {
    const localList = baseDoctors.filter((doctor) =>
      useDemoDoctors ? matchesLocalSearch(doctor, searchTerm) : true
    );

    const ratingFiltered =
      minRating === null
        ? localList
        : localList.filter((d) => (d.ratingAverage ?? 0) >= (minRating ?? 0));

    if (!timeFilterEnabled) return ratingFiltered;

    if (slotsLoading && !useDemoDoctors) {
      // Don't blank the list while prices are still loading; show rating-only results.
      return ratingFiltered;
    }

    const priceFiltered = ratingFiltered.filter((doctor) => {
      const minCost = minCostByDoctorId.get(doctor.id) ?? null;

      // Time availability (doctor must have at least one slot with a known cost)
      if (minCost === null) return false;

      if (priceMin !== null && minCost < priceMin) return false;
      if (priceMax !== null && minCost > priceMax) return false;
      return true;
    });

    return priceFiltered;
  }, [
    baseDoctors,
    minCostByDoctorId,
    minRating,
    priceMax,
    priceMin,
    searchTerm,
    slotsLoading,
    timeFilterEnabled,
    useDemoDoctors,
  ]);

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['patient-ophthalmologist-feedback', selectedDoctor?.id],
    queryFn: () => listOphthalmologistFeedback(selectedDoctor!.id, 1, 20),
    enabled: !!selectedDoctor && !useDemoDoctors,
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-secondary) hover:bg-[var(--border-color)] rounded-xl transition-all border border-(--border-color) shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>
      </header>

      {/* Search */}
      <div className="relative w-full max-w-3xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
        <input
          type="text"
          placeholder="Search by doctor name or bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-full text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-6 md:p-8">
        {/* Search + Filters */}
        <section className="medical-card p-6 mb-6">
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
              !useDemoDoctors &&
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

        {useDemoDoctors && !isLoading && (
          <div className="medical-card p-4 mb-6 border border-amber-200 bg-amber-50 text-amber-800">
            <p className="text-sm font-semibold">
              Không tải được danh sách bác sĩ từ hệ thống.
            </p>
            <p className="text-sm">
              Hiển thị dữ liệu demo để bạn xem UI/UX.
              {apiErrorMessage ? ` (Lý do: ${apiErrorMessage})` : ''}. Bạn có
              thể thử lại bằng cách bấm `Refetch`.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-semibold transition-colors"
            >
              Refetch
            </button>
          </div>
        )}

        {slotsLoading && timeFilterEnabled && !useDemoDoctors && (
          <div className="text-sm text-(--text-secondary) mb-4 flex items-center gap-2">
            <Spinner size={16} />
            Loading price availability...
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => {
            const ratingText =
              doctor.ratingAverage !== undefined &&
              doctor.ratingAverage !== null &&
              Number.isFinite(doctor.ratingAverage)
                ? `${doctor.ratingAverage.toFixed(1)}`
                : '—';
            const reviewCount = doctor.ratingCount ?? 0;
            const fromCost = timeFilterEnabled
              ? (minCostByDoctorId.get(doctor.id) ?? null)
              : null;
            const titleBadges = getDemoTitleBadges(doctor.id, index);

            return (
              <div
                key={doctor.id}
                onClick={() => handleSelectDoctor(doctor)}
                className="medical-card p-6 flex flex-col gap-4 hover:border-brand/40 hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-[#1e3a5f]"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={getAvatarUrl(doctor)}
                    alt={doctor.userFullName ?? 'Doctor'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-(--border-color) bg-(--bg-secondary)"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-(--text-primary) truncate">
                          {doctor.userFullName ?? 'Unnamed Ophthalmologist'}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {titleBadges.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Star className="w-3 h-3" />
                          Verified
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {ratingText} ({reviewCount} reviews)
                        </span>
                        <span className="text-xs text-(--text-muted)">
                          {doctor.yearsOfExperience} yrs exp
                        </span>
                      </div>
                    </div>
                    {doctor.bio && (
                      <p className="mt-2 text-sm text-(--text-secondary) line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}
                    {doctor.certificateCount > 0 && (
                      <p className="mt-1 text-xs text-(--text-muted)">
                        {doctor.certificateCount} certificate(s)
                      </p>
                    )}
                    {timeFilterEnabled && fromCost !== null && (
                      <p className="mt-1 text-xs text-brand font-semibold">
                        From {formatVnd(fromCost)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-(--border-color) pt-4">
                  <div className="flex items-center gap-4 text-xs text-(--text-secondary)">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Flexible hours
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Online / In-clinic
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoctor(doctor);
                      // In demo mode we avoid opening the booking flow.
                      if (!useDemoDoctors) setBookingMode('select');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand border border-brand/20 bg-transparent text-sm font-medium rounded-lg z-10 relative"
                  >
                    <Calendar className="w-4 h-4" />
                    View Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && filteredDoctors.length === 0 && (
          <div className="medical-card p-12 text-center mt-6">
            <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
              No ophthalmologists found
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
        {selectedDoctor && (
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
                    disabled={useDemoDoctors}
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
            onClose={() => setBookingMode('none')}
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
