import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  MoreVertical,
  Trash2,
  Download,
  Share2,
  ChevronRight,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

interface Scan {
  id: string;
  name: string;
  eye: 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes';
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  thumbnailUrl?: string;
  findings?: number;
}

// Mock data - replace with API call
const MOCK_SCANS: Scan[] = [
  {
    id: '1',
    name: 'Fundus_OS_001.jpg',
    eye: 'Left Eye (OS)',
    date: '2026-01-28',
    status: 'completed',
    riskLevel: 'low',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZvlMnDS-CcafTkkjgVLz-0UddpNaBx3OsGxIO9zGXC9fp7Xcw_1SoKlkYiy7zNvYBqtRA86b0wkhPKl9mX-MPsS7JyyMvW5eklHCPWjWy_hdxnGKOfLpWcKa1TvNvRs2wBtJzkygxKDBLqzveve9FQ-CH5A0ZR2TUS5U1KIWHEXQIs-lMeoR4Vx0jsbZlr095MuZggI7VU6BetlAaUJ6cCo_VHXoG5BRAPPmnS-xb7dR8aU3buiURokmF5U3L7W6KKyRilnvR6x4',
    findings: 0,
  },
  {
    id: '2',
    name: 'Fundus_OD_002.jpg',
    eye: 'Right Eye (OD)',
    date: '2026-01-25',
    status: 'completed',
    riskLevel: 'medium',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZvlMnDS-CcafTkkjgVLz-0UddpNaBx3OsGxIO9zGXC9fp7Xcw_1SoKlkYiy7zNvYBqtRA86b0wkhPKl9mX-MPsS7JyyMvW5eklHCPWjWy_hdxnGKOfLpWcKa1TvNvRs2wBtJzkygxKDBLqzveve9FQ-CH5A0ZR2TUS5U1KIWHEXQIs-lMeoR4Vx0jsbZlr095MuZggI7VU6BetlAaUJ6cCo_VHXoG5BRAPPmnS-xb7dR8aU3buiURokmF5U3L7W6KKyRilnvR6x4',
    findings: 2,
  },
  {
    id: '3',
    name: 'Scan_04_Macula.dicom',
    eye: 'Both Eyes',
    date: '2026-01-20',
    status: 'completed',
    riskLevel: 'high',
    findings: 5,
  },
  {
    id: '4',
    name: 'Latest_Scan.jpg',
    eye: 'Left Eye (OS)',
    date: '2026-01-30',
    status: 'processing',
  },
];

export default function ScreeningPage() {
  const navigate = useNavigate();
  const [scans] = useState<Scan[]>(MOCK_SCANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredScans = scans.filter(
    (scan) =>
      scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.eye.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (scan: Scan) => {
    switch (scan.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Clock className="w-3 h-3 animate-pulse" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border capitalize ${colors[riskLevel as keyof typeof colors]}`}
      >
        {riskLevel} risk
      </span>
    );
  };

  const completedScans = scans.filter((s) => s.status === 'completed').length;
  const processingScans = scans.filter((s) => s.status === 'processing').length;

  return (
    <PatientLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
              My Scans
            </h1>
            <p className="text-(--text-secondary) text-sm">
              View and manage your retinal screening history
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/screening/new')}
            className="btn-primary flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Screening
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {scans.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Scans</p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {completedScans}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Completed</p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {processingScans}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Processing</p>
              </div>
            </div>
          </div>
          <div className="medical-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {scans.reduce((acc, s) => acc + (s.findings || 0), 0)}
                </p>
                <p className="text-xs text-(--text-muted)">Findings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Scans List */}
        <div className="medical-card flex-1 overflow-hidden">
          <div className="p-4 border-b border-(--border-color)">
            <h2 className="text-sm font-bold text-(--text-primary)">
              Recent Scans ({filteredScans.length})
            </h2>
          </div>

          {filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No scans yet
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Start your first retinal screening to detect potential issues
                early
              </p>
              <button
                onClick={() => navigate('/patient/screening/new')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Screening
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (scan.status === 'completed') {
                      navigate('/patient/analysis');
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] shrink-0">
                    {scan.thumbnailUrl ? (
                      <img
                        src={scan.thumbnailUrl}
                        alt={scan.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[var(--text-primary)] font-medium truncate">
                        {scan.name}
                      </p>
                      {getRiskBadge(scan.riskLevel)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {scan.eye}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(scan.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {scan.findings !== undefined && (
                        <span>
                          {scan.findings}{' '}
                          {scan.findings === 1 ? 'finding' : 'findings'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {getStatusBadge(scan)}

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === scan.id ? null : scan.id
                        );
                      }}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === scan.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg z-10 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/patient/analysis');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <Eye className="w-4 h-4" />
                          View Analysis
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        >
                          <Share2 className="w-4 h-4" />
                          Share with Doctor
                        </button>
                        <hr className="my-1 border-[var(--border-color)]" />
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
