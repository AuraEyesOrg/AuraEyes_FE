import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Shield,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Award,
  Stethoscope,
  Building2,
  MapPin,
  ChevronRight,
  Edit3,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Globe,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  X,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import useAuthStore from '@/store/auth-store';
import { getCurrentUser } from '@/features/auth/api/auth.api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Certificate {
  id: string;
  name: string;
  type: 'license' | 'degree' | 'certification';
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'verified' | 'pending' | 'expired';
  fileUrl?: string;
}

type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Payment'
  | 'Refund'
  | 'Transfer'
  | 'Bonus';

interface WalletTransaction {
  id: string;
  amount: number;
  transactionType: TransactionType;
  description?: string;
  createdAt: string;
}

interface WalletInfo {
  id: string;
  balance: number;
  transactions: WalletTransaction[];
}

interface OphthalmologistProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  yearsOfExperience: number;
  specialty: string;
  hospital: string;
  department: string;
  address: string;
  isVerified: boolean;
  verifiedAt?: string;
  certificates: Certificate[];
  createdAt: string;
}

interface OphthalmologistProfileApi {
  id: string;
  userFullName?: string | null;
  userEmail?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  isVerified: boolean;
  createdAt: string;
  certificates: Array<{
    id: string;
    name: string;
    issuingAuthority?: string | null;
    issuedDate: string;
    expiryDate?: string | null;
    isExpired: boolean;
  }>;
}

interface WalletApi {
  id: string;
  balance: number;
}

interface WalletTransactionApi {
  id: string;
  amount: number;
  transactionType: number | string;
  description?: string | null;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
}

const DEFAULT_PROFILE: OphthalmologistProfile = {
  id: '',
  fullName: 'Unknown Doctor',
  email: 'N/A',
  phone: 'N/A',
  bio: 'No profile bio available.',
  yearsOfExperience: 0,
  specialty: 'Ophthalmologist',
  hospital: 'N/A',
  department: 'N/A',
  address: 'N/A',
  isVerified: false,
  certificates: [],
  createdAt: new Date().toISOString(),
};

const normalizeTransactionType = (value: number | string): TransactionType => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized.includes('deposit')) return 'Deposit';
    if (normalized.includes('withdrawal')) return 'Withdrawal';
    if (normalized.includes('payment')) return 'Payment';
    if (normalized.includes('refund')) return 'Refund';
    if (normalized.includes('transfer')) return 'Transfer';
    if (normalized.includes('bonus')) return 'Bonus';
    return 'Transfer';
  }

  switch (value) {
    case 1:
      return 'Deposit';
    case 2:
      return 'Withdrawal';
    case 3:
      return 'Payment';
    case 4:
      return 'Refund';
    case 5:
      return 'Transfer';
    case 6:
      return 'Bonus';
    default:
      return 'Transfer';
  }
};

const mapCertificateType = (
  name: string
): 'license' | 'degree' | 'certification' => {
  const normalized = name.toLowerCase();
  if (normalized.includes('license')) return 'license';
  if (normalized.includes('degree')) return 'degree';
  return 'certification';
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  });

  const ophthalmologistId =
    currentUserQuery.data?.roleId ?? user?.roleId ?? null;

  const profileQuery = useQuery({
    queryKey: ['ophthalmologist', 'detail', ophthalmologistId],
    enabled: Boolean(ophthalmologistId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<OphthalmologistProfileApi>>(
        `/ophthalmologists/${ophthalmologistId}`
      );
      return response.data.data;
    },
  });

  const walletQuery = useQuery({
    queryKey: ['wallet', 'detail'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<WalletApi>>('/wallets');
      return response.data.data;
    },
  });

  const walletTransactionsQuery = useQuery({
    queryKey: ['wallet', 'transactions', 'settings-page'],
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<PagedResult<WalletTransactionApi>>
      >('/wallets/transactions', {
        params: { pageNumber: 1, pageSize: 8 },
      });
      return response.data.data;
    },
  });

  const profile = useMemo<OphthalmologistProfile>(() => {
    const authUser = currentUserQuery.data ?? user;
    const profileData = profileQuery.data;

    if (!authUser && !profileData) return DEFAULT_PROFILE;

    return {
      id: profileData?.id ?? authUser?.roleId ?? authUser?.id ?? '',
      fullName:
        profileData?.userFullName ?? authUser?.fullName ?? 'Unknown Doctor',
      email: profileData?.userEmail ?? authUser?.email ?? 'N/A',
      phone: 'N/A',
      bio: profileData?.bio?.trim() || 'No profile bio available.',
      yearsOfExperience: profileData?.yearsOfExperience ?? 0,
      specialty: 'Ophthalmologist',
      hospital: authUser?.organizationId ?? 'N/A',
      department: 'N/A',
      address: 'N/A',
      isVerified: profileData?.isVerified ?? Boolean(authUser?.isVerified),
      createdAt: profileData?.createdAt ?? new Date().toISOString(),
      certificates:
        profileData?.certificates.map((cert) => ({
          id: cert.id,
          name: cert.name,
          type: mapCertificateType(cert.name),
          issuedBy: cert.issuingAuthority ?? 'N/A',
          issuedDate: cert.issuedDate,
          expiryDate: cert.expiryDate ?? undefined,
          status: cert.isExpired ? 'expired' : 'verified',
        })) ?? [],
    };
  }, [currentUserQuery.data, profileQuery.data, user]);

  const wallet = useMemo<WalletInfo>(() => {
    return {
      id: walletQuery.data?.id ?? '',
      balance: walletQuery.data?.balance ?? 0,
      transactions:
        walletTransactionsQuery.data?.items.map((txn) => ({
          id: txn.id,
          amount: txn.amount,
          transactionType: normalizeTransactionType(txn.transactionType),
          description: txn.description ?? undefined,
          createdAt: txn.createdAt,
        })) ?? [],
    };
  }, [walletQuery.data, walletTransactionsQuery.data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'Deposit':
      case 'Bonus':
      case 'Refund':
        return {
          icon: ArrowDownLeft,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
        };
      case 'Withdrawal':
      case 'Payment':
      case 'Transfer':
        return {
          icon: ArrowUpRight,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
        };
      default:
        return {
          icon: DollarSign,
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-900/30',
        };
    }
  };

  const isIncomeTransaction = (type: TransactionType) => {
    return ['Deposit', 'Bonus', 'Refund', 'Payment'].includes(type);
  };

  const getStatusBadge = (status: 'verified' | 'pending' | 'expired') => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" /> Expired
          </span>
        );
    }
  };

  const getCertificateIcon = (type: 'license' | 'degree' | 'certification') => {
    switch (type) {
      case 'license':
        return Shield;
      case 'degree':
        return Award;
      case 'certification':
        return FileText;
    }
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={12} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Settings" />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile, credentials, and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Credentials */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>

                {(currentUserQuery.isLoading || profileQuery.isLoading) && (
                  <div className="px-6 pt-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading profile information...
                  </div>
                )}

                <div className="p-6">
                  {/* Avatar & Verification Status */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                        {profile.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2d4a6f] transition-colors">
                        <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.fullName}
                        </h3>
                        {profile.isVerified && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Verified
                            Practitioner
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        {profile.specialty} • {profile.yearsOfExperience} years
                        experience
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Member since{' '}
                        {new Date(profile.createdAt).toLocaleDateString(
                          'en-US',
                          { month: 'long', year: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Email Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Years of Experience
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.yearsOfExperience} years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Specialty
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Hospital / Clinic
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.hospital}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Bio / Description
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Credentials Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Medical Credentials
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Certificate
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {profile.certificates.map((cert) => {
                    const CertIcon = getCertificateIcon(cert.type);
                    return (
                      <div
                        key={cert.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] transition-colors group"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f] rounded-lg flex items-center justify-center shrink-0">
                          <CertIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {cert.name}
                            </h4>
                            {getStatusBadge(cert.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Issued by {cert.issuedBy}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>
                              Issued:{' '}
                              {new Date(cert.issuedDate).toLocaleDateString()}
                            </span>
                            {cert.expiryDate && (
                              <span>
                                Expires:{' '}
                                {new Date(cert.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* E-Wallet Section */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    E-Wallet
                  </h2>
                </div>

                <div className="p-4">
                  {/* Balance Card */}
                  <div className="bg-linear-to-br from-cyan-500 to-teal-500 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">
                          Available Balance
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-4">
                      {formatCurrency(wallet.balance)}
                    </p>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Withdraw Funds
                    </button>
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                      Recent Transactions
                    </p>
                    {walletTransactionsQuery.isLoading && (
                      <p className="px-1 py-3 text-sm text-gray-500 dark:text-gray-400">
                        Loading transactions...
                      </p>
                    )}
                    {!walletTransactionsQuery.isLoading &&
                      wallet.transactions.length === 0 && (
                        <p className="px-1 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No transactions yet.
                        </p>
                      )}
                    {wallet.transactions.slice(0, 4).map((txn) => {
                      const txnStyle = getTransactionIcon(txn.transactionType);
                      const TxnIcon = txnStyle.icon;
                      return (
                        <div
                          key={txn.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg"
                        >
                          <div
                            className={`w-9 h-9 ${txnStyle.bg} rounded-lg flex items-center justify-center shrink-0`}
                          >
                            <TxnIcon className={`w-4 h-4 ${txnStyle.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {txn.description || txn.transactionType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(txn.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-semibold ${isIncomeTransaction(txn.transactionType) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                            >
                              {isIncomeTransaction(txn.transactionType)
                                ? '+'
                                : '-'}
                              {formatCurrency(txn.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Link */}
                  <button className="w-full mt-3 p-3 text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    View All Transactions
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Settings */}
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Settings
                  </h2>
                </div>

                <div className="p-4 space-y-2">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Security
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Password & 2FA
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Language
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          English (US)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Appearance
                  </h2>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {theme === 'dark' ? 'Currently on' : 'Currently off'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Email
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive via email
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        emailNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          emailNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Push
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Browser notifications
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        pushNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          pushNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Appointment Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Reminders
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Appointment alerts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setAppointmentReminders(!appointmentReminders)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        appointmentReminders ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          appointmentReminders ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
                <div className="p-6 border-b border-red-200 dark:border-red-900/30">
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>
                </div>

                <div className="p-4">
                  <button className="w-full p-4 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors text-left">
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                      Temporarily disable your account
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
          />
          <div className="relative bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-gray-200 dark:border-[#1e3a5f]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Current Balance */}
            <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Available Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(wallet.balance)}
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  VND
                </span>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) =>
                    setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="0"
                  className="w-full pl-14 pr-4 py-3 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] rounded-xl text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Minimum withdrawal: {formatCurrency(100000)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1000000, 2000000, 5000000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="py-2 px-3 bg-gray-100 dark:bg-[#1e3a5f] hover:bg-gray-200 dark:hover:bg-[#2d4a6f] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            {/* Bank Account Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Withdrawal to
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">
                Vietcombank ***1234
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                NGUYEN ALISTAIR CHEN
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-[#1e3a5f] hover:bg-gray-200 dark:hover:bg-[#2d4a6f] text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle withdrawal
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
