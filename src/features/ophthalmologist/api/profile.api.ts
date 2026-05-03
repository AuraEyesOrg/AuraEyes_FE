import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface OphthalmologistProfileData {
  id: string;
  userId: string;
  userEmail?: string | null;
  userFullName?: string | null;
  userAvatarUrl?: string | null;
  userPhoneNumber?: string | null;
  userAddress?: string | null;
  userCitizenId?: string | null;
  userGender?: number | null;
  userDateOfBirth?: string | null;
  bio?: string | null;
  employmentType?: string | null;
  createdAt: string;
  degrees: Array<{
    id: string;
    name: string;
    issuingAuthority?: string | null;
    issuedDate: string;
    degreeUrl?: string | null;
  }>;
  certificates: Array<{
    id: string;
    type?: string | null;
    name: string;
    issuingAuthority?: string | null;
    issuedDate: string;
    expiryDate?: string | null;
    certificateUrl?: string | null;
    isExpired: boolean;
  }>;
}

export interface UpdateOphthalmologistProfileData {
  fullName: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  citizenId?: string | null;
  gender?: number | null;
  dateOfBirth?: string | null;
}

const ENDPOINTS = {
  GET_PROFILE: '/ophthalmologist/profile',
  UPDATE_PROFILE: '/ophthalmologist/profile',
  UPLOAD_AVATAR: '/ophthalmologist/profile/avatar',
} as const;

export const getOphthalmologistProfile =
  async (): Promise<OphthalmologistProfileData> => {
    const response = await api.get<ApiResponse<OphthalmologistProfileData>>(
      ENDPOINTS.GET_PROFILE
    );

    return unwrapApiData<OphthalmologistProfileData>(response.data);
  };

export const updateOphthalmologistProfile = async (
  payload: UpdateOphthalmologistProfileData
): Promise<OphthalmologistProfileData> => {
  const response = await api.put<ApiResponse<OphthalmologistProfileData>>(
    ENDPOINTS.UPDATE_PROFILE,
    payload
  );

  return unwrapApiData<OphthalmologistProfileData>(response.data);
};

export const uploadOphthalmologistAvatar = async (
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
    ENDPOINTS.UPLOAD_AVATAR,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return unwrapApiData<{ avatarUrl: string }>(response.data).avatarUrl;
};
