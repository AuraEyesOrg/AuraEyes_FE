import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  QuotaBalance,
  BuyQuotaRequest,
  BuyQuotaResponse,
} from '../types/quota.types';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const quotaApi = {
  /** GET /api/quotas/balance - Get current user's AI quota balance */
  async getBalance(): Promise<QuotaBalance> {
    const response = await api.get<BackendApiResponse<QuotaBalance>>(
      API_ENDPOINTS.QUOTAS.BALANCE
    );
    return response.data.data;
  },

  /** POST /api/quotas/buy - Buy AI quota bundles using wallet balance */
  async buy(data: BuyQuotaRequest): Promise<BuyQuotaResponse> {
    const response = await api.post<BackendApiResponse<BuyQuotaResponse>>(
      API_ENDPOINTS.QUOTAS.BUY,
      data
    );
    return response.data.data;
  },
};
