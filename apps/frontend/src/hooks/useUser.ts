import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

// Defining a standardized shape for your generic backend API envelope
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    // 1. Explicitly type the expected response envelope structure
    const response = await apiRequest<ApiResponse<User>>('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include', // Crucial: Transmits HttpOnly cookie validation hashes
    });

    return response.data;
  } catch {
    // Graceful fallback for unauthenticated users (401 triggers this clean block)
    return null;
  }
}

export function useUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    retry: false, // Prevents loop storms on token expiration blocks
    staleTime: 1000 * 60 * 5, // Keeps application route contexts warm for 5 minutes
  });
}
