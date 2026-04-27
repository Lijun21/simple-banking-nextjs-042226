import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Vendor, CreateVendorInput, PaginatedResponse } from '@/types';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<Vendor[]>('/vendors').then((r) => r.data),
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => api.get<Vendor>(`/vendors/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorInput) =>
      api.post<Vendor>('/vendors', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useUpdateVendor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateVendorInput>) =>
      api.patch<Vendor>(`/vendors/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      qc.invalidateQueries({ queryKey: ['vendors', id] });
    },
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}
