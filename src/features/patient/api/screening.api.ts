import { api } from '@/lib/api';
import type { ApiResponse } from '../types';

export const SCREENING_ENDPOINTS = {
  CREATE_SESSION: '/screenings/create-session',
  SAVE_RESULTS: (screeningId: string) =>
    `/screenings/${screeningId}/save-results`,
  REPORT_PDF: (screeningId: string) => `/screenings/${screeningId}/report-pdf`,
  UPLOAD_IMAGES: '/screenings/upload-images', // No screening ID, just upload without DB save
  RECENT_SESSIONS: '/screenings/recent',
  SESSION_BY_ID: (screeningId: string) => `/screenings/${screeningId}`,
};

export interface RetinalImageData {
  imageUrl: string;
  eyeSide: 'Left' | 'Right' | 'Both'; // Maps to EyeSide enum on backend
  deviceName?: string;
  qualityScore?: number;
}

export interface SaveAiScreeningResultsPayload {
  rawJsonOutput: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  confidenceScore: number; // 0-100
  summary?: string;
  findings?: string;
}

export interface SaveAiScreeningResultsResponse {
  screeningId: string;
  screeningResultId: string;
  /** Retinal images linked to this screening (matches GET /screenings/{id} images.length) */
  imagesCount: number;
  savedAt: string;
  riskLevel: string;
}

export interface CreateAiScreeningSessionPayload {
  modelVersion?: string;
  retinalImages: RetinalImageData[]; // Image URLs already uploaded to Cloudinary
}

export interface CreateAiScreeningSessionResponse {
  screeningId: string;
  patientId: string;
  modelVersion: string;
  createdAt: string;
  images?: Array<{ id: string; imageUrl: string; eyeSide: string }>;
}

export interface UploadRetinalImagesResponse {
  uploadedUrls: string[]; // Just URLs, no DB save yet
  count: number;
}

export interface ScreeningSessionSummary {
  screeningId: string;
  modelVersion: string;
  createdAt: string;
  processedAt?: string;
  isActive: boolean;
  imagesCount: number;
  thumbnailUrl?: string;
  latestRiskLevel?: string;
}

export interface ScreeningSessionDetail {
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
}

export const screeningApi = {
  /**
   * Upload retinal images to Cloudinary storage (no DB save yet).
   * Returns URLs only. Call this BEFORE creating session.
   */
  async uploadRetinalImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<ApiResponse<UploadRetinalImagesResponse>>(
      SCREENING_ENDPOINTS.UPLOAD_IMAGES,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Create a new AI screening session with image URLs.
   * Call this AFTER uploading images and getting their URLs.
   */
  async createSession(payload: CreateAiScreeningSessionPayload) {
    const response = await api.post<
      ApiResponse<CreateAiScreeningSessionResponse>
    >(SCREENING_ENDPOINTS.CREATE_SESSION, payload);
    return response.data;
  },

  /**
   * Save AI screening analysis results to database.
   * Call after AI analysis completes and results are ready for review.
   */
  async saveAiResults(
    screeningId: string,
    payload: SaveAiScreeningResultsPayload
  ) {
    const response = await api.post<
      ApiResponse<SaveAiScreeningResultsResponse>
    >(SCREENING_ENDPOINTS.SAVE_RESULTS(screeningId), payload);
    return response.data;
  },

  async getRecentSessions(limit = 10) {
    const response = await api.get<ApiResponse<ScreeningSessionSummary[]>>(
      `${SCREENING_ENDPOINTS.RECENT_SESSIONS}?limit=${limit}`
    );
    return response.data;
  },

  async getSessionById(screeningId: string) {
    const response = await api.get<ApiResponse<ScreeningSessionDetail>>(
      SCREENING_ENDPOINTS.SESSION_BY_ID(screeningId)
    );
    return response.data;
  },

  async downloadPatientReportPdf(screeningId: string) {
    const response = await api.get(
      SCREENING_ENDPOINTS.REPORT_PDF(screeningId),
      {
        responseType: 'blob',
      }
    );
    return {
      blob: response.data as Blob,
      contentDisposition:
        typeof response.headers['content-disposition'] === 'string'
          ? response.headers['content-disposition']
          : undefined,
    };
  },
};
