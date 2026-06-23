const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function resolveQueue() {
  refreshQueue.forEach(cb => cb());
  refreshQueue = [];
}

function addToQueue(cb: () => void) {
  refreshQueue.push(cb);
}

async function baseFetch<T>(endpoint: string, options: RequestInit) {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    return await baseFetch<T>(endpoint, options);
  } catch (err) {
    let isAuthError = false;
    if (err instanceof Error) {
      isAuthError = err?.message?.includes('401');
    }
    if (
      !isAuthError ||
      endpoint === '/api/v1/auth/login' ||
      endpoint === '/api/v1/auth/refresh'
    ) {
      throw err;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        await baseFetch('/api/v1/auth/refresh', { method: 'POST' });
        isRefreshing = false;
        resolveQueue();
      } catch (refreshErr) {
        isRefreshing = false;
        refreshQueue = [];
        throw refreshErr;
      }
    }

    return new Promise<T>((resolve, reject) => {
      addToQueue(() => {
        baseFetch<T>(endpoint, options).then(resolve).catch(reject);
      });
    });
  }
}
