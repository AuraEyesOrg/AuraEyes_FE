/**
 * Professional Network API
 * Handles all API calls for the professional network feature
 */

import { api } from '@/lib/api';
import type {
  ApiResponse,
  PagedResult,
  ProfessionalPost,
  Ophthalmologist,
  Organisation,
  PostComment,
  SavedCollection,
  SavedPost,
  TrendingTopic,
  ToggleReactionRequest,
  UserProfileDto,
} from '../types';

// ============ API ENDPOINTS ============

export const NETWORK_ENDPOINTS = {
  // Feed & Posts
  POSTS: {
    FEED: '/network/feed',
    CREATE: '/network/posts',
    SHARE_CONSULTATION: '/network/posts/share-consultation',
    GET: (id: string) => `/network/posts/${id}`,
    UPDATE: (id: string) => `/network/posts/${id}`,
    DELETE: (id: string) => `/network/posts/${id}`,
    REACTIONS: (id: string) => `/network/posts/${id}/reactions`,
    COMMENTS: (id: string) => `/network/posts/${id}/comments`,
    SAVE: (id: string) => `/network/posts/${id}/save`,
    REPOST: (id: string) => `/network/posts/${id}/repost`,
    HIDE: (id: string) => `/network/posts/${id}/hide`,
  },

  // Professionals (Ophthalmologists)
  PROFESSIONALS: {
    LIST: '/network/professionals',
    SEARCH: '/network/professionals/search',
    GET: (id: string) => `/network/professionals/${id}`,
    POSTS: (id: string) => `/network/professionals/${id}/posts`,
  },

  // Organisations
  ORGANISATIONS: {
    LIST: '/network/organisations',
    SEARCH: '/network/organisations/search',
    GET: (id: string) => `/network/organisations/${id}`,
    POSTS: (id: string) => `/network/organisations/${id}/posts`,
    FOLLOW: (id: string) => `/network/organisations/${id}/follow`,
  },

  // Saved
  SAVED: {
    LIST: '/network/saved-posts',
    COLLECTIONS: '/network/saved/collections',
    CREATE_COLLECTION: '/network/saved/collections',
  },

  // Trending
  TRENDING: '/network/trending',

  // Profile
  PROFILE: (userId: string) => `/network/profile/${userId}`,
};

// ============ POSTS API ============

export const postsApi = {
  /**
   * Discover posts filtered by authorType, category, searchTerm
   */
  async getDiscover(
    authorType?: string,
    category?: string,
    searchTerm?: string,
    pageNumber = 1,
    pageSize = 20
  ) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalPost>>>(
      '/network/discover',
      {
        params: {
          ...(authorType && { authorType }),
          ...(category && { category }),
          ...(searchTerm && { searchTerm }),
          pageNumber,
          pageSize,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get feed posts with pagination and optional authorId filter
   */
  async getFeed(
    pageNumber = 1,
    pageSize = 10,
    authorId?: string,
    hiddenOnly = false,
    reportedOnly = false
  ) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalPost>>>(
      NETWORK_ENDPOINTS.POSTS.FEED,
      {
        params: {
          pageNumber,
          pageSize,
          ...(authorId ? { authorId } : {}),
          ...(hiddenOnly ? { hiddenOnly: true } : {}),
          ...(reportedOnly ? { reportedOnly: true } : {}),
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get single post by ID
   */
  async getPost(id: string) {
    const response = await api.get<ApiResponse<ProfessionalPost>>(
      NETWORK_ENDPOINTS.POSTS.GET(id)
    );
    return response.data.data;
  },

  /**
   * Create new post with multipart/form-data
   */
  async createPost(data: FormData) {
    const response = await api.post<ApiResponse<string>>(
      NETWORK_ENDPOINTS.POSTS.CREATE,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * One-click share of an internal consultation case.
   */
  async shareConsultationCase(consultationSessionId: string) {
    const response = await api.post<ApiResponse<string>>(
      NETWORK_ENDPOINTS.POSTS.SHARE_CONSULTATION,
      { consultationSessionId }
    );
    return response.data.data;
  },

  /**
   * Toggle reaction on a post
   */
  async toggleReaction(postId: string, data: ToggleReactionRequest) {
    const response = await api.post<ApiResponse<object>>(
      NETWORK_ENDPOINTS.POSTS.REACTIONS(postId),
      data
    );
    return response.data.data;
  },

  /**
   * Toggle save/unsave a post
   */
  async toggleSavePost(postId: string) {
    const response = await api.post<ApiResponse<object>>(
      NETWORK_ENDPOINTS.POSTS.SAVE(postId)
    );
    return response.data.data;
  },

  /**
   * Repost (share/quote) an existing post.
   * authorType: the current user's author type (Ophthalmologist | Organisation)
   */
  async repostPost(
    postId: string,
    data: { authorType: string; repostComment?: string }
  ) {
    const response = await api.post<ApiResponse<string>>(
      NETWORK_ENDPOINTS.POSTS.REPOST(postId),
      data
    );
    return response.data.data;
  },

  /**
   * Hide a post by moderation (SystemAdmin only)
   */
  async hidePost(postId: string, hideReason?: string) {
    const response = await api.post<ApiResponse<object>>(
      NETWORK_ENDPOINTS.POSTS.HIDE(postId),
      { hideReason }
    );
    return response.data.data;
  },

  /**
   * Get post comments
   */
  async getComments(
    postId: string,
    page = 1,
    pageSize = 10,
    parentCommentId?: string
  ) {
    const response = await api.get<ApiResponse<PagedResult<PostComment>>>(
      NETWORK_ENDPOINTS.POSTS.COMMENTS(postId),
      {
        params: {
          pageNumber: page,
          pageSize,
          ...(parentCommentId && { parentCommentId }),
        },
      }
    );
    return response.data.data;
  },

  /**
   * Add comment to post
   */
  async addComment(postId: string, content: string, parentCommentId?: string) {
    const response = await api.post<ApiResponse<string>>(
      NETWORK_ENDPOINTS.POSTS.COMMENTS(postId),
      { content, parentCommentId }
    );
    return response.data.data;
  },
};

// ============ PROFESSIONALS API ============

export const professionalsApi = {
  /**
   * Get list of professionals with pagination
   */
  async getList(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<Ophthalmologist>>>(
      NETWORK_ENDPOINTS.PROFESSIONALS.LIST,
      { params: { pageNumber: page, pageSize } }
    );
    return response.data.data;
  },

  /**
   * Search professionals (reuses list endpoint with searchTerm)
   */
  async search(query: string, _specialty?: string) {
    const response = await api.get<ApiResponse<PagedResult<Ophthalmologist>>>(
      NETWORK_ENDPOINTS.PROFESSIONALS.LIST,
      { params: { searchTerm: query, pageNumber: 1, pageSize: 20 } }
    );
    return response.data.data?.items ?? [];
  },

  /**
   * Get professional profile
   */
  async getProfile(id: string) {
    const response = await api.get<ApiResponse<Ophthalmologist>>(
      NETWORK_ENDPOINTS.PROFESSIONALS.GET(id)
    );
    return response.data.data;
  },

  /**
   * Get professional's posts
   */
  async getPosts(id: string, page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalPost>>>(
      NETWORK_ENDPOINTS.PROFESSIONALS.POSTS(id),
      {
        params: { page, pageSize },
      }
    );
    return response.data.data;
  },
};

// ============ ORGANISATIONS API ============

export const organisationsApi = {
  /**
   * Get list of organisations
   */
  async getList(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<Organisation>>>(
      NETWORK_ENDPOINTS.ORGANISATIONS.LIST,
      { params: { pageNumber: page, pageSize } }
    );
    return response.data.data;
  },

  /**
   * Get organisation details
   */
  async getOrganisation(id: string) {
    const response = await api.get<ApiResponse<Organisation>>(
      NETWORK_ENDPOINTS.ORGANISATIONS.GET(id)
    );
    return response.data.data;
  },

  /**
   * Follow/unfollow organisation
   */
  async toggleFollow(id: string) {
    const response = await api.post<ApiResponse<{ isFollowing: boolean }>>(
      NETWORK_ENDPOINTS.ORGANISATIONS.FOLLOW(id)
    );
    return response.data.data;
  },
};

// ============ SAVED API ============

export const savedApi = {
  /**
   * Get saved posts
   */
  async getSavedPosts(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<SavedPost>>>(
      NETWORK_ENDPOINTS.SAVED.LIST,
      { params: { page, pageSize } }
    );
    return response.data.data;
  },

  /**
   * Get collections
   */
  async getCollections() {
    const response = await api.get<ApiResponse<SavedCollection[]>>(
      NETWORK_ENDPOINTS.SAVED.COLLECTIONS
    );
    return response.data.data;
  },
};

// ============ TRENDING API ============

export const trendingApi = {
  /**
   * Get trending topics
   */
  async getTrending() {
    const response = await api.get<ApiResponse<TrendingTopic[]>>(
      NETWORK_ENDPOINTS.TRENDING
    );
    return response.data.data;
  },
};

// ============ PROFILE API ============

export const profileApi = {
  /**
   * Get user public profile by userId
   * Maps to BE GET /api/network/profile/{userId}
   */
  async getProfile(userId: string) {
    const response = await api.get<ApiResponse<UserProfileDto>>(
      NETWORK_ENDPOINTS.PROFILE(userId)
    );
    return response.data.data;
  },

  /**
   * Get posts by a specific author (reuses network/feed with authorId filter)
   */
  async getPostsByAuthor(authorId: string, pageNumber = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalPost>>>(
      NETWORK_ENDPOINTS.POSTS.FEED,
      { params: { pageNumber, pageSize, authorId } }
    );
    return response.data.data;
  },
};
