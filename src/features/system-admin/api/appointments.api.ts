import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface PendingCancellationDto {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  startTime: string;
  totalAmount: number;
  depositAmount: number;
  refundBankNumber: string;
  refundAccountName: string;
  refundBankName: string;
  cancellationReason: string | null;
  createdAt: string;
}

export interface ConfirmRefundRequest {
  refundTransactionId?: string;
  adminNote?: string;
}

export const appointmentsApi = {
  async getPendingCancellations() {
    const response = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.SYSTEM_ADMIN.APPOINTMENTS.PENDING_CANCELLATIONS
    );
    const data = unwrapApiData<any>(response.data);
    return (data?.items || []) as PendingCancellationDto[];
  },

  async confirmRefund(id: string, request: ConfirmRefundRequest) {
    const response = await api.post<ApiResponse<void>>(
      API_ENDPOINTS.SYSTEM_ADMIN.APPOINTMENTS.CONFIRM_REFUND(id),
      request
    );
    return response.data;
  },

  async rejectRefund(id: string, adminNote?: string) {
    const response = await api.post<ApiResponse<void>>(
      API_ENDPOINTS.SYSTEM_ADMIN.APPOINTMENTS.REJECT_REFUND(id),
      { adminNote }
    );
    return response.data;
  },
};
