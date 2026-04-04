import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronRight,
  X,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { Link, useSearchParams } from 'react-router-dom';

interface Report {
  id: string;
  date: string;
  type: 'screening' | 'follow-up' | 'verification';
  result: string;
  riskLevel: 'low' | 'medium' | 'high';
  doctor: string;
  hasHeatmap: boolean;
  isVerified: boolean;
  conditions?: string[];
  medicalDiagnosis?: {
    diagnosisCode?: string;
    summary: string;
    findings: string[];
    recommendations: string[];
    treatmentPlan?: string;
    followUp?: string;
  };
}

const mockReports: Report[] = [
  {
    id: '1',
    date: 'Jan 15, 2026',
    type: 'screening',
    result: 'Healthy',
    riskLevel: 'low',
    doctor: 'AI Analysis',
    hasHeatmap: true,
    isVerified: true,
    conditions: [],
    medicalDiagnosis: {
      diagnosisCode: 'H35.30',
      summary:
        'No critical retinal abnormalities were identified. Continue routine preventive care.',
      findings: [
        'Retinal structure appears stable.',
        'No signs of active hemorrhage or edema.',
      ],
      recommendations: [
        'Maintain annual retinal screening schedule.',
        'Use adequate lighting and rest your eyes every 20 minutes.',
      ],
      treatmentPlan: 'No immediate treatment is required.',
      followUp: 'Routine follow-up in 12 months.',
    },
  },
  {
    id: '2',
    date: 'Dec 10, 2025',
    type: 'follow-up',
    result: 'Mild Signs Detected',
    riskLevel: 'medium',
    doctor: 'Dr. Sarah Smith',
    hasHeatmap: true,
    isVerified: true,
    conditions: ['Early AMD signs'],
    medicalDiagnosis: {
      diagnosisCode: 'H35.31',
      summary:
        'Early age-related macular degeneration features observed with moderate progression risk.',
      findings: [
        'Small drusen deposits in macular region.',
        'Mild pigmentary changes noted bilaterally.',
      ],
      recommendations: [
        'Review with ophthalmologist for personalized risk management.',
        'Increase dietary antioxidants and omega-3 intake.',
      ],
      treatmentPlan:
        'Conservative monitoring with lifestyle optimization and scheduled reassessment.',
      followUp: 'Follow-up retinal exam in 3-6 months.',
    },
  },
  {
    id: '3',
    date: 'Nov 5, 2025',
    type: 'screening',
    result: 'Healthy',
    riskLevel: 'low',
    doctor: 'AI Analysis',
    hasHeatmap: true,
    isVerified: false,
    medicalDiagnosis: {
      diagnosisCode: 'R69',
      summary:
        'Preliminary AI-only analysis suggests low immediate risk. Doctor verification is pending.',
      findings: ['No high-risk lesion patterns in uploaded images.'],
      recommendations: [
        'Await doctor verification for final clinical interpretation.',
      ],
      treatmentPlan: 'Pending physician review.',
      followUp: 'Follow-up date will be set after verification.',
    },
  },
  {
    id: '4',
    date: 'Oct 20, 2025',
    type: 'verification',
    result: 'Requires Attention',
    riskLevel: 'high',
    doctor: 'Dr. John Williams',
    hasHeatmap: true,
    isVerified: true,
    conditions: ['Diabetic Retinopathy - Stage 1', 'Monitor blood sugar'],
    medicalDiagnosis: {
      diagnosisCode: 'E11.319',
      summary:
        'Findings are consistent with early diabetic retinopathy requiring close monitoring.',
      findings: [
        'Microaneurysms noted in posterior pole.',
        'Mild retinal hemorrhagic spots without macular edema.',
      ],
      recommendations: [
        'Coordinate diabetic control with internal medicine specialist.',
        'Report any sudden vision changes immediately.',
      ],
      treatmentPlan:
        'Structured follow-up plan with retinal reassessment and glycemic optimization.',
      followUp: 'Follow-up with ophthalmologist in 8 weeks.',
    },
  },
];

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || report.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const latestReport = useMemo(() => {
    return [...mockReports].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, []);

  useEffect(() => {
    if (searchParams.get('openDiagnosis') !== 'latest' || !latestReport) {
      return;
    }

    setSelectedReport(latestReport);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('openDiagnosis');
    setSearchParams(nextParams, { replace: true });
  }, [latestReport, searchParams, setSearchParams]);

  const closeDiagnosisModal = () => {
    setSelectedReport(null);
  };

  const getRiskBadge = (risk: string) => {
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
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'screening':
        return 'Retinal Screening';
      case 'follow-up':
        return 'Follow-up Scan';
      case 'verification':
        return 'Verified Result';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string, risk: string) => {
    const bgClass =
      risk === 'low'
        ? 'icon-bg-green'
        : risk === 'medium'
          ? 'icon-bg-orange'
          : 'icon-bg-red';
    const iconClass =
      risk === 'low'
        ? 'text-green-600 dark:text-green-400'
        : risk === 'medium'
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

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Medical Reports
        </h1>
        <p className="text-(--text-secondary)">
          View, download, and track your screening results and heatmaps
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-blue rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {mockReports.length}
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockReports.filter((r) => r.isVerified).length}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Verified</p>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-orange rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockReports.filter((r) => r.hasHeatmap).length}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                With Heatmaps
              </p>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-bg-purple rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--text-primary)">
                {mockReports.filter((r) => r.riskLevel === 'low').length}
              </p>
              <p className="text-xs text-(--text-secondary)">Healthy Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-(--text-primary) placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1e3a5f] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2d4a6f] rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
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
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-[#0d2137] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {getTypeIcon(report.type, report.riskLevel)}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-(--text-primary)">
                      {getTypeLabel(report.type)}
                    </h3>
                    {getRiskBadge(report.riskLevel)}
                    {report.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2 text-(--text-secondary)">
                      <Calendar className="w-4 h-4" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-(--text-secondary)">
                      <Eye className="w-4 h-4" />
                      <span>Result: {report.result}</span>
                    </div>
                  </div>

                  <p className="text-sm text-(--text-secondary)">
                    Analyzed by:{' '}
                    <span className="text-(--text-primary)">
                      {report.doctor}
                    </span>
                  </p>

                  {report.conditions && report.conditions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1e3a5f]">
                      <p className="text-xs text-gray-500 mb-2">
                        Detected Conditions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {report.conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
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
            to="/patient/screening/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
          >
            Start Your First Screening
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={closeDiagnosisModal}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-(--bg-primary) border border-(--border-color) shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
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
                  {selectedReport.isVerified && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
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
                    Diagnosis Code
                  </p>
                  <p className="text-(--text-primary) font-semibold mt-1">
                    {selectedReport.medicalDiagnosis?.diagnosisCode || 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-(--border-color) p-3 bg-(--bg-secondary)">
                  <p className="text-(--text-muted) text-xs uppercase tracking-wide">
                    Evaluated By
                  </p>
                  <p className="text-(--text-primary) font-semibold mt-1">
                    {selectedReport.doctor}
                  </p>
                </div>
              </div>

              <section className="rounded-xl border border-(--border-color) p-4">
                <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                  Clinical Summary
                </h4>
                <p className="text-sm text-(--text-secondary) leading-relaxed">
                  {selectedReport.medicalDiagnosis?.summary ||
                    'Medical diagnosis details are currently unavailable for this report.'}
                </p>
              </section>

              <section className="rounded-xl border border-(--border-color) p-4">
                <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                  Findings
                </h4>
                <ul className="space-y-2">
                  {(selectedReport.medicalDiagnosis?.findings || []).map(
                    (item) => (
                      <li
                        key={item}
                        className="text-sm text-(--text-secondary)"
                      >
                        • {item}
                      </li>
                    )
                  )}
                  {(!selectedReport.medicalDiagnosis?.findings ||
                    selectedReport.medicalDiagnosis.findings.length === 0) && (
                    <li className="text-sm text-(--text-muted)">
                      No detailed findings available.
                    </li>
                  )}
                </ul>
              </section>

              <section className="rounded-xl border border-(--border-color) p-4">
                <h4 className="text-sm font-semibold text-(--text-primary) mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {(selectedReport.medicalDiagnosis?.recommendations || []).map(
                    (item) => (
                      <li
                        key={item}
                        className="text-sm text-(--text-secondary)"
                      >
                        • {item}
                      </li>
                    )
                  )}
                  {(!selectedReport.medicalDiagnosis?.recommendations ||
                    selectedReport.medicalDiagnosis.recommendations.length ===
                      0) && (
                    <li className="text-sm text-(--text-muted)">
                      No recommendations available.
                    </li>
                  )}
                </ul>
              </section>

              {(selectedReport.medicalDiagnosis?.treatmentPlan ||
                selectedReport.medicalDiagnosis?.followUp) && (
                <section className="rounded-xl border border-(--border-color) p-4 bg-brand-soft/40">
                  {selectedReport.medicalDiagnosis?.treatmentPlan && (
                    <p className="text-sm text-(--text-secondary)">
                      <span className="font-semibold text-(--text-primary)">
                        Treatment Plan:{' '}
                      </span>
                      {selectedReport.medicalDiagnosis.treatmentPlan}
                    </p>
                  )}
                  {selectedReport.medicalDiagnosis?.followUp && (
                    <p className="text-sm text-(--text-secondary) mt-2">
                      <span className="font-semibold text-(--text-primary)">
                        Follow-up:{' '}
                      </span>
                      {selectedReport.medicalDiagnosis.followUp}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default ReportsPage;
