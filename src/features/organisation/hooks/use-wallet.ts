import { useQuery } from '@tanstack/react-query';
import { organisationWalletApi } from '../api/wallet.api';

export const organisationWalletKeys = {
  all: ['organisation-wallet'] as const,
  detail: () => [...organisationWalletKeys.all, 'detail'] as const,
  transactions: (pageNumber: number, pageSize: number) =>
    [
      ...organisationWalletKeys.all,
      'transactions',
      { pageNumber, pageSize },
    ] as const,
};

export const useOrganisationWallet = () => {
  return useQuery({
    queryKey: organisationWalletKeys.detail(),
    queryFn: organisationWalletApi.getWallet,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useOrganisationWalletTransactions = (
  pageNumber = 1,
  pageSize = 20
) => {
  return useQuery({
    queryKey: organisationWalletKeys.transactions(pageNumber, pageSize),
    queryFn: () => organisationWalletApi.getTransactions(pageNumber, pageSize),
    staleTime: 30_000,
  });
};
