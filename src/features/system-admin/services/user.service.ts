/**
 * System Admin User & Role Service
 * Handles API calls for user management
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  User,
  UserStats,
  PaginatedResponse,
} from '../types/system-admin.types';

export const userService = {
  /**
   * Fetch all users with pagination
   */
  async getUsers(page = 1, pageSize = 10) {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.LIST,
        { params: { page, pageSize } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Fetch user details
   */
  async getUserDetail(id: string) {
    try {
      const response = await api.get<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.DETAIL(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      throw error;
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(
    id: string,
    role:
      | 'system_admin'
      | 'organisation_admin'
      | 'doctor'
      | 'operator'
      | 'analyst'
  ) {
    try {
      const response = await api.put<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.UPDATE_ROLE(id),
        { role }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  },

  /**
   * Lock user account
   */
  async lockUser(id: string, reason?: string) {
    try {
      const response = await api.post<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.LOCK(id),
        { reason }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to lock user:', error);
      throw error;
    }
  },

  /**
   * Unlock user account
   */
  async unlockUser(id: string) {
    try {
      const response = await api.post<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.UNLOCK(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to unlock user:', error);
      throw error;
    }
  },

  /**
   * Fetch user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get<ApiResponse<UserStats>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.STATS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  },
};
