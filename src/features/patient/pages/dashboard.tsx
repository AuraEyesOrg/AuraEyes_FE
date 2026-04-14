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
import { useEffect, useMemo, useState } from 'react';
import Spinner from '@/components/ui/spinner';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import PatientLayout from '../components/PatientLayout';
import { useDashboard } from '../hooks/useDashboard';
import { formatShortDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/helper';
import { screeningApi } from '../api/screening.api';

// ============ HELPERS ============

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const getGreeting = (t: TranslateFn) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('PatientDashboard.greeting.morning');
  if (hour < 18) return t('PatientDashboard.greeting.afternoon');
  return t('PatientDashboard.greeting.evening');
};

const getRiskLabel = (risk: string | undefined, t: TranslateFn) => {
  const normalized = normalizeRiskLevel(risk);
  if (!normalized) return t('PatientDashboard.risk.notAvailable');
  return normalized === 'low'
    ? t('PatientDashboard.badge.looksHealthy', {
        defaultValue: 'Looks Healthy',
      })
    : t('PatientDashboard.badge.needsAttention', {
        defaultValue: 'Needs Attention',
      });
};

const getDetectedSummary = (risk: string | undefined, t: TranslateFn) => {
  switch (risk) {
    case 'low':
      return t('PatientDashboard.detectedSummary.low');
    case 'medium':
      return t('PatientDashboard.detectedSummary.medium');
    case 'high':
    case 'critical':
      return t('PatientDashboard.detectedSummary.high');
    default:
      return t('PatientDashboard.detectedSummary.default');
  }
};

const normalizeRiskLevel = (risk?: string) => {
  if (!risk) return undefined;
  return risk.toLowerCase();
};

const looksLikeI18nKey = (value?: string) => {
  if (!value) return false;
  return /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*){2,}$/.test(
    value.trim()
  );
};

export default function PatientDashboard() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;

  const {
    profile,
    wallet,
    latestAnalysis,
    latestReport,
    recentReports,
    nextAppointment,
    isLoading,
  } = useDashboard();

  const firstName =
    profile?.fullName?.split(' ')[0] ??
    t('PatientDashboard.fallback.firstName');

  const recentSessionsQuery = useQuery({
    queryKey: ['screening', 'recent', 'dashboard'],
    queryFn: async () => {
      const response = await screeningApi.getRecentSessions(5);
      return response.data ?? [];
    },
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    // Always re-validate this query when returning to dashboard
    // so hero card reflects the newest screening session.
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 30_000,
    placeholderData: [],
  });

  const recentSessions = recentSessionsQuery.data ?? [];
  const latestSession = recentSessions[0];
  const latestSessionRisk = normalizeRiskLevel(latestSession?.latestRiskLevel);
  const latestSessionDetailQuery = useQuery({
    queryKey: [
      'screening',
      'latest-session-detail',
      latestSession?.screeningId,
    ],
    enabled: Boolean(latestSession?.screeningId),
    queryFn: async () => {
      if (!latestSession?.screeningId) return null;
      const response = await screeningApi.getSessionById(
        latestSession.screeningId
      );
      return response.data ?? null;
    },
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  const latestSessionImageUrl =
    latestSessionDetailQuery.data?.images?.[0]?.imageUrl;

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
  const latestReportRisk = latestReport?.riskLevel ?? latestAnalysis?.riskLevel;
  const effectiveLatestRisk = latestSessionRisk ?? latestReportRisk;
  const hasLatestSession = Boolean(latestSession);
  const hasHeroResult = Boolean(latestReport || latestSession);
  const heroImageCandidates = useMemo(() => {
    // Prefer session thumbnail (retinal photo) over heatmap to avoid dark/blank-looking hero images.
    const candidates = [
      latestSessionImageUrl,
      latestSession?.thumbnailUrl,
      latestReport?.heatmapUrl,
    ]
      .filter((url): url is string => Boolean(url && url.trim().length > 0))
      .map((url) => url.trim());
    return [...new Set(candidates)];
  }, [
    latestReport?.heatmapUrl,
    latestSession?.thumbnailUrl,
    latestSessionImageUrl,
  ]);
  const [heroImageCandidateIndex, setHeroImageCandidateIndex] = useState(0);
  const heroImageUrl =
    heroImageCandidates[heroImageCandidateIndex] ??
    heroImageCandidates[0] ??
    undefined;
  const heroTitle =
    latestSession != null
      ? t('PatientDashboard.hero.title.aiScreening')
      : latestReport?.type === 'OPHTHALMOLOGIST_VERIFIED'
        ? t('PatientDashboard.hero.title.specialistVerified')
        : t('PatientDashboard.hero.title.aiScreening');
  const heroRiskLabel = effectiveLatestRisk
    ? getRiskLabel(effectiveLatestRisk, t)
    : t('PatientDashboard.hero.awaitingAnalysis');
  const heroSummary =
    latestSession != null
      ? getDetectedSummary(effectiveLatestRisk, t)
      : latestReport?.summary && !looksLikeI18nKey(latestReport.summary)
        ? latestReport.summary
        : getDetectedSummary(effectiveLatestRisk, t);
  const heroDate = latestSession?.createdAt ?? latestReport?.createdAt;
  const heroScanId = latestSession?.screeningId ?? latestReport?.id;
  const latestSessionHasResult = Boolean(latestSession?.latestRiskLevel);
  const latestSessionTargetPath = latestSessionHasResult
    ? '/patient/screening/review'
    : latestSession?.screeningId
      ? `/patient/analysis?screeningId=${latestSession.screeningId}`
      : '/patient/analysis';
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);
  const [isHeroImageErrored, setIsHeroImageErrored] = useState(false);

  useEffect(() => {
    setHeroImageCandidateIndex(0);
  }, [heroImageCandidates.join('|')]);

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
      label: t('PatientDashboard.stats.latestAiRiskStatus'),
      value: effectiveLatestRisk
        ? getRiskLabel(effectiveLatestRisk, t)
        : t('PatientDashboard.stats.noScans'),
      valueColor: 'text-brand',
      bgColor: 'icon-bg-blue',
      iconColor: 'text-blue-500',
    },
    {
      icon: Calendar,
      label: t('PatientDashboard.stats.nextAppointment'),
      value: nextAppointment
        ? formatShortDate(nextAppointment.date)
        : t('PatientDashboard.stats.noneScheduled'),
      valueColor: 'text-[var(--text-primary)]',
      bgColor: 'icon-bg-pink',
      iconColor: 'text-pink-500',
    },
    {
      icon: Wallet,
      label: t('PatientDashboard.stats.walletBalance'),
      value: wallet
        ? formatCurrency(wallet.balance, {
            locale: 'vi-VN',
            useCurrencyStyle: false,
            suffix: ' VNĐ',
          })
        : t('PatientDashboard.stats.noWalletValue'),
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
              {getGreeting(t)}, {firstName}
            </h2>
            <p className="text-(--text-secondary) mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate} • {t('PatientDashboard.header.retinalOverview')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end mt-4 md:mt-0">
            <Link
              to="/patient/screening/new"
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('PatientDashboard.actions.newScreening')}
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
                      alt={t('PatientDashboard.hero.latestRetinalScanAlt')}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        showHeroImageSkeleton
                          ? 'opacity-0'
                          : 'opacity-80 group-hover:opacity-100'
                      }`}
                      onLoad={() => setIsHeroImageLoaded(true)}
                      onError={() => {
                        setIsHeroImageErrored(true);
                        setIsHeroImageLoaded(true);
                        setHeroImageCandidateIndex((prev) =>
                          prev < heroImageCandidates.length - 1
                            ? prev + 1
                            : prev
                        );
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
                      {t('PatientDashboard.hero.scanId', {
                        id: heroScanId.slice(0, 8),
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Scan Details */}
              <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      {t('PatientDashboard.hero.latestAnalysisResult')}
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
                        {getRiskLabel(effectiveLatestRisk, t)}
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
                        {t('PatientDashboard.hero.dateScanned')}
                      </p>
                      <p className="font-medium text-(--text-primary)">
                        {formatShortDate(heroDate)}
                      </p>
                    </div>
                  )}
                  {nextAppointment && (
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        {t('PatientDashboard.hero.nextScreening')}
                      </p>
                      <p className="font-medium text-brand">
                        {formatShortDate(nextAppointment.date)}
                      </p>
                    </div>
                  )}
                  <div className="ml-auto">
                    <Link
                      to={
                        latestSession
                          ? latestSessionTargetPath
                          : '/patient/screening?openDiagnosis=latest'
                      }
                      state={
                        latestSession
                          ? { screeningId: latestSession.screeningId }
                          : undefined
                      }
                      className="btn-primary flex items-center gap-2"
                    >
                      {latestReport
                        ? t('PatientDashboard.actions.viewFullReport')
                        : t('PatientDashboard.actions.openLatestSession')}
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
                    ? t('PatientDashboard.hero.processingTitle')
                    : t('PatientDashboard.hero.noResultsTitle')}
                </h3>
                <p className="text-(--text-secondary) mb-6">
                  {hasLatestSession
                    ? t('PatientDashboard.hero.processingDescription')
                    : t('PatientDashboard.hero.noResultsDescription')}
                </p>
                {hasLatestSession ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-4">
                    {latestSessionRisk && (
                      <span
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full border font-semibold capitalize ${getRiskBadgeColors(latestSessionRisk)}`}
                      >
                        {getRiskLabel(latestSessionRisk, t)}
                      </span>
                    )}
                    <Link
                      to="/patient/analysis"
                      state={{ screeningId: latestSession?.screeningId }}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t('PatientDashboard.actions.openLatestSession')}
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/patient/screening/new"
                    className="btn-primary inline-flex items-center gap-2 self-center lg:self-end w-fit"
                  >
                    <Upload className="w-4 h-4" />
                    {t('PatientDashboard.actions.uploadFirstScan')}
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
                  {t('PatientDashboard.history.title')}
                </h3>
                <Link
                  to="/patient/screening"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {t('PatientDashboard.history.viewAll')}
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
                                ? t(
                                    'PatientDashboard.hero.title.specialistVerified'
                                  )
                                : t('PatientDashboard.hero.title.aiScreening')}
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
                              {getRiskLabel(report.riskLevel, t)}
                            </span>
                            <Link
                              to={`/patient/screening?diagnosisId=${encodeURIComponent(report.id)}`}
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
                                alt={t(
                                  'PatientDashboard.history.recentScreeningAlt'
                                )}
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
                              {t('PatientDashboard.history.sessionLabel')}
                            </p>
                            <p className="text-sm text-(--text-secondary)">
                              {formatShortDate(session.createdAt)} •{' '}
                              {session.imagesCount === 1
                                ? t('PatientDashboard.history.imagesSingle', {
                                    count: session.imagesCount,
                                  })
                                : t('PatientDashboard.history.imagesMultiple', {
                                    count: session.imagesCount,
                                  })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {risk && (
                              <span className={getRiskBadgeStyle(risk)}>
                                {getRiskLabel(risk, t)}
                              </span>
                            )}
                            <Link
                              to={`/patient/screening?diagnosisId=${encodeURIComponent(session.screeningId)}`}
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
                    <p>{t('PatientDashboard.history.empty')}</p>
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
                {t('PatientDashboard.quickActions.title')}
              </h3>

              <Link
                to="/patient/chat"
                className="flex items-center justify-between w-full p-4 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) hover:border-brand/50 hover:bg-(--bg-tertiary) transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-brand" />
                  <span className="font-bold">
                    {t('PatientDashboard.quickActions.messageSpecialist')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/patient/clinics"
                className="flex items-center justify-between w-full p-4 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) hover:border-brand/50 hover:bg-(--bg-tertiary) transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-bold">
                    {t('PatientDashboard.quickActions.bookAppointment')}
                  </span>
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
