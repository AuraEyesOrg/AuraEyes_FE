import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/auth-store';
import {
  getOphthalmologistProfile,
  updateOphthalmologistProfile,
  uploadOphthalmologistAvatar,
  deleteCertificate,
  updateCertificate,
  type OphthalmologistProfileData,
  type UpdateOphthalmologistProfileData,
} from '../api/profile.api';

export const ophthalmologistProfileKeys = {
  all: ['ophthalmologist-profile'] as const,
  detail: () => [...ophthalmologistProfileKeys.all, 'detail'] as const,
};

export const useOphthalmologistProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<OphthalmologistProfileData, Error>({
    queryKey: ophthalmologistProfileKeys.detail(),
    queryFn: getOphthalmologistProfile,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!query.data) return;

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    setUser({
      ...currentUser,
      fullName: query.data.userFullName ?? currentUser.fullName,
      email: query.data.userEmail ?? currentUser.email,
      avatarUrl: query.data.userAvatarUrl ?? currentUser.avatarUrl,
    });
  }, [query.data, setUser]);

  return query;
};

export const useUpdateOphthalmologistProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    OphthalmologistProfileData,
    Error,
    UpdateOphthalmologistProfileData
  >({
    mutationFn: updateOphthalmologistProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(ophthalmologistProfileKeys.detail(), data);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          fullName: data.userFullName ?? currentUser.fullName,
        });
      }
    },
  });
};

export const useUploadOphthalmologistAvatar = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<string, Error, File>({
    mutationFn: uploadOphthalmologistAvatar,
    onSuccess: (avatarUrl) => {
      queryClient.setQueryData<OphthalmologistProfileData>(
        ophthalmologistProfileKeys.detail(),
        (old) => (old ? { ...old, userAvatarUrl: avatarUrl } : old)
      );

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({ ...currentUser, avatarUrl });
      }
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ophthalmologistProfileKeys.detail(),
      });
    },
  });
};

export const useUpdateCertificateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; data: FormData }>({
    mutationFn: ({ id, data }) => updateCertificate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ophthalmologistProfileKeys.detail(),
      });
    },
  });
};
