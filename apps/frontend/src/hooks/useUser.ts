import { useQuery } from '@tanstack/react-query';
interface User {
  id: string;
  name: string;
  email: string;
}
async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
export function useUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    retry: false, // Don't retry infinitely on 401s
    staleTime: 1000 * 60 * 5, // Keep auth status fresh for 5 minutes
  });
}
