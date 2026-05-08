import { getAccessToken } from '../auth';
import type { PaginatedResponse, QueryParams } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildQuery(params: QueryParams): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function makeApi<T>(resource: string) {
  return {
    getAll: (params: QueryParams = {}): Promise<PaginatedResponse<T>> =>
      request('GET', `/onboarding/${resource}${buildQuery(params)}`),

    getOne: (id: string): Promise<T> =>
      request('GET', `/onboarding/${resource}/${id}`),

    create: (data: Partial<T>): Promise<T> =>
      request('POST', `/onboarding/${resource}`, data),

    update: (id: string, data: Partial<T>): Promise<T> =>
      request('PATCH', `/onboarding/${resource}/${id}`, data),

    remove: (id: string): Promise<{ id: string }> =>
      request('DELETE', `/onboarding/${resource}/${id}`),
  };
}
