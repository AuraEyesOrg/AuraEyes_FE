import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export type OphthalmologistLeaveRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface OphthalmologistLeaveRequestItem {
  id: string;
  ophthalmologistId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: OphthalmologistLeaveRequestStatus;
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

export interface CreateLeaveRequestInput {
  startDate: string;
  endDate: string;
  reason: string;
}

export const ophthalmologistLeaveRequestsApi = {
  async getLeaveRequests(
    pageNumber = 1,
    pageSize = 20,
    status?: OphthalmologistLeaveRequestStatus
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<OphthalmologistLeaveRequestItem>>
    >(API_ENDPOINTS.OPHTHALMOLOGIST.LEAVE_REQUESTS.LIST, {
      params: {
        pageNumber,
        pageSize,
        status: status || undefined,
      },
    });

    return unwrapApiData<PagedResult<OphthalmologistLeaveRequestItem>>(
      response.data
    );
  },

  async createLeaveRequest(payload: CreateLeaveRequestInput) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.OPHTHALMOLOGIST.LEAVE_REQUESTS.CREATE,
      payload
    );

    return unwrapApiData<string>(response.data);
  },

  async cancelLeaveRequest(requestId: string) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.OPHTHALMOLOGIST.LEAVE_REQUESTS.CANCEL(requestId),
      {}
    );

    return unwrapApiData<string>(response.data);
  },
};
