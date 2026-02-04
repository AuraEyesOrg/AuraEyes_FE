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
          <div className="bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Available Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Top Up Wallet
            </button>
          </div>

          {/* Payment Methods */}
          <div className="medical-card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Payment Methods
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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

              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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

          {/* Quick Stats */}
          <div className="medical-card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              This Month
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  <span className="text-[var(--text-secondary)]">
                    Total Deposits
                  </span>
                </div>
                <span className="text-green-600 font-medium">
                  +{formatCurrency(3000000)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-[var(--text-secondary)]">
                    Total Spent
                  </span>
                </div>
                <span className="text-red-500 font-medium">
                  -{formatCurrency(1500000)}
                </span>
              </div>
              <hr className="border-[var(--border-color)]" />
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Transactions
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  6
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Transaction History
              </h2>
              <button className="text-sm text-brand hover:text-brand/80 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100'
                          : transaction.type === 'refund'
                            ? 'bg-blue-100'
                            : 'bg-red-100'
                      }`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              Top Up Your Wallet
            </h2>

            {/* Amount Selection */}
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Select Amount
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {depositAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedAmount === amount
                        ? 'bg-brand text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
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
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  VND
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Payment Method
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('vnpay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedMethod === 'vnpay'
                      ? 'bg-brand-soft border-brand/50'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[var(--text-primary)] font-medium">
                      VNPay
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Credit/Debit Card, Bank Transfer
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('payos')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedMethod === 'payos'
                      ? 'bg-brand-soft border-brand/50'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[var(--text-primary)] font-medium">
                      PayOS
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Bank Transfer, QR Code
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!selectedMethod || (!selectedAmount && !customAmount)}
                className="flex-1 py-3 bg-brand hover:bg-brand/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
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
