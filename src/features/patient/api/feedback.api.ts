import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';
import type {
  CreateOphthalmologistFeedbackRequest,
  CreateClinicFeedbackRequest,
  CreateWebsiteFeedbackRequest,
  FeedbackRatingSummary,
  OphthalmologistFeedbackItem,
  ClinicFeedbackItem,
  PagedResult,
} from '../types/feedback.types';

export const createWebsiteFeedback = async (
  request: CreateWebsiteFeedbackRequest
): Promise<string> => {
  const response = await api.post<string | ApiResponse<string>>(
    API_ENDPOINTS.FEEDBACK.WEBSITE,
    request
  );

  return unwrapApiData<string>(response.data);
};

export const createClinicFeedback = async (
  request: CreateClinicFeedbackRequest
): Promise<string> => {
  const response = await api.post<string | ApiResponse<string>>(
    API_ENDPOINTS.FEEDBACK.CLINIC,
    request
  );

  return unwrapApiData<string>(response.data);
};

export const createOphthalmologistFeedback = async (
  ophthalmologistId: string,
  request: CreateOphthalmologistFeedbackRequest
): Promise<string> => {
  const response = await api.post<string | ApiResponse<string>>(
    API_ENDPOINTS.FEEDBACK.OPHTHALMOLOGIST(ophthalmologistId),
    request
  );

  return unwrapApiData<string>(response.data);
};

export const getClinicRatingSummary =
  async (): Promise<FeedbackRatingSummary> => {
    const response = await api.get<
      FeedbackRatingSummary | ApiResponse<FeedbackRatingSummary>
    >(API_ENDPOINTS.FEEDBACK.CLINIC_RATING);

    return unwrapApiData<FeedbackRatingSummary>(response.data);
  };

export const getOphthalmologistRatingSummary = async (
  ophthalmologistId: string
): Promise<FeedbackRatingSummary> => {
  const response = await api.get<
    FeedbackRatingSummary | ApiResponse<FeedbackRatingSummary>
  >(API_ENDPOINTS.FEEDBACK.OPHTHALMOLOGIST_RATING(ophthalmologistId));

  return unwrapApiData<FeedbackRatingSummary>(response.data);
};

export const listClinicFeedback = async (
  pageNumber = 1,
  pageSize = 10
): Promise<PagedResult<ClinicFeedbackItem>> => {
  const response = await api.get<
    | PagedResult<ClinicFeedbackItem>
    | ApiResponse<PagedResult<ClinicFeedbackItem>>
  >(
    `${API_ENDPOINTS.FEEDBACK.CLINIC_ITEMS}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  return unwrapApiData<PagedResult<ClinicFeedbackItem>>(response.data);
};

export const listOphthalmologistFeedback = async (
  ophthalmologistId: string,
  pageNumber = 1,
  pageSize = 10
): Promise<PagedResult<OphthalmologistFeedbackItem>> => {
  const response = await api.get<
    | PagedResult<OphthalmologistFeedbackItem>
    | ApiResponse<PagedResult<OphthalmologistFeedbackItem>>
  >(
    `${API_ENDPOINTS.FEEDBACK.OPHTHALMOLOGIST_ITEMS(ophthalmologistId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  return unwrapApiData<PagedResult<OphthalmologistFeedbackItem>>(response.data);
};
