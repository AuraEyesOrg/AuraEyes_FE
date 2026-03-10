/**
 * System Admin Permissions API
 * Handles all API calls for permission management, role assignments, and user overrides.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  ApplicationRoleDto,
  AssignPermissionToRolePayload,
  CreatePermissionPayload,
  GrantPermissionToUserPayload,
  PermissionDto,
  RolePermissionAssignment,
  UpdatePermissionPayload,
  UserEffectivePermissionsDto,
  UserPermissionOverride,
} from '../types/system-admin.types';
import type { PaginatedResponse } from '../types/system-admin.types';

const EP = API_ENDPOINTS.SYSTEM_ADMIN.PERMISSIONS;

export const permissionsApi = {
  // ── Permissions CRUD ───────────────────────────────────────────────────────

  async getPermissions(params?: {
    searchTerm?: string;
    category?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const response = await api.get<
      ApiResponse<PaginatedResponse<PermissionDto>>
    >(EP.LIST, { params });
    return response.data.data;
  },

  async getPermissionById(id: string) {
    const response = await api.get<ApiResponse<PermissionDto>>(EP.DETAIL(id));
    return response.data.data;
  },

  async createPermission(payload: CreatePermissionPayload) {
    const response = await api.post<ApiResponse<PermissionDto>>(
      EP.CREATE,
      payload
    );
    return response.data.data;
  },

  async updatePermission(id: string, payload: UpdatePermissionPayload) {
    const response = await api.put<ApiResponse<PermissionDto>>(
      EP.UPDATE(id),
      payload
    );
    return response.data.data;
  },

  async deletePermission(id: string) {
    const response = await api.delete<ApiResponse<null>>(EP.DELETE(id));
    return response.data;
  },

  // ── Roles ──────────────────────────────────────────────────────────────────

  async getAllRoles() {
    const response = await api.get<ApiResponse<ApplicationRoleDto[]>>(
      EP.ROLES.ALL
    );
    return response.data.data;
  },

  async getRolePermissions(roleId: string) {
    const response = await api.get<ApiResponse<RolePermissionAssignment[]>>(
      EP.ROLES.BY_ROLE(roleId)
    );
    return response.data.data;
  },

  async assignPermissionToRole(payload: AssignPermissionToRolePayload) {
    const response = await api.post<ApiResponse<RolePermissionAssignment>>(
      EP.ROLES.ASSIGN,
      payload
    );
    return response.data.data;
  },

  async removePermissionFromRole(rolePermId: string) {
    const response = await api.delete<ApiResponse<null>>(
      EP.ROLES.REMOVE(rolePermId)
    );
    return response.data;
  },

  // ── User Overrides ─────────────────────────────────────────────────────────

  async getUserPermissions(userId: string) {
    const response = await api.get<ApiResponse<UserEffectivePermissionsDto>>(
      EP.USERS.BY_USER(userId)
    );
    return response.data.data;
  },

  async grantPermissionToUser(payload: GrantPermissionToUserPayload) {
    const response = await api.post<ApiResponse<UserPermissionOverride>>(
      EP.USERS.GRANT,
      payload
    );
    return response.data.data;
  },

  async revokeUserPermission(userPermId: string) {
    const response = await api.patch<ApiResponse<null>>(
      EP.USERS.REVOKE(userPermId)
    );
    return response.data;
  },
};
