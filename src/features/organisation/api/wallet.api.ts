import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
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

/** Backend can return enum as either number or string. */
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

    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      return asNumber as TransactionType;
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

export const organisationWalletApi = {
  async getWallet() {
    const response = await api.get<ApiResponse<WalletDto>>(
      API_ENDPOINTS.ORGANISATION.WALLET.GET
    );
    return unwrapApiData<WalletDto>(response.data);
  },

  async getTransactions(pageNumber = 1, pageSize = 20) {
    const response = await api.get<
      ApiResponse<PagedResult<WalletTransactionDto>>
    >(API_ENDPOINTS.ORGANISATION.WALLET.TRANSACTIONS, {
      params: { pageNumber, pageSize },
    });
    return unwrapApiData<PagedResult<WalletTransactionDto>>(response.data);
  },
};
