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
        return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-blue-400" />;
      default:
        return <History className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs text-red-400">
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
        <h1 className="text-3xl font-bold text-white mb-2">Digital Wallet</h1>
        <p className="text-gray-400">
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
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Payment Methods
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl border border-[#2d4a6f]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">VNPay</p>
                    <p className="text-xs text-gray-400">
                      Cards, Bank Transfer, QR
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl border border-[#2d4a6f]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">PayOS</p>
                    <p className="text-xs text-gray-400">Bank Transfer, QR</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              This Month
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">Total Deposits</span>
                </div>
                <span className="text-green-400 font-medium">
                  +{formatCurrency(3000000)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400">Total Spent</span>
                </div>
                <span className="text-red-400 font-medium">
                  -{formatCurrency(1500000)}
                </span>
              </div>
              <hr className="border-[#1e3a5f]" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Transactions</span>
                <span className="text-white font-medium">6</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Transaction History
              </h2>
              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl border border-[#2d4a6f] hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'deposit'
                          ? 'bg-green-500/20'
                          : transaction.type === 'refund'
                            ? 'bg-blue-500/20'
                            : 'bg-red-500/20'
                      }`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-400">
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0
                          ? 'text-green-400'
                          : 'text-red-400'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              Top Up Your Wallet
            </h2>

            {/* Amount Selection */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Select Amount</p>
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
                        ? 'bg-primary text-white'
                        : 'bg-[#1e3a5f] text-gray-300 hover:bg-[#2d4a6f]'
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
                  className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  VND
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Payment Method</p>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('vnpay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedMethod === 'vnpay'
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-[#1e3a5f]/30 border-[#2d4a6f] hover:border-primary/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">VNPay</p>
                    <p className="text-xs text-gray-400">
                      Credit/Debit Card, Bank Transfer
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('payos')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedMethod === 'payos'
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-[#1e3a5f]/30 border-[#2d4a6f] hover:border-primary/30'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">PayOS</p>
                    <p className="text-xs text-gray-400">
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
                className="flex-1 py-3 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!selectedMethod || (!selectedAmount && !customAmount)}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
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
