import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OphthalmologistScreeningListItemDto {
  screeningId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  processedAt?: string | null;
  modelVersion: string;
  imagesCount: number;
  thumbnailUrl?: string | null;
  latestRiskLevel?: string | null;
  confidenceScore?: number | null;
  aiPrimaryLabel?: string | null;
  summarySnippet?: string | null;
  reviewStatus: string;
}

export interface OphthalmologistRetinalImageDto {
  id: string;
  imageUrl: string;
  eyeSide: string;
  deviceName?: string | null;
  qualityScore?: number | null;
  capturedAt: string;
}

export interface OphthalmologistScreeningResultDto {
  screeningResultId: string;
  riskLevel: string;
  confidenceScore: number;
  summary?: string | null;
  findings?: string | null;
  assessedAt: string;
}

export interface OphthalmologistScreeningDetailDto {
  screeningId: string;
  patientId: string;
  patientFullName: string;
  modelVersion: string;
  createdAt: string;
  processedAt?: string | null;
  rawJsonOutput?: string | null;
  reviewStatus: string;
  images: OphthalmologistRetinalImageDto[];
  latestResult?: OphthalmologistScreeningResultDto | null;
}

export async function listOphthalmologistScreenings(): Promise<
  OphthalmologistScreeningListItemDto[]
> {
  const response = await api.get<
    ApiResponse<OphthalmologistScreeningListItemDto[]>
  >(API_ENDPOINTS.OPHTHALMOLOGIST.SCREENINGS);
  return unwrapApiData<OphthalmologistScreeningListItemDto[]>(response.data);
}

export async function getOphthalmologistScreeningDetail(
  screeningId: string
): Promise<OphthalmologistScreeningDetailDto> {
  const response = await api.get<
    ApiResponse<OphthalmologistScreeningDetailDto>
  >(`${API_ENDPOINTS.OPHTHALMOLOGIST.SCREENINGS}/${screeningId}`);
  return unwrapApiData<OphthalmologistScreeningDetailDto>(response.data);
}
