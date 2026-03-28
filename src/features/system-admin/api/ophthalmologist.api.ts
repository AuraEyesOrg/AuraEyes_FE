/**
 * System Admin Ophthalmologist API
 * Real API calls for ophthalmologist management (verification, listing)
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OphthalmologistCredentialItem {
  id: string;
  name: string;
  issuingAuthority?: string;
  issuedDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface OphthalmologistListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  yearsOfExperience: number;
  employmentType: 'FullTime' | 'PartTime';
  workingHoursPerWeek?: number;
  expectedMonthlySalary?: number;
  commissionRate?: number;
  actualMonthlySalary?: number;
  verificationStatus: 'PendingVerification' | 'Approved' | 'Rejected';
  isVerified: boolean;
  licenseUrl?: string;
  degreeUrl?: string;
  licenses?: OphthalmologistCredentialItem[];
  degrees?: OphthalmologistCredentialItem[];
  rejectionReason?: string;
  organisationName?: string;
  isActive: boolean;
  createdAt: string;
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

export const ophthalmologistApi = {
  /**
   * Fetch ophthalmologists with pagination and filtering
   */
  async getOphthalmologists(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    verificationStatus?: string
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<OphthalmologistListItem>>
    >(API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.LIST, {
      params: {
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        verificationStatus: verificationStatus || undefined,
      },
    });
    return unwrapApiData<PagedResult<OphthalmologistListItem>>(response.data);
  },

  /**
   * Approve or reject ophthalmologist verification
   */
  async verifyOphthalmologist(
    id: string,
    approve: boolean,
    rejectionReason?: string
  ) {
    const response = await api.put<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.VERIFY(id),
      { approve, rejectionReason }
    );
    return response.data;
  },
};
