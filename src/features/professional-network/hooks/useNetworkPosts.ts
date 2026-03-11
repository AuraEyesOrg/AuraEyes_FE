import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  postsApi,
  profileApi,
  professionalsApi,
  organisationsApi,
  savedApi,
} from '../api/network.api';

export const networkKeys = {
  all: ['network'] as const,
  feed: (page: number, pageSize: number) =>
    [...networkKeys.all, 'feed', { page, pageSize }] as const,
  post: (id: string) => [...networkKeys.all, 'post', id] as const,
  trending: () => [...networkKeys.all, 'trending'] as const,
  profile: (userId: string) => [...networkKeys.all, 'profile', userId] as const,
  userPosts: (authorId: string, page: number, pageSize: number) =>
    [...networkKeys.all, 'userPosts', authorId, { page, pageSize }] as const,
  professionals: (page: number, pageSize: number) =>
    [...networkKeys.all, 'professionals', { page, pageSize }] as const,
  professionalSearch: (query: string, specialty?: string) =>
    [
      ...networkKeys.all,
      'professionals',
      'search',
      { query, specialty },
    ] as const,
  organisations: (page: number, pageSize: number) =>
    [...networkKeys.all, 'organisations', { page, pageSize }] as const,
  savedPosts: (page: number, pageSize: number) =>
    [...networkKeys.all, 'saved', { page, pageSize }] as const,
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

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: networkKeys.profile(userId),
    queryFn: () => profileApi.getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserPosts(authorId: string, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: networkKeys.userPosts(authorId, page, pageSize),
    queryFn: () => profileApi.getPostsByAuthor(authorId, page, pageSize),
    enabled: !!authorId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useProfessionals(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: networkKeys.professionals(page, pageSize),
    queryFn: () => professionalsApi.getList(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProfessionalSearch(query: string, specialty?: string) {
  return useQuery({
    queryKey: networkKeys.professionalSearch(query, specialty),
    queryFn: () => professionalsApi.search(query, specialty),
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 2,
  });
}

export function useOrganisations(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: networkKeys.organisations(page, pageSize),
    queryFn: () => organisationsApi.getList(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSavedPosts(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: networkKeys.savedPosts(page, pageSize),
    queryFn: () => savedApi.getSavedPosts(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePostComments(postId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [
      ...networkKeys.post(postId),
      'comments',
      { page, pageSize },
    ] as const,
    queryFn: () => postsApi.getComments(postId, page, pageSize),
    enabled: !!postId,
    staleTime: 1000 * 60,
  });
}

export function useCommentReplies(postId: string, parentCommentId: string) {
  return useQuery({
    queryKey: [
      ...networkKeys.post(postId),
      'replies',
      parentCommentId,
    ] as const,
    queryFn: () => postsApi.getComments(postId, 1, 50, parentCommentId),
    enabled: !!postId && !!parentCommentId,
    staleTime: 1000 * 60,
  });
}
