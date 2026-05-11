import { getAccessToken } from '../auth';

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

export interface PrestationConsultant {
  id: string;
  prestationId: string;
  contactId: string;
  organizationId: string;
  role?: string;
  dailyRate?: number;
  estimatedDays?: number;
  consumedDays: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    type: string;
  };
}

export interface Prestation {
  id: string;
  organizationId: string;
  projectId: string;
  prestationCode?: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  customerId?: string;
  supplierId?: string;
  amount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  estimatedDays?: number;
  consumedDays: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  supplier?: any;
  consultants?: PrestationConsultant[];
}

export interface PaginatedPrestations {
  data: Prestation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryPrestationParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  category?: string;
}

export interface PrestationConsultantInput {
  contactId: string;
  role?: string;
  dailyRate?: number;
  estimatedDays?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreatePrestationInput {
  prestationCode?: string;
  name: string;
  description?: string;
  category?: string;
  type: string;
  customerId?: string;
  supplierId?: string;
  amount?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  estimatedDays?: number;
  status?: string;
  notes?: string;
  consultants?: PrestationConsultantInput[];
}

export type UpdatePrestationInput = Partial<CreatePrestationInput> & {
  consumedDays?: number;
};

const BASE = (projectId: string) => `/projects/${projectId}/prestations`;

export const prestationApi = {
  list: (projectId: string, params: QueryPrestationParams = {}): Promise<PaginatedPrestations> =>
    req('GET', `${BASE(projectId)}${buildQuery(params as any)}`),

  getOne: (projectId: string, id: string): Promise<Prestation> =>
    req('GET', `${BASE(projectId)}/${id}`),

  create: (projectId: string, input: CreatePrestationInput): Promise<Prestation> =>
    req('POST', BASE(projectId), input),

  update: (projectId: string, id: string, input: UpdatePrestationInput): Promise<Prestation> =>
    req('PATCH', `${BASE(projectId)}/${id}`, input),

  remove: (projectId: string, id: string): Promise<{ id: string }> =>
    req('DELETE', `${BASE(projectId)}/${id}`),

  searchContacts: (search: string, limit = 20): Promise<any[]> =>
    req('GET', `/projects/search-contacts${buildQuery({ search, limit })}`),
};
