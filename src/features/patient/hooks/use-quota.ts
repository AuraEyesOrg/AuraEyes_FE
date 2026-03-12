/**
 * AI Quota TanStack Query hooks
 * Provides quota balance fetching and buy mutation with auto cache invalidation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotaApi } from '../api/quota.api';
import { walletKeys } from './use-wallet';
import type { BuyQuotaRequest } from '../types/quota.types';

// ============ QUERY KEYS ============

export const quotaKeys = {
  all: ['quotaBalance'] as const,
  balance: () => [...quotaKeys.all, 'balance'] as const,
};

// ============ QUERIES ============

/** Fetch current user's AI quota balance */
export const useQuotaBalance = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: quotaKeys.balance(),
    queryFn: () => quotaApi.getBalance(),
    staleTime: 30_000, // 30s - quota can change after buy or screening
    refetchOnWindowFocus: true,
    ...options,
  });
};

// ============ MUTATIONS ============

/** Buy AI quota bundles - deducts from wallet, invalidates quota + wallet cache */
export const useBuyQuota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BuyQuotaRequest) => quotaApi.buy(data),
    onSuccess: () => {
      // Invalidate quota balance to reflect new quota
      queryClient.invalidateQueries({ queryKey: quotaKeys.all });
      // Invalidate wallet to reflect new balance
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
