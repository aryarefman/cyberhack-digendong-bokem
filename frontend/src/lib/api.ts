const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aromasys_token');
}

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('aromasys_token');
  localStorage.removeItem('aromasys_user');
  window.location.href = '/login?session=expired';
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;
  const token = getToken();

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: mergedHeaders,
    ...rest,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: 'GET', ...opts }),

  post: <T = unknown>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  put: <T = unknown>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  delete: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: 'DELETE', ...opts }),

  postForm: <T = unknown>(path: string, body: FormData, opts?: FetchOptions) => {
    const { headers = {}, ...rest } = opts ?? {};
    const mergedHeaders = { ...(headers as Record<string, string>) };
    const token = getToken();
    if (token) mergedHeaders['Authorization'] = `Bearer ${token}`;
    // Do NOT set Content-Type — browser sets it with boundary for multipart
    return apiFetch<T>(path, {
      method: 'POST',
      headers: mergedHeaders,
      body,
      ...rest,
    });
  },
};
