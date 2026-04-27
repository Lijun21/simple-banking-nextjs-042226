import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { AuthResponse } from '@/types';

export function useAuth() {
  const { user, setAuth, clearAuth } = useAuthStore();

  const { data: meData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),
    enabled: !!useAuthStore.getState().accessToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', creds).then((r) => r.data),
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });

  const registerMutation = useMutation({
    mutationFn: (body: { email: string; password: string; companyName: string }) =>
      api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });

  return {
    user: meData ?? user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: clearAuth,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
  };
}
