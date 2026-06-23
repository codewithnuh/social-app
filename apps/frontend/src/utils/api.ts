// src/utils/api.ts
const BASE_URL = 'http://localhost:5000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Cast headers explicitly to avoid Record index type mismatch
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only apply JSON header if the body isn't a multipart FormData layout
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Safe fallback if JSON parsing fails on empty backend blocks
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data as T;
}
