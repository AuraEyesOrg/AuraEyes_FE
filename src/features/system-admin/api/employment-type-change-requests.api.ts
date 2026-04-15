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

export interface AdminEmploymentTypeChangeRequestItem {
  id: string;
  ophthalmologistId: string;
  doctorUserId: string;
  doctorFullName: string;
  doctorEmail: string;
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

export interface ApproveEmploymentTypeChangeRequestResult {
  requestId: string;
  previousEmploymentType: EmploymentType;
  targetEmploymentType: EmploymentType;
  expiredContractId?: string | null;
  newPendingContractId?: string | null;
}

export const adminEmploymentTypeChangeRequestsApi = {
  async getRequests(
    pageNumber = 1,
    pageSize = 20,
    status?: OphthalmologistEmploymentTypeChangeRequestStatus
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<AdminEmploymentTypeChangeRequestItem>>
    >(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS
        .EMPLOYMENT_TYPE_CHANGE_REQUESTS,
      {
        params: {
          pageNumber,
          pageSize,
          status: status || undefined,
        },
      }
    );

    return unwrapApiData<PagedResult<AdminEmploymentTypeChangeRequestItem>>(
      response.data
    );
  },

  async approveRequest(requestId: string, adminNote?: string) {
    const response = await api.post<
      ApiResponse<ApproveEmploymentTypeChangeRequestResult>
    >(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.APPROVE_EMPLOYMENT_TYPE_CHANGE_REQUEST(
        requestId
      ),
      { adminNote: adminNote?.trim() || undefined }
    );

    return unwrapApiData<ApproveEmploymentTypeChangeRequestResult>(
      response.data
    );
  },

  async rejectRequest(requestId: string, adminNote?: string): Promise<void> {
    await api.post<ApiResponse<object>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.REJECT_EMPLOYMENT_TYPE_CHANGE_REQUEST(
        requestId
      ),
      { adminNote: adminNote?.trim() || undefined }
    );
  },
};
