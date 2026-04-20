import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
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
  Wallet,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import DoctorLottie from '../components/DoctorLottie';

import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  searchOphthalmologistsForPatient,
  getOphthalmologistDetailForPatient,
  type OphthalmologistSearchItem,
  type OphthalmologistDetailItem,
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
import { useWallet } from '../hooks/use-wallet';
import { formatCurrency } from '@/lib/helper';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatVnd(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value))
    return null;

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;
  const [searchTerm, setSearchTerm] = useState('');

  // Wallet balance for affordability indicator
  const { data: walletData } = useWallet();
  const walletBalance = walletData?.balance ?? null;
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
  const defaultSlotFromDate = useMemo(() => toIsoDate(new Date()), []);
  const defaultSlotToDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return toIsoDate(date);
  }, []);
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

  const { data: cardScheduleSlotsData, isLoading: cardScheduleSlotsLoading } =
    useAppointmentSlots(
      {
        ophthalId: undefined,
        status: ScheduleStatus.Available,
        slotType: SlotType.Consultation,
        fromDate: defaultSlotFromDate,
        toDate: defaultSlotToDate,
        excludePastSlots: true,
        pageNumber: 1,
        pageSize: 400,
      },
      { enabled: true }
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

  const { data: selectedDoctorDetail } = useQuery<OphthalmologistDetailItem>({
    queryKey: ['patient-ophthalmologist-detail', selectedDoctor?.id],
    queryFn: () => getOphthalmologistDetailForPatient(selectedDoctor!.id),
    enabled: !!selectedDoctor?.id,
  });

  const detailDegrees = useMemo(
    () =>
      Array.isArray(selectedDoctorDetail?.degrees)
        ? selectedDoctorDetail.degrees
        : [],
    [selectedDoctorDetail?.degrees]
  );

  const detailCertificates = useMemo(
    () =>
      Array.isArray(selectedDoctorDetail?.certificates)
        ? selectedDoctorDetail.certificates
        : [],
    [selectedDoctorDetail?.certificates]
  );

  const modalDegrees =
    detailDegrees.length > 0
      ? detailDegrees
      : Array.isArray(selectedDoctor?.degrees)
        ? selectedDoctor.degrees
        : [];

  const modalCertificates =
    detailCertificates.length > 0
      ? detailCertificates
      : Array.isArray(selectedDoctor?.certificates)
        ? selectedDoctor.certificates
        : [];

  const renderDoctorAvatar = (
    doctor: Pick<OphthalmologistSearchItem, 'userAvatarUrl' | 'userFullName'>,
    sizeClass: string,
    textSizeClass: string
  ) => {
    const fullName = (doctor.userFullName ?? '').trim();
    const avatarUrl = (doctor.userAvatarUrl ?? '').trim();
    const initials =
      getInitials(fullName) || t('PatientDoctors.avatar.fallbackInitials');

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={fullName || t('PatientDoctors.card.unnamed')}
          className={`${sizeClass} rounded-full object-cover border-4 border-white dark:border-(--bg-primary) shadow-sm bg-(--bg-secondary)`}
        />
      );
    }

    return (
      <div
        aria-label={fullName || t('PatientDoctors.card.unnamed')}
        className={`${sizeClass} flex items-center justify-center rounded-full bg-brand/10 text-brand font-bold ${textSizeClass} uppercase`}
      >
        {initials}
      </div>
    );
  };

  const getDegreeLabel = (degree: {
    name?: string | null;
    degreeLevel?: string | null;
    title?: string | null;
    abbreviation?: string | null;
  }) => {
    const abbreviation = degree.abbreviation?.trim();
    if (abbreviation) return abbreviation;

    const degreeName = degree.name?.trim().toUpperCase() ?? '';
    if (/\bMD\b/.test(degreeName)) {
      return t('PatientDoctors.degrees.MD');
    }

    const levelKey = degree.degreeLevel?.trim() || '';
    const i18nDegreeKey =
      levelKey === 'Doctor'
        ? 'Doctorate'
        : levelKey === 'AssociateProfessor'
          ? 'AssocProf'
          : levelKey;

    if (i18nDegreeKey) {
      const translated = t(`PatientDoctors.degrees.${i18nDegreeKey}`);
      if (translated && !translated.startsWith('PatientDoctors.degrees.')) {
        return translated;
      }
    }

    return (
      degree.title?.trim() ||
      degree.name?.trim() ||
      t('PatientDoctors.credentials.defaultDegree')
    );
  };

  const nextSlotLabelByDoctorId = useMemo(() => {
    const map = new Map<string, { timestamp: number; label: string }>();
    const slots = cardScheduleSlotsData?.items ?? [];

    for (const slot of slots) {
      const doctorId = slot.ophthalId;
      if (!doctorId) continue;

      const slotDateTime =
        slot.date && slot.startTime ? `${slot.date}T${slot.startTime}` : '';
      if (!slotDateTime) continue;

      const timestamp = Date.parse(slotDateTime);
      if (Number.isNaN(timestamp)) continue;

      const formatted = new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));

      const current = map.get(doctorId);
      if (!current || timestamp < current.timestamp) {
        map.set(doctorId, { timestamp, label: formatted });
      }
    }

    return new Map(
      Array.from(map.entries()).map(([doctorId, value]) => [
        doctorId,
        value.label,
      ])
    );
  }, [cardScheduleSlotsData?.items]);

  const getDegreeUrl = (degree: {
    degreeUrl?: string | null;
    url?: string | null;
  }) => {
    return degree.degreeUrl?.trim() || degree.url?.trim() || '';
  };

  const getCertificateLabel = (certificate: {
    name?: string | null;
    issuingAuthority?: string | null;
  }) => {
    return (
      certificate.name?.trim() ||
      certificate.issuingAuthority?.trim() ||
      t('PatientDoctors.credentials.defaultCertificate')
    );
  };

  const buildExpertiseText = (
    certificates: Array<{ name?: string | null }>
  ) => {
    const names = certificates
      .map((certificate) => certificate.name?.trim() ?? '')
      .filter(Boolean);

    if (names.length === 0) {
      return t('PatientDoctors.card.generalOphthalmology');
    }

    return names.join(', ');
  };

  // Cheapest doctor price for affordability comparison
  const cheapestDoctorPrice = useMemo(() => {
    const prices = filteredDoctors
      .map((d) => d.minPrice)
      .filter((p): p is number => p != null && Number.isFinite(p));
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [filteredDoctors]);

  const walletAffordable =
    walletBalance !== null &&
    cheapestDoctorPrice !== null &&
    walletBalance >= cheapestDoctorPrice;

  const walletSufficient =
    walletBalance !== null && cheapestDoctorPrice !== null
      ? walletAffordable
      : null; // null = cannot determine yet

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col w-full relative">
      {/* ── Premium Header ── */}
      <header className="sticky top-0 z-40 bg-(--bg-primary)/95 backdrop-blur-md border-b border-(--border-color) shadow-[0_1px_0_0_var(--border-color),0_4px_24px_-4px_rgba(0,0,0,0.06)]">
        {/* Accent gradient line on top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

        <div className="px-5 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* Back button — button-in-button pattern */}
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
              className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-(--border-color) bg-(--bg-secondary) hover:border-brand/40 hover:bg-brand/5 text-(--text-secondary) hover:text-brand transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] shrink-0"
            >
              <span className="w-6 h-6 rounded-full bg-(--bg-primary) border border-(--border-color) group-hover:border-brand/30 flex items-center justify-center transition-all duration-300 group-hover:-translate-x-0.5">
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold tracking-wide hidden sm:inline">
                {t('PatientDoctors.header.backToReview')}
              </span>
            </button>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Stethoscope className="w-2.5 h-2.5" />
                  {t('PatientDoctors.header.eyebrow', {
                    defaultValue: 'Verified Specialists',
                  })}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-(--text-primary) leading-tight truncate">
                {t('PatientDoctors.header.title')}
              </h1>
              <p className="hidden md:block text-xs text-(--text-muted) mt-0.5 truncate">
                {t('PatientDoctors.header.subtitle')}
              </p>
            </div>

            {/* Wallet Balance Chip */}
            <div className="shrink-0">
              {walletBalance === null ? (
                // Loading skeleton
                <div className="h-9 w-32 rounded-full bg-(--bg-secondary) animate-pulse" />
              ) : (
                <button
                  onClick={() => navigate('/patient/wallet')}
                  title={t('PatientDoctors.header.walletTooltip', {
                    defaultValue: 'View your wallet',
                  })}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                    walletSufficient === true
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-400/60'
                      : walletSufficient === false
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:border-amber-400/60'
                        : 'bg-(--bg-secondary) border-(--border-color) text-(--text-secondary) hover:border-brand/30 hover:text-brand'
                  }`}
                >
                  {walletSufficient === false ? (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="text-xs">
                    {formatCurrency(walletBalance ?? 0, { absolute: true })}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Area */}
      <div className="w-full bg-brand/5 dark:bg-brand/10 pt-10 pb-28 px-6 relative border-b border-(--border-color)">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-brand uppercase tracking-tight">
              {t('PatientDoctors.hero.title')}
            </h2>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                {t('PatientDoctors.hero.feature1')}
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                {t('PatientDoctors.hero.feature2')}
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                {t('PatientDoctors.hero.feature3')}
              </li>
              <li className="flex items-center gap-3 text-(--text-primary) font-medium text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                {t('PatientDoctors.hero.feature4')}
              </li>
            </ul>
          </div>
          <div className="hidden md:flex flex-1 relative items-center justify-center">
            <div className="w-full max-w-sm aspect-video bg-gradient-to-tr from-brand/20 to-brand/5 rounded-3xl flex items-center justify-center border-4 border-white dark:border-(--bg-primary) shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500 overflow-hidden">
              <DoctorLottie />
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
                placeholder={t('PatientDoctors.search.placeholder')}
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
              <span>
                {showFilters
                  ? t('PatientDoctors.filters.hideOptions')
                  : t('PatientDoctors.filters.showOptions')}
              </span>
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
                toast.info(t('PatientDoctors.consultMode.nowNotice'));
              }}
            >
              {t('PatientDoctors.consultMode.now')}
            </button>
            <button
              className={`px-8 py-3 rounded-full text-base font-bold transition-all ${
                consultMode === 'schedule'
                  ? 'bg-brand text-white shadow-md transform scale-105'
                  : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/50 dark:hover:bg-black/20'
              }`}
              onClick={() => setConsultMode('schedule')}
            >
              {t('PatientDoctors.consultMode.schedule')}
            </button>
            <button
              className={`px-8 py-3 rounded-full text-base font-bold transition-all text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/50 dark:hover:bg-black/20`}
              onClick={() => navigate('/patient/clinics')}
            >
              {t('PatientDoctors.consultMode.clinics')}
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
                  {t('PatientDoctors.filters.title')}
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
                {t('PatientDoctors.filters.clear')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  {t('PatientDoctors.filters.timeFrom')}
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
                  {t('PatientDoctors.filters.timeTo')}
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
                  {t('PatientDoctors.filters.minRating')}
                </label>
                <select
                  value={minRating ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMinRating(v ? Number(v) : null);
                  }}
                  className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="">{t('PatientDoctors.filters.any')}</option>
                  <option value="4.8">4.8+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--text-muted) mb-2">
                  {t('PatientDoctors.filters.price')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={t('PatientDoctors.filters.min')}
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
                    placeholder={t('PatientDoctors.filters.max')}
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
                {t('PatientDoctors.filters.maxRangeWarning', {
                  maxDays: maxPriceRangeDays,
                })}
              </p>
            )}

            {timeFilterEnabled &&
              !slotsEnabled &&
              selectedRangeDays > 0 &&
              selectedRangeDays <= maxPriceRangeDays && (
                <p className="text-sm text-amber-700 mt-2">
                  {t('PatientDoctors.filters.priceHint')}
                </p>
              )}
          </div>
        </section>

        {isLoading && (
          <div className="medical-card p-8 mb-6 text-center">
            <Spinner size={32} className="mx-auto mb-3" />
            <p className="text-(--text-secondary)">
              {t('PatientDoctors.loading.doctors')}
            </p>
          </div>
        )}

        {slotsLoading && timeFilterEnabled && (
          <div className="text-sm text-(--text-secondary) mb-4 flex items-center gap-2">
            <Spinner size={16} />
            {t('PatientDoctors.loading.prices')}
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => {
            const ratingText =
              doctor.ratingAverage !== undefined &&
              doctor.ratingAverage !== null &&
              Number.isFinite(doctor.ratingAverage)
                ? `${doctor.ratingAverage.toFixed(1)}`
                : t('PatientDoctors.common.noData');
            const reviewCount = doctor.ratingCount ?? 0;
            const doctorName =
              doctor.userFullName?.trim() || t('PatientDoctors.card.unnamed');
            const doctorDegrees = Array.isArray(doctor.degrees)
              ? doctor.degrees
              : [];
            const doctorCertificates = Array.isArray(doctor.certificates)
              ? doctor.certificates
              : [];
            const degreeText =
              doctorDegrees.length > 0
                ? doctorDegrees
                    .map((degree) => {
                      const label = getDegreeLabel(degree);
                      const degreeName = degree.name?.trim();
                      return degreeName && degreeName !== label
                        ? `${label} (${degreeName})`
                        : label;
                    })
                    .join(', ')
                : t('PatientDoctors.card.degreeMissing');
            const certificateText =
              doctorCertificates.length > 0
                ? doctorCertificates
                    .map((certificate) => getCertificateLabel(certificate))
                    .join(', ')
                : t('PatientDoctors.card.certificateMissing');
            const bioText =
              doctor.bio?.trim() || t('PatientDoctors.card.bioMissing');
            const nextScheduleText = nextSlotLabelByDoctorId.get(doctor.id)
              ? t('PatientDoctors.card.scheduleNext', {
                  datetime: nextSlotLabelByDoctorId.get(doctor.id),
                })
              : cardScheduleSlotsLoading
                ? t('PatientDoctors.loading.prices')
                : t('PatientDoctors.card.scheduleNoSlots');
            return (
              <div
                key={doctor.id}
                onClick={() => handleSelectDoctor(doctor)}
                className="medical-card p-0 flex flex-col sm:flex-row gap-0 hover:border-brand/40 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-(--bg-secondary) overflow-hidden"
              >
                {/* Left side: Avatar and Rating */}
                <div className="w-full sm:w-[180px] p-6 flex flex-col items-center bg-brand/5 dark:bg-brand/10 border-b sm:border-b-0 sm:border-r border-(--border-color) shrink-0">
                  {renderDoctorAvatar(doctor, 'w-24 h-24', 'text-3xl')}
                  <span className="mt-4 px-3 py-1 bg-white dark:bg-(--bg-primary) border border-brand/20 text-brand rounded-full text-[11px] font-bold text-center">
                    {doctor.certificateCount > 0
                      ? t('PatientDoctors.card.verifiedCredentials', {
                          count: doctor.certificateCount,
                        })
                      : t('PatientDoctors.card.verifiedOphthalmologist')}
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
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-brand group-hover:text-brand/80 transition-colors">
                        {doctorName}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Award className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="leading-relaxed">
                        <span className="font-semibold">
                          {t('PatientDoctors.card.degreeLabel')}:
                        </span>{' '}
                        {degreeText}
                      </span>
                    </p>
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Stethoscope className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="leading-relaxed">
                        <span className="font-semibold">
                          {t('PatientDoctors.card.certificateLabel')}:
                        </span>{' '}
                        {certificateText}
                      </span>
                    </p>
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="leading-snug text-(--text-muted)">
                        {t('PatientDoctors.card.experience', {
                          years: doctor.yearsOfExperience,
                        })}
                      </span>
                    </p>
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <FileText className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="line-clamp-2 text-sm italic text-(--text-muted) leading-relaxed">
                        <span className="font-semibold not-italic text-(--text-secondary)">
                          {t('PatientDoctors.card.aboutLabel')}:
                        </span>{' '}
                        {bioText}
                      </span>
                    </p>
                    {/* Time / Dates available */}
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span>
                        <span className="font-semibold">
                          {t('PatientDoctors.card.scheduleLabel')}:
                        </span>{' '}
                        {nextScheduleText}
                      </span>
                    </p>
                    {/* Price */}
                    <p className="text-sm text-(--text-primary) flex items-start gap-3">
                      <Banknote className="w-4 h-4 text-(--text-muted) mt-0.5 shrink-0" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {t('PatientDoctors.card.priceLabel')}:{' '}
                        {doctor.minPrice != null && doctor.maxPrice != null
                          ? doctor.minPrice === doctor.maxPrice
                            ? formatVnd(doctor.minPrice)
                            : `${formatVnd(doctor.minPrice)} - ${formatVnd(doctor.maxPrice)}`
                          : t('PatientDoctors.card.priceBySchedule')}
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
                      {consultMode === 'now'
                        ? t('PatientDoctors.card.bookNow')
                        : t('PatientDoctors.card.bookAppointment')}
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
              {t('PatientDoctors.empty.title')}
            </h3>
            <p className="text-(--text-secondary)">
              {timeFilterEnabled
                ? t('PatientDoctors.empty.adjustFilters')
                : t('PatientDoctors.empty.adjustSearch')}
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
                  {t('PatientDoctors.assistant.title')}
                </h3>
                <p className="text-sm text-(--text-secondary) mt-1">
                  {t('PatientDoctors.assistant.description')}
                </p>
              </div>
            </div>
            <button
              onClick={openN8nChat}
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              {t('PatientDoctors.assistant.cta')}
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
                {renderDoctorAvatar(selectedDoctor, 'w-12 h-12', 'text-lg')}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-(--text-primary)">
                    {selectedDoctor.userFullName?.trim() ||
                      t('PatientDoctors.card.unnamed')}
                  </h2>
                  {modalDegrees.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {modalDegrees.map((degree, index) => {
                        const label = getDegreeLabel(degree);
                        return (
                          <span
                            key={`${degree.id ?? label}-${index}`}
                            className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {t('PatientDoctors.modal.verifiedExperience', {
                      years: selectedDoctor.yearsOfExperience,
                    })}
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
                          : t('PatientDoctors.modal.noRating')}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        {t('PatientDoctors.modal.reviewCount', {
                          count: selectedDoctor.ratingCount || 0,
                        })}
                      </span>
                    </div>
                    <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color) flex flex-col items-center justify-center text-center">
                      <span className="flex items-center gap-1 text-brand font-bold text-lg">
                        <Award className="w-4 h-4 text-brand" />
                        {modalDegrees.length + modalCertificates.length}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        {t('PatientDoctors.modal.totalCredentials')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color)">
                    <p className="text-xs font-semibold text-(--text-secondary)">
                      {t('PatientDoctors.modal.expertiseLabel')}
                    </p>
                    <p className="mt-1 text-sm text-(--text-primary)">
                      {buildExpertiseText(modalCertificates)}
                    </p>
                  </div>

                  {/* Credentials Box */}
                  {(modalDegrees.length > 0 ||
                    modalCertificates.length > 0) && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold text-(--text-primary)">
                        {t('PatientDoctors.credentials.title')}
                      </h3>

                      {modalDegrees.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold text-(--text-secondary)">
                            {t('PatientDoctors.credentials.degrees')} (
                            {modalDegrees.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {modalDegrees.map((degree, index) => {
                              const label = getDegreeLabel(degree);
                              const url = getDegreeUrl(degree);
                              const key = `${degree.id ?? label}-${index}`;

                              if (url) {
                                return (
                                  <a
                                    key={key}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {label}
                                  </a>
                                );
                              }

                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {modalCertificates.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold text-(--text-secondary)">
                            {t('PatientDoctors.credentials.certificates')} (
                            {modalCertificates.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {modalCertificates.map((certificate, index) => {
                              const label = getCertificateLabel(certificate);
                              const url =
                                certificate.certificateUrl?.trim() || '';
                              const key = `${certificate.id ?? label}-${index}`;

                              if (url) {
                                return (
                                  <a
                                    key={key}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {label}
                                  </a>
                                );
                              }

                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg text-xs font-semibold"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {modalDegrees.length === 0 &&
                    modalCertificates.length === 0 && (
                      <div className="text-center py-6 border border-(--border-color) border-dashed rounded-xl">
                        <p className="text-xs text-(--text-muted)">
                          {t('PatientDoctors.credentials.empty')}
                        </p>
                      </div>
                    )}

                  {/* Bio block */}
                  {selectedDoctor.bio && (
                    <div className="bg-(--bg-secondary) p-4 rounded-xl border border-(--border-color)">
                      <h3 className="text-sm font-bold text-(--text-primary) mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" />{' '}
                        {t('PatientDoctors.modal.aboutDoctor')}
                      </h3>
                      <p className="text-sm italic text-(--text-muted) leading-relaxed">
                        {selectedDoctor.bio}
                      </p>
                    </div>
                  )}

                  {/* Feedback block */}
                  <div>
                    <h3 className="text-sm font-bold text-(--text-primary) mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand" />{' '}
                      {t('PatientDoctors.modal.patientFeedback')}
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
                                {fb.patientFullName ??
                                  t('PatientDoctors.modal.anonymousPatient')}
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
                              {fb.comment ||
                                t('PatientDoctors.modal.noCommentProvided')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-(--border-color) border-dashed rounded-xl">
                        <p className="text-xs text-(--text-muted)">
                          {t('PatientDoctors.modal.noReviewsYet')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floating call to action */}
                  <button
                    onClick={() => setBookingMode('select')}
                    className="w-full mt-4 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t('PatientDoctors.modal.bookAppointment')}
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
