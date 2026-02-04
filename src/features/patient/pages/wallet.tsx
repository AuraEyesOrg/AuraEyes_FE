import { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  CreditCard,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  DollarSign,
  X,
  Calendar,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

interface Transaction {
  id: string;
  type: 'deposit' | 'payment' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
  paymentMethod?: 'payos' | 'vnpay' | 'bank_transfer';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 1000000,
    status: 'completed',
    description: 'Wallet Top-up via VNPay',
    date: 'Jan 30, 2026 10:30 AM',
    paymentMethod: 'vnpay',
  },
  {
    id: '2',
    type: 'payment',
    amount: -500000,
    status: 'completed',
    description: 'Verification Service - Dr. Sarah Smith',
    date: 'Jan 29, 2026 2:15 PM',
  },
  {
    id: '3',
    type: 'deposit',
    amount: 2000000,
    status: 'completed',
    description: 'Wallet Top-up via PayOS',
    date: 'Jan 25, 2026 9:00 AM',
    paymentMethod: 'payos',
  },
  {
    id: '4',
    type: 'payment',
    amount: -1000000,
    status: 'completed',
    description: 'Urgent Verification - Dr. John Williams',
    date: 'Jan 22, 2026 4:45 PM',
  },
  {
    id: '5',
    type: 'refund',
    amount: 500000,
    status: 'completed',
    description: 'Refund - Cancelled Appointment',
    date: 'Jan 20, 2026 11:20 AM',
  },
  {
    id: '6',
    type: 'deposit',
    amount: 500000,
    status: 'pending',
    description: 'Wallet Top-up via VNPay',
    date: 'Jan 31, 2026 8:00 AM',
    paymentMethod: 'vnpay',
  },
];

const depositAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function WalletPage() {
  const [balance] = useState(2500000);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<
    'payos' | 'vnpay' | null
  >(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const handleDeposit = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || !selectedMethod) return;

    // TODO: Call API to create deposit request
    console.log('Deposit:', { amount, method: selectedMethod });
    setShowDepositModal(false);
    setSelectedAmount(null);
    setCustomAmount('');
    setSelectedMethod(null);
  };

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Digital Wallet
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your balance and view transaction history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Balance & Quick Actions */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="medical-card bg-gradient-to-br from-brand via-[#00d4e6] to-[#00b8cc] text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/90 font-medium">
                  Available Balance
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full py-3 bg-white hover:bg-white/95 rounded-xl font-semibold transition-all text-brand flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Top Up Wallet
            </button>
          </div>

          {/* Quick Stats */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              This Month
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-[var(--text-secondary)] text-sm">
                    Total Deposits
                  </span>
                </div>
                <span className="text-green-600 font-semibold">
                  +{formatCurrency(3000000)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[var(--text-secondary)] text-sm">
                    Total Spent
                  </span>
                </div>
                <span className="text-red-500 font-semibold">
                  -{formatCurrency(1500000)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[var(--text-secondary)] text-sm">
                    Transactions
                  </span>
                </div>
                <span className="text-[var(--text-primary)] font-semibold">
                  6
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              Payment Methods
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      VNPay
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Cards, Bank Transfer, QR
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      PayOS
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Bank Transfer, QR
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="medical-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <History className="w-5 h-5 text-brand" />
                Transaction History
              </h2>
              <button className="text-sm text-brand hover:text-brand/80 flex items-center gap-1 font-medium transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-brand/30 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'deposit'
                          ? 'bg-green-50'
                          : transaction.type === 'refund'
                            ? 'bg-blue-50'
                            : 'bg-red-50'
                      }`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold text-lg mb-1 ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="medical-card w-full max-w-lg shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-brand" />
                  Top Up Your Wallet
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Choose an amount and payment method
                </p>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {depositAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-brand text-white shadow-brand'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-brand/30'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium">
                  VND
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">
                Payment Method
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('vnpay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'vnpay'
                      ? 'bg-brand-soft border-brand shadow-brand'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[var(--text-primary)] font-semibold">
                      VNPay
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Credit/Debit Card, Bank Transfer
                    </p>
                  </div>
                  {selectedMethod === 'vnpay' && (
                    <CheckCircle className="w-5 h-5 text-brand" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedMethod('payos')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'payos'
                      ? 'bg-brand-soft border-brand shadow-brand'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[var(--text-primary)] font-semibold">
                      PayOS
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Bank Transfer, QR Code
                    </p>
                  </div>
                  {selectedMethod === 'payos' && (
                    <CheckCircle className="w-5 h-5 text-brand" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl font-semibold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!selectedMethod || (!selectedAmount && !customAmount)}
                className="flex-1 py-3 bg-brand hover:brightness-110 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 disabled:shadow-none"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
