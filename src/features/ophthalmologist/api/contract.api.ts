/**
 * Ophthalmologist Contract API
 * Handles contract viewing and upload for the authenticated ophthalmologist.
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface ContractDetailDto {
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
  signedDate?: string;
  scannedDocumentUrl?: string;
  signedContent?: string;
  createdAt: string;
  updatedAt?: string;
}

const EP = API_ENDPOINTS.OPHTHALMOLOGIST.CONTRACT;

export const contractApi = {
  /** Get the current ophthalmologist's contract (includes template HTML). */
  async getMyContract() {
    const response = await api.get<ApiResponse<ContractDetailDto>>(
      EP.MY_CONTRACT
    );
    return unwrapApiData<ContractDetailDto>(response.data);
  },

  /** Upload a signed contract image (scanned/photo). */
  async uploadSignedContract(file: File) {
    const formData = new FormData();
    formData.append('contractImage', file);

    const response = await api.post<ApiResponse<null>>(EP.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
