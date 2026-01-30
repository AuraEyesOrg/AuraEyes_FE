import {
  Calendar,
  FileText,
  Upload,
  AlertCircle,
  Clock,
  TrendingUp,
  Eye,
  Wallet,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';

// Mock data for dashboard
const dashboardStats = {
  totalScreenings: 12,
  pendingResults: 2,
  upcomingAppointments: 3,
  walletBalance: 2500000,
};

const recentScreenings = [
  {
    id: '1',
    date: 'Jan 28, 2026',
    status: 'completed',
    riskLevel: 'low',
    eye: 'Left Eye (OS)',
  },
  {
    id: '2',
    date: 'Jan 25, 2026',
    status: 'pending',
    riskLevel: 'pending',
    eye: 'Right Eye (OD)',
  },
  {
    id: '3',
    date: 'Jan 20, 2026',
    status: 'verified',
    riskLevel: 'medium',
    eye: 'Both Eyes',
  },
];

const upcomingAppointments = [
  {
    id: '1',
    date: 'Feb 1, 2026',
    time: '10:00 AM',
    type: 'Follow-up',
    clinic: 'AURA Vision Clinic',
    doctor: 'Dr. Sarah Smith',
    isOnline: false,
  },
  {
    id: '2',
    date: 'Feb 5, 2026',
    time: '2:30 PM',
    type: 'Consultation',
    clinic: 'Eye Care Center',
    doctor: 'Dr. John Williams',
    isOnline: true,
  },
];

const healthRoadmap = {
  title: 'Post-Screening Care Plan',
  progress: 65,
  nextMilestone: 'Schedule OCT Scan',
  dueDate: 'Feb 10, 2026',
};

export default function PatientDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'verified':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-amber-400';
      case 'high':
        return 'text-orange-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <PatientLayout userName="John Doe">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, John!
        </h1>
        <p className="text-gray-400">
          Here's an overview of your retinal health status and upcoming
          activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] rounded-2xl p-6 border border-[#2d4a6f]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
              +2 this month
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Screenings</p>
          <p className="text-3xl font-bold text-white">
            {dashboardStats.totalScreenings}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] rounded-2xl p-6 border border-[#2d4a6f]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-400 bg-amber-400/20 px-2 py-1 rounded-full">
              Action needed
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Pending Results</p>
          <p className="text-3xl font-bold text-white">
            {dashboardStats.pendingResults}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] rounded-2xl p-6 border border-[#2d4a6f]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-white">
            {dashboardStats.upcomingAppointments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] rounded-2xl p-6 border border-[#2d4a6f]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-400" />
            </div>
            <Link
              to="/patient/wallet"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Top up →
            </Link>
          </div>
          <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(dashboardStats.walletBalance)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Screenings & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/patient/screening"
                className="flex flex-col items-center p-4 bg-[#1e3a5f]/50 rounded-xl hover:bg-[#1e3a5f] transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/30">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-gray-300 text-center">
                  New Screening
                </span>
              </Link>

              <Link
                to="/patient/appointments"
                className="flex flex-col items-center p-4 bg-[#1e3a5f]/50 rounded-xl hover:bg-[#1e3a5f] transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/30">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm text-gray-300 text-center">
                  Book Appointment
                </span>
              </Link>

              <Link
                to="/patient/reports"
                className="flex flex-col items-center p-4 bg-[#1e3a5f]/50 rounded-xl hover:bg-[#1e3a5f] transition-colors group"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500/30">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm text-gray-300 text-center">
                  View Reports
                </span>
              </Link>

              <Link
                to="/patient/chat"
                className="flex flex-col items-center p-4 bg-[#1e3a5f]/50 rounded-xl hover:bg-[#1e3a5f] transition-colors group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/30">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300 text-center">
                  Chat with Doctor
                </span>
              </Link>
            </div>
          </div>

          {/* Recent Screenings */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Recent Screenings
              </h2>
              <Link
                to="/patient/reports"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentScreenings.map((screening) => (
                <div
                  key={screening.id}
                  className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl hover:bg-[#1e3a5f]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{screening.eye}</p>
                      <p className="text-sm text-gray-400">{screening.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium capitalize ${getRiskColor(screening.riskLevel)}`}
                    >
                      {screening.riskLevel === 'pending'
                        ? 'Analyzing...'
                        : `${screening.riskLevel} risk`}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(screening.status)}`}
                    >
                      {screening.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Appointments & Roadmap */}
        <div className="space-y-6">
          {/* Health Roadmap Progress */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Health Roadmap
                </h2>
                <p className="text-sm text-gray-400">{healthRoadmap.title}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-medium text-white">
                  {healthRoadmap.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${healthRoadmap.progress}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-[#0d2137]/50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Next Milestone</p>
              <p className="text-white font-medium">
                {healthRoadmap.nextMilestone}
              </p>
              <p className="text-xs text-primary mt-1">
                Due: {healthRoadmap.dueDate}
              </p>
            </div>

            <Link
              to="/patient/roadmap"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
            >
              View Full Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Upcoming Appointments
              </h2>
              <Link
                to="/patient/appointments"
                className="text-sm text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#1e3a5f]/30 rounded-xl border border-[#2d4a6f]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{apt.type}</p>
                      <p className="text-sm text-gray-400">{apt.doctor}</p>
                    </div>
                    {apt.isOnline ? (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        Online
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        In-person
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {apt.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{apt.clinic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Need Attention Card */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Action Required</h3>
                <p className="text-sm text-gray-400 mb-3">
                  You have 2 screening results pending review. Request
                  ophthalmologist verification for detailed diagnosis.
                </p>
                <Link
                  to="/patient/verification"
                  className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                >
                  Request Verification <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
