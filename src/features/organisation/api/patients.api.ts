import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationRecentPatientDto {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  dateOfBirth?: string;
  citizenId?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  lastScreening: string;
  aiPrediction: string;
  confidence: number; // 0-100
  status: 'pending-review' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateOrganisationPatientContactRequest {
  address?: string;
  phoneNumber?: string;
  email?: string;
}

export const getOrganisationRecentPatients = async (): Promise<
  OrganisationRecentPatientDto[]
> => {
  const response = await api.get<ApiResponse<OrganisationRecentPatientDto[]>>(
    API_ENDPOINTS.ORGANISATION.PATIENTS
  );

  return unwrapApiData<OrganisationRecentPatientDto[]>(response.data);
};

export const updateOrganisationPatientContact = async (
  patientId: string,
  request: UpdateOrganisationPatientContactRequest
): Promise<string> => {
  const response = await api.put<ApiResponse<string>>(
    `${API_ENDPOINTS.ORGANISATION.PATIENTS}/${patientId}/contact`,
    request
  );

  return unwrapApiData<string>(response.data);
};
