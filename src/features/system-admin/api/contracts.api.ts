/**
 * System Admin Contracts API
 * Handles all API calls for contract lifecycle management.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  ContractDetailDto,
  ContractDto,
  CreateContractPayload,
  SignContractPayload,
  UpdateContractPayload,
} from '../types/system-admin.types';
import type { PaginatedResponse } from '../types/system-admin.types';

const EP = API_ENDPOINTS.SYSTEM_ADMIN.CONTRACTS;

export const contractsApi = {
  async getContracts(params?: {
    searchTerm?: string;
    userId?: string;
    status?: string;
    contractType?: number;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<ContractDto>>>(
      EP.LIST,
      { params }
    );
    return response.data.data;
  },

  async getContractById(id: string) {
    const response = await api.get<ApiResponse<ContractDetailDto>>(
      EP.DETAIL(id)
    );
    return response.data.data;
  },

  async createContract(payload: CreateContractPayload) {
    const response = await api.post<ApiResponse<ContractDto>>(
      EP.CREATE,
      payload
    );
    return response.data.data;
  },

  async updateContract(id: string, payload: UpdateContractPayload) {
    const response = await api.put<ApiResponse<ContractDto>>(
      EP.UPDATE(id),
      payload
    );
    return response.data.data;
  },

  async sendForSignature(id: string) {
    const response = await api.post<ApiResponse<null>>(
      EP.SEND_FOR_SIGNATURE(id)
    );
    return response.data;
  },

  async signContract(id: string, payload: SignContractPayload) {
    const response = await api.post<ApiResponse<ContractDto>>(
      EP.SIGN(id),
      payload
    );
    return response.data.data;
  },

  async terminateContract(id: string) {
    const response = await api.post<ApiResponse<null>>(EP.TERMINATE(id));
    return response.data;
  },

  async cancelContract(id: string) {
    const response = await api.post<ApiResponse<null>>(EP.CANCEL(id));
    return response.data;
  },
};
