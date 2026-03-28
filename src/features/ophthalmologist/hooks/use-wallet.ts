import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ophthalmologistWalletApi } from '../api/wallet.api';
import type { CreateWithdrawalRequestInput } from '../api/wallet.api';

export const ophthalmologistWalletKeys = {
  all: ['ophthalmologist-wallet'] as const,
  detail: () => [...ophthalmologistWalletKeys.all, 'detail'] as const,
  transactions: (pageNumber: number, pageSize: number) =>
    [
      ...ophthalmologistWalletKeys.all,
      'transactions',
      { pageNumber, pageSize },
    ] as const,
  withdrawalRequests: (pageNumber = 1, pageSize = 20) =>
    [
      ...ophthalmologistWalletKeys.all,
      'withdraw-requests',
      { pageNumber, pageSize },
    ] as const,
};

export const useOphthalmologistWallet = () => {
  return useQuery({
    queryKey: ophthalmologistWalletKeys.detail(),
    queryFn: ophthalmologistWalletApi.getWallet,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useOphthalmologistWalletTransactions = (
  pageNumber = 1,
  pageSize = 20
) => {
  return useQuery({
    queryKey: ophthalmologistWalletKeys.transactions(pageNumber, pageSize),
    queryFn: () =>
      ophthalmologistWalletApi.getTransactions(pageNumber, pageSize),
    staleTime: 30_000,
  });
};

export const useOphthalmologistWithdrawalRequests = (
  pageNumber = 1,
  pageSize = 20
) => {
  return useQuery({
    queryKey: ophthalmologistWalletKeys.withdrawalRequests(
      pageNumber,
      pageSize
    ),
    queryFn: () =>
      ophthalmologistWalletApi.getWithdrawalRequests(pageNumber, pageSize),
  });
};

export const useCreateOphthalmologistWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWithdrawalRequestInput) =>
      ophthalmologistWalletApi.createWithdrawalRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ophthalmologistWalletKeys.all,
      });
    },
  });
};
