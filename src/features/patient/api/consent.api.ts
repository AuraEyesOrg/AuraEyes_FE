import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface AgreeScreeningConsentPayload {
  content: string;
}

export interface AgreeScreeningConsentResponse {
  consentId: string;
  aiScreeningId: string;
  patientId: string;
  content: string;
  isAgreed: boolean;
  signedAt?: string;
}

export const agreeScreeningConsent = async (
  screeningId: string,
  payload: AgreeScreeningConsentPayload
): Promise<AgreeScreeningConsentResponse> => {
  const response = await api.post<ApiResponse<AgreeScreeningConsentResponse>>(
    API_ENDPOINTS.CONSENTS.AGREE_SCREENING(screeningId),
    payload
  );

  return unwrapApiData<AgreeScreeningConsentResponse>(response.data);
};
