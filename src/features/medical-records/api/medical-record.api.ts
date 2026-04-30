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
  DraftAdmin = 'Draft_Admin',
  PendingClinical = 'Pending_Clinical',
  Finalized = 'Finalized',
}

export interface CreateMedicalRecordCommand {
  patientId: string;
  consultationSessionId?: string;
  medicalRecordNumber: string;
  administrativeDataJson?: string;
}

export interface UpdateMedicalRecordClinicalCommand {
  id: string;
  clinicalDataJson: string;
  administrativeDataJson: string;
  finalDiagnosis: string;
  treatmentPlan: string;
}

export const medicalRecordApi = {
  create: (data: CreateMedicalRecordCommand) =>
    api.post<ApiResponse<string>>('medical-records', data),

  updateAdministrative: (
    id: string,
    data: { administrativeDataJson: string }
  ) =>
    api.put<ApiResponse<boolean>>(`medical-records/${id}/administrative`, data),

  updateClinical: (
    id: string,
    data: Omit<UpdateMedicalRecordClinicalCommand, 'id'>
  ) => api.put<ApiResponse<boolean>>(`medical-records/${id}/diagnosis`, data),

  startConsultation: (id: string) =>
    api.post<ApiResponse<boolean>>(`medical-records/${id}/start-consultation`),

  finalize: (id: string) =>
    api.post<ApiResponse<boolean>>(`medical-records/${id}/finalize`), // Updated to POST

  downloadPdf: (id: string) =>
    api.get<Blob>(`medical-records/${id}/pdf`, {
      responseType: 'blob',
    }),

  getById: (id: string) =>
    api.get<ApiResponse<MedicalRecordDto>>(`medical-records/${id}`),

  getByPatient: (patientId: string) =>
    api.get<ApiResponse<MedicalRecordDto[]>>(
      `patients/${patientId}/medical-records`
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
        items: MedicalRecordDto[];
        totalPages: number;
        totalCount: number;
      }>
    >('medical-records/all', { params }), // Added getAll with typing
};
