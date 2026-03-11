import { useQuery } from '@tanstack/react-query';
import {
  getProfile,
  getAppointments,
  getReports,
  getAnalysisList,
  getWallets,
} from '../api/patient.api';
import { profileKeys } from './useProfile';
import type {
  PatientProfile,
  Wallet,
  Appointment,
  ScreeningReport,
  AnalysisResult,
} from '../types';

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

  const appointmentsQuery = useQuery<Appointment[], Error>({
    queryKey: dashboardKeys.appointments(),
    queryFn: getAppointments,
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
        (a.status === 'pending' || a.status === 'confirmed') &&
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
