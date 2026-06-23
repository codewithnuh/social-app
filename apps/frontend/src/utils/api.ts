// src/utils/api.ts
const BASE_URL = 'http://localhost:5000';

// Operational states for managing silent token refreshment cycles
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function onTokenRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: () => void) {
  refreshSubscribers.push(cb);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure cross-origin cookies are always transmitted implicitly
  options.credentials = options.credentials || 'include';

  const response = await fetch(url, { ...options, headers });

  // Intercept 401 Unauthorized errors to initiate an automatic token refresh cycle
  if (
    response.status === 401 &&
    endpoint !== '/api/v1/auth/refresh' &&
    endpoint !== '/api/v1/auth/login'
  ) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        // Hit your backend refresh endpoint to rotate cookies silently
        await apiRequest('/api/v1/auth/refresh', { method: 'POST' });
        isRefreshing = false;
        onTokenRefreshed();
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw refreshError; // Refresh token expired or invalid -> Drops to hook catch block
      }
    }

    // Queue up matching async operations and release them once the token rotates successfully
    return new Promise<T>((resolve, reject) => {
      addRefreshSubscriber(() => {
        apiRequest<T>(endpoint, options).then(resolve).catch(reject);
      });
    });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data as T;
}
