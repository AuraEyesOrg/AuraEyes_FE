import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrganisationRecentPatientDto {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  lastScreening: string;
  aiPrediction: string;
  confidence: number; // 0-100
  status: 'pending-review' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high';
}

export const getOrganisationRecentPatients = async (): Promise<
  OrganisationRecentPatientDto[]
> => {
  const response = await api.get<ApiResponse<OrganisationRecentPatientDto[]>>(
    API_ENDPOINTS.ORGANISATION.PATIENTS
  );

  return response.data.data;
};
