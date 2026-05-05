import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  medicalRecordApi,
  UpdateMedicalRecordClinicalCommand,
} from '../api/medical-record.api';
import { visitsApi } from '@/features/clinic-staff/api/visits.api';
import { toast } from 'react-toastify';

export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  list: (filters: any) => [...medicalRecordKeys.lists(), filters] as const,
  details: () => [...medicalRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
  patientHistory: (patientId: string) =>
    [...medicalRecordKeys.all, 'patient', patientId] as const,
};

export const useMedicalRecords = (filters?: any) => {
  return useQuery({
    queryKey: medicalRecordKeys.list(filters),
    queryFn: async () => {
      const response = await medicalRecordApi.getAll(filters);
      return response.data.data;
    },
  });
};

export const useMedicalRecord = (id: string) => {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: async () => {
      const response = await medicalRecordApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const usePatientMedicalRecords = (patientId: string) => {
  return useQuery({
    queryKey: medicalRecordKeys.patientHistory(patientId),
    queryFn: async () => {
      const response = await medicalRecordApi.getByPatient(patientId);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => visitsApi.checkIn(visitId),
    onSuccess: () => {
      toast.success('Check-in thành công! Hồ sơ đã được khởi tạo.');
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi check-in');
    },
  });
};

export const useUpdateAdministrative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { administrativeDataJson: string };
    }) => medicalRecordApi.updateAdministrative(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật thông tin hành chính thành công!');
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.detail(variables.id),
      });
      // Also invalidate queue to update Age/Gender validation
      queryClient.invalidateQueries({ queryKey: ['clinic-staff', 'queue'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Lỗi khi cập nhật thông tin hành chính'
      );
    },
  });
};

export const useUpdateDiagnosis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdateMedicalRecordClinicalCommand, 'id'>;
    }) => medicalRecordApi.updateClinical(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật chẩn đoán thành công!');
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Lỗi khi cập nhật chẩn đoán'
      );
    },
  });
};

export const useStartConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalRecordApi.startConsultation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(id) });
    },
    onError: (error: any) => {
      console.error('Error starting consultation:', error);
    },
  });
};

export const useFinalizeRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalRecordApi.finalize(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
    },
  });
};
