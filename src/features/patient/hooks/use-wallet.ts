/**
 * Wallet TanStack Query hooks
 * Provides real-time wallet data fetching and mutation hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/patient.api';
import type {
  CreateDepositRequest,
  VerifyPaymentRequest,
} from '../types';

// ============ QUERY KEYS ============

export const walletKeys = {
  all: ['wallet'] as const,
  detail: () => [...walletKeys.all, 'detail'] as const,
  transactions: (pageNumber?: number, pageSize?: number) =>
    [...walletKeys.all, 'transactions', { pageNumber, pageSize }] as const,
  deposits: (pageNumber?: number, pageSize?: number) =>
    [...walletKeys.all, 'deposits', { pageNumber, pageSize }] as const,
  paymentStatus: (orderCode: string) =>
    [...walletKeys.all, 'payment-status', orderCode] as const,
};

// ============ QUERIES ============

/** Fetch current user's wallet (balance, etc.) */
export const useWallet = () => {
  return useQuery({
    queryKey: walletKeys.detail(),
    queryFn: () => walletApi.getWallet(),
    staleTime: 30_000, // 30s - balance can change frequently
    refetchOnWindowFocus: true,
  });
};

/** Fetch paginated wallet transaction history */
export const useWalletTransactions = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: walletKeys.transactions(pageNumber, pageSize),
    queryFn: () => walletApi.getTransactions(pageNumber, pageSize),
    staleTime: 30_000,
  });
};

/** Fetch paginated deposit history */
export const useDepositHistory = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: walletKeys.deposits(pageNumber, pageSize),
    queryFn: () => walletApi.getDeposits(pageNumber, pageSize),
    staleTime: 30_000,
  });
};

/** Check payment status by order code (used on callback page) */
export const usePaymentStatus = (orderCode: string, enabled = true) => {
  return useQuery({
    queryKey: walletKeys.paymentStatus(orderCode),
    queryFn: () => walletApi.getPaymentStatus(orderCode),
    enabled: !!orderCode && enabled,
    refetchInterval: (query) => {
      // Stop polling once payment is resolved
      const status = query.state.data?.status;
      if (status === 'Completed' || status === 'Failed' || status === 'Cancelled') {
        return false;
      }
      return 3000; // Poll every 3s while pending
    },
  });
};

// ============ MUTATIONS ============

/** Create a deposit request and get PayOS payment URL */
export const useCreateDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepositRequest) => walletApi.createDeposit(data),
    onSuccess: () => {
      // Invalidate deposits list after creating new one
      queryClient.invalidateQueries({ queryKey: walletKeys.deposits() });
    },
  });
};

/** Verify payment after returning from PayOS */
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentRequest) => walletApi.verifyPayment(data),
    onSuccess: (response) => {
      if (response.isSuccess && response.newBalance !== null) {
        // Optimistically update the wallet balance
        queryClient.setQueryData(walletKeys.detail(), (old: unknown) => {
          if (old && typeof old === 'object' && 'balance' in old) {
            return { ...old, balance: response.newBalance };
          }
          return old;
        });
      }
      // Invalidate all wallet data
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
