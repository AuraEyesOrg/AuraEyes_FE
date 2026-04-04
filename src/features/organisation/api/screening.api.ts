import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

// ─── Types ───────────────────────────────────────────────────────────

export interface OrgScreeningSessionResponse {
  screeningId: string;
  patientId: string;
  modelVersion: string;
  images: Array<{ id: string; imageUrl: string; eyeSide: string }>;
  createdAt: string;
}

export interface OrgScreeningHistoryItem {
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

export interface CreateOrgScreeningRequest {
  patientId: string;
  modelVersion?: string;
  retinalImages: Array<{
    imageUrl: string;
    eyeSide: 'Left' | 'Right' | 'Both';
    deviceName?: string;
  }>;
}

// ─── API calls ───────────────────────────────────────────────────────

export const orgScreeningApi = {
  /** Create AI screening on behalf of a patient */
  async createSession(request: CreateOrgScreeningRequest) {
    const response = await api.post<ApiResponse<OrgScreeningSessionResponse>>(
      API_ENDPOINTS.ORGANISATION.SCREENING.CREATE_SESSION,
      request
    );
    return response.data;
  },

  /** Get screening history for this organisation */
  async getHistory(take = 50) {
    const response = await api.get<ApiResponse<OrgScreeningHistoryItem[]>>(
      API_ENDPOINTS.ORGANISATION.SCREENING.HISTORY,
      {
        params: { take },
      }
    );
    return unwrapApiData<OrgScreeningHistoryItem[]>(response.data);
  },

  /**
   * Upload retinal images to storage (reuse patient endpoint).
   * Returns public URLs, no DB save yet.
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

  /** Save AI screening results (reuse patient endpoint) */
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

  /** Get screening session detail (reuse patient endpoint) */
  async getSessionDetail(screeningId: string) {
    const response = await api.get<
      ApiResponse<{
        screeningId: string;
        patientId: string;
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
};
