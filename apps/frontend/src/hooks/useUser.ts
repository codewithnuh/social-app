import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { UpdateProfileDTO } from '../utils/user.api';
import { logoutUser, updateProfile } from '../utils/user.api';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    // apiRequest automatically injects credentials: 'include' and handles 401 refreshes internally
    const response = await apiRequest<ApiResponse<User>>('/api/v1/auth/me', {
      method: 'GET',
    });

    return response.data;
  } catch {
    // If apiRequest throws even after a refresh attempt, the session is officially dead
    return null;
  }
}

export function useUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    retry: false, // Prevents infinite loops if both tokens are completely dead
    staleTime: 1000 * 60 * 10, // IMPORTANT: 10 min cache
    gcTime: 1000 * 60 * 30, // keeps cache alive
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
  });
}
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => updateProfile(data),

    onSuccess: res => {
      queryClient.setQueryData(['user'], res.data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      // clear user cache
      queryClient.setQueryData(['user'], null);

      // optional full reset
      queryClient.clear();
    },
  });
}
