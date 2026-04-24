import { api } from '@/lib/api';
import type { OrderDto } from '@/features/patient/types/financial.types';

export interface PaginatedOrdersResponse {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const getAllOrders = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedOrdersResponse> => {
  const { data } = await api.get<PaginatedOrdersResponse>('/financial/orders', {
    params: { pageNumber: page, pageSize },
  });
  return data;
};
export const completeOrder = async (orderId: string): Promise<void> => {
  await api.post(`/financial/orders/${orderId}/complete`);
};
