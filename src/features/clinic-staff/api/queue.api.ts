import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ClinicFlowState =
  | 'CheckedIn'
  | 'ScreeningPending'
  | 'AICompleted'
  | 'SentToDoctor'
  | 'ConsultationInProgress'
  | 'Finalized';

export interface ClinicQueueItem {
  visitId: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  visitStatus: string;
  checkedInAt: string;
  screeningId?: string;
  screeningStatus?: string;
  screeningRiskLevel?: string;
  consultationSessionId?: string;
  consultationStatus?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  flowState: ClinicFlowState;
}

export interface SendToDoctorRequest {
  screeningId: string;
  doctorId?: string;
  notes?: string;
}

export interface SendToDoctorResponse {
  consultationSessionId: string;
  assignedDoctorId?: string;
  message: string;
}

export interface AvailableDoctor {
  id: string;
  fullName: string;
  yearsOfExperience: number;
  avatarUrl?: string;
}

interface AvailableDoctorApiItem {
  id: string;
  fullName?: string | null;
  userFullName?: string | null;
  yearsOfExperience?: number | null;
  avatarUrl?: string | null;
  userAvatarUrl?: string | null;
}

interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

const normalizeAvailableDoctor = (
  doctor: AvailableDoctorApiItem,
  index: number
): AvailableDoctor => ({
  id: doctor.id,
  fullName:
    doctor.fullName?.trim() ||
    doctor.userFullName?.trim() ||
    `Doctor #${index + 1}`,
  yearsOfExperience: doctor.yearsOfExperience ?? 0,
  avatarUrl: doctor.avatarUrl ?? doctor.userAvatarUrl ?? undefined,
});

// ─── API calls ───────────────────────────────────────────────────────────────

export const clinicQueueApi = {
  /** Get clinic queue for current organisation */
  async getQueue() {
    const response = await api.get<ApiResponse<ClinicQueueItem[]>>(
      API_ENDPOINTS.CLINIC_QUEUE.GET
    );
    return unwrapApiData<ClinicQueueItem[]>(response.data);
  },

  /** Send patient case to doctor for consultation */
  async sendToDoctor(visitId: string, payload: SendToDoctorRequest) {
    const response = await api.post<ApiResponse<SendToDoctorResponse>>(
      API_ENDPOINTS.CLINIC_QUEUE.SEND_TO_DOCTOR(visitId),
      payload
    );
    return unwrapApiData<SendToDoctorResponse>(response.data);
  },

  /** Get available doctors to assign the case */
  async getAvailableDoctors() {
    const response = await api.get<
      ApiResponse<PagedResult<AvailableDoctorApiItem>>
    >(API_ENDPOINTS.PUBLIC.PATIENT_SEARCH.OPHTHALMOLOGISTS, {
      params: { pageNumber: 1, pageSize: 50 },
    });
    const data = unwrapApiData<PagedResult<AvailableDoctorApiItem>>(
      response.data
    );
    return data.items.map(normalizeAvailableDoctor);
  },
};
