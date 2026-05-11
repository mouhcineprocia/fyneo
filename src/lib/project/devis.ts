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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DevisPartner {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface DevisItem {
  id?: string;
  devisId?: string;
  prestationId?: string;
  label?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface Devis {
  id: string;
  organizationId: string;
  projectId: string;
  devisNumber: string;
  type: 'vente' | 'achat';
  customerId?: string;
  supplierId?: string;
  title?: string;
  description?: string;
  amount: number;
  paidAmount: number;
  remainingAmount?: number;
  currency: string;
  devisDate: string;
  validationDate?: string;
  expirationDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: DevisPartner | null;
  supplier?: DevisPartner | null;
  items?: DevisItem[];
}

export interface PaginatedDevis {
  data: Devis[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryDevisParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export interface DevisItemInput {
  prestationId?: string;
  label?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface CreateDevisInput {
  devisNumber?: string;
  type: 'vente' | 'achat';
  customerId?: string;
  supplierId?: string;
  title?: string;
  description?: string;
  amount?: number;
  paidAmount?: number;
  currency?: string;
  devisDate: string;
  validationDate?: string;
  expirationDate?: string;
  status?: string;
  notes?: string;
  items?: DevisItemInput[];
}

export type UpdateDevisInput = Partial<CreateDevisInput>;

// ─── API ─────────────────────────────────────────────────────────────────────

export const devisApi = {
  list: (projectId: string, params: QueryDevisParams = {}): Promise<PaginatedDevis> =>
    req('GET', `/projects/${projectId}/devis${buildQuery(params as any)}`),

  getOne: (projectId: string, devisId: string): Promise<Devis> =>
    req('GET', `/projects/${projectId}/devis/${devisId}`),

  create: (projectId: string, data: CreateDevisInput): Promise<Devis> =>
    req('POST', `/projects/${projectId}/devis`, data),

  update: (projectId: string, devisId: string, data: UpdateDevisInput): Promise<Devis> =>
    req('PATCH', `/projects/${projectId}/devis/${devisId}`, data),

  remove: (projectId: string, devisId: string): Promise<{ id: string }> =>
    req('DELETE', `/projects/${projectId}/devis/${devisId}`),
};
