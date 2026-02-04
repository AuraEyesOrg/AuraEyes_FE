/**
 * Professional Network API
 * Handles all API calls for the professional network feature
 */

import { api } from '@/lib/api';
import type {
  ApiResponse,
  PaginatedResponse,
  ProfessionalPost,
  Ophthalmologist,
  Organisation,
  ProfessionalGroup,
  ProfessionalConnection,
  PostComment,
  SavedCollection,
  SavedPost,
} from '../types';

// ============ API ENDPOINTS ============

export const NETWORK_ENDPOINTS = {
  // Feed & Posts
  POSTS: {
    LIST: '/network/posts',
    CREATE: '/network/posts',
    GET: (id: string) => `/network/posts/${id}`,
    UPDATE: (id: string) => `/network/posts/${id}`,
    DELETE: (id: string) => `/network/posts/${id}`,
    REACT: (id: string) => `/network/posts/${id}/react`,
    COMMENTS: (id: string) => `/network/posts/${id}/comments`,
    SHARE: (id: string) => `/network/posts/${id}/share`,
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
    POSTS: '/network/saved/posts',
    COLLECTIONS: '/network/saved/collections',
    CREATE_COLLECTION: '/network/saved/collections',
    SAVE_POST: (postId: string) => `/network/posts/${postId}/save`,
    UNSAVE_POST: (postId: string) => `/network/posts/${postId}/unsave`,
  },
};

// ============ POSTS API ============

export const postsApi = {
  /**
   * Get feed posts with pagination
   */
  async getFeed(page = 1, pageSize = 10) {
    const response = await api.get<
      ApiResponse<PaginatedResponse<ProfessionalPost>>
    >(NETWORK_ENDPOINTS.POSTS.LIST, { params: { page, pageSize } });
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
   * Create new post
   */
  async createPost(data: Partial<ProfessionalPost>) {
    const response = await api.post<ApiResponse<ProfessionalPost>>(
      NETWORK_ENDPOINTS.POSTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * React to a post
   */
  async reactToPost(postId: string, reactionType: string) {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      NETWORK_ENDPOINTS.POSTS.REACT(postId),
      { type: reactionType }
    );
    return response.data.data;
  },

  /**
   * Get post comments
   */
  async getComments(postId: string) {
    const response = await api.get<ApiResponse<PostComment[]>>(
      NETWORK_ENDPOINTS.POSTS.COMMENTS(postId)
    );
    return response.data.data;
  },

  /**
   * Add comment to post
   */
  async addComment(postId: string, content: string, parentCommentId?: string) {
    const response = await api.post<ApiResponse<PostComment>>(
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
    const response = await api.get<
      ApiResponse<PaginatedResponse<Ophthalmologist>>
    >(NETWORK_ENDPOINTS.PROFESSIONALS.LIST, { params: { page, pageSize } });
    return response.data.data;
  },

  /**
   * Search professionals
   */
  async search(query: string, specialty?: string) {
    const response = await api.get<ApiResponse<Ophthalmologist[]>>(
      NETWORK_ENDPOINTS.PROFESSIONALS.SEARCH,
      { params: { query, specialty } }
    );
    return response.data.data;
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
    const response = await api.get<
      ApiResponse<PaginatedResponse<ProfessionalPost>>
    >(NETWORK_ENDPOINTS.PROFESSIONALS.POSTS(id), {
      params: { page, pageSize },
    });
    return response.data.data;
  },
};

// ============ ORGANISATIONS API ============

export const organisationsApi = {
  /**
   * Get list of organisations
   */
  async getList(page = 1, pageSize = 10) {
    const response = await api.get<
      ApiResponse<PaginatedResponse<Organisation>>
    >(NETWORK_ENDPOINTS.ORGANISATIONS.LIST, { params: { page, pageSize } });
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
      ApiResponse<PaginatedResponse<ProfessionalConnection>>
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
    const response = await api.get<
      ApiResponse<PaginatedResponse<ProfessionalGroup>>
    >(NETWORK_ENDPOINTS.GROUPS.DISCOVER, { params: { page, pageSize } });
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
    const response = await api.get<ApiResponse<PaginatedResponse<SavedPost>>>(
      NETWORK_ENDPOINTS.SAVED.POSTS,
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

  /**
   * Save a post
   */
  async savePost(postId: string, collectionId?: string) {
    const response = await api.post<ApiResponse<SavedPost>>(
      NETWORK_ENDPOINTS.SAVED.SAVE_POST(postId),
      { collectionId }
    );
    return response.data.data;
  },

  /**
   * Unsave a post
   */
  async unsavePost(postId: string) {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      NETWORK_ENDPOINTS.SAVED.UNSAVE_POST(postId)
    );
    return response.data.data;
  },
};
