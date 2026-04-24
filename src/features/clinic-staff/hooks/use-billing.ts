import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, completeOrder } from '../api/billing.api';
import { toast } from 'react-toastify';

export const useAllOrders = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['clinic-staff-orders', page, pageSize],
    queryFn: () => getAllOrders(page, pageSize),
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-staff-orders'] });
      toast.success('Thanh toán hoàn tất');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Lỗi khi hoàn tất thanh toán'
      );
    },
  });
};

export const useOrderDetails = (
  orderId: string | null,
  intervalMs: number = 0
) => {
  return useQuery({
    queryKey: ['clinic-staff-order', orderId],
    queryFn: () =>
      orderId
        ? import('../api/billing.api').then((m) => m.getOrderById(orderId))
        : Promise.reject('No ID'),
    enabled: !!orderId,
    refetchInterval: intervalMs > 0 ? intervalMs : false,
  });
};
