import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import {
  getClinicStaffProfile,
  updateClinicStaffProfile,
  uploadClinicStaffAvatar,
  type ClinicStaffProfile,
  type UpdateClinicStaffProfileData,
} from '../api/profile.api';

export const clinicStaffProfileKeys = {
  all: ['clinic-staff-profile'] as const,
  detail: () => [...clinicStaffProfileKeys.all, 'detail'] as const,
};

export const useClinicStaffProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<ClinicStaffProfile, Error>({
    queryKey: clinicStaffProfileKeys.detail(),
    queryFn: getClinicStaffProfile,
    staleTime: 5 * 60 * 1000,
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

export const useUpdateClinicStaffProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<ClinicStaffProfile, Error, UpdateClinicStaffProfileData>({
    mutationFn: updateClinicStaffProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(clinicStaffProfileKeys.detail(), data);

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

export const useUploadClinicStaffAvatar = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<string, Error, File>({
    mutationFn: uploadClinicStaffAvatar,
    onSuccess: (avatarUrl) => {
      queryClient.setQueryData<ClinicStaffProfile>(
        clinicStaffProfileKeys.detail(),
        (old) => (old ? { ...old, avatarUrl } : old)
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
