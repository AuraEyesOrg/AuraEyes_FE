import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';

// Mock screening data
const mockScreenings = [
  {
    id: 'SCR-001',
    patientName: 'Elena Miller',
    patientId: '#48291',
    patientInitials: 'EM',
    avatarColor: '#14b8a6',
    date: 'Oct 24, 2023',
    time: '09:30 AM',
    type: 'Full Retinal Scan',
    aiPrediction: 'Macular Degeneration',
    confidence: 78,
    status: 'pending-review',
    images: 4,
    notes: 'Patient reported blurred vision in right eye',
  },
  {
    id: 'SCR-002',
    patientName: 'David Kim',
    patientId: '#48290',
    patientInitials: 'DK',
    avatarColor: '#f59e0b',
    date: 'Oct 24, 2023',
    time: '10:15 AM',
    type: 'Routine Screening',
    aiPrediction: 'Healthy',
    confidence: 95,
    status: 'approved',
    images: 2,
    notes: 'Annual check-up, no concerns',
  },
  {
    id: 'SCR-003',
    patientName: 'Sarah Jenkins',
    patientId: '#48301',
    patientInitials: 'SJ',
    avatarColor: '#8b5cf6',
    date: 'Oct 23, 2023',
    time: '04:45 PM',
    type: 'Follow-up Scan',
    aiPrediction: 'Microaneurysms',
    confidence: 65,
    status: 'flagged',
    images: 6,
    notes: 'Follow-up from previous diabetic screening',
  },
  {
    id: 'SCR-004',
    patientName: 'Marcus Wright',
    patientId: '#48312',
    patientInitials: 'MW',
    avatarColor: '#ec4899',
    date: 'Oct 23, 2023',
    time: '03:20 PM',
    type: 'Full Retinal Scan',
    aiPrediction: 'Hypertensive Retinopathy',
    confidence: 88,
    status: 'pending-review',
    images: 4,
    notes: 'Patient has history of high blood pressure',
  },
  {
    id: 'SCR-005',
    patientName: 'Linda Chen',
    patientId: '#48320',
    patientInitials: 'LC',
    avatarColor: '#06b6d4',
    date: 'Oct 22, 2023',
    time: '11:00 AM',
    type: 'Urgent Screening',
    aiPrediction: 'Diabetic Retinopathy',
    confidence: 92,
    status: 'reviewed',
    images: 8,
    notes: 'Urgent referral from primary care',
  },
  {
    id: 'SCR-006',
    patientName: 'James Rodriguez',
    patientId: '#48325',
    patientInitials: 'JR',
    avatarColor: '#10b981',
    date: 'Oct 21, 2023',
    time: '02:30 PM',
    type: 'Glaucoma Assessment',
    aiPrediction: 'Glaucoma Suspect',
    confidence: 71,
    status: 'pending-review',
    images: 5,
    notes: 'Elevated intraocular pressure noted',
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle size={16} className="text-emerald-500" />;
    case 'reviewed':
      return <CheckCircle size={16} className="text-blue-500" />;
    case 'flagged':
      return <AlertCircle size={16} className="text-amber-500" />;
    case 'rejected':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-400" />;
  }
}

function getStatusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'approved':
      return { text: 'Approved', color: 'text-emerald-600 bg-emerald-50' };
    case 'reviewed':
      return { text: 'Reviewed', color: 'text-blue-600 bg-blue-50' };
    case 'flagged':
      return { text: 'Flagged', color: 'text-amber-600 bg-amber-50' };
    case 'rejected':
      return { text: 'Rejected', color: 'text-red-600 bg-red-50' };
    default:
      return { text: 'Pending Review', color: 'text-gray-600 bg-gray-100' };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-emerald-500';
  if (confidence >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ScreeningsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredScreenings = mockScreenings.filter((screening) => {
    const matchesSearch =
      screening.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screening.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || screening.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={12} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Screenings" />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Screenings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage patient screenings
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Screenings
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {mockScreenings.length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {
                  mockScreenings.filter((s) => s.status === 'pending-review')
                    .length
                }
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Reviewed
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {mockScreenings.filter((s) => s.status === 'reviewed').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Approved
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {mockScreenings.filter((s) => s.status === 'approved').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Flagged
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {mockScreenings.filter((s) => s.status === 'flagged').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or screening ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending-review">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] hover:bg-gray-50 dark:hover:bg-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white transition-colors">
              <Filter size={16} />
              More Filters
            </button>
          </div>

          {/* Screenings List */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-[#1e3a5f]">
              {filteredScreenings.map((screening) => {
                const statusLabel = getStatusLabel(screening.status);
                const confidenceColor = getConfidenceColor(
                  screening.confidence
                );

                return (
                  <div
                    key={screening.id}
                    className="p-5 hover:bg-gray-50/50 dark:hover:bg-[#1e3a5f]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Patient Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                        style={{ backgroundColor: screening.avatarColor }}
                      >
                        {screening.patientInitials}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {screening.patientName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {screening.patientId} • {screening.type}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabel.color}`}
                          >
                            {statusLabel.text}
                          </span>
                        </div>

                        {/* AI Prediction */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              AI Prediction:
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {screening.aiPrediction}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${confidenceColor} rounded-full`}
                                style={{ width: `${screening.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {screening.confidence}%
                            </span>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {screening.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {screening.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye size={12} />
                            {screening.images} images
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(screening.status)}
                            <span className="text-gray-600 dark:text-gray-400">
                              {screening.id}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {screening.notes && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                            {screening.notes}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() =>
                          navigate(
                            `/ophthalmologist/screenings/${screening.id}/review`
                          )
                        }
                        className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-xl transition-colors shrink-0"
                      >
                        {screening.status === 'pending-review'
                          ? 'Review'
                          : 'View Details'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
