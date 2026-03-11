import { useQuery } from '@tanstack/react-query';
import { trendingApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';

export function useTrendingTopics() {
  return useQuery({
    queryKey: networkKeys.trending(),
    queryFn: () => trendingApi.getTrending(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
