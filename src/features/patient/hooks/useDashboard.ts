import { useQuery } from '@tanstack/react-query';
import { getProfile, getReports } from '../api/patient.api';
import { getPatientClinicAppointments } from '../api/clinic-booking.api';
import { profileKeys } from './useProfile';
import type { PatientProfile, ScreeningReport } from '../types';
import type { ClinicAppointmentDto } from '../types/clinic-booking.types';

// ============ QUERY KEYS ============

export const dashboardKeys = {
  all: ['patient-dashboard'] as const,
  appointments: () => [...dashboardKeys.all, 'appointments'] as const,
  reports: () => [...dashboardKeys.all, 'reports'] as const,
};

const DASHBOARD_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 15 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchInterval: 30_000,
} as const;

// ============ HOOK ============

export const useDashboard = () => {
  const profileQuery = useQuery<PatientProfile, Error>({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const appointmentsQuery = useQuery<ClinicAppointmentDto[], Error>({
    queryKey: dashboardKeys.appointments(),
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];
      // Dashboard only needs the recent slice to surface "next appointment"
      const paged = await getPatientClinicAppointments(profileQuery.data.id, {
        tab: 'All',
        pageNumber: 1,
        pageSize: 20,
      });
      return paged.items;
    },
    enabled: Boolean(profileQuery.data?.id),
    placeholderData: [],
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const reportsQuery = useQuery<ScreeningReport[], Error>({
    queryKey: dashboardKeys.reports(),
    queryFn: getReports,
    placeholderData: [],
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const normalizeStatus = (value?: string | null): string =>
    (value ?? '').trim().toLowerCase();

  const isCompletedAnalysisStatus = (value?: string | null): boolean => {
    const normalized = normalizeStatus(value);
    return normalized === 'completed' || normalized === 'verified';
  };

  const isCompletedAppointmentStatus = (value?: string | null): boolean => {
    const normalized = normalizeStatus(value);
    return normalized === 'completed';
  };

  // Derived data
  const profile = profileQuery.data;

  const latestReport = reportsQuery.data
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const recentReports = reportsQuery.data
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const nextAppointment = appointmentsQuery.data
    ?.filter(
      (a) =>
        (a.status === 'Pending' || a.status === 'Confirmed') &&
        new Date(a.date) >= new Date()
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const hasCompletedAppointment =
    appointmentsQuery.data?.some((appointment) =>
      isCompletedAppointmentStatus(appointment.status)
    ) ?? false;

  const hasAnyReport = (reportsQuery.data?.length ?? 0) > 0;

  const canSubmitWebsiteFeedback = hasAnyReport || hasCompletedAppointment;

  const hasAnyDashboardData =
    profileQuery.data !== undefined ||
    appointmentsQuery.data !== undefined ||
    reportsQuery.data !== undefined;

  const isLoading =
    !hasAnyDashboardData &&
    (profileQuery.isLoading ||
      appointmentsQuery.isLoading ||
      reportsQuery.isLoading);

  return {
    profile,
    latestReport,
    recentReports,
    nextAppointment,
    canSubmitWebsiteFeedback,
    isLoading,
    errors: {
      profile: profileQuery.error,
      appointments: appointmentsQuery.error,
      reports: reportsQuery.error,
    },
  };
};
