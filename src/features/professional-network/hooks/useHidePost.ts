import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';

interface HidePostVars {
  postId: string;
  hideReason?: string;
}

export function useHidePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, hideReason }: HidePostVars) =>
      postsApi.hidePost(postId, hideReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
    },
  });
}
