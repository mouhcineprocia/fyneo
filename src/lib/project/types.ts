import type { Customer } from '../onboarding/types';

export type { Customer };

export interface Project {
  id: string;
  organizationId: string;
  projectCode?: string;
  name: string;
  type: 'regie' | 'negoce';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  description?: string;
  budget?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  consumedHours: number;
  progress: number;
  priority?: string;
  projectManagerId?: string;
  color?: string;
  tags?: any;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  customers: Customer[];
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
}

export interface CreateProjectInput {
  name: string;
  type: 'regie' | 'negoce';
  status?: string;
  projectCode?: string;
  description?: string;
  budget?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  progress?: number;
  priority?: string;
  projectManagerId?: string;
  color?: string;
  tags?: any;
  notes?: string;
  customerIds?: string[];
}

export interface UpdateProjectInput extends Partial<Omit<CreateProjectInput, 'customerIds'>> {}

export interface LinkCustomersInput {
  customerIds: string[];
  role?: string;
}

export interface CreateCustomerInput {
  customerCode?: string;
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
  sector?: string;
  notes?: string;
  currency?: string;
}

export interface PaginatedProjects {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
