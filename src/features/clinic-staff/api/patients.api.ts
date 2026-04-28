/**
 * Clinic Staff – Patients API
 *
 * All endpoints go through the clinic or clinic-staff namespace,
 * completely independent from the old organisation API.
 *
 * Endpoints:
 *  GET  /api/clinic/patients                    — list recent clinic patients
 *  PUT  /api/clinic/patients/:patientId         — update patient info
 *  POST /api/clinic-staff/patients/walk-in      — register a new walk-in patient
 */
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface ClinicPatientDto {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  dateOfBirth?: string;
  citizenId?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  isWalkIn: boolean;
  bmi?: number;
  diseaseHistory?: string;
  lastScreening: string;
  aiPrediction: string;
  confidence: number; // 0-100
  status: 'pending-review' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateClinicPatientRequest {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenId?: string;
  address?: string;
  phoneNumber?: string;
  bmi?: number;
  diseaseHistory?: string;
}

export interface CreateWalkInPatientRequest {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber?: string;
  citizenId?: string;
  address?: string;
  email?: string;
}

export interface CreateWalkInPatientResponse {
  patientId: string;
  userId: string;
  loginEmail: string;
  isGeneratedEmail: boolean;
  emailSent: boolean;
  temporaryPassword?: string | null;
}

// ── API calls ───────────────────────────────────────────────────────────────

/**
 * GET /api/clinic/patients
 * Returns recent patients seen at this clinic.
 */
export const getClinicPatients = async (): Promise<ClinicPatientDto[]> => {
  const response = await api.get<ApiResponse<ClinicPatientDto[]>>(
    API_ENDPOINTS.CLINIC_STAFF.PATIENTS.LIST
  );
  return unwrapApiData<ClinicPatientDto[]>(response.data);
};

/**
 * PUT /api/clinic/patients/:patientId
 * Updates contact / demographic info for a clinic patient.
 */
export const updateClinicPatient = async (
  patientId: string,
  request: UpdateClinicPatientRequest
): Promise<string> => {
  const response = await api.put<ApiResponse<string>>(
    API_ENDPOINTS.CLINIC_STAFF.PATIENTS.UPDATE(patientId),
    request
  );
  return unwrapApiData<string>(response.data);
};

/**
 * POST /api/clinic-staff/patients/walk-in
 * Registers a brand-new walk-in patient and creates an identity account.
 * Email is optional – if not provided the system generates a placeholder.
 */
export const createClinicWalkInPatient = async (
  request: CreateWalkInPatientRequest
): Promise<CreateWalkInPatientResponse> => {
  const response = await api.post<ApiResponse<CreateWalkInPatientResponse>>(
    API_ENDPOINTS.CLINIC_STAFF.PATIENTS.WALK_IN,
    request
  );
  return unwrapApiData<CreateWalkInPatientResponse>(response.data);
};
