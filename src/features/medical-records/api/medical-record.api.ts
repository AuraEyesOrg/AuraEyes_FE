import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api-response';

export interface MedicalRecordDto {
  id: string;
  patientId: string;
  consultationSessionId?: string;
  patientVisitId?: string;
  medicalRecordNumber: string;
  pdfUrl?: string;
  status: string;
  administrativeDataJson: string;
  clinicalDataJson: string;
  finalDiagnosis: string;
  treatmentPlan: string;
  patient?: {
    fullName: string;
    phone: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export enum MedicalRecordStatus {
  Draft = 'Draft',
  ClinicalFilled = 'ClinicalFilled',
  Locked = 'Locked',
}

export interface CreateMedicalRecordCommand {
  patientId: string;
  consultationSessionId?: string;
  administrativeData: any;
}

export interface UpdateMedicalRecordClinicalCommand {
  id: string;
  clinicalData: any;
  finalDiagnosis: string;
  treatmentPlan: string;
}

export const medicalRecordApi = {
  create: (data: CreateMedicalRecordCommand) =>
    api.post<ApiResponse<string>>('/api/medical-records', data),

  updateClinical: (
    id: string,
    data: Omit<UpdateMedicalRecordClinicalCommand, 'id'>
  ) =>
    api.put<ApiResponse<boolean>>(`/api/medical-records/${id}/diagnosis`, data), // Updated to /diagnosis

  finalize: (id: string) =>
    api.post<ApiResponse<boolean>>(`/api/medical-records/${id}/finalize`), // Updated to POST

  getById: (id: string) =>
    api.get<ApiResponse<MedicalRecordDto>>(`/api/medical-records/${id}`),

  getByPatient: (patientId: string) =>
    api.get<ApiResponse<MedicalRecordDto[]>>(
      `/api/patients/${patientId}/medical-records`
    ),

  getAll: (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
  }) =>
    api.get<
      ApiResponse<{
        data: MedicalRecordDto[];
        totalPages: number;
        totalCount: number;
      }>
    >('/api/medical-records/all', { params }), // Added getAll with typing
};
