import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
    },
  });
}
