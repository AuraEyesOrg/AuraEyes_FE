import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  searchOphthalmologistsForPatient,
  getOphthalmologistDetailForPatient,
  type OphthalmologistSearchItem,
  type OphthalmologistDetailItem,
} from '../api/patient.api';
import { listOphthalmologistFeedback } from '../api/feedback.api';
import { useAppointmentSlots } from '../hooks/use-booking';
import { ScheduleStatus, SlotType } from '@/types/schedule';
import {
  loadScreeningConsultationContext,
  saveScreeningConsultationContext,
  type ScreeningConsultationContext,
} from '../types/consultation-context';
import type { Anomaly, RetinalImage } from '../types/type';
import { useWallet } from '../hooks/use-wallet';

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
  const { locale } = useParams();
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
}
