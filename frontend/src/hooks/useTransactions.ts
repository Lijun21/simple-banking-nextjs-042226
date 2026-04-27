import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PaymentOrder, PaginatedResponse, CreatePaymentOrderInput, PayOrderInput } from '@/types';

export function useTransactions(page = 1) {
  return useQuery({
    queryKey: ['payment-orders', page],
    queryFn: () =>
      api
        .get<PaginatedResponse<PaymentOrder>>('/payment-orders', { params: { page } })
        .then((r) => r.data),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['payment-orders', id],
    queryFn: () => api.get<PaymentOrder>(`/payment-orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function usePaymentOrders(page = 1) {
  return useTransactions(page);
}

export function useCreatePaymentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentOrderInput) =>
      api.post<PaymentOrder>('/payment-orders', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-orders'] }),
  });
}

export function usePayOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayOrderInput) =>
      api.post<PaymentOrder>(`/payment-orders/${orderId}/pay`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-orders'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
