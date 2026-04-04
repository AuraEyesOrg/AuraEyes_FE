import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import { downloadReportPdf, getReport, getReports } from '../api/patient.api';
import { formatShortDate } from '@/lib/date-utils';
import type { ScreeningReport } from '../types';
import { getLocaleFromPathname, withLocalePathname } from '@/i18n/locales';

const getRiskBadge = (risk: ScreeningReport['riskLevel']) => {
  switch (risk) {
    case 'low':
      return (
        <span className="badge-risk-low flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Low Risk
        </span>
      );
    case 'medium':
      return (
        <span className="badge-risk-medium flex items-center gap-1">
          <Clock className="w-3 h-3" /> Medium Risk
        </span>
      );
    case 'high':
      return (
        <span className="badge-risk-high flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> High Risk
        </span>
      );
    case 'critical':
      return (
        <span className="badge-risk-high flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Critical Risk
        </span>
      );
    default:
      return null;
  }
};

const getTypeLabel = (type: ScreeningReport['type']) => {
  switch (type) {
    case 'AI_SCREENING':
      return 'Retinal Screening';
    case 'OPHTHALMOLOGIST_VERIFIED':
      return 'Verified Result';
    default:
      return type;
  }
};

const getTypeIcon = (risk: ScreeningReport['riskLevel']) => {
  const bgClass =
    risk === 'low'
      ? 'icon-bg-green'
      : risk === 'medium' || risk === 'high'
        ? 'icon-bg-orange'
        : 'icon-bg-red';

  const iconClass =
    risk === 'low'
      ? 'text-green-600 dark:text-green-400'
      : risk === 'medium' || risk === 'high'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div
      className={`w-14 h-14 ${bgClass} rounded-xl flex items-center justify-center`}
    >
      <FileText className={`w-7 h-7 ${iconClass}`} />
    </div>
  );
};

const getStatusBadge = (status: ScreeningReport['status']) => {
  if (status === 'verified') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
        <CheckCircle className="w-3 h-3" /> Verified
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
      <CheckCircle className="w-3 h-3" /> Completed
    </span>
  );
};

const ReportsPage = () => {
  const location = useLocation();
  const currentLocale = getLocaleFromPathname(location.pathname) ?? 'vi';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<
    'all' | 'low' | 'medium' | 'high' | 'critical'
  >('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(
    null
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const reportsQuery = useQuery({
    queryKey: ['patient', 'reports'],
    queryFn: getReports,
  });

  const sortedReports = useMemo(() => {
    const reports = reportsQuery.data ?? [];
    return [...reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reportsQuery.data]);

  const latestReport = sortedReports[0] ?? null;

  const filteredReports = useMemo(() => {
    return sortedReports.filter((report) => {
      const searchText =
        `${report.summary} ${report.verifiedBy?.fullName ?? ''}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesRisk =
        filterRisk === 'all' || report.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [sortedReports, searchQuery, filterRisk]);

  const selectedReportQuery = useQuery({
    queryKey: ['patient', 'report', selectedReportId],
    queryFn: () => getReport(selectedReportId!),
    enabled: !!selectedReportId,
  });

  const selectedReportFromList = selectedReportId
    ? (sortedReports.find((report) => report.id === selectedReportId) ?? null)
    : null;

  const selectedReport = selectedReportQuery.data ?? selectedReportFromList;

  useEffect(() => {
    if (searchParams.get('openDiagnosis') !== 'latest' || !latestReport) {
      return;
    }

    setSelectedReportId(latestReport.id);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('openDiagnosis');
    setSearchParams(nextParams, { replace: true });
  }, [latestReport, searchParams, setSearchParams]);

  const closeDiagnosisModal = () => {
    setSelectedReportId(null);
  };

  const startScreeningPath = withLocalePathname(
    currentLocale,
    '/patient/screening/new'
  );

  const handleDownloadPdf = async (reportId: string) => {
    try {
      setDownloadingReportId(reportId);
      const blob = await downloadReportPdf(reportId);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `medical-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download medical report PDF:', error);
    } finally {
      setDownloadingReportId(null);
    }
  };

  if (reportsQuery.isLoading) {
    return (
      <PatientLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-(--bg-secondary)" />
          <div className="h-24 rounded-2xl bg-(--bg-secondary)" />
          <div className="h-24 rounded-2xl bg-(--bg-secondary)" />
          <div className="h-24 rounded-2xl bg-(--bg-secondary)" />
        </div>
      </PatientLayout>
    );
  }

  if (reportsQuery.error) {
    return (
      <PatientLayout>
        <div className="medical-card border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h2 className="font-semibold text-(--text-primary)">
                Unable to load reports
              </h2>
              <p className="text-sm text-(--text-secondary)">
                Please refresh or try again later.
              </p>
              <button
                type="button"
                onClick={() => reportsQuery.refetch()}
                className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Medical Reports
        </h1>
        <p className="text-(--text-secondary)">
          View your retinal screening history and diagnosis details
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-blue rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {sortedReports.length}
              </p>
              <p className="text-xs text-(--text-secondary)">Total Reports</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-green rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {
                  sortedReports.filter((report) => report.status === 'verified')
                    .length
                }
              </p>
              <p className="text-xs text-(--text-secondary)">Verified</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-orange rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {
                  sortedReports.filter((report) => report.status === 'pending')
                    .length
                }
              </p>
              <p className="text-xs text-(--text-secondary)">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-red rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {
                  sortedReports.filter(
                    (report) =>
                      report.riskLevel === 'high' ||
                      report.riskLevel === 'critical'
                  ).length
                }
              </p>
              <p className="text-xs text-(--text-secondary)">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-(--text-primary) placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'low', 'medium', 'high', 'critical'] as const).map(
            (risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRisk === risk
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-[#1e3a5f]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1e3a5f]'
                }`}
              >
                {risk === 'all'
                  ? 'All'
                  : `${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk`}
              </button>
            )
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-[#0d2137] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {getTypeIcon(report.riskLevel)}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-(--text-primary)">
                      {getTypeLabel(report.type)}
                    </h3>
                    {getRiskBadge(report.riskLevel)}
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2 text-(--text-secondary)">
                      <Calendar className="w-4 h-4" />
                      <span>{formatShortDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-(--text-secondary)">
                      <Eye className="w-4 h-4" />
                      <span>
                        Reviewed by{' '}
                        {report.verifiedBy?.fullName || 'AI Analysis'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-(--text-primary) line-clamp-2">
                    {report.summary}
                  </p>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setSelectedReportId(report.id)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => void handleDownloadPdf(report.id)}
                  disabled={downloadingReportId === report.id}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-70 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {downloadingReportId === report.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
            No Reports Found
          </h3>
          <p className="text-(--text-secondary) mb-6">
            {searchQuery || filterRisk !== 'all'
              ? 'Try adjusting your search or filters.'
              : "You haven't completed any screenings yet."}
          </p>
          <Link
            to={startScreeningPath}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
          >
            Start Your First Screening
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {selectedReportId && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={closeDiagnosisModal}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-(--bg-primary) border border-(--border-color) shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {!selectedReport && (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-(--text-secondary)" />
                <p className="text-sm text-(--text-secondary) mt-3">
                  Loading medical diagnosis details...
                </p>
              </div>
            )}

            {selectedReport && (
              <>
                <div className="p-5 border-b border-(--border-color) flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                      Medical Diagnosis
                    </p>
                    <h3 className="text-xl font-bold text-(--text-primary) mt-1">
                      {getTypeLabel(selectedReport.type)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {getRiskBadge(selectedReport.riskLevel)}
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDiagnosisModal}
                    className="p-2 rounded-lg hover:bg-(--bg-secondary) text-(--text-secondary)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-(--border-color) p-3 bg-(--bg-secondary)">
                      <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                        Created At
                      </p>
                      <p className="text-(--text-primary) font-semibold mt-1">
                        {formatShortDate(selectedReport.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedReport.medicalDiagnosis && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-3">
                        Medical Diagnosis Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Diagnosis Code
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.diagnosisCode ||
                              'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Coding System
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.codingSystem ||
                              'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Severity Level
                          </p>
                          <p className="text-(--text-primary) mt-1 capitalize">
                            {selectedReport.medicalDiagnosis?.severityLevel ||
                              'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Confidence Level
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.confidenceLevel !=
                            null
                              ? `${selectedReport.medicalDiagnosis.confidenceLevel}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Clinical Status
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.status || 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Urgent Case
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis
                              ? selectedReport.medicalDiagnosis.isUrgent
                                ? 'Yes'
                                : 'No'
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Referral Needed
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis
                              ? selectedReport.medicalDiagnosis.isReferralNeeded
                                ? 'Yes'
                                : 'No'
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Follow-up Date
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.followUpDate
                              ? formatShortDate(
                                  selectedReport.medicalDiagnosis.followUpDate
                                )
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) p-3">
                          <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                            Finalized At
                          </p>
                          <p className="text-(--text-primary) mt-1">
                            {selectedReport.medicalDiagnosis?.finalizedAt
                              ? formatShortDate(
                                  selectedReport.medicalDiagnosis.finalizedAt
                                )
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      Clinical Summary
                    </h4>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">
                      {selectedReport.summary}
                    </p>
                  </section>

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      Findings
                    </h4>
                    {selectedReport.medicalDiagnosis?.clinicalFindings ? (
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.clinicalFindings}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedReport.findings.map((finding) => (
                          <li
                            key={finding.id}
                            className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word"
                          >
                            • {finding.description}
                          </li>
                        ))}
                        {selectedReport.findings.length === 0 && (
                          <li className="text-sm text-(--text-muted)">
                            No detailed findings available.
                          </li>
                        )}
                      </ul>
                    )}
                  </section>

                  {selectedReport.medicalDiagnosis?.treatmentPlan && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                        Treatment Plan
                      </h4>
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.treatmentPlan}
                      </p>
                    </section>
                  )}

                  {selectedReport.medicalDiagnosis?.lifestyleAdvice && (
                    <section className="rounded-xl border border-(--border-color) p-4">
                      <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                        Lifestyle Advice
                      </h4>
                      <p className="text-sm text-(--text-secondary) whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {selectedReport.medicalDiagnosis.lifestyleAdvice}
                      </p>
                    </section>
                  )}

                  <section className="rounded-xl border border-(--border-color) p-4">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-(--text-secondary)"
                        >
                          • {item}
                        </li>
                      ))}
                      {selectedReport.recommendations.length === 0 && (
                        <li className="text-sm text-(--text-muted)">
                          No recommendations available.
                        </li>
                      )}
                    </ul>
                  </section>

                  {(selectedReport.verifiedAt || selectedReport.verifiedBy) && (
                    <section className="rounded-xl border border-(--border-color) p-4 bg-brand-soft/40">
                      {selectedReport.verifiedAt && (
                        <p className="text-sm text-(--text-secondary)">
                          <span className="font-semibold text-(--text-primary)">
                            Verified At:{' '}
                          </span>
                          {formatShortDate(selectedReport.verifiedAt)}
                        </p>
                      )}
                      {selectedReport.verifiedBy?.fullName && (
                        <p className="text-sm text-(--text-secondary) mt-2">
                          <span className="font-semibold text-(--text-primary)">
                            Verified By:{' '}
                          </span>
                          {selectedReport.verifiedBy.fullName}
                        </p>
                      )}
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default ReportsPage;
