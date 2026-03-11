import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';
import type { ProfessionalPost, PagedResult } from '../types';

export function useToggleSavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.toggleSavePost(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: networkKeys.all });

      const previousQueries = queryClient.getQueriesData<
        PagedResult<ProfessionalPost>
      >({
        queryKey: networkKeys.all,
      });

      queryClient.setQueriesData<PagedResult<ProfessionalPost>>(
        { queryKey: networkKeys.all },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((post) =>
              post.id === postId
                ? { ...post, isBookmarked: !post.isBookmarked }
                : post
            ),
          };
        }
      );

      return { previousQueries };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
    },
  });
}
