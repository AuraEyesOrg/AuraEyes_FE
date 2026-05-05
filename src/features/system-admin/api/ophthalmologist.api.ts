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
  degreeLevel?: string;
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
  employmentType: 'FullTime' | 'PartTime';
  licenseUrl?: string;
  degreeUrl?: string;
  licenses?: OphthalmologistCredentialItem[];
  degrees?: OphthalmologistCredentialItem[];
  organisationName?: string;
  consultationFee: number;
  isActive: boolean;
  createdAt: string;
  ratingAverage?: number;
  ratingCount?: number;
  availableLeaveDays: number;
}

export interface FeedbackRatingSummary {
  entityId: string;
  ratingAverage: number;
  ratingCount: number;
  distribution: Record<number, number>;
}

export interface UpdateOphthalmologistEmploymentPayload {
  id: string;
  bio?: string;
  employmentType: 'FullTime' | 'PartTime';
  consultationFee?: number;
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

export type WithdrawalRequestStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

export interface AdminWithdrawalRequestItem {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  status: WithdrawalRequestStatus;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  /** Mã BIN ngân hàng PayOS (ví dụ: "970415" = Vietinbank). Cần thiết để chi tự động. */
  bankBin?: string | null;
  contractNumber?: string | null;
  note?: string | null;
  adminNote?: string | null;
  transferReference?: string | null;
  processedByAdminId?: string | null;
  processedAt?: string | null;
  createdAt: string;
  doctorFullName: string;
  doctorEmail: string;
  /** ID lệnh chi PayOS (externalPayoutId từ PayOS) */
  externalPayoutId?: string | null;
  /** Reference ID nội bộ gửi cho PayOS */
  payOSReferenceId?: string | null;
  /** Trạng thái từ PayOS: PENDING, PROCESSING, SUCCEEDED, FAILED */
  payOSApprovalState?: string | null;
}

export interface PayOSPayoutTransactionDto {
  id: string;
  amount: number;
  description: string;
  toBin: string;
  toAccountNumber: string;
  toAccountName: string;
  state: string;
}

export interface PayoutViaPayOSResponse {
  withdrawalRequestId: string;
  externalPayoutId: string;
  payOSReferenceId: string;
  approvalState: string;
  withdrawalStatus: string;
  transactions: PayOSPayoutTransactionDto[];
}

export interface PayoutStatusResponse {
  withdrawalRequestId: string;
  externalPayoutId: string;
  payOSReferenceId: string;
  approvalState: string;
  withdrawalStatus: string;
  transactions: PayOSPayoutTransactionDto[];
}

export const ophthalmologistApi = {
  /**
   * Fetch ophthalmologists with pagination and filtering
   */
  async getOphthalmologists(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    status?: string
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<OphthalmologistListItem>>
    >(API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.LIST, {
      params: {
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        status: status || undefined,
      },
    });
    return unwrapApiData<PagedResult<OphthalmologistListItem>>(response.data);
  },

  /**
   * Fetch ophthalmologist detail by ID
   */
  async getOphthalmologistDetail(id: string) {
    const response = await api.get<ApiResponse<OphthalmologistListItem>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.DETAIL(id)
    );
    return unwrapApiData<OphthalmologistListItem>(response.data);
  },

  /**
   * Approve or reject ophthalmologist verification
   */
  async verifyOphthalmologist(id: string, approve: boolean, reason?: string) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.VERIFY(id),
      { approve, reason }
    );
    return response.data;
  },

  async updateEmploymentType(payload: UpdateOphthalmologistEmploymentPayload) {
    const response = await api.put<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.UPDATE_PROFILE(payload.id),
      payload
    );
    return response.data;
  },

  async deleteOphthalmologist(id: string) {
    const response = await api.delete<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.DELETE(id)
    );
    return response.data;
  },

  async paySalary(id: string, amount?: number, note?: string) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.PAY_SALARY(id),
      { amount, note }
    );
    return response.data;
  },

  async getWithdrawalRequests(
    pageNumber = 1,
    pageSize = 20,
    status?: WithdrawalRequestStatus
  ) {
    const response = await api.get<
      ApiResponse<PagedResult<AdminWithdrawalRequestItem>>
    >(API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.WITHDRAWAL_REQUESTS, {
      params: {
        pageNumber,
        pageSize,
        status: status || undefined,
      },
    });

    return unwrapApiData<PagedResult<AdminWithdrawalRequestItem>>(
      response.data
    );
  },

  async getRatingSummary(ophthalmologistId: string) {
    const response = await api.get<ApiResponse<FeedbackRatingSummary>>(
      API_ENDPOINTS.FEEDBACK.OPHTHALMOLOGIST_RATING(ophthalmologistId)
    );
    return unwrapApiData<FeedbackRatingSummary>(response.data);
  },

  async confirmWithdrawalRequest(
    requestId: string,
    payload?: { transferReference?: string; note?: string }
  ) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.CONFIRM_WITHDRAWAL_REQUEST(
        requestId
      ),
      payload ?? {}
    );

    return response.data;
  },

  async rejectWithdrawalRequest(
    requestId: string,
    payload?: { reason?: string }
  ) {
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.REJECT_WITHDRAWAL_REQUEST(
        requestId
      ),
      payload ?? {}
    );

    return response.data;
  },

  /**
   * [Admin] Trigger lệnh chi tự động qua PayOS Payout API.
   * WithdrawalRequest phải ở Pending và có BankBin hợp lệ.
   */
  async processPayoutViaPayOS(
    withdrawalRequestId: string,
    categories?: string[]
  ) {
    const response = await api.post<ApiResponse<PayoutViaPayOSResponse>>(
      API_ENDPOINTS.SYSTEM_ADMIN.PAYOUTS.PROCESS(withdrawalRequestId),
      { categories: categories ?? ['salary'] }
    );
    return unwrapApiData<PayoutViaPayOSResponse>(response.data);
  },

  /**
   * [Admin] Đồng bộ trạng thái lệnh chi từ PayOS về hệ thống.
   * Gọi PayOS GET /v1/payouts/{payoutId} và cập nhật WithdrawalRequest.
   */
  async syncPayoutStatus(withdrawalRequestId: string) {
    const response = await api.post<ApiResponse<PayoutStatusResponse>>(
      API_ENDPOINTS.SYSTEM_ADMIN.PAYOUTS.SYNC_STATUS(withdrawalRequestId),
      {}
    );
    return unwrapApiData<PayoutStatusResponse>(response.data);
  },
};
