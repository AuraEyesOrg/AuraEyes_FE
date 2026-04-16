import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OrganisationSettingsDto {
  organisationId: string;
  name: string;
  orgType: string;
  address?: string | null;
  licenseNumber?: string | null;
  taxCode?: string | null;
  description?: string | null;
  contactFullName: string;
  contactEmail: string;
  contactPhone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateOrganisationSettingsRequest {
  name: string;
  address?: string;
  licenseNumber?: string;
  taxCode?: string;
  description?: string;
  contactFullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  avatarUrl?: string;
}

const SETTINGS_ENDPOINT = '/organisations/settings';

export const getOrganisationSettings =
  async (): Promise<OrganisationSettingsDto> => {
    const response =
      await api.get<ApiResponse<OrganisationSettingsDto>>(SETTINGS_ENDPOINT);
    return unwrapApiData<OrganisationSettingsDto>(response.data);
  };

export const updateOrganisationSettings = async (
  request: UpdateOrganisationSettingsRequest
): Promise<OrganisationSettingsDto> => {
  const response = await api.put<ApiResponse<OrganisationSettingsDto>>(
    SETTINGS_ENDPOINT,
    request
  );
  return unwrapApiData<OrganisationSettingsDto>(response.data);
};
