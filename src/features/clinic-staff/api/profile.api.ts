import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface ClinicStaffProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  citizenId?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  employeeCode?: string | null;
  subRoles: string[];
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateClinicStaffProfileData {
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefernottotsay';
  address?: string;
  citizenId?: string;
  department?: string;
  employeeCode?: string;
}

const ENDPOINTS = {
  GET_PROFILE: '/clinic-staff/profile',
  UPDATE_PROFILE: '/clinic-staff/profile',
  UPLOAD_AVATAR: '/clinic-staff/profile/avatar',
} as const;

const normalizeDateOnly = (
  value?: string | null
): string | null | undefined => {
  if (!value) return value;

  const directDateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDateOnlyMatch) return directDateOnlyMatch[1];

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toISOString().split('T')[0];
};

const normalizeProfile = (profile: ClinicStaffProfile): ClinicStaffProfile => ({
  ...profile,
  dateOfBirth: normalizeDateOnly(profile.dateOfBirth),
});

export const getClinicStaffProfile = async (): Promise<ClinicStaffProfile> => {
  const response = await api.get<ApiResponse<ClinicStaffProfile>>(
    ENDPOINTS.GET_PROFILE
  );

  return normalizeProfile(unwrapApiData<ClinicStaffProfile>(response.data));
};

export const updateClinicStaffProfile = async (
  payload: UpdateClinicStaffProfileData
): Promise<ClinicStaffProfile> => {
  const response = await api.put<ApiResponse<ClinicStaffProfile>>(
    ENDPOINTS.UPDATE_PROFILE,
    payload
  );

  return normalizeProfile(unwrapApiData<ClinicStaffProfile>(response.data));
};

export const uploadClinicStaffAvatar = async (file: File): Promise<string> => {
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
