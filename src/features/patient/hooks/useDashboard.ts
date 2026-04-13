import { useQuery } from '@tanstack/react-query';
import {
  getProfile,
  getReports,
  getAnalysisList,
  getWallets,
} from '../api/patient.api';
import { getPatientClinicAppointments } from '../api/clinic-booking.api';
import { profileKeys } from './useProfile';
import type {
  PatientProfile,
  Wallet,
  ScreeningReport,
  AnalysisResult,
} from '../types';
import type { ClinicAppointmentDto } from '../types/clinic-booking.types';

// ============ QUERY KEYS ============

export const dashboardKeys = {
  all: ['patient-dashboard'] as const,
  wallet: () => [...dashboardKeys.all, 'wallet'] as const,
  appointments: () => [...dashboardKeys.all, 'appointments'] as const,
  reports: () => [...dashboardKeys.all, 'reports'] as const,
  analysis: () => [...dashboardKeys.all, 'analysis'] as const,
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

  const walletQuery = useQuery<Wallet, Error>({
    queryKey: dashboardKeys.wallet(),
    queryFn: getWallets,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 30_000,
  });

  const appointmentsQuery = useQuery<ClinicAppointmentDto[], Error>({
    queryKey: dashboardKeys.appointments(),
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];
      return getPatientClinicAppointments(profileQuery.data.id);
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

  const analysisQuery = useQuery<AnalysisResult[], Error>({
    queryKey: dashboardKeys.analysis(),
    queryFn: getAnalysisList,
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

  const latestAnalysis = analysisQuery.data
    ?.filter((a) => isCompletedAnalysisStatus(a.status))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

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

  const hasCompletedAnalysis =
    analysisQuery.data?.some((analysis) =>
      isCompletedAnalysisStatus(analysis.status)
    ) ?? false;

  const canSubmitWebsiteFeedback =
    hasCompletedAnalysis || hasAnyReport || hasCompletedAppointment;

  const wallet = walletQuery.data;

  const hasAnyDashboardData =
    profileQuery.data !== undefined ||
    walletQuery.data !== undefined ||
    appointmentsQuery.data !== undefined ||
    reportsQuery.data !== undefined ||
    analysisQuery.data !== undefined;

  const isLoading =
    !hasAnyDashboardData &&
    (profileQuery.isLoading ||
      walletQuery.isLoading ||
      appointmentsQuery.isLoading ||
      reportsQuery.isLoading ||
      analysisQuery.isLoading);

  return {
    profile,
    wallet,
    latestAnalysis,
    latestReport,
    recentReports,
    nextAppointment,
    canSubmitWebsiteFeedback,
    isLoading,
    errors: {
      profile: profileQuery.error,
      wallet: walletQuery.error,
      appointments: appointmentsQuery.error,
      reports: reportsQuery.error,
      analysis: analysisQuery.error,
    },
  };
};
