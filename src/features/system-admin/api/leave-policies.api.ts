import { API_ENDPOINTS } from '@/lib/endpoints';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface LeavePolicy {
  id: string;
  name: string;
  additionalDays: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetLeavePoliciesResponse {
  items: LeavePolicy[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const leavePoliciesApi = {
  getPaged: async (pageNumber = 1, pageSize = 20) => {
    const response = await api.get<ApiResponse<GetLeavePoliciesResponse>>(
      API_ENDPOINTS.SYSTEM_ADMIN.LEAVE_POLICIES.LIST,
      { params: { pageNumber, pageSize } }
    );
    return unwrapApiData<GetLeavePoliciesResponse>(response.data);
  },

  create: async (data: Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<ApiResponse<LeavePolicy>>(
      API_ENDPOINTS.SYSTEM_ADMIN.LEAVE_POLICIES.CREATE,
      data
    );
    return unwrapApiData<LeavePolicy>(response.data);
  },

  update: async (id: string, data: Partial<LeavePolicy>) => {
    const response = await api.put<ApiResponse<LeavePolicy>>(
      API_ENDPOINTS.SYSTEM_ADMIN.LEAVE_POLICIES.UPDATE(id),
      { ...data, policyId: id }
    );
    return unwrapApiData<LeavePolicy>(response.data);
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.SYSTEM_ADMIN.LEAVE_POLICIES.DELETE(id)
    );
    return unwrapApiData<boolean>(response.data);
  },

  apply: async (policyId: string, doctorId: string) => {
    const response = await api.post<ApiResponse<boolean>>(
      API_ENDPOINTS.SYSTEM_ADMIN.LEAVE_POLICIES.APPLY(policyId, doctorId)
    );
    return unwrapApiData<boolean>(response.data);
  },
};
