import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import type { Doctor } from '../types/ophthalmologist.types';

interface Appointment {
  id: string;
  patientName: string;
  patientInitials: string;
  patientId: string;
  avatarColor: string;
  date: string;
  time: string;
  endTime: string;
  type: 'screening' | 'follow-up' | 'consultation' | 'emergency';
  location: string;
  clinicName: string;
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  isOnline: boolean;
  notes?: string;
  aiPrediction?: string;
  confidence?: number;
}

const mockAppointments: Appointment[] = [
  {
    id: 'APT-001',
    patientName: 'Elena Miller',
    patientInitials: 'EM',
    patientId: '#48291',
    avatarColor: '#14b8a6',
    date: 'Jan 25, 2026',
    time: '09:00 AM',
    endTime: '09:30 AM',
    type: 'screening',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'scheduled',
    isOnline: false,
    notes:
      'Initial retinal screening - patient reports occasional blurred vision',
    aiPrediction: 'Macular Degeneration',
    confidence: 78,
  },
  {
    id: 'APT-002',
    patientName: 'David Kim',
    patientInitials: 'DK',
    patientId: '#48290',
    avatarColor: '#f59e0b',
    date: 'Jan 25, 2026',
    time: '10:00 AM',
    endTime: '10:30 AM',
    type: 'follow-up',
    location: 'Online',
    clinicName: 'Online Consultation',
    status: 'confirmed',
    isOnline: true,
    notes: 'Follow-up for diabetic retinopathy treatment',
  },
  {
    id: 'APT-003',
    patientName: 'Sarah Jenkins',
    patientInitials: 'SJ',
    patientId: '#48301',
    avatarColor: '#8b5cf6',
    date: 'Jan 25, 2026',
    time: '11:30 AM',
    endTime: '12:00 PM',
    type: 'consultation',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'in-progress',
    isOnline: false,
    notes: 'Discuss AI screening results',
    aiPrediction: 'Microaneurysms',
    confidence: 65,
  },
  {
    id: 'APT-004',
    patientName: 'Marcus Wright',
    patientInitials: 'MW',
    patientId: '#48312',
    avatarColor: '#ec4899',
    date: 'Jan 24, 2026',
    time: '02:30 PM',
    endTime: '03:00 PM',
    type: 'screening',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'completed',
    isOnline: false,
    aiPrediction: 'Healthy',
    confidence: 95,
  },
  {
    id: 'APT-005',
    patientName: 'Linda Chen',
    patientInitials: 'LC',
    patientId: '#48320',
    avatarColor: '#06b6d4',
    date: 'Jan 24, 2026',
    time: '04:00 PM',
    endTime: '04:30 PM',
    type: 'emergency',
    location: 'Online',
    clinicName: 'Emergency Consultation',
    status: 'completed',
    isOnline: true,
    notes: 'Emergency referral - severe vision loss',
    aiPrediction: 'Diabetic Retinopathy',
    confidence: 92,
  },
  {
    id: 'APT-006',
    patientName: 'James Rodriguez',
    patientInitials: 'JR',
    patientId: '#48325',
    avatarColor: '#10b981',
    date: 'Jan 23, 2026',
    time: '09:00 AM',
    endTime: '09:30 AM',
    type: 'follow-up',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'cancelled',
    isOnline: false,
    notes: 'Patient requested reschedule',
  },
  {
    id: 'APT-007',
    patientName: 'Emily Watson',
    patientInitials: 'EW',
    patientId: '#48330',
    avatarColor: '#f43f5e',
    date: 'Jan 23, 2026',
    time: '10:30 AM',
    endTime: '11:00 AM',
    type: 'screening',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'no-show',
    isOnline: false,
  },
];

const mockDoctor: Doctor = {
  id: 'D001',
  name: 'Dr. Alistair',
  specialty: 'Retina Specialist',
  hospital: 'General Hospital',
  department: 'Retina Dept',
  avatar: null,
};

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<
    | 'all'
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const todayCount = mockAppointments.filter(
    (a) =>
      a.date === 'Jan 25, 2026' &&
      a.status !== 'cancelled' &&
      a.status !== 'no-show'
  ).length;
  const scheduledCount = mockAppointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  ).length;
  const completedCount = mockAppointments.filter(
    (a) => a.status === 'completed'
  ).length;
  const cancelledCount = mockAppointments.filter(
    (a) => a.status === 'cancelled' || a.status === 'no-show'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'no-show':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> No Show
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
        return 'Follow-up Visit';
      case 'consultation':
        return 'Consultation';
      case 'emergency':
        return 'Emergency';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'screening':
        return '#14b8a6';
      case 'follow-up':
        return '#3b82f6';
      case 'consultation':
        return '#8b5cf6';
      case 'emergency':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <DoctorSidebar pendingCount={12} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Appointments" />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your patient appointments and schedule
              </p>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors w-fit">
              <Plus size={18} />
              Add Time Slot
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Today
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {scheduledCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upcoming
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl p-4 border border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cancelledCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cancelled
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              {(
                [
                  'all',
                  'scheduled',
                  'confirmed',
                  'in-progress',
                  'completed',
                  'cancelled',
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white dark:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d4a6f] border border-gray-300 dark:border-[#2d4a6f]'
                  }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status.charAt(0).toUpperCase() +
                      status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`bg-white dark:bg-[#0a1f44] rounded-xl p-6 border border-gray-200 dark:border-[#1e3a5f] hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors ${
                  apt.status === 'cancelled' || apt.status === 'no-show'
                    ? 'opacity-60'
                    : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Patient Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ backgroundColor: apt.avatarColor }}
                    >
                      {apt.patientInitials}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {apt.patientName}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.patientId}
                        </span>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(apt.type) }}
                        >
                          {getTypeLabel(apt.type)}
                        </span>
                        {apt.aiPrediction && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                            AI: {apt.aiPrediction} ({apt.confidence}%)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {apt.time} - {apt.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.isOnline ? (
                            <>
                              <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-blue-600 dark:text-blue-400">
                                Online Consultation
                              </span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {apt.clinicName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {apt.notes && (
                        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                          📝 {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    {(apt.status === 'scheduled' ||
                      apt.status === 'confirmed') && (
                      <>
                        <button className="flex-1 lg:flex-none px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          Start Review
                        </button>
                        {apt.isOnline && (
                          <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <Video className="w-4 h-4" />
                            Start Call
                          </button>
                        )}
                        <button className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors">
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'in-progress' && (
                      <>
                        <button className="flex-1 lg:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                        <button className="flex-1 lg:flex-none px-4 py-2 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d4a6f] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" />
                          Add Notes
                        </button>
                      </>
                    )}
                    {apt.status === 'completed' && (
                      <button className="px-4 py-2 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d4a6f] rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        View Report
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAppointments.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f]">
              <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Appointments Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'all'
                  ? 'No appointments match your search criteria.'
                  : `No ${filter} appointments found.`}
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-5 h-5" />
                Add Time Slot
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
