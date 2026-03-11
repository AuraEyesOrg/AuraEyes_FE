/**
 * System Admin Contract Templates API
 * Handles all API calls for contract template management.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  ContractTemplateDetailDto,
  ContractTemplateDto,
  CreateContractTemplatePayload,
  UpdateContractTemplatePayload,
} from '../types/system-admin.types';
import type { PaginatedResponse } from '../types/system-admin.types';

const EP = API_ENDPOINTS.SYSTEM_ADMIN.CONTRACT_TEMPLATES;

export const contractTemplatesApi = {
  async getContractTemplates(params?: {
    searchTerm?: string;
    type?: number;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const response = await api.get<
      ApiResponse<PaginatedResponse<ContractTemplateDto>>
    >(EP.LIST, { params });
    return response.data.data;
  },

  async getContractTemplateById(id: string) {
    const response = await api.get<ApiResponse<ContractTemplateDetailDto>>(
      EP.DETAIL(id)
    );
    return response.data.data;
  },

  async createContractTemplate(payload: CreateContractTemplatePayload) {
    const response = await api.post<ApiResponse<ContractTemplateDetailDto>>(
      EP.CREATE,
      payload
    );
    return response.data.data;
  },

  async updateContractTemplate(
    id: string,
    payload: UpdateContractTemplatePayload
  ) {
    const response = await api.put<ApiResponse<ContractTemplateDetailDto>>(
      EP.UPDATE(id),
      payload
    );
    return response.data.data;
  },

  async deleteContractTemplate(id: string) {
    const response = await api.delete<ApiResponse<null>>(EP.DELETE(id));
    return response.data;
  },

  async setContractTemplateStatus(id: string, isActive: boolean) {
    const response = await api.patch<ApiResponse<null>>(EP.SET_STATUS(id), {
      isActive,
    });
    return response.data;
  },
};
