/**
 * Organisation Contract API
 * Handles contract viewing and upload for the authenticated organisation admin.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationContractDetailDto {
  id: string;
  contractNumber: string;
  status: string;
  templateId: string;
  templateTitle: string;
  contractType: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  aiQuotaLimit: number;
  platformCommissionRate: number;
  commissionRate?: number;
  actualMonthlySalary?: number;
  signedDate?: string;
  scannedDocumentUrl?: string;
  signedContent?: string;
  createdAt: string;
  updatedAt?: string;
}

const EP = API_ENDPOINTS.ORGANISATION.CONTRACT;

export const organisationContractApi = {
  async getMyContract() {
    const response = await api.get<ApiResponse<OrganisationContractDetailDto>>(
      EP.MY_CONTRACT
    );
    return unwrapApiData<OrganisationContractDetailDto>(response.data);
  },

  async uploadSignedContract(file: File) {
    const formData = new FormData();
    formData.append('contractImage', file);

    const response = await api.post<ApiResponse<null>>(EP.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
