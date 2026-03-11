import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';

export const networkKeys = {
  all: ['network'] as const,
  feed: (page: number, pageSize: number) =>
    [...networkKeys.all, 'feed', { page, pageSize }] as const,
  post: (id: string) => [...networkKeys.all, 'post', id] as const,
  trending: () => [...networkKeys.all, 'trending'] as const,
};

export function useFeedPosts(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: networkKeys.feed(page, pageSize),
    queryFn: () => postsApi.getFeed(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePostDetail(id: string) {
  return useQuery({
    queryKey: networkKeys.post(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
  });
}
