import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';
import type { CreatePostRequest } from '../types';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
    },
  });
}
