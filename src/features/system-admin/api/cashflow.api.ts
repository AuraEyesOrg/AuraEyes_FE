import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export type CashflowActorRole =
  | 'Patient'
  | 'Ophthalmologist'
  | 'Organisation'
  | 'System';

export type CashflowStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled';

export interface CashflowTransactionItem {
  id: string;
  actorName: string;
  actorEmail?: string | null;
  actorRole: CashflowActorRole;
  amount: number;
  transactionType: string;
  referenceType?: string | null;
  referenceId?: string | null;
  bookingCode?: string | null;
  status: CashflowStatus;
  description?: string | null;
  createdAt: string;
}

export interface CashflowTransactionsParams {
  pageNumber?: number;
  pageSize?: number;
  actorRole?: CashflowActorRole;
  status?: CashflowStatus;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
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

export const cashflowApi = {
  async getTransactions(params: CashflowTransactionsParams = {}) {
    const response = await api.get<
      ApiResponse<PagedResult<CashflowTransactionItem>>
    >(API_ENDPOINTS.SYSTEM_ADMIN.CASHFLOW.TRANSACTIONS, {
      params,
    });

    return unwrapApiData<PagedResult<CashflowTransactionItem>>(response.data);
  },
};
