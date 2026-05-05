import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export type EmploymentType = 'FullTime' | 'PartTime';

export type OphthalmologistEmploymentTypeChangeRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface OphthalmologistEmploymentTypeChangeRequestItem {
  id: string;
  ophthalmologistId: string;
  currentEmploymentType: EmploymentType;
  targetEmploymentType: EmploymentType;
  reason: string;
  status: OphthalmologistEmploymentTypeChangeRequestStatus;
  adminNote?: string | null;
  reviewedByAdminUserId?: string | null;
  reviewedAt?: string | null;
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

export interface CreateEmploymentTypeChangeRequestInput {
  targetEmploymentType: EmploymentType;
  reason: string;
}

export const ophthalmologistEmploymentTypeChangeRequestsApi = {
  async getRequests(
    pageNumber = 1,
    pageSize = 20,
    status?: OphthalmologistEmploymentTypeChangeRequestStatus
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<OphthalmologistEmploymentTypeChangeRequestItem>>
    >(API_ENDPOINTS.OPHTHALMOLOGIST.EMPLOYMENT_TYPE_CHANGE_REQUESTS.LIST, {
      params: {
        pageNumber,
        pageSize,
        status: status || undefined,
      },
    });

    return unwrapApiData<
      PagedResult<OphthalmologistEmploymentTypeChangeRequestItem>
    >(response.data);
  },

  async createRequest(payload: CreateEmploymentTypeChangeRequestInput) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.OPHTHALMOLOGIST.EMPLOYMENT_TYPE_CHANGE_REQUESTS.CREATE,
      payload
    );

    return unwrapApiData<string>(response.data);
  },

  async cancelRequest(requestId: string): Promise<void> {
    await api.post<ApiResponse<object>>(
      API_ENDPOINTS.OPHTHALMOLOGIST.EMPLOYMENT_TYPE_CHANGE_REQUESTS.CANCEL(
        requestId
      ),
      {}
    );
  },
};
