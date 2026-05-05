import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';

interface RepostVars {
  postId: string;
  authorType: string;
  repostComment?: string;
}

export function useRepostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, authorType, repostComment }: RepostVars) =>
      postsApi.repostPost(postId, { authorType, repostComment }),
    onSuccess: () => {
      // Invalidate entire network cache — feed will include the new repost
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
    },
  });
}
