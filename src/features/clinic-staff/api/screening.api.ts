import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClinicScreeningSessionResponse {
  screeningId: string;
  patientId: string;
  modelVersion: string;
  images: Array<{ id: string; imageUrl: string; eyeSide: string }>;
  createdAt: string;
}

export interface ClinicScreeningHistoryItem {
  screeningId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  processedAt?: string;
  imagesCount: number;
  latestRiskLevel?: string;
  confidenceScore?: number;
  aiPrimaryLabel?: string;
  status: 'pending' | 'completed' | 'saved';
}

export interface CreateClinicScreeningRequest {
  patientId: string;
  modelVersion?: string;
  retinalImages: Array<{
    imageUrl: string;
    eyeSide: 'Left' | 'Right' | 'Both';
    deviceName?: string;
  }>;
}

export interface ShareClinicScreeningResultRequest {
  recipientEmail?: string;
  includePdf: boolean;
  includeRetinalImages: boolean;
}

export interface ShareClinicScreeningResultResponse {
  recipientEmail: string;
  sharedAt: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const clinicScreeningApi = {
  /** Create AI screening session on behalf of a clinic patient */
  async createSession(request: CreateClinicScreeningRequest) {
    const response = await api.post<
      ApiResponse<ClinicScreeningSessionResponse>
    >(API_ENDPOINTS.ORGANISATION.SCREENING.CREATE_SESSION, request);
    return response.data;
  },

  /** Get screening history for this clinic's organisation */
  async getHistory(take = 50) {
    const response = await api.get<ApiResponse<ClinicScreeningHistoryItem[]>>(
      API_ENDPOINTS.ORGANISATION.SCREENING.HISTORY,
      { params: { take } }
    );
    return unwrapApiData<ClinicScreeningHistoryItem[]>(response.data);
  },

  /**
   * Upload retinal images to storage.
   * Returns public CDN URLs – no DB record yet.
   */
  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post<
      ApiResponse<{ uploadedUrls: string[]; count: number }>
    >('/screenings/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Persist AI results to the screening record */
  async saveResults(
    screeningId: string,
    payload: {
      rawJsonOutput: string;
      riskLevel: 'Low' | 'Moderate' | 'High';
      confidenceScore: number;
      summary?: string;
      findings?: string;
    }
  ) {
    const response = await api.post<ApiResponse<unknown>>(
      `/screenings/${screeningId}/save-results`,
      payload
    );
    return response.data;
  },

  /** Get detail for a specific screening session */
  async getSessionDetail(screeningId: string) {
    const response = await api.get<
      ApiResponse<{
        screeningId: string;
        patientId: string;
        patientName?: string;
        patientEmail?: string;
        isWalkIn: boolean;
        modelVersion: string;
        createdAt: string;
        processedAt?: string;
        rawJsonOutput?: string;
        isActive: boolean;
        images: Array<{
          id: string;
          imageUrl: string;
          eyeSide: string;
          deviceName?: string;
          qualityScore?: number;
          capturedAt: string;
        }>;
        latestResult?: {
          screeningResultId: string;
          riskLevel: string;
          confidenceScore: number;
          summary?: string;
          findings?: string;
          assessedAt: string;
        };
      }>
    >(API_ENDPOINTS.ORGANISATION.SCREENING.DETAIL(screeningId));
    return response.data;
  },

  /** Share clinic screening result via email */
  async shareSessionResult(
    screeningId: string,
    payload: ShareClinicScreeningResultRequest
  ) {
    const response = await api.post<
      ApiResponse<ShareClinicScreeningResultResponse>
    >(API_ENDPOINTS.ORGANISATION.SCREENING.SHARE(screeningId), payload);
    return response.data;
  },

  /** Download clinic screening report as PDF */
  async downloadSessionReportPdf(screeningId: string) {
    const response = await api.get<Blob>(
      API_ENDPOINTS.ORGANISATION.SCREENING.EXPORT_PDF(screeningId),
      { responseType: 'blob' }
    );
    return {
      blob: response.data,
      contentDisposition: response.headers?.['content-disposition'] as
        | string
        | undefined,
    };
  },
};
