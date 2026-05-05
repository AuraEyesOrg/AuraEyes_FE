import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

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

export const orgWalkInPatientApi = {
  async createWalkInPatient(request: CreateWalkInPatientRequest) {
    const response = await api.post<ApiResponse<CreateWalkInPatientResponse>>(
      '/clinic-staff/patients/walk-in',
      request
    );
    return unwrapApiData<CreateWalkInPatientResponse>(response.data);
  },
};
