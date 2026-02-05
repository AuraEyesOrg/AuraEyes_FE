import {
  Calendar,
  FileText,
  Upload,
  Eye,
  Wallet,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Bell,
  Home,
  CheckCircle,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';

// Mock data for dashboard
const latestScan = {
  id: '#8823-X',
  date: 'Jan 30, 2026',
  nextScreening: 'Jul 30, 2026',
  result: 'Retinal Structure Stable',
  riskLevel: 'low',
  description:
    'The AI analysis detected no significant anomalies in the vascular structure or optic nerve head. Your retinal health appears consistent with previous baselines.',
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNfYMvswuRztDZIKYnxKSo6OSE2Dh6LBHr7RbcmTYEnOq-0FU_4Xg2yaq8QiAAQmHidzOwDCUjFo-3x1zRAGcMw-3xxlv5Nxz-L_EQVRhzzZw-MFIByJZhln3BgzBwpwHRx8Rh88NP50WeTb0W1OVC5QIt8b2HQS6jGMH1t-IsAeZrzpj8cFbWxlAaPbxuM3FSAVIf7wX1bw1s-B98lo9NYjrM61WMhp_z8G1mB3WrD-OhfOX7Z30Ryig8BBpUABw81vsuGIqjcx8x',
};

const screeningHistory = [
  {
    id: '1',
    title: 'Regular Checkup',
    date: 'Jan 30, 2026',
    doctor: 'Dr. S. Chen',
    riskLevel: 'low',
  },
  {
    id: '2',
    title: 'Annual Screening',
    date: 'Jan 15, 2026',
    doctor: 'AURA AI Auto',
    riskLevel: 'low',
  },
  {
    id: '3',
    title: 'Follow-up Scan',
    date: 'Dec 20, 2025',
    doctor: 'Dr. P. Patel',
    riskLevel: 'medium',
  },
];

const statsCards = [
  {
    icon: Eye,
    label: 'Latest AI Risk Status',
    value: 'Low Risk',
    valueColor: 'text-brand',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: Calendar,
    label: 'Next Appointment',
    value: 'Feb 15, 2026',
    valueColor: 'text-[var(--text-primary)]',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-500',
  },
  {
    icon: Wallet,
    label: 'Wallet Balance',
    value: '100.000 VNĐ',
    valueColor: 'text-[var(--text-primary)]',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
];

export default function PatientDashboard() {
  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'badge-risk-low';
      case 'medium':
        return 'badge-risk-medium';
      case 'high':
        return 'badge-risk-high';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimelineDotColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <PatientLayout userName="Alex Morgan">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {/* Breadcrumb */}
            <nav className="flex text-xs text-[var(--text-secondary)] mb-1">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    to="/"
                    className="hover:text-brand transition-colors flex items-center gap-1"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-[var(--border-color)]">/</span>
                </li>
                <li className="font-semibold text-(--text-primary)">
                  Dashboard
                </li>
              </ol>
            </nav>
            <h2 className="text-3xl font-extrabold text-(--text-primary) tracking-tight">
              Good Morning, Alex
            </h2>
            <p className="text-(--text-secondary) mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate} • Your Retinal Health Overview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end mt-4 md:mt-0">
            <button className="relative p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
            </button>
            <Link
              to="/patient/screening/new"
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New Scan
            </Link>
          </div>
        </header>

        {/* Latest Analysis Result Section */}
        <section className="medical-card p-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Scan Image */}
            <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[250px] bg-black rounded-lg overflow-hidden m-1 group">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  backgroundImage: `url("${latestScan.imageUrl}")`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/20">
                  Scan ID: {latestScan.id}
                </span>
              </div>
            </div>

            {/* Scan Details */}
            <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-center">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                    Latest Analysis Result
                  </p>
                  <h3 className="text-2xl font-bold text-(--text-primary)">
                    {latestScan.result}
                  </h3>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold capitalize">
                    {latestScan.riskLevel} Risk
                  </span>
                </div>
              </div>

              <p className="text-(--text-secondary) leading-relaxed mb-6">
                {latestScan.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-(--border-color)">
                <div>
                  <p className="text-xs text-(--text-muted) mb-1">
                    Date Scanned
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {latestScan.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">
                    Next Screening
                  </p>
                  <p className="font-medium text-brand">
                    {latestScan.nextScreening}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link
                    to="/patient/reports"
                    className="btn-primary flex items-center gap-2"
                  >
                    View Full Report
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="medical-card flex items-center gap-4">
              <div
                className={`p-3 ${stat.bgColor} dark:bg-opacity-10 rounded-lg shrink-0`}
              >
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
                  to="/patient/reports"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="p-6 flex-1">
                <div className="relative pl-4 border-l-2 border-[var(--border-color)] space-y-8">
                  {screeningHistory.map((item) => (
                    <div key={item.id} className="relative pl-6 group">
                      <div
                        className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-[3px] border-white ${getTimelineDotColor(item.riskLevel)} ring-1 ring-[var(--border-color)]`}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-bold text-(--text-primary)">
                            {item.title}
                          </p>
                          <p className="text-sm text-(--text-secondary)">
                            {item.date} • {item.doctor}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`${getRiskBadgeStyle(item.riskLevel)}`}
                          >
                            {item.riskLevel} Risk
                          </span>
                          <button className="text-[var(--text-muted)] hover:text-brand transition-colors">
                            <FileText className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
