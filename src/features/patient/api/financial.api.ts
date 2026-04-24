/**
 * Financial API
 * Calls the backend Order & Payment endpoints to display payment history.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { UserOrdersResult, OrderDto } from '../types/financial.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
  isSuccess?: boolean;
}

/**
 * Fetches the current user's paginated order history (payment deposits).
 */
export const getMyOrders = async (
  pageNumber = 1,
  pageSize = 20
): Promise<UserOrdersResult> => {
  const response = await api.get<UserOrdersResult>(
    API_ENDPOINTS.FINANCIAL.MY_ORDERS,
    { params: { pageNumber, pageSize } }
  );

  return (
    response.data ?? {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    }
  );
};

/**
 * Fetches a single order with its payments by ID.
 */
export const getOrderById = async (id: string): Promise<OrderDto | null> => {
  try {
    const response = await api.get<OrderDto>(API_ENDPOINTS.FINANCIAL.ORDER(id));
    return response.data ?? null;
  } catch {
    return null;
  }
};
