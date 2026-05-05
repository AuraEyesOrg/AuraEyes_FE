import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface ClinicRecentPatientDto {
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
  // Walk-in only (ignored by backend for registered)
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenId?: string;
  // Shared
  address?: string;
  phoneNumber?: string;
  bmi?: number;
  diseaseHistory?: string;
}

export const getClinicRecentPatients = async (): Promise<
  ClinicRecentPatientDto[]
> => {
  const response = await api.get<ApiResponse<ClinicRecentPatientDto[]>>(
    API_ENDPOINTS.ORGANISATION.PATIENTS
  );

  return unwrapApiData<ClinicRecentPatientDto[]>(response.data);
};

export const updateClinicPatient = async (
  patientId: string,
  request: UpdateClinicPatientRequest
): Promise<string> => {
  const response = await api.put<ApiResponse<string>>(
    `${API_ENDPOINTS.ORGANISATION.PATIENTS}/${patientId}`,
    request
  );

  return unwrapApiData<string>(response.data);
};

// Backward-compatible aliases during migration from organisation wording.
export type OrganisationRecentPatientDto = ClinicRecentPatientDto;
export type UpdateOrganisationPatientRequest = UpdateClinicPatientRequest;
export const getOrganisationRecentPatients = getClinicRecentPatients;
export const updateOrganisationPatient = updateClinicPatient;
