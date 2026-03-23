/**
 * System Admin Patient API
 * Real API calls for patient management (listing, lock/unlock)
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface PatientListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  medicalHistorySummary?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const patientApi = {
  /**
   * Fetch patients with pagination and filtering
   */
  async getPatients(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    status?: string
  ) {
    const response = await api.get<ApiResponse<PagedResult<PatientListItem>>>(
      API_ENDPOINTS.SYSTEM_ADMIN.PATIENTS.LIST,
      {
        params: {
          pageNumber,
          pageSize,
          searchTerm: searchTerm || undefined,
          status: status || undefined,
        },
      }
    );
    return unwrapApiData<PagedResult<PatientListItem>>(response.data);
  },

  /**
   * Lock or unlock patient account
   */
  async updatePatientStatus(
    userId: string,
    action: 'activate' | 'suspend' | 'lock',
    reason?: string
  ) {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.SYSTEM_ADMIN.PATIENTS.UPDATE_STATUS(userId),
      { action, reason }
    );
    return response.data;
  },
};
