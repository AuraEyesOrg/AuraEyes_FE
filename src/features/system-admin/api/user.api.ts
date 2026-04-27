/**
 * System Admin User & Role API
 * Handles API calls for user management
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  User,
  UserStats,
  PaginatedResponse,
  UserRole,
} from '../types/system-admin.types';

export const userApi = {
  /**
   * Fetch all users with pagination
   */
  async getUsers(page = 1, pageSize = 10) {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.LIST,
        { params: { pageNumber: page, pageSize } }
      );

      const data = response.data.data;
      if (data && data.items) {
        data.items = data.items.map((u) => {
          const rawRole = (u.roles?.[0] || u.role || '')
            .toLowerCase()
            .replace(/[\s_-]/g, '');
          let normalizedRole: UserRole = 'Patient';

          if (rawRole === 'systemadmin' || rawRole === 'admin')
            normalizedRole = 'SystemAdmin';
          else if (rawRole === 'ophthalmologist' || rawRole === 'doctor')
            normalizedRole = 'Ophthalmologist';
          else if (
            rawRole === 'clinicstaff' ||
            rawRole === 'orgadmin' ||
            rawRole === 'organization'
          )
            normalizedRole = 'ClinicStaff';

          return {
            ...u,
            name: u.fullName || u.name,
            role: normalizedRole,
            lastLogin: u.lastLoginAt || u.lastLogin,
          };
        });
      }

      return data;
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
  async updateUserRole(id: string, role: UserRole) {
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
      const response = await api.patch<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.STATUS(id),
        { action: 'suspend', reason }
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
      const response = await api.patch<ApiResponse<User>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.STATUS(id),
        { action: 'activate' }
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
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.METRICS
      );
      const metrics = response.data.data as any;

      return {
        totalUsers: metrics?.totalUsers ?? 0,
        activeUsers: metrics?.activeUsers ?? metrics?.activeDoctors ?? 0,
        lockedUsers: metrics?.lockedUsers ?? 0,
        usersByRole: {
          Patient: metrics?.usersByRole?.Patient ?? 0,
          Ophthalmologist:
            metrics?.usersByRole?.Ophthalmologist ??
            metrics?.activeDoctors ??
            0,
          ClinicStaff: metrics?.usersByRole?.ClinicStaff ?? 0,
          SystemAdmin: metrics?.usersByRole?.SystemAdmin ?? 0,
        },
      } satisfies UserStats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  },
  /**
   * Onboard a new staff member
   */
  async onboardStaff(data: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    consultationFee?: number;
    subRoles?: string[];
  }) {
    try {
      const response = await api.post<ApiResponse<string>>(
        `${API_ENDPOINTS.SYSTEM_ADMIN.USERS.LIST}/accounts`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  },
  /**
   * Update clinic staff details (sub-roles, etc.)
   */
  async updateClinicStaff(
    id: string,
    data: {
      subRoles: string[];
      department?: string;
      employeeCode?: string;
      phone?: string;
    }
  ) {
    try {
      const response = await api.put<ApiResponse<any>>(
        `/clinic-staff/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update clinic staff:', error);
      throw error;
    }
  },
};
