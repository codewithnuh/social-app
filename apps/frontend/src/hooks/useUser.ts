// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

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
    staleTime: 1000 * 60 * 5, // Keeps your auth status cached comfortably for 5 minutes
  });
}
