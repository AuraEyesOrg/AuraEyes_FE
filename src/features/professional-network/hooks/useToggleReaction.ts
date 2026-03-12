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

      // Snapshot single-post cache for rollback
      const previousPost = queryClient.getQueryData<ProfessionalPost>(
        networkKeys.post(postId)
      );

      // Helper to compute updated reaction fields
      const applyReaction = (post: ProfessionalPost) => {
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
      };

      // Optimistically update all feed/list queries that contain this post
      queryClient.setQueriesData<PagedResult<ProfessionalPost>>(
        { queryKey: networkKeys.all },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((post) =>
              post.id !== postId ? post : applyReaction(post)
            ),
          };
        }
      );

      // Optimistically update the single-post detail cache
      queryClient.setQueryData<ProfessionalPost>(
        networkKeys.post(postId),
        (old) => (old ? applyReaction(old) : old)
      );

      return { previousQueries, previousPost };
    },

    onError: (_err, { postId }, context) => {
      // Rollback feed/list snapshots
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      // Rollback single-post snapshot
      if (context?.previousPost !== undefined) {
        queryClient.setQueryData(
          networkKeys.post(postId),
          context.previousPost
        );
      }
    },

    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
      queryClient.invalidateQueries({ queryKey: networkKeys.post(postId) });
    },
  });
}
