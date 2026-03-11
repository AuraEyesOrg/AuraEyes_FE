import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';

interface AddCommentVars {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: AddCommentVars) =>
      postsApi.addComment(postId, content, parentCommentId),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: [...networkKeys.post(postId), 'comments'],
      });
      queryClient.invalidateQueries({ queryKey: networkKeys.post(postId) });
    },
  });
}
