import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export type OphthalmologistLeaveRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface AdminLeaveRequestItem {
  id: string;
  ophthalmologistId: string;
  doctorUserId: string;
  doctorFullName: string;
  doctorEmail: string;
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

export interface ApproveLeaveRequestResult {
  leaveRequestId: string;
  cancelledConsultationSessions: number;
  cancelledAppointments: number;
  blockedSlots: number;
}

export const adminLeaveRequestsApi = {
  async getLeaveRequests(
    pageNumber = 1,
    pageSize = 20,
    status?: OphthalmologistLeaveRequestStatus
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<AdminLeaveRequestItem>>
    >(API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.LEAVE_REQUESTS, {
      params: {
        pageNumber,
        pageSize,
        status: status || undefined,
      },
    });

    return unwrapApiData<PagedResult<AdminLeaveRequestItem>>(response.data);
  },

  async approveLeaveRequest(requestId: string, adminNote?: string) {
    const response = await api.post<ApiResponse<ApproveLeaveRequestResult>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.APPROVE_LEAVE_REQUEST(
        requestId
      ),
      { adminNote: adminNote?.trim() || undefined }
    );

    return unwrapApiData<ApproveLeaveRequestResult>(response.data);
  },

  async rejectLeaveRequest(requestId: string, adminNote?: string) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.REJECT_LEAVE_REQUEST(
        requestId
      ),
      { adminNote: adminNote?.trim() || undefined }
    );

    return unwrapApiData<string>(response.data);
  },
};
