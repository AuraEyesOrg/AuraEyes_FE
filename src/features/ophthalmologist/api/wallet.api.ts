import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export enum TransactionType {
  Deposit = 1,
  Withdrawal = 2,
  Payment = 3,
  Refund = 4,
  Transfer = 5,
  Bonus = 6,
}

/** Backend uses JsonStringEnumConverter — API may return numeric or string names. */
export function parseWalletTransactionType(
  raw: TransactionType | string | undefined | null
): TransactionType {
  if (raw === undefined || raw === null) {
    return TransactionType.Payment;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw as TransactionType;
  }
  if (typeof raw === 'string') {
    const byName = TransactionType[raw as keyof typeof TransactionType];
    if (typeof byName === 'number') {
      return byName;
    }
    const asNum = Number(raw);
    if (Number.isFinite(asNum)) {
      return asNum as TransactionType;
    }
  }
  return TransactionType.Payment;
}

export interface WalletDto {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string | null;
  totalDepositsThisMonth: number;
  totalSpentThisMonth: number;
  transactionsThisMonth: number;
}

export interface WalletTransactionDto {
  id: string;
  walletId: string;
  amount: number;
  transactionType: TransactionType | string;
  description: string | null;
  createdAt: string;
  referenceId?: string | null;
  referenceType?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type WithdrawalRequestStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

export interface WithdrawalRequestDto {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  status: WithdrawalRequestStatus;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  contractNumber?: string | null;
  note?: string | null;
  adminNote?: string | null;
  transferReference?: string | null;
  processedByAdminId?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface CreateWithdrawalRequestInput {
  amountVnd: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  contractNumber?: string;
  note?: string;
}

const EP = {
  WALLET: '/wallets',
  TRANSACTIONS: '/wallets/transactions',
  WITHDRAW_REQUESTS: '/wallets/withdraw-requests',
} as const;

export const ophthalmologistWalletApi = {
  async getWallet() {
    const response = await api.get<ApiResponse<WalletDto>>(EP.WALLET);
    return unwrapApiData<WalletDto>(response.data);
  },

  async getTransactions(pageNumber = 1, pageSize = 20) {
    const response = await api.get<
      ApiResponse<PagedResult<WalletTransactionDto>>
    >(EP.TRANSACTIONS, { params: { pageNumber, pageSize } });
    return unwrapApiData<PagedResult<WalletTransactionDto>>(response.data);
  },

  async getWithdrawalRequests(pageNumber = 1, pageSize = 20) {
    const response = await api.get<
      ApiResponse<PagedResult<WithdrawalRequestDto>>
    >(EP.WITHDRAW_REQUESTS, { params: { pageNumber, pageSize } });
    return unwrapApiData<PagedResult<WithdrawalRequestDto>>(response.data);
  },

  async createWithdrawalRequest(input: CreateWithdrawalRequestInput) {
    const response = await api.post<ApiResponse<WithdrawalRequestDto>>(
      EP.WITHDRAW_REQUESTS,
      input
    );
    return unwrapApiData<WithdrawalRequestDto>(response.data);
  },
};
