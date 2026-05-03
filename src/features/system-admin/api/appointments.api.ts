import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface PendingCancellationDto {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  slotStartTime: string;
  price: number;
  refundBankNumber: string;
  refundAccountName: string;
  refundBankName: string;
  cancellationReason: string | null;
  requestedAt: string;
}

export interface ConfirmRefundRequest {
  refundTransactionId?: string;
  adminNote?: string;
}

export const appointmentsApi = {
  async getPendingCancellations() {
    const response = await api.get<ApiResponse<PendingCancellationDto[]>>(
      API_ENDPOINTS.SYSTEM_ADMIN.APPOINTMENTS.PENDING_CANCELLATIONS
    );
    return unwrapApiData<PendingCancellationDto[]>(response.data);
  },

  async confirmRefund(id: string, request: ConfirmRefundRequest) {
    const response = await api.post<ApiResponse<void>>(
      API_ENDPOINTS.SYSTEM_ADMIN.APPOINTMENTS.CONFIRM_REFUND(id),
      request
    );
    return response.data;
  },
};
