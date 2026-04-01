import {
  Calendar,
  FileText,
  Upload,
  Eye,
  Wallet,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  History,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/spinner';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PatientLayout from '../components/PatientLayout';
import { useDashboard } from '../hooks/useDashboard';
import { formatShortDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { screeningApi } from '../api/screening.api';

// ============ HELPERS ============

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getRiskLabel = (risk?: string) => {
  if (!risk) return 'N/A';
  return risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
};

const getDetectedSummary = (risk?: string) => {
  switch (risk) {
    case 'low':
      return 'The AI analysis detected no significant anomalies in this latest scan. Continue regular monitoring to maintain stable retinal health.';
    case 'medium':
      return 'The AI analysis detected moderate retinal risk patterns. Please review this session and consider booking a follow-up with a specialist.';
    case 'high':
    case 'critical':
      return 'The AI analysis detected high-risk retinal patterns that may need urgent specialist review. Please open this session for detailed findings.';
    default:
      return 'The AI analysis detected findings from your latest scan. Open this session to review details and recommended next steps.';
  }
};

const normalizeRiskLevel = (risk?: string) => {
  if (!risk) return undefined;
  return risk.toLowerCase();
};

export default function PatientDashboard() {
  const {
    profile,
    wallet,
    latestAnalysis,
    latestReport,
    recentReports,
    nextAppointment,
    isLoading,
  } = useDashboard();

  const firstName = profile?.fullName?.split(' ')[0] ?? 'there';

  const recentSessionsQuery = useQuery({
    queryKey: ['screening', 'recent', 'dashboard'],
    queryFn: async () => {
      const response = await screeningApi.getRecentSessions(5);
      return response.data ?? [];
    },
  });

  const recentSessions = recentSessionsQuery.data ?? [];
  const latestSession = recentSessions[0];
  const latestSessionRisk = normalizeRiskLevel(latestSession?.latestRiskLevel);

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'badge-risk-low';
      case 'medium':
        return 'badge-risk-medium';
      case 'high':
      case 'critical':
        return 'badge-risk-high';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getRiskBadgeColors = (risk?: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800';
      case 'high':
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800';
    }
  };

  const getTimelineDotColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const currentDate = formatShortDate(new Date().toISOString());
  const latestReportSummary =
    latestReport?.summary ?? 'No analysis results yet.';
  const latestReportRisk = latestReport?.riskLevel ?? latestAnalysis?.riskLevel;
  const effectiveLatestRisk = latestReportRisk ?? latestSessionRisk;
  const hasLatestSession = Boolean(latestSession);
  const hasHeroResult = Boolean(latestReport || latestSession);
  const heroImageUrl = latestReport?.heatmapUrl ?? latestSession?.thumbnailUrl;
  const heroTitle =
    latestReport?.type === 'OPHTHALMOLOGIST_VERIFIED'
      ? 'Specialist Verified'
      : 'AI Screening';
  const heroRiskLabel = effectiveLatestRisk
    ? getRiskLabel(effectiveLatestRisk)
    : 'Awaiting Analysis';
  const heroSummary =
    latestReport?.summary || getDetectedSummary(effectiveLatestRisk);
  const heroDate = latestReport?.createdAt ?? latestSession?.createdAt;
  const heroScanId = latestReport?.id ?? latestSession?.screeningId;
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);
  const [isHeroImageErrored, setIsHeroImageErrored] = useState(false);

  useEffect(() => {
    setIsHeroImageLoaded(false);
    setIsHeroImageErrored(false);
  }, [heroImageUrl]);

  const showHeroImageSkeleton =
    Boolean(heroImageUrl) && !isHeroImageLoaded && !isHeroImageErrored;

  // Build stats cards from real data
  const statsCards = [
    {
      icon: Eye,
      label: 'Latest AI Risk Status',
      value: effectiveLatestRisk
        ? getRiskLabel(effectiveLatestRisk)
        : 'No Scans',
      valueColor: 'text-brand',
      bgColor: 'icon-bg-blue',
      iconColor: 'text-blue-500',
    },
    {
      icon: Calendar,
      label: 'Next Appointment',
      value: nextAppointment
        ? formatShortDate(nextAppointment.date)
        : 'None Scheduled',
      valueColor: 'text-[var(--text-primary)]',
      bgColor: 'icon-bg-pink',
      iconColor: 'text-pink-500',
    },
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: wallet
        ? formatCurrency(wallet.balance, {
            locale: 'vi-VN',
            useCurrencyStyle: false,
            suffix: ' VNĐ',
          })
        : '—',
      valueColor: 'text-[var(--text-primary)]',
      bgColor: 'icon-bg-orange',
      iconColor: 'text-orange-500',
    },
  ];

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size={32} />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="text-3xl font-extrabold text-(--text-primary) tracking-tight">
              {getGreeting()}, {firstName}
            </h2>
            <p className="text-(--text-secondary) mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate} • Your Retinal Health Overview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end mt-4 md:mt-0">
            <Link
              to="/patient/screening/new"
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              New Screening
            </Link>
          </div>
        </header>

        {/* Latest Analysis Result Section */}
        {hasHeroResult ? (
          <section className="medical-card p-1 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Scan Image */}
              <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[250px] bg-black rounded-lg overflow-hidden m-1 group">
                {heroImageUrl ? (
                  <>
                    {showHeroImageSkeleton && (
                      <div className="absolute inset-0 skeleton-shimmer bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700" />
                    )}
                    <img
                      src={heroImageUrl}
                      alt="Latest retinal scan"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        showHeroImageSkeleton
                          ? 'opacity-0'
                          : 'opacity-80 group-hover:opacity-100'
                      }`}
                      onLoad={() => setIsHeroImageLoaded(true)}
                      onError={() => {
                        setIsHeroImageErrored(true);
                        setIsHeroImageLoaded(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <Eye className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                {heroScanId && (
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/20">
                      Scan ID: #{heroScanId.slice(0, 8)}
                    </span>
                  </div>
                )}
              </div>

              {/* Scan Details */}
              <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      Latest Analysis Result
                    </p>
                    <h3 className="text-2xl font-bold text-(--text-primary)">
                      {heroTitle}
                      {' — '}
                      {heroRiskLabel}
                    </h3>
                  </div>
                  {effectiveLatestRisk && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getRiskBadgeColors(effectiveLatestRisk)}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-bold capitalize">
                        {effectiveLatestRisk} Risk
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-(--text-secondary) leading-relaxed mb-6">
                  {heroSummary}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-(--border-color)">
                  {heroDate && (
                    <div>
                      <p className="text-xs text-(--text-muted) mb-1">
                        Date Scanned
                      </p>
                      <p className="font-medium text-(--text-primary)">
                        {formatShortDate(heroDate)}
                      </p>
                    </div>
                  )}
                  {nextAppointment && (
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        Next Screening
                      </p>
                      <p className="font-medium text-brand">
                        {formatShortDate(nextAppointment.date)}
                      </p>
                    </div>
                  )}
                  <div className="ml-auto">
                    <Link
                      to={
                        latestSession ? '/patient/analysis' : '/patient/reports'
                      }
                      state={
                        latestSession
                          ? { screeningId: latestSession.screeningId }
                          : undefined
                      }
                      className="btn-primary flex items-center gap-2"
                    >
                      {latestReport
                        ? 'View Full Report'
                        : 'Open Latest Session'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="medical-card p-1 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[250px] bg-slate-950 rounded-lg overflow-hidden m-1 group">
                {latestSession?.thumbnailUrl ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        backgroundImage: `url("${latestSession.thumbnailUrl}")`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-slate-500" />
                  </div>
                )}
              </div>

              <div className="lg:w-2/3 p-8 text-center lg:text-left flex flex-col justify-center">
                <AlertCircle className="w-12 h-12 mx-auto lg:mx-0 mb-4 text-(--text-muted)" />
                <h3 className="text-xl font-bold text-(--text-primary) mb-2">
                  {hasLatestSession
                    ? 'Latest Session Is Processing'
                    : 'No Screening Results Yet'}
                </h3>
                <p className="text-(--text-secondary) mb-6">
                  {hasLatestSession
                    ? 'Your latest screening session is available. Open it to continue analysis and review results.'
                    : 'Upload your first retinal scan to get started with AI-powered analysis.'}
                </p>
                {hasLatestSession ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-4">
                    {latestSessionRisk && (
                      <span
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full border font-semibold capitalize ${getRiskBadgeColors(latestSessionRisk)}`}
                      >
                        {latestSessionRisk} risk
                      </span>
                    )}
                    <Link
                      to="/patient/analysis"
                      state={{ screeningId: latestSession?.screeningId }}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Open Latest Session
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/patient/screening/new"
                    className="btn-primary inline-flex items-center gap-2 self-center lg:self-end w-fit"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Your First Scan
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="medical-card flex items-center gap-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-(--text-secondary) font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-lg font-bold mt-1 ${stat.valueColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Screening History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="medical-card flex flex-col h-full p-0">
              <div className="p-6 border-b border-(--border-color) flex justify-between items-center">
                <h3 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
                  <History className="w-5 h-5 text-(--text-muted)" />
                  Screening History
                </h3>
                <Link
                  to="/patient/screening"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="p-6 flex-1">
                {recentReports && recentReports.length > 0 ? (
                  <div className="relative pl-4 border-l-2 border-[var(--border-color)] space-y-8">
                    {recentReports.map((report) => (
                      <div key={report.id} className="relative pl-6 group">
                        <div
                          className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-[3px] border-white dark:border-[#1e3a5f] ${getTimelineDotColor(report.riskLevel)} ring-1 ring-[var(--border-color)]`}
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-bold text-(--text-primary)">
                              {report.type === 'OPHTHALMOLOGIST_VERIFIED'
                                ? 'Specialist Verified'
                                : 'AI Screening'}
                            </p>
                            <p className="text-sm text-(--text-secondary)">
                              {formatShortDate(report.createdAt)}
                              {report.verifiedBy &&
                                ` • ${report.verifiedBy.fullName}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={getRiskBadgeStyle(report.riskLevel)}
                            >
                              {report.riskLevel} Risk
                            </span>
                            <Link
                              to={`/patient/reports`}
                              className="text-[var(--text-muted)] hover:text-brand transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session) => {
                      const risk = normalizeRiskLevel(session.latestRiskLevel);
                      return (
                        <div
                          key={session.screeningId}
                          className="flex items-center gap-4 p-4 rounded-xl border border-(--border-color) bg-[var(--bg-primary)]"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            {session.thumbnailUrl ? (
                              <img
                                src={session.thumbnailUrl}
                                alt="Recent screening"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Eye className="w-6 h-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-(--text-primary)">
                              Screening Session
                            </p>
                            <p className="text-sm text-(--text-secondary)">
                              {formatShortDate(session.createdAt)} •{' '}
                              {session.imagesCount} image
                              {session.imagesCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {risk && (
                              <span className={getRiskBadgeStyle(risk)}>
                                {risk} Risk
                              </span>
                            )}
                            <Link
                              to="/patient/reports"
                              state={{ screeningId: session.screeningId }}
                              className="text-[var(--text-muted)] hover:text-brand transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-(--text-muted)">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No screening history yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Wallet & Quick Actions */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="medical-card flex flex-col gap-3">
              <h3 className="text-sm font-bold text-(--text-primary) uppercase tracking-wide mb-2">
                Quick Actions
              </h3>

              <Link
                to="/patient/chat"
                className="flex items-center justify-between w-full p-4 rounded-lg bg-white dark:bg-[#1e3a5f] border border-(--border-color) dark:border-[#2d4a6f] text-(--text-primary) hover:border-brand/50 hover:bg-brand-soft dark:hover:bg-brand/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-brand" />
                  <span className="font-bold">Message Specialist</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/patient/clinics"
                className="flex items-center justify-between w-full p-4 rounded-lg bg-white dark:bg-[#1e3a5f] border border-(--border-color) dark:border-[#2d4a6f] text-(--text-primary) hover:border-brand/50 hover:bg-brand-soft dark:hover:bg-brand/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-bold">Book Appointment</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
