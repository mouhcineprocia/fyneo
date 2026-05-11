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

export interface Supplier {
  id: string;
  organizationId?: string;
  supplierCode?: string;
  type?: string;
  companyName?: string;
  ice?: string;
  rc?: string;
  taxId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  notes?: string;
  paymentTerms?: string;
  bankName?: string;
  bankAccount?: string;
  iban?: string;
  swift?: string;
  currency?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSupplier {
  id: string;
  projectId: string;
  supplierId: string;
  organizationId: string;
  role?: string;
  contractReference?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost?: number;
  currency: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
}

export interface PaginatedProjectSuppliers {
  data: ProjectSupplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectSupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface LinkSupplierInput {
  supplierId: string;
  role?: string;
  contractReference?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateProjectSupplierInput {
  role?: string;
  contractReference?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost?: number;
  currency?: string;
  notes?: string;
  status?: string;
}

export interface CreateSupplierAndLinkInput {
  supplierCode?: string;
  type?: string;
  companyName?: string;
  ice?: string;
  rc?: string;
  taxId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  notes?: string;
  currency?: string;
  // link fields
  role?: string;
  contractReference?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost?: number;
  linkCurrency?: string;
  linkNotes?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const projectSupplierApi = {
  list: (projectId: string, params: ProjectSupplierQueryParams = {}): Promise<PaginatedProjectSuppliers> =>
    req('GET', `/projects/${projectId}/suppliers${buildQuery(params as any)}`),

  link: (projectId: string, data: LinkSupplierInput): Promise<ProjectSupplier> =>
    req('POST', `/projects/${projectId}/suppliers/link`, data),

  createAndLink: (projectId: string, data: CreateSupplierAndLinkInput): Promise<ProjectSupplier> =>
    req('POST', `/projects/${projectId}/suppliers/new`, data),

  update: (projectId: string, psId: string, data: UpdateProjectSupplierInput): Promise<ProjectSupplier> =>
    req('PATCH', `/projects/${projectId}/suppliers/${psId}`, data),

  remove: (projectId: string, psId: string): Promise<{ id: string }> =>
    req('DELETE', `/projects/${projectId}/suppliers/${psId}`),

  searchSuppliers: (search: string, limit = 20): Promise<Supplier[]> =>
    req('GET', `/projects/search-suppliers${buildQuery({ search, limit })}`),
};
