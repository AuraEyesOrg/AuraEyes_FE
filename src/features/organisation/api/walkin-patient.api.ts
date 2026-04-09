import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface CreateWalkInPatientRequest {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber?: string;
  email?: string;
  citizenId?: string;
  address?: string;
}

export const orgWalkInPatientApi = {
  async createWalkInPatient(request: CreateWalkInPatientRequest) {
    const response = await api.post<ApiResponse<string>>(
      '/organisations/patients/walk-in',
      request
    );
    return unwrapApiData<string>(response.data);
  },
};
