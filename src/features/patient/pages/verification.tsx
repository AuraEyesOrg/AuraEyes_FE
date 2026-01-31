import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  Eye,
  FileText,
  User,
  CreditCard,
  Loader2,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';

interface ScreeningResult {
  id: string;
  date: string;
  eye: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'verified';
}

interface VerificationRequest {
  id: string;
  screeningId: string;
  status: 'pending' | 'in-review' | 'completed';
  requestedAt: string;
  completedAt?: string;
  ophthalmologist?: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  fee: number;
  priority: 'normal' | 'urgent';
}

const mockScreenings: ScreeningResult[] = [
  {
    id: '1',
    date: 'Jan 28, 2026',
    eye: 'Left Eye (OS)',
    riskLevel: 'medium',
    status: 'pending',
  },
  {
    id: '2',
    date: 'Jan 25, 2026',
    eye: 'Right Eye (OD)',
    riskLevel: 'low',
    status: 'pending',
  },
  {
    id: '3',
    date: 'Jan 20, 2026',
    eye: 'Both Eyes',
    riskLevel: 'low',
    status: 'verified',
  },
];

const mockVerifications: VerificationRequest[] = [
  {
    id: 'v1',
    screeningId: '1',
    status: 'in-review',
    requestedAt: 'Jan 29, 2026',
    ophthalmologist: {
      name: 'Dr. Sarah Smith',
      title: 'Retina Specialist',
    },
    fee: 500000,
    priority: 'normal',
  },
  {
    id: 'v2',
    screeningId: '3',
    status: 'completed',
    requestedAt: 'Jan 21, 2026',
    completedAt: 'Jan 22, 2026',
    ophthalmologist: {
      name: 'Dr. John Williams',
      title: 'Ophthalmologist',
    },
    fee: 500000,
    priority: 'normal',
  },
];

export default function VerificationPage() {
  const [selectedScreening, setSelectedScreening] = useState<string | null>(
    null
  );
  const [selectedPriority, setSelectedPriority] = useState<'normal' | 'urgent'>(
    'normal'
  );
  const [showRequestModal, setShowRequestModal] = useState(false);

  const pendingScreenings = mockScreenings.filter(
    (s) => s.status === 'pending'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'in-review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
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
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Ophthalmologist Verification
        </h1>
        <p className="text-gray-400">
          Request professional verification for your AI screening results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Screenings for Verification */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Request New Verification
            </h2>

            {pendingScreenings.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">
                  Select a screening result to request professional
                  verification:
                </p>

                {pendingScreenings.map((screening) => (
                  <div
                    key={screening.id}
                    onClick={() => setSelectedScreening(screening.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedScreening === screening.id
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-[#1e3a5f]/30 border-[#2d4a6f] hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {screening.eye}
                        </p>
                        <p className="text-sm text-gray-400">
                          {screening.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-medium capitalize ${getRiskColor(screening.riskLevel)}`}
                      >
                        {screening.riskLevel} risk
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedScreening === screening.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-500'
                        }`}
                      >
                        {selectedScreening === screening.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {selectedScreening && (
                  <div className="mt-6 p-4 bg-[#1e3a5f]/30 rounded-xl">
                    <h3 className="text-white font-medium mb-4">
                      Select Priority
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setSelectedPriority('normal')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedPriority === 'normal'
                            ? 'bg-primary/20 border-primary/50'
                            : 'bg-[#0d2137] border-[#2d4a6f] hover:border-primary/30'
                        }`}
                      >
                        <p className="text-white font-medium mb-1">Normal</p>
                        <p className="text-sm text-gray-400">
                          2-3 business days
                        </p>
                        <p className="text-lg font-bold text-primary mt-2">
                          {formatCurrency(500000)}
                        </p>
                      </button>
                      <button
                        onClick={() => setSelectedPriority('urgent')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedPriority === 'urgent'
                            ? 'bg-amber-500/20 border-amber-500/50'
                            : 'bg-[#0d2137] border-[#2d4a6f] hover:border-amber-500/30'
                        }`}
                      >
                        <p className="text-white font-medium mb-1">Urgent</p>
                        <p className="text-sm text-gray-400">Within 24 hours</p>
                        <p className="text-lg font-bold text-amber-400 mt-2">
                          {formatCurrency(1000000)}
                        </p>
                      </button>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay & Request Verification
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-white font-medium mb-2">All caught up!</p>
                <p className="text-gray-400 text-sm">
                  All your screening results have been verified.
                </p>
              </div>
            )}
          </div>

          {/* Verification History */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Verification History
            </h2>

            <div className="space-y-4">
              {mockVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 bg-[#1e3a5f]/30 rounded-xl border border-[#2d4a6f]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          verification.status === 'completed'
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'
                        }`}
                      >
                        {verification.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Screening #{verification.screeningId}
                        </p>
                        <p className="text-sm text-gray-400">
                          Requested: {verification.requestedAt}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(verification.status)}`}
                    >
                      {verification.status.replace('-', ' ')}
                    </span>
                  </div>

                  {verification.ophthalmologist && (
                    <div className="flex items-center gap-3 p-3 bg-[#0d2137] rounded-lg mb-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {verification.ophthalmologist.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {verification.ophthalmologist.title}
                        </p>
                      </div>
                    </div>
                  )}

                  {verification.status === 'completed' && (
                    <div className="flex items-center justify-between pt-3 border-t border-[#2d4a6f]">
                      <p className="text-sm text-gray-400">
                        Completed: {verification.completedAt}
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors">
                          <FileText className="w-4 h-4" />
                          View Report
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2d4a6f] transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* How It Works */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-white">How It Works</h2>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  1
                </span>
                <div>
                  <p className="text-white font-medium">Select Screening</p>
                  <p className="text-sm text-gray-400">
                    Choose which AI result you want verified
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  2
                </span>
                <div>
                  <p className="text-white font-medium">Pay for Service</p>
                  <p className="text-sm text-gray-400">
                    Choose priority and complete payment
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  3
                </span>
                <div>
                  <p className="text-white font-medium">Expert Review</p>
                  <p className="text-sm text-gray-400">
                    Ophthalmologist reviews your results
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  4
                </span>
                <div>
                  <p className="text-white font-medium">Get Diagnosis</p>
                  <p className="text-sm text-gray-400">
                    Receive verified diagnosis and recommendations
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Benefits */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Why Get Verified?
            </h2>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  Professional diagnosis by certified ophthalmologists
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  Detailed health recommendations and treatment plans
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  Personalized health roadmap for eye care
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  Direct chat access with your assigned doctor
                </p>
              </li>
            </ul>
          </div>

          {/* Wallet Balance */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Wallet Balance
              </h2>
              <Link
                to="/patient/wallet"
                className="text-sm text-primary hover:text-primary/80"
              >
                Top up
              </Link>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(2500000)}
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
