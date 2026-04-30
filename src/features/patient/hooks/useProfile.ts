import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  getProfileById,
  updateProfile,
  uploadAvatar,
  changePassword,
} from '../api/patient.api';
import type { PatientProfile, ProfileUpdateData } from '../types';
import useAuthStore from '@/store/auth-store';

// ============ QUERY KEYS ============

export const profileKeys = {
  all: ['patient-profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ============ QUERIES ============

export const useProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<PatientProfile, Error>({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!query.data) return;

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    setUser({
      ...currentUser,
      fullName: query.data.fullName,
      email: query.data.email,
      avatarUrl: query.data.avatarUrl ?? currentUser.avatarUrl,
    });
  }, [query.data, setUser]);

  return query;
};

export const usePatientProfile = (patientId?: string) => {
  return useQuery<PatientProfile, Error>({
    queryKey: ['patient-profile', patientId],
    queryFn: () => getProfileById(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<PatientProfile, Error, ProfileUpdateData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          fullName: data.fullName,
        });
      }
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<string, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) => {
      // Update the cached profile with new avatar URL
      queryClient.setQueryData<PatientProfile>(profileKeys.detail(), (old) =>
        old ? { ...old, avatarUrl } : old
      );

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          avatarUrl,
        });
      }
    },
  });
};

export const useChangePassword = () => {
  return useMutation<
    void,
    Error,
    {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }
  >({
    mutationFn: changePassword,
  });
};
