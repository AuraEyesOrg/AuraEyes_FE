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

// ============ HOOK ============

export const useDashboard = () => {
  const profileQuery = useQuery<PatientProfile, Error>({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
  });

  const walletQuery = useQuery<Wallet, Error>({
    queryKey: dashboardKeys.wallet(),
    queryFn: getWallets,
  });

  const appointmentsQuery = useQuery<ClinicAppointmentDto[], Error>({
    queryKey: dashboardKeys.appointments(),
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];
      return getPatientClinicAppointments(profileQuery.data.id);
    },
    enabled: Boolean(profileQuery.data?.id),
  });

  const reportsQuery = useQuery<ScreeningReport[], Error>({
    queryKey: dashboardKeys.reports(),
    queryFn: getReports,
  });

  const analysisQuery = useQuery<AnalysisResult[], Error>({
    queryKey: dashboardKeys.analysis(),
    queryFn: getAnalysisList,
  });

  // Derived data
  const profile = profileQuery.data;

  const latestAnalysis = analysisQuery.data
    ?.filter((a) => a.status === 'completed' || a.status === 'verified')
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

  const wallet = walletQuery.data;

  const isLoading =
    profileQuery.isLoading ||
    walletQuery.isLoading ||
    appointmentsQuery.isLoading ||
    reportsQuery.isLoading ||
    analysisQuery.isLoading;

  return {
    profile,
    wallet,
    latestAnalysis,
    latestReport,
    recentReports,
    nextAppointment,
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
