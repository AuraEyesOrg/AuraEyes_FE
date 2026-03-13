import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  CreateOphthalmologistFeedbackRequest,
  CreateOrganisationFeedbackRequest,
  CreateWebsiteFeedbackRequest,
  FeedbackRatingSummary,
  OphthalmologistFeedbackItem,
  OrganisationFeedbackItem,
  PagedResult,
} from '../types/feedback.types';

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  succeeded?: boolean;
  message?: string;
}

const unwrapApiData = <T>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const createWebsiteFeedback = async (
  request: CreateWebsiteFeedbackRequest
): Promise<string> => {
  const response = await api.post<string | ApiResponse<string>>(
    API_ENDPOINTS.FEEDBACK.WEBSITE,
    request
  );

  return unwrapApiData<string>(response.data);
};

export const createOrganisationFeedback = async (
  organisationId: string,
  request: CreateOrganisationFeedbackRequest
): Promise<string> => {
  const response = await api.post<string | ApiResponse<string>>(
    API_ENDPOINTS.FEEDBACK.ORGANISATION(organisationId),
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

export const getOrganisationRatingSummary = async (
  organisationId: string
): Promise<FeedbackRatingSummary> => {
  const response = await api.get<
    FeedbackRatingSummary | ApiResponse<FeedbackRatingSummary>
  >(API_ENDPOINTS.FEEDBACK.ORGANISATION_RATING(organisationId));

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

export const listOrganisationFeedback = async (
  organisationId: string,
  pageNumber = 1,
  pageSize = 10
): Promise<PagedResult<OrganisationFeedbackItem>> => {
  const response = await api.get<
    | PagedResult<OrganisationFeedbackItem>
    | ApiResponse<PagedResult<OrganisationFeedbackItem>>
  >(
    `${API_ENDPOINTS.FEEDBACK.ORGANISATION_ITEMS(organisationId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  return unwrapApiData<PagedResult<OrganisationFeedbackItem>>(response.data);
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
