export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

export interface Customer {
  id: string;
  organizationId: string;
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
  paymentTerms?: string;
  creditLimit?: number;
  currency?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
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
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  type: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  tags?: string[];
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  jobTitle?: string;
  department?: string;
  managerId?: string;
  contractType?: string;
  hireDate?: string;
  endDate?: string;
  salary?: number;
  currency?: string;
  cnssNumber?: string;
  birthDate?: string;
  nationalId?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentOnboardingEntry {
  id: string;
  entryType: string;
  timeOfEvent?: string;
  title?: string;
  description?: string;
  alertType?: string;
  message?: string;
  urgency?: string;
  actionType?: string;
  deadline?: string;
  action?: string;
  entityType?: string;
  dossierName?: string;
  kpiKey?: string;
  kpiValue?: number;
  kpiSub?: string;
  dayLabel?: string;
  taskColor?: string;
  sortOrder: number;
}

export interface AgentDashboardResponse {
  date: string;
  alerts: AgentOnboardingEntry[];
  priorities: AgentOnboardingEntry[];
  timeline: AgentOnboardingEntry[];
  activities: AgentOnboardingEntry[];
  kpis: AgentOnboardingEntry[];
  plannedTasks: AgentOnboardingEntry[];
  docsPending: AgentOnboardingEntry[];
}

export interface Consultant {
  id: string;
  organizationId: string;
  consultantCode?: string;
  type: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  skills?: string[];
  seniority?: string;
  dailyRate?: number;
  currency?: string;
  availabilityStatus?: string;
  companyName?: string;
  supplierRefId?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
