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
  patientGender?: string;
  patientAge?: number;
  citizenId?: string;
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
  medicalRecordId?: string;
  isAdminCompleted: boolean;
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

export interface ClinicPaymentContext {
  visitId: string;
  patientId: string;
  patientName: string;
  consultationSessionId: string;
  screeningId: string;
  diagnosis: {
    diagnosisId: string;
    diagnosisCode?: string;
    codingSystem?: string;
    clinicalFindings?: string;
    severityLevel?: string;
    recommendations?: string;
    followUpDate?: string;
    diagnosedBy: {
      doctorId: string;
      doctorName?: string;
    };
    finalizedAt?: string;
    prescriptionItems: Array<{
      medicineName: string;
      unit?: string;
      dosage: string;
      frequency: string;
      duration: string;
      instruction?: string;
    }>;
    prescriptionNote?: string;
    noMedicationPrescribed: boolean;
  };
}

export interface MedicationPriceItem {
  medicineName: string;
  price: number;
}

export interface CreateClinicPaymentRequest {
  visitId: string;
  serviceFee: number;
  medicationPrices: MedicationPriceItem[];
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateClinicPaymentResponse {
  orderId: string;
  paymentUrl: string;
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

  /** Get payment context (diagnosis + prescription) for cashier */
  async getPaymentContext(visitId: string) {
    const response = await api.get<ApiResponse<ClinicPaymentContext>>(
      API_ENDPOINTS.CLINIC_QUEUE.PAYMENT_CONTEXT(visitId)
    );
    return unwrapApiData<ClinicPaymentContext>(response.data);
  },

  /** Create a payment order for clinic medicines and services */
  async createClinicPayment(
    visitId: string,
    payload: CreateClinicPaymentRequest
  ) {
    const response = await api.post<ApiResponse<CreateClinicPaymentResponse>>(
      API_ENDPOINTS.CLINIC_QUEUE.CREATE_PAYMENT(visitId),
      payload
    );
    return unwrapApiData<CreateClinicPaymentResponse>(response.data);
  },
};
