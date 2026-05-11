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

export interface BCPartner {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface BCItem {
  id?: string;
  bonCommandeId?: string;
  prestationId?: string;
  label?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface BonCommande {
  id: string;
  organizationId: string;
  projectId: string;
  devisId?: string;
  bonCommandeNumber: string;
  type: 'vente' | 'achat';
  customerId?: string;
  supplierId?: string;
  title?: string;
  description?: string;
  amount: number;
  paidAmount: number;
  remainingAmount?: number;
  currency: string;
  orderDate: string;
  validationDate?: string;
  deliveryDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: BCPartner | null;
  supplier?: BCPartner | null;
  items?: BCItem[];
}

export interface PaginatedBonCommandes {
  data: BonCommande[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryBCParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export interface BCItemInput {
  prestationId?: string;
  label?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface CreateBCInput {
  bonCommandeNumber?: string;
  devisId?: string;
  type: 'vente' | 'achat';
  customerId?: string;
  supplierId?: string;
  title?: string;
  description?: string;
  amount?: number;
  paidAmount?: number;
  currency?: string;
  orderDate: string;
  validationDate?: string;
  deliveryDate?: string;
  status?: string;
  notes?: string;
  items?: BCItemInput[];
}

export type UpdateBCInput = Partial<CreateBCInput>;

// ─── API ─────────────────────────────────────────────────────────────────────

export const bonCommandeApi = {
  list: (projectId: string, params: QueryBCParams = {}): Promise<PaginatedBonCommandes> =>
    req('GET', `/projects/${projectId}/commandes${buildQuery(params as any)}`),

  getOne: (projectId: string, bcId: string): Promise<BonCommande> =>
    req('GET', `/projects/${projectId}/commandes/${bcId}`),

  create: (projectId: string, data: CreateBCInput): Promise<BonCommande> =>
    req('POST', `/projects/${projectId}/commandes`, data),

  update: (projectId: string, bcId: string, data: UpdateBCInput): Promise<BonCommande> =>
    req('PATCH', `/projects/${projectId}/commandes/${bcId}`, data),

  remove: (projectId: string, bcId: string): Promise<{ id: string }> =>
    req('DELETE', `/projects/${projectId}/commandes/${bcId}`),
};
