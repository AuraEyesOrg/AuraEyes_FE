/**
 * TanStack Query hooks for the Financial (Order/Payment) system.
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMyOrders, getOrderById } from '../api/financial.api';

export const financialKeys = {
  all: ['financial'] as const,
  myOrders: (pageNumber: number, pageSize: number) =>
    [...financialKeys.all, 'my-orders', { pageNumber, pageSize }] as const,
  order: (id: string) => [...financialKeys.all, 'order', id] as const,
};

/**
 * Fetches paginated payment order history for the current user.
 * Used in the "Ví / Payment History" page.
 */
export const useMyOrders = (pageNumber = 1, pageSize = 20) =>
  useQuery({
    queryKey: financialKeys.myOrders(pageNumber, pageSize),
    queryFn: () => getMyOrders(pageNumber, pageSize),
    placeholderData: keepPreviousData,
  });

/**
 * Fetches a single order (with its payments) by ID.
 */
export const useOrder = (id: string, enabled = true) =>
  useQuery({
    queryKey: financialKeys.order(id),
    queryFn: () => getOrderById(id),
    enabled: !!id && enabled,
    staleTime: 30_000,
  });
