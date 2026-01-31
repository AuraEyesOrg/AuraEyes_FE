import { useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';

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
  },
];

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || report.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

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
        ? 'bg-green-50'
        : risk === 'medium'
          ? 'bg-amber-50'
          : 'bg-red-50';
    const iconClass =
      risk === 'low'
        ? 'text-green-600'
        : risk === 'medium'
          ? 'text-amber-600'
          : 'text-red-600';

    return (
      <div
        className={`w-14 h-14 ${bgClass} rounded-xl flex items-center justify-center`}
      >
        <FileText className={`w-7 h-7 ${iconClass}`} />
      </div>
    );
  };

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Medical Reports</h1>
        <p className="text-[var(--text-secondary)]">
          View, download, and track your screening results and heatmaps
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockReports.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Total Reports</p>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
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
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockReports.filter((r) => r.hasHeatmap).length}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">With Heatmaps</p>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockReports.filter((r) => r.riskLevel === 'low').length}
              </p>
              <p className="text-xs text-gray-400">Healthy Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-gray-300 rounded-lg text-sm">
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
                  : 'bg-[#1e3a5f]/50 text-gray-400 hover:bg-[#1e3a5f]'
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
            className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {getTypeIcon(report.type, report.riskLevel)}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-white">
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
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span>Result: {report.result}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    Analyzed by:{' '}
                    <span className="text-white">{report.doctor}</span>
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
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {report.hasHeatmap && (
                  <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg text-sm font-medium transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Heatmap
                  </button>
                )}
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
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-400 mb-6">
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
    </PatientLayout>
  );
};

export default ReportsPage;
