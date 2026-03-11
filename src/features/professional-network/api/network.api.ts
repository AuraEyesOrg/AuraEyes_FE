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
  ProfessionalGroup,
  ProfessionalConnection,
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
    GET: (id: string) => `/network/posts/${id}`,
    UPDATE: (id: string) => `/network/posts/${id}`,
    DELETE: (id: string) => `/network/posts/${id}`,
    REACTIONS: (id: string) => `/network/posts/${id}/reactions`,
    COMMENTS: (id: string) => `/network/posts/${id}/comments`,
    SAVE: (id: string) => `/network/posts/${id}/save`,
    REPOST: (id: string) => `/network/posts/${id}/repost`,
  },

  // Professionals (Ophthalmologists)
  PROFESSIONALS: {
    LIST: '/network/professionals',
    SEARCH: '/network/professionals/search',
    GET: (id: string) => `/network/professionals/${id}`,
    POSTS: (id: string) => `/network/professionals/${id}/posts`,
    CONNECTIONS: (id: string) => `/network/professionals/${id}/connections`,
  },

  // Organisations
  ORGANISATIONS: {
    LIST: '/network/organisations',
    SEARCH: '/network/organisations/search',
    GET: (id: string) => `/network/organisations/${id}`,
    POSTS: (id: string) => `/network/organisations/${id}/posts`,
    MEMBERS: (id: string) => `/network/organisations/${id}/members`,
    FOLLOW: (id: string) => `/network/organisations/${id}/follow`,
  },

  // Connections
  CONNECTIONS: {
    LIST: '/network/connections',
    PENDING: '/network/connections/pending',
    SUGGESTIONS: '/network/connections/suggestions',
    REQUEST: '/network/connections/request',
    ACCEPT: (id: string) => `/network/connections/${id}/accept`,
    DECLINE: (id: string) => `/network/connections/${id}/decline`,
    REMOVE: (id: string) => `/network/connections/${id}`,
  },

  // Groups
  GROUPS: {
    LIST: '/network/groups',
    MY_GROUPS: '/network/groups/my',
    DISCOVER: '/network/groups/discover',
    CREATE: '/network/groups',
    GET: (id: string) => `/network/groups/${id}`,
    JOIN: (id: string) => `/network/groups/${id}/join`,
    LEAVE: (id: string) => `/network/groups/${id}/leave`,
    POSTS: (id: string) => `/network/groups/${id}/posts`,
    MEMBERS: (id: string) => `/network/groups/${id}/members`,
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
  async getFeed(pageNumber = 1, pageSize = 10, authorId?: string) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalPost>>>(
      NETWORK_ENDPOINTS.POSTS.FEED,
      { params: { pageNumber, pageSize, ...(authorId ? { authorId } : {}) } }
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

// ============ CONNECTIONS API ============

export const connectionsApi = {
  /**
   * Get user connections
   */
  async getConnections(page = 1, pageSize = 10) {
    const response = await api.get<
      ApiResponse<PagedResult<ProfessionalConnection>>
    >(NETWORK_ENDPOINTS.CONNECTIONS.LIST, { params: { page, pageSize } });
    return response.data.data;
  },

  /**
   * Get pending connection requests
   */
  async getPendingRequests() {
    const response = await api.get<ApiResponse<ProfessionalConnection[]>>(
      NETWORK_ENDPOINTS.CONNECTIONS.PENDING
    );
    return response.data.data;
  },

  /**
   * Get connection suggestions
   */
  async getSuggestions() {
    const response = await api.get<ApiResponse<Ophthalmologist[]>>(
      NETWORK_ENDPOINTS.CONNECTIONS.SUGGESTIONS
    );
    return response.data.data;
  },

  /**
   * Send connection request
   */
  async sendRequest(userId: string, message?: string) {
    const response = await api.post<ApiResponse<ProfessionalConnection>>(
      NETWORK_ENDPOINTS.CONNECTIONS.REQUEST,
      { userId, message }
    );
    return response.data.data;
  },

  /**
   * Accept connection request
   */
  async acceptRequest(connectionId: string) {
    const response = await api.post<ApiResponse<ProfessionalConnection>>(
      NETWORK_ENDPOINTS.CONNECTIONS.ACCEPT(connectionId)
    );
    return response.data.data;
  },

  /**
   * Decline connection request
   */
  async declineRequest(connectionId: string) {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      NETWORK_ENDPOINTS.CONNECTIONS.DECLINE(connectionId)
    );
    return response.data.data;
  },
};

// ============ GROUPS API ============

export const groupsApi = {
  /**
   * Get my groups
   */
  async getMyGroups() {
    const response = await api.get<ApiResponse<ProfessionalGroup[]>>(
      NETWORK_ENDPOINTS.GROUPS.MY_GROUPS
    );
    return response.data.data;
  },

  /**
   * Discover groups
   */
  async discoverGroups(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PagedResult<ProfessionalGroup>>>(
      NETWORK_ENDPOINTS.GROUPS.DISCOVER,
      { params: { page, pageSize } }
    );
    return response.data.data;
  },

  /**
   * Get group details
   */
  async getGroup(id: string) {
    const response = await api.get<ApiResponse<ProfessionalGroup>>(
      NETWORK_ENDPOINTS.GROUPS.GET(id)
    );
    return response.data.data;
  },

  /**
   * Join group
   */
  async joinGroup(id: string) {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      NETWORK_ENDPOINTS.GROUPS.JOIN(id)
    );
    return response.data.data;
  },

  /**
   * Leave group
   */
  async leaveGroup(id: string) {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      NETWORK_ENDPOINTS.GROUPS.LEAVE(id)
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
