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

export const getOrderById = async (orderId: string): Promise<OrderDto> => {
  const { data } = await api.get<any>(`/financial/orders/${orderId}`);
  return data.data;
};

export interface CompleteOrderResponse {
  orderId: string;
  paymentId: string;
  paymentStatus: string;
  paymentUrl?: string;
  paymentOrderCode?: string;
}

export const completeOrder = async (
  orderId: string,
  method: 'Cash' | 'PayOS' = 'Cash'
): Promise<CompleteOrderResponse> => {
  const { data } = await api.post<any>(
    `/financial/orders/${orderId}/complete?method=${method}`
  );
  return data.data;
};
