import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/network.api';
import { networkKeys } from './useNetworkPosts';
import type { ReactionType, ProfessionalPost, PagedResult } from '../types';

interface ToggleReactionVars {
  postId: string;
  type: ReactionType;
  currentReaction?: ReactionType;
}

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: ToggleReactionVars) =>
      postsApi.toggleReaction(postId, { type }),

    onMutate: async ({ postId, type, currentReaction }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: networkKeys.all });

      // Snapshot all feed queries for rollback
      const previousQueries = queryClient.getQueriesData<
        PagedResult<ProfessionalPost>
      >({
        queryKey: networkKeys.all,
      });

      // Optimistically update all feed queries that contain this post
      queryClient.setQueriesData<PagedResult<ProfessionalPost>>(
        { queryKey: networkKeys.all },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((post) => {
              if (post.id !== postId) return post;

              const isRemoving = currentReaction === type;
              return {
                ...post,
                currentUserReaction: isRemoving ? undefined : type,
                reactionCount: isRemoving
                  ? post.reactionCount - 1
                  : currentReaction
                    ? post.reactionCount // changing reaction type, count stays same
                    : post.reactionCount + 1,
              };
            }),
          };
        }
      );

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      // Rollback to snapshots
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
