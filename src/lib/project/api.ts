import { getAccessToken } from '../auth';
import type {
  Project,
  Customer,
  PaginatedProjects,
  ProjectQueryParams,
  CreateProjectInput,
  UpdateProjectInput,
  LinkCustomersInput,
  CreateCustomerInput,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
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

export const projectApi = {
  list: (params: ProjectQueryParams = {}): Promise<PaginatedProjects> =>
    req('GET', `/projects${buildQuery(params as any)}`),

  getOne: (id: string): Promise<Project> =>
    req('GET', `/projects/${id}`),

  create: (data: CreateProjectInput): Promise<Project> =>
    req('POST', '/projects', data),

  update: (id: string, data: UpdateProjectInput): Promise<Project> =>
    req('PATCH', `/projects/${id}`, data),

  remove: (id: string): Promise<{ id: string }> =>
    req('DELETE', `/projects/${id}`),

  linkCustomers: (projectId: string, data: LinkCustomersInput): Promise<Project> =>
    req('POST', `/projects/${projectId}/customers`, data),

  unlinkCustomer: (projectId: string, customerId: string): Promise<{ projectId: string; customerId: string }> =>
    req('DELETE', `/projects/${projectId}/customers/${customerId}`),

  searchCustomers: (search: string, limit = 20): Promise<Customer[]> =>
    req('GET', `/projects/search-customers${buildQuery({ search, limit })}`),

  createCustomer: (data: CreateCustomerInput): Promise<Customer> =>
    req('POST', '/projects/customers', data),
};
