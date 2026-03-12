import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  Eye,
  FileText,
  User,
  CreditCard,
  Download,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
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

  const pendingScreenings = mockScreenings.filter(
    (s) => s.status === 'pending'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50';
      case 'in-review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Ophthalmologist Verification
        </h1>
        <p className="text-(--text-secondary)">
          Request professional verification for your AI screening results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Screenings for Verification */}
          <div className="medical-card p-6">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4">
              Request New Verification
            </h2>

            {pendingScreenings.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Select a screening result to request professional
                  verification:
                </p>

                {pendingScreenings.map((screening) => (
                  <div
                    key={screening.id}
                    onClick={() => setSelectedScreening(screening.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedScreening === screening.id
                        ? 'bg-brand-soft border-brand/50'
                        : 'bg-(--bg-secondary) border-(--border-color) hover:border-brand/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          {screening.eye}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
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
                            ? 'border-brand bg-brand'
                            : 'border-gray-400'
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
                  <div className="mt-6 p-4 bg-(--bg-secondary) rounded-xl">
                    <h3 className="text-(--text-primary) font-medium mb-4">
                      Select Priority
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setSelectedPriority('normal')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedPriority === 'normal'
                            ? 'bg-brand-soft border-brand/50'
                            : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-brand/30'
                        }`}
                      >
                        <p className="text-[var(--text-primary)] font-medium mb-1">
                          Normal
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          2-3 business days
                        </p>
                        <p className="text-lg font-bold text-brand mt-2">
                          {formatCurrency(500000)}
                        </p>
                      </button>
                      <button
                        onClick={() => setSelectedPriority('urgent')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedPriority === 'urgent'
                            ? 'bg-amber-100 border-amber-500/50'
                            : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-amber-500/30'
                        }`}
                      >
                        <p className="text-[var(--text-primary)] font-medium mb-1">
                          Urgent
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Within 24 hours
                        </p>
                        <p className="text-lg font-bold text-amber-600 mt-2">
                          {formatCurrency(1000000)}
                        </p>
                      </button>
                    </div>

                    <button className="w-full py-3 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay & Request Verification
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-[var(--text-primary)] font-medium mb-2">
                  All caught up!
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  All your screening results have been verified.
                </p>
              </div>
            )}
          </div>

          {/* Verification History */}
          <div className="medical-card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Verification History
            </h2>

            <div className="space-y-4">
              {mockVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          verification.status === 'completed'
                            ? 'bg-green-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        {verification.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Spinner size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          Screening #{verification.screeningId}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
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
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-lg mb-3">
                      <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium text-sm">
                          {verification.ophthalmologist.name}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {verification.ophthalmologist.title}
                        </p>
                      </div>
                    </div>
                  )}

                  {verification.status === 'completed' && (
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Completed: {verification.completedAt}
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-soft text-brand rounded-lg text-sm hover:bg-brand/20 transition-colors">
                          <FileText className="w-4 h-4" />
                          View Report
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-sm hover:bg-[var(--bg-tertiary)] transition-colors">
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
          <div className="bg-gradient-to-br from-brand/10 to-accent/10 rounded-2xl border border-brand/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                How It Works
              </h2>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  1
                </span>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Select Screening
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Choose which AI result you want verified
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  2
                </span>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Pay for Service
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Choose priority and complete payment
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  3
                </span>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Expert Review
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Ophthalmologist reviews your results
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  4
                </span>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Get Diagnosis
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Receive verified diagnosis and recommendations
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Benefits */}
          <div className="medical-card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Why Get Verified?
            </h2>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[var(--text-secondary)] text-sm">
                  Professional diagnosis by certified ophthalmologists
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[var(--text-secondary)] text-sm">
                  Detailed health recommendations and treatment plans
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[var(--text-secondary)] text-sm">
                  Personalized health roadmap for eye care
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[var(--text-secondary)] text-sm">
                  Direct chat access with your assigned doctor
                </p>
              </li>
            </ul>
          </div>

          {/* Wallet Balance */}
          <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Wallet Balance
              </h2>
              <Link
                to="/patient/wallet"
                className="text-sm text-brand hover:text-brand/80"
              >
                Top up
              </Link>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {formatCurrency(2500000)}
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
